import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getEmprestimos, getPagamentos } from "@/lib/firebase/firestore";

interface GraficoEvolucaoTemporalProps {
  timeRange: "1d" | "7d" | "30d" | "90d" | "all";
}

export const GraficoEvolucaoTemporal: React.FC<
  GraficoEvolucaoTemporalProps
> = ({ timeRange }) => {
  // Buscar dados reais dos empréstimos
  const { data: emprestimosData, isLoading: emprestimosLoading } = useQuery({
    queryKey: ["emprestimos-evolucao-temporal", timeRange],
    queryFn: () => getEmprestimos({}, 100),
  });

  // Buscar dados reais dos pagamentos
  const { data: pagamentosData, isLoading: pagamentosLoading } = useQuery({
    queryKey: ["pagamentos-evolucao-temporal", timeRange],
    queryFn: async () => {
      const emprestimos = emprestimosData?.emprestimos || [];
      const pagamentosPromises = emprestimos.map((emp) =>
        getPagamentos(emp.id),
      );
      const pagamentosResults = await Promise.all(pagamentosPromises);
      return pagamentosResults.flat();
    },
    enabled: !!emprestimosData,
  });

  const emprestimos = emprestimosData?.emprestimos || [];
  const pagamentos = pagamentosData || [];
  const isLoading = emprestimosLoading || pagamentosLoading;

  // Gerar dados reais para evolução temporal baseado nos dados do banco
  const generateTimeSeriesData = () => {
    if (isLoading || !emprestimos.length) {
      return [];
    }
    const data = [];
    const now = new Date();

    // Determinar período baseado no timeRange
    let startDate = new Date();
    let interval = 1;

    switch (timeRange) {
      case "1d":
        startDate.setDate(now.getDate() - 7);
        interval = 1; // 1 dia
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        interval = 1;
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        interval = 2;
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        interval = 7;
        break;
      case "all":
        // Usar a data do empréstimo mais antigo
        const oldestEmprestimo = emprestimos.reduce(
          (oldest, emp) => (emp.dataInicio < oldest ? emp.dataInicio : oldest),
          emprestimos[0]?.dataInicio || now,
        );
        startDate = oldestEmprestimo;
        interval = 30;
        break;
    }

    // Gerar pontos de dados para o período
    for (
      let date = new Date(startDate);
      date <= now;
      date.setDate(date.getDate() + interval)
    ) {
      const currentDate = new Date(date);

      // Filtrar empréstimos e pagamentos até esta data
      const emprestimosAteData = emprestimos.filter(
        (emp) => emp.dataInicio <= currentDate,
      );
      const pagamentosAteData = pagamentos.filter(
        (pag) => pag.data <= currentDate,
      );

      // Calcular valores acumulados até esta data
      const totalEmprestados = emprestimosAteData.reduce(
        (sum, emp) => sum + emp.principal,
        0,
      );
      const totalRecebido = pagamentosAteData.reduce(
        (sum, pag) => sum + pag.valor,
        0,
      );
      const totalJurosAcumulados = emprestimosAteData.reduce(
        (sum, emp) => sum + emp.jurosAcumulado,
        0,
      );
      const totalAReceber = emprestimosAteData
        .filter((emp) => emp.status !== "quitado")
        .reduce((sum, emp) => sum + emp.saldoDevedor + emp.jurosAcumulado, 0);

      const emprestimosAtivos = emprestimosAteData.filter(
        (emp) => emp.status === "ativo",
      ).length;

      data.push({
        data: formatDate(currentDate),
        totalAReceber: Math.round(totalAReceber),
        jurosAcumulados: Math.round(totalJurosAcumulados),
        totalEmprestados: Math.round(totalEmprestados),
        totalRecebido: Math.round(totalRecebido),
        emprestimosAtivos,
      });
    }

    return data;
  };

  const data = generateTimeSeriesData();

  const formatTooltipValue = (value: number, name: string) => {
    const formattedValue = formatCurrency(value);

    switch (name) {
      case "totalAReceber":
        return [formattedValue, "Total a Receber"];
      case "jurosAcumulados":
        return [formattedValue, "Juros Acumulados"];
      case "totalEmprestados":
        return [formattedValue, "Total Emprestado"];
      case "totalRecebido":
        return [formattedValue, "Total Recebido"];
      case "emprestimosAtivos":
        return [value.toString(), "Empréstimos Ativos"];
      default:
        return [formattedValue, name];
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="data"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value.toString();
            }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalAReceber"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="jurosAcumulados"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              stroke: "hsl(var(--secondary))",
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="totalEmprestados"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--accent))", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="totalRecebido"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
