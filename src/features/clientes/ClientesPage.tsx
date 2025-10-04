import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { OriginButton, OriginCard, OriginCardHeader, OriginCardTitle, OriginCardContent, OriginInput, OriginBadge } from '@/components/origin';
import { useQuery } from '@tanstack/react-query';
import { formatDate, formatCPF, formatPhone, formatCurrency } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Edit, 
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { ClienteFilters } from '@/types';
import { getClientes, getEmprestimos, getPagamentos } from '@/lib/firebase/firestore';
import { ClienteForm } from './ClienteForm';
import { ClienteDetails } from './ClienteDetails';

export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ClienteFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [documentoInput, setDocumentoInput] = useState('');
  const [cidadeInput, setCidadeInput] = useState('');
  const [clientesComStatus, setClientesComStatus] = useState<any[]>([]);
  const [clientesComDadosFinanceiros, setClientesComDadosFinanceiros] = useState<any[]>([]);

  const { data: clientesData, isLoading, error } = useQuery({
    queryKey: ['clientes', filters],
    queryFn: () => getClientes(filters, 50),
  });

  // Debounce para documento
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        documento: documentoInput || undefined,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [documentoInput]);

  // Debounce para cidade
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        cidade: cidadeInput || undefined,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [cidadeInput]);

  // Calcular status de pagamento para cada cliente
  useEffect(() => {
    const calcularStatusClientes = async () => {
      if (!clientesData?.clientes) return;
      
      const clientesComStatusCalculado = await Promise.all(
        clientesData.clientes.map(async (cliente) => {
          try {
            const emprestimosData = await getEmprestimos({ clienteId: cliente.id }, 100);
            const emprestimos = emprestimosData.emprestimos;
            
            // Determinar status baseado nos empréstimos
            const temAtrasados = emprestimos.some(emp => emp.status === 'atrasado');
            const temAtivos = emprestimos.some(emp => emp.status === 'ativo');
            
            let statusPagamento = 'sem_emprestimos';
            if (temAtrasados) {
              statusPagamento = 'atrasado';
            } else if (temAtivos) {
              statusPagamento = 'em_dia';
            }
            
            return {
              ...cliente,
              statusPagamento
            };
          } catch (error) {
            return {
              ...cliente,
              statusPagamento: 'sem_emprestimos'
            };
          }
        })
      );
      
      setClientesComStatus(clientesComStatusCalculado);
    };
    
    calcularStatusClientes();
  }, [clientesData?.clientes]);

  // Calcular dados financeiros dos clientes
  useEffect(() => {
    const calcularDadosFinanceiros = async () => {
      if (!clientesData?.clientes.length) return;

      const clientesComFinanceiros = await Promise.all(
        clientesData.clientes.map(async (cliente) => {
          try {
            // Buscar empréstimos do cliente
            const emprestimosData = await getEmprestimos({ clienteId: cliente.id }, 100);
            const emprestimos = emprestimosData.emprestimos;
            
            // Calcular total emprestado
            const totalEmprestado = emprestimos.reduce((sum, emp) => sum + emp.principal, 0);
            
            // Buscar pagamentos de todos os empréstimos
            const pagamentosPromises = emprestimos.map(emp => getPagamentos(emp.id));
            const pagamentosResults = await Promise.all(pagamentosPromises);
            const todosPagamentos = pagamentosResults.flat();
            
            // Calcular total pago
            const totalPago = todosPagamentos.reduce((sum, pag) => sum + pag.valor, 0);
            
            return {
              ...cliente,
              totalEmprestado,
              totalPago
            };
          } catch (error) {
            console.warn('Erro ao calcular dados financeiros para cliente:', cliente.id, error);
            return {
              ...cliente,
              totalEmprestado: 0,
              totalPago: 0
            };
          }
        })
      );
      
      setClientesComDadosFinanceiros(clientesComFinanceiros);
    };

    calcularDadosFinanceiros();
  }, [clientesData?.clientes]);


  // Combinar dados de status com dados financeiros
  const clientesCompletos = clientesComStatus.map(clienteStatus => {
    const dadosFinanceiros = clientesComDadosFinanceiros.find(cf => cf.id === clienteStatus.id);
    return {
      ...clienteStatus,
      totalEmprestado: dadosFinanceiros?.totalEmprestado || 0,
      totalPago: dadosFinanceiros?.totalPago || 0
    };
  });

  const filteredClientes = clientesCompletos.filter(cliente => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nomeCompleto.toLowerCase().includes(searchLower) ||
      cliente.documento.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.endereco.cidade.toLowerCase().includes(searchLower)
    );
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar clientes</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Gerencie todos os clientes do sistema
                </p>
              </div>
              
              <OriginButton
                onClick={() => navigate('/clientes/novo')}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </OriginButton>
            </div>
          </div>

          {/* Filters */}
          <OriginCard variant="elevated" padding="lg" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="text-lg">Filtros</OriginCardTitle>
            </OriginCardHeader>
            <OriginCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <OriginInput
                    label="Buscar"
                    placeholder="Nome, documento, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    variant="filled"
                  />
                </div>

                {/* Document Filter */}
                <div>
                  <OriginInput
                    label="Documento"
                    placeholder="CPF ou CNPJ"
                    value={documentoInput}
                    onChange={(e) => setDocumentoInput(e.target.value)}
                    variant="filled"
                  />
                </div>

                {/* City Filter */}
                <div>
                  <OriginInput
                    label="Cidade"
                    placeholder="Nome da cidade"
                    value={cidadeInput}
                    onChange={(e) => setCidadeInput(e.target.value)}
                    variant="filled"
                  />
                </div>
              </div>
            </OriginCardContent>
          </OriginCard>

          {/* Clientes List */}
          <OriginCard variant="elevated" padding="lg" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="flex items-center justify-between text-lg">
                <span>Lista de Clientes</span>
                <OriginBadge variant="secondary" size="sm">
                  {filteredClientes.length} clientes
                </OriginBadge>
              </OriginCardTitle>
            </OriginCardHeader>
            <OriginCardContent>
              {filteredClientes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClientes.map((cliente, index) => (
                    <OriginCard
                      key={cliente.id}
                      variant="default"
                      padding="default"
                      hover="lift"
                      delay={index * 0.1}
                      className="cursor-pointer"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {cliente.nomeCompleto.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{cliente.nomeCompleto}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCPF(cliente.documento)}
                            </p>
                            <div className="mt-2">
                              {cliente.statusPagamento === 'atrasado' && (
                                <OriginBadge variant="destructive" size="sm">Atrasado</OriginBadge>
                              )}
                              {cliente.statusPagamento === 'em_dia' && (
                                <OriginBadge variant="success" size="sm">Em Dia</OriginBadge>
                              )}
                              {cliente.statusPagamento === 'sem_emprestimos' && (
                                <OriginBadge variant="secondary" size="sm">Sem Empréstimos</OriginBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-primary-500" />
                            <span className="truncate text-muted-foreground">{cliente.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-primary-500" />
                            <span className="text-muted-foreground">{formatPhone(cliente.telefone)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary-500" />
                            <span className="truncate text-muted-foreground">
                              {cliente.endereco.cidade}, {cliente.endereco.estado}
                            </span>
                          </div>
                          
                          {/* PIX */}
                          {cliente.dadosBancarios?.chavePix && (
                            <div className="flex items-center space-x-2 text-sm">
                              <CreditCard className="h-4 w-4 text-primary-500" />
                              <span className="truncate text-xs text-muted-foreground">
                                PIX: {cliente.dadosBancarios.chavePix}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Financial Data */}
                        <div className="pt-3 border-t border-border/30">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 rounded-lg bg-green-500/10 dark:bg-green-950/10 backdrop-blur-sm border border-green-200/20">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-medium text-green-500">Emprestado</span>
                              </div>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(cliente.totalEmprestado)}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-blue-500/10 dark:bg-blue-950/10 backdrop-blur-sm border border-blue-200/20">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-500">Pago</span>
                              </div>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(cliente.totalPago)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Cadastrado em {formatDate(cliente.createdAt)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <OriginButton
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/clientes/${cliente.id}/editar`);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </OriginButton>
                          </div>
                        </div>
                      </div>
                    </OriginCard>
                  ))}
                </div>
              )}
            </OriginCardContent>
          </OriginCard>
        </div>
      } />
      
      <Route path="/novo" element={<ClienteForm />} />
      <Route path="/:id" element={<ClienteDetails />} />
      <Route path="/:id/editar" element={<ClienteForm />} />
    </Routes>
  );
};
