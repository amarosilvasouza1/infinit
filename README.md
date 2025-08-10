# 🚀 Infinit - Plataforma de Comunicação Social

Uma plataforma moderna de comunicação e rede social construída com Next.js 15, React e TypeScript.

## ✨ Funcionalidades

### 💬 Sistema de Chat
- Mensagens de texto, áudio e mídia
- Chamadas de voz individuais e em grupo  
- Compartilhamento de tela múltiplo
- Interface minimizável e arrastável
- Efeitos sonoros e animações

### 👥 Recursos Sociais
- Sistema completo de amigos
- Criação e gerenciamento de grupos
- Administração de grupos (promover/rebaixar membros)
- Configurações de privacidade

### 👤 Perfil & Personalização
- Avatar e banner personalizáveis
- Galeria de fotos e vídeos
- Sistema de conquistas
- Status personalizados
- Backup e sincronização

### 🎯 Outros Recursos
- Status e Stories (Reals)
- Sistema de festas/eventos
- Comunidades
- Configurações avançadas
- Interface responsiva e moderna

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React
- **State Management**: React Context API
- **Storage**: localStorage com fallbacks inteligentes
- **Build Tool**: Turbopack

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/amarosilvasouza1/infinit.git
cd infinit
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🔐 Login de Teste

Para testar o sistema, use:
- **Email**: teste@infinit.com
- **Senha**: 123456

Ou crie uma nova conta através da página de registro.

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas do Next.js App Router
│   ├── api/            # API Routes
│   ├── auth/           # Página de autenticação
│   ├── conversas/      # Sistema de chat
│   ├── perfil/         # Perfil do usuário
│   └── ...
├── components/         # Componentes React
│   ├── chat/          # Componentes do chat
│   ├── modals/        # Modais (amigos, grupos, etc)
│   ├── auth/          # Componentes de autenticação
│   └── layout/        # Layout components
├── contexts/          # React Contexts
├── hooks/             # Custom hooks
├── lib/              # Utilitários e configurações
└── types/            # Definições TypeScript
```

## 🌐 Deploy

### Frontend (Recomendado: Vercel)
1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente se necessário
3. Deploy automático!

### Servidor Local para Amigos
Se quiser hospedar o servidor no seu PC para amigos:

1. Execute em modo de produção:
```bash
npm run build
npm start
```

2. Configure seu roteador para port forwarding na porta 3000

3. Compartilhe seu IP externo com os amigos

## 📝 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Executa build de produção
- `npm run lint` - Executa linting

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Amaro Silva Souza**
- GitHub: [@amarosilvasouza1](https://github.com/amarosilvasouza1)

## 🙏 Agradecimentos

- Design inspirado nas melhores práticas de UX/UI modernas
- Comunidade React e Next.js pelas ferramentas incríveis
- Todos que contribuíram com feedback e sugestões
