export function formatRM(amount: number, options?: { sign?: boolean }): string {
  const formatted = amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = options?.sign && amount > 0 ? '+' : '';
  return `${prefix}RM ${formatted}`;
}

export function daysAgo(isoDate: string): number {
  const d = new Date(isoDate);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDateMY(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
