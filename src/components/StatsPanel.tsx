import type { Status, Priority } from '@/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    total: number;
    byStatus: Record<Status, number>;
    byPriority: Record<Priority, number>;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const completedTasks = stats.byStatus['concluída'];
  const inProgressTasks = stats.byStatus['iniciada'] + stats.byStatus['em preparação'] + stats.byStatus['em revisão'];
  const completionRate = stats.total > 0 ? Math.round((completedTasks / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[#3881ec]" />
        <h3 className="font-semibold text-gray-900">Resumo</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#f4f8fc] rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{completedTasks}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{inProgressTasks}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Taxa</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Por Status
          </h4>
          <div className="space-y-1.5">
            {(Object.keys(stats.byStatus) as Status[]).map((status) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm font-medium text-gray-700">
                  {stats.byStatus[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Por Prioridade
          </h4>
          <div className="space-y-1.5">
            {(Object.keys(stats.byPriority) as Priority[]).map((priority) => (
              <div key={priority} className="flex items-center justify-between">
                <PriorityBadge priority={priority} />
                <span className="text-sm font-medium text-gray-700">
                  {stats.byPriority[priority]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
