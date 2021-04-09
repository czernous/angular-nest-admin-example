import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { catchError, finalize, map, retry } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

/**
 * Data source for the DataTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class UsersTableDataSource extends DataSource<any> {
  paginator!: MatPaginator;

  sort!: MatSort;

  data = [];

  private usersSubject = new BehaviorSubject<any[]>([]);

  public metaSubject = new BehaviorSubject<{}>({});

  constructor(private userService: UserService) {
    super();
  }
  // getData() {
  //   return this.userService.getAllUsers().subscribe((users) => {
  //     this.data = [...users.data];
  //     console.log(this.data);
  //   });
  // }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.

    return this.usersSubject.asObservable();

    // const dataMutations = [
    //   this.usersSubject.asObservable(),
    //   this.paginator.page,
    //   this.sort.sortChange,
    // ];
    // return merge(...dataMutations).pipe(
    //   map(() => {
    //     return this.getPagedData(this.getSortedData([...this.data]));
    //   }),
    // );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(collectionViewer: CollectionViewer) {
    this.usersSubject.complete();
  }

  loadUsers(pageIndex = 0) {
    this.userService
      .getAll(pageIndex)
      .pipe(
        catchError(() => of([])),
        finalize(() => {}),
      )
      .subscribe((users) => {
        const data = this.getSortedData(users.data);
        this.sort.sortChange.pipe(
          map(() => {
            return data;
          }),
        );
        this.usersSubject.next(data);
        this.metaSubject.next(users.meta);
      });
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: any) {
    console.log(data);
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  // /**
  //  * Sort the data (client-side). If you're using server-side sorting,
  //  * this would be replaced by requesting the appropriate data from the server.
  //  */
  private getSortedData(data: User[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a: User, b: User) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name':
          return compare(a.first_name, b.first_name, isAsc);
        case 'email':
          return compare(a.email, b.email, isAsc);
        case 'role':
          return compare(a.role.name, b.role.name, isAsc);
        case 'id':
          return compare(+a.id, +b.id, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
