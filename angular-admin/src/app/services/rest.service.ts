import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export abstract class RestService {
  abstract get endpoint(): string;

  constructor(protected http: HttpClient) {}

  getAll(pageIndex?: number): Observable<any> {
    let url = this.endpoint;

    if (pageIndex) {
      url += `?page=${pageIndex}`;
    }

    return this.http.get(url).pipe(map((res) => res));
  }

  getOne(id: number): Observable<any> {
    return this.http.get(`${this.endpoint}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
