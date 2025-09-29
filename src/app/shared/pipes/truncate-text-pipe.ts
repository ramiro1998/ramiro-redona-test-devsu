import { Pipe, PipeTransform } from '@angular/core';

export function truncateText(value: string | null | undefined, maxLength: number = 30): string {
  if (value === null || value === undefined || typeof value !== 'string') {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return value.substring(0, maxLength) + '...';
}

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength: number = 30): string {
    return truncateText(value, maxLength);
  }
}
