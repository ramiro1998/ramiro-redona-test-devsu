import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../models/product.interface';
import { environment } from '../../../environment/environment'
import { ApiResponse } from '../models/apiResponse.interface';
import { IdVerificationResponse } from '../models/idVerificationResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) { }


  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${environment.apiUrl}/bp/products`).pipe(
      map(response => response.data)
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/bp/products`, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/bp/products`, product);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.apiUrl}/bp/products/verification/${id}`
    ).pipe(
      catchError(() => of(false))
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(
      `${environment.apiUrl}/bp/products/${id}`
    ).pipe(
      map(response => {
        return response
      }),
      catchError(error => {
        console.error(`Error al obtener producto con ID ${id}:`, error);
        throw new Error(`Producto no encontrado.`);
      })
    );
  }

}