import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
// 🔑 Importación necesaria para *ngIf, *ngFor, etc.
import { CommonModule } from '@angular/common'; 
// 🔑 Importación necesaria para [formGroup] y FormControl
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms'; 

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // Asegura que se defina como Standalone
  // 💥 CORRECCIÓN DE ERROR: Añadir CommonModule y ReactiveFormsModule
  imports: [
    RouterOutlet, 
    ReactiveFormsModule,
     CommonModule
  ], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!: FormGroup;

  // Uso de 'inject' para inyección moderna
  private authService = inject(AuthService);
  private fb = inject(FormBuilder); 
  private router = inject(Router);

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
      const user = await this.authService.login(email, password); 

      console.log(`✅ Login Exitoso para: ${email}`);
      console.log('Datos del usuario (del servicio):', user);
      
      this.router.navigate(['/dashboard']); 

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      // Lógica de errores UI
    }
  }
}