import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { ProductFormComponent } from '../../components/product-form/product-form';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormComponent,
  ],
  templateUrl: './product-registration-page.html',
  styleUrls: ['./product-registration-page.scss']
})
export class ProductRegistrationPageComponent {

  public isSubmitting = false;
  public errorMessage: string | null = null;
  private subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }


  onCreateProduct(newProduct: Product): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    console.log('Intentando registrar producto:', newProduct);

    this.subscription.add(
      this.productService.createProduct(newProduct).pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(error => {
          console.error('❌ Error al registrar el producto:', error);
          this.errorMessage = 'Hubo un error al intentar crear el producto. Inténtalo de nuevo.';
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          console.log('✅ Producto creado con éxito:', response);
          alert(`Producto ${response.name} creado exitosamente.`);
          this.router.navigate(['/']);
        }
      })
    );
  }

  onFormReset(): void {
    this.errorMessage = null;
    console.log('🔄 Formulario Reiniciado');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}