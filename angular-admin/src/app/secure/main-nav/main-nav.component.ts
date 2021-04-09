import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  user$!: Observable<User>;

  userSubscription!: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
  ) {}

  logoutUser(): void {
    this.userSubscription.add(this.authService.logoutUser().subscribe());
  }

  ngOnInit(): void {
    this.user$ = this.authService.user;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
