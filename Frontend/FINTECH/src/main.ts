import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './enviroments/enviroments'; 

bootstrapApplication(AppComponent, {
  providers:[
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]}
)
  .catch((err) => console.error(err));
