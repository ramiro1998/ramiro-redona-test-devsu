import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListTable } from './product-list-table';

describe('ProductListTable', () => {
  let component: ProductListTable;
  let fixture: ComponentFixture<ProductListTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
