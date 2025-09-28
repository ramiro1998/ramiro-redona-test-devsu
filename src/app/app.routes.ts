import { Routes } from '@angular/router';
import { ProductListPageComponent } from './features/products/pages/product-list-page/product-list-page';
import { ProductRegistrationPageComponent } from './features/products/pages/product-registration-page/product-registration-page';
import { ProductEditPageComponent } from './features/products/pages/product-edit-page/product-edit-page';

export const routes: Routes = [
    { path: '', component: ProductListPageComponent },

    { path: 'product/add', component: ProductRegistrationPageComponent },

    { path: 'product/edit/:id', component: ProductEditPageComponent },

    { path: '**', redirectTo: '', pathMatch: 'full' }
];
