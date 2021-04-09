import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Permission } from 'src/app/interfaces/permission';
import { Role } from 'src/app/interfaces/role';
import { PermissionService } from 'src/app/services/permission.service';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleEditComponent implements OnInit, OnDestroy {
  private permissionsSubject: Subject<Permission[]> = new Subject();

  private subscription: Subscription = new Subscription();

  editRoleForm: FormGroup;

  permissions: Permission[] = [];

  permissions$!: Observable<Permission[]>;

  id!: number;

  constructor(
    private formBuilder: FormBuilder,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.editRoleForm = this.formBuilder.group({
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
    this.id = this.route.snapshot.params.id;
    this.subscription.add(
      this.roleService.getOne(this.id).subscribe((role: Role) => {
        const values = this.permissions.map((p) => {
          return {
            value: role.permissions?.some((r) => r.id === p.id),
            id: p.id,
          };
        });
        this.editRoleForm.patchValue({
          name: role.name,
          permissions: values,
        });
      }),
    );

    this.permissions$ = this.permissionsSubject;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNameErrorMessage() {
    if (this.editRoleForm.controls.name.hasError('required')) {
      return `Enter role name`;
    }
    return this.editRoleForm.controls.name.hasError('pattern')
      ? 'Role name can only contain letters'
      : '';
  }

  get permissionArray(): FormArray {
    return this.editRoleForm.get('permissions') as FormArray;
  }

  submit(): void {
    const formData = this.editRoleForm.getRawValue();
    const capitalize = (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    const data = {
      name: capitalize(formData.name),
      permissions: formData.permissions
        .filter((p: { value: boolean }) => p.value === true)
        .map((p: { id: number }) => p.id),
    };
    if (this.editRoleForm.valid) {
      this.subscription.add(
        this.roleService
          .update(this.id, data)
          .subscribe(() => this.router.navigate(['/roles'])),
      );
    }
  }
}
