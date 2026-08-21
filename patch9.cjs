const fs = require('fs');
let content = fs.readFileSync('apps/web/components/careflow-app.tsx', 'utf8');

// Inject user from useAuth in RecordsView
const recordsViewStartRegex = /const \{ token \} = useAuth\(\);/;
const newRecordsViewStart = `const { token, user } = useAuth();`;
content = content.replace(recordsViewStartRegex, newRecordsViewStart);

fs.writeFileSync('apps/web/components/careflow-app.tsx', content);
console.log('Successfully added user to RecordsView scope');
