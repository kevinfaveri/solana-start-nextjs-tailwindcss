const fs = require('fs');
const idl = require('./target/idl/starter.json');

fs.writeFileSync('./src/programs/idl.json', JSON.stringify(idl));