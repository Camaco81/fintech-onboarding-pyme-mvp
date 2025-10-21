
import { Injectable, inject } from '@angular/core';


import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { environment } from '../../enviroments/enviroments';
import { LoginModel } from '../models/login.model';
import { User, UserStatus } from '../interfaces';

import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class LoginService {

private apiUrl = "http://127.0.0.1:5000/api/v1/auth";
 
email: string = '';
password: string = '';
id: string = '';

 
  private userCurrent = signal<User|null>(null);
  private logStatus = signal<UserStatus>(UserStatus.checking);  


  constructor(  private router: Router,
                private firestore: Firestore, 
                private auth :Auth ) {  }

                
 /* login(email: string, password: string) : Observable<boolean>{
  
   

  return of(true);
  }
 */
async login(email: string, password: string) : Promise<Observable<any>>{
  const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
  const token = await userCredential.user.getIdToken();
  localStorage.setItem('token', token);
  localStorage.setItem('email', email);
  localStorage.setItem('uid', userCredential.user.uid);
  this.router.navigate(['/dashboard']);
  console.log(userCredential);
  return of(userCredential);

}
  
  }

