import { format, subDays } from 'date-fns';

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'dd/MM/yyyy');
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'dd/MM/yyyy HH:mm');
}

export function formatLastActivity(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return formatDate(timestamp);
}

export function getActivityColor(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60));
  
  if (days <= 2) return 'text-green-400';
  if (days <= 7) return 'text-yellow-400';
  if (days <= 14) return 'text-orange-400';
  return 'text-red-400';
}

export function isOnline(timestamp: number): boolean {
  const now = Date.now() / 1000;
  return (now - timestamp) < (15 * 60); // 15 minutes
}

export function getLast30Days(): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return Math.floor(date.getTime() / 1000);
  });
}