const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

const regex = /function DoctorDashboard\(\) \{[\s\S]*?<\/Card><\/> \}/;

const newDoctorDash = `function DoctorDashboard({ appointments, isLoading, token, refetchLeaves }: any) { 
    return <><Heading eyebrow={new Date().toLocaleDateString()} title="Good morning, Doctor" subtitle={\`You have \${appointments?.length || 0} appointments today.\`} action={<button className="primary-button" onClick={() => {
        const d = prompt('Enter leave date (YYYY-MM-DD):');
        if (d) addLeave(token, d).then(() => { alert('Leave added'); if(refetchLeaves) refetchLeaves(); });
    }}><Plus size={17}/> Add availability</button>}/><Metrics items={[["Today's appointments", appointments?.length?.toString() || '0', ''],['Awaiting notes','0',''],['Open slots','12','Across next 7 days'],['Patient messages','0','']]}/><Card><div className="card-heading"><div><h2>Today&apos;s schedule</h2><p className="muted">{new Date().toLocaleDateString()}</p></div></div><Table><thead><Row><Cell muted>TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>SYMPTOMS / AI SUMMARY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{isLoading ? <Row><Cell><div style={{padding: 20}}>Loading schedule...</div></Cell></Row> : appointments?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No appointments today.</div></Cell></Row> : appointments?.map((a: any) => <Row key={a.id}><Cell>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Cell><Cell><strong>{a.patient?.user?.name || a.patient?.firstName || 'Patient'}</strong></Cell><Cell muted>{a.preVisit ? <button className="outline-button" onClick={() => alert('AI Summary: ' + a.preVisit.chiefComplaint)}>View AI Notes</button> : 'Routine'}</Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><ChevronRight size={16}/></Cell></Row>)}</tbody></Table></Card></> 
}`;

if (regex.test(content)) {
  content = content.replace(regex, newDoctorDash);
  
  // Also we need to make sure RecordsView passes the token and refetchLeaves.
  const recordsViewRouteRegex = /if \(active === 'Overview' \|\| active === 'Today'\) return role === 'patient' \? <PatientDashboard go=\{go\} appointments=\{realAppointments\} meds=\{realMeds\} isLoading=\{appsLoading \|\| medsLoading\}\/> : role === 'doctor' \? <DoctorDashboard\/> : <AdminDashboard metrics=\{adminMetrics\} isLoading=\{adminLoading\}\/>/;

  const newRecordsViewRoute = `if (active === 'Overview' || active === 'Today') return role === 'patient' ? <PatientDashboard go={go} appointments={realAppointments} meds={realMeds} isLoading={appsLoading || medsLoading}/> : role === 'doctor' ? <DoctorDashboard appointments={realAppointments} isLoading={appsLoading} token={token} refetchLeaves={refetchLeaves}/> : <AdminDashboard metrics={adminMetrics} isLoading={adminLoading}/>`;

  content = content.replace(recordsViewRouteRegex, newRecordsViewRoute);
  
  fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
  console.log('Successfully patched DoctorDashboard');
} else {
  console.log('REGEX FAILED to match DoctorDashboard!');
}
