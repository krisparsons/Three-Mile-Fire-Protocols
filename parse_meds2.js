import fs from 'fs';

const content = fs.readFileSync('src/data/protocols.ts', 'utf-8');

const routeKeywords = ['IV', 'IM', 'PO', 'IO', 'NEB', 'IN', 'ETT', 'Auto-Injector', 'Inhaler', 'Nebulized solution', 'Nebulized', 'Nasal', 'Oral', 'Rectal', 'Subcutaneous', 'SQ', 'SC'];

function parseDosingStr(dosingStr) {
  let adultStr = dosingStr;
  let pedStr = '';
  
  const pedMatch = dosingStr.match(/(?:Pediatrics|Pediatric|Children)(?:\s*\([^)]+\))?:?\s*(.*)/i);
  if (pedMatch) {
    pedStr = pedMatch[1];
    adultStr = dosingStr.substring(0, pedMatch.index).trim();
  }
  
  adultStr = adultStr.replace(/^Adults?(?:\s*\([^)]+\))?:?\s*/i, '').trim();
  
  const extractRoutes = (str) => {
    if (!str) return [];
    const routes = [];
    
    // Split by common delimiters like period or semicolon, but be careful with decimals
    // Actually, let's just split by route keywords if they are followed by a colon or at the start of a sentence.
    
    // For simplicity, let's just split by sentences and see if they start with a route.
    const parts = str.split(/(?:\. |; )/);
    let currentRoute = 'General';
    let currentDose = [];
    
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      
      let foundRoute = false;
      for (const kw of routeKeywords) {
        const regex = new RegExp(`^${kw}\\b:?\\s*(.*)`, 'i');
        const match = part.match(regex);
        if (match) {
          if (currentDose.length > 0) {
            routes.push({ route: currentRoute, dose: currentDose.join('. ') + (currentDose.length > 0 && !currentDose[currentDose.length-1].endsWith('.') ? '.' : '') });
          }
          currentRoute = kw.toUpperCase();
          currentDose = [match[1]];
          foundRoute = true;
          break;
        }
      }
      
      if (!foundRoute) {
        currentDose.push(part);
      }
    }
    
    if (currentDose.length > 0) {
      routes.push({ route: currentRoute, dose: currentDose.join('. ') + (currentDose.length > 0 && !currentDose[currentDose.length-1].endsWith('.') ? '.' : '') });
    }
    
    return routes;
  };

  return {
    adult: extractRoutes(adultStr),
    pediatric: extractRoutes(pedStr)
  };
}

// Replace the dosing string with the new object in the file
let newContent = content;

const regex = /dosing:\s*`([^`]+)`|dosing:\s*'([^']+)'|dosing:\s*"([^"]+)"/g;
let match;
const replacements = [];

while ((match = regex.exec(content)) !== null) {
  const dosingStr = match[1] || match[2] || match[3];
  const parsed = parseDosingStr(dosingStr);
  
  const replacement = `dosingDetails: ${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n    ')}`;
  replacements.push({
    start: match.index,
    end: match.index + match[0].length,
    replacement: replacement
  });
}

// Apply replacements from back to front
for (let i = replacements.length - 1; i >= 0; i--) {
  const rep = replacements[i];
  newContent = newContent.substring(0, rep.start) + rep.replacement + newContent.substring(rep.end);
}

// Also update the interface
newContent = newContent.replace(/dosing:\s*string;/, `dosingDetails: {
    adult: { route: string; dose: string }[];
    pediatric: { route: string; dose: string }[];
  };`);

fs.writeFileSync('src/data/protocols.ts', newContent);
console.log("Updated protocols.ts");
