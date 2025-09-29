import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.interface';
import { ProductOptionsComponent } from '../product-option/product-option-component';
import { ProductLogoComponent } from '../product-logo/product-logo';

@Component({
  selector: 'app-product-list-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductOptionsComponent, ProductLogoComponent],
  templateUrl: './product-list-table.html',
  styleUrls: ['./product-list-table.scss'],
})
export class ProductListTableComponent {

  @Input({ required: true }) products: Product[] = [];
  @Input({ required: true }) totalResults: number = 0;
  @Input() totalFilteredResults: number = 0;
  @Input() currentPage: number = 1;
  @Input() recordsPerPage: number = 5;
  @Input() isFirstPage: boolean = true;
  @Input() isLastPage: boolean = true;

  @Output() recordsPerPageChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<1 | -1>();
  @Output() productEdit = new EventEmitter<string>();
  @Output() productDelete = new EventEmitter<string>();

  public readonly pageSizeOptions: number[] = [5, 10, 20];

  onSelectChange(event: any): void {
    const valueString = event.target.value;
    const size = parseInt(valueString, 10);
    this.recordsPerPageChange.emit(size);
  }

  onPreviousPage(): void {
    this.pageChange.emit(-1);
  }

  onNextPage(): void {
    this.pageChange.emit(1);
  }

  onProductEdit(id: string): void {
    this.productEdit.emit(id);
  }

  onProductDelete(id: string): void {
    this.productDelete.emit(id);
  }

}