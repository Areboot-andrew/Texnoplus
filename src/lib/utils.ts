import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBasePath(assetPath: string) {
  if (!assetPath) return assetPath;
  if (/^(https?:)?\/\//.test(assetPath)) return assetPath;

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;

  return `${normalizedBase}${normalizedPath}`;
}
