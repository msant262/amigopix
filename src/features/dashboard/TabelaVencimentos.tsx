import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
// import { Emprestimo } from '@/types';
import { getEmprestimos, getPagamentos } from '@/lib/firebase/firestore';
import { calcularParcelasEmprestimo } from '@/lib/calculations';

export const TabelaVencimentos: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proximos');

  // Buscar todos os empréstimos para análise de vencimentos
  const { data: emprestimosData, isLoading: emprestimosLoading } = useQuery({
    queryKey: ['emprestimos-vencimentos'],
    queryFn: () => getEmprestimos({}, 100),
  });

  // Buscar todos os pagamentos
  const { data: pagamentosData, isLoading: pagamentosLoading } = useQuery({
    queryKey: ['pagamentos-vencimentos'],
    queryFn: async () => {
      const emprestimos = emprestimosData?.emprestimos || [];
      const pagamentosPromises = emprestimos.map(emp => getPagamentos(emp.id));
      const pagamentosResults = await Promise.all(pagamentosPromises);
      
      // Flatten pagamentos array
      return pagamentosResults.flat();
    },
    enabled: !!emprestimosData,
  });

  const emprestimos = emprestimosData?.emprestimos || [];
  const pagamentos = pagamentosData || [];
  const isLoading = emprestimosLoading || pagamentosLoading;

  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Empréstimos por Vencimento</span>
          </CardTitle>
          <CardDescription>
            Carregando dados de vencimentos...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getVencimentoStatus = (dataVencimento: Date) => {
    const hoje = new Date();
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'vencido', color: 'destructive', text: 'Vencido', icon: X };
    } else if (diffDays === 0) {
      return { status: 'hoje', color: 'warning', text: 'Vence hoje', icon: Clock };
    } else if (diffDays <= 7) {
      return { status: 'urgente', color: 'warning', text: `${diffDays} dias`, icon: AlertTriangle };
    } else {
      return { status: 'normal', color: 'default', text: `${diffDays} dias`, icon: CheckCircle };
    }
  };

  const handleViewEmprestimo = (emprestimoId: string) => {
    navigate(`/emprestimos/${emprestimoId}`);
  };

  // Calcular todas as parcelas de todos os empréstimos
  const todasParcelas = emprestimos.flatMap(emprestimo => {
    const pagamentosEmprestimo = pagamentos.filter(p => p.emprestimoId === emprestimo.id);
    return calcularParcelasEmprestimo(emprestimo, pagamentosEmprestimo);
  });

  // Separar parcelas por status e ordenar por data crescente
  const parcelasVencidas = todasParcelas
    .filter(parcela => parcela.status === 'vencido')
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime()); // Ordem crescente

  const parcelasProximas = todasParcelas
    .filter(parcela => {
      const hoje = new Date();
      const diffTime = parcela.dataVencimento.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return parcela.status === 'pendente' && diffDays >= 0 && diffDays <= 30;
    })
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime()); // Ordem crescente

  const renderParcelasList = (parcelasList: any[], emptyMessage: string, emptyIcon: React.ComponentType<any>) => {
    if (parcelasList.length === 0) {
      const EmptyIcon = emptyIcon;
      return (
        <div className="text-center py-8">
          <EmptyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {parcelasList.map((parcela) => {
          const vencimentoInfo = getVencimentoStatus(parcela.dataVencimento);
          const IconComponent = vencimentoInfo.icon;
          
          // Buscar o empréstimo correspondente
          const emprestimo = emprestimos.find(emp => {
            const pagamentosEmp = pagamentos.filter(p => p.emprestimoId === emp.id);
            const parcelasEmp = calcularParcelasEmprestimo(emp, pagamentosEmp);
            return parcelasEmp.some(p => p.numero === parcela.numero && p.dataVencimento.getTime() === parcela.dataVencimento.getTime());
          });
          
          return (
            <div
              key={`${emprestimo?.id}-${parcela.numero}`}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate">
                    {emprestimo?.cliente?.nomeCompleto || 'Cliente não encontrado'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Parcela {parcela.numero}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(parcela.dataVencimento)}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(parcela.valorTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={vencimentoInfo.color as any} className="flex items-center space-x-1">
                  <IconComponent className="h-3 w-3" />
                  <span>{vencimentoInfo.text}</span>
                </Badge>
                
                {emprestimo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewEmprestimo(emprestimo.id)}
                    className="touch-target"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Empréstimos por Vencimento</span>
        </CardTitle>
        <CardDescription>
          Acompanhe empréstimos vencidos e próximos do vencimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vencidos" className="touch-target">
            Vencidos ({parcelasVencidas.length})
          </TabsTrigger>
          <TabsTrigger value="proximos" className="touch-target">
            Próximos ({parcelasProximas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vencidos" className="mt-4">
          {renderParcelasList(
            parcelasVencidas,
            'Nenhum pagamento vencido',
            X
          )}
        </TabsContent>

        <TabsContent value="proximos" className="mt-4">
          {renderParcelasList(
            parcelasProximas,
            'Nenhum pagamento próximo',
            Clock
          )}
        </TabsContent>
        </Tabs>

        {(parcelasVencidas.length > 0 || parcelasProximas.length > 0) && (
          <div className="text-center pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/emprestimos')}
              className="touch-target"
            >
              Ver todos os empréstimos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
