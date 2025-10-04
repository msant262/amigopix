// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'administrador' | 'cliente';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  documento?: string;
  role: 'administrador' | 'cliente';
  createdAt: Date;
  updatedAt: Date;
}

// Cliente types
export interface Cliente {
  id: string;
  nomeCompleto: string;
  documento: string;
  rg?: string;
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
  dadosBancarios?: {
    chavePix?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
  };
  fotoPerfil?: string;
  documentos?: string[]; // URLs dos documentos no Firebase Storage
  createdAt: Date;
  updatedAt: Date;
}

// Empréstimo types
export type StatusEmprestimo = 'ativo' | 'atrasado' | 'quitado';
export type TipoJuros = 'simples' | 'composto';
export type PeriodicidadeJuros = 'mensal' | 'anual';

export interface Emprestimo {
  id: string;
  clienteId: string;
  cliente?: Cliente; // Para joins
  principal: number;
  taxaJuros: number;
  periodicidadeJuros: PeriodicidadeJuros;
  tipoJuros: TipoJuros;
  dataInicio: Date;
  dataVencimento: Date;
  parcelas?: number;
  status: StatusEmprestimo;
  saldoDevedor: number;
  jurosAcumulado: number;
  valorTotal: number;
  ultimaAtualizacao: Date;
  observacoes?: string;
}

// Pagamento types
export type MetodoPagamento = 'dinheiro' | 'pix' | 'transferencia' | 'cheque' | 'cartao';

export interface Pagamento {
  id: string;
  emprestimoId: string;
  data: Date;
  valor: number;
  principalPago: number;
  jurosPago: number;
  metodo: MetodoPagamento;
  observacoes?: string;
}

// Conteúdo types
export type TipoConteudo = 'video' | 'texto' | 'imagem';

export interface Conteudo {
  id: string;
  tipo: TipoConteudo;
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

// Dashboard KPI types
export interface DashboardKPIs {
  proximosVencimentos: Emprestimo[];
  valorJurosTotal: number;
  valorTotalEmprestado: number;
  saldoTotalEmprestado: number;
  totalAReceber: number;
  jurosDoMes: number;
  jurosDoDia: number;
  totalEmprestimos: number;
  emprestimosAtivos: number;
  emprestimosAtrasados: number;
  emprestimosQuitados: number;
}

export interface GraficoSerieTemporal {
  data: string;
  jurosDia: number;
  jurosMes: number;
  totalAReceber: number;
}

export interface GraficoDistribuicao {
  status: StatusEmprestimo;
  quantidade: number;
  valor: number;
  porcentagem: number;
}

// Form types
export interface EmprestimoFormData {
  clienteId: string;
  principal: number;
  taxaJuros: number;
  periodicidadeJuros: PeriodicidadeJuros;
  tipoJuros: TipoJuros;
  dataInicio: Date;
  dataVencimento: Date;
  parcelas?: number;
  observacoes?: string;
}

export interface ClienteFormData {
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
  fotoPerfil?: string;
  documentos?: string[];
}

export interface ConteudoFormData {
  tipo: TipoConteudo;
  titulo: string;
  descricao: string;
  urlStorageOuEmbed: string;
  visibilidade: 'publico' | 'administradores' | 'clientes';
  tags?: string[];
  ordem?: number;
}

// Auth types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, role?: 'administrador' | 'cliente') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter types
export interface EmprestimoFilters {
  clienteId?: string;
  status?: StatusEmprestimo;
  dataInicio?: Date;
  dataFim?: Date;
  valorMinimo?: number;
  valorMaximo?: number;
  busca?: string;
}

export interface ClienteFilters {
  busca?: string;
  documento?: string;
  cidade?: string;
  estado?: string;
}

export interface ConteudoFilters {
  tipo?: TipoConteudo;
  visibilidade?: 'publico' | 'administradores' | 'clientes';
  busca?: string;
  tags?: string[];
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  roles: ('administrador' | 'cliente')[];
  badge?: number;
}

// Toast types
export interface ToastOptions {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
