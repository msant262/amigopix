# CyberFlix Empréstimos

Sistema completo de controle de empréstimos com foco mobile-first, desenvolvido com React 19.2, TypeScript, Tailwind CSS e Firebase.

## 🚀 Características

- **Mobile-First**: Design otimizado para celulares e tablets
- **Tema Dark**: Interface escura com paleta customizada (preto, laranja, violeta, roxo, verde)
- **Autenticação**: Sistema de login com roles (administrador/cliente)
- **Dashboard**: KPIs e gráficos em tempo real
- **Gestão Completa**: Empréstimos, clientes e conteúdos
- **Responsivo**: Adaptável para todos os dispositivos

## 🛠️ Stack Tecnológica

- **Frontend**: React 19.2 + TypeScript
- **Bundler**: Vite 6
- **Estilo**: Tailwind CSS 4.1 + shadcn/ui
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Estado**: React Query + Context API
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts

## 📱 Páginas e Funcionalidades

### 🔐 Autenticação (`/auth`)
- Login/Registro/Recuperação de senha
- Roles: Administrador e Cliente
- Proteção de rotas por perfil

### 📊 Dashboard (`/dashboard`)
- KPIs em tempo real
- Próximos vencimentos
- Gráficos de distribuição
- Resumos financeiros

### 💳 Empréstimos (`/emprestimos`)
- CRUD completo (administradores)
- Visualização (clientes veem apenas os próprios)
- Filtros e busca avançada
- Cálculo automático de juros

### 👥 Clientes (`/clientes`)
- Gestão completa de clientes
- Validação de CPF/CNPJ
- Histórico de empréstimos

### 📚 Conteúdos (`/conteudos`)
- Publicação de vídeos, textos e imagens
- Controle de visibilidade
- Sistema de tags

### 👤 Perfil (`/perfil`)
- Informações pessoais
- Configurações de segurança
- Atualização de dados

## 🎨 Design System

### Paleta de Cores
- **Preto**: `#000000` (background principal)
- **Laranja**: `#f97316` (secondary)
- **Violeta**: `#d946ef` (primary)
- **Roxo**: `#8b5cf6` (violet)
- **Verde**: `#22c55e` (accent)

### Componentes UI
- Botões com variantes (primary, secondary, accent, destructive)
- Cards com gradientes e bordas
- Badges para status
- Formulários com validação
- Navegação mobile (bottom tabs) e desktop (sidebar)

## 🔧 Instalação e Configuração

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd cyberflix-emprestimos
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure as variáveis de ambiente
\`\`\`bash
cp env.example .env.local
\`\`\`

Edite o arquivo `.env.local` com suas credenciais do Firebase:
\`\`\`env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
\`\`\`

### 4. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilite Authentication (Email/Password)
3. Crie um banco Firestore
4. Configure Storage
5. Aplique as regras de segurança do arquivo `firestore.rules`

### 5. Execute o projeto
\`\`\`bash
npm run dev
\`\`\`

O projeto estará disponível em `http://localhost:3000`

## 📊 Estrutura de Dados (Firestore)

### Coleção: `users`
\`\`\`typescript
{
  uid: string;
  nome: string;
  email: string;
  role: 'administrador' | 'cliente';
  telefone?: string;
  endereco?: string;
  documento?: string;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Coleção: `clientes`
\`\`\`typescript
{
  id: string;
  nomeCompleto: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Coleção: `emprestimos`
\`\`\`typescript
{
  id: string;
  clienteId: string;
  principal: number;
  taxaJuros: number;
  periodicidadeJuros: 'mensal' | 'anual';
  tipoJuros: 'simples' | 'composto';
  dataInicio: Date;
  dataVencimento: Date;
  parcelas?: number;
  status: 'ativo' | 'atrasado' | 'quitado';
  saldoDevedor: number;
  jurosAcumulado: number;
  valorTotal: number;
  ultimaAtualizacao: Date;
  observacoes?: string;
}
\`\`\`

### Coleção: `pagamentos`
\`\`\`typescript
{
  id: string;
  emprestimoId: string;
  data: Date;
  valor: number;
  principalPago: number;
  jurosPago: number;
  metodo: 'dinheiro' | 'pix' | 'transferencia' | 'cheque' | 'cartao';
  observacoes?: string;
}
\`\`\`

### Coleção: `conteudos`
\`\`\`typescript
{
  id: string;
  tipo: 'video' | 'texto' | 'imagem';
  titulo: string;
  descricao: string;
  urlStorageOuEmbed: string;
  publicadoEm: Date;
  autor: string;
  autorNome?: string;
  visibilidade: 'publico' | 'administradores' | 'clientes';
  tags?: string[];
  ordem?: number;
}
\`\`\`

## 🔐 Regras de Segurança

O sistema implementa regras de segurança baseadas em roles:

- **Administradores**: Acesso total a todas as funcionalidades
- **Clientes**: Visualização apenas dos próprios empréstimos e conteúdos públicos

As regras estão configuradas no arquivo `firestore.rules`.

## 📱 Responsividade

### Mobile (< 768px)
- Bottom navigation
- Cards empilhados
- Touch-friendly buttons (44px mínimo)
- Safe area insets

### Tablet (768px - 1024px)
- Grid adaptativo
- Sidebar colapsável
- Layout híbrido

### Desktop (> 1024px)
- Sidebar fixa
- Layout em colunas
- Hover states

## 🧪 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificação de tipos
npm run type-check

# Linting
npm run lint
\`\`\`

## 🎯 Funcionalidades Principais

### Dashboard
- ✅ Próximos vencimentos (7 dias)
- ✅ KPIs financeiros
- ✅ Gráficos de distribuição
- ✅ Resumos por status

### Empréstimos
- ✅ CRUD completo
- ✅ Cálculo de juros (simples/composto)
- ✅ Filtros avançados
- ✅ Histórico de pagamentos

### Clientes
- ✅ Gestão completa
- ✅ Validação de documentos
- ✅ Histórico de empréstimos
- ✅ Busca e filtros

### Conteúdos
- ✅ Suporte a vídeos (YouTube)
- ✅ Imagens e textos
- ✅ Sistema de tags
- ✅ Controle de visibilidade

### Autenticação
- ✅ Login/Registro
- ✅ Roles (admin/cliente)
- ✅ Recuperação de senha
- ✅ Proteção de rotas

## 🔧 Customização

### Paleta de Cores
Edite o arquivo `tailwind.config.js` para alterar as cores:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores primárias
      },
      secondary: {
        // Suas cores secundárias
      },
      // ...
    }
  }
}
\`\`\`

### Tokens CSS
As variáveis CSS estão definidas em `src/index.css`:

\`\`\`css
:root {
  --background: 0 0% 0%; /* Preto */
  --primary: 292 100% 64%; /* Violeta */
  --secondary: 24 95% 53%; /* Laranja */
  --accent: 142 76% 36%; /* Verde */
}
\`\`\`

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais oficiais.

---

**CyberFlix Empréstimos** - Sistema completo de controle de empréstimos com foco mobile-first.
