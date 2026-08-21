const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

content = content.replace(
  `import { appointments, doctors, medications, type Role } from '@/lib/mock-services'`,
  `import { appointments, doctors, medications, type Role } from '@/lib/mock-services'\nimport { useAuth } from './auth-provider'\nimport { LoginScreen } from './login-screen'\nimport { DoctorsView } from './doctors-view'`
);

content = content.replace(
  `if (active === 'Find a doctor' || active === 'Doctors') return <><Heading title={active === 'Doctors' ? 'Doctors' : 'Find a doctor'} subtitle="Browse care teams, specialties, and availability."/><div className="quick-grid">{doctors.map(d => <Card key={d.name}><div className="card-heading"><Avatar initials={d.initials} tone={d.tone}/><Status>Available</Status></div><h3>{d.name}</h3><p className="muted">{d.specialty}</p><p style={{marginTop:16}}>★ {d.rating} <span className="muted">· Next opening {d.next}</span></p><button className="outline-button" onClick={() => alert(\`Booking with \${d.name}\`)}>View profile <ChevronRight size={15}/></button></Card>)}</div></>`,
  `if (active === 'Find a doctor' || active === 'Doctors') return <DoctorsView active={active} />`
);

content = content.replace(
  `export default function CareFlowApp() {\n  const [role, setRole] = useState<Role>('patient'); const [active, setActive] = useState('Overview'); const [mobileOpen, setMobileOpen] = useState(false); const [notice, setNotice] = useState('')\n  const currentNav = useMemo(() => nav[role], [role]); const go = (label: string) => { setActive(label); setMobileOpen(false) }\n  const initials = role === 'patient' ? 'MC' : role === 'doctor' ? 'AR' : 'AL'\n  return <div className="app-shell">`,
  `export default function CareFlowApp() {\n  const { user, logout } = useAuth();\n  const [active, setActive] = useState('Overview'); \n  const [mobileOpen, setMobileOpen] = useState(false); \n  const [notice, setNotice] = useState('');\n  \n  const role = (user?.role.toLowerCase() || 'patient') as Role;\n  const currentNav = useMemo(() => nav[role], [role]); \n  const go = (label: string) => { setActive(label); setMobileOpen(false) };\n  const initials = user?.email.substring(0,2).toUpperCase() || 'NA';\n  \n  if (!user) return <LoginScreen />;\n  \n  return <div className="app-shell">`
);

content = content.replace(
  `<div className="role-switcher"><span>Workspace</span><select value={role} onChange={e => { setRole(e.target.value as Role); setActive(e.target.value === 'patient' ? 'Overview' : e.target.value === 'doctor' ? 'Today' : 'Overview'); setMobileOpen(false) }} aria-label="Switch workspace"><option value="patient">Patient view</option><option value="doctor">Doctor view</option><option value="admin">Admin view</option></select></div>`,
  `<div className="role-switcher" style={{padding: "10px 15px", borderBottom: "1px solid var(--border)", display: 'flex', justifyContent: 'space-between'}}><span>Workspace Role</span><strong>{role.toUpperCase()}</strong></div>`
);

content = content.replace(
  `<div className="profile-chip"><Avatar initials={initials}/><span><strong>{names[role]}</strong><small>{roles[role]}</small></span><MoreHorizontal size={16}/></div>`,
  `<div className="profile-chip" style={{cursor: 'pointer'}} onClick={logout}><Avatar initials={initials}/><span><strong>{user?.email}</strong><small>{roles[role]}</small></span><MoreHorizontal size={16}/></div>`
);

content = content.replace(
  `<div className="top-avatar">{initials}</div>`,
  `<div className="top-avatar" onClick={logout} style={{cursor: 'pointer'}}>{initials}</div>`
);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched careflow-app.tsx');
