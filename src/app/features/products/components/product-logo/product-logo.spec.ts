import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLogoComponent } from './product-logo';

describe('ProductLogo', () => {
  let component: ProductLogoComponent;
  let fixture: ComponentFixture<ProductLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductLogoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
