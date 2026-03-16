const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function checkDb(path) {
  console.log(`Checking DB at: ${path}`);
  try {
    // We can use sqlite3 command line if available
    const output = execSync(`sqlite3 "${path}" "SELECT COUNT(*) FROM User;"`).toString();
    console.log(`User count: ${output.trim()}`);
  } catch (e) {
    console.log(`Could not check ${path}: ${e.message}`);
  }
}

checkDb('c:\\Users\\Admin\\Desktop\\Personal\\ShaggarBPO\\church-management\\db\\custom.db');
checkDb('c:\\Users\\Admin\\Desktop\\Personal\\ShaggarBPO\\church-management\\prisma\\db\\church.db');
