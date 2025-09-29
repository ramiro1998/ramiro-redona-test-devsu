import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductEditPageComponent } from './product-edit-page';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockProduct: Product = {
  id: 'XYZ-123',
  name: 'Test Product',
  description: 'A test description',
  logo: 'logo.jpg',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockProductService = {
  getProductById: jasmine.createSpy('getProductById'),
  updateProduct: jasmine.createSpy('updateProduct'),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: convertToParamMap({ id: 'XYZ-123' }),
  },
};

describe('ProductEditPageComponent', () => {
  let component: ProductEditPageComponent;
  let fixture: ComponentFixture<ProductEditPageComponent>;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEditPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: ProductService, useValue: mockProductService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductEditPageComponent);
    component = fixture.componentInstance;

    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');
    mockRouter.navigate.calls.reset();
    mockProductService.getProductById.calls.reset();
    mockProductService.updateProduct.calls.reset();
  });

  it('should create', () => {
    mockProductService.getProductById.and.returnValue(of(mockProduct));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  it('debe cargar el producto al inicializar si el ID es válido', () => {
    mockProductService.getProductById.and.returnValue(of(mockProduct));
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.productToEdit).toEqual(mockProduct);
    expect(mockProductService.getProductById).toHaveBeenCalledWith('XYZ-123');
  });

  it('debe manejar error al cargar el producto y navegar a la raíz', () => {
    mockProductService.getProductById.and.returnValue(throwError(() => new Error('404')));
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.productToEdit).toBeNull();
    expect(component.errorMessage).toContain('No se pudo cargar el producto.');
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debe navegar a la raíz si no hay ID en la ruta', async () => {
    TestBed.resetTestingModule();

    const mockActivatedRouteWithoutId = {
      snapshot: {
        paramMap: convertToParamMap({}),
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProductEditPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRouteWithoutId },
        { provide: Router, useValue: mockRouter },
        { provide: ProductService, useValue: mockProductService },
      ]
    }).compileComponents();

    const fixtureWithoutId = TestBed.createComponent(ProductEditPageComponent);
    const componentWithoutId = fixtureWithoutId.componentInstance;

    fixtureWithoutId.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });


  it('debe actualizar el producto exitosamente y navegar a la lista', (done) => {
    const updatedData = { ...mockProduct, name: 'Updated' };
    const mockResponse = { data: updatedData, message: 'Updated' };
    mockProductService.updateProduct.and.returnValue(of(mockResponse));

    component.onUpdateProduct(updatedData);

    expect(component.isSubmitting).toBe(false);
    expect(mockProductService.updateProduct).toHaveBeenCalledWith(updatedData);

    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(`Producto ${updatedData.name} actualizado exitosamente.`);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 0);
  });

  it('debe manejar el error de actualización y mostrar mensaje sin navegar', (done) => {
    const errorData = { ...mockProduct, name: 'Error Update' };
    mockProductService.updateProduct.and.returnValue(throwError(() => new Error('500')));

    component.onUpdateProduct(errorData);

    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toContain('Hubo un error al actualizar el producto.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('no debe permitir la actualización si isSubmitting es true', () => {
    component.isSubmitting = true;
    component.onUpdateProduct({} as Product);

    expect(mockProductService.updateProduct).not.toHaveBeenCalled();
  });

  it('debe limpiar el mensaje de error en onFormReset', () => {
    component.errorMessage = 'Algún error';
    component.onFormReset();

    expect(component.errorMessage).toBeNull();
  });

  it('debe desuscribirse en ngOnDestroy', () => {
    mockProductService.getProductById.and.returnValue(of(mockProduct));
    fixture.detectChanges();

    const sub = (component as any).subscription;
    spyOn(sub, 'unsubscribe');

    component.ngOnDestroy();

    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});