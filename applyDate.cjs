const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/PICHAU/Pictures/Roteiros/src/stores';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const importStatement = "import { getNowInSaoPauloISO } from '../utils/dateUtils';\n";

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  if (content.includes('new Date().toISOString()')) {
    content = content.replace(/new Date\(\)\.toISOString\(\)/g, 'getNowInSaoPauloISO()');
    
    if (!content.includes('getNowInSaoPauloISO')) {
      content = importStatement + content;
    } else if (!content.includes("from '../utils/dateUtils'")) {
       content = importStatement + content;
    }
    
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${f}`);
  }
});
