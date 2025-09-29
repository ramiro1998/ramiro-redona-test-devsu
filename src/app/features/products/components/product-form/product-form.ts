import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.interface';
import { CustomValidators } from '../../utils/customValidator';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductFormComponent implements OnInit {

  @Input() product: Product | null = null;
  @Input() isSubmitting: boolean = false;

  @Output() formSubmit = new EventEmitter<Product>();
  @Output() formReset = new EventEmitter<void>();

  public productForm!: FormGroup;
  public isEditMode: boolean = false;

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    this.isEditMode = !!this.product;
    this.initForm();

    if (this.isEditMode) {
      this.productForm.get('id')?.disable();
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [
        this.product?.id || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        this.isEditMode
          ? null
          : CustomValidators.uniqueIdValidator(this.productService)
      ],
      name: [
        this.product?.name || '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(100)]
      ],
      description: [
        this.product?.description || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
      ],
      logo: [
        this.product?.logo || '',
        [Validators.required]
      ],
      date_release: [
        this.product?.date_release || '',
        [Validators.required, CustomValidators.minDate(new Date())]
      ],

      date_revision: [
        this.product?.date_revision || '',
        [Validators.required]
      ]
    });
  }

  get controls() {
    return this.productForm.controls;
  }

  setRevisionDate() {
    const releaseDateValue = this.productForm.get('date_release')?.value;

    if (releaseDateValue) {
      const date_release = new Date(releaseDateValue);
      const date_revision = new Date(date_release);
      date_revision.setFullYear(date_revision.getFullYear() + 1);
      const formattedRevisionDate = date_revision.toISOString().split('T')[0];

      this.productForm.get('date_revision')?.setValue(formattedRevisionDate);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      if (this.isEditMode) {
        this.productForm.get('id')?.enable();
      }
      this.formSubmit.emit(this.productForm.value as Product);
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onReset(): void {
    const id = this.productForm.get('id')?.value
    this.productForm.reset(null);
    if (this.isEditMode) {
      this.productForm.get('id')?.setValue(id)
      this.productForm.get('id')?.disable();
    }
    this.formReset.emit();
  }
}