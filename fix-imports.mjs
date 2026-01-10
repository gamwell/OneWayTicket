// fix-imports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern pour détecter les imports
  const importRegex = /from\s+['"](\.\/[^'"]+?)['"]/g;
  
  const updatedContent = content.replace(importRegex, (match, importPath) => {
    // Si déjà une extension, ignorer
    if (path.extname(importPath)) return match;
    
    const dir = path.dirname(filePath);
    const basePath = path.join(dir, importPath);
    
    // Extensions à tester
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.jsx', '/index.ts', '/index.js'];
    
    for (const ext of extensions) {
      const testPath = basePath + ext;
      if (fs.existsSync(testPath)) {
        const newImport = importPath + ext;
        console.log(`🔧 ${path.relative(__dirname, filePath)}: ${importPath} -> ${newImport}`);
        modified = true;
        return match.replace(importPath, newImport);
      }
    }
    
    // Si non trouvé, essayer .tsx
    console.log(`⚠️  ${path.basename(filePath)}: ${importPath} non trouvé, ajout de .tsx`);
    modified = true;
    return match.replace(importPath, importPath + '.tsx');
  });
  
  if (modified) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.vite'].includes(file)) {
        count += processDirectory(filePath);
      }
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      if (updateImportsInFile(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

console.log('🔧 Correction des imports...');
const srcDir = path.join(__dirname, 'src');
let modified = 0;

if (fs.existsSync(srcDir)) {
  modified = processDirectory(srcDir);
} else {
  console.log('❌ Dossier src non trouvé');
}

// Vérifier aussi les fichiers à la racine
['App.tsx', 'main.tsx', 'index.tsx', 'App.jsx', 'main.jsx', 'index.jsx', 'App.ts', 'main.ts', 'index.ts'].forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (updateImportsInFile(filePath)) {
      modified++;
    }
  }
});

console.log(`✅ ${modified} fichiers modifiés`);