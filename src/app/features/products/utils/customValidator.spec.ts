import { FormControl, ValidationErrors } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProductService } from '../services/product';
import { minDate, uniqueIdValidator } from './customValidator';

const mockProductService: jasmine.SpyObj<ProductService> = jasmine.createSpyObj('ProductService', ['verifyId']);

describe('CustomValidators', () => {

    describe('uniqueIdValidator (Asíncrono)', () => {
        const validator = uniqueIdValidator(mockProductService);

        beforeEach(() => {
            mockProductService.verifyId.calls.reset();
        });

        it('debe retornar NULL si el control está vacío', (done) => {
            const control = new FormControl('');
            const result = validator(control);

            (result as any).subscribe((value: any) => {
                expect(value).toBeNull();
                expect(mockProductService.verifyId).not.toHaveBeenCalled();
                done();
            });
        });

        it('debe retornar { idNotUnique: true } si el ID ya existe', (done) => {
            const control = new FormControl('EXISTING');
            mockProductService.verifyId.and.returnValue(of(true));

            const result = validator(control);

            (result as any).subscribe((validationErrors: ValidationErrors | null) => {
                expect(mockProductService.verifyId).toHaveBeenCalledWith('EXISTING');
                expect(validationErrors).toEqual({ idNotUnique: true });
                done();
            });
        });

        it('debe retornar NULL si el ID no existe', (done) => {
            const control = new FormControl('NEW');
            mockProductService.verifyId.and.returnValue(of(false));

            const result = validator(control);

            (result as any).subscribe((validationErrors: ValidationErrors | null) => {
                expect(mockProductService.verifyId).toHaveBeenCalledWith('NEW');
                expect(validationErrors).toBeNull();
                done();
            });
        });

        it('debe retornar NULL si el servicio falla (catchError)', (done) => {
            const control = new FormControl('ERROR');
            mockProductService.verifyId.and.returnValue(throwError(() => new Error('API Fail')));

            const result = validator(control);

            (result as any).subscribe((validationErrors: ValidationErrors | null) => {
                expect(validationErrors).toBeNull();
                done();
            });
        });
    });


    describe('minDate (Síncrono)', () => {
        const fixedToday = new Date(2025, 8, 29);
        const validator = minDate(fixedToday);

        const todayString = '2025-09-29';
        const tomorrowString = '2025-09-30';
        const yesterdayString = '2025-09-28';

        it('debe retornar NULL si el valor es nulo', () => {
            const control = new FormControl(null);
            expect(validator(control)).toBeNull();
        });

        it('debe retornar NULL si la fecha es igual o posterior al mínimo requerido', () => {
            let control = new FormControl(todayString);
            expect(validator(control)).toBeNull();

            control = new FormControl(tomorrowString);
            expect(validator(control)).toBeNull();
        });

        it('debe retornar error si la fecha es anterior al mínimo requerido', () => {
            const control = new FormControl(yesterdayString);
            const expectedError = { minDate: { requiredMinDate: todayString, actualDate: yesterdayString } };

            expect(validator(control)).toEqual(expectedError);
        });
    });
});