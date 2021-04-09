import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role } from 'src/app/interfaces/role';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit, OnDestroy {
  userEditForm: FormGroup;

  isLoading: boolean;

  roles: Role[] = [];

  private roleSubscription!: Subscription;

  private getUserSubscription!: Subscription;

  private updatetUserSubscription!: Subscription;

  userId!: number;

  hasHttpError: boolean;

  httpErrorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isLoading = false;
    this.hasHttpError = false;
    this.httpErrorMessage = '';
    this.userEditForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      last_name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      email: ['', [Validators.required, Validators.email]],
      role_id: [''],
    });
  }

  getFirstNameErrorMessage() {
    if (this.userEditForm.controls.first_name.hasError('required')) {
      return `Enter user's name`;
    }
    return this.userEditForm.controls.first_name.hasError('pattern')
      ? 'Last name can only contain letters'
      : '';
  }

  getLastNameErrorMessage() {
    if (this.userEditForm.controls.last_name.hasError('required')) {
      return `Enter user's last name`;
    }
    return this.userEditForm.controls.last_name.hasError('pattern')
      ? 'Name can only contain letters'
      : '';
  }

  getEmailErrorMessage() {
    if (this.userEditForm.controls.email.hasError('required')) {
      return `Enter user's email`;
    }

    return this.userEditForm.controls.email.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  ngOnInit(): void {
    this.roleSubscription = this.roleService.getAll().subscribe((res) => {
      this.roles = res;
    });
    this.userId = this.route.snapshot.params.id;

    this.getUserSubscription = this.userService
      .getOne(this.userId)
      .subscribe((user) =>
        this.userEditForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_id: user.role.id,
        }),
      );
  }

  ngOnDestroy(): void {
    this.roleSubscription.unsubscribe();
    this.getUserSubscription.unsubscribe();
  }

  submit(): Subscription | void {
    const formData = this.userEditForm.getRawValue();
    if (this.userEditForm.valid) {
      this.userService
        .update(this.userId, formData)
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
        .subscribe(() => this.router.navigate(['/users']));
      this.isLoading = !this.isLoading;
    }
  }
}
