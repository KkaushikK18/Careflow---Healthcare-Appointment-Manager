const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Inject useState for selectedAppt
const functionStartRegex = /function RecordsView\(\{ role, active, go \}: \{ role: Role; active: string; go: \(s:string\)=>void \}\) \{\n  const \{ token \} = useAuth\(\);/;
const functionStartNew = `function RecordsView({ role, active, go }: { role: Role; active: string; go: (s:string)=>void }) {\n  const { token } = useAuth();\n  const [selectedAppt, setSelectedAppt] = useState<any>(null);`;
content = content.replace(functionStartRegex, functionStartNew);

// Replace the Appointments tab logic
const appointmentsTabRegex = /if \(active === 'Appointments'\) return <><Heading title="Appointments"[\s\S]*?<\/button><\/Cell><\/Row>\)}<\/tbody><\/Table><\/Card><\/>/;
const newAppointmentsTab = `if (active === 'Appointments') {
    if (selectedAppt) {
      return (
        <>
          <button onClick={() => setSelectedAppt(null)} className="text-button" style={{marginBottom: 20}}>← Back to appointments</button>
          <Heading title="Appointment Details" subtitle={role === 'patient' ? \`With Dr. \${selectedAppt.doctor?.user?.name || selectedAppt.doctor?.lastName || 'Unknown'}\` : \`With \${selectedAppt.patient?.user?.name || selectedAppt.patient?.firstName || 'Patient'}\`} />
          <Card>
             <h3 style={{fontSize: 16, marginBottom: 8}}>Date & Time</h3>
             <p className="muted" style={{marginBottom: 20}}>{new Date(selectedAppt.startTime).toLocaleString()}</p>
             <h3 style={{fontSize: 16, marginBottom: 8}}>Status</h3>
             <p style={{marginBottom: 20}}><Status tone="success">{selectedAppt.status}</Status></p>
             {selectedAppt.preVisit && (
               <>
                 <h3 style={{fontSize: 16, marginBottom: 8}}>AI Clinical Summary</h3>
                 <div style={{background: 'var(--background)', padding: 15, borderRadius: 8, marginTop: 10, border: '1px solid var(--border)'}}>
                   <p style={{whiteSpace: 'pre-wrap', lineHeight: 1.6}}>{selectedAppt.preVisit.chiefComplaint}</p>
                 </div>
               </>
             )}
          </Card>
        </>
      )
    }

    return <><Heading title="Appointments" subtitle="Review, manage, and prepare for upcoming care." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Plus size={17}/> New appointment</button>}/><Card><Table><thead><Row><Cell muted>DATE & TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>CLINICIAN / SPECIALTY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{appsLoading ? <p style={{padding: 20}}>Loading...</p> : realAppointments?.length === 0 ? <p style={{padding: 20}}>No appointments.</p> : realAppointments?.map((a: any) => <Row key={a.id}><Cell><strong>{new Date(a.startTime).toLocaleDateString()}</strong><br/><span style={{color:'var(--muted)'}}>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></Cell><Cell>{a.patient?.user?.name || a.patient?.firstName || 'You'}</Cell><Cell>{a.doctor?.user?.name || a.doctor?.lastName || 'You'}<br/><span style={{color:'var(--muted)'}}>{a.doctor?.specialisation}</span></Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><button className="icon-button" aria-label={\`Open \${a.id}\`} onClick={() => setSelectedAppt(a)}><MoreHorizontal size={18}/></button></Cell></Row>)}</tbody></Table></Card></>
  }`;

content = content.replace(appointmentsTabRegex, newAppointmentsTab);

// Since active changes might leave selectedAppt open across tabs, let's inject a useEffect if needed, but it's simpler just to clear it on 'go' or let it persist for that tab.

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched appointment details');
