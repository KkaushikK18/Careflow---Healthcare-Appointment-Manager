'use client'

import { useMemo, useState } from 'react'
import { Activity, Bell, CalendarDays, Check, ChevronRight, Clock3, FileText, HeartPulse, LayoutDashboard, Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Stethoscope, Users, X } from 'lucide-react'
import { appointments, doctors, medications, type Role } from '@/lib/mock-services'
import { useAuth } from './auth-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAppointments, fetchMedications, fetchAdminMetrics, fetchMessages, sendMessage, fetchPatients, fetchLeaves, addLeave } from '@/lib/api'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { DoctorsView } from './doctors-view'
import { SettingsView } from './settings-view'
import { AdminDoctorsView } from './admin-doctors-view'
import { MyMedications } from './my-medications'
import { PrescribeMedicationForm } from './prescribe-medication-form'
import { AppointmentActionsModal } from './appointment-actions-modal'
import { useToast } from '@/hooks/use-toast'

type NavItem = [string, typeof LayoutDashboard]
const nav: Record<Role, NavItem[]> = {
  patient: [['Overview', LayoutDashboard], ['Appointments', CalendarDays], ['Find a doctor', Search], ['Medications', HeartPulse], ['Messages', MessageCircle]],
  doctor: [['Today', LayoutDashboard], ['Appointments', CalendarDays], ['Patients', Users], ['Schedule', Clock3], ['Messages', MessageCircle]],
  admin: [['Overview', LayoutDashboard], ['Appointments', CalendarDays], ['Doctors', Stethoscope], ['Leave & availability', Clock3], ['System health', ShieldCheck]],
}
const names = { patient: 'Maya Chen', doctor: 'Dr. Ananya Rao', admin: 'Alex Lewis' }
const roles = { patient: 'Patient', doctor: 'Cardiologist', admin: 'Administrator' }


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
function Status({ children, tone = 'success' }: { children: React.ReactNode; tone?: 'success'|'warning'|'neutral'|'danger' }) { return <span className={`status status-${tone}`}><span className="status-dot" />{children}</span> }
function Avatar({ initials, tone = 'teal' }: { initials: string; tone?: string }) { return <div className={`avatar avatar-${tone}`}>{initials}</div> }
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`surface ${className}`}>{children}</section> }
function Heading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) { return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="muted">{subtitle}</p></div>{action}</div> }
function Table({ children }: { children: React.ReactNode }) { return <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>{children}</table></div> }
function Row({ children }: { children: React.ReactNode }) { return <tr style={{ borderTop: '1px solid var(--border)' }}>{children}</tr> }
function Cell({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) { return <td style={{ padding: '15px 8px', color: muted ? 'var(--muted)' : 'var(--foreground)', fontSize: 12 }}>{children}</td> }

function PatientDashboard({ go }: { go: (label: string) => void }) {
  const [meds, setMeds] = useState(medications); const [toast, setToast] = useState('')
  const complete = (i: number) => { setMeds(meds.map((m, n) => n === i ? { ...m, state: 'Taken' } : m)); setToast('Medication marked as taken') }
  return <><Heading eyebrow="Tuesday, June 18, 2024" title="Good morning, Maya" subtitle="Here&apos;s your care plan at a glance." action={<button className="primary-button" onClick={() => go('Appointments')}><Plus size={17}/> Book an appointment</button>}/><div className="hero-grid"><Card className="appointment-hero"><div className="card-top"><div><p className="eyebrow">UP NEXT</p><h2>Cardiology follow-up</h2></div><Status>Confirmed</Status></div><div className="appointment-main"><div className="date-block"><strong>19</strong><span>JUN</span></div><div><p className="large-meta">Tomorrow · 10:30 AM</p><p className="muted">with Dr. Ananya Rao</p><p className="muted">Video visit · Secure link available 15 min before</p></div></div><div className="card-actions"><button className="dark-button" onClick={() => go('Appointments')}>View appointment <ChevronRight size={15}/></button><button className="text-button" onClick={() => setToast('Calendar invite added')}><CalendarDays size={15}/> Add to calendar</button></div></Card><Card className="care-pulse"><div className="pulse-orbit"><HeartPulse size={22}/></div><p className="eyebrow">CARE PULSE</p><h3>Everything is on track</h3><p className="muted">Your next check-in is scheduled and your medication routine is 92% consistent this month.</p><div className="progress"><span style={{ width: '92%' }}/></div><div className="progress-label"><span>Medication consistency</span><strong>92%</strong></div></Card></div><div className="section-heading"><div><h2>Quick actions</h2><p className="muted">Common things you might need today</p></div></div><div className="quick-grid">{[['Find a doctor','Search specialists and availability','Find a doctor'],['View medications','Stay on top of your care plan','Medications'],['Visit summaries','Review notes from past visits','Messages'],['Message care team','Ask a question securely','Messages']].map(([t,d,target]) => <button key={t} className="quick-action" onClick={() => go(target)}><span className="icon-box"><Search size={19}/></span><span><strong>{t}</strong><small>{d}</small></span><ChevronRight size={16} className="chevron"/></button>)}</div><div className="content-grid"><Card><div className="card-heading"><div><h2>Medication reminders</h2><p className="muted">Your plan for today</p></div></div><div className="med-list">{meds.map((med, i) => <div className="med-row" key={med.name}><div className="med-icon"><HeartPulse size={17}/></div><div className="med-copy"><strong>{med.name}</strong><span>{med.dose}</span></div><div className="med-time"><Clock3 size={14}/> {med.time}</div><button onClick={() => complete(i)} className={med.state === 'Taken' ? 'check-button checked' : 'check-button'} aria-label={`Mark ${med.name} taken`}>{med.state === 'Taken' ? <Check size={15}/> : <span/>}</button></div>)}</div><button className="outline-button" onClick={() => go('Medications')}>View medication plan <ChevronRight size={15}/></button></Card><Card><div className="card-heading"><div><h2>Recent activity</h2><p className="muted">Your care timeline</p></div><button className="text-button" onClick={() => go('Messages')}>View all <ChevronRight size={14}/></button></div><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Appointment confirmed</strong><small>Cardiology with Dr. Rao · Today, 9:42 AM</small></p></div><div><span className="timeline-dot mint-dot"/><p><strong>Visit summary available</strong><small>Dermatology follow-up · May 28</small></p></div></div></Card></div>{toast && <button className="toast" onClick={() => setToast('')}><Check size={16}/> {toast}<X size={15}/></button>}</>
}

function DoctorDashboard({ appointments, isLoading, token, refetchLeaves }: any) { 
    const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveDate, setLeaveDate] = useState('');
    const { toast } = useToast();

    const handleAddLeave = async () => {
        if (!leaveDate) return;
        try {
            await addLeave(token, leaveDate);
            setShowLeaveModal(false);
            setLeaveDate('');
            if (refetchLeaves) refetchLeaves();
            toast({
                title: 'Success',
                description: 'Leave/availability block added successfully'
            });
        } catch (error: any) {
            console.error('Error adding leave:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to add leave',
                variant: 'destructive'
            });
        }
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

      <Heading eyebrow={new Date().toLocaleDateString()} title="Good morning, Doctor" subtitle={`You have ${appointments?.length || 0} appointments today.`} action={<button className="primary-button" onClick={() => setShowLeaveModal(true)}><Plus size={17}/> Add availability</button>}/>
      <Metrics items={[["Today's appointments", appointments?.length?.toString() || '0', ''],['Awaiting notes','0',''],['Open slots','12','Across next 7 days'],['Patient messages','0','']]}/>
      <Card><div className="card-heading"><div><h2>Today&apos;s schedule</h2><p className="muted">{new Date().toLocaleDateString()}</p></div></div><Table><thead><Row><Cell muted>TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>SYMPTOMS / AI SUMMARY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{isLoading ? <Row><Cell><div style={{padding: 20}}>Loading schedule...</div></Cell></Row> : appointments?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No appointments today.</div></Cell></Row> : appointments?.map((a: any) => <Row key={a.id}><Cell>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Cell><Cell><strong>{a.patient?.user?.name || a.patient?.firstName || 'Patient'}</strong></Cell><Cell muted>{a.preVisit ? <button className="outline-button" onClick={() => setSelectedNotes(a.preVisit.chiefComplaint)}>View AI Notes</button> : 'Routine'}</Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><ChevronRight size={16}/></Cell></Row>)}</tbody></Table></Card>
    </> 
}
function Metrics({ items }: { items: string[][] }) { return <div className="metric-grid">{items.map(([l,v,d]) => <Card className="metric-card" key={l}><p className="muted">{l}</p><strong>{v}</strong><span>{d}</span></Card>)}</div> }
function AdminDashboard({ metrics, isLoading }: any) { 
  return <><Heading eyebrow="OPERATIONS / OVERVIEW" title="Good morning, Admin" subtitle="A clear view of how CareFlow is running today."/><Metrics items={[["Appointments today", metrics?.appointmentsToday?.toString() || '0', ''],['Active doctors', metrics?.activeDoctors?.toString() || '0', ''],['Completion rate', metrics?.completionRate || '0%', ''],['Avg. response time', metrics?.avgResponseTime || '-', '']]}/><div className="content-grid"><Card><div className="card-heading"><div><h2>Appointment volume</h2><p className="muted">Last 7 days across all locations</p></div><Status>Healthy</Status></div><div className="chart"><div className="chart-grid"/><svg viewBox="0 0 600 180" role="img" aria-label="Appointment volume trending upward"><path d="M0 145 C70 130 85 150 135 118 S210 130 260 92 S335 110 385 78 S460 90 510 50 S560 56 600 22" fill="none" stroke="var(--primary)" strokeWidth="3"/></svg></div></Card><Card><h2>System status</h2><p className="muted">CareFlow operational health</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>All services operational</strong><small>Health check passed · 2 minutes ago</small></p></div><div><span className="timeline-dot mint-dot"/><p><strong>Backup completed</strong><small>Database snapshot · Today, 03:00</small></p></div></div></Card></div></> }

function RecordsView({ role, active, go }: { role: Role; active: string; go: (s:string)=>void }) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [adminNotice, setAdminNotice] = useState('');
  
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
  
  const { data: adminMetrics, isLoading: adminLoading } = useQuery({
    queryKey: ['adminMetrics', role],
    queryFn: () => fetchAdminMetrics(token as string),
    enabled: !!token && role === 'admin'
  });

  const { data: realMessages, isLoading: msgsLoading } = useQuery({
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
  });

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showAppointmentActionsModal, setShowAppointmentActionsModal] = useState(false);
  
  if (active === 'Overview' || active === 'Today') return role === 'patient' ? <PatientDashboard go={go} appointments={realAppointments} meds={realMeds} isLoading={appsLoading || medsLoading}/> : role === 'doctor' ? <DoctorDashboard appointments={realAppointments} isLoading={appsLoading} token={token} refetchLeaves={refetchLeaves}/> : <AdminDashboard metrics={adminMetrics} isLoading={adminLoading}/>
  if (active === 'Appointments') {
    if (selectedAppt) {
      return (
        <>
          <Modal isOpen={showPrescribeModal} onClose={() => setShowPrescribeModal(false)} title="Complete Visit & Prescribe">
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <PrescribeMedicationForm
                appointmentId={selectedAppt.id}
                token={token as string}
                onSuccess={() => {
                  setShowPrescribeModal(false)
                  setSelectedAppt(null)
                  queryClient.invalidateQueries({ queryKey: ['appointments'] })
                }}
              />
            </div>
          </Modal>

          <AppointmentActionsModal
            isOpen={showAppointmentActionsModal}
            onClose={() => setShowAppointmentActionsModal(false)}
            appointment={selectedAppt}
            token={token as string}
            userRole={role.toUpperCase() as 'PATIENT' | 'DOCTOR'}
          />

          <button onClick={() => setSelectedAppt(null)} className="text-button" style={{marginBottom: 20}}>← Back to appointments</button>
          <Heading title="Appointment Details" subtitle={role === 'patient' ? `With Dr. ${selectedAppt.doctor?.firstName || ''} ${selectedAppt.doctor?.lastName || 'Unknown'}` : `With ${selectedAppt.patient?.firstName || 'Patient'} ${selectedAppt.patient?.lastName || ''}`} />
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
             <div style={{display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap'}}>
               {role === 'doctor' && selectedAppt.status === 'CONFIRMED' && (
                 <button className="primary-button" onClick={() => setShowPrescribeModal(true)}>
                   <Plus size={17}/> Complete Visit & Prescribe Medications
                 </button>
               )}
               {!['CANCELLED', 'COMPLETED'].includes(selectedAppt.status) && (
                 <button 
                   className="outline-button" 
                   onClick={() => setShowAppointmentActionsModal(true)}
                   style={{display: 'flex', alignItems: 'center', gap: 8}}
                 >
                   <CalendarDays size={17}/> Cancel or Reschedule
                 </button>
               )}
             </div>
          </Card>
        </>
      )
    }

    return <><Heading title="Appointments" subtitle="Review, manage, and prepare for upcoming care." action={<button className="primary-button" onClick={() => go('Find a doctor')}><Plus size={17}/> New appointment</button>}/><Card><Table><thead><Row><Cell muted>DATE & TIME</Cell><Cell muted>PATIENT</Cell><Cell muted>CLINICIAN / SPECIALTY</Cell><Cell muted>STATUS</Cell><Cell/></Row></thead><tbody>{appsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realAppointments?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No appointments.</div></Cell></Row> : realAppointments?.map((a: any) => <Row key={a.id}><Cell><strong>{new Date(a.startTime).toLocaleDateString()}</strong><br/><span style={{color:'var(--muted)'}}>{new Date(a.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></Cell><Cell>{a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : 'You'}</Cell><Cell>{a.doctor?.firstName ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}` : 'You'}<br/><span style={{color:'var(--muted)'}}>{a.doctor?.specialisation}</span></Cell><Cell><Status tone="success">{a.status}</Status></Cell><Cell><button className="icon-button" aria-label={`Open ${a.id}`} onClick={() => setSelectedAppt(a)}><MoreHorizontal size={18}/></button></Cell></Row>)}</tbody></Table></Card></>
  }
  if (active === 'Find a doctor' || active === 'Doctors') {
    // Admin role: Show doctor management interface
    if (role === 'admin') {
      return (
        <>
          <AdminDoctorsView setNotice={setAdminNotice} />
          {adminNotice && <button className="toast" onClick={() => setAdminNotice('')}><Bell size={16}/> {adminNotice}<X size={15}/></button>}
        </>
      )
    }
    // Patient role: Show doctor search/booking interface
    return <DoctorsView active={active} />
  }
  if (active === 'Medications') {
    if (role === 'patient') {
      return (
        <>
          <Heading title="Medications" subtitle="Your active prescriptions and daily medication reminders." />
          <MyMedications token={token as string} />
        </>
      )
    }
    // For doctor role, show prescriptions they've written
    return <><Heading title="Medications" subtitle="Your active prescriptions and daily routine."/><Card><Table><thead><Row><Cell muted>MEDICATION</Cell><Cell muted>DOSAGE</Cell><Cell muted>SCHEDULE</Cell><Cell muted>STATUS</Cell></Row></thead><tbody>{medsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realMeds?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No medications.</div></Cell></Row> : realMeds?.map((m: any) => <Row key={m.id}><Cell><strong>{m.name}</strong></Cell><Cell muted>{m.dose}</Cell><Cell>{m.time}</Cell><Cell><Status tone={m.state === 'Taken' ? 'success' : 'warning'}>{m.state}</Status></Cell></Row>)}</tbody></Table><button className="primary-button" style={{marginTop:18}} onClick={() => {
      toast({
        title: 'Request Sent',
        description: 'Medication refill request sent to your doctor'
      })
    }}><Plus size={17}/> Request refill</button></Card></>
  }
  if (active === 'Messages') return <>
      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="New Message">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Message</label>
          <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} style={{ width: '100%', height: 100, padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="text-button" onClick={() => setShowMessageModal(false)}>Cancel</button>
          <button className="primary-button" onClick={async () => {
             if (!msgContent) return;
             if (!realAppointments || realAppointments.length === 0) {
                 toast({
                   title: 'No Appointments',
                   description: 'You must have at least one appointment to message your care team.',
                   variant: 'destructive'
                 });
                 return;
             }
             const recipientId = role === 'patient' ? realAppointments[0].doctor?.user?.id : realAppointments[0].patient?.user?.id;
             if (recipientId) {
                await sendMessage(token as string, recipientId, msgContent);
                setShowMessageModal(false);
                setMsgContent('');
                queryClient.invalidateQueries({ queryKey: ['messages'] });
                toast({
                  title: 'Success',
                  description: 'Message sent successfully'
                });
             } else {
                toast({
                  title: 'Error',
                  description: 'Could not determine a valid recipient for your message.',
                  variant: 'destructive'
                });
             }
          }}>Send Message</button>
        </div>
      </Modal>
      <Heading title="Messages" subtitle="Secure conversations with your care team." action={<button className="primary-button" onClick={() => setShowMessageModal(true)}><Plus size={17}/> New message</button>}/><Card><div className="timeline">{msgsLoading ? <p style={{padding:20}}>Loading...</p> : realMessages?.length === 0 ? <p style={{padding:20}}>No messages.</p> : realMessages?.map((m: any, i: number) => <div key={m.id}><span className={i % 2 === 0 ? "timeline-dot teal-dot" : "timeline-dot mint-dot"}/><p><strong>{m.senderId === user?.id ? 'You' : (m.sender?.doctorProfile?.lastName ? 'Dr. ' + m.sender.doctorProfile.lastName : (m.sender?.patientProfile?.firstName || 'Unknown'))}</strong><small>{m.content} • {new Date(m.createdAt).toLocaleString()}</small></p>{!m.read && m.senderId !== user?.id ? <Status>Unread</Status> : <Status tone="neutral">Read</Status>}</div>)}</div></Card></>
  if (active === 'Patients') return <><Heading title="Patients" subtitle="Your active patient panel and follow-up status."/><Card><Table><thead><Row><Cell muted>PATIENT</Cell><Cell muted>LAST VISIT</Cell><Cell muted>CARE PLAN</Cell><Cell muted>FOLLOW-UP</Cell></Row></thead><tbody>{patientsLoading ? <Row><Cell><div style={{padding: 20}}>Loading...</div></Cell></Row> : realPatients?.length === 0 ? <Row><Cell><div style={{padding: 20}}>No patients found.</div></Cell></Row> : realPatients?.map((p: any) => <Row key={p.id}><Cell><div style={{display:'flex',alignItems:'center',gap:9}}><Avatar initials={p.name.split(' ').map((x:any)=>x[0]).join('')}/><strong>{p.name}</strong></div></Cell><Cell muted>{new Date(p.lastVisit).toLocaleDateString()}</Cell><Cell>{p.carePlan}</Cell><Cell><Status tone={p.carePlan === 'Follow-up' ? 'warning' : 'success'}>{p.carePlan === 'Follow-up' ? 'Due' : 'On track'}</Status></Cell></Row>)}</tbody></Table></Card></>
  if (active === 'Schedule' || active === 'Leave & availability') return <>
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Add Availability Block">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Date to block</label>
          <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="text-button" onClick={() => setShowScheduleModal(false)}>Cancel</button>
          <button className="primary-button" onClick={async () => {
             if (scheduleDate) {
               try {
                 await addLeave(token as string, scheduleDate);
                 setShowScheduleModal(false);
                 setScheduleDate('');
                 refetchLeaves();
                 toast({
                   title: 'Success',
                   description: 'Leave/availability block added successfully'
                 });
               } catch (error: any) {
                 console.error('Error adding leave:', error);
                 toast({
                   title: 'Error',
                   description: error.message || 'Failed to add leave',
                   variant: 'destructive'
                 });
               }
             }
          }}>Confirm Block</button>
        </div>
      </Modal>
      <Heading title={active} subtitle="Manage availability and keep the care calendar reliable." action={<button className="primary-button" onClick={() => setShowScheduleModal(true)}><Plus size={17}/> Add time block</button>}/><div className="content-grid"><Card><h2>Upcoming Leave</h2><p className="muted">Blocked out days</p><div className="schedule-list">{leavesLoading ? <p>Loading...</p> : realLeaves?.length === 0 ? <p className="muted">No leave scheduled.</p> : realLeaves?.map((l: any) => <div className="schedule-row" key={l.id}><div className="schedule-time"><small>ALL DAY</small></div><div className="schedule-line"/><div className="schedule-patient"><strong>{new Date(l.date).toLocaleDateString()}</strong><span>Blocked - Leave</span></div><Status tone="warning">Busy</Status></div>)}</div></Card><Card><h2>Availability rules</h2><p className="muted">Default scheduling preferences</p><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>Video visits</strong><small>Enabled for follow-ups</small></p></div><div><span className="timeline-dot mint-dot"/><p><strong>Buffer time</strong><small>15 minutes between appointments</small></p></div></div></Card></div></>
  return <><Heading title="System health" subtitle="Live operational checks across CareFlow services."/><div className="metric-grid">{[['API services','99.98%','Operational'],['Notifications','Healthy','No delays'],['Data backups','Today, 03:00','Completed'],['Security checks','Passed','Last scan 2h ago']].map(([l,v,d]) => <Card className="metric-card" key={l}><p className="muted">{l}</p><strong style={{fontSize:22}}>{v}</strong><span><Status>{d}</Status></span></Card>)}</div><Card><h2>Recent system events</h2><div className="timeline"><div><span className="timeline-dot teal-dot"/><p><strong>All services operational</strong><small>Health check completed · 2 minutes ago</small></p></div><div><span className="timeline-dot gray-dot"/><p><strong>Backup completed</strong><small>Encrypted snapshot stored · Today, 03:00</small></p></div></div></Card></>
}

export default function CareFlowApp() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('Overview'); 
  const [mobileOpen, setMobileOpen] = useState(false); 
  const [notice, setNotice] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  
  const role = (user?.role.toLowerCase() || 'patient') as Role;
  const currentNav = useMemo(() => nav[role], [role]); 
  const go = (label: string) => { setActive(label); setMobileOpen(false) };
  const initials = user?.email.substring(0,2).toUpperCase() || 'NA';
  
  if (!user) {
    return showRegister ? (
      <RegisterScreen onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }
  
  return <div className="app-shell"><aside className={mobileOpen ? 'sidebar open' : 'sidebar'}><div className="brand"><span className="brand-mark"><HeartPulse size={18}/></span><span>Care<span>Flow</span></span><button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18}/></button></div><div className="role-switcher" style={{padding: "10px 15px", borderBottom: "1px solid var(--border)", display: 'flex', justifyContent: 'space-between'}}><span>Workspace Role</span><strong>{role.toUpperCase()}</strong></div><nav>{currentNav.map(([label, Icon]) => <button className={active === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => go(label)}><Icon size={17}/><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button className={`nav-item ${active === 'Settings' ? 'active' : ''}`} onClick={() => go('Settings')}><Settings2 size={17}/><span>Settings</span></button><div className="profile-chip" style={{cursor: 'pointer'}} onClick={logout}><Avatar initials={initials}/><span><strong>{user?.email}</strong><small>{roles[role]}</small></span><MoreHorizontal size={16}/></div></div></aside><div className="main-area"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{active}</strong></div><div className="top-actions"><button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice('No new notifications')}><Bell size={18}/><span/></button><div className="top-avatar" onClick={logout} style={{cursor: 'pointer'}}>{initials}</div></div></header><main className="content">{active === 'Settings' ? <SettingsView setNotice={setNotice} /> : <RecordsView role={role} active={active} go={go}/>} </main></div>{notice && <button className="toast" onClick={() => setNotice('')}><Bell size={16}/> {notice}<X size={15}/></button>}</div>
}
