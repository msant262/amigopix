import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { EmprestimoFormData, PeriodicidadeJuros, TipoJuros } from "@/types";
import {
  createEmprestimo,
  updateEmprestimo,
  getEmprestimo,
} from "@/lib/firebase/firestore";
import { getClientes } from "@/lib/firebase/firestore";
import toast from "react-hot-toast";

const emprestimoSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  principal: z.number().min(0.01, "Valor deve ser maior que zero"),
  taxaJuros: z.number().min(0, "Taxa de juros deve ser positiva"),
  periodicidadeJuros: z.enum(["mensal", "anual"]),
  tipoJuros: z.enum(["simples", "composto"]),
  dataInicio: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") return new Date(val);
    return val;
  }),
  dataVencimento: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") return new Date(val);
    return val;
  }),
  parcelas: z.number().optional(),
  observacoes: z.string().optional(),
});

type EmprestimoFormValues = z.infer<typeof emprestimoSchema>;

export const EmprestimoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EmprestimoFormValues>({
    resolver: zodResolver(emprestimoSchema),
    defaultValues: {
      clienteId: "",
      principal: 0,
      taxaJuros: 0,
      periodicidadeJuros: "mensal",
      tipoJuros: "simples",
      dataInicio: new Date(),
      dataVencimento: new Date(),
      parcelas: undefined,
      observacoes: "",
    },
  });

  // Fetch emprestimo data if editing
  const { data: emprestimoData } = useQuery({
    queryKey: ["emprestimo", id],
    queryFn: () => getEmprestimo(id!),
    enabled: isEditing && Boolean(id),
  });

  // Fetch clientes for select
  const { data: clientesData } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: () => getClientes({}, 1000),
  });

  // Populate form when editing
  useEffect(() => {
    if (emprestimoData && isEditing) {
      // Converter datas para o formato esperado pelos inputs
      const dataInicioStr =
        emprestimoData.dataInicio instanceof Date
          ? emprestimoData.dataInicio.toISOString().split("T")[0]
          : new Date(emprestimoData.dataInicio).toISOString().split("T")[0];

      const dataVencimentoStr =
        emprestimoData.dataVencimento instanceof Date
          ? emprestimoData.dataVencimento.toISOString().split("T")[0]
          : new Date(emprestimoData.dataVencimento).toISOString().split("T")[0];

      reset({
        clienteId: emprestimoData.clienteId,
        principal: emprestimoData.principal,
        taxaJuros: emprestimoData.taxaJuros,
        periodicidadeJuros: emprestimoData.periodicidadeJuros,
        tipoJuros: emprestimoData.tipoJuros,
        dataInicio: dataInicioStr as any,
        dataVencimento: dataVencimentoStr as any,
        parcelas: emprestimoData.parcelas,
        observacoes: emprestimoData.observacoes || "",
      });
    }
  }, [emprestimoData, isEditing, reset]);

  // Garantir que o cliente seja selecionado após os dados carregarem
  useEffect(() => {
    if (emprestimoData?.clienteId && clientesData?.clientes && isEditing) {
      setValue("clienteId", emprestimoData.clienteId);
    }
  }, [emprestimoData?.clienteId, clientesData?.clientes, isEditing, setValue]);

  const createMutation = useMutation({
    mutationFn: createEmprestimo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emprestimos"] });
      toast.success("Empréstimo criado com sucesso!");
      navigate("/emprestimos");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar empréstimo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EmprestimoFormData>;
    }) => updateEmprestimo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emprestimos"] });
      queryClient.invalidateQueries({ queryKey: ["emprestimo", id] });
      toast.success("Empréstimo atualizado com sucesso!");
      navigate("/emprestimos");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar empréstimo");
    },
  });

  const onSubmit = async (data: EmprestimoFormValues) => {
    try {
      setIsSubmitting(true);

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Erro ao salvar empréstimo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchPrincipal = watch("principal");
  const watchTaxaJuros = watch("taxaJuros");
  const watchTipoJuros = watch("tipoJuros");
  const watchPeriodicidadeJuros = watch("periodicidadeJuros");

  // Calculate estimated interest (simplified)
  const calculateEstimatedInterest = () => {
    if (!watchPrincipal || !watchTaxaJuros) return 0;

    const principal = watchPrincipal;
    const taxa = watchTaxaJuros / 100;
    const periodicidade = watchPeriodicidadeJuros === "anual" ? 365 : 30;
    const dias = 30; // Simplified calculation for 30 days

    if (watchTipoJuros === "simples") {
      return principal * taxa * (dias / periodicidade);
    } else {
      return principal * (Math.pow(1 + taxa, dias / periodicidade) - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/emprestimos")}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {isEditing ? "Editar Empréstimo" : "Novo Empréstimo"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize as informações do empréstimo"
              : "Crie um novo empréstimo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Cliente Selection */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>
                  Selecione o cliente para este empréstimo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Select
                    value={watch("clienteId") || ""}
                    onValueChange={(value) => setValue("clienteId", value)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesData?.clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nomeCompleto} - {cliente.documento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clienteId && (
                    <p className="text-sm text-destructive">
                      {errors.clienteId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loan Details */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Detalhes do Empréstimo</CardTitle>
                <CardDescription>
                  Informações financeiras do empréstimo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Valor Emprestado (R$) *</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("principal", { valueAsNumber: true })}
                    className="touch-target"
                    placeholder="0,00"
                  />
                  {errors.principal && (
                    <p className="text-sm text-destructive">
                      {errors.principal.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de Juros (%) *</Label>
                  <Input
                    id="taxaJuros"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("taxaJuros", { valueAsNumber: true })}
                    className="touch-target"
                    placeholder="0,00"
                  />
                  {errors.taxaJuros && (
                    <p className="text-sm text-destructive">
                      {errors.taxaJuros.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodicidadeJuros">Periodicidade *</Label>
                    <Select
                      value={watch("periodicidadeJuros")}
                      onValueChange={(value) =>
                        setValue(
                          "periodicidadeJuros",
                          value as PeriodicidadeJuros,
                        )
                      }
                    >
                      <SelectTrigger className="touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoJuros">Tipo de Juros *</Label>
                    <Select
                      value={watch("tipoJuros")}
                      onValueChange={(value) =>
                        setValue("tipoJuros", value as TipoJuros)
                      }
                    >
                      <SelectTrigger className="touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples</SelectItem>
                        <SelectItem value="composto">Composto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Dates */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Datas</CardTitle>
                <CardDescription>
                  Defina as datas de início e vencimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    {...register("dataInicio")}
                    className="touch-target"
                  />
                  {errors.dataInicio && (
                    <p className="text-sm text-destructive">
                      {errors.dataInicio.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    {...register("dataVencimento")}
                    className="touch-target"
                  />
                  {errors.dataVencimento && (
                    <p className="text-sm text-destructive">
                      {errors.dataVencimento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parcelas">Parcelas (opcional)</Label>
                  <Input
                    id="parcelas"
                    type="number"
                    min="1"
                    {...register("parcelas", { valueAsNumber: true })}
                    className="touch-target"
                    placeholder="Número de parcelas"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interest Preview */}
            {watchPrincipal && watchTaxaJuros && (
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle>Preview dos Juros</CardTitle>
                  <CardDescription>
                    Estimativa de juros para 30 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Valor Emprestado:</span>
                      <span className="font-medium">
                        R${" "}
                        {watchPrincipal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa ({watchPeriodicidadeJuros}):</span>
                      <span className="font-medium">{watchTaxaJuros}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium capitalize">
                        {watchTipoJuros}
                      </span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between font-semibold">
                      <span>Juros estimados (30 dias):</span>
                      <span className="text-accent">
                        R${" "}
                        {calculateEstimatedInterest().toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observations */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Informações adicionais sobre o empréstimo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <textarea
                    id="observacoes"
                    {...register("observacoes")}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Observações sobre o empréstimo..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/emprestimos")}
            className="touch-target"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="touch-target"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Atualizar" : "Criar"} Empréstimo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
