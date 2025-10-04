import React, { useState } from "react";
import {
  OriginModal,
  OriginModalContent,
  OriginModalFooter,
  OriginButton,
  OriginInput,
} from "@/components/origin";
import { formatCurrency } from "@/lib/utils";
import { Emprestimo, MetodoPagamento } from "@/types";

interface CadastrarPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimo: Emprestimo | null;
  onSave: (data: {
    data: Date;
    valor: number;
    principalPago: number;
    jurosPago: number;
    metodo: MetodoPagamento;
    observacoes?: string;
  }) => void;
  loading?: boolean;
}

export const CadastrarPagamentoModal: React.FC<
  CadastrarPagamentoModalProps
> = ({ open, onOpenChange, emprestimo, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    data: new Date(),
    valor: 0,
    principalPago: 0,
    jurosPago: 0,
    metodo: "dinheiro" as MetodoPagamento,
    observacoes: "",
  });

  React.useEffect(() => {
    if (emprestimo) {
      setFormData({
        data: new Date(),
        valor: 0,
        principalPago: 0,
        jurosPago: 0,
        metodo: "dinheiro",
        observacoes: "",
      });
    }
  }, [emprestimo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValorChange = (valor: number) => {
    // Distribuir proporcionalmente entre principal e juros
    if (emprestimo && valor > 0) {
      const total = emprestimo.principal + emprestimo.jurosAcumulado;
      const propPrincipal = emprestimo.principal / total;
      const propJuros = emprestimo.jurosAcumulado / total;

      setFormData((prev) => ({
        ...prev,
        valor,
        principalPago: Math.round(valor * propPrincipal * 100) / 100,
        jurosPago: Math.round(valor * propJuros * 100) / 100,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        valor,
        principalPago: valor,
        jurosPago: 0,
      }));
    }
  };

  if (!emprestimo) return null;

  return (
    <OriginModal
      open={open}
      onOpenChange={onOpenChange}
      size="default"
      title="Cadastrar Pagamento"
      description="Registre um novo pagamento para este empréstimo"
    >
      <OriginModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Empréstimo */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Saldo Devedor Atual
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(emprestimo.saldoDevedor)}
            </p>
          </div>

          {/* Data do Pagamento */}
          <OriginInput
            label="Data do Pagamento"
            type="date"
            value={formData.data.toISOString().split("T")[0]}
            onChange={(e) =>
              handleInputChange("data", new Date(e.target.value))
            }
            required
          />

          {/* Valor do Pagamento */}
          <OriginInput
            label="Valor do Pagamento"
            type="number"
            step="0.01"
            min="0"
            max={emprestimo.saldoDevedor}
            value={formData.valor}
            onChange={(e) => handleValorChange(parseFloat(e.target.value) || 0)}
            required
          />

          {/* Distribuição do Valor */}
          {formData.valor > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Principal</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(formData.principalPago)}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-xs text-orange-600 mb-1">Juros</p>
                <p className="font-semibold text-orange-600">
                  {formatCurrency(formData.jurosPago)}
                </p>
              </div>
            </div>
          )}

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de Pagamento</label>
            <select
              value={formData.metodo}
              onChange={(e) => handleInputChange("metodo", e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência</option>
              <option value="cheque">Cheque</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          {/* Observações */}
          <OriginInput
            label="Observações (opcional)"
            placeholder="Adicione uma observação sobre este pagamento"
            value={formData.observacoes}
            onChange={(e) => handleInputChange("observacoes", e.target.value)}
          />
        </form>
      </OriginModalContent>

      <OriginModalFooter>
        <OriginButton
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Cancelar
        </OriginButton>
        <OriginButton
          onClick={handleSubmit}
          disabled={loading || formData.valor <= 0}
        >
          {loading ? "Cadastrando..." : "Cadastrar Pagamento"}
        </OriginButton>
      </OriginModalFooter>
    </OriginModal>
  );
};
