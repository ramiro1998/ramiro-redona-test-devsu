import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map, startWith, switchMap, tap, catchError, of, shareReplay, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../shared/components/search/search';
import { ProductListTableComponent } from '../../components/product-list-table/product-list-table';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product';
import { Router, RouterModule } from '@angular/router';
import { GenericModalData } from '../../../../shared/models/modal-options.interface';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal-component/confirmation-modal-component';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    ProductListTableComponent,
    ConfirmationModalComponent,
    RouterModule
  ],
  templateUrl: './product-list-page.html',
  styleUrls: ['./product-list-page.scss']
})
export class ProductListPageComponent implements OnInit {

  public isLoading = new BehaviorSubject<boolean>(true);
  public filteredProducts$: Observable<Product[]> = of([]);
  public totalResults$: Observable<number> = of(0);

  private searchTerm$ = new BehaviorSubject<string>('');
  private rawProducts: Product[] = [];
  private productData$ = new BehaviorSubject<Product[]>([]);

  public currentPage$ = new BehaviorSubject<number>(1);
  public recordsPerPage$ = new BehaviorSubject<number>(5);

  public totalFilteredResults$: Observable<number> = of(0);
  public isFirstPage$: Observable<boolean> = of(true);
  public isLastPage$: Observable<boolean> = of(true);

  private subscription = new Subscription();

  public showModal: boolean = false;
  public modalData!: GenericModalData;
  public productIdToDelete: string | null = null;

  constructor(private productApiService: ProductService, private router: Router) { }

  ngOnInit(): void {

    this.loadProducts()

    this.subscription.add(
      this.productApiService.getProducts().pipe(
        tap(products => {
          this.rawProducts = products;
          this.isLoading.next(false);
          this.productData$.next(products);
        }),
        catchError(error => {
          this.isLoading.next(false);
          return of([]);
        })
      ).subscribe()
    );

    const allFilteredData$ = combineLatest([
      this.productData$,
      this.searchTerm$
    ]).pipe(
      map(([products, searchTerm]) => {
        if (!searchTerm) {
          return products;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return products.filter(product =>
          product.name.toLowerCase().includes(lowerCaseSearch)
        );
      }),
      shareReplay(1)
    );

    this.totalFilteredResults$ = allFilteredData$.pipe(
      map(products => products.length),
      shareReplay(1)
    );

    this.filteredProducts$ = combineLatest([
      allFilteredData$,
      this.currentPage$,
      this.recordsPerPage$
    ]).pipe(
      map(([products, currentPage, recordsPerPage]) => {
        const start = (currentPage - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        return products.slice(start, end);
      }),
      shareReplay(1)
    );

    this.isFirstPage$ = this.currentPage$.pipe(
      map(currentPage => currentPage === 1),
      startWith(true),
      shareReplay(1)
    );

    this.isLastPage$ = combineLatest([
      this.currentPage$,
      this.recordsPerPage$,
      this.totalFilteredResults$
    ]).pipe(
      map(([currentPage, recordsPerPage, totalResults]) => {
        if (totalResults === 0) return true;
        const totalPages = Math.ceil(totalResults / recordsPerPage);
        return currentPage >= totalPages;
      }),
      startWith(true),
      shareReplay(1)
    );
  }

  loadProducts(): void {
    this.subscription.add(
      this.productApiService.getProducts().pipe(
        tap(products => {
          this.rawProducts = products;
          this.isLoading.next(false);
          this.productData$.next(products);
        }),
        catchError(error => {
          this.isLoading.next(false);
          return of([]);
        })
      ).subscribe()
    );
  }

  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  onRecordsPerPageChange(size: number): void {
    this.recordsPerPage$.next(size);
    this.currentPage$.next(1);
  }

  onPageChange(direction: 1 | -1): void {
    const nextPage = this.currentPage$.value + direction;
    this.currentPage$.next(nextPage);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/product/edit', id]);
  }

  onProductDelete(id: string): void {
    const product = this.rawProducts.find(p => p.id === id);
    if (product) {
      this.productIdToDelete = id;

      this.modalData = {
        message: `¿Estás seguro de eliminar el producto '${product.name}'?`,
        buttons: [
          { label: 'Cancelar', role: 'cancel', styleClass: 'btn-secondary' },
          { label: 'Confirmar', role: 'confirm', styleClass: 'btn-primary btn-confirm' }
        ]
      };

      this.showModal = true;
    }
  }

  handleModalAction(role: any): void {
    if (role === 'confirm' && this.productIdToDelete) {
      this.executeDelete();
    } else {
      this.closeModal();
    }
  }

  executeDelete(): void {
    this.productApiService.deleteProduct(this.productIdToDelete!).subscribe({
      next: () => {
        alert(`Producto eliminado correctamente.`);
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => {
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.productIdToDelete = null;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}