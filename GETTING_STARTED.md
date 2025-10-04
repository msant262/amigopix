# 🚀 Guia de Início Rápido - CyberFlix Empréstimos

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase
- Git instalado

## ⚡ Início Rápido (5 minutos)

### 1. Configure o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto chamado "cyberflix-emprestimos"
3. Habilite **Authentication** → **Email/Password**
4. Crie um banco **Firestore Database**
5. Habilite **Storage**

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite com suas credenciais do Firebase
```

No arquivo `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Execute o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

### 4. Configure as Regras do Firestore

Copie o conteúdo do arquivo `firestore.rules` para o Firebase Console → Firestore → Rules.

### 5. Crie Dados de Exemplo (Opcional)

Descomente a última linha do arquivo `src/lib/seedData.ts` e execute:

```bash
npm run dev
```

Isso criará:
- 1 administrador (admin@cyberflix.com / admin123)
- 3 clientes de exemplo
- 4 empréstimos
- 3 conteúdos

## 🎯 Testando o Sistema

### Login como Administrador
- Email: `admin@cyberflix.com`
- Senha: `admin123`

### Funcionalidades Disponíveis

#### 👨‍💼 Administrador
- ✅ Dashboard completo com KPIs
- ✅ CRUD de empréstimos
- ✅ CRUD de clientes
- ✅ Gerenciar conteúdos
- ✅ Visualizar todos os dados

#### 👤 Cliente
- ✅ Dashboard personalizado
- ✅ Ver apenas seus empréstimos
- ✅ Visualizar conteúdos públicos
- ✅ Atualizar perfil

## 📱 Testando Mobile

1. Abra as ferramentas de desenvolvedor (F12)
2. Ative o modo responsivo
3. Selecione um dispositivo móvel
4. Teste a navegação por bottom tabs

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── layout/         # Layout e navegação
├── features/           # Páginas por funcionalidade
│   ├── auth/          # Autenticação
│   ├── dashboard/     # Dashboard
│   ├── emprestimos/   # Empréstimos
│   ├── clientes/      # Clientes
│   ├── conteudos/     # Conteúdos
│   └── perfil/        # Perfil
├── lib/               # Utilitários e configurações
│   ├── firebase/      # Configuração Firebase
│   └── utils/         # Funções auxiliares
├── types/             # Tipos TypeScript
└── contexts/          # Contextos React
```

## 🎨 Personalização

### Alterando Cores
Edite `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#sua-cor-primaria',
  },
  secondary: {
    DEFAULT: '#sua-cor-secundaria',
  },
}
```

### Alterando Logo
Substitua o componente logo em `src/components/layout/Header.tsx`

## 🐛 Solução de Problemas

### Erro de Firebase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Firebase está ativo

### Erro de Build
```bash
npm run type-check  # Verificar tipos
npm run lint        # Verificar linting
```

### Erro de Autenticação
- Verifique se Authentication está habilitado
- Confirme se Email/Password está ativo

## 📞 Suporte

Para problemas específicos:
1. Verifique o console do navegador (F12)
2. Consulte os logs do Firebase
3. Verifique a documentação do Firebase

---

**🎉 Pronto! Seu sistema CyberFlix Empréstimos está funcionando!**
