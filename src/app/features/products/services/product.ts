import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.interface';
import { environment } from '../../../environment/environment'
import { ApiResponse } from '../models/apiResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) { }


  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse>(`${environment.apiUrl}/bp/products`).pipe(
      map(response => response.data)
    );

  }

}