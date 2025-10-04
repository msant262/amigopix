import React from "react";
import {
  OriginModal,
  OriginModalContent,
  OriginModalFooter,
  OriginButton,
  OriginBadge,
} from "@/components/origin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ParcelaCalculada } from "@/lib/calculations";

interface VisualizarParcelaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaCalculada | null;
  numeroParcela: number;
  totalParcelas: number;
}

export const VisualizarParcelaModal: React.FC<VisualizarParcelaModalProps> = ({
  open,
  onOpenChange,
  parcela,
  numeroParcela,
  totalParcelas,
}) => {
  if (!parcela) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <OriginBadge variant="success" size="sm">
            Paga
          </OriginBadge>
        );
      case "vencido":
        return (
          <OriginBadge variant="destructive" size="sm">
            Vencida
          </OriginBadge>
        );
      default:
        return (
          <OriginBadge variant="info" size="sm">
            Pendente
          </OriginBadge>
        );
    }
  };

  return (
    <OriginModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Detalhes da Parcela"
    >
      <OriginModalContent className="space-y-4">
        {/* Header */}
        <div className="text-center py-4 border-b">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">
              Parcela {numeroParcela} de {totalParcelas}
            </h3>
            {getStatusBadge(parcela.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            Vencimento: {formatDate(parcela.dataVencimento)}
          </p>
        </div>

        {/* Valores */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Principal</p>
              <p className="font-semibold">
                {formatCurrency(parcela.valorPrincipal)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Juros</p>
              <p className="font-semibold">
                {formatCurrency(parcela.valorJuros)}
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(parcela.valorTotal)}
            </p>
          </div>

          {parcela.status === "pago" && parcela.dataPagamento && (
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Data de Pagamento</p>
              <p className="font-semibold text-green-600">
                {formatDate(parcela.dataPagamento)}
              </p>
              {parcela.valorPago && (
                <p className="text-sm text-green-600 mt-1">
                  Valor pago: {formatCurrency(parcela.valorPago)}
                </p>
              )}
            </div>
          )}
        </div>
      </OriginModalContent>

      <OriginModalFooter>
        <OriginButton variant="outline" onClick={() => onOpenChange(false)}>
          Fechar
        </OriginButton>
      </OriginModalFooter>
    </OriginModal>
  );
};
