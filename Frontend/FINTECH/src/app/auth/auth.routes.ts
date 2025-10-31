import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../auth/layout/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';


export const authRoutes: Routes = [
{
    path: '', 
    component:AuthLayoutComponent,
     children: [
        {
            path: 'login', 
        component : LoginComponent,
        },
        {
            path: 'register',
            component:RegisterComponent,

        },
        {
            path:'profile',
            component : ProfileComponent,
        },
        {path: '', redirectTo: 'login', pathMatch: 'full'}
        


    ],
        providers: [
            importProvidersFrom(MatSnackBarModule)
        ]

}
];
export default authRoutes;

