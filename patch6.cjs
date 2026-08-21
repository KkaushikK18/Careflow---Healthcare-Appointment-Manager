const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Add imports
if (!content.includes('fetchPatients')) {
  content = content.replace(
    `import { fetchAppointments, fetchMedications, fetchAdminMetrics, fetchMessages, sendMessage } from '@/lib/api'`,
    `import { fetchAppointments, fetchMedications, fetchAdminMetrics, fetchMessages, sendMessage, fetchPatients, fetchLeaves, addLeave } from '@/lib/api'`
  );
}

// Add hooks into RecordsView
const recordsViewQueryRegex = /const \{ data: realMessages, isLoading: msgsLoading \} = useQuery\(\{[\s\S]*?\}\);/;
const newRecordsViewQuery = `const { data: realMessages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', role],
    queryFn: () => fetchMessages(token as string),
    enabled: !!token
  });

  const { data: realPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', role],
    queryFn: () => fetchPatients(token as string),
    enabled: !!token && role === 'doctor'
  });

  const { data: realLeaves, isLoading: leavesLoading, refetch: refetchLeaves } = useQuery({
    queryKey: ['leaves', role],
    queryFn: () => fetchLeaves(token as string),
    enabled: !!token && role === 'doctor'
  });`;
content = content.replace(recordsViewQueryRegex, newRecordsViewQuery);

// Patch Patients tab
const patientsTabRegex = /if \(active === 'Patients'\) return <><Heading title="Patients"[\s\S]*?<\/Card><\/>/;
const newPatientsTab = `if (active === 'Patients') return <><Heading title="Patients" subtitle="Your active patient panel and follow-up status."/><Card><Table><thead><Row><Cell muted>PATIENT</Cell><Cell muted>LAST VISIT</Cell><Cell muted>CARE PLAN</Cell><Cell muted>FOLLOW-UP</Cell></Row></thead><tbody>{patientsLoading ? <p style={{padding:20}}>Loading...</p> : realPatients?.length === 0 ? <p style={{padding:20}}>No patients found.</p> : realPatients?.map((p: any) => <Row key={p.id}><Cell><div style={{display:'flex',alignItems:'center',gap:9}}><Avatar initials={p.name.split(' ').map((x:any)=>x[0]).join('')}/><strong>{p.name}</strong></div></Cell><Cell muted>{new Date(p.lastVisit).toLocaleDateString()}</Cell><Cell>{p.carePlan}</Cell><Cell><Status tone={p.carePlan === 'Follow-up' ? 'warning' : 'success'}>{p.carePlan === 'Follow-up' ? 'Due' : 'On track'}</Status></Cell></Row>)}</tbody></Table></Card></>`;
content = content.replace(patientsTabRegex, newPatientsTab);

// Patch Schedule tab
const scheduleTabRegex = /if \(active === 'Schedule' \|\| active === 'Leave & availability'\) return <><Heading title=\{active\}[\s\S]*?<\/Card><\/div><\/>/;
const newScheduleTab = `if (active === 'Schedule' || active === 'Leave & availability') return <><Heading title={active} subtitle="Manage availability and keep the care calendar reliable." action={<button className="primary-button" onClick={() => {
    const d = prompt('Enter leave date (YYYY-MM-DD):');
    if (d) addLeave(token as string, d).then(() => { alert('Leave added'); refetchLeaves(); });
  }}><Plus size={17}/> Add time block</button>}/><div className="content-grid"><Card><h2>Upcoming Leave</h2><p className="muted">Blocked out days</p><div className="schedule-list">{leavesLoading ? <p>Loading...</p> : realLeaves?.length === 0 ? <p className="muted">No leave scheduled.</p> : realLeaves?.map((l: any) => <div className="schedule-row" key={l.id}><div className="schedule-time"><small>ALL DAY</small></div><div className="schedule-line"/><div className="schedule-patient"><strong>{new Date(l.date).toLocaleDateString()}</strong><span>Blocked - Leave</span></div><Status tone="warning">Busy</Status></div>)}</div></Card><Card><h2>Availability rules</h2><p className="muted">Default scheduling preferences</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Video visits</strong><small>Enabled for follow-ups</small></p></div><div><span className="timeline-dot mint-dot"/><p><strong>Buffer time</strong><small>15 minutes between appointments</small></p></div></div></Card></div></>`;
content = content.replace(scheduleTabRegex, newScheduleTab);


fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched careflow-app.tsx with Patients and Schedule');
