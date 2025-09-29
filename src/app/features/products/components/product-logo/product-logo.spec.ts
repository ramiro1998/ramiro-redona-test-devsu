import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLogo } from './product-logo';

describe('ProductLogo', () => {
  let component: ProductLogo;
  let fixture: ComponentFixture<ProductLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
