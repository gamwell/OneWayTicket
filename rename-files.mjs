// rename-files.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkAndRenameFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Explorer les sous-dossiers
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        checkAndRenameFiles(filePath);
      }
    } else {
      // Vérifier si le fichier n'a pas d'extension
      const ext = path.extname(file);
      
      if (ext === '') {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          let newExt = '';
          
          // Détecter TypeScript JSX
          if ((content.includes('</') || content.includes('/>') || 
               content.includes('React.')) && 
              (content.includes(': ') || content.includes('interface ') || 
               content.includes('type '))) {
            newExt = '.tsx';
          }
          // Détecter JSX
          else if (content.includes('</') || content.includes('/>') || 
                   (content.includes('return (') && content.includes('<'))) {
            newExt = '.jsx';
          }
          // Détecter TypeScript
          else if (content.includes(': ') || content.includes('interface ') || 
                   content.includes('type ')) {
            newExt = '.ts';
          }
          // Détecter JavaScript
          else if (content.includes('import ') || content.includes('export ') ||
                   content.includes('function ') || content.includes('const ') ||
                   content.includes('let ')) {
            newExt = '.js';
          }
          
          if (newExt) {
            const newFilePath = filePath + newExt;
            console.log(`📄 Renommage: ${file} -> ${file}${newExt}`);
            fs.renameSync(filePath, newFilePath);
          }
        } catch (err) {
          console.log(`⚠️  Erreur avec ${filePath}: ${err.message}`);
        }
      }
    }
  });
}

console.log('🔍 Recherche de fichiers sans extension...');
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  checkAndRenameFiles(srcDir);
} else {
  console.log('📁 Vérification du dossier courant...');
  checkAndRenameFiles(__dirname);
}
console.log('✅ Terminé!');