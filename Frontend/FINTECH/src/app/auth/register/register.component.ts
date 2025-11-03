import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos solo lo necesario para Formularios Reactivos
import { FormBuilder, FormControl ,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 👈 Importamos Router
import { AuthService } from '../../services/auth.service'; // ajusta la ruta según tu estructura
import { SwalComponent, SwalDirective } from "@sweetalert2/ngx-sweetalert2";
import { MatSnackBar } from '@angular/material/snack-bar';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  // Solo ReactiveFormsModule y los componentes de SweetAlert2
  imports: [CommonModule, ReactiveFormsModule, SwalComponent, SwalDirective],
  templateUrl: './register.component.html',
})
// Implementamos OnInit para inicializar el formulario correctamente
export class RegisterComponent implements OnInit {
  // Declaramos el FormGroup
  registerForm!: FormGroup; 
  
  // Eliminamos las propiedades individuales (nombre, email, password, telefono)
  
  loading = false;
  successMessage = '';
  idToken: string = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router, // 👈 Inyectamos Router
  ) {
    Swal;
    console.log('SnackBar injectado correctamente ✅', this.snackBar);
  }

  ngOnInit(): void {
    // Inicialización COMPLETA del formulario Reactivo
    this.registerForm = this.fb.group({
      // Nombre: Obligatorio
      nombre: ['', Validators.required],
      
      // Email: Obligatorio y Formato de Email
      email: ['', [Validators.required, Validators.email]], 
      
      // Contraseña: Obligatoria y Mínimo 6 caracteres
      password: ['', [Validators.required, Validators.minLength(6)]], 
      
      // Teléfono: Obligatorio y Patrón (ej: 10 dígitos numéricos)
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]] 
    });
  }

  // =====================================================================
  // 🔹 Método auxiliar para acceder a los controles fácilmente en el HTML
  // =====================================================================
  get formControls() {
    return this.registerForm.controls;
  }

  // =====================================================================
  // 🔹 Método para registrar el usuario (Usando FormGroup)
  // =====================================================================
  async onRegister() {
    // 1. Marcar como tocados y salir si es inválido
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    // 2. Obtener los valores del formulario
    const { nombre, email, password, telefono } = this.registerForm.value;

    try {
      // 3. Llamar al servicio con los datos del FormGroup
      const result = await this.authService.callFlaskSetupUser(
        nombre,
        email,
        password,
        telefono
      );

      if (result && result) {
        console.log('Usuario registrado:', result);
        this.idToken = result.idToken;
        
        // Success SweetAlert
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Usuario registrado correctamente. Serás redirigido para iniciar sesión.',
          confirmButtonColor: '#3085d6',
          timer: 3000
        });
        
        this.successMessage = '✅ Usuario registrado con éxito.';
        this.registerForm.reset(); // 👈 Limpiar el formulario
        
        // Redirigir después del éxito y la alerta
        this.router.navigate(['/login']); 
      }

    } catch (error: any) {
      this.errorMessage = error?.error?.mensaje || '❌ Error al registrar el usuario.';
      
      // Error SweetAlert
      await Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: this.errorMessage,
        confirmButtonColor: '#d33',
      });
      console.error('Error en registro:', error);
    } finally {
      this.loading = false;
    }
  }

  // El método logResponse se puede adaptar o eliminar si no se necesita
  logResponse() {
    console.log('Formulario actual:', this.registerForm.value);
    console.log('token:', this.idToken);
    console.log('Mensaje de éxito:', this.successMessage);
    console.log('Mensaje de error:', this.errorMessage);
    console.log('Cargando:', this.loading);
  }
}