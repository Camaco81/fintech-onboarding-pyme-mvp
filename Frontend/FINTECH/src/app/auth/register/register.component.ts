// register.component.ts (VERSIÓN CORREGIDA)

import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {   
      ReactiveFormsModule,  
      FormGroup,
      Validators,     
      FormBuilder     
} from '@angular/forms';
// 🔑 CLAVE: Usamos signInWithEmailAndPassword, no createUserWithEmailAndPassword
import { Auth, signInWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';

@Component({
      selector: 'app-register',
      standalone: true,
      imports: [
           CommonModule,  
           ReactiveFormsModule,
           RouterModule
      ],
      templateUrl: './register.component.html',
      styleUrl: './register.component.css'
})
export class RegisterComponent {

      registerForm: FormGroup;
      apiError: string | null = null;
      registrationSuccess: boolean = false;
      message: string | null = null; // Para mostrar el mensaje de éxito/error

      private fb = inject(FormBuilder); 
      private router = inject(Router);
      private authService = inject(AuthService);
      private auth: Auth = inject(Auth);

      constructor() {
           this.registerForm = this.fb.group({
               nombre: ['', Validators.required],
               email: ['', [Validators.required, Validators.email]],
               password: ['', [Validators.required, Validators.minLength(6)]],
               telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]]
           });
      }

      async register() {
           this.apiError = null;
           this.registrationSuccess = false;
           this.message = null;
          
           if (this.registerForm.invalid) {
               this.registerForm.markAllAsTouched();
               return;
           }

           const { email, password, nombre, telefono } = this.registerForm.value;

           try {
               // 1. LLamada a Flask (CREA USUARIO EN ADMIN Y DB)
               // Flask devuelve 200 o 409/500
               const flaskResponse: any = await this.authService.callFlaskSetupUser(email, password, nombre, telefono);
              
      // 🟢 ÉXITO FLASK: Flask respondió 200. Sigue el flujo.
      this.message = flaskResponse.mensaje;
      
               // 2. CORRECCIÓN: Iniciar sesión con el usuario YA CREADO (Firebase Web SDK)
               const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
               const user = userCredential.user;

               // 3. Envía el correo de verificación
               await sendEmailVerification(user);
              
               // 4. Cierra la sesión inmediatamente
               await this.auth.signOut();

               this.registrationSuccess = true;
              
               // Opcional: Redirigir al login
               setTimeout(() => {
                  this.router.navigate(['/auth/login']);
               }, 5000);     

           } catch (error: any) {
               console.error('❌ Error de Registro:', error);
      this.registrationSuccess = false;
      
      // 🔑 CLAVE: Intentamos obtener el mensaje del backend (Flask) primero
      const flaskErrorMessage = error.error?.mensaje || error.message; 
      
               // Manejo de errores de Firebase Web SDK (si falla la verificación o el sign-in)
               if (error.code === 'auth/email-already-in-use') {
                   this.apiError = 'Este correo ya está registrado. Por favor, inicia sesión.';
               } else if (flaskErrorMessage) {
                   // Captura el mensaje de error 409 o 500 del backend
                   this.apiError = flaskErrorMessage;
               } else {
                   // Si no hay mensaje de Flask, muestra un error genérico.
                   this.apiError = 'Error desconocido durante el registro. Revisa la consola y los logs del backend.';
               }
           }
      }
}