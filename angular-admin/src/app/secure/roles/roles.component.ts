import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Role } from 'src/app/interfaces/role';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent implements OnInit, OnDestroy {
  private rolesSubject: Subject<Role[]> = new Subject();

  private subscription: Subscription = new Subscription();

  private roles: Role[] = [];

  roles$!: Observable<Role[]>;

  displayedColumns: string[] = ['id', 'name', 'action'];

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.roleService.getAll().subscribe((data) => {
        this.roles = data;
        this.rolesSubject.next(this.roles);
      }),
    );

    this.roles$ = this.rolesSubject;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  deleteRole(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.subscription.add(
        this.roleService.delete(id).subscribe(() => {
          this.roles = this.roles.filter((r) => r.id !== id);
          this.rolesSubject.next(this.roles);
        }),
      );
    }
  }
}
