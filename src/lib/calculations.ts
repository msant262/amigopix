import { Emprestimo, Pagamento } from '@/types';

export interface ParcelaCalculada {
  numero: number;
  dataVencimento: Date;
  valorPrincipal: number;
  valorJuros: number;
  valorTotal: number;
  status: 'pendente' | 'pago' | 'vencido';
  dataPagamento?: Date;
  valorPago?: number;
}

/**
 * Calcula as parcelas de um empréstimo baseado nos dados existentes
 */
export const calcularParcelasEmprestimo = (
  emprestimo: Emprestimo,
  pagamentos: Pagamento[] = []
): ParcelaCalculada[] => {
  const parcelas: ParcelaCalculada[] = [];
  
  // Se não há número de parcelas definido, tratar como empréstimo único
  if (!emprestimo.parcelas || emprestimo.parcelas <= 1) {
    const hoje = new Date();
    const status = emprestimo.dataVencimento < hoje ? 'vencido' : 'pendente';
    
    parcelas.push({
      numero: 1,
      dataVencimento: emprestimo.dataVencimento,
      valorPrincipal: emprestimo.principal,
      valorJuros: emprestimo.jurosAcumulado,
      valorTotal: emprestimo.principal + emprestimo.jurosAcumulado,
      status: emprestimo.status === 'quitado' ? 'pago' : status,
      dataPagamento: emprestimo.status === 'quitado' ? emprestimo.dataVencimento : undefined,
      valorPago: emprestimo.status === 'quitado' ? emprestimo.principal + emprestimo.jurosAcumulado : undefined,
    });
    
    return parcelas;
  }
  
  // Calcular parcelas mensais
  const valorParcela = emprestimo.principal / emprestimo.parcelas;
  const valorJurosParcela = emprestimo.jurosAcumulado / emprestimo.parcelas;
  
  for (let i = 1; i <= emprestimo.parcelas; i++) {
    const dataVencimento = new Date(emprestimo.dataInicio);
    dataVencimento.setMonth(dataVencimento.getMonth() + i);
    
    const hoje = new Date();
    let status: 'pendente' | 'pago' | 'vencido' = 'pendente';
    
    if (dataVencimento < hoje) {
      status = 'vencido';
    }
    
    // Verificar se há pagamentos para esta parcela
    const pagamentoParcela = pagamentos.find(p => {
      const mesPagamento = p.data.getMonth();
      const anoPagamento = p.data.getFullYear();
      const mesVencimento = dataVencimento.getMonth();
      const anoVencimento = dataVencimento.getFullYear();
      
      return mesPagamento === mesVencimento && anoPagamento === anoVencimento;
    });
    
    if (pagamentoParcela) {
      status = 'pago';
    }
    
    parcelas.push({
      numero: i,
      dataVencimento,
      valorPrincipal: valorParcela,
      valorJuros: valorJurosParcela,
      valorTotal: valorParcela + valorJurosParcela,
      status,
      dataPagamento: pagamentoParcela?.data,
      valorPago: pagamentoParcela?.valor,
    });
  }
  
  return parcelas;
};

/**
 * Calcula estatísticas de parcelas
 */
export const calcularEstatisticasParcelas = (parcelas: ParcelaCalculada[]) => {
  const total = parcelas.length;
  const pagas = parcelas.filter(p => p.status === 'pago').length;
  const vencidas = parcelas.filter(p => p.status === 'vencido').length;
  const pendentes = parcelas.filter(p => p.status === 'pendente').length;
  
  const valorTotal = parcelas.reduce((sum, p) => sum + p.valorTotal, 0);
  const valorPago = parcelas.reduce((sum, p) => sum + (p.valorPago || 0), 0);
  const valorPendente = parcelas.reduce((sum, p) => 
    sum + (p.status !== 'pago' ? p.valorTotal : 0), 0
  );
  
  return {
    total,
    pagas,
    vencidas,
    pendentes,
    valorTotal,
    valorPago,
    valorPendente,
    percentualPago: total > 0 ? (pagas / total) * 100 : 0,
  };
};

/**
 * Gera parcelas futuras baseadas no empréstimo
 */
export const gerarParcelasFuturas = (emprestimo: Emprestimo): ParcelaCalculada[] => {
  const parcelas: ParcelaCalculada[] = [];
  const hoje = new Date();
  
  if (!emprestimo.parcelas || emprestimo.parcelas <= 1) {
    return parcelas;
  }
  
  const valorParcela = emprestimo.principal / emprestimo.parcelas;
  const valorJurosParcela = emprestimo.jurosAcumulado / emprestimo.parcelas;
  
  for (let i = 1; i <= emprestimo.parcelas; i++) {
    const dataVencimento = new Date(emprestimo.dataInicio);
    dataVencimento.setMonth(dataVencimento.getMonth() + i);
    
    // Só incluir parcelas futuras
    if (dataVencimento > hoje) {
      parcelas.push({
        numero: i,
        dataVencimento,
        valorPrincipal: valorParcela,
        valorJuros: valorJurosParcela,
        valorTotal: valorParcela + valorJurosParcela,
        status: 'pendente',
      });
    }
  }
  
  return parcelas;
};
