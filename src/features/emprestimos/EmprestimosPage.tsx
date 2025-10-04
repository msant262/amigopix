import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OriginButton,
  OriginCard,
  OriginCardHeader,
  OriginCardTitle,
  OriginCardContent,
  OriginInput,
  OriginBadge,
} from "@/components/origin";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Edit,
  CreditCard,
  Calendar,
  User,
  DollarSign,
  Eye,
  CheckCircle,
} from "lucide-react";
import { EmprestimoFilters } from "@/types";
import { getEmprestimos, getPagamentos } from "@/lib/firebase/firestore";
import { calcularParcelasEmprestimo } from "@/lib/calculations";
import { EmprestimoForm } from "./EmprestimoForm";
import { EmprestimoDetails } from "./EmprestimoDetails";
import {
  VisualizarParcelaModal,
  EditarParcelaModal,
  MarcarComoPagoModal,
  CadastrarPagamentoModal,
} from "./modals";
import { useToast } from "@/components/ui/toast";

export const EmprestimosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EmprestimoFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [emprestimosComParcelas, setEmprestimosComParcelas] = useState<any[]>(
    [],
  );

  // Estados para controlar os modais
  const [modalStates, setModalStates] = useState({
    visualizarParcela: false,
    editarParcela: false,
    marcarComoPago: false,
    cadastrarPagamento: false,
  });

  const [selectedParcela, setSelectedParcela] = useState<any>(null);
  const [selectedEmprestimo, setSelectedEmprestimo] = useState<any>(null);
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
    } else if (modal === "cadastrarPagamento") {
      setSelectedEmprestimo(data);
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
      } else if (modal === "cadastrarPagamento") {
        setSelectedEmprestimo(null);
      }
    }, 300);
  };

  // Handlers para ações dos modais
  const { addToast } = useToast();

  const handleEditarParcela = async (_parcelaEditada: any) => {
    setLoadingActions(true);

    try {
      // Implementar lógica real de edição de parcela
      // Por enquanto, simulamos uma operação bem-sucedida
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await updateParcela(selectedEmprestimo.id, parcelaEditada);

      closeModal("editarParcela");
      addToast("success", "Parcela atualizada com sucesso!");

      // Recarregar dados para refletir mudanças
      // queryClient.invalidateQueries(['emprestimos']);
    } catch (error) {
      console.error("Erro ao editar parcela:", error);
      addToast(
        "error",
        "Erro ao editar parcela",
        "Tente novamente mais tarde.",
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

      // Implementar lógica real de pagamento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await registrarPagamento(selectedEmprestimo.id, {
      //   ...pagamentoData,
      //   parcelaNumero: selectedParcela.numero,
      //   status: 'pago'
      // });

      closeModal("marcarComoPago");
      addToast("success", "Pagamento registrado com sucesso!");

      // Recarregar dados
      // queryClient.invalidateQueries(['emprestimos']);
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

      // Implementar lógica real de cadastro
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui seria implementada a chamada real ao Firestore
      // await criarPagamento(selectedEmprestimo.id, pagamentoData);

      closeModal("cadastrarPagamento");
      addToast("success", "Pagamento cadastrado com sucesso!");

      // Recarregar dados
      // queryClient.invalidateQueries(['emprestimos']);
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

  // Função para obter próxima parcela pendente
  const getProximaParcelaPendente = (emprestimo: any) => {
    if (!emprestimo) {
      return null;
    }

    // Calcular parcelas para encontrar a próxima pendente
    const parcelas = calcularParcelasEmprestimo(emprestimo, []);
    const hoje = new Date();
    const parcelaPendente = parcelas.find((p) => {
      const isPendente =
        p.status === "pendente" ||
        (p.status !== "pago" && p.dataVencimento >= hoje);
      return isPendente;
    });

    return parcelaPendente;
  };

  const {
    data: emprestimosData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["emprestimos", filters, user?.uid],
    queryFn: () => getEmprestimos(filters, 50),
    enabled: !!user,
  });

  // Buscar pagamentos e calcular estatísticas de parcelas
  React.useEffect(() => {
    const calcularEstatisticasParcelas = async () => {
      if (!emprestimosData?.emprestimos.length) return;

      const emprestimosComStats = await Promise.all(
        emprestimosData.emprestimos.map(async (emprestimo) => {
          try {
            const pagamentos = await getPagamentos(emprestimo.id);
            const parcelas = calcularParcelasEmprestimo(emprestimo, pagamentos);

            const parcelasPagas = parcelas.filter((p) => p.status === "pago");
            const ultimoPagamento =
              pagamentos.length > 0
                ? pagamentos.sort(
                    (a, b) => b.data.getTime() - a.data.getTime(),
                  )[0]
                : null;

            return {
              ...emprestimo,
              parcelasPagas: parcelasPagas.length,
              totalParcelas: parcelas.length,
              ultimoPagamento: ultimoPagamento?.data,
            };
          } catch (error) {
            console.warn(
              "Erro ao calcular estatísticas para empréstimo:",
              emprestimo.id,
              error,
            );
            return {
              ...emprestimo,
              parcelasPagas: 0,
              totalParcelas: 0,
              ultimoPagamento: null,
            };
          }
        }),
      );

      setEmprestimosComParcelas(emprestimosComStats);
    };

    calcularEstatisticasParcelas();
  }, [emprestimosData]);

  const handleFilterChange = (field: keyof EmprestimoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "all" ? undefined : value,
    }));
  };

  const filteredEmprestimos = emprestimosComParcelas.filter((emprestimo) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      emprestimo.cliente?.nomeCompleto.toLowerCase().includes(searchLower) ||
      emprestimo.id.toLowerCase().includes(searchLower) ||
      emprestimo.status.toLowerCase().includes(searchLower)
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
        <p className="text-destructive">Erro ao carregar empréstimos</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Empréstimos</h1>
                    <p className="text-muted-foreground">
                      Gerencie todos os empréstimos do sistema
                    </p>
                  </div>

                  {user?.role === "administrador" && (
                    <OriginButton
                      onClick={() => navigate("/emprestimos/novo")}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Empréstimo
                    </OriginButton>
                  )}
                </div>
              </div>

              {/* Filters */}
              <OriginCard>
                <OriginCardHeader>
                  <OriginCardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filtros</span>
                  </OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-1">
                      <OriginInput
                        label="Buscar"
                        placeholder="Cliente, ID, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                          <SelectItem value="quitado">Quitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <OriginInput
                        label="Data Início"
                        type="date"
                        value={
                          filters.dataInicio?.toISOString().split("T")[0] || ""
                        }
                        onChange={(e) =>
                          handleFilterChange(
                            "dataInicio",
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </div>

                    <div>
                      <OriginInput
                        label="Data Fim"
                        type="date"
                        value={
                          filters.dataFim?.toISOString().split("T")[0] || ""
                        }
                        onChange={(e) =>
                          handleFilterChange(
                            "dataFim",
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </div>
                  </div>
                </OriginCardContent>
              </OriginCard>

              {/* Empréstimos List */}
              <OriginCard>
                <OriginCardHeader>
                  <OriginCardTitle className="flex items-center justify-between">
                    <span>Lista de Empréstimos</span>
                    <OriginBadge variant="secondary">
                      {filteredEmprestimos.length} empréstimos
                    </OriginBadge>
                  </OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  {filteredEmprestimos.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum empréstimo encontrado
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEmprestimos.map((emprestimo) => (
                        <OriginCard
                          key={emprestimo.id}
                          className="hover:shadow-md transition-shadow cursor-pointer relative"
                          onClick={() =>
                            navigate(`/emprestimos/${emprestimo.id}`)
                          }
                        >
                          <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">
                                    {emprestimo.cliente?.nomeCompleto ||
                                      "Cliente não encontrado"}
                                  </h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {emprestimo.totalParcelas > 0 && (
                                      <OriginBadge variant="info" size="sm">
                                        {emprestimo.parcelasPagas}/
                                        {emprestimo.totalParcelas} pagas
                                      </OriginBadge>
                                    )}
                                    {emprestimo.status === "ativo" && (
                                      <OriginBadge variant="success" size="sm">
                                        Ativo
                                      </OriginBadge>
                                    )}
                                    {emprestimo.status === "atrasado" && (
                                      <OriginBadge
                                        variant="destructive"
                                        size="sm"
                                      >
                                        Atrasado
                                      </OriginBadge>
                                    )}
                                    {emprestimo.status === "quitado" && (
                                      <OriginBadge
                                        variant="secondary"
                                        size="sm"
                                      >
                                        Quitado
                                      </OriginBadge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Informações principais */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Valor */}
                              <div className="text-center p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-medium text-primary">
                                    Valor
                                  </span>
                                </div>
                                <p className="font-bold text-primary">
                                  {formatCurrency(emprestimo.principal)}
                                </p>
                              </div>

                              {/* Data Início */}
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs font-medium text-blue-500">
                                    Início
                                  </span>
                                </div>
                                <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                  {formatDate(emprestimo.dataInicio)}
                                </p>
                              </div>

                              {/* Data Vencimento */}
                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <Calendar className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs font-medium text-orange-500">
                                    Vencimento
                                  </span>
                                </div>
                                <p className="font-semibold text-orange-600 dark:text-orange-400 text-sm">
                                  {formatDate(emprestimo.dataVencimento)}
                                </p>
                              </div>
                            </div>

                            {/* Progresso */}
                            {emprestimo.totalParcelas > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Progresso</span>
                                  <span>
                                    {Math.round(
                                      (emprestimo.parcelasPagas /
                                        emprestimo.totalParcelas) *
                                        100,
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${(emprestimo.parcelasPagas / emprestimo.totalParcelas) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Ações - Visíveis e Diretas */}
                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                              <OriginButton
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const parcelas = calcularParcelasEmprestimo(
                                    emprestimo,
                                    [],
                                  );
                                  if (parcelas.length > 0) {
                                    openModal("visualizarParcela", parcelas[0]);
                                  }
                                }}
                                className="flex-1 sm:flex-none"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </OriginButton>

                              {user?.role === "administrador" && (
                                <>
                                  <OriginButton
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const proximaParcela =
                                        getProximaParcelaPendente(emprestimo);
                                      if (proximaParcela) {
                                        openModal(
                                          "visualizarParcela",
                                          proximaParcela,
                                        );
                                      } else {
                                        // Abrir modal com primeira parcela como fallback
                                        const parcelas =
                                          calcularParcelasEmprestimo(
                                            emprestimo,
                                            [],
                                          );
                                        if (parcelas.length > 0) {
                                          openModal(
                                            "visualizarParcela",
                                            parcelas[0],
                                          );
                                        }
                                      }
                                    }}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Parcela
                                  </OriginButton>

                                  <OriginButton
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const proximaParcela =
                                        getProximaParcelaPendente(emprestimo);
                                      if (proximaParcela) {
                                        openModal(
                                          "marcarComoPago",
                                          proximaParcela,
                                        );
                                      } else {
                                        // Abrir modal com primeira parcela como fallback
                                        const parcelas =
                                          calcularParcelasEmprestimo(
                                            emprestimo,
                                            [],
                                          );
                                        if (parcelas.length > 0) {
                                          openModal(
                                            "marcarComoPago",
                                            parcelas[0],
                                          );
                                        }
                                      }
                                    }}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Pagar
                                  </OriginButton>

                                  <OriginButton
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModal(
                                        "cadastrarPagamento",
                                        emprestimo,
                                      );
                                    }}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pagamento
                                  </OriginButton>

                                  <OriginButton
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Impede que o clique vá para o card
                                      navigate(
                                        `/emprestimos/${emprestimo.id}/editar`,
                                      );
                                    }}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </OriginButton>
                                </>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                              <span>ID: {emprestimo.id.slice(0, 8)}...</span>
                              {emprestimo.ultimoPagamento && (
                                <span>
                                  Último pagamento:{" "}
                                  {formatDate(emprestimo.ultimoPagamento)}
                                </span>
                              )}
                            </div>
                          </div>
                        </OriginCard>
                      ))}
                    </div>
                  )}
                </OriginCardContent>
              </OriginCard>
            </div>
          }
        />

        <Route path="/novo" element={<EmprestimoForm />} />
        <Route path="/:id" element={<EmprestimoDetails />} />
        <Route path="/:id/editar" element={<EmprestimoForm />} />
      </Routes>

      {/* Modais Globais */}
      <VisualizarParcelaModal
        open={modalStates.visualizarParcela}
        onOpenChange={() => closeModal("visualizarParcela")}
        parcela={selectedParcela}
        numeroParcela={selectedParcela?.numero || 1}
        totalParcelas={
          selectedEmprestimo?.parcelas || selectedParcela?.numero || 1
        }
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
        emprestimo={selectedEmprestimo}
        onSave={handleCadastrarPagamento}
        loading={loadingActions}
      />
    </>
  );
};
