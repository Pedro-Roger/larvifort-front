import type { Task } from '@/types/kanban';

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function lexorankGenerate(index: number): string {
  let rank = '';
  let num = index + 1;
  while (num > 0) {
    rank = CHARS[num % 62] + rank;
    num = Math.floor(num / 62);
  }
  return rank.padStart(4, '0');
}

export function lexorankBetween(prev: string | null, next: string | null): string {
  if (!prev && !next) return '0000';
  if (!prev) return decrement(next!);
  if (!next) return increment(prev);

  let result = '';
  for (let i = 0; i < Math.max(prev.length, next.length); i++) {
    const p = CHARS.indexOf(prev[i] || '0');
    const n = CHARS.indexOf(next[i] || CHARS[CHARS.length - 1]);
    if (n - p > 1) {
      result += CHARS[p + Math.floor((n - p) / 2)];
      break;
    }
    result += CHARS[p];
  }
  return result.padStart(4, '0') || increment(prev);
}

function increment(s: string): string {
  const arr = s.split('').map((c) => CHARS.indexOf(c));
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] < CHARS.length - 1) {
      arr[i]++;
      break;
    }
    arr[i] = 0;
  }
  return arr.map((i) => CHARS[i]).join('');
}

function decrement(s: string): string {
  const arr = s.split('').map((c) => CHARS.indexOf(c));
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] > 0) {
      arr[i]--;
      break;
    }
    arr[i] = CHARS.length - 1;
  }
  return arr.map((i) => CHARS[i]).join('');
}

export function calculateLexoRank(_tasks: Task[], clientY: number): string {
  const index = Math.floor(clientY / 80);
  return lexorankGenerate(Math.max(0, index));
}