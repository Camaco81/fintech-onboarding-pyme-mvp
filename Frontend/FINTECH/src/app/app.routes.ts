// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes')
            .then(m => m.authRoutes),

        // USA 'providers' y no 'loadProviders' (Corregido el TS2561)
        
    },
    {
        path: '',
        redirectTo: 'auth',
        // CORREGIDO EL ERROR TS2561: pathPath -> pathMatch
        pathMatch: 'full' 
    }
];