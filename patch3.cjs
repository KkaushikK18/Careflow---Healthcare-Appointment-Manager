const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Add fetchMedications to API import
if (!content.includes('fetchMedications')) {
  content = content.replace(
    `import { fetchAppointments } from '@/lib/api'`,
    `import { fetchAppointments, fetchMedications } from '@/lib/api'`
  );
}

// Replace PatientDashboard
const patientDashRegex = /function PatientDashboard\(\{ go, appointments, isLoading \}: \{ go: \(label: string\) => void, appointments: any, isLoading: boolean \}\) \{[\s\S]*?\} \}/;
const newPatientDash = `function PatientDashboard({ go, appointments, meds, isLoading }: any) { 
    const [localMeds, setLocalMeds] = useState<any[]>([]);
    
    // Sync external meds query with local state to allow toggling
    useMemo(() => { if (meds) setLocalMeds(meds) }, [meds]);
    
    const toggle = (n: string) => setLocalMeds(m => m.map(x => x.name === n ? { ...x, state: x.state === 'Taken' ? 'Pending' : 'Taken' } : x)); 
    const nextAppt = appointments?.[0];
    const takenCount = localMeds.filter(m => m.state === 'Taken').length;
    const medConsistency = localMeds.length > 0 ? Math.round((takenCount / localMeds.length) * 100) : 100;
    
    return <><Heading eyebrow="WELCOME BACK" title="Good morning" subtitle="Your care is on track." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Search size={17}/> Find care</button>}/><div className="content-grid">
      {nextAppt ? (
        <Card className="hero-card"><div className="hero-content"><div className="hero-tag"><CalendarDays size={14}/> Upcoming</div><h2>{nextAppt.doctor?.specialisation || 'Consultation'}</h2><p>{new Date(nextAppt.startTime).toLocaleDateString()} at {new Date(nextAppt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p><p className="muted">{nextAppt.doctor?.user?.name || 'Doctor'}</p></div><div className="hero-actions"><button className="primary-button" onClick={() => alert('Feature coming soon')}>Join video</button><button className="outline-button" onClick={() => alert('Feature coming soon')}>Reschedule</button></div></Card>
      ) : (
        <Card className="hero-card"><div className="hero-content"><h2>No upcoming appointments</h2><p className="muted">Book an appointment to stay on top of your health.</p></div><div className="hero-actions"><button className="primary-button" onClick={() => go('Find a doctor')}>Book Now</button></div></Card>
      )}
      <Card><div className="card-heading"><div><h2>Care Pulse</h2><p className="muted">Medication consistency</p></div><strong style={{fontSize:24,color:'var(--teal)'}}>{medConsistency}%</strong></div><div className="pulse-track"><div className="pulse-fill" style={{width: \`\${medConsistency}%\`}}/></div><p className="muted" style={{marginTop:12,fontSize:13}}>{medConsistency > 80 ? "Great job! You're highly consistent this week." : "Try to stick to your medication schedule!"}</p></Card></div><div className="content-grid"><Card><h2>Today&apos;s plan</h2><p className="muted">Medications and activities</p><div className="med-list">{isLoading ? <p>Loading meds...</p> : localMeds.length === 0 ? <p className="muted">No medications prescribed.</p> : localMeds.map(m => <div className="med-row" key={m.id || m.name}><button className={m.state === 'Taken' ? 'check-btn checked' : 'check-btn'} onClick={() => toggle(m.name)} aria-label={m.state === 'Taken' ? 'Mark pending' : 'Mark taken'}><Check size={14}/></button><div className="med-copy"><strong>{m.name} {m.dose}</strong><span>{m.time}</span></div><Status tone={m.state === 'Taken' ? 'success' : 'warning'}>{m.state}</Status></div>)}</div></Card><Card><h2>Recent activity</h2><p className="muted">Updates from your care team</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Platform Welcome</strong><small>CareFlow A Today</small></p></div></div></Card></div></> 
}`;
content = content.replace(patientDashRegex, newPatientDash);

// Replace RecordsView to inject the meds query and route it
const recordsViewRegex = /function RecordsView\(\{ role, active, go \}: \{ role: Role; active: string; go: \(s:string\)=>void \}\) \{[\s\S]*?if \(active === 'Find a doctor' \|\| active === 'Doctors'\) return <DoctorsView active=\{active\} \/>/;
const newRecordsView = `function RecordsView({ role, active, go }: { role: Role; active: string; go: (s:string)=>void }) {
  const { token } = useAuth();
  const { data: realAppointments, isLoading: appsLoading } = useQuery({
    queryKey: ['appointments', role],
    queryFn: () => fetchAppointments(token as string),
    enabled: !!token
  });
  
  const { data: realMeds, isLoading: medsLoading } = useQuery({
    queryKey: ['medications', role],
    queryFn: () => fetchMedications(token as string),
    enabled: !!token && role === 'patient'
  });
  
  if (active === 'Overview' || active === 'Today') return role === 'patient' ? <PatientDashboard go={go} appointments={realAppointments} meds={realMeds} isLoading={appsLoading || medsLoading}/> : role === 'doctor' ? <DoctorDashboard appointments={realAppointments} isLoading={appsLoading}/> : <AdminDashboard/>
  if (active === 'Appointments') return <><Heading title="Appointments" subtitle="Review, manage, and prepare for upcoming care." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Plus size={17}/> New appointment</button>}/><Card><Table><thead><Row><Cell muted>DATE & TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>CLINICIAN / SPECIALTY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{appsLoading ? <p style={{padding: 20}}>Loading...</p> : realAppointments?.length === 0 ? <p style={{padding: 20}}>No appointments.</p> : realAppointments?.map((a: any) => <Row key={a.id}><Cell><strong>{new Date(a.startTime).toLocaleDateString()}</strong><br/><span style={{color:'var(--muted)'}}>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></Cell><Cell>{a.patient?.user?.name || 'You'}</Cell><Cell>{a.doctor?.user?.name || 'You'}<br/><span style={{color:'var(--muted)'}}>{a.doctor?.specialisation}</span></Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><button className="icon-button" aria-label={\`Open \${a.id}\`} onClick={() => alert(\`Appointment \${a.id} details\`)}><MoreHorizontal size={18}/></button></Cell></Row>)}</tbody></Table></Card></>
  if (active === 'Find a doctor' || active === 'Doctors') return <DoctorsView active={active} />`;

content = content.replace(recordsViewRegex, newRecordsView);

// Now patch the Medications active tab inside RecordsView (which is further down in the file)
const medsTabRegex = /if \(active === 'Medications'\) return <><Heading title="Medications"[\s\S]*?<\/Card><\/>/;
const newMedsTab = `if (active === 'Medications') return <><Heading title="Medications" subtitle="Your active prescriptions and daily routine."/><Card><Table><thead><Row><Cell muted>MEDICATION</Cell><Cell muted>DOSAGE</Cell><Cell muted>SCHEDULE</Cell><Cell muted>STATUS</Cell></Row></thead><tbody>{medsLoading ? <p style={{padding: 20}}>Loading...</p> : realMeds?.length === 0 ? <p style={{padding: 20}}>No medications.</p> : realMeds?.map((m: any) => <Row key={m.id}><Cell><strong>{m.name}</strong></Cell><Cell muted>{m.dose}</Cell><Cell>{m.time}</Cell><Cell><Status tone={m.state === 'Taken' ? 'success' : 'warning'}>{m.state}</Status></Cell></Row>)}</tbody></Table><button className="primary-button" style={{marginTop:18}} onClick={() => alert('Medication request sent to doctor')}><Plus size={17}/> Request refill</button></Card></>`;
content = content.replace(medsTabRegex, newMedsTab);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched careflow-app.tsx with Medications');
