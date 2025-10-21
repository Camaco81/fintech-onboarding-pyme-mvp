import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { LoginService } from '../../services/login.service';
import { SharedModule } from '../../components/shared/shared.module';
import { user } from '@angular/fire/auth';
import { UserStatus } from '../../interfaces';
@Component({
  selector: 'app-login',
  imports: [RouterOutlet,ReactiveFormsModule, CommonModule,SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private fb = inject (FormBuilder);
  public loginForm : FormGroup = this.fb.group({

    email: new FormControl('email', [Validators.required, Validators.email]),
    password: new FormControl('password', [Validators.required, Validators.minLength(6)])

  });

  email : string = '';
  password : string = '';
  id: string = '';

    
  constructor(
    private loginService : LoginService, 
    // private fb : FormBuilder,
    ){ }

     async login(){
      const {email, password} = this.loginForm.value;
      const observable = await this.loginService.login(email, password);
      observable.subscribe( (_: any)  => {
        console.log(this.loginForm.value);
        this.loginForm.reset();
      });
    }
  
  


}