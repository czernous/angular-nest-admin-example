import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { RegisterForm } from '../interfaces/register';
import { LoginForm } from '../interfaces/login';
import { User } from '../interfaces/user';
import { tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/JSON' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userData = new BehaviorSubject<any>({});

  user = this.userData.asObservable();

  constructor(private http: HttpClient) {}

  registerUser(newUser: RegisterForm): Observable<RegisterForm> {
    return this.http.post<RegisterForm>(
      `${environment.api}/register`,
      newUser,
      httpOptions,
    );
  }

  loginUser(user: LoginForm): Observable<LoginForm> {
    return this.http.post<LoginForm>(`${environment.api}/login`, user);
  }

  getUser(): Observable<User> {
    return this.http
      .get<User>(`${environment.api}/user`)
      .pipe(tap((res) => this.userData.next(res)));
  }

  logoutUser(): Observable<void> {
    return this.http.post<void>(`${environment.api}/logout`, {});
  }

  updateUserInfo(data: any): Observable<User> {
    this.userData.next(data);
    return this.http.put<User>(`${environment.api}/users/info`, data);
  }

  updateUserPassword(data: any): Observable<User> {
    return this.http.put<User>(`${environment.api}/users/password`, data);
  }
}
