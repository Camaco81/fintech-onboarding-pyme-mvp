import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common'; // Añadir CommonModule si vas a usar *ngIf, etc.

@Component({
  selector: 'app-loading',
  standalone: true, // Asegurar que sea standalone
  imports: [RouterLink, CommonModule], // Incluir CommonModule
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent  { // 💡 Implementamos OnInit

  // Tiempo de espera en milisegundos (ej: 3 segundos)
  private readonly REDIRECT_DELAY = 3000; 

  constructor(private router: Router) { } // 💡 Inyectamos el Router

  /* ngOnInit(): void {
    // 1. Mostrar un mensaje en consola
    console.log(`Cargando... Redirigiendo en ${this.REDIRECT_DELAY / 1000} segundos.`);
    
    // 2. Usar setTimeout para esperar el tiempo definido
    setTimeout(() => {
      // 3. Redirigir a la ruta deseada (ejemplo: /home o /dashboard)
      this.router.navigate(['/home']); 
    }, this.REDIRECT_DELAY);
  } */
}