const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Add fetchAdminMetrics to API import
if (!content.includes('fetchAdminMetrics')) {
  content = content.replace(
    `import { fetchAppointments, fetchMedications } from '@/lib/api'`,
    `import { fetchAppointments, fetchMedications, fetchAdminMetrics } from '@/lib/api'`
  );
}

// Replace AdminDashboard
const adminDashRegex = /function AdminDashboard\(\) \{[\s\S]*?\} \}/;
const newAdminDash = `function AdminDashboard({ metrics, isLoading }: any) { return <><Heading eyebrow="OPERATIONS / OVERVIEW" title="Good morning, Admin" subtitle="A clear view of how CareFlow is running today." action={<button className="primary-button"><Plus size={17}/> Add a doctor</button>}/><Metrics items={isLoading ? [['Loading...', '-', '']] : [["Appointments today", metrics?.appointmentsToday?.toString() || '0', ''],['Completion rate', metrics?.completionRate || '0%',''],['Avg. response time', metrics?.avgResponseTime || '0 min',''],['Active doctors', metrics?.activeDoctors?.toString() || '0','']]}/><div className="content-grid"><Card><div className="card-heading"><div><h2>Appointment volume</h2><p className="muted">Last 7 days across all locations</p></div><Status>Healthy</Status></div><div className="chart"><div className="chart-grid"/><svg viewBox="0 0 600 180" role="img" aria-label="Appointment volume trending upward"><path d="M0 145 C70 130 85 150 135 118 S210 130 260 92 S335 110 385 78 S460 90 510 50 S560 56 600 22" fill="none" stroke="var(--primary)" strokeWidth="3"/></svg></div></Card><Card><h2>Needs attention</h2><p className="muted">Items that need a human review</p><div className="timeline"><div><span className="timeline-dot coral-dot"/><p><strong>3 doctors pending review</strong><small>Credentialing queue A Open now</small></p></div><div><span className="timeline-dot amber-dot"/><p><strong>2 schedule conflicts</strong><small>Tomorrow A Needs assignment</small></p></div></div></Card></div></> }`;
content = content.replace(adminDashRegex, newAdminDash);

// Inject fetchAdminMetrics into RecordsView
const recordsViewRegex = /const \{ data: realMeds, isLoading: medsLoading \} = useQuery\(\{\n    queryKey: \['medications', role\],\n    queryFn: \(\) => fetchMedications\(token as string\),\n    enabled: !!token && role === 'patient'\n  \}\);/
const newRecordsViewQuery = `const { data: realMeds, isLoading: medsLoading } = useQuery({
    queryKey: ['medications', role],
    queryFn: () => fetchMedications(token as string),
    enabled: !!token && role === 'patient'
  });
  
  const { data: adminMetrics, isLoading: adminLoading } = useQuery({
    queryKey: ['adminMetrics', role],
    queryFn: () => fetchAdminMetrics(token as string),
    enabled: !!token && role === 'admin'
  });`;
content = content.replace(recordsViewRegex, newRecordsViewQuery);

const recordsViewRouteRegex = /if \(active === 'Overview' \|\| active === 'Today'\) return role === 'patient' \? <PatientDashboard go=\{go\} appointments=\{realAppointments\} meds=\{realMeds\} isLoading=\{appsLoading \|\| medsLoading\}\/> : role === 'doctor' \? <DoctorDashboard appointments=\{realAppointments\} isLoading=\{appsLoading\}\/> : <AdminDashboard\/>/;
const newRecordsViewRoute = `if (active === 'Overview' || active === 'Today') return role === 'patient' ? <PatientDashboard go={go} appointments={realAppointments} meds={realMeds} isLoading={appsLoading || medsLoading}/> : role === 'doctor' ? <DoctorDashboard appointments={realAppointments} isLoading={appsLoading}/> : <AdminDashboard metrics={adminMetrics} isLoading={adminLoading}/>`;
content = content.replace(recordsViewRouteRegex, newRecordsViewRoute);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched admin dashboard in careflow-app.tsx');
