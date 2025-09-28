import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-options',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="options-container">
      <button class="options-button" (click)="toggleMenu()">
        &#x22EE; 
      </button>

      <div class="dropdown-menu" [class.open]="isOpen">
        <button (click)="onEdit()" class="menu-item">Editar</button>
        <button (click)="onDelete()" class="menu-item">Eliminar</button>
      </div>
    </div>
  `,
  styleUrls: ['./product-option-component.scss']
})
export class ProductOptionsComponent {

  @Input({ required: true }) productId: string = '';

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  public isOpen: boolean = false;

  constructor(private el: ElementRef) { }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  onEdit(): void {
    this.edit.emit(this.productId);
    this.isOpen = false;
  }

  onDelete(): void {
    this.delete.emit(this.productId);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}