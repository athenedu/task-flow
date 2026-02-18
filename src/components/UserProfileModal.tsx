import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from './UserAvatar';
import { Loader2, ExternalLink } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setDisplayName((data as any).display_name || '');
        setAvatarUrl((data as any).avatar_url || '');
      } else {
        // Criar perfil com valores padrão
        setDisplayName(user.email?.split('@')[0] || '');
        setAvatarUrl('');
      }
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: upsertError } = await (supabase
        .from('user_profiles') as any)
        .upsert({
          id: user.id,
          display_name: displayName.trim() || user.email?.split('@')[0],
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;

      setSuccess('Perfil atualizado com sucesso!');

      // Notificar atualização
      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      setError(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-3 mb-6">
              <UserAvatar
                name={displayName || user?.email?.split('@')[0]}
                email={user?.email}
                avatarUrl={avatarUrl}
                size="lg"
                showName={false}
              />
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Seu avatar vem do{' '}
                  <a
                    href="https://gravatar.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3881ec] hover:underline inline-flex items-center gap-1"
                  >
                    Gravatar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Cadastre seu email lá para usar sua foto em todos os sites
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como você quer ser chamado?"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Este é o nome que aparecerá para outros usuários
              </p>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
                Opções avançadas
              </summary>
              <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                <Label htmlFor="avatarUrl">URL de Avatar Customizado (opcional)</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500">
                  Use isso apenas se quiser substituir seu avatar do Gravatar
                </p>
              </div>
            </details>

            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#3881ec] hover:bg-[#1a5ec8]"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Perfil'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
