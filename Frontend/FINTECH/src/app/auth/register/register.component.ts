import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // ajusta la ruta según tu estructura
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm : FormGroup;
  nombre  :string = '';
  email :string = '';
  password :string = '';
  telefono :string = '';
  
  loading = false;
  successMessage = '';
  idToken: string = '';
  errorMessage = '';

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  // =====================================================================
  // 🔹 Método para registrar el usuario
  // =====================================================================
  async onRegister(form: NgForm) {
    if (form.invalid) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.authService.callFlaskSetupUser(
        this.nombre,
        this.email,
        this.password,
        this.telefono
      );
      
      
      const showSnack = (message: string, isError = false) => {
        this.snackBar.open(message, 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: isError ? ['snackbar-error'] : ['snackbar-success'],
        });
      };

      if (result?.error || result?.ok === false) {
        const msg = result?.mensaje || '❌ Error al registrar el usuario.';
        this.errorMessage = msg;
        showSnack(msg, true);
      } else {
        this.idToken = result?.idToken || result?.token || '';
        const msg = result?.mensaje || '✅ Registro exitoso. Revisa tu correo.';
        this.successMessage = msg;
        showSnack(msg, false);
      }
      this.successMessage = result?.mensaje || '✅ Registro exitoso. Revisa tu correo.';
      this.logResponse();
      form.resetForm();

    } catch (error: any) {
      this.errorMessage = error?.error?.mensaje || '❌ Error al registrar el usuario.';
      console.error('Error en registro:', error);
    } finally {
      this.loading = false;
    }
        }

    logResponse() {
      console.log('Nombre:', this.nombre);
      console.log('Email:', this.email);
      console.log('Teléfono:', this.telefono);
      console.log('token:', this.idToken);
      console.log('Mensaje de éxito:', this.successMessage);
      console.log('Mensaje de error:', this.errorMessage);
      console.log('Cargando:', this.loading);
  }

  
}
