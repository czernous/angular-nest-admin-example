import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Auth } from 'src/app/classes/auth';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  accountInfoForm: FormGroup;

  accountPasswordForm: FormGroup;

  userInfo$!: Observable<User>;

  private updateUserSubscription!: Subscription;

  isLoading: boolean;

  hasHttpError: boolean;

  httpErrorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.isLoading = false;
    this.hasHttpError = false;
    this.httpErrorMessage = '';
    this.accountInfoForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      last_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.accountPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      password_confirm: ['', [Validators.required]],
    });
  }

  getFirstNameErrorMessage() {
    if (this.accountInfoForm.controls.first_name.hasError('required')) {
      return 'Enter your name';
    }
    return this.accountInfoForm.controls.first_name.hasError('pattern')
      ? 'Name can only contain letters'
      : '';
  }

  getLastNameErrorMessage() {
    if (this.accountInfoForm.controls.last_name.hasError('required')) {
      return 'Enter your last name';
    }
    return this.accountInfoForm.controls.last_name.hasError('pattern')
      ? 'c can only contain letters'
      : '';
  }

  getEmailErrorMessage() {
    if (this.accountInfoForm.controls.email.hasError('required')) {
      return 'Enter your email';
    }

    return this.accountInfoForm.controls.email.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  getPasswordErrorMessage() {
    if (this.accountPasswordForm.controls.password.hasError('required')) {
      return 'Enter password';
    }
    if (
      this.accountPasswordForm.controls.password_confirm.hasError('required')
    ) {
      return 'Confirm your password';
    }
    return this.accountPasswordForm.controls.password_confirm.hasError(
      'passwordMismatch',
    )
      ? 'Passwords do not match'
      : '';
  }

  validateOnSubmit(): void {
    const comparePasswords = (): void | AbstractControl => {
      if (
        this.accountPasswordForm.get('password')?.value !==
        this.accountPasswordForm.get('password_confirm')?.value
      ) {
        return this.accountPasswordForm.controls.password_confirm.setErrors({
          passwordMismatch: true,
        });
      }
    };
    comparePasswords();
  }

  submitInfo(): void {
    if (this.accountInfoForm.valid) {
      this.isLoading = !this.isLoading;
      this.updateUserSubscription = this.authService
        .updateUserInfo(this.accountInfoForm.getRawValue())
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
        .subscribe((user: User) => {
          this.isLoading = !this.isLoading;
          user = this.accountInfoForm.getRawValue();
          return Auth.userEmiter.emit(user);
        });
    }
  }

  submitPassword(): void {
    this.validateOnSubmit();
    if (this.accountPasswordForm.valid) {
      this.isLoading = !this.isLoading;
      this.authService
        .updateUserPassword(this.accountPasswordForm.getRawValue())
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
        .subscribe(() => (this.isLoading = !this.isLoading));
    }
  }

  ngOnInit(): void {
    this.userInfo$ = this.authService.user;
    this.userInfo$.subscribe((user) => this.accountInfoForm.patchValue(user));
  }
}
