import md5 from 'md5';

/**
 * Gera URL do Gravatar baseada no email
 * @param email - Email do usuário
 * @param size - Tamanho do avatar (padrão: 200)
 * @param defaultImage - Imagem padrão se não tiver Gravatar (padrão: 'identicon')
 * Opções de defaultImage:
 * - 'identicon': Padrão geométrico baseado no hash
 * - 'monsterid': Monstro gerado
 * - 'wavatar': Faces geradas
 * - 'retro': Rostos pixelados estilo 8-bit
 * - 'robohash': Robôs gerados
 * - 'mp': Silhueta genérica (mystery person)
 * - '404': Retorna 404 se não encontrar
 */
export function getGravatarUrl(
  email: string,
  size: number = 200,
  defaultImage: string = 'identicon'
): string {
  if (!email) return '';

  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * Verifica se um email tem Gravatar cadastrado
 * Retorna true se houver imagem, false caso contrário
 */
export async function hasGravatar(email: string): Promise<boolean> {
  try {
    const url = getGravatarUrl(email, 80, '404');
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
