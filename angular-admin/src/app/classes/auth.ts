import { EventEmitter } from '@angular/core';
import { User } from '../interfaces/user';

export class Auth {
  static userEmiter = new EventEmitter<User>();
}
