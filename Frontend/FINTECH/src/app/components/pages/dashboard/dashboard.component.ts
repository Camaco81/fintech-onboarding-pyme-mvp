import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '@angular/fire/auth';
import { IncomeService } from '../../../services/income.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
addIngreso(arg0: any[]) {
throw new Error('Method not implemented.');
}

  userName: string = '';
  userEmail: string  = '';
  ingresos: any[] = [];

  constructor(private readonly authService: AuthService, 
              private readonly incomeSvc: IncomeService
  ) {}

  async ngOnInit() {
    try {
      const currentUser: User | null = this.authService.getCurrentUser();

      if (currentUser) {
        
        const displayName = currentUser.displayName?.trim();
        const email = currentUser.email?.trim();

        this.ingresos = await this.incomeSvc.getIngresosByUser();
        
        
        this.userName = displayName || email || 'Usuario';
        this.userEmail = email || '';
      } else {
       console.log(   this.userEmail)
        const nameFromServer = await this.authService.getUserDisplayName();
        this.userName = nameFromServer || 'Usuario';
      }

      this.incomeSvc.getIngresosByUser();

      this.incomeSvc.ingresos$.subscribe((data) => {
        this.ingresos = data;
      });
      

      console.log('👤 Usuario cargado en Dashboard:', this.userEmail);
      console.log(currentUser?.displayName);
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      this.userName = 'Usuario';
    }
    
  }
  /* async crearIngreso(nuevoIngreso: any) {
        try {
          await this.incomeSvc.addIngreso(nuevoIngreso);
          this.ingresos.push(nuevoIngreso);
          console.log('✅ Ingreso creado:', nuevoIngreso);
        } catch (error) {
          console.error('❌ Error creando ingreso:', error);
        }
      } */
}
