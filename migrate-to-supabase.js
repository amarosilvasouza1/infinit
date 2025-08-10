// Script para migrar dados JSON para Supabase
// Execute: node migrate-to-supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. Configure suas credenciais do Supabase aqui:
const SUPABASE_URL = 'SEU_SUPABASE_URL_AQUI';
const SUPABASE_KEY = 'SEU_SUPABASE_KEY_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateData() {
  console.log('🚀 Iniciando migração de dados...');
  
  try {
    // Migrar usuários
    const users = JSON.parse(fs.readFileSync('./database.json', 'utf8')).users;
    console.log(`📤 Migrando ${users.length} usuários...`);
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .insert([user]);
      
      if (error) console.error('Erro ao inserir usuário:', error);
    }
    
    // Migrar amigos
    if (fs.existsSync('./src/data/friends.json')) {
      const friends = JSON.parse(fs.readFileSync('./src/data/friends.json', 'utf8'));
      console.log('📤 Migrando dados de amigos...');
      
      const { error } = await supabase
        .from('friends')
        .insert([friends]);
      
      if (error) console.error('Erro ao inserir amigos:', error);
    }
    
    // Migrar chats
    if (fs.existsSync('./src/data/chats.json')) {
      const chats = JSON.parse(fs.readFileSync('./src/data/chats.json', 'utf8')).chats;
      console.log(`📤 Migrando ${chats.length} chats...`);
      
      for (const chat of chats) {
        const { error } = await supabase
          .from('chats')
          .insert([chat]);
        
        if (error) console.error('Erro ao inserir chat:', error);
      }
    }
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('🌐 Agora você pode fazer deploy na Vercel');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Para instalar dependência:
console.log('📦 Para usar este script:');
console.log('1. npm install @supabase/supabase-js');
console.log('2. Configure SUPABASE_URL e SUPABASE_KEY');
console.log('3. node migrate-to-supabase.js');

// migrateData();
