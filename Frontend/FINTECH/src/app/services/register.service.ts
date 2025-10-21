import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  nombre: string = '';
  email: string = '';
  password: string = '';
  telefono: string = '';
  role: string = 'user';
  isActive: boolean = true;

  constructor() { }


  register(){
    
  }
}
