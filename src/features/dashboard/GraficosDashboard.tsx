import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { DashboardKPIs } from '@/types';

interface GraficosDashboardProps {
  kpis: DashboardKPIs;
}

export const GraficosDashboard: React.FC<GraficosDashboardProps> = ({ kpis }) => {
  // Data for status distribution pie chart
  const statusData = [
    {
      name: 'Ativos',
      value: kpis.emprestimosAtivos,
      color: '#22c55e', // accent color
      percentage: kpis.totalEmprestimos > 0 ? (kpis.emprestimosAtivos / kpis.totalEmprestimos * 100).toFixed(1) : '0',
    },
    {
      name: 'Atrasados',
      value: kpis.emprestimosAtrasados,
      color: '#ef4444', // destructive color
      percentage: kpis.totalEmprestimos > 0 ? (kpis.emprestimosAtrasados / kpis.totalEmprestimos * 100).toFixed(1) : '0',
    },
    {
      name: 'Quitados',
      value: kpis.emprestimosQuitados,
      color: '#f97316', // secondary color
      percentage: kpis.totalEmprestimos > 0 ? (kpis.emprestimosQuitados / kpis.totalEmprestimos * 100).toFixed(1) : '0',
    },
  ];

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Quantidade: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentual: {data.payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  if (kpis.totalEmprestimos === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum empréstimo encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Distribution Pie Chart */}
      <div>
        <h4 className="text-sm font-medium mb-4">Distribuição por Status</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(kpis.valorTotalEmprestado)}
          </p>
          <p className="text-sm text-muted-foreground">Valor Total Emprestado</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">
            {formatCurrency(kpis.valorJurosTotal)}
          </p>
          <p className="text-sm text-muted-foreground">Juros Acumulados</p>
        </div>
      </div>
    </div>
  );
};
