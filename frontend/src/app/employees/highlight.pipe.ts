import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, search: string): string {
    if (!value) {
      return '';
    }

    const escapedValue = this.escapeHtml(value);
    const tokens = search
      .trim()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (!tokens.length) {
      return escapedValue;
    }

    const pattern = tokens.map((token) => this.escapeRegex(token)).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return escapedValue.replace(regex, '<mark>$1</mark>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
