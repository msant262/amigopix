import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/modern-card';
import { Loading } from '@/components/ui/loading';
import { TimeRangeFilter, TimeRange } from '@/components/ui/time-range-filter';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Download,
  Calendar,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { getClientes, getEmprestimos, getPagamentos } from '@/lib/firebase/firestore';
import { calcularParcelasEmprestimo } from '@/lib/calculations';

export const RelatoriosPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Buscar clientes
  const { data: clientesData, isLoading: clientesLoading } = useQuery({
    queryKey: ['clientes-relatorios'],
    queryFn: () => getClientes({}, 100),
  });

  // Buscar empréstimos
  const { data: emprestimosData, isLoading: emprestimosLoading } = useQuery({
    queryKey: ['emprestimos-relatorios', timeRange],
    queryFn: () => getEmprestimos({}, 100),
  });

  // Buscar pagamentos para calcular total recebido
  const { data: pagamentosData, isLoading: pagamentosLoading } = useQuery({
    queryKey: ['pagamentos-relatorios'],
    queryFn: async () => {
      const emprestimos = emprestimosData?.emprestimos || [];
      const pagamentosPromises = emprestimos.map(emp => getPagamentos(emp.id));
      const pagamentosResults = await Promise.all(pagamentosPromises);
      return pagamentosResults.flat();
    },
    enabled: !!emprestimosData,
  });

  if (clientesLoading || emprestimosLoading || pagamentosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Carregando relatórios..." />
      </div>
    );
  }

  const clientes = clientesData?.clientes || [];
  const emprestimos = emprestimosData?.emprestimos || [];
  const pagamentos = pagamentosData || [];


  // Preparar dados para gráfico "Clientes x Empréstimos" - TODOS os empréstimos
  const clientesEmprestimosData = clientes.map(cliente => {
    const emprestimosCliente = emprestimos.filter(emp => emp.clienteId === cliente.id); // Usar todos os empréstimos
    const valorTotal = emprestimosCliente.reduce((sum, emp) => sum + emp.principal, 0);
    
    return {
      nome: cliente.nomeCompleto.split(' ')[0], // Primeiro nome apenas
      valor: valorTotal,
      emprestimos: emprestimosCliente.length,
    };
  }).filter(item => item.valor > 0).sort((a, b) => b.valor - a.valor).slice(0, 10);

  // Preparar dados para gráfico "Clientes x Recebimentos" - TODOS os clientes e parcelas pagas
  const clientesRecebimentosData = clientes.map(cliente => {
    const emprestimosCliente = emprestimos.filter(emp => emp.clienteId === cliente.id);
    
    // Buscar todos os pagamentos dos empréstimos deste cliente
    const pagamentosCliente = pagamentos.filter(pag => 
      emprestimosCliente.some(emp => emp.id === pag.emprestimoId)
    );
    
    const valorRecebido = pagamentosCliente.reduce((sum, pag) => sum + pag.valor, 0);
    
    return {
      nome: cliente.nomeCompleto.split(' ')[0], // Primeiro nome apenas
      valor: valorRecebido,
      recebimentos: pagamentosCliente.length,
    };
  }).filter(item => item.valor > 0).sort((a, b) => b.valor - a.valor).slice(0, 10);

  // Dados para gráfico de distribuição por status - TODOS os empréstimos
  const statusData = [
    {
      name: 'Ativos',
      value: emprestimos.filter(e => e.status === 'ativo').length,
      color: '#22c55e',
    },
    {
      name: 'Atrasados',
      value: emprestimos.filter(e => e.status === 'atrasado').length,
      color: '#ef4444',
    },
    {
      name: 'Quitados',
      value: emprestimos.filter(e => e.status === 'quitado').length,
      color: '#f97316',
    },
  ];

  // Calcular métricas gerais - TODOS os empréstimos
  const totalEmprestados = emprestimos.reduce((sum, e) => sum + e.principal, 0);
  
  // Total recebido = soma de todos os pagamentos (principal + juros)
  const totalRecebidos = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  
  // Total pendente = saldo devedor + juros acumulados dos empréstimos não quitados
  const totalPendente = emprestimos
    .filter(e => e.status !== 'quitado')
    .reduce((sum, e) => sum + e.saldoDevedor + e.jurosAcumulado, 0);

  // Dados para gráfico de projeção baseado em datas
  const projecaoData: Array<{
    mes: string;
    data: number;
    recebido: number;
    aReceber: number;
    atrasado: number;
    isProjecao: boolean;
  }> = [];

  // Encontrar a primeira data cadastrada (entre empréstimos e pagamentos)
  const todasDatas: Date[] = [];
  
  // Extrair datas dos empréstimos
  emprestimos.forEach(emp => {
    if (emp.dataInicio) {
      const data = new Date(emp.dataInicio);
      if (!isNaN(data.getTime())) {
        todasDatas.push(data);
      }
    }
  });
  
  // Extrair datas dos pagamentos
  pagamentos.forEach(pag => {
    if (pag.data) {
      const data = new Date(pag.data);
      if (!isNaN(data.getTime())) {
        todasDatas.push(data);
      }
    }
  });

  // Debug: Log das datas encontradas
  console.log('Datas encontradas:', todasDatas.map(d => d.toLocaleDateString('pt-BR')));

  let primeiraData;
  if (todasDatas.length === 0) {
    // Se não há dados, usar último ano
    const hoje = new Date();
    primeiraData = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
    console.log('Nenhuma data encontrada, usando:', primeiraData.toLocaleDateString('pt-BR'));
  } else {
    primeiraData = new Date(Math.min(...todasDatas.map(d => d.getTime())));
    console.log('Primeira data encontrada:', primeiraData.toLocaleDateString('pt-BR'));
  }

  const hoje = new Date();

  // Calcular a última data de vencimento de parcelas futuras
  let ultimaDataVencimento = new Date(hoje);
  emprestimos.forEach(emp => {
    if (emp.status !== 'quitado' && emp.parcelas) {
      const pagamentosDoEmprestimo = pagamentos.filter(p => p.emprestimoId === emp.id);
      const parcelas = calcularParcelasEmprestimo(emp, pagamentosDoEmprestimo);
      
      parcelas.forEach(parcela => {
        if (parcela.status === 'pendente') {
          const dataVencimento = new Date(parcela.dataVencimento);
          if (dataVencimento > ultimaDataVencimento) {
            ultimaDataVencimento = dataVencimento;
          }
        }
      });
    }
  });

  // Adicionar 3 meses extras para projeção
  ultimaDataVencimento.setMonth(ultimaDataVencimento.getMonth() + 3);

  console.log('Última data de vencimento encontrada:', ultimaDataVencimento.toLocaleDateString('pt-BR'));

  // Gerar dados mês a mês desde a primeira data até a última projeção
  const currentDate = new Date(primeiraData.getFullYear(), primeiraData.getMonth(), 1);
  
  while (currentDate <= ultimaDataVencimento) {
    const inicioMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const fimMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999);

    const isMesFuturo = inicioMes > hoje;
    
    // RECEBIDO: Pagamentos realizados especificamente neste mês
    let recebidoMes = 0;
    if (!isMesFuturo) {
      const pagamentosMes = pagamentos.filter(pag => {
        const dataPag = new Date(pag.data);
        return dataPag >= inicioMes && dataPag <= fimMes;
      });
      recebidoMes = pagamentosMes.reduce((sum, pag) => sum + pag.valor, 0);
    }

    // A RECEBER e ATRASADO: Parcelas que vencem especificamente neste mês
    let aReceberMes = 0;
    let atrasadoMes = 0;

    emprestimos.forEach(emp => {
      if (emp.status !== 'quitado') {
        const pagamentosDoEmprestimo = pagamentos.filter(p => p.emprestimoId === emp.id);
        const parcelas = calcularParcelasEmprestimo(emp, pagamentosDoEmprestimo);

        parcelas.forEach(parcela => {
          const dataVencimento = new Date(parcela.dataVencimento);
          
          // Verificar se a parcela vence neste mês
          if (dataVencimento.getFullYear() === inicioMes.getFullYear() && 
              dataVencimento.getMonth() === inicioMes.getMonth()) {
            
            if (parcela.status === 'pendente') {
              // Parcela futura que vence neste mês
              aReceberMes += parcela.valorTotal;
            } else if (parcela.status === 'vencido' && !isMesFuturo) {
              // Parcela atrasada que venceu neste mês (apenas para meses passados)
              atrasadoMes += parcela.valorTotal;
            }
          }
        });
      }
    });

    projecaoData.push({
      mes: inicioMes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      data: inicioMes.getTime(),
      recebido: recebidoMes,
      aReceber: aReceberMes,
      atrasado: atrasadoMes,
      isProjecao: isMesFuturo,
    });

    // Avançar para o próximo mês
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const formatTooltipValue = (value: number, name: string) => {
    const formattedValue = formatCurrency(value);
    
    switch (name) {
      case 'valor':
        return [formattedValue, 'Valor'];
      case 'emprestimos':
        return [value.toString(), 'Empréstimos'];
      case 'recebimentos':
        return [value.toString(), 'Recebimentos'];
      default:
        return [formattedValue, name];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada de empréstimos e clientes
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          <Button variant="outline" className="touch-target">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard
          title="Total Emprestado"
          description="Valor total emprestado (histórico completo)"
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.1}
        >
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalEmprestados)}
          </div>
        </ModernCard>

        <ModernCard
          title="Total Recebido"
          description="Valor total recebido (histórico completo)"
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.2}
        >
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(totalRecebidos)}
          </div>
        </ModernCard>

        <ModernCard
          title="Total Pendente"
          description="Valor ainda a receber (histórico completo)"
          icon={<Calendar className="h-5 w-5" />}
          delay={0.3}
        >
          <div className="text-2xl font-bold text-secondary">
            {formatCurrency(totalPendente)}
          </div>
        </ModernCard>
      </div>

      {/* Gráfico Clientes x Empréstimos - Linha inteira */}
      <ModernCard
        title="Clientes x Empréstimos"
        description="Valor total emprestado por cliente"
        icon={<BarChart3 className="h-5 w-5" />}
        delay={0.4}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientesEmprestimosData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="nome" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar 
                dataKey="valor" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ModernCard>

      {/* Gráficos - Clientes x Recebimentos e Distribuição por Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Clientes x Recebimentos */}
        <ModernCard
          title="Clientes x Recebimentos"
          description="Valor total recebido por cliente"
          icon={<Users className="h-5 w-5" />}
          delay={0.5}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientesRecebimentosData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="nome" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}k`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar 
                  dataKey="valor" 
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        {/* Distribuição por Status */}
        <ModernCard
          title="Distribuição por Status"
          description="Empréstimos por status"
          icon={<PieChart className="h-5 w-5" />}
          delay={0.6}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      </div>

      {/* Gráfico de Projeção */}
      <ModernCard
        title="Projeção Temporal"
        description="Evolução mensal dos valores recebidos, a receber e vencidos (incluindo projeções futuras)"
        icon={<TrendingUp className="h-5 w-5" />}
        delay={0.7}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projecaoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="mes" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="recebido" 
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, fill: '#22c55e' }}
                activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                name="Recebido"
              />
              <Line 
                type="monotone" 
                dataKey="aReceber" 
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="A Receber"
              />
              <Line 
                type="monotone" 
                dataKey="atrasado" 
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                name="Atrasado"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModernCard>

      {/* Relatório Detalhado */}
      <ModernCard
        title="Relatório Detalhado"
        description="Análise completa e dinâmica dos dados do sistema"
        icon={<FileText className="h-5 w-5" />}
        delay={0.8}
      >
        <div className="space-y-6">
          {/* Seção 1: Resumo Executivo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg border-b border-border pb-2">📊 Resumo Executivo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Clientes:</span>
                  <span className="font-medium">{clientes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Empréstimos:</span>
                  <span className="font-medium">{emprestimos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Pagamentos:</span>
                  <span className="font-medium">{pagamentos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período Analisado:</span>
                  <span className="font-medium">
                    {timeRange === 'all' ? 'Histórico Completo' : 
                     timeRange === '1d' ? 'Último Dia' :
                     timeRange === '7d' ? 'Últimos 7 Dias' :
                     timeRange === '30d' ? 'Últimos 30 Dias' : 'Últimos 90 Dias'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg border-b border-border pb-2">💰 Performance Financeira</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total Emprestado:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalEmprestados)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total Recebido:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(totalRecebidos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Pendente:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(totalPendente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Recuperação:</span>
                  <span className="font-medium">
                    {totalEmprestados > 0 ? ((totalRecebidos / totalEmprestados) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg border-b border-border pb-2">📈 Indicadores de Risco</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empréstimos Ativos:</span>
                  <span className="font-medium text-green-600">{statusData[0].value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empréstimos Atrasados:</span>
                  <span className="font-medium text-red-600">{statusData[1].value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empréstimos Quitados:</span>
                  <span className="font-medium text-blue-600">{statusData[2].value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Inadimplência:</span>
                  <span className="font-medium">
                    {emprestimos.length > 0 ? ((statusData[1].value / emprestimos.length) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Análise de Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg border-b border-border pb-2">👥 Análise de Clientes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Médio por Cliente:</span>
                  <span className="font-medium">
                    {clientes.length > 0 ? formatCurrency(totalEmprestados / clientes.length) : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empréstimos por Cliente:</span>
                  <span className="font-medium">
                    {clientes.length > 0 ? (emprestimos.length / clientes.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamentos por Cliente:</span>
                  <span className="font-medium">
                    {clientes.length > 0 ? (pagamentos.length / clientes.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Médio:</span>
                  <span className="font-medium">
                    {pagamentos.length > 0 ? formatCurrency(totalRecebidos / pagamentos.length) : 'R$ 0,00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg border-b border-border pb-2">📅 Análise Temporal</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primeira Operação:</span>
                  <span className="font-medium">
                    {todasDatas.length > 0 ? Math.min(...todasDatas.map(d => d.getTime())) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Operação:</span>
                  <span className="font-medium">
                    {todasDatas.length > 0 ? new Date(Math.max(...todasDatas.map(d => d.getTime()))).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período Ativo:</span>
                  <span className="font-medium">
                    {todasDatas.length > 0 ? 
                      Math.ceil((Math.max(...todasDatas.map(d => d.getTime())) - Math.min(...todasDatas.map(d => d.getTime()))) / (1000 * 60 * 60 * 24 * 30)) + ' meses' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Média Mensal:</span>
                  <span className="font-medium">
                    {projecaoData.length > 0 ? formatCurrency(totalEmprestados / projecaoData.length) : 'R$ 0,00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Projeções e Tendências */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg border-b border-border pb-2">🔮 Projeções e Tendências</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium text-green-600">Recebimentos Futuros</h5>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Próximos 3 meses: {formatCurrency(
                    projecaoData
                      .filter(p => p.isProjecao)
                      .slice(0, 3)
                      .reduce((sum, p) => sum + p.aReceber, 0)
                  )}</p>
                  <p>• Próximos 6 meses: {formatCurrency(
                    projecaoData
                      .filter(p => p.isProjecao)
                      .slice(0, 6)
                      .reduce((sum, p) => sum + p.aReceber, 0)
                  )}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-blue-600">Performance Esperada</h5>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Taxa de Recuperação Projetada: {totalEmprestados > 0 ? 
                    (((totalRecebidos + projecaoData.filter(p => p.isProjecao).reduce((sum, p) => sum + p.aReceber, 0)) / totalEmprestados) * 100).toFixed(1) : '0'}%</p>
                  <p>• ROI Estimado: {totalEmprestados > 0 ? 
                    (((totalRecebidos - totalEmprestados) / totalEmprestados) * 100).toFixed(1) : '0'}%</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-orange-600">Alertas e Riscos</h5>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Valor em Risco: {formatCurrency(totalPendente)}</p>
                  <p>• % do Portfolio em Risco: {totalEmprestados > 0 ? 
                    ((totalPendente / totalEmprestados) * 100).toFixed(1) : '0'}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};
