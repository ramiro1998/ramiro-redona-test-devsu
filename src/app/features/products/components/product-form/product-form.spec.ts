import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductFormComponent } from './product-form';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.interface';
import { of } from 'rxjs';
import { CustomValidators } from '../../utils/customValidator';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockProductService = {
  verifyId: jasmine.createSpy('verifyId'),
};

const mockProduct: Product = {
  id: 'XYZ-123',
  name: 'Producto Existente',
  description: 'Descripción larga del producto',
  logo: 'logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    mockProductService.verifyId.calls.reset();
  });

  beforeEach(() => {
    spyOn(CustomValidators, 'minDate').and.returnValue((control: AbstractControl) => null);
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('debe inicializarse en modo Registro si product es null', () => {
    component.product = null;
    component.ngOnInit();
    expect(component.isEditMode).toBe(false);
    expect(component.productForm.get('id')?.disabled).toBeFalsy();
  });

  it('debe inicializarse en modo Edición si product está presente', () => {
    component.product = mockProduct;
    component.ngOnInit();
    expect(component.isEditMode).toBe(true);
    expect(component.productForm.get('id')?.disabled).toBe(true);
    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
  });

  it('debe aplicar el validador asíncrono de ID Único en modo Registro', () => {
    component.product = null;
    component.ngOnInit();
    const idControl = component.productForm.get('id');

    expect(idControl?.asyncValidator).toBeDefined();
  });

  it('NO debe aplicar el validador asíncrono de ID Único en modo Edición', () => {
    component.product = mockProduct;
    component.ngOnInit();
    const idControl = component.productForm.get('id');

    expect(idControl?.asyncValidator).toBeNull();
  });

  it('debe requerir todos los campos', () => {
    component.ngOnInit();
    expect(component.productForm.valid).toBeFalsy();

    Object.keys(component.productForm.controls).forEach(key => {
      component.productForm.get(key)?.setValue('');
      expect(component.productForm.get(key)?.hasError('required')).toBe(true, `El campo ${key} debe ser requerido`);
    });
  });

  it('debe validar la longitud mínima y máxima de los campos', () => {
    component.ngOnInit();

    component.controls['id'].setValue('a');
    expect(component.controls['id'].hasError('minlength')).toBe(true);
    component.controls['id'].setValue('a'.repeat(11));
    expect(component.controls['id'].hasError('maxlength')).toBe(true);

    component.controls['name'].setValue('short');
    expect(component.controls['name'].hasError('minlength')).toBe(true);

    component.controls['description'].setValue('too short');
    expect(component.controls['description'].hasError('minlength')).toBe(true);
  });

  it('setRevisionDate debe calcular la fecha de revisión un año después de la fecha de liberación', () => {
    component.ngOnInit();
    const releaseDate = '2025-03-15';
    const expectedRevisionDate = '2026-03-15';

    component.controls['date_release'].setValue(releaseDate);
    component.setRevisionDate();

    expect(component.controls['date_revision'].value).toBe(expectedRevisionDate);
  });

  it('setRevisionDate no debe hacer nada si date_release es nulo', () => {
    component.ngOnInit();
    component.controls['date_release'].setValue(null);
    component.controls['date_revision'].setValue('2000-01-01');

    component.setRevisionDate();

    expect(component.controls['date_revision'].value).toBe('2000-01-01');
  });

  it('onSubmit debe marcar todos los campos como tocados si el formulario es inválido', () => {
    component.ngOnInit();
    spyOn(component.formSubmit, 'emit');

    component.onSubmit();

    expect(component.productForm.get('id')?.touched).toBe(true);
    expect(component.formSubmit.emit).not.toHaveBeenCalled();
  });

  it('onSubmit debe emitir formSubmit con el valor del formulario si es válido (Registro)', fakeAsync(() => {
    component.ngOnInit();
    spyOn(component.formSubmit, 'emit');

    mockProductService.verifyId.and.returnValue(of(false));

    component.productForm.setValue({
      id: 'valid-id',
      name: 'Valid Name Test',
      description: 'This is a valid long description.',
      logo: 'http://valid.logo',
      date_release: '2030-01-01',
      date_revision: '2031-01-01',
    });

    tick(500);

    expect(component.productForm.get('id')?.valid).toBe(true);

    component.onSubmit();

    expect(component.formSubmit.emit).toHaveBeenCalledWith(component.productForm.value as Product);
  }));

  it('onSubmit debe habilitar el campo ID antes de emitir en modo Edición', () => {
    component.product = mockProduct;
    component.ngOnInit();

    expect(component.productForm.get('id')?.disabled).toBe(true);

    spyOn(component.formSubmit, 'emit');

    component.productForm.get('name')?.setValue('New Name valid');
    component.productForm.get('description')?.setValue('a long description');
    component.productForm.get('logo')?.setValue('logo.jpg');
    component.productForm.get('date_release')?.setValue('2030-01-01');
    component.productForm.get('date_revision')?.setValue('2031-01-01');


    component.onSubmit();

    expect(component.productForm.get('id')?.enabled).toBe(true);
    expect(component.formSubmit.emit).toHaveBeenCalled();
  });


  it('onReset debe resetear el formulario y emitir formReset (Registro)', () => {
    component.product = null;
    component.ngOnInit();
    spyOn(component.formReset, 'emit');
    component.controls['name'].setValue('Dirty Data');

    component.onReset();

    expect(component.controls['name'].value).toBeNull();
    expect(component.formReset.emit).toHaveBeenCalled();
  });

  it('onReset debe resetear el formulario pero mantener y deshabilitar el ID (Edición)', () => {
    component.product = mockProduct;
    component.ngOnInit();
    component.controls['name'].setValue('Dirty Data');

    component.onReset();

    expect(component.controls['id'].value).toBe(mockProduct.id);
    expect(component.productForm.get('id')?.disabled).toBe(true);
    expect(component.controls['name'].value).toBeNull();
  });

  it('el getter controls debe retornar todos los AbstractControls del formulario', () => {
    component.ngOnInit();
    expect(component.controls['id']).toBeDefined();
    expect(component.controls['name']).toBeDefined();
    expect(Object.keys(component.controls).length).toBe(6);
  });
});


describe('CustomValidators.uniqueIdValidator', () => {
  const fb = new FormBuilder();

  beforeEach(() => {
    spyOn(CustomValidators, 'uniqueIdValidator').and.callThrough();
    mockProductService.verifyId.calls.reset();
  });

  it('debe retornar null (válido) si el ID no existe', fakeAsync(() => {
    mockProductService.verifyId.and.returnValue(of(false));

    const control = fb.control('new-id');
    const validatorFn = CustomValidators.uniqueIdValidator(mockProductService as any);
    let result: any;

    (validatorFn(control) as any).subscribe((val: any) => result = val);

    tick(500);

    expect(result).toBeNull();

    expect(mockProductService.verifyId).toHaveBeenCalledWith('new-id');
  }));

  it('debe retornar { uniqueId: true } (inválido) si el ID ya existe', fakeAsync(() => {
    mockProductService.verifyId.and.returnValue(of(true));

    const control = fb.control('existing-id');
    const validatorFn = CustomValidators.uniqueIdValidator(mockProductService as any);
    let result: any;

    (validatorFn(control) as any).subscribe((val: any) => result = val);

    tick(500);

    expect(mockProductService.verifyId).toHaveBeenCalledWith('existing-id');
  }));
});
