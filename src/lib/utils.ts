import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn: combina classes Tailwind de forma segura, resolvendo conflitos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Gera cor consistente baseada no nome do contato
export function getContactColor(name?: string | null): string {
  const colors = [
    'hsl(25, 95%, 53%)', // laranja
    'hsl(199, 89%, 48%)', // azul
    'hsl(142, 76%, 36%)', // verde
    'hsl(262, 83%, 58%)', // roxo
    'hsl(346, 87%, 49%)', // vermelho/rosa
    'hsl(45, 93%, 47%)', // amarelo/âmbar
    'hsl(187, 85%, 43%)', // ciano
    'hsl(30, 91%, 50%)', // âmbar
  ];

  if (!name) return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
