// fix-api.js
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'pages/api');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix anonymous default export
  content = content.replace(
    /export default async\s*\(([^)]*)\)\s*=>\s*{/g,
    'const handler = async ($1) => {'
  );

  // Add export default if missing
  if (!content.includes('export default handler')) {
    content += '\n\nexport default handler;\n';
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', filePath);
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) walk(fullPath);
    else if (file.endsWith('.js')) fixFile(fullPath);
  });
}

walk(apiDir);
