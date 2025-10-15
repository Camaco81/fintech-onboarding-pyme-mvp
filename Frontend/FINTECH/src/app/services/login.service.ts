
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { environment } from '../../enviroments/enviroments';
import { LoginModel } from '../models/login.model';

import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class LoginService {

private apiUrl = "http://127.0.0.1:5000/api/v1/auth/login";
 
email: string = '';
password: string = '';
id: string = '';

  private http = inject(HttpClient);
  /* private userCurrent = signal<User|null>(null);
  private logStatus = signal<LoginStatus>();  */


  constructor(  private router: Router,
                private firestore: Firestore, 
                private auth :Auth ) {  }

                
 login(email: string, password: string) : Observable<boolean>{
  
   

  return of(true);
  }

  
  }

