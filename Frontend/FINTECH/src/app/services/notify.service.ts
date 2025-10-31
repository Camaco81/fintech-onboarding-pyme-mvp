import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  

    success(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#4CAF50',
      timer: 2500,
      showConfirmButton: false
    });
  }

  error(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#d33',
      timer: 3000,
      showConfirmButton: false
    });
  }

  warning(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonColor: '#FFA500'
    });
  }

  info(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: '#3085d6'
    });
  }

  confirm(title: string, text?: string): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33'
    }).then(result => result.isConfirmed);
  }
  

  



}

    

  

