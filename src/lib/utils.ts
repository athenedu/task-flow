import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data (YYYY-MM-DD) em um objeto Date considerando a timezone local.
 * Evita problemas de conversão para UTC que podem alterar a data.
 */
export function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data no formato YYYY-MM-DD considerando a timezone local
 */
export function formatDateForInput(dateString?: string): string {
  const date = dateString ? parseDateLocal(dateString) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data para exibição em português (ex: "18 fev")
 */
export function formatDateShort(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/**
 * Formata uma data para exibição completa em português (ex: "18 fev 2026")
 */
export function formatDateLong(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Verifica se uma data está atrasada (passada em relação à data atual)
 */
export function isDateOverdue(dateString: string): boolean {
  const dueDate = parseDateLocal(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}
