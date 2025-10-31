import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IncomeService } from '../../../services/income.service';
import { NotifyService } from '../../../services/notify.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-income',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent {

  incomeForm :FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';


  constructor (private fb : FormBuilder,
              private incomeSvc : IncomeService,
              private notifySvc : NotifyService)
    { 

    this.incomeForm = this.fb.group({
        descripcion: ['',[Validators.required, Validators.minLength(3)]],
        monto: ['0',[Validators.required, Validators.minLength(3)]],
        fecha: ['',[Validators.required]],
        categoria: ['',[Validators.required, Validators.minLength(3)]],
      });
    }
  
  async registrarIngreso() {
  this.loading = true;

  try {
  try {
    // addIngreso likely returns void/Promise<void>, so just await it without checking its truthiness
    await this.incomeSvc.addIngreso(this.incomeForm.value);

    this.notifySvc.success('Ingreso registrado', '✅ El ingreso se ha guardado correctamente.');
    this.incomeForm.reset({ fecha: new Date() });

  } catch (error: any) {
    console.error('Error al registrar ingreso:', error);

    this.notifySvc.error('Error', '❌ No se pudo registrar el ingreso. Intenta nuevamente.');

  } finally {
    this.loading = false;
  }
} catch (error) {
  console.error('Error inesperado:', error);
  this.notifySvc.error('Error', '❌ Ocurrió un error inesperado. Intenta nuevamente.');
  this.loading = false;
}
  }
}
  