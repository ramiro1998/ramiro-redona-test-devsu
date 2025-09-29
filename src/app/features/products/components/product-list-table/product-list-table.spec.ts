import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListTableComponent } from './product-list-table';

describe('ProductListTable', () => {
  let component: ProductListTableComponent;
  let fixture: ComponentFixture<ProductListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
