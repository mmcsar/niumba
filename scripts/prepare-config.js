// Niumba - Script pour Préparer la Configuration
// Lit les fichiers SQL et les prépare pour copie dans Supabase

const fs = require('fs');
const path = require('path');

const scripts = [
  'SECURITE_SUPABASE_COMPLETE.sql',
  'INDEX_OPTIMISATION_LUALABA_KATANGA.sql'
];

console.log('📋 Préparation des Scripts SQL pour Supabase\n');

scripts.forEach((filename, index) => {
  const filePath = path.join(__dirname, '..', 'supabase', filename);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const outputPath = path.join(__dirname, '..', `SCRIPT_${index + 1}_${filename}`);
    
    fs.writeFileSync(outputPath, content);
    
    console.log(`✅ ${filename}`);
    console.log(`   → ${outputPath}`);
    console.log(`   Taille: ${(content.length / 1024).toFixed(2)} KB\n`);
  } else {
    console.log(`❌ Fichier non trouvé: ${filename}\n`);
  }
});

console.log('📝 Instructions:');
console.log('1. Ouvrez Supabase Dashboard → SQL Editor');
console.log('2. Copiez-collez chaque script dans l\'ordre');
console.log('3. Exécutez (Run ou Ctrl+Enter)');
console.log('\n✨ Scripts prêts!');


