import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PublicComponent } from './public.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PublicComponent, LoginComponent, RegisterComponent],
  imports: [CommonModule, HttpClientModule, SharedModule],
})
export class PublicModule {}
