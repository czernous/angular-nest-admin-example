import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { Auth } from '../classes/auth';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'secure',
  templateUrl: './secure.component.html',
  styleUrls: ['./secure.component.scss'],
})
export class SecureComponent implements OnInit, OnDestroy {
  private getUserSubscription!: Subscription;

  userInfo$!: Observable<User>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getUserSubscription = this.authService.getUser().subscribe(
      (user) => (this.userInfo$ = of(user)),
      () => {
        this.router.navigate(['/login']);
      },
    );
  }
  ngOnDestroy(): void {
    this.getUserSubscription?.unsubscribe();
  }
}
