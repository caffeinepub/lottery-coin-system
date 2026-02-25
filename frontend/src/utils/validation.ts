export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
}

export function validateMinAmount(amount: number, min: number, fieldName = 'Amount'): string | null {
  if (isNaN(amount) || amount <= 0) return `${fieldName} must be a positive number`;
  if (amount < min) return `${fieldName} must be at least ${min} coins`;
  return null;
}

export function validateTicketNumber(number: string, digitCount: number): string | null {
  if (!number) return 'Ticket number is required';
  if (number.length !== digitCount) return `Ticket number must be exactly ${digitCount} digits`;
  if (!/^\d+$/.test(number)) return 'Ticket number must contain only digits';
  return null;
}

export function formatTime(time: bigint): Date {
  return new Date(Number(time) / 1_000_000);
}

export function formatCoins(amount: bigint): string {
  return Number(amount).toLocaleString();
}

export function formatDate(time: bigint): string {
  return formatTime(time).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function hashPassword(password: string): string {
  // Simple hash for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + password.length.toString(16);
}
