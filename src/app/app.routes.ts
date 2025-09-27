import { Routes } from '@angular/router';
import { ProductListPageComponent } from './features/products/pages/product-list-page/product-list-page';

export const routes: Routes = [
    { path: 'products', component: ProductListPageComponent },
    { path: '', redirectTo: 'products', pathMatch: 'full' }
];
