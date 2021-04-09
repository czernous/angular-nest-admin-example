import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role } from 'src/app/interfaces/role';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent implements OnInit, OnDestroy {
  userCreateForm: FormGroup;

  isLoading: boolean;

  roles: Role[] = [];

  private roleSubscription!: Subscription;

  private createUserSubscription!: Subscription;

  hasHttpError: boolean;

  httpErrorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private router: Router,
  ) {
    this.isLoading = false;
    this.hasHttpError = false;
    this.httpErrorMessage = '';
    this.userCreateForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      last_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: ['', [Validators.required, Validators.email]],
      role_id: [''],
    });
  }

  getFirstNameErrorMessage() {
    if (this.userCreateForm.controls.first_name.hasError('required')) {
      return `Enter user's name`;
    }
    return this.userCreateForm.controls.first_name.hasError('pattern')
      ? 'Last name can only contain letters'
      : '';
  }

  getLastNameErrorMessage() {
    if (this.userCreateForm.controls.last_name.hasError('required')) {
      return `Enter user's last name`;
    }
    return this.userCreateForm.controls.last_name.hasError('pattern')
      ? 'Name can only contain letters'
      : '';
  }

  getEmailErrorMessage() {
    if (this.userCreateForm.controls.email.hasError('required')) {
      return `Enter user's email`;
    }

    return this.userCreateForm.controls.email.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  ngOnInit(): void {
    this.roleSubscription = this.roleService.getAll().subscribe((res) => {
      this.roles = res;
    });
  }

  ngOnDestroy(): void {
    this.roleSubscription.unsubscribe();
    this.createUserSubscription.unsubscribe();
  }

  submit(): Subscription | void {
    const formData = this.userCreateForm.getRawValue();
    if (this.userCreateForm.valid) {
      this.createUserSubscription = this.userService
        .create(formData)
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
          this.router.navigate(['/users']);
        });
      this.isLoading = !this.isLoading;
      return this.createUserSubscription;
    }
  }
}
