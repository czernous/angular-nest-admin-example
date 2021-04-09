import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { UsersTableDataSource } from './users-table-datasource';

@Component({
  selector: 'users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatTable) table!: MatTable<any>;

  dataSource!: UsersTableDataSource;

  meta: any = {};

  loaded = false;

  private metaSubscription!: Subscription;

  private pageSubscription!: Subscription;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name', 'email', 'role', 'action'];

  constructor(private userService: UserService) {}

  handleSort() {
    this.dataSource.loadUsers(this.paginator.pageIndex + 1); // npt ideal as it sends request to backend
  }

  ngOnInit() {
    this.dataSource = new UsersTableDataSource(this.userService);
    this.dataSource.loadUsers(1);
    this.metaSubscription = this.dataSource.metaSubject.subscribe(
      (data) => (this.meta = data),
    );
  }

  ngOnDestroy() {
    this.metaSubscription.unsubscribe();
    this.pageSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.pageSubscription = this.paginator.page
      .pipe(tap(() => this.loadUsersPage()))
      .subscribe();
    this.table.dataSource = this.dataSource;
  }

  loadUsersPage() {
    this.dataSource.loadUsers(this.paginator.pageIndex + 1);
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(id).subscribe(() => this.loadUsersPage());
    }
  }
}
