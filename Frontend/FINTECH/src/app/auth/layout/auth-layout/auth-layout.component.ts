// src/app/auth/layout/auth-layout/auth-layout.component.ts (Ejemplo)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ⬅️ ¡La clave!
import { RouterOutlet } from '@angular/router'; // Si lo usa

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  // 🔑 ¡Añadir CommonModule aquí también es necesario!
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent { /* ... */ }