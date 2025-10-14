import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { LoginService } from '../../services/login.service';
@Component({
  selector: 'app-login',
  imports: [RouterOutlet],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email : string = '';
  password : string = '';
  id: string = '';

    loginForm = new FormGroup({

    email: new FormControl('email', [Validators.required, Validators.email]),
    password: new FormControl('password', [Validators.required, Validators.minLength(6)])
  });

  constructor(
    private loginService : LoginService, 
    
    private fb :FormBuilder,
    ){ 

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }
  async login() {
    try {
      const user = await this.loginService.login(this.email, this.password);
      console.log(this.email, this.password);
      console.log('Usuario logueado:', user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
  


}