import { useEffect, useState } from 'react';
import type { TaskStatusHistory, AppUser, Status } from '@/types';
import { formatDate } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { StatusBadge } from './StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Calendar, MessageSquare } from 'lucide-react';

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  users: AppUser[];
  loadHistory: (taskId: string) => Promise<TaskStatusHistory[]>;
}

export function TaskHistoryModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  users,
  loadHistory
}: TaskHistoryModalProps) {
  const [history, setHistory] = useState<TaskStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      loadHistory(taskId)
        .then(setHistory)
        .finally(() => setLoading(false));
    }
  }, [isOpen, taskId, loadHistory]);

  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Alterações</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{taskTitle}</p>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="w-8 h-8" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma alteração de status registrada ainda.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {history.map((entry) => {
                  const user = getUserInfo(entry.changedBy);
                  return (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          name={user?.name}
                          email={user?.email}
                          avatarUrl={user?.avatar_url}
                          size="sm"
                          showName={false}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-gray-900">
                              {user?.name || user?.email || 'Usuário desconhecido'}
                            </span>
                            {entry.previousStatus && (
                              <>
                                <span className="text-gray-400">alterou de</span>
                                <StatusBadge status={entry.previousStatus as Status} />
                                <span className="text-gray-400">para</span>
                              </>
                            )}
                            {!entry.previousStatus && (
                              <span className="text-gray-400">definiu status como</span>
                            )}
                            <StatusBadge status={entry.newStatus as Status} />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(entry.createdAt)}</span>
                          </div>

                          {entry.comment && (
                            <div className="mt-2 bg-gray-100 rounded-md p-3">
                              <p className="text-sm text-gray-700 italic">
                                "{entry.comment}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3881ec]"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
