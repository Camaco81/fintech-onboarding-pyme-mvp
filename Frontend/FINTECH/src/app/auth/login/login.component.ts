import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';



@Component({
  selector: 'app-login',
  imports: [RouterOutlet, ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email: new FormControl('email', [Validators.required, Validators.email]),
    password: new FormControl('password', [Validators.required, Validators.minLength(6)])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Aquí puedes manejar el envío del formulario, por ejemplo:
      console.log(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
