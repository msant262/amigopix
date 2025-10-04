import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { OriginButton, OriginCard, OriginCardHeader, OriginCardTitle, OriginCardContent } from '@/components/origin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCPF, formatPhone, formatCEP } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  MapPin, 
  CreditCard,
  TrendingUp,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { getCliente, getEmprestimos } from '@/lib/firebase/firestore';

// Função para extrair nome do arquivo da URL
const extractFileName = (url: string): string => {
  try {
    // Remove parâmetros de query (alt=media&token=...)
    const urlWithoutParams = url.split('?')[0];
    
    // Decodifica a URL (remove %2F, %2E, etc.)
    const decodedUrl = decodeURIComponent(urlWithoutParams);
    
    // Extrai o nome do arquivo da URL
    const fileName = decodedUrl.split('/').pop();
    
    // Se não conseguir extrair, usa um nome padrão
    return fileName || 'documento';
  } catch (error) {
    console.warn('Erro ao extrair nome do arquivo:', error);
    return 'documento';
  }
};

// Função para baixar arquivo
const downloadFile = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Cria um link temporário para download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    alert('Erro ao baixar arquivo. Tente novamente.');
  }
};

export const ClienteDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cliente, isLoading, error } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => getCliente(id!),
    enabled: Boolean(id),
  });

  const { data: emprestimosData } = useQuery({
    queryKey: ['emprestimos-cliente', id],
    queryFn: () => getEmprestimos({ clienteId: id }, 100),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Cliente não encontrado</p>
        <OriginButton
          variant="outline"
          onClick={() => navigate('/clientes')}
          className="mt-4 touch-target"
        >
          Voltar para Clientes
        </OriginButton>
      </div>
    );
  }

  const emprestimos = emprestimosData?.emprestimos || [];
  
  const totalEmprestado = emprestimos.reduce((sum, emp) => sum + emp.principal, 0);
  const saldoDevedor = emprestimos.reduce((sum, emp) => sum + emp.saldoDevedor, 0);
  const jurosAcumulados = emprestimos.reduce((sum, emp) => sum + emp.jurosAcumulado, 0);

  const emprestimosAtivos = emprestimos.filter(emp => emp.status === 'ativo').length;
  const emprestimosAtrasados = emprestimos.filter(emp => emp.status === 'atrasado').length;
  const emprestimosQuitados = emprestimos.filter(emp => emp.status === 'quitado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <OriginButton
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clientes')}
            className="backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </OriginButton>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              {cliente.nomeCompleto}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {formatCPF(cliente.documento)}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <OriginButton
            onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </OriginButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <OriginCard variant="default" padding="default" hover="none">
          <OriginCardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emprestimos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Empréstimos</p>
              </div>
            </div>
          </OriginCardContent>
        </OriginCard>

        <OriginCard variant="default" padding="default" hover="none">
          <OriginCardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-accent/10 backdrop-blur-sm border border-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(saldoDevedor)}
                </p>
                <p className="text-sm text-muted-foreground">Saldo Devedor</p>
              </div>
            </div>
          </OriginCardContent>
        </OriginCard>

        <OriginCard variant="default" padding="default" hover="none">
          <OriginCardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-secondary/10 backdrop-blur-sm border border-secondary/20">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(jurosAcumulados)}
                </p>
                <p className="text-sm text-muted-foreground">Juros Acumulados</p>
              </div>
            </div>
          </OriginCardContent>
        </OriginCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/20 backdrop-blur-sm">
          <TabsTrigger 
            value="info" 
            className="touch-target text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            <span className="hidden sm:inline">Informações</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger 
            value="emprestimos" 
            className="touch-target text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            <span className="hidden sm:inline">Empréstimos</span>
            <span className="sm:hidden">Empr.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="resumo" 
            className="touch-target text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            Resumo
          </TabsTrigger>
          <TabsTrigger 
            value="bancarios" 
            className="touch-target text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            <span className="hidden sm:inline">Bancários</span>
            <span className="sm:hidden">Banco</span>
          </TabsTrigger>
          <TabsTrigger 
            value="documentos" 
            className="touch-target text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            <span className="hidden sm:inline">Documentos</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Personal Information */}
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <User className="h-5 w-5 text-primary-500" />                                                       
                  <span>Informações Pessoais</span>
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Nome:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.nomeCompleto}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Documento:</span>
                    <span className="font-medium text-sm sm:text-base">{formatCPF(cliente.documento)}</span>
                  </div>
                  
                  {cliente.rg && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">RG:</span>
                      <span className="font-medium text-sm sm:text-base">{cliente.rg}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Telefone:</span>
                    <span className="font-medium text-sm sm:text-base">{formatPhone(cliente.telefone)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-medium text-sm sm:text-base break-all">{cliente.email}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Cadastrado em:</span>
                    <span className="font-medium text-sm sm:text-base">{formatDate(cliente.createdAt)}</span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>

            {/* Address Information */}
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <MapPin className="h-5 w-5 text-accent-500" />
                  <span>Endereço</span>
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">CEP:</span>
                    <span className="font-medium text-sm sm:text-base">{formatCEP(cliente.endereco.cep)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rua:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.endereco.rua}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Número:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.endereco.numero}</span>
                  </div>
                  
                  {cliente.endereco.complemento && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Complemento:</span>
                      <span className="font-medium text-sm sm:text-base">{cliente.endereco.complemento}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Bairro:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.endereco.bairro}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Cidade:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.endereco.cidade}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className="font-medium text-sm sm:text-base">{cliente.endereco.estado}</span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>
          </div>
        </TabsContent>

        {/* Empréstimos Tab */}
        <TabsContent value="emprestimos" className="space-y-4">
          <OriginCard variant="default" padding="default" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="text-base sm:text-lg">Empréstimos do Cliente</OriginCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de empréstimos
              </p>
            </OriginCardHeader>
            <OriginCardContent>
              {emprestimos.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum empréstimo encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emprestimos.map((emprestimo) => (
                    <div
                      key={emprestimo.id}
                      className="p-4 rounded-lg border border-border/30 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              ID: {emprestimo.id.slice(0, 8)}...
                            </span>
                            <Badge variant={
                              emprestimo.status === 'ativo' ? 'success' :
                              emprestimo.status === 'atrasado' ? 'destructive' :
                              'secondary'
                            } className="w-fit">
                              {emprestimo.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Valor:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emprestimo.principal)}
                            </div>
                            <div>
                              <span className="font-medium">Saldo:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emprestimo.saldoDevedor)}
                            </div>
                            <div>
                              <span className="font-medium">Vencimento:</span> {formatDate(emprestimo.dataVencimento)}
                            </div>
                          </div>
                        </div>

                        <OriginButton
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/emprestimos/${emprestimo.id}`)}
                          className="self-end sm:self-auto"
                        >
                          <CreditCard className="h-4 w-4" />
                        </OriginButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </OriginCardContent>
          </OriginCard>
        </TabsContent>

        {/* Resumo Tab */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="text-base sm:text-lg">Resumo Financeiro</OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total Emprestado:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalEmprestado)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Saldo Devedor:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(saldoDevedor)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Juros Acumulados:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(jurosAcumulados)}
                    </span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>

            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="text-base sm:text-lg">Status dos Empréstimos</OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ativos:</span>
                    <Badge variant="success">{emprestimosAtivos}</Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Atrasados:</span>
                    <Badge variant="destructive">{emprestimosAtrasados}</Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Quitados:</span>
                    <Badge variant="secondary">{emprestimosQuitados}</Badge>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>
          </div>
        </TabsContent>

        {/* Dados Bancários Tab */}
        <TabsContent value="bancarios" className="space-y-4">
          <OriginCard variant="default" padding="default" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CreditCard className="h-5 w-5 text-primary-500" />
                <span>Dados Bancários</span>
              </OriginCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Informações bancárias para pagamentos e transferências
              </p>
            </OriginCardHeader>
            <OriginCardContent className="space-y-3 sm:space-y-4">
              {cliente.dadosBancarios ? (
                <div className="space-y-3">
                  {cliente.dadosBancarios.chavePix && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Chave PIX:</span>
                      <span className="font-medium text-sm sm:text-base break-all">{cliente.dadosBancarios.chavePix}</span>
                    </div>
                  )}
                  
                  {cliente.dadosBancarios.banco && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Banco:</span>
                      <span className="font-medium text-sm sm:text-base">{cliente.dadosBancarios.banco}</span>
                    </div>
                  )}
                  
                  {cliente.dadosBancarios.agencia && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Agência:</span>
                      <span className="font-medium text-sm sm:text-base">{cliente.dadosBancarios.agencia}</span>
                    </div>
                  )}
                  
                  {cliente.dadosBancarios.conta && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Conta:</span>
                      <span className="font-medium text-sm sm:text-base">{cliente.dadosBancarios.conta}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum dado bancário cadastrado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Edite o cliente para adicionar informações bancárias
                  </p>
                </div>
              )}
            </OriginCardContent>
          </OriginCard>
        </TabsContent>

        {/* Documentos Tab */}
        <TabsContent value="documentos" className="space-y-4">
          <OriginCard variant="default" padding="default" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="text-base sm:text-lg">Documentos do Cliente</OriginCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Documentos e arquivos anexados
              </p>
            </OriginCardHeader>
            <OriginCardContent>
              {cliente.documentos && cliente.documentos.length > 0 ? (
                <div className="space-y-3">
                  {cliente.documentos.map((documento, index) => {
                    const isImage = documento.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const isPDF = documento.match(/\.pdf$/i);
                    
                    // Extrair nome do arquivo da URL
                    const fileName = extractFileName(documento);
                    const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'DOC';
                    
                    return (
                      <div key={index} className="p-4 rounded-lg border border-border/30 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            {/* Ícone do tipo de arquivo */}
                            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              {isImage ? (
                                <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                                  <span className="text-primary font-bold text-xs">IMG</span>
                                </div>
                              ) : isPDF ? (
                                <FileText className="h-5 w-5 text-red-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            
                            {/* Informações do documento */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{fileName}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {fileExtension} • Documento {index + 1}
                              </p>
                            </div>
                          </div>
                          
                          {/* Botões de ação */}
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <OriginButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Abrir documento em nova aba para visualização
                                window.open(documento, '_blank');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Visualizar</span>
                            </OriginButton>
                            <OriginButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Baixar o arquivo
                                downloadFile(documento, fileName);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Baixar</span>
                            </OriginButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum documento encontrado</p>
                </div>
              )}
            </OriginCardContent>
          </OriginCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};
