import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from './components/shared/shared.module';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';







@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  SharedModule,CommonModule, MatSnackBarModule, MatButtonModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FINTECH';
}
