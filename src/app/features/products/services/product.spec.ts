import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product';
import { environment } from '../../../environment/environment';
import { Product } from '../models/product.interface';
import { ApiResponse } from '../models/apiResponse.interface';
import { HttpErrorResponse } from '@angular/common/http';

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/bp/products`;

  const mockProduct: Product = {
    id: 'test-id',
    name: 'Test Product',
    description: 'A test description',
    logo: 'logo.jpg',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('debe obtener la lista de productos y retornar data', (done) => {
    const mockResponse: ApiResponse<Product[]> = {
      data: [mockProduct],
    };

    service.getProducts().subscribe(products => {
      expect(products).toEqual([mockProduct]);
      done();
    });

    const req = httpTestingController.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debe realizar una petición POST para crear un producto', (done) => {
    service.createProduct(mockProduct).subscribe(response => {
      expect(response).toBeTruthy();
      done();
    });

    const req = httpTestingController.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProduct);
    req.flush({ data: mockProduct, message: 'Created' });
  });

  it('debe realizar una petición PUT para actualizar un producto', (done) => {
    service.updateProduct(mockProduct).subscribe(response => {
      expect(response).toBeTruthy();
      done();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/${mockProduct.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProduct);
    req.flush({ data: mockProduct, message: 'Updated' });
  });

  it('debe verificar si un ID existe y retornar false en caso de error (catchError)', (done) => {
    service.verifyId('new-id').subscribe(exists => {
      expect(exists).toBe(false);
      done();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/verification/new-id`);
    expect(req.request.method).toBe('GET');

    const mockError = new ProgressEvent('error');
    req.error(mockError as any);
  });

  it('debe verificar si un ID existe y retornar el valor booleano', (done) => {
    service.verifyId('exists').subscribe(exists => {
      expect(exists).toBe(true);
      done();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/verification/exists`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('debe manejar error en getProductById lanzando una excepción', (done) => {
    service.getProductById('unknown').subscribe({
      next: () => fail('Se esperaba un error'),
      error: (error) => {
        expect(error.message).toContain('Producto no encontrado.');
        done();
      },
    });

    const req = httpTestingController.expectOne(`${baseUrl}/unknown`);
    expect(req.request.method).toBe('GET');
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
  });

  it('debe manejar error en deleteProduct lanzando una excepción', (done) => {
    service.deleteProduct('error-id').subscribe({
      next: () => fail('Se esperaba un error'),
      error: (error) => {
        expect(error.message).toContain('Error en la eliminación del producto.');
        done();
      },
    });

    const req = httpTestingController.expectOne(`${baseUrl}/error-id`);
    expect(req.request.method).toBe('DELETE');
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
  });

});