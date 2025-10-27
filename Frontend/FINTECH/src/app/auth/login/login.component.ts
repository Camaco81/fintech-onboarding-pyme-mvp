import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { CommonModule } from '@angular/common'; 

import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms'; 


import { idToken, ProviderId, user, UserCredential } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service'; // ajusta la ruta según tu estructura
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor( private snackBar: MatSnackBar) {
    this.initializeForm(); 
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  
  async loadUserName() {
  try {
    // Llama a la función que usa tu API de Flask para obtener el nombre
    const name = await this.authService.getUserDisplayName(); 
    
    if (name) {
      console.log('El nombre completo es:', name); // ¡Aquí verás el valor!
      // Actualiza una variable de estado en tu componente:
      // this.userName = name;
    }

  } catch (error) {
    console.error('No se pudo cargar el nombre del usuario.');
  }
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

      if (!firebaseUser) {
        this.snackBar.open('❌ No se pudo obtener la información del usuario.', 'Cerrar', {
          duration: 5000,
          panelClass: ['snack-error']
        });
        return;
      }

      

      console.log(`✅ Login Exitoso para: ${email}`);
      console.log('Datos del usuario (del servicio):', firebaseUser);

      this.userData = firebaseUser
        ? {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            token: token,
            providerId: firebaseUser.providerId
          }
        : null;

        console.log('Datos del usuario procesados:', firebaseUser.displayName);

      // Mostrar éxito con MatSnackBar
      this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-success']
      });

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);

      const message = (error as any)?.message ?? 'Ocurrió un error al iniciar sesión';

      // Mostrar error con MatSnackBar
      this.snackBar.open(`Error: ${message}`, 'Cerrar', {
        duration: 5000,
        panelClass: ['snack-error']
      });

      // Lógica de errores UI adicional si se requiere
    }
  }

  
}