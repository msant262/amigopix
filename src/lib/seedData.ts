import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';

export const seedData = async () => {
  const stats = {
    admin: 0,
    clientes: 0,
    emprestimos: 0,
    pagamentos: 0,
    conteudos: 0
  };
  
  try {
    console.log('🌱 Iniciando seed de dados...');
    console.log('📊 Criando dados de exemplo para teste do sistema...');
    console.log('🔧 Verificando autenticação atual:', auth.currentUser?.email || 'Não autenticado');

    // 1. Criar ou verificar usuário administrador
    const adminEmail = 'admin@cyberflix.com';
    const adminPassword = 'admin123';
    
    console.log('👤 Verificando/criando usuário administrador...');
    
    let adminCredential;
    try {
      // Tentar criar o usuário
      adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      await updateProfile(adminCredential.user, { displayName: 'Administrador' });
      console.log('✅ Novo administrador criado:', adminEmail);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Administrador já existe, fazendo login...');
        // Se já existe, fazer login
        adminCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('✅ Login realizado com administrador existente');
      } else {
        throw error;
      }
    }
    
    await setDoc(doc(db, 'users', adminCredential.user.uid), {
      uid: adminCredential.user.uid,
      nome: 'Administrador',
      email: adminEmail,
      role: 'administrador',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Dados do administrador atualizados no Firestore');
    stats.admin = 1;

    // 2. Criar clientes
    console.log('👥 Criando clientes...');
    const clientes = [
      {
        nomeCompleto: 'João Silva Santos',
        documento: '123.456.789-00',
        telefone: '(11) 99999-1111',
        email: 'joao@email.com',
        endereco: {
          rua: 'Rua das Flores',
          numero: '123',
          complemento: 'Apto 45',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567',
        },
      },
      {
        nomeCompleto: 'Maria Oliveira Costa',
        documento: '987.654.321-00',
        telefone: '(21) 88888-2222',
        email: 'maria@email.com',
        endereco: {
          rua: 'Av. Paulista',
          numero: '456',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
        },
      },
      {
        nomeCompleto: 'Pedro Santos Lima',
        documento: '456.789.123-00',
        telefone: '(31) 77777-3333',
        email: 'pedro@email.com',
        endereco: {
          rua: 'Rua da Liberdade',
          numero: '789',
          complemento: 'Sobrado',
          bairro: 'Liberdade',
          cidade: 'Belo Horizonte',
          estado: 'MG',
          cep: '30112-000',
        },
      },
    ];

    const clienteRefs: string[] = [];
    for (const cliente of clientes) {
      try {
        const docRef = await addDoc(collection(db, 'clientes'), {
          ...cliente,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        clienteRefs.push(docRef.id);
        console.log('✅ Cliente criado:', cliente.nomeCompleto);
        stats.clientes++;
      } catch (error) {
        console.error('❌ Erro ao criar cliente:', cliente.nomeCompleto, error);
        throw error;
      }
    }
    console.log(`📊 Clientes criados: ${stats.clientes}/${clientes.length}`);

    // 3. Criar empréstimos com datas variadas para testar filtros
    console.log('💳 Criando empréstimos...');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const emprestimos = [
      {
        clienteId: clienteRefs[0],
        principal: 5000,
        taxaJuros: 2.5,
        periodicidadeJuros: 'mensal' as const,
        tipoJuros: 'composto' as const,
        dataInicio: oneDayAgo, // Empréstimo de ontem - aparece no filtro "1 dia"
        dataVencimento: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        parcelas: 6,
        status: 'ativo' as const,
        saldoDevedor: 3500,
        jurosAcumulado: 875,
        valorTotal: 5875,
        ultimaAtualizacao: new Date(),
        observacoes: 'Empréstimo para reforma da casa',
      },
      {
        clienteId: clienteRefs[1],
        principal: 3000,
        taxaJuros: 3.0,
        periodicidadeJuros: 'mensal' as const,
        tipoJuros: 'simples' as const,
        dataInicio: threeDaysAgo, // Empréstimo de 3 dias atrás - aparece no filtro "7 dias"
        dataVencimento: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        parcelas: 3,
        status: 'ativo' as const,
        saldoDevedor: 3000,
        jurosAcumulado: 270,
        valorTotal: 3270,
        ultimaAtualizacao: new Date(),
        observacoes: 'Empréstimo pessoal',
      },
      {
        clienteId: clienteRefs[2],
        principal: 8000,
        taxaJuros: 2.0,
        periodicidadeJuros: 'anual' as const,
        tipoJuros: 'composto' as const,
        dataInicio: oneWeekAgo, // Empréstimo de 1 semana atrás - aparece no filtro "7 dias" e "30 dias"
        dataVencimento: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        parcelas: 12,
        status: 'quitado' as const,
        saldoDevedor: 0,
        jurosAcumulado: 160,
        valorTotal: 8160,
        ultimaAtualizacao: new Date(),
        observacoes: 'Empréstimo empresarial',
      },
      {
        clienteId: clienteRefs[0],
        principal: 2000,
        taxaJuros: 4.0,
        periodicidadeJuros: 'mensal' as const,
        tipoJuros: 'simples' as const,
        dataInicio: twoWeeksAgo, // Empréstimo de 2 semanas atrás - aparece no filtro "30 dias"
        dataVencimento: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Vencido há 5 dias
        status: 'atrasado' as const,
        saldoDevedor: 2000,
        jurosAcumulado: 160,
        valorTotal: 2160,
        ultimaAtualizacao: new Date(),
        observacoes: 'Empréstimo de emergência',
      },
      {
        clienteId: clienteRefs[1],
        principal: 4500,
        taxaJuros: 2.8,
        periodicidadeJuros: 'mensal' as const,
        tipoJuros: 'composto' as const,
        dataInicio: oneMonthAgo, // Empréstimo de 1 mês atrás - aparece no filtro "30 dias" e "90 dias"
        dataVencimento: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        parcelas: 8,
        status: 'ativo' as const,
        saldoDevedor: 4500,
        jurosAcumulado: 630,
        valorTotal: 5130,
        ultimaAtualizacao: new Date(),
        observacoes: 'Empréstimo para investimento',
      },
    ];

    const emprestimoRefs: string[] = [];
    for (const emprestimo of emprestimos) {
      try {
        const docRef = await addDoc(collection(db, 'emprestimos'), emprestimo);
        emprestimoRefs.push(docRef.id);
        console.log('✅ Empréstimo criado:', emprestimo.principal);
        stats.emprestimos++;
      } catch (error) {
        console.error('❌ Erro ao criar empréstimo:', emprestimo.principal, error);
        throw error;
      }
    }
    console.log(`📊 Empréstimos criados: ${stats.emprestimos}/${emprestimos.length}`);

    // 4. Criar alguns pagamentos
    console.log('💰 Criando pagamentos...');
    const pagamentos = [
      {
        emprestimoId: emprestimoRefs[0], // Primeiro empréstimo
        data: new Date('2024-02-15'),
        valor: 1500,
        principalPago: 1000,
        jurosPago: 500,
        metodo: 'pix' as const,
        observacoes: 'Primeira parcela',
      },
      {
        emprestimoId: emprestimoRefs[0], // Primeiro empréstimo
        data: new Date('2024-03-15'),
        valor: 1500,
        principalPago: 1100,
        jurosPago: 400,
        metodo: 'pix' as const,
        observacoes: 'Segunda parcela',
      },
      {
        emprestimoId: emprestimoRefs[1], // Segundo empréstimo
        data: new Date('2024-02-20'),
        valor: 1000,
        principalPago: 800,
        jurosPago: 200,
        metodo: 'ted' as const,
        observacoes: 'Primeira parcela',
      },
      {
        emprestimoId: emprestimoRefs[2], // Terceiro empréstimo
        data: new Date('2024-02-10'),
        valor: 8000,
        principalPago: 7500,
        jurosPago: 500,
        metodo: 'pix' as const,
        observacoes: 'Quitação antecipada',
      },
    ];

    for (const pagamento of pagamentos) {
      try {
        await addDoc(collection(db, 'pagamentos'), pagamento);
        console.log('✅ Pagamento criado:', pagamento.valor);
        stats.pagamentos++;
      } catch (error) {
        console.error('❌ Erro ao criar pagamento:', pagamento.valor, error);
        throw error;
      }
    }
    console.log(`📊 Pagamentos criados: ${stats.pagamentos}/${pagamentos.length}`);

    // 5. Criar conteúdos
    console.log('📚 Criando conteúdos...');
    const conteudos = [
      {
        tipo: 'video' as const,
        titulo: 'Como funciona o sistema de empréstimos',
        descricao: 'Vídeo explicativo sobre o funcionamento do sistema de empréstimos CyberFlix',
        urlStorageOuEmbed: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        autor: adminCredential.user.uid,
        autorNome: 'Administrador',
        visibilidade: 'publico' as const,
        tags: ['tutorial', 'sistema', 'emprestimos'],
        ordem: 1,
        publicadoEm: new Date(),
      },
      {
        tipo: 'texto' as const,
        titulo: 'Política de Empréstimos',
        descricao: 'Documento com as políticas e regras para concessão de empréstimos',
        urlStorageOuEmbed: `POLÍTICA DE EMPRÉSTIMOS CYBERFLIX

1. REQUISITOS BÁSICOS
- Idade mínima: 18 anos
- Documentação completa (CPF/CNPJ, RG, comprovante de renda)
- Análise de crédito aprovada

2. TAXAS DE JUROS
- Taxa básica: 2% ao mês
- Taxa reduzida para clientes premium: 1.5% ao mês
- Taxa de juros simples ou composto

3. PRAZOS
- Mínimo: 1 mês
- Máximo: 24 meses
- Renegociação disponível

4. FORMAS DE PAGAMENTO
- PIX (desconto de 2%)
- Transferência bancária
- Dinheiro
- Cartão de crédito

5. PENALIDADES
- Atraso: 2% ao mês sobre o valor em atraso
- Juros de mora: 1% ao mês
- Protesto após 90 dias de atraso`,
        autor: adminCredential.user.uid,
        autorNome: 'Administrador',
        visibilidade: 'publico' as const,
        tags: ['politica', 'regras', 'emprestimos'],
        ordem: 2,
        publicadoEm: new Date(),
      },
      {
        tipo: 'imagem' as const,
        titulo: 'Fluxo de Aprovação de Empréstimos',
        descricao: 'Infográfico explicando o processo de aprovação de empréstimos',
        urlStorageOuEmbed: 'https://via.placeholder.com/800x600/1f2937/ffffff?text=Fluxo+de+Aprovação',
        autor: adminCredential.user.uid,
        autorNome: 'Administrador',
        visibilidade: 'administradores' as const,
        tags: ['processo', 'aprovacao', 'fluxo'],
        ordem: 3,
        publicadoEm: new Date(),
      },
    ];

    for (const conteudo of conteudos) {
      try {
        await addDoc(collection(db, 'conteudos'), conteudo);
        console.log('✅ Conteúdo criado:', conteudo.titulo);
        stats.conteudos++;
      } catch (error) {
        console.error('❌ Erro ao criar conteúdo:', conteudo.titulo, error);
        throw error;
      }
    }
    console.log(`📊 Conteúdos criados: ${stats.conteudos}/${conteudos.length}`);

    console.log('🎉 Seed de dados concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`👤 ${stats.admin} Administrador (admin@cyberflix.com / admin123)`);
    console.log(`👥 ${stats.clientes} Clientes`);
    console.log(`💳 ${stats.emprestimos} Empréstimos (com datas variadas para testar filtros)`);
    console.log(`💰 ${stats.pagamentos} Pagamentos`);
    console.log(`📚 ${stats.conteudos} Conteúdos`);
    console.log('\n🔑 Credenciais do administrador:');
    console.log('Email: admin@cyberflix.com');
    console.log('Senha: admin123');
    console.log('\n🧪 Dados de teste para filtros:');
    console.log('• 1 empréstimo de ontem (filtro "1 dia")');
    console.log('• 2 empréstimos dos últimos 7 dias (filtro "7 dias")');
    console.log('• 4 empréstimos dos últimos 30 dias (filtro "30 dias")');
    console.log('• 5 empréstimos total (filtro "todos")');
    console.log('\n✨ Sistema pronto para testes!');

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
  }
};

// Função para executar o seed (descomente para usar)
// seedData();
