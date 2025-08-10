# 🌐 CONFIGURAR NGROK PARA AMIGOS DISTANTES

## ❗ PROBLEMA ATUAL:
```
ERROR: authentication failed: Usage of ngrok requires a verified account and authtoken.
```

## ✅ SOLUÇÃO:

### 1️⃣ **CRIAR CONTA NGROK (GRÁTIS)**
1. Acesse: https://dashboard.ngrok.com/signup
2. Crie sua conta (grátis)
3. Confirme seu email

### 2️⃣ **PEGAR SEU TOKEN**
1. Após login, vá para: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copie seu authtoken (algo como: `2abc123def456ghi789jkl`)

### 3️⃣ **CONFIGURAR TOKEN**
Abra o terminal como **ADMINISTRADOR** e execute:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**Exemplo:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl
```

### 4️⃣ **TESTAR**
Depois de configurar, execute:
```bash
servidor.bat
```

---

## 🏠 **ALTERNATIVA: SÓ REDE LOCAL**

Se não quiser configurar ngrok agora, use:
```bash
servidor_local_simples.bat
```

**Como funciona:**
- ✅ Servidor roda no seu PC
- ✅ Você acessa: http://localhost:3000
- ✅ Testa todas as funcionalidades
- ❌ Amigos distantes não conseguem acessar

**Para amigos na mesma rede WiFi:**
- Descubra seu IP local: `ipconfig`
- Amigos acessam: `http://SEU_IP:3000`
- Exemplo: `http://192.168.1.100:3000`

---

## 📋 **RESUMO:**

### 🎯 **OPÇÃO 1: APENAS LOCAL**
```bash
# Execute:
servidor_local_simples.bat

# Acesse:
http://localhost:3000
```

### 🌐 **OPÇÃO 2: NGROK (AMIGOS DISTANTES)**
```bash
# 1. Configure ngrok (uma vez só):
#    - Crie conta em: https://dashboard.ngrok.com/signup
#    - Pegue token: https://dashboard.ngrok.com/get-started/your-authtoken
#    - Execute: ngrok config add-authtoken SEU_TOKEN

# 2. Execute:
servidor.bat

# 3. Compartilhe o link que aparecer
```

---

## 🔧 **COMANDOS ÚTEIS:**

```bash
# Ver se ngrok está configurado:
ngrok config check

# Configurar token:
ngrok config add-authtoken SEU_TOKEN

# Testar ngrok manualmente:
ngrok http 3000
```

---

## ⚡ **INÍCIO RÁPIDO:**

1. **Para testar agora:** `servidor_local_simples.bat`
2. **Para amigos distantes:** Configure ngrok e use `servidor.bat`
