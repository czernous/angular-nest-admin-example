import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginForm } from '../../interfaces/login';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;

  isLoading: boolean;

  hasHttpError: boolean;

  httpErrorMessage: string;

  private loginUserSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isLoading = false;
    this.hasHttpError = false;
    this.httpErrorMessage = '';
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  getPasswordErrorMessage() {
    if (this.loginForm.controls.password.hasError('required')) {
      return 'Enter your password';
    }

    return null;
  }

  getEmailErrorMessage() {
    if (this.loginForm.controls.email.hasError('required')) {
      return 'Enter your email';
    }
    if (this.loginForm.controls.email.hasError('email')) {
      return 'Not a valid email';
    }
    return null;
  }

  ngOnDestroy(): void {
    this.loginUserSubscription.unsubscribe();
  }

  submit(): void {
    const formData: LoginForm = this.loginForm.getRawValue();
    if (this.loginForm.valid) {
      this.loginUserSubscription = this.authService
        .loginUser(formData)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.error instanceof ErrorEvent) {
              console.error('An error occurred:', err.error.message);
            } else {
              console.error(
                `Backend returned code ${err.status}, ` +
                  `body was: ${JSON.stringify(err.error)}`,
              );
              this.httpErrorMessage = `Error: ${err.error?.message}`;
            }
            this.isLoading = !this.isLoading;
            this.hasHttpError = !this.hasHttpError;
            return throwError(
              `Couldn't send data to the server; please try again later.`,
            );
          }),
        )
        .subscribe(() => {
          this.router.navigate(['/']);
        });
      this.isLoading = !this.isLoading;
    }
  }
}
