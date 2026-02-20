import { useState } from 'react';
import type { Status } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StatusChangeCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  newStatus: Status;
}

export function StatusChangeCommentModal({
  isOpen,
  onClose,
  onConfirm,
  newStatus
}: StatusChangeCommentModalProps) {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment.trim());
    setComment('');
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  const handleSkip = () => {
    onConfirm('');
    setComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterando Status</DialogTitle>
          <DialogDescription>
            Status será alterado para: <strong>{newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= 140) {
                  setComment(e.target.value);
                }
              }}
              placeholder="Adicione um comentário sobre esta mudança..."
              rows={3}
              maxLength={140}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/140 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-600"
            >
              Pular
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-[#3881ec] hover:bg-[#1a5ec8]"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
