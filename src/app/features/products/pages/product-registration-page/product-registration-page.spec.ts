import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRegistrationPage } from './product-registration-page';

describe('ProductRegistrationPage', () => {
  let component: ProductRegistrationPage;
  let fixture: ComponentFixture<ProductRegistrationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRegistrationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
