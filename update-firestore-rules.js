#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Atualizando regras do Firestore...');

try {
  // Verificar se o Firebase CLI está instalado
  execSync('firebase --version', { stdio: 'pipe' });
  
  // Verificar se estamos logados
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ Não está logado no Firebase CLI');
    console.log('Execute: firebase login');
    process.exit(1);
  }
  
  // Deploy das regras
  console.log('📤 Fazendo deploy das regras do Firestore...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('✅ Regras do Firestore atualizadas com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao atualizar regras do Firestore:', error.message);
  console.log('\n📋 Instruções manuais:');
  console.log('1. Acesse o Firebase Console: https://console.firebase.google.com');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para Firestore Database > Rules');
  console.log('4. Copie o conteúdo do arquivo firestore.rules');
  console.log('5. Cole no editor de regras');
  console.log('6. Clique em "Publish"');
  process.exit(1);
}
