const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Inject queryClient into RecordsView
const recordsViewStartRegex = /const \{ token, user \} = useAuth\(\);/;
const newRecordsViewStart = `const { token, user } = useAuth();\n  const queryClient = useQueryClient();`;
content = content.replace(recordsViewStartRegex, newRecordsViewStart);

// Replace the Send Message button logic
const sendMsgButtonRegex = /<button className="primary-button" onClick=\{async \(\) => \{[\s\S]*?\}\}>Send Message<\/button>/;

const newSendMsgButton = `<button className="primary-button" onClick={async () => {
             if (!msgContent) return;
             if (!realAppointments || realAppointments.length === 0) {
                 alert('You must have at least one appointment to message your care team.');
                 return;
             }
             const recipientId = role === 'patient' ? realAppointments[0].doctor?.user?.id : realAppointments[0].patient?.user?.id;
             if (recipientId) {
                await sendMessage(token as string, recipientId, msgContent);
                setShowMessageModal(false);
                setMsgContent('');
                queryClient.invalidateQueries({ queryKey: ['messages'] });
             } else {
                alert('Could not determine a valid recipient for your message.');
             }
          }}>Send Message</button>`;

content = content.replace(sendMsgButtonRegex, newSendMsgButton);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully patched Send Message button');
