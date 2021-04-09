import { HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  private subscription: Subscription = new Subscription();

  @Output() uploaded = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  upload(event: any): void {
    console.log(event.target.files);
    const file = event.target?.files?.item(0);
    const data = new FormData();
    data.append('image', file);
    this.subscription.add(
      this.http
        .post(`${environment.api}/upload`, data)
        .subscribe((res: any) => this.uploaded.emit(res.url)),
    );
  }
}
