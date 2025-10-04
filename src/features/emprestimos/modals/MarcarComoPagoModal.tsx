import React, { useState } from "react";
import {
  OriginModal,
  OriginModalContent,
  OriginModalFooter,
  OriginButton,
  OriginInput,
} from "@/components/origin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MetodoPagamento } from "@/types";
import { ParcelaCalculada } from "@/lib/calculations";

interface MarcarComoPagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaCalculada | null;
  onSave: (data: {
    dataPagamento: Date;
    valorPago: number;
    metodo: MetodoPagamento;
    observacoes?: string;
  }) => void;
  loading?: boolean;
}

export const MarcarComoPagoModal: React.FC<MarcarComoPagoModalProps> = ({
  open,
  onOpenChange,
  parcela,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    dataPagamento: new Date(),
    valorPago: parcela?.valorTotal || 0,
    metodo: "dinheiro" as MetodoPagamento,
    observacoes: "",
  });

  React.useEffect(() => {
    if (parcela) {
      setFormData({
        dataPagamento: new Date(),
        valorPago: parcela.valorTotal,
        metodo: "dinheiro",
        observacoes: "",
      });
    }
  }, [parcela]);

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

  if (!parcela) return null;

  return (
    <OriginModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Marcar Parcela como Paga"
      description="Confirme os dados do pagamento"
    >
      <OriginModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Parcela */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Parcela {parcela.numero} - Vencimento
            </p>
            <p className="font-semibold">
              {formatDate(parcela.dataVencimento)}
            </p>
            <p className="text-lg font-bold text-primary mt-1">
              {formatCurrency(parcela.valorTotal)}
            </p>
          </div>

          {/* Data de Pagamento */}
          <OriginInput
            label="Data do Pagamento"
            type="date"
            value={formData.dataPagamento.toISOString().split("T")[0]}
            onChange={(e) =>
              handleInputChange("dataPagamento", new Date(e.target.value))
            }
            required
          />

          {/* Valor Pago */}
          <OriginInput
            label="Valor Pago"
            type="number"
            step="0.01"
            min="0"
            value={formData.valorPago}
            onChange={(e) =>
              handleInputChange("valorPago", parseFloat(e.target.value) || 0)
            }
            required
          />

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
        <OriginButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Processando..." : "Confirmar Pagamento"}
        </OriginButton>
      </OriginModalFooter>
    </OriginModal>
  );
};
