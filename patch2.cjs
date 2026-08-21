const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

if (!content.includes('fetchAppointments')) {
  content = content.replace(
    `import { useAuth } from './auth-provider'`,
    `import { useAuth } from './auth-provider'\nimport { useQuery } from '@tanstack/react-query'\nimport { fetchAppointments } from '@/lib/api'`
  );
}

// Regex replace DoctorDashboard
const doctorDashRegex = /function DoctorDashboard\(\) \{[\s\S]*?\} \}/;
const newDoctorDash = `function DoctorDashboard({ appointments, isLoading }: any) { 
    return <><Heading eyebrow={new Date().toLocaleDateString()} title="Good morning, Doctor" subtitle={\`You have \${appointments?.length || 0} appointments today.\`} action={<button className="primary-button"><Plus size={17}/> Add availability</button>}/><Metrics items={[["Today's appointments", appointments?.length?.toString() || '0', ''],['Awaiting notes','0',''],['Open slots','12','Across next 7 days'],['Patient messages','0','']]}/><Card><div className="card-heading"><div><h2>Today&apos;s schedule</h2><p className="muted">{new Date().toLocaleDateString()}</p></div></div><Table><thead><Row><Cell muted>TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>SYMPTOMS / AI SUMMARY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{isLoading ? <p style={{padding: 20}}>Loading schedule...</p> : appointments?.length === 0 ? <p style={{padding: 20}}>No appointments today.</p> : appointments?.map((a: any) => <Row key={a.id}><Cell>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Cell><Cell><strong>{a.patient?.user?.name || 'Patient'}</strong></Cell><Cell muted>{a.preVisit ? <button className="outline-button" onClick={() => alert('AI Summary: ' + a.preVisit.chiefComplaint)}>View AI Notes</button> : 'Routine'}</Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><ChevronRight size={16}/></Cell></Row>)}</tbody></Table></Card></> 
}`;
content = content.replace(doctorDashRegex, newDoctorDash);

// Regex replace PatientDashboard
const patientDashRegex = /function PatientDashboard\(\{ go \}: \{ go: \(label: string\) => void \}\) \{[\s\S]*?\} \}/;
const newPatientDash = `function PatientDashboard({ go, appointments, isLoading }: { go: (label: string) => void, appointments: any, isLoading: boolean }) { 
    const [meds, setMeds] = useState(medications); 
    const toggle = (n: string) => setMeds(m => m.map(x => x.name === n ? { ...x, state: x.state === 'Taken' ? 'Pending' : 'Taken' } : x)); 
    const nextAppt = appointments?.[0];
    return <><Heading eyebrow="WELCOME BACK" title="Good morning" subtitle="Your care is on track." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Search size={17}/> Find care</button>}/><div className="content-grid">
      {nextAppt ? (
        <Card className="hero-card"><div className="hero-content"><div className="hero-tag"><CalendarDays size={14}/> Upcoming</div><h2>{nextAppt.doctor?.specialisation || 'Consultation'}</h2><p>{new Date(nextAppt.startTime).toLocaleDateString()} at {new Date(nextAppt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p><p className="muted">{nextAppt.doctor?.user?.name || 'Doctor'}</p></div><div className="hero-actions"><button className="primary-button" onClick={() => alert('Feature coming soon')}>Join video</button><button className="outline-button" onClick={() => alert('Feature coming soon')}>Reschedule</button></div></Card>
      ) : (
        <Card className="hero-card"><div className="hero-content"><h2>No upcoming appointments</h2><p className="muted">Book an appointment to stay on top of your health.</p></div><div className="hero-actions"><button className="primary-button" onClick={() => go('Find a doctor')}>Book Now</button></div></Card>
      )}
      <Card><div className="card-heading"><div><h2>Care Pulse</h2><p className="muted">Medication consistency</p></div><strong style={{fontSize:24,color:'var(--teal)'}}>92%</strong></div><div className="pulse-track"><div className="pulse-fill" style={{width:'92%'}}/></div><p className="muted" style={{marginTop:12,fontSize:13}}>Great job! You&apos;re highly consistent this week.</p></Card></div><div className="content-grid"><Card><h2>Today&apos;s plan</h2><p className="muted">Medications and activities</p><div className="med-list">{meds.map(m => <div className="med-row" key={m.name}><button className={m.state === 'Taken' ? 'check-btn checked' : 'check-btn'} onClick={() => toggle(m.name)} aria-label={m.state === 'Taken' ? 'Mark pending' : 'Mark taken'}><Check size={14}/></button><div className="med-copy"><strong>{m.name} {m.dose}</strong><span>{m.time}</span></div><Status tone={m.state === 'Taken' ? 'success' : 'warning'}>{m.state}</Status></div>)}</div></Card><Card><h2>Recent activity</h2><p className="muted">Updates from your care team</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Platform Welcome</strong><small>CareFlow A Today</small></p></div></div></Card></div></> 
}`;
content = content.replace(patientDashRegex, newPatientDash);

// Regex replace RecordsView
const recordsViewRegex = /function RecordsView\(\{ role, active, go \}: \{ role: Role; active: string; go: \(s:string\)=>void \}\) \{[\s\S]*?if \(active === 'Find a doctor' \|\| active === 'Doctors'\) return <DoctorsView active=\{active\} \/>/;
const newRecordsView = `function RecordsView({ role, active, go }: { role: Role; active: string; go: (s:string)=>void }) {
  const { token } = useAuth();
  const { data: realAppointments, isLoading } = useQuery({
    queryKey: ['appointments', role],
    queryFn: () => fetchAppointments(token as string),
    enabled: !!token
  });
  
  if (active === 'Overview' || active === 'Today') return role === 'patient' ? <PatientDashboard go={go} appointments={realAppointments} isLoading={isLoading}/> : role === 'doctor' ? <DoctorDashboard appointments={realAppointments} isLoading={isLoading}/> : <AdminDashboard/>
  if (active === 'Appointments') return <><Heading title="Appointments" subtitle="Review, manage, and prepare for upcoming care." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Plus size={17}/> New appointment</button>}/><Card><Table><thead><Row><Cell muted>DATE & TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>CLINICIAN / SPECIALTY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{isLoading ? <p style={{padding: 20}}>Loading...</p> : realAppointments?.length === 0 ? <p style={{padding: 20}}>No appointments.</p> : realAppointments?.map((a: any) => <Row key={a.id}><Cell><strong>{new Date(a.startTime).toLocaleDateString()}</strong><br/><span style={{color:'var(--muted)'}}>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></Cell><Cell>{a.patient?.user?.name || 'You'}</Cell><Cell>{a.doctor?.user?.name || 'You'}<br/><span style={{color:'var(--muted)'}}>{a.doctor?.specialisation}</span></Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><button className="icon-button" aria-label={\`Open \${a.id}\`} onClick={() => alert(\`Appointment \${a.id} details\`)}><MoreHorizontal size={18}/></button></Cell></Row>)}</tbody></Table></Card></>
  if (active === 'Find a doctor' || active === 'Doctors') return <DoctorsView active={active} />`;

content = content.replace(recordsViewRegex, newRecordsView);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched careflow-app.tsx');
