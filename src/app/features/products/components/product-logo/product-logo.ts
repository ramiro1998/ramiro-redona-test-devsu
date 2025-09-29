import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-logo-container">
      <ng-container>
        <div class="logo-initials">{{ getInitials() }}</div>
      </ng-container>

  `,
  styleUrls: ['./product-logo.scss']
})
export class ProductLogoComponent {

  @Input() productName: string = 'Producto';

  getInitials(): string {
    const parts = this.productName.split(' ');
    let initials = '';

    if (parts.length > 0 && parts[0].length > 0) {
      initials += parts[0][0];
    }
    if (parts.length > 1 && parts[1].length > 0) {
      initials += parts[1][0];
    }

    if (initials.length === 0 && this.productName.length >= 2) {
      initials = this.productName.substring(0, 2);
    }

    return initials.toUpperCase() || 'P';
  }
}