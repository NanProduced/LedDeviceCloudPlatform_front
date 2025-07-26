import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并类名，解决Tailwind类冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

/**
 * 截断文本
 */
export function truncateText(text: string, length: number) {
  if (!text) return ""
  return text.length > length ? `${text.substring(0, length)}...` : text
} 