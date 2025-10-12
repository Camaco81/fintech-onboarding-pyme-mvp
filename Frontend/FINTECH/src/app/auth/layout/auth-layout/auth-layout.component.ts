import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../components/shared/shared.module';
import { NavbarComponent } from "../../../components/shared/navbar/navbar.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, SharedModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent {

}
