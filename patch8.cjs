const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Fix Appointments loading/empty state
content = content.replace(
  `<tbody>{appsLoading ? <p style={{padding: 20}}>Loading...</p> : realAppointments?.length === 0 ? <p style={{padding: 20}}>No appointments.</p>`,
  `<tbody>{appsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realAppointments?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No appointments.</div></Cell></Row>`
);

// Fix Medications loading/empty state
content = content.replace(
  `<tbody>{medsLoading ? <p style={{padding: 20}}>Loading...</p> : realMeds?.length === 0 ? <p style={{padding: 20}}>No medications.</p>`,
  `<tbody>{medsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realMeds?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No medications.</div></Cell></Row>`
);

// Fix Patients loading/empty state
content = content.replace(
  `<tbody>{patientsLoading ? <p style={{padding:20}}>Loading...</p> : realPatients?.length === 0 ? <p style={{padding:20}}>No patients found.</p>`,
  `<tbody>{patientsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realPatients?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No patients found.</div></Cell></Row>`
);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully fixed hydration errors in tables');
