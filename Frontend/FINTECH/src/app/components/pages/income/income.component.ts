import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncomeService } from '../../../services/income.service';
// import { NotifyService } from '../../../services/notify.service'; // ❌ Ya no es necesario si usamos Swal
import Swal from 'sweetalert2';


@Component({
  selector: 'app-income',
  standalone: true, // Asegurar que sea standalone
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent {

  incomeForm: FormGroup;
  loading = false;
  // Propiedades 'successMessage' y 'errorMessage' ya no son necesarias para Swal
  // successMessage = ''; 
  // errorMessage = '';

  // 💡 Eliminamos NotifyService de las inyecciones
  constructor(private fb: FormBuilder,
              private incomeSvc: IncomeService
              /* private notifySvc: NotifyService */) 
  { 
    this.incomeForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      monto: ['0', [Validators.required, Validators.min(1)]], // Usar Validators.min(1) para asegurar un valor positivo
      fecha: ['', [Validators.required]],
      categoria: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // =====================================================================
  // 🔹 Función para manejar el envío del formulario
  // =====================================================================
  async registrarIngreso() {
    
    // 1. Verificar validez del formulario
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      await Swal.fire({
          icon: 'warning',
          title: 'Formulario Inválido',
          text: 'Por favor, revisa y completa todos los campos requeridos correctamente.',
          confirmButtonColor: '#3085d6',
      });
      return;
    }

    this.loading = true;

    // 2. Mostrar alerta de carga con SweetAlert2
    Swal.fire({
      title: 'Registrando Ingreso...',
      text: 'Por favor, espera mientras se procesa la transacción.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 3. Llamada al servicio
      await this.incomeSvc.addIngreso(this.incomeForm.value);

      // 4. Si el registro es exitoso:
      // Cerrar alerta de carga y mostrar éxito
      Swal.close(); 
      await Swal.fire({
        icon: 'success',
        title: '¡Ingreso Registrado! ✅',
        text: 'El ingreso se ha guardado correctamente en tu billetera.',
        confirmButtonColor: '#3085d6',
        timer: 3000 // Se cierra automáticamente después de 3 segundos
      });
      
      // Reiniciar el formulario
      this.incomeForm.reset({ fecha: new Date().toISOString().substring(0, 10), monto: '0' }); // Opcional: Establecer fecha actual
      
    } catch (error: any) {
      // 5. Si ocurre un error:
      console.error('Error al registrar ingreso:', error);
      
      // Cerrar alerta de carga y mostrar error
      Swal.close();
      const errorMessage = (error as any)?.message ?? 'No se pudo registrar el ingreso. Intenta nuevamente.';
      
      await Swal.fire({
        icon: 'error',
        title: 'Error de Registro ❌',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });

    } finally {
      // 6. Finalizar la carga
      this.loading = false;
    }
  }
}