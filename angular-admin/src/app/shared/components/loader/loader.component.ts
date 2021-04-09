import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div class="overlay"></div>
    <div class="container"><mat-spinner class="spinner"></mat-spinner></div>
  `,
  styles: [
    `
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        background: #f3f3f3;
        opacity: 0.65;
      }
      .container {
        position: relative;
        z-index: 5;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100vh - 100px);
        width: 100%;
      }
      .spinner {
      }
    `,
  ],
})
export class LoaderComponent {}
