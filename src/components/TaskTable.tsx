import type { Task } from '@/types';
import { cn, formatDateLong, isDateOverdue } from '@/lib/utils';
import { Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const checkOverdue = (dueDate: string, status: string) => {
    return isDateOverdue(dueDate) && status !== 'concluída';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Título</TableHead>
            <TableHead className="font-semibold">Descrição</TableHead>
            <TableHead className="font-semibold">Prioridade</TableHead>
            <TableHead className="font-semibold">Previsão</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div className="max-w-[250px]">
                  <span className="line-clamp-2">{task.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[300px]">
                  {task.description ? (
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Sem descrição</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className={cn(
                    'w-3.5 h-3.5',
                    checkOverdue(task.dueDate, task.status) ? 'text-red-500' : 'text-gray-400'
                  )} />
                  <span className={cn(
                    'text-sm whitespace-nowrap',
                    checkOverdue(task.dueDate, task.status)
                      ? 'text-red-600 font-medium'
                      : 'text-gray-700'
                  )}>
                    {formatDateLong(task.dueDate)}
                    {checkOverdue(task.dueDate, task.status) && (
                      <span className="block text-xs text-red-500">Atrasada</span>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
