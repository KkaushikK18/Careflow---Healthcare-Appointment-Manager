const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Add fetchMessages to API import
if (!content.includes('fetchMessages')) {
  content = content.replace(
    `import { fetchAppointments, fetchMedications, fetchAdminMetrics } from '@/lib/api'`,
    `import { fetchAppointments, fetchMedications, fetchAdminMetrics, fetchMessages, sendMessage } from '@/lib/api'`
  );
}

// Inject messages query into RecordsView
const recordsViewQueryRegex = /const \{ data: adminMetrics, isLoading: adminLoading \} = useQuery\(\{[\s\S]*?\}\);/;
const newRecordsViewQuery = `const { data: adminMetrics, isLoading: adminLoading } = useQuery({
    queryKey: ['adminMetrics', role],
    queryFn: () => fetchAdminMetrics(token as string),
    enabled: !!token && role === 'admin'
  });

  const { data: realMessages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', role],
    queryFn: () => fetchMessages(token as string),
    enabled: !!token
  });`;
content = content.replace(recordsViewQueryRegex, newRecordsViewQuery);

// Patch the Messages tab inside RecordsView
const messagesTabRegex = /if \(active === 'Messages'\) return <><Heading title="Messages" subtitle="Secure conversations with your care team\." action=\{<button className="primary-button" onClick=\{\(\) => alert\('New message composer opened'\)\}><Plus size=\{17\}\/> New message<\/button>\}\/><Card><div className="timeline"><div><span className="timeline-dot teal-dot"\/><p><strong>Dr\. Ananya Rao<\/strong><small>Your lab results look stable\. Let&apos;s discuss them at your next visit\. A 9:42 AM<\/small><\/p><Status>Unread<\/Status><\/div><div><span className="timeline-dot mint-dot"\/><p><strong>CareFlow support<\/strong><small>Your appointment reminder is ready\. A Yesterday<\/small><\/p><Status tone="neutral">Read<\/Status><\/div><\/div><\/Card><\/>/;

// The regex above might fail if the unicode space is different, so I'll just use a broader regex.
const messagesTabBroaderRegex = /if \(active === 'Messages'\) return <><Heading title="Messages"[\s\S]*?<\/Card><\/>/;

const newMessagesTab = `if (active === 'Messages') return <><Heading title="Messages" subtitle="Secure conversations with your care team." action={<button className="primary-button" onClick={() => {
    const content = prompt('Enter your message:');
    if (content && realAppointments && realAppointments.length > 0) {
       const docId = realAppointments[0].doctor?.user?.id;
       if (docId) {
          sendMessage(token as string, docId, content).then(() => alert('Message sent! Refresh to see it.'));
       } else {
          alert('Could not determine doctor to message.');
       }
    }
  }}><Plus size={17}/> New message</button>}/><Card><div className="timeline">{msgsLoading ? <p style={{padding:20}}>Loading...</p> : realMessages?.length === 0 ? <p style={{padding:20}}>No messages.</p> : realMessages?.map((m: any, i: number) => <div key={m.id}><span className={i % 2 === 0 ? "timeline-dot teal-dot" : "timeline-dot mint-dot"}/><p><strong>{m.senderId === user?.id ? 'You' : (m.sender?.doctorProfile?.lastName ? 'Dr. ' + m.sender.doctorProfile.lastName : (m.sender?.patientProfile?.firstName || 'Unknown'))}</strong><small>{m.content} • {new Date(m.createdAt).toLocaleString()}</small></p>{!m.read && m.senderId !== user?.id ? <Status>Unread</Status> : <Status tone="neutral">Read</Status>}</div>)}</div></Card></>`;

content = content.replace(messagesTabBroaderRegex, newMessagesTab);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched messages in careflow-app.tsx');
