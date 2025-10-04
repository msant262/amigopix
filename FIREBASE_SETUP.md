# 🔥 Configuração do Firebase

## ⚠️ Firebase Não Configurado

O sistema está mostrando uma página em branco porque o Firebase não está configurado. Siga os passos abaixo para resolver:

## 🚀 Configuração Rápida (5 minutos)

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `cyberflix-emprestimos`
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### 2. Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Vá para a aba **"Sign-in method"**
4. Habilite **"E-mail/senha"**
5. Clique em **"Salvar"**

### 3. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"**
4. Selecione a localização mais próxima
5. Clique em **"Concluído"**

### 4. Configurar Storage (Opcional)

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Aceite os termos e clique em **"Próximo"**
4. Escolha a localização e clique em **"Concluído"**

### 5. Obter Credenciais

1. No menu lateral, clique na **engrenagem** ⚙️
2. Clique em **"Configurações do projeto"**
3. Role para baixo até **"Seus aplicativos"**
4. Clique no ícone **"Web"** `</>`
5. Nome do app: `cyberflix-web`
6. **NÃO** marque "Também configurar Firebase Hosting"
7. Clique em **"Registrar app"**
8. **Copie as credenciais** que aparecem

### 6. Configurar Variáveis de Ambiente

1. No projeto, crie/edite o arquivo `.env.local`:

```env
# Substitua pelos valores do seu projeto Firebase
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 7. Aplicar Regras do Firestore

1. No Firebase Console, vá para **"Firestore Database"**
2. Clique na aba **"Regras"**
3. **Substitua** o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        resource.data.role == 'administrador';
    }
    
    function isClient() {
      return isAuthenticated() && 
        resource.data.role == 'cliente';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated();
    }

    match /clientes/{clienteId} {
      allow read, write: if isAdmin();
      allow read: if isClient() && 
        exists(/databases/$(database)/documents/emprestimos/$(emprestimoId)) &&
        get(/databases/$(database)/documents/emprestimos/$(emprestimoId)).data.clienteId == clienteId;
    }

    match /emprestimos/{emprestimoId} {
      allow read, write: if isAdmin();
      allow read: if isClient() && 
        resource.data.clienteId == request.auth.uid;
      allow create: if isAdmin();
      allow update: if isAdmin() || 
        (isClient() && resource.data.clienteId == request.auth.uid);
      allow delete: if isAdmin();
    }

    match /pagamentos/{pagamentoId} {
      allow read, write: if isAdmin();
      allow read: if isClient() && 
        exists(/databases/$(database)/documents/emprestimos/$(resource.data.emprestimoId)) &&
        get(/databases/$(database)/documents/emprestimos/$(resource.data.emprestimoId)).data.clienteId == request.auth.uid;
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /conteudos/{conteudoId} {
      allow read: if resource.data.visibilidade == 'publico' ||
        (isAdmin() && resource.data.visibilidade == 'administradores') ||
        (isAuthenticated() && resource.data.visibilidade == 'clientes');
      allow write: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

4. Clique em **"Publicar"**

### 8. Recarregar a Aplicação

1. Salve o arquivo `.env.local`
2. Recarregue a página do navegador
3. O sistema deve funcionar normalmente

## ✅ Verificação

Após a configuração, você deve ver:
- ✅ Tela de login/registro
- ✅ Sem erros no console
- ✅ Sistema funcionando

## 🆘 Problemas Comuns

### Erro "Firebase: Error (auth/invalid-api-key)"
- Verifique se as credenciais estão corretas no `.env.local`
- Certifique-se de que não há espaços extras
- Recarregue a página após salvar

### Erro de permissões no Firestore
- Verifique se as regras foram aplicadas corretamente
- Certifique-se de que Authentication está habilitado

### Página em branco
- Abra o console do navegador (F12)
- Verifique se há erros JavaScript
- Recarregue a página

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique o console do navegador (F12)
2. Confirme se todas as etapas foram seguidas
3. Certifique-se de que o projeto Firebase está ativo

---

**🎉 Após configurar, seu sistema CyberFlix Empréstimos estará funcionando!**
