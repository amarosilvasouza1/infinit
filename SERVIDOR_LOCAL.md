# 🏠 SERVIDOR LOCAL - CONTROLE TOTAL

## ✅ O QUE VOCÊ CONSEGUE

### 🔒 **CONTROLE TOTAL**
- Todos os dados ficam no **SEU PC**
- Você vê tudo que está acontecendo
- Ninguém além de você tem acesso aos dados
- Backup simples (só copiar os arquivos)

### 💾 **ONDE FICAM OS DADOS**
```
📁 infinit/
  ├── 📄 database.json      ← Todos os usuários
  ├── 📁 src/data/
  │   ├── 📄 friends.json   ← Todas as amizades
  │   └── 📄 chats.json     ← Todas as conversas
```

### 🌐 **COMO FUNCIONA**
1. **Seu PC** = Servidor (precisa ficar ligado)
2. **ngrok** = Cria link global (grátis)
3. **Amigos** = Acessam pelo link de qualquer lugar

---

## 🚀 COMO USAR

### 📥 **PRIMEIRA VEZ**
```bash
# Execute uma vez só:
infinit.bat
# Escolha opção 1: "Primeira vez"
```

### ⚡ **DIA A DIA**
```bash
# Para abrir o site para amigos:
infinit.bat
# Escolha opção 2: "Iniciar servidor"
```

### 🔗 **LINK PARA AMIGOS**
Quando você iniciar o servidor, aparecerá algo assim:
```
🌐 Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

**Envie `https://abc123.ngrok.io` para seus amigos!**

---

## 📊 MONITORAMENTO

### 👀 **VER DADOS SALVOS**
```bash
infinit.bat
# Opção 3: "Ver dados salvos"
```

### 💾 **FAZER BACKUP**
```bash
infinit.bat
# Opção 4: "Backup dos dados"
```

---

## ⚠️ IMPORTANTE

### 🔌 **SEU PC PRECISA:**
- ✅ Ficar ligado enquanto amigos usam
- ✅ Ter internet estável
- ✅ Porta 3000 liberada (Windows Firewall)

### 🔒 **SEGURANÇA:**
- ✅ Só quem tem o link consegue acessar
- ✅ Link muda toda vez que reinicia
- ✅ Dados ficam só no seu PC

### 📱 **PARA AMIGOS:**
- ✅ Funciona em celular e computador
- ✅ Não precisam instalar nada
- ✅ Só acessar o link que você enviar

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### ❌ **"Erro ao instalar ngrok"**
```bash
# Rode como administrador:
npm install -g ngrok --force
```

### ❌ **"Porta 3000 em uso"**
```bash
# Mate processos na porta 3000:
npx kill-port 3000
```

### ❌ **"Amigos não conseguem acessar"**
1. Verifique se o ngrok está rodando
2. Confirme o link correto (muda toda vez)
3. Teste você mesmo o link primeiro

### ❌ **"Dados perdidos"**
- Os dados ficam nos arquivos `.json`
- Faça backup regularmente
- Para restaurar: copie os arquivos de volta

---

## 📞 COMPARTILHAR COM AMIGOS

### 📱 **MENSAGEM PARA COPIAR:**
```
🎮 Vem jogar no Infinit!

🔗 Link: [COLE_O_LINK_DO_NGROK_AQUI]

ℹ️ Como usar:
1. Clique no link
2. Crie sua conta
3. Me adicione como amigo!

⚠️ Se não funcionar, me avise que eu reinicio o servidor
```

---

## 🔄 BACKUP AUTOMÁTICO

Para não perder dados, copie estes arquivos regularmente:
- `database.json`
- `src/data/friends.json`
- `src/data/chats.json`

**Dica:** Use a opção 4 do menu para backup automático!
