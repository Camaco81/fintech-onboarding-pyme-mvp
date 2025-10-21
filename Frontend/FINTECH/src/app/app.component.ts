import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from './components/shared/shared.module';





@Component({
  selector: 'app-root',
  imports: [RouterOutlet,SharedModule ], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FINTECH';
}
