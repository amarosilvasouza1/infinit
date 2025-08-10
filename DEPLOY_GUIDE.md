# 🌟 Deploy Guide - Infinit

## 🚀 Opção 1: Deploy Automático (Vercel) - RECOMENDADO

### Para o Site Público:
1. Acesse: https://vercel.com
2. Conecte com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `infinit`
5. Clique em "Deploy"
6. ✅ Pronto! Seu site estará online em poucos minutos

**Vantagens:**
- Deploy automático a cada commit
- HTTPS grátis
- CDN global
- Zero configuração

## 🏠 Opção 2: Servidor Local para Amigos

### Para hospedar no seu PC:

1. **Prepare o build de produção:**
```bash
npm run build
```

2. **Execute o servidor:**
```bash
npm start
```

3. **Configure port forwarding no seu roteador:**
   - Acesse o painel do seu roteador (geralmente 192.168.1.1)
   - Procure por "Port Forwarding" ou "Redirecionamento de Porta"
   - Adicione regra:
     - Porta externa: 3000
     - Porta interna: 3000
     - IP do seu PC: [Seu IP local]

4. **Descubra seu IP externo:**
   - Acesse: https://www.whatismyip.com/
   - Copie o IP mostrado

5. **Compartilhe com amigos:**
   - Envie o link: `http://[SEU_IP_EXTERNO]:3000`

### Scripts úteis:

**Iniciar servidor de produção:**
```bash
# Windows
start_server.bat

# Linux/Mac
./start_server.sh
```

**Parar servidor:**
```bash
# Ctrl + C no terminal
```

## 🔧 Configurações Adicionais

### Para melhor performance:
1. **Instale PM2** (gerenciador de processos):
```bash
npm install -g pm2
pm2 start npm --name "infinit" -- start
pm2 save
pm2 startup
```

### Para usar domínio personalizado:
1. Configure DNS para apontar para seu IP
2. Use serviços como No-IP ou DuckDNS para IP dinâmico

## 🛡️ Segurança

### Recomendações:
- Use HTTPS (certificado SSL)
- Configure firewall adequadamente
- Monitore logs de acesso
- Mantenha o sistema atualizado

## 📊 Monitoramento

### Verificar status:
```bash
# Ver logs em tempo real
npm run dev 

# ou com PM2
pm2 logs infinit
```

### Verificar performance:
- CPU e RAM do sistema
- Largura de banda da internet
- Número de usuários conectados

## 🆘 Problemas Comuns

### Erro de porta em uso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Não consegue acessar externamente:
1. Verifique port forwarding
2. Verifique firewall do Windows
3. Teste conexão local primeiro
4. Confirme IP externo

### Site lento:
1. Verifique velocidade da internet
2. Otimize imagens do projeto
3. Use CDN (Vercel recomendado)

## 💡 Dicas Extras

- **Para testes:** Use ngrok para túnel temporário
- **Para produção:** Considere VPS (DigitalOcean, AWS, etc.)
- **Para escala:** Use serviços managed (Vercel, Netlify)

## 📱 Acesso Mobile

O site é totalmente responsivo e funciona em:
- 📱 Celulares (Android/iOS)
- 💻 Tablets 
- 🖥️ Desktops
- 📺 Smart TVs com navegador
