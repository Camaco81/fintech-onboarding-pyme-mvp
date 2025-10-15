import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { LoginService } from '../../services/login.service';
@Component({
  selector: 'app-login',
  imports: [RouterOutlet,ReactiveFormsModule, CommonModule],
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

    login(){
      const {email, password} = this.loginForm.value;
      this.loginService.login(email, password).subscribe( res => {
        console.log(this.loginForm.value);
      });
    }
  
  


}