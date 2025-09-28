

import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../services/product';


export function uniqueIdValidator(productService: ProductService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

        if (control.disabled) {
            return of(null);
        }

        if (control.value) {
            return productService.verifyId(control.value).pipe(
                map(idExists => (idExists ? { idNotUnique: true } : null)),
                catchError(() => of(null))
            );
        }

        return of(null);
    };
}

export function minDate(min: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const controlValue: string = control.value;

        if (!controlValue) {
            return null;
        }

        const minDate = new Date(min);
        const minDateUTC = new Date(Date.UTC(
            minDate.getFullYear(),
            minDate.getMonth(),
            minDate.getDate()
        ));
        const todayString = minDateUTC.toISOString().split('T')[0];

        if (controlValue < todayString) {
            return { minDate: { requiredMinDate: todayString, actualDate: controlValue } };
        }
        return null;
    };
}


export const CustomValidators = {
    uniqueIdValidator,
    minDate,
};