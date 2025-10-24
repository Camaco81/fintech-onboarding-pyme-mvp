// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { LoadingComponent } from './components/pages/loading/loading.component';
import { HomeComponent } from './components/pages/home/home.component';


export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes')
        .then(m => m.default)
     },
     {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
     },
     {
      path: 'dashboard', 
      component: DashboardComponent
   },
   {
      path:'loading',
      component: LoadingComponent
   },
   {
      path: 'home',
      component: HomeComponent
   },
   {
      path: '**',
      redirectTo: 'home'

   }
];

export default routes;

       
        
    
    

