import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, Subscription, tap } from 'rxjs';
import { Product } from '../../models/product.interface';
import { ProductFormComponent } from '../../components/product-form/product-form';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-edit-page',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-edit-page.html',
  styleUrls: ['./product-edit-page.scss']
})
export class ProductEditPageComponent implements OnInit, OnDestroy {

  public productToEdit: Product | null = null;
  public isLoading = true;
  public isSubmitting = false;
  public errorMessage: string | null = null;
  private productId: string = '';
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';

    if (this.productId) {
      this.subscription.add(
        this.productService.getProductById(this.productId).pipe(
          tap(product => {
            this.productToEdit = product;
            this.isLoading = false;
          }),
          catchError(error => {
            console.error('Error cargando producto para edición:', error);
            this.errorMessage = 'No se pudo cargar el producto. Verifique el ID.';
            this.isLoading = false;
            this.router.navigate(['/']);
            return of(null);
          })
        ).subscribe()
      );
    } else {
      this.router.navigate(['/']);
    }
  }

  onUpdateProduct(updatedProduct: Product): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    this.subscription.add(
      this.productService.updateProduct(updatedProduct).pipe(
        finalize(() => this.isSubmitting = false),
        catchError(error => {
          this.errorMessage = 'Hubo un error al actualizar el producto.';
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          alert(`Producto ${response.name} actualizado exitosamente.`);
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}