import React, { useState } from "react";
import {
  OriginModal,
  OriginModalContent,
  OriginModalFooter,
  OriginButton,
  OriginInput,
} from "@/components/origin";
import { formatCurrency } from "@/lib/utils";
import { ParcelaCalculada } from "@/lib/calculations";

interface EditarParcelaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaCalculada | null;
  onSave: (parcelaEditada: Partial<ParcelaCalculada>) => void;
  loading?: boolean;
}

export const EditarParcelaModal: React.FC<EditarParcelaModalProps> = ({
  open,
  onOpenChange,
  parcela,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    dataVencimento: parcela?.dataVencimento || new Date(),
    valorPrincipal: parcela?.valorPrincipal || 0,
    valorJuros: parcela?.valorJuros || 0,
  });

  React.useEffect(() => {
    if (parcela) {
      setFormData({
        dataVencimento: parcela.dataVencimento,
        valorPrincipal: parcela.valorPrincipal,
        valorJuros: parcela.valorJuros,
      });
    }
  }, [parcela]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!parcela) return;

    const parcelaEditada = {
      ...parcela,
      dataVencimento: formData.dataVencimento,
      valorPrincipal: formData.valorPrincipal,
      valorJuros: formData.valorJuros,
      valorTotal: formData.valorPrincipal + formData.valorJuros,
    };

    onSave(parcelaEditada);
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
      title="Editar Parcela"
      description="Altere os dados da parcela conforme necessário"
    >
      <OriginModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data de Vencimento */}
          <OriginInput
            label="Data de Vencimento"
            type="date"
            value={formData.dataVencimento.toISOString().split("T")[0]}
            onChange={(e) =>
              handleInputChange("dataVencimento", new Date(e.target.value))
            }
            required
          />

          {/* Valor Principal */}
          <OriginInput
            label="Valor Principal"
            type="number"
            step="0.01"
            min="0"
            value={formData.valorPrincipal}
            onChange={(e) =>
              handleInputChange(
                "valorPrincipal",
                parseFloat(e.target.value) || 0,
              )
            }
            required
          />

          {/* Valor Juros */}
          <OriginInput
            label="Valor Juros"
            type="number"
            step="0.01"
            min="0"
            value={formData.valorJuros}
            onChange={(e) =>
              handleInputChange("valorJuros", parseFloat(e.target.value) || 0)
            }
            required
          />

          {/* Valor Total (calculado) */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(formData.valorPrincipal + formData.valorJuros)}
            </p>
          </div>
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
          {loading ? "Salvando..." : "Salvar Alterações"}
        </OriginButton>
      </OriginModalFooter>
    </OriginModal>
  );
};
