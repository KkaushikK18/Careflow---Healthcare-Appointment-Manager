const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// The original DoctorDashboard:
const regex = /function DoctorDashboard\(\{ appointments, isLoading, token, refetchLeaves \}: any\) \{[\s\S]*?\} \}/;

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

if (regex.test(content)) {
  content = content.replace(regex, newDoctorDash);
  fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
  console.log('Successfully patched DoctorDashboard');
} else {
  // Let's try matching the exact string if regex failed because of some weird characters
  console.log("REGEX FAILED");
}
