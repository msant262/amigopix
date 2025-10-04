import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ModernCard, StatCard } from "@/components/ui/modern-card";
import { Loading } from "@/components/ui/loading";
import { TimeRangeFilter, TimeRangeDisplay, TimeRange } from '@/components/ui/time-range-filter';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { getDashboardKPIs } from "@/lib/firebase/firestore";
import { ProximosVencimentos } from "./ProximosVencimentos";
import { TabelaVencimentos } from "./TabelaVencimentos";
import { GraficosDashboard } from "./GraficosDashboard";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const {
    data: kpis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-kpis", user?.uid, timeRange],
    queryFn: () =>
      getDashboardKPIs(user?.role || "cliente", user?.uid, timeRange),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calcular juros do período baseado no timeRange
  const getJurosDoPeriodo = () => {
    if (!kpis) return 0;

    // Para simplificar, vamos usar o valor total de juros acumulados
    // que já está filtrado pelo timeRange na função getDashboardKPIs
    return kpis.valorJurosTotal;
  };

  const getPeriodoDescription = () => {
    switch (timeRange) {
      case "1d":
        return "Juros acumulados hoje";
      case "7d":
        return "Juros acumulados na semana";
      case "30d":
        return "Juros acumulados no mês";
      case "90d":
        return "Juros acumulados no trimestre";
      case "all":
        return "Juros acumulados totais";
      default:
        return "Juros acumulados no período";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Carregando dados do dashboard..." />
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Saldo Total Emprestado",
      value: formatCurrency(kpis.saldoTotalEmprestado),
      icon: DollarSign,
      trend: kpis.saldoTotalEmprestado > 0 ? "up" : "neutral",
      description: "Valor total em aberto",
      color: "text-primary",
    },
    {
      title: "Total a Receber",
      value: formatCurrency(kpis.totalAReceber),
      icon: TrendingUp,
      trend: "up",
      description: "Valor emprestado + juros futuros",
      color: "text-accent",
    },
    {
      title: "Juros do Período",
      value: formatCurrency(getJurosDoPeriodo()),
      icon: BarChart3,
      trend: getJurosDoPeriodo() > 0 ? "up" : "neutral",
      description: getPeriodoDescription(),
      color: "text-secondary",
    },
    {
      title: "Juros Totais",
      value: formatCurrency(kpis.valorTotalEmprestado - kpis.totalAReceber),
      icon: Calendar,
      trend:
        kpis.valorTotalEmprestado - kpis.totalAReceber > 0 ? "up" : "neutral",
      description: "Total emprestado - Total a receber",
      color: "text-violet-500",
    },
  ];

  const statsCards = [
    {
      title: "Empréstimos Ativos",
      value: kpis.emprestimosAtivos.toString(),
      icon: CreditCard,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Empréstimos Atrasados",
      value: kpis.emprestimosAtrasados.toString(),
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Empréstimos Quitados",
      value: kpis.emprestimosQuitados.toString(),
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total de Empréstimos",
      value: kpis.totalEmprestimos.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral dos seus empréstimos e estatísticas
            <TimeRangeDisplay value={timeRange} className="ml-2" />
          </p>
        </div>

        {/* Time Range Selector */}
        <TimeRangeFilter
          value={timeRange}
          onChange={setTimeRange}
          variant="default"
          size="sm"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={<Icon className="h-6 w-6" />}
              trend={card.trend as "up" | "down" | "neutral"}
              color={card.color}
              delay={index * 0.1}
            />
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={<Icon className="h-6 w-6" />}
              color={stat.color}
              delay={index * 0.1}
            />
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Próximos Vencimentos */}
        <ModernCard
          title="Próximos Vencimentos"
          description="Empréstimos que vencem nos próximos 7 dias"
          icon={<Calendar className="h-5 w-5" />}
          delay={0.2}
        >
          <ProximosVencimentos />
        </ModernCard>

        {/* Gráficos */}
        <ModernCard
          title="Distribuição por Status"
          description="Visão geral dos empréstimos por status"
          icon={<PieChart className="h-5 w-5" />}
          delay={0.3}
        >
          <GraficosDashboard kpis={kpis} />
        </ModernCard>
      </div>

      {/* Tabela de Vencimentos */}
      <TabelaVencimentos />

      {/* Full Width Charts */}
      <ModernCard
        title="Evolução Temporal"
        description="Tendências de juros e valores ao longo do tempo"
        icon={<BarChart3 className="h-5 w-5" />}
        delay={0.4}
      >
        <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
          Gráfico de evolução temporal em desenvolvimento
        </div>
      </ModernCard>
    </div>
  );
};
