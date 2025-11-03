import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { CommonModule } from '@angular/common'; 

import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms'; 

// Importación de SweetAlert2
import Swal from 'sweetalert2'; 

import { idToken, ProviderId, user, UserCredential } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service'; // ajusta la ruta según tu estructura
import { MatSnackBar } from '@angular/material/snack-bar'; // 👈 Se mantiene la importación si la usas en otro lado

// Nota: No necesitas importar SwalComponent ni SwalDirective en el LoginComponent
// si solo usas Swal.fire() de forma programática.

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
  
  // Propiedades individuales no son necesarias si usas FormGroup
  userData: any = null;
  user: any = null;
  name: string = '';
  loginForm!: FormGroup;

  // Uso de 'inject' para inyección moderna
  private authService = inject(AuthService);
  private fb = inject(FormBuilder); 
  private router = inject(Router);
  // private snackBar = inject(MatSnackBar); // 👈 Ya no es necesario si eliminamos MatSnackBar
  private userCredential!: UserCredential;

  // Constructor sin MatSnackBar
  constructor() {
    this.initializeForm(); 
    // Si necesitas usar Swal en el constructor por alguna razón, puedes hacerlo aquí
    Swal; 
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // Contraseña: Mínimo 6 caracteres
      password: ['', [Validators.required, Validators.minLength(6)]] 
    });
  }

  // Método auxiliar para acceder a los controles fácilmente en el HTML
  get formControls() {
    return this.loginForm.controls;
  }

  // =====================================================================
  // 🔹 Función para manejar el envío del formulario
  // =====================================================================
  async login() {
    if (this.loginForm.invalid) {

      Swal.fire('⚠️ Formulario inválido. Marcando errores de validación.');
      this.loginForm.markAllAsTouched();
       await Swal.fire({
          icon: 'warning',
          title: 'Datos Incompletos',
          text: 'Por favor, completa correctamente todos los campos requeridos.',
          confirmButtonColor: '#3085d6',
      });
      return;
    }

    const { email, password } = this.loginForm.value;

    // 💡 Puedes usar una alerta de carga temporal si la operación es lenta
    Swal.fire({
      title: 'Iniciando Sesión...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const credential: UserCredential = await this.authService.login(email, password);

      const firebaseUser = credential?.user ?? null;
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;

      if (!firebaseUser) {
        // Cierra la alerta de carga si hubo un problema antes del éxito
        Swal.close(); 
        await Swal.fire({
          icon: 'error',
          title: 'Error de Usuario',
          text: 'No se pudo obtener la información completa del usuario.',
          confirmButtonColor: '#d33',
        });
        return;
      }

      // Procesa la información del usuario
      this.userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName  || 'Usuario sin nombre',
        email: firebaseUser.email,
        token: token,
        providerId: firebaseUser.providerId
      };
      
      console.log(`✅ Login Exitoso para: ${email}`);
      console.log('Datos del usuario procesados:', this.userData.name);

      // Cierra la alerta de carga y muestra el SweetAlert de Éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Sesión iniciada con éxito para ${this.userData.email}.`,
        confirmButtonColor: '#3085d6',
        timer: 2000 // Se cierra automáticamente después de 2 segundos
      });

      // Redirigir al dashboard después del éxito
      this.router.navigate(['/dashboard']);
      
    } catch (error) {
      // 1. Cierra cualquier alerta de carga o previa
      Swal.close(); 
      
      console.error('❌ Error al iniciar sesión:', error);

      // 2. Determina el mensaje de error para el usuario
      const errorMessage = this.getFriendlyErrorMessage(error);
      
      // 3. Muestra el SweetAlert de Error
      await Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    }
  }

  // =====================================================================
  // 🔹 Función auxiliar para obtener mensajes de error amigables
  // =====================================================================
  private getFriendlyErrorMessage(error: any): string {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No existe un usuario con este correo electrónico.';
        case 'auth/wrong-password':
            return 'La contraseña es incorrecta.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/too-many-requests':
            return 'Has intentado demasiadas veces. Inténtalo de nuevo más tarde.';
        default:
            return error?.message || 'Ocurrió un error inesperado al iniciar sesión.';
    }
  }
  
  // Puedes dejar este método si lo usas en el HTML o lo necesitas para debugging
  async loadUserName() {
    try {
        const name = await this.authService.getUserDisplayName(); 
        if (name) {
            console.log('El nombre completo es:', name);
        }
    } catch (error) {
        console.error('No se pudo cargar el nombre del usuario.');
    }
  }
}