import { format } from 'date-fns';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Standard name for exported files: inspection-<producer>-<yyyy-MM-dd>, with
 * an optional suffix for the other reports (e.g. "photos").
 */
export function reportFileName(
  producerName: string,
  date: Date,
  suffix?: string,
): string {
  const parts = [
    'inspection',
    slugify(producerName) || 'area',
    format(date, 'yyyy-MM-dd'),
  ];
  if (suffix) parts.push(suffix);
  return parts.join('-');
}
