import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date, format = 'DD MMM YYYY') {
  if (!date) return '';
  const dayjs = require('dayjs');
  return dayjs(date).format(format);
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}
