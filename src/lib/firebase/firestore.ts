import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import {
  Cliente,
  Emprestimo,
  Pagamento,
  Conteudo,
  EmprestimoFormData,
  ClienteFormData,
  ConteudoFormData,
  EmprestimoFilters,
  ClienteFilters,
  ConteudoFilters,
  DashboardKPIs,
} from '@/types';

// Helper function to convert Firestore timestamps to Dates
const convertTimestamps = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Cliente CRUD
export const createCliente = async (data: ClienteFormData): Promise<string> => {
  try {
    const now = new Date();
    const clienteData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'clientes'), clienteData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

export const updateCliente = async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
  try {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'clientes', id));
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};

export const getCliente = async (id: string): Promise<Cliente | null> => {
  try {
    const clienteDoc = await getDoc(doc(db, 'clientes', id));
    if (!clienteDoc.exists()) {
      return null;
    }
    
    return { id: clienteDoc.id, ...convertTimestamps(clienteDoc.data()) } as Cliente;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
};

export const getClientes = async (
  filters: ClienteFilters = {},
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ clientes: Cliente[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (filters.busca) {
      constraints.push(
        where('nomeCompleto', '>=', filters.busca),
        where('nomeCompleto', '<=', filters.busca + '\uf8ff')
      );
    }
    
    if (filters.documento) {
      constraints.push(where('documento', '==', filters.documento));
    }
    
    if (filters.cidade) {
      constraints.push(where('endereco.cidade', '==', filters.cidade));
    }
    
    if (filters.estado) {
      constraints.push(where('endereco.estado', '==', filters.estado));
    }
    
    constraints.push(orderBy('nomeCompleto'));
    constraints.push(limit(pageSize));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(collection(db, 'clientes'), ...constraints);
    const snapshot = await getDocs(q);
    
    const clientes: Cliente[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Cliente[];
    
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { clientes, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { clientes: [], lastDoc: null };
  }
};

// Empréstimo CRUD
export const createEmprestimo = async (data: EmprestimoFormData): Promise<string> => {
  try {
    const now = new Date();
    const emprestimoData: Omit<Emprestimo, 'id'> = {
      ...data,
      saldoDevedor: data.principal,
      jurosAcumulado: 0,
      valorTotal: data.principal,
      status: 'ativo',
      ultimaAtualizacao: now,
    };
    
    const docRef = await addDoc(collection(db, 'emprestimos'), emprestimoData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    throw error;
  }
};

export const updateEmprestimo = async (id: string, data: Partial<EmprestimoFormData>): Promise<void> => {
  try {
    const emprestimoRef = doc(db, 'emprestimos', id);
    await updateDoc(emprestimoRef, {
      ...data,
      ultimaAtualizacao: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar empréstimo:', error);
    throw error;
  }
};

export const deleteEmprestimo = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'emprestimos', id));
  } catch (error) {
    console.error('Erro ao deletar empréstimo:', error);
    throw error;
  }
};

export const getEmprestimo = async (id: string): Promise<Emprestimo | null> => {
  try {
    const emprestimoDoc = await getDoc(doc(db, 'emprestimos', id));
    if (!emprestimoDoc.exists()) {
      return null;
    }
    
    const emprestimo = { id: emprestimoDoc.id, ...convertTimestamps(emprestimoDoc.data()) } as Emprestimo;
    
    // Carregar dados do cliente se clienteId existir
    if (emprestimo.clienteId) {
      try {
        const cliente = await getCliente(emprestimo.clienteId);
        emprestimo.cliente = cliente || undefined;
      } catch (error) {
        console.warn('Erro ao carregar cliente do empréstimo:', error);
        emprestimo.cliente = undefined;
      }
    }
    
    return emprestimo;
  } catch (error) {
    console.error('Erro ao buscar empréstimo:', error);
    return null;
  }
};

export const getEmprestimos = async (
  filters: EmprestimoFilters = {},
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ emprestimos: Emprestimo[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (filters.clienteId) {
      constraints.push(where('clienteId', '==', filters.clienteId));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.dataInicio && filters.dataFim) {
      constraints.push(
        where('dataVencimento', '>=', filters.dataInicio),
        where('dataVencimento', '<=', filters.dataFim)
      );
    }
    
    if (filters.valorMinimo && filters.valorMaximo) {
      constraints.push(
        where('principal', '>=', filters.valorMinimo),
        where('principal', '<=', filters.valorMaximo)
      );
    }
    
    constraints.push(orderBy('dataInicio', 'desc'));
    constraints.push(limit(pageSize));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(collection(db, 'emprestimos'), ...constraints);
    const snapshot = await getDocs(q);
    
    const emprestimos: Emprestimo[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Emprestimo[];
    
    // Ordenar: atrasados primeiro, depois por data de início (mais recentes primeiro)
    emprestimos.sort((a, b) => {
      // Prioridade: atrasados primeiro
      if (a.status === 'atrasado' && b.status !== 'atrasado') return -1;
      if (a.status !== 'atrasado' && b.status === 'atrasado') return 1;
      
      // Se ambos são atrasados ou ambos não são, ordenar por data de início (mais recentes primeiro)
      return b.dataInicio.getTime() - a.dataInicio.getTime();
    });
    
    // Fetch client data for each loan
    const emprestimosComClientes = await Promise.all(
      emprestimos.map(async (emprestimo) => {
        if (emprestimo.clienteId) {
          const cliente = await getCliente(emprestimo.clienteId);
          return { ...emprestimo, cliente: cliente || undefined };
        }
        return emprestimo;
      })
    );
    
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { emprestimos: emprestimosComClientes, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    return { emprestimos: [], lastDoc: null };
  }
};

// Pagamento CRUD
export const createPagamento = async (data: Omit<Pagamento, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'pagamentos'), data);
    
    // Update loan balance
    const emprestimo = await getEmprestimo(data.emprestimoId);
    if (emprestimo) {
      const novoSaldo = emprestimo.saldoDevedor - data.principalPago;
      const novoJurosAcumulado = emprestimo.jurosAcumulado - data.jurosPago;
      
      await updateDoc(doc(db, 'emprestimos', data.emprestimoId), {
        saldoDevedor: Math.max(0, novoSaldo),
        jurosAcumulado: Math.max(0, novoJurosAcumulado),
        status: novoSaldo <= 0 ? 'quitado' : emprestimo.status,
        ultimaAtualizacao: new Date(),
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
};

export const getPagamentos = async (emprestimoId: string): Promise<Pagamento[]> => {
  try {
    const q = query(
      collection(db, 'pagamentos'),
      where('emprestimoId', '==', emprestimoId)
    );
    
    const snapshot = await getDocs(q);
    
    const pagamentos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Pagamento[];
    
    // Ordenar manualmente por data
    pagamentos.sort((a, b) => b.data.getTime() - a.data.getTime());
    
    return pagamentos;
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return [];
  }
};

// Conteúdo CRUD
export const createConteudo = async (data: ConteudoFormData, autor: string): Promise<string> => {
  try {
    const now = new Date();
    const conteudoData: Omit<Conteudo, 'id'> = {
      ...data,
      autor,
      publicadoEm: now,
    };
    
    const docRef = await addDoc(collection(db, 'conteudos'), conteudoData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error);
    throw error;
  }
};

export const updateConteudo = async (id: string, data: Partial<ConteudoFormData>): Promise<void> => {
  try {
    const conteudoRef = doc(db, 'conteudos', id);
    await updateDoc(conteudoRef, data);
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    throw error;
  }
};

export const deleteConteudo = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'conteudos', id));
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    throw error;
  }
};

export const getConteudo = async (id: string): Promise<Conteudo | null> => {
  try {
    const conteudoDoc = await getDoc(doc(db, 'conteudos', id));
    if (!conteudoDoc.exists()) {
      return null;
    }
    
    return { id: conteudoDoc.id, ...convertTimestamps(conteudoDoc.data()) } as Conteudo;
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return null;
  }
};

export const getConteudos = async (
  filters: ConteudoFilters = {},
  userRole?: 'administrador' | 'cliente'
): Promise<Conteudo[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (filters.tipo) {
      constraints.push(where('tipo', '==', filters.tipo));
    }
    
    if (filters.visibilidade) {
      constraints.push(where('visibilidade', '==', filters.visibilidade));
    } else if (userRole === 'cliente') {
      constraints.push(
        where('visibilidade', 'in', ['publico', 'clientes'])
      );
    }
    
    constraints.push(orderBy('publicadoEm', 'desc'));
    
    const q = query(collection(db, 'conteudos'), ...constraints);
    const snapshot = await getDocs(q);
    
    let conteudos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Conteudo[];
    
    // Filter by search term if provided
    if (filters.busca) {
      const busca = filters.busca.toLowerCase();
      conteudos = conteudos.filter(
        conteudo =>
          conteudo.titulo.toLowerCase().includes(busca) ||
          conteudo.descricao.toLowerCase().includes(busca)
      );
    }
    
    return conteudos;
  } catch (error) {
    console.error('Erro ao buscar conteúdos:', error);
    return [];
  }
};

// Dashboard data
export const getDashboardKPIs = async (
  userRole: 'administrador' | 'cliente', 
  userId?: string, 
  timeRange: '1d' | '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<DashboardKPIs> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (userRole === 'cliente' && userId) {
      // Cliente só vê seus próprios empréstimos
      const cliente = await getClientes({ busca: userId });
      if (cliente.clientes.length > 0) {
        constraints.push(where('clienteId', '==', cliente.clientes[0].id));
      }
    }
    
    const q = query(collection(db, 'emprestimos'), ...constraints);
    const snapshot = await getDocs(q);
    
    let emprestimos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Emprestimo[];
    
    // Aplicar filtro de tempo
    const agora = new Date();
    if (timeRange !== 'all') {
      const diasAtras = timeRange === '1d' ? 1 : 
                       timeRange === '7d' ? 7 : 
                       timeRange === '30d' ? 30 : 90;
      const dataLimite = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);
      emprestimos = emprestimos.filter(e => e.dataInicio >= dataLimite);
    }
    
    // Para o card de próximos vencimentos, vamos manter a lógica original
    // mas incluindo empréstimos vencidos
    const proximosVencimentosComClientes = await Promise.all(
      emprestimos
        .filter(e => {
          if (e.status !== 'ativo') return false;
          
          const hoje = new Date();
          const diffTime = e.dataVencimento.getTime() - hoje.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Incluir vencidos ou que vencem nos próximos 7 dias
          return diffDays <= 7;
        })
        .sort((a, b) => {
          // Ordenar: vencidos primeiro, depois por data de vencimento
          const hoje = new Date();
          const aVencido = a.dataVencimento < hoje;
          const bVencido = b.dataVencimento < hoje;
          
          if (aVencido && !bVencido) return -1;
          if (!aVencido && bVencido) return 1;
          
          return a.dataVencimento.getTime() - b.dataVencimento.getTime();
        })
        .slice(0, 10)
        .map(async (emprestimo) => {
          if (emprestimo.clienteId) {
            try {
              const cliente = await getCliente(emprestimo.clienteId);
              return { ...emprestimo, cliente: cliente || undefined };
            } catch (error) {
              console.warn('Erro ao carregar cliente do empréstimo:', error);
              return { ...emprestimo, cliente: undefined };
            }
          }
          return emprestimo;
        })
    );
    
    const valorJurosTotal = emprestimos.reduce((sum, e) => sum + e.jurosAcumulado, 0);
    const valorTotalEmprestado = emprestimos.reduce((sum, e) => sum + e.principal, 0);
    const saldoTotalEmprestado = emprestimos.reduce((sum, e) => sum + e.saldoDevedor, 0);
    const totalAReceber = emprestimos
      .filter(e => e.status !== 'quitado')
      .reduce((sum, e) => sum + e.saldoDevedor + e.jurosAcumulado, 0);
    
    // Calcular juros do mês (simplificado)
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const jurosDoMes = emprestimos
      .filter(e => e.dataInicio >= inicioMes)
      .reduce((sum, e) => sum + (e.jurosAcumulado / 30), 0);
    
    // Calcular juros do dia (simplificado)
    const jurosDoDia = emprestimos
      .filter(e => e.status === 'ativo')
      .reduce((sum, e) => sum + (e.taxaJuros / 365) * e.saldoDevedor, 0);
    
    const totalEmprestimos = emprestimos.length;
    const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length;
    const emprestimosAtrasados = emprestimos.filter(e => e.status === 'atrasado').length;
    const emprestimosQuitados = emprestimos.filter(e => e.status === 'quitado').length;
    
    return {
      proximosVencimentos: proximosVencimentosComClientes,
      valorJurosTotal,
      valorTotalEmprestado,
      saldoTotalEmprestado,
      totalAReceber,
      jurosDoMes,
      jurosDoDia,
      totalEmprestimos,
      emprestimosAtivos,
      emprestimosAtrasados,
      emprestimosQuitados,
    };
  } catch (error) {
    console.error('Erro ao buscar KPIs do dashboard:', error);
    return {
      proximosVencimentos: [],
      valorJurosTotal: 0,
      valorTotalEmprestado: 0,
      saldoTotalEmprestado: 0,
      totalAReceber: 0,
      jurosDoMes: 0,
      jurosDoDia: 0,
      totalEmprestimos: 0,
      emprestimosAtivos: 0,
      emprestimosAtrasados: 0,
      emprestimosQuitados: 0,
    };
  }
};
