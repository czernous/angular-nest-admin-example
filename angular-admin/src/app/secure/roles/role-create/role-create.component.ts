import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Permission } from 'src/app/interfaces/permission';
import { PermissionService } from 'src/app/services/permission.service';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss'],
})
export class RoleCreateComponent implements OnInit, OnDestroy {
  private permissionsSubject: Subject<Permission[]> = new Subject();

  private subscription: Subscription = new Subscription();

  createRoleForm: FormGroup;

  permissions: Permission[] = [];

  permissions$!: Observable<Permission[]>;

  constructor(
    private formBuilder: FormBuilder,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private router: Router,
  ) {
    this.createRoleForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      permissions: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.permissionService.getAll().subscribe((data) => {
        this.permissions = data;
        this.permissions.forEach((p) => {
          this.permissionArray.push(
            this.formBuilder.group({
              value: false,
              id: p.id,
            }),
          );
        });
        this.permissionsSubject.next(this.permissions);
      }),
    );

    this.permissions$ = this.permissionsSubject;

    console.log(this.permissions$);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNameErrorMessage() {
    if (this.createRoleForm.controls.name.hasError('required')) {
      return `Enter role name`;
    }
    return this.createRoleForm.controls.name.hasError('pattern')
      ? 'Role name can only contain letters'
      : '';
  }

  get permissionArray(): FormArray {
    return this.createRoleForm.get('permissions') as FormArray;
  }

  submit(): void {
    const formData = this.createRoleForm.getRawValue();
    const capitalize = (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    const data = {
      name: capitalize(formData.name),
      permissions: formData.permissions
        .filter((p: { value: boolean }) => p.value === true)
        .map((p: { id: number }) => p.id),
    };

    if (this.createRoleForm.valid) {
      this.subscription.add(
        this.roleService
          .create(data)
          .subscribe(() => this.router.navigate(['/roles'])),
      );
    }
  }
}
