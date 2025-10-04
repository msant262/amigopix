import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  OriginButton,
  OriginCard,
  OriginCardHeader,
  OriginCardTitle,
  OriginCardContent,
} from "@/components/origin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getStatusText } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  CreditCard,
  Calendar,
  Percent,
  User,
  FileText,
  TrendingUp,
  Clock,
  Upload,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { getEmprestimo, getPagamentos } from "@/lib/firebase/firestore";
import { calcularParcelasEmprestimo } from "@/lib/calculations";
import { useAuth } from "@/contexts/AuthContext";
import {
  VisualizarParcelaModal,
  EditarParcelaModal,
  MarcarComoPagoModal,
  CadastrarPagamentoModal,
} from "./modals";
import { useToast } from "@/components/ui/toast";

export const EmprestimoDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  // Estados para controlar os modais
  const [modalStates, setModalStates] = useState({
    visualizarParcela: false,
    editarParcela: false,
    marcarComoPago: false,
    cadastrarPagamento: false,
  });

  const [selectedParcela, setSelectedParcela] = useState<any>(null);
  const [loadingActions, setLoadingActions] = useState(false);

  // Funções para controlar modais
  const openModal = (modal: string, data?: any) => {
    setModalStates((prev) => ({ ...prev, [modal]: true }));

    if (
      modal === "visualizarParcela" ||
      modal === "editarParcela" ||
      modal === "marcarComoPago"
    ) {
      setSelectedParcela(data);
    }
  };

  const closeModal = (modal: string) => {
    setModalStates((prev) => ({ ...prev, [modal]: false }));

    // Limpar seleções após fechar
    setTimeout(() => {
      if (
        modal === "visualizarParcela" ||
        modal === "editarParcela" ||
        modal === "marcarComoPago"
      ) {
        setSelectedParcela(null);
      }
    }, 300);
  };

  // Handlers para ações dos modais
  const { addToast } = useToast();

  const handleEditarParcela = async (parcelaEditada: any) => {
    setLoadingActions(true);

    try {
      // Validar dados da parcela
      if (!parcelaEditada.dataVencimento) {
        throw new Error("Data de vencimento é obrigatória");
      }
      if (
        !parcelaEditada.valorPrincipal ||
        parcelaEditada.valorPrincipal <= 0
      ) {
        throw new Error("Valor principal deve ser maior que zero");
      }
      if (!parcelaEditada.valorJuros || parcelaEditada.valorJuros < 0) {
        throw new Error("Valor juros não pode ser negativo");
      }

      // Implementar lógica real de edição
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await updateParcela(emprestimo.id, parcelaEditada);

      closeModal("editarParcela");
      addToast("success", "Parcela atualizada com sucesso!");

      // Recarregar dados para refletir mudanças
      // queryClient.invalidateQueries(['emprestimo', id]);
      // queryClient.invalidateQueries(['pagamentos', id]);
    } catch (error) {
      console.error("Erro ao editar parcela:", error);
      addToast(
        "error",
        "Erro ao editar parcela",
        error instanceof Error ? error.message : "Tente novamente mais tarde.",
      );
    } finally {
      setLoadingActions(false);
    }
  };

  const handleMarcarComoPago = async (pagamentoData: any) => {
    setLoadingActions(true);

    try {
      // Validar dados do pagamento
      if (!pagamentoData.valorPago || pagamentoData.valorPago <= 0) {
        throw new Error("Valor do pagamento deve ser maior que zero");
      }
      if (!pagamentoData.dataPagamento) {
        throw new Error("Data do pagamento é obrigatória");
      }
      if (!pagamentoData.metodo) {
        throw new Error("Método de pagamento é obrigatório");
      }

      // Implementar lógica real de pagamento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await registrarPagamento(emprestimo.id, {
      //   ...pagamentoData,
      //   parcelaNumero: selectedParcela.numero,
      //   status: 'pago'
      // });

      closeModal("marcarComoPago");
      addToast("success", "Pagamento registrado com sucesso!");

      // Recarregar dados
      // queryClient.invalidateQueries(['emprestimo', id]);
      // queryClient.invalidateQueries(['pagamentos', id]);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      addToast(
        "error",
        "Erro ao registrar pagamento",
        error instanceof Error ? error.message : "Tente novamente mais tarde.",
      );
    } finally {
      setLoadingActions(false);
    }
  };

  const handleCadastrarPagamento = async (pagamentoData: any) => {
    setLoadingActions(true);

    try {
      // Validar dados do pagamento
      if (!pagamentoData.valor || pagamentoData.valor <= 0) {
        throw new Error("Valor do pagamento deve ser maior que zero");
      }
      if (!pagamentoData.metodo) {
        throw new Error("Método de pagamento é obrigatório");
      }
      if (!pagamentoData.data) {
        throw new Error("Data do pagamento é obrigatória");
      }

      // Verificar se o pagamento não excede o saldo devedor
      if (emprestimo && pagamentoData.valor > emprestimo.saldoDevedor) {
        throw new Error("Valor do pagamento não pode exceder o saldo devedor");
      }

      // Implementar lógica real de cadastro
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await criarPagamento(emprestimo.id, pagamentoData);

      closeModal("cadastrarPagamento");
      addToast("success", "Pagamento cadastrado com sucesso!");

      // Recarregar dados
      // queryClient.invalidateQueries(['emprestimo', id]);
      // queryClient.invalidateQueries(['pagamentos', id]);
    } catch (error) {
      console.error("Erro ao cadastrar pagamento:", error);
      addToast(
        "error",
        "Erro ao cadastrar pagamento",
        error instanceof Error ? error.message : "Tente novamente mais tarde.",
      );
    } finally {
      setLoadingActions(false);
    }
  };

  const {
    data: emprestimo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["emprestimo", id],
    queryFn: () => getEmprestimo(id!),
    enabled: Boolean(id),
  });

  const { data: pagamentos } = useQuery({
    queryKey: ["pagamentos", id],
    queryFn: () => getPagamentos(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !emprestimo) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Empréstimo não encontrado</p>
        <OriginButton
          variant="outline"
          onClick={() => navigate("/emprestimos")}
          className="mt-4 touch-target"
        >
          Voltar para Empréstimos
        </OriginButton>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ativo":
        return "success";
      case "atrasado":
        return "destructive";
      case "quitado":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <OriginButton
            variant="ghost"
            size="icon"
            onClick={() => navigate("/emprestimos")}
            className="backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </OriginButton>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Detalhes do Empréstimo
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Cliente: {emprestimo.cliente?.nomeCompleto || "N/A"} • ID:{" "}
              {emprestimo.id}
            </p>
          </div>
        </div>

        {user?.role === "administrador" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <OriginButton
              variant="outline"
              onClick={() => {
                openModal("cadastrarPagamento", emprestimo);
              }}
              className="w-full sm:w-auto backdrop-blur-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Cadastrar Pagamento
            </OriginButton>
            <OriginButton
              onClick={() => navigate(`/emprestimos/${emprestimo.id}/editar`)}
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </OriginButton>
          </div>
        )}
      </div>

      {/* Status and Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <OriginCard variant="default" padding="default" hover="none">
          <OriginCardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(emprestimo.principal)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor Emprestado
                </p>
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
                  {formatCurrency(emprestimo.saldoDevedor)}
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
                <Percent className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(emprestimo.jurosAcumulado)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Juros Acumulados
                </p>
              </div>
            </div>
          </OriginCardContent>
        </OriginCard>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/20 backdrop-blur-sm">
          <TabsTrigger
            value="details"
            className="touch-target text-sm sm:text-base py-2 px-3 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="touch-target text-sm sm:text-base py-2 px-3 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            Pagamentos
          </TabsTrigger>
          <TabsTrigger
            value="calculations"
            className="touch-target text-sm sm:text-base py-2 px-3 data-[state=active]:bg-background/80 data-[state=active]:shadow-sm rounded-lg"
          >
            Cálculos
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Loan Information */}
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <CreditCard className="h-5 w-5 text-primary-500" />
                  <span>Informações do Empréstimo</span>
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Badge variant={getStatusBadgeVariant(emprestimo.status)}>
                      {getStatusText(emprestimo.status)}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Taxa de Juros:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {emprestimo.taxaJuros}%
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Periodicidade:
                    </span>
                    <span className="font-medium text-sm sm:text-base capitalize">
                      {emprestimo.periodicidadeJuros}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Tipo de Juros:
                    </span>
                    <span className="font-medium text-sm sm:text-base capitalize">
                      {emprestimo.tipoJuros}
                    </span>
                  </div>

                  {emprestimo.parcelas && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Parcelas:
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {emprestimo.parcelas}
                      </span>
                    </div>
                  )}
                </div>
              </OriginCardContent>
            </OriginCard>

            {/* Client Information */}
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <User className="h-5 w-5 text-accent-500" />
                  <span>Informações do Cliente</span>
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Nome:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {emprestimo.cliente?.nomeCompleto || "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Documento:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {emprestimo.cliente?.documento || "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Telefone:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {emprestimo.cliente?.telefone || "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="font-medium text-sm sm:text-base break-all">
                      {emprestimo.cliente?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>

            {/* Dates */}
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Calendar className="h-5 w-5 text-secondary-500" />
                  <span>Datas</span>
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Data de Início:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatDate(emprestimo.dataInicio)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Data de Vencimento:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatDate(emprestimo.dataVencimento)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Última Atualização:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatDate(emprestimo.ultimaAtualizacao)}
                    </span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>

            {/* Observations */}
            {emprestimo.observacoes && (
              <OriginCard
                variant="default"
                padding="default"
                hover="none"
                className="xl:col-span-2"
              >
                <OriginCardHeader>
                  <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <FileText className="h-5 w-5 text-violet-500" />
                    <span>Observações</span>
                  </OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  <p className="text-sm sm:text-base leading-relaxed">
                    {emprestimo.observacoes}
                  </p>
                </OriginCardContent>
              </OriginCard>
            )}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 sm:space-y-6">
          {/* Pagamentos Realizados e Vencidos */}
          <OriginCard variant="default" padding="default" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Pagamentos Realizados e Vencidos</span>
              </OriginCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de pagamentos e parcelas vencidas não pagas
              </p>
            </OriginCardHeader>
            <OriginCardContent>
              {(() => {
                if (!emprestimo) return null;

                // Calcular parcelas para identificar vencidas
                const parcelas = calcularParcelasEmprestimo(
                  emprestimo,
                  pagamentos || [],
                );
                const parcelasVencidas = parcelas.filter(
                  (p) => p.status === "vencido",
                );

                // Se não há pagamentos nem parcelas vencidas
                if (
                  (!pagamentos || pagamentos.length === 0) &&
                  parcelasVencidas.length === 0
                ) {
                  return (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum pagamento registrado
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {/* Pagamentos efetivamente realizados */}
                    {pagamentos &&
                      pagamentos.map((pagamento) => (
                        <div
                          key={pagamento.id}
                          className="p-4 rounded-lg border border-border/30 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <span className="font-medium text-sm sm:text-base">
                                  {formatDate(pagamento.data)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-xs"
                                  >
                                    {pagamento.metodo}
                                  </Badge>
                                  <Badge variant="success" className="text-xs">
                                    Pago
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">
                                    Principal:
                                  </span>{" "}
                                  {formatCurrency(pagamento.principalPago)}
                                </div>
                                <div>
                                  <span className="font-medium">Juros:</span>{" "}
                                  {formatCurrency(pagamento.jurosPago)}
                                </div>
                                <div>
                                  <span className="font-medium">Total:</span>{" "}
                                  {formatCurrency(pagamento.valor)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                              <OriginButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log(
                                    "Visualizar comprovante do pagamento:",
                                    pagamento.id,
                                  );
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                  Visualizar
                                </span>
                              </OriginButton>
                              <OriginButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log(
                                    "Baixar comprovante do pagamento:",
                                    pagamento.id,
                                  );
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Baixar</span>
                              </OriginButton>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Parcelas vencidas não pagas */}
                    {parcelasVencidas.map((parcela) => (
                      <div
                        key={`vencida-${parcela.numero}-${parcela.dataVencimento.getTime()}`}
                        className="p-4 rounded-lg border-2 border-red-500/50 bg-red-500/5 backdrop-blur-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-medium text-sm sm:text-base text-foreground">
                                Parcela {parcela.numero}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Vencido
                                </Badge>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  Vencimento:{" "}
                                  {formatDate(parcela.dataVencimento)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Principal:</span>{" "}
                                {formatCurrency(parcela.valorPrincipal)}
                              </div>
                              <div>
                                <span className="font-medium">Juros:</span>{" "}
                                {formatCurrency(parcela.valorJuros)}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  Total:
                                </span>{" "}
                                {formatCurrency(parcela.valorTotal)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <OriginButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                openModal("editarParcela", parcela);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">
                                Editar Parcela
                              </span>
                            </OriginButton>
                            <OriginButton
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                openModal("marcarComoPago", parcela);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">
                                Marcar como Pago
                              </span>
                            </OriginButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </OriginCardContent>
          </OriginCard>

          {/* Pagamentos Futuros */}
          <OriginCard variant="default" padding="default" hover="none">
            <OriginCardHeader>
              <OriginCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Pagamentos Futuros</span>
              </OriginCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Parcelas a vencer - você pode marcar como pago com comprovante
              </p>
            </OriginCardHeader>
            <OriginCardContent>
              {(() => {
                if (!emprestimo) return null;

                const parcelas = calcularParcelasEmprestimo(
                  emprestimo,
                  pagamentos || [],
                );
                const hoje = new Date();
                const parcelasFuturas = parcelas.filter(
                  (p) => p.status === "pendente" && p.dataVencimento >= hoje,
                );

                if (parcelasFuturas.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Todas as parcelas foram pagas!
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {parcelasFuturas.map((parcela) => (
                      <div
                        key={`${parcela.numero}-${parcela.dataVencimento.getTime()}`}
                        className="p-4 rounded-lg border border-border/30 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-medium text-sm sm:text-base">
                                Parcela {parcela.numero}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="warning" className="text-xs">
                                  A Vencer
                                </Badge>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {formatDate(parcela.dataVencimento)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Principal:</span>{" "}
                                {formatCurrency(parcela.valorPrincipal)}
                              </div>
                              <div>
                                <span className="font-medium">Juros:</span>{" "}
                                {formatCurrency(parcela.valorJuros)}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  Total:
                                </span>{" "}
                                {formatCurrency(parcela.valorTotal)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <OriginButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                openModal("editarParcela", parcela);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">
                                Editar Parcela
                              </span>
                            </OriginButton>
                            <OriginButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                openModal("marcarComoPago", parcela);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">
                                Marcar como Pago
                              </span>
                            </OriginButton>
                            <OriginButton
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/50"
                              onClick={() => {
                                console.log("Apagar parcela:", parcela.numero);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">
                                Apagar Parcela
                              </span>
                            </OriginButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </OriginCardContent>
          </OriginCard>
        </TabsContent>

        {/* Calculations Tab */}
        <TabsContent value="calculations" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="text-base sm:text-lg">
                  Resumo Financeiro
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Valor Principal:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatCurrency(emprestimo.principal)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Juros Acumulados:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatCurrency(emprestimo.jurosAcumulado)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Valor Total:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatCurrency(emprestimo.valorTotal)}
                    </span>
                  </div>

                  <hr className="border-border/30" />

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Saldo Devedor:
                    </span>
                    <span className="font-bold text-accent text-sm sm:text-base">
                      {formatCurrency(emprestimo.saldoDevedor)}
                    </span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>

            <OriginCard variant="default" padding="default" hover="none">
              <OriginCardHeader>
                <OriginCardTitle className="text-base sm:text-lg">
                  Informações de Juros
                </OriginCardTitle>
              </OriginCardHeader>
              <OriginCardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Taxa de Juros:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {emprestimo.taxaJuros}%
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Periodicidade:
                    </span>
                    <span className="font-medium text-sm sm:text-base capitalize">
                      {emprestimo.periodicidadeJuros}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Tipo de Juros:
                    </span>
                    <span className="font-medium text-sm sm:text-base capitalize">
                      {emprestimo.tipoJuros}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Dias desde início:
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {Math.ceil(
                        (new Date().getTime() -
                          emprestimo.dataInicio.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}
                    </span>
                  </div>
                </div>
              </OriginCardContent>
            </OriginCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modais Globais */}
      <VisualizarParcelaModal
        open={modalStates.visualizarParcela}
        onOpenChange={() => closeModal("visualizarParcela")}
        parcela={selectedParcela}
        numeroParcela={selectedParcela?.numero || 1}
        totalParcelas={emprestimo?.parcelas || selectedParcela?.numero || 1}
      />

      <EditarParcelaModal
        open={modalStates.editarParcela}
        onOpenChange={() => closeModal("editarParcela")}
        parcela={selectedParcela}
        onSave={handleEditarParcela}
        loading={loadingActions}
      />

      <MarcarComoPagoModal
        open={modalStates.marcarComoPago}
        onOpenChange={() => closeModal("marcarComoPago")}
        parcela={selectedParcela}
        onSave={handleMarcarComoPago}
        loading={loadingActions}
      />

      <CadastrarPagamentoModal
        open={modalStates.cadastrarPagamento}
        onOpenChange={() => closeModal("cadastrarPagamento")}
        emprestimo={emprestimo}
        onSave={handleCadastrarPagamento}
        loading={loadingActions}
      />
    </div>
  );
};
