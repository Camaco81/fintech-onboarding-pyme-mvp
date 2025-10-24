import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { CommonModule } from '@angular/common'; 

import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms'; 

import { AuthService } from '../../services/auth.service';
import { idToken, ProviderId, user, UserCredential } from '@angular/fire/auth';
import { onLog } from '@angular/fire/app';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    
    ReactiveFormsModule,
     CommonModule
  ], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  
  email: string = '';
  password: string = '';
  userData: any= null;
  user : any = null;
  name : string = '';
  loginForm!: FormGroup;

  // Uso de 'inject' para inyección moderna
  private authService = inject(AuthService);
  private fb = inject(FormBuilder); 
  private router = inject(Router);
  private userCredential!: UserCredential;

  constructor() {
    this.initializeForm(); 
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  // Función para manejar el envío del formulario
  async login() {
    if (this.loginForm.invalid) {
      console.warn('⚠️ Formulario inválido. Mostrando errores de validación.');
      this.loginForm.markAllAsTouched(); 
      return; 
    }
    
    const { email, password } = this.loginForm.value;

    try {
      // Usamos los valores correctos del formulario
      const credential: UserCredential = await this.authService.login(email, password); 

      const firebaseUser = credential?.user ?? null;
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;

      console.log(`✅ Login Exitoso para: ${email}`);
      console.log('Datos del usuario (del servicio):', firebaseUser);
      // console.log(this._tokenResponse.idToken);
      
      this.userData = firebaseUser ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        token: token,
        providerId: firebaseUser.providerId
      } : null;

      this.router.navigate(['/dashboard']); 

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      // Lógica de errores UI
    }
    
    
  }
}