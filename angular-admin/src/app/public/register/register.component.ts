import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RegisterForm } from '../../interfaces/register';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;

  isLoading: boolean;

  hasHttpError: boolean;

  httpErrorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isLoading = false;
    this.hasHttpError = false;
    this.httpErrorMessage = '';
    this.registerForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      last_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password_confirm: ['', [Validators.required]],
    });

    this.getEmailErrorMessage = this.getEmailErrorMessage.bind(this);
  }

  getFirstNameErrorMessage() {
    if (this.registerForm.controls.first_name.hasError('required')) {
      return 'Enter your name';
    }
    return this.registerForm.controls.first_name.hasError('pattern')
      ? 'Last name can only contain letters'
      : '';
  }

  getLastNameErrorMessage() {
    if (this.registerForm.controls.last_name.hasError('required')) {
      return 'Enter your last name';
    }
    return this.registerForm.controls.last_name.hasError('pattern')
      ? 'Name can only contain letters'
      : '';
  }

  getEmailErrorMessage() {
    if (this.registerForm.controls.email.hasError('required')) {
      return 'Enter your email';
    }

    return this.registerForm.controls.email.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  getPasswordErrorMessage() {
    if (this.registerForm.controls.password.hasError('required')) {
      return 'Enter password';
    }
    if (this.registerForm.controls.password_confirm.hasError('required')) {
      return 'Confirm your password';
    }
    return this.registerForm.controls.password_confirm.hasError(
      'passwordMismatch',
    )
      ? 'Passwords do not match'
      : '';
  }

  validateOnSubmit(): void {
    const comparePasswords = (): void | AbstractControl => {
      if (
        this.registerForm.get('password')?.value !==
        this.registerForm.get('password_confirm')?.value
      ) {
        return this.registerForm.controls.password_confirm.setErrors({
          passwordMismatch: true,
        });
      }
    };
    comparePasswords();
  }

  submit(): void {
    this.validateOnSubmit();
    const formData: RegisterForm = this.registerForm.getRawValue();
    if (this.registerForm.valid) {
      const registerUser = this.authService
        .registerUser(formData)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.error instanceof ErrorEvent) {
              console.error('An error occurred:', err.error.message);
            } else {
              console.error(
                `Backend returned code ${err.status}, ` +
                  `body was: ${JSON.stringify(err.error)}`,
              );
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              err.error.message
                ? (this.httpErrorMessage = err.error.message)
                : (this.httpErrorMessage = `Backend returned code ${err.status}`);
            }
            this.isLoading = !this.isLoading;
            this.hasHttpError = !this.hasHttpError;
            return throwError(
              `Couldn't send data to the server; please try again later.`,
            );
          }),
        )
        .subscribe(() => {
          this.router.navigate(['/login']);
          registerUser.unsubscribe();
        });
      this.isLoading = !this.isLoading;
    }
  }
}
