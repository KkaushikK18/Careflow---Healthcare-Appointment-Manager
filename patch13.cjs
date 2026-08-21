const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// 1. Inject Modal component
if (!content.includes('function Modal(')) {
  const modalCode = `
function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--background)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}
`;
  content = content.replace('function Status', modalCode + 'function Status');
}

// 2. Rewrite DoctorDashboard
const doctorDashRegex = /function DoctorDashboard\(\{ appointments, isLoading, token, refetchLeaves \}: any\) \{[\s\S]*?\} \}/;

const newDoctorDash = `function DoctorDashboard({ appointments, isLoading, token, refetchLeaves }: any) { 
    const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveDate, setLeaveDate] = useState('');

    const handleAddLeave = async () => {
        if (!leaveDate) return;
        await addLeave(token, leaveDate);
        setShowLeaveModal(false);
        setLeaveDate('');
        if (refetchLeaves) refetchLeaves();
    };

    return <>
      <Modal isOpen={!!selectedNotes} onClose={() => setSelectedNotes(null)} title="AI Clinical Summary">
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{selectedNotes}</p>
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Add Availability Block">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Date to block</label>
          <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="text-button" onClick={() => setShowLeaveModal(false)}>Cancel</button>
          <button className="primary-button" onClick={handleAddLeave}>Confirm Block</button>
        </div>
      </Modal>

      <Heading eyebrow={new Date().toLocaleDateString()} title="Good morning, Doctor" subtitle={\`You have \${appointments?.length || 0} appointments today.\`} action={<button className="primary-button" onClick={() => setShowLeaveModal(true)}><Plus size={17}/> Add availability</button>}/>
      <Metrics items={[["Today's appointments", appointments?.length?.toString() || '0', ''],['Awaiting notes','0',''],['Open slots','12','Across next 7 days'],['Patient messages','0','']]}/>
      <Card><div className="card-heading"><div><h2>Today&apos;s schedule</h2><p className="muted">{new Date().toLocaleDateString()}</p></div></div><Table><thead><Row><Cell muted>TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>SYMPTOMS / AI SUMMARY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{isLoading ? <Row><Cell><div style={{padding: 20}}>Loading schedule...</div></Cell></Row> : appointments?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No appointments today.</div></Cell></Row> : appointments?.map((a: any) => <Row key={a.id}><Cell>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Cell><Cell><strong>{a.patient?.user?.name || a.patient?.firstName || 'Patient'}</strong></Cell><Cell muted>{a.preVisit ? <button className="outline-button" onClick={() => setSelectedNotes(a.preVisit.chiefComplaint)}>View AI Notes</button> : 'Routine'}</Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><ChevronRight size={16}/></Cell></Row>)}</tbody></Table></Card>
    </> 
}`;

if (doctorDashRegex.test(content)) {
  content = content.replace(doctorDashRegex, newDoctorDash);
} else {
  console.log("Failed to match DoctorDashboard");
}


// 3. Rewrite RecordsView to inject Modal states
// We need to inject states at the top of RecordsView
const recordsViewStartRegex = /const \{ data: realLeaves, isLoading: leavesLoading, refetch: refetchLeaves \} = useQuery\(\{[\s\S]*?\}\);/;
const newRecordsViewStart = `const { data: realLeaves, isLoading: leavesLoading, refetch: refetchLeaves } = useQuery({
    queryKey: ['leaves', role],
    queryFn: () => fetchLeaves(token as string),
    enabled: !!token && role === 'doctor'
  });

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');`;

content = content.replace(recordsViewStartRegex, newRecordsViewStart);

// Replace Messages Tab
const messagesTabRegex = /if \(active === 'Messages'\) return <><Heading title="Messages" subtitle="Secure conversations with your care team." action=\{<button className="primary-button" onClick=\{\(\) => \{[\s\S]*?\}\}><Plus size=\{17\}\/> New message<\/button>\}\/><Card><div className="timeline">\{msgsLoading[\s\S]*?<\/Card><\/>/;

const newMessagesTab = `if (active === 'Messages') return <>
      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="New Message">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Message</label>
          <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} style={{ width: '100%', height: 100, padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="text-button" onClick={() => setShowMessageModal(false)}>Cancel</button>
          <button className="primary-button" onClick={async () => {
             if (!msgContent || !realAppointments || realAppointments.length === 0) return;
             const docId = realAppointments[0].doctor?.user?.id;
             if (docId) {
                await sendMessage(token as string, docId, msgContent);
                setShowMessageModal(false);
                setMsgContent('');
             }
          }}>Send Message</button>
        </div>
      </Modal>
      <Heading title="Messages" subtitle="Secure conversations with your care team." action={<button className="primary-button" onClick={() => setShowMessageModal(true)}><Plus size={17}/> New message</button>}/><Card><div className="timeline">{msgsLoading ? <p style={{padding:20}}>Loading...</p> : realMessages?.length === 0 ? <p style={{padding:20}}>No messages.</p> : realMessages?.map((m: any, i: number) => <div key={m.id}><span className={i % 2 === 0 ? "timeline-dot teal-dot" : "timeline-dot mint-dot"}/><p><strong>{m.senderId === user?.id ? 'You' : (m.sender?.doctorProfile?.lastName ? 'Dr. ' + m.sender.doctorProfile.lastName : (m.sender?.patientProfile?.firstName || 'Unknown'))}</strong><small>{m.content} • {new Date(m.createdAt).toLocaleString()}</small></p>{!m.read && m.senderId !== user?.id ? <Status>Unread</Status> : <Status tone="neutral">Read</Status>}</div>)}</div></Card></>`;

content = content.replace(messagesTabRegex, newMessagesTab);


// Replace Schedule Tab
const scheduleTabRegex = /if \(active === 'Schedule' \|\| active === 'Leave & availability'\) return <><Heading title=\{active\} subtitle="Manage availability and keep the care calendar reliable." action=\{<button className="primary-button" onClick=\{\(\) => \{[\s\S]*?\}\}><Plus size=\{17\}\/> Add time block<\/button>\}\/><div className="content-grid"><Card><h2>Upcoming Leave<\/h2>[\s\S]*?<\/div><\/>/;

const newScheduleTab = `if (active === 'Schedule' || active === 'Leave & availability') return <>
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Add Availability Block">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Date to block</label>
          <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="text-button" onClick={() => setShowScheduleModal(false)}>Cancel</button>
          <button className="primary-button" onClick={async () => {
             if (scheduleDate) {
               await addLeave(token as string, scheduleDate);
               setShowScheduleModal(false);
               setScheduleDate('');
               refetchLeaves();
             }
          }}>Confirm Block</button>
        </div>
      </Modal>
      <Heading title={active} subtitle="Manage availability and keep the care calendar reliable." action={<button className="primary-button" onClick={() => setShowScheduleModal(true)}><Plus size={17}/> Add time block</button>}/><div className="content-grid"><Card><h2>Upcoming Leave</h2><p className="muted">Blocked out days</p><div className="schedule-list">{leavesLoading ? <p>Loading...</p> : realLeaves?.length === 0 ? <p className="muted">No leave scheduled.</p> : realLeaves?.map((l: any) => <div className="schedule-row" key={l.id}><div className="schedule-time"><small>ALL DAY</small></div><div className="schedule-line"/><div className="schedule-patient"><strong>{new Date(l.date).toLocaleDateString()}</strong><span>Blocked - Leave</span></div><Status tone="warning">Busy</Status></div>)}</div></Card><Card><h2>Availability rules</h2><p className="muted">Default scheduling preferences</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Video visits</strong><small>Enabled for follow-ups</small></p></div><div><span className="timeline-dot mint-dot"/><p><strong>Buffer time</strong><small>15 minutes between appointments</small></p></div></div></Card></div></>`;

content = content.replace(scheduleTabRegex, newScheduleTab);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched all modals');
