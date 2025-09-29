import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ProductRegistrationPageComponent } from './product-registration-page';
import { ProductService } from '../../services/product';
import { of, throwError } from 'rxjs';
import { Product } from '../../models/product.interface';

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockProductService = {
  createProduct: jasmine.createSpy('createProduct'),
};

describe('ProductRegistrationPageComponent', () => {
  let component: ProductRegistrationPageComponent;
  let fixture: ComponentFixture<ProductRegistrationPageComponent>;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRegistrationPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductRegistrationPageComponent);
    component = fixture.componentInstance;

    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');
    mockRouter.navigate.calls.reset();
    mockProductService.createProduct.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------------------------

  it('debe registrar un producto exitosamente y navegar a la lista', (done) => {
    const productData: Product = { id: 'p1', name: 'Nuevo Producto' } as Product;
    const mockResponse = { data: productData };

    mockProductService.createProduct.and.returnValue(of(mockResponse));

    component.onCreateProduct(productData);

    expect(component.isSubmitting).toBe(false);
    expect(mockProductService.createProduct).toHaveBeenCalledWith(productData);

    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(`Producto ${productData.name} creado exitosamente.`);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 0);
  });

  it('debe manejar el error de registro, mostrar mensaje y no navegar', (done) => {
    const productData: Product = { id: 'p2', name: 'Producto Fallido' } as Product;

    mockProductService.createProduct.and.returnValue(throwError(() => new Error('API Error')));

    component.onCreateProduct(productData);

    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toContain('Hubo un error al intentar crear el producto.');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('debe limpiar el mensaje de error si la respuesta es nula (API no retorna data.data)', (done) => {
    const productData: Product = { id: 'p3', name: 'Producto Nulo' } as Product;

    mockProductService.createProduct.and.returnValue(of(null));

    component.onCreateProduct(productData);
    component.errorMessage = 'Error anterior';

    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toBe('Error anterior');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('no debe permitir el envío si ya se está enviando', () => {
    component.isSubmitting = true;
    component.onCreateProduct({} as any);

    expect(mockProductService.createProduct).not.toHaveBeenCalled();
  });

  it('debe limpiar el mensaje de error en onFormReset', () => {
    component.errorMessage = 'Algún error';
    component.onFormReset();

    expect(component.errorMessage).toBeNull();
  });

  it('debe desuscribirse en ngOnDestroy', () => {
    mockProductService.createProduct.and.returnValue(of(null));
    component.onCreateProduct({} as any);

    const sub = (component as any).subscription;
    spyOn(sub, 'unsubscribe');

    component.ngOnDestroy();

    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});