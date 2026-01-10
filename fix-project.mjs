// fix-project.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Début de la correction du projet...\n');

try {
  console.log('1️⃣  Étape 1: Renommage des fichiers');
  await import('./rename-files.js');
  
  console.log('\n2️⃣  Étape 2: Correction des imports');
  await import('./fix-imports.js');
  
  console.log('\n3️⃣  Étape 3: Nettoyage du cache Vite');
  const viteCache = path.join(__dirname, 'node_modules', '.vite');
  if (fs.existsSync(viteCache)) {
    fs.rmSync(viteCache, { recursive: true, force: true });
    console.log('✅ Cache Vite supprimé');
  }
  
  console.log('\n🎉 Correction terminée!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Redémarrez le serveur: npm run dev');
  console.log('2. Vérifiez les erreurs dans la console');
  console.log('3. Si problèmes persistants, vérifiez manuellement App.tsx');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}