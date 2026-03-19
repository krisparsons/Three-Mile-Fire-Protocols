const fs = require('fs');
const protocols = JSON.parse(fs.readFileSync('extracted_protocols.json', 'utf8'));
console.log(protocols[3].content);
