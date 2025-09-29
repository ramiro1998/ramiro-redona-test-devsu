import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductListPageComponent } from './product-list-page';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockProducts: Product[] = [
  { id: 'p1', name: 'Banco 1', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p2', name: 'Tarjeta 2', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p3', name: 'Crédito 3', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p4', name: 'Banco 4', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p5', name: 'Tarjeta 5', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p6', name: 'Crédito 6', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p7', name: 'Prueba 7', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p8', name: 'Prueba 8', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p9', name: 'Prueba 9', description: '', logo: '', date_release: '', date_revision: '' },
  { id: 'p10', name: 'Prueba 10', description: '', logo: '', date_release: '', date_revision: '' },
];

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: () => null
    }
  }
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockProductService = {
  getProducts: jasmine.createSpy('getProducts'),
  deleteProduct: jasmine.createSpy('deleteProduct'),
};

describe('ProductListPageComponent', () => {
  let component: ProductListPageComponent;
  let fixture: ComponentFixture<ProductListPageComponent>;
  let alertSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPageComponent);
    component = fixture.componentInstance;

    mockProductService.getProducts.and.returnValue(of(mockProducts));
    mockProductService.deleteProduct.calls.reset();
    mockRouter.navigate.calls.reset();
    alertSpy = spyOn(window, 'alert');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar productos y actualizar el estado de carga al inicializar', (done) => {
    component.isLoading.subscribe(isLoading => {
      if (!isLoading) {
        component.totalFilteredResults$.subscribe(count => {
          expect(count).toBe(10);
          done();
        });
      }
    });
    expect(mockProductService.getProducts).toHaveBeenCalled()
    component.isLoading.subscribe(val => expect(val).toBe(false)).unsubscribe();
  });

  it('debe manejar errores de carga y terminar el estado de carga', (done) => {
    mockProductService.getProducts.and.returnValue(throwError(() => new Error('API Fail')));

    component.ngOnInit();

    component.isLoading.subscribe(val => {
      if (!val) {
        component.totalFilteredResults$.subscribe(count => {
          expect(count).toBe(10);
          done();
        });
      }
    }).unsubscribe();
  });

  it('debe filtrar los productos correctamente por término de búsqueda', (done) => {
    component.onSearch('Banco');

    component.totalFilteredResults$.subscribe(count => {
      expect(count).toBe(2);
    }).unsubscribe();

    component.filteredProducts$.subscribe(products => {
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Banco 1');
      done();
    }).unsubscribe();
  });

  it('debe filtrar correctamente con mayúsculas/minúsculas', (done) => {
    component.onSearch('TARJETA');

    component.totalFilteredResults$.subscribe(count => {
      expect(count).toBe(2);
      done();
    }).unsubscribe();
  });

  it('debe mostrar la primera página de 5 registros al inicio', (done) => {
    component.filteredProducts$.subscribe(products => {
      expect(products.length).toBe(5);
      expect(products[0].id).toBe('p1');
      expect(component.currentPage$.value).toBe(1);
      done();
    }).unsubscribe();
  });

  it('debe cambiar de página correctamente', (done) => {
    component.onPageChange(1);

    component.currentPage$.subscribe(page => expect(page).toBe(2)).unsubscribe();

    component.filteredProducts$.subscribe(products => {
      expect(products.length).toBe(5);
      expect(products[0].id).toBe('p6');
      done();
    }).unsubscribe();
  });

  it('debe recalcular la paginación al cambiar el tamaño de registros por página', (done) => {
    component.onRecordsPerPageChange(10);

    component.recordsPerPage$.subscribe(size => expect(size).toBe(10)).unsubscribe();
    component.currentPage$.subscribe(page => expect(page).toBe(1)).unsubscribe();

    component.filteredProducts$.subscribe(products => {
      expect(products.length).toBe(10);
      done();
    }).unsubscribe();
  });

  it('isLastPage$ debe ser true en la última página', (done) => {
    component.onRecordsPerPageChange(5);
    component.onPageChange(1);

    component.isLastPage$.subscribe(isLast => {
      expect(isLast).toBe(true);
      done();
    }).unsubscribe();
  });

  it('isFirstPage$ debe ser true en la primera página', (done) => {
    component.isFirstPage$.subscribe(isFirst => {
      expect(isFirst).toBe(true);
      done();
    }).unsubscribe();
  });


  it('navigateToEdit debe llamar a router.navigate con el ID correcto', () => {
    component.navigateToEdit('test-id-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/product/edit', 'test-id-1']);
  });

  it('onProductDelete debe configurar el modal correctamente', () => {
    component.onProductDelete('p1');

    expect(component.showModal).toBe(true);
    expect(component.productIdToDelete).toBe('p1');
    expect(component.modalData.message).toContain('Banco 1');
  });

  it('handleModalAction con confirm debe ejecutar la eliminación', () => {
    component.productIdToDelete = 'p1';
    spyOn(component, 'executeDelete');

    component.handleModalAction('confirm');

    expect(component.executeDelete).toHaveBeenCalled();
  });

  it('handleModalAction con cancel debe solo cerrar el modal', () => {
    component.productIdToDelete = 'p1';
    spyOn(component, 'closeModal');
    spyOn(component, 'executeDelete');

    component.handleModalAction('cancel');

    expect(component.executeDelete).not.toHaveBeenCalled();
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('executeDelete debe eliminar, alertar, cerrar modal y recargar productos', () => {
    mockProductService.deleteProduct.and.returnValue(of(null));
    spyOn(component, 'loadProducts');

    component.productIdToDelete = 'p1';
    component.executeDelete();

    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('p1');
    expect(alertSpy).toHaveBeenCalledWith('Producto eliminado correctamente.');
    expect(component.showModal).toBe(false);
    expect(component.productIdToDelete).toBeNull();
    expect(component.loadProducts).toHaveBeenCalled();
  });

  it('executeDelete debe cerrar el modal en caso de error de eliminación', () => {
    mockProductService.deleteProduct.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'closeModal');
    spyOn(component, 'loadProducts');

    component.productIdToDelete = 'p1';
    component.executeDelete();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.loadProducts).not.toHaveBeenCalled();
  });

  it('debe desuscribirse en ngOnDestroy', () => {
    const sub = (component as any).subscription;
    spyOn(sub, 'unsubscribe');

    component.ngOnDestroy();

    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});