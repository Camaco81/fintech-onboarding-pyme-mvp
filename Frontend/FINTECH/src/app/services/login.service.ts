
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(  private router: Router,
                
                private firestore: Firestore, 
                private auth :Auth ) {  }


  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async addData(collectionName: string, data: any) {
    return await addDoc(collection(this.firestore, collectionName), data);
  }

  async getData(collectionName: string) {
    const snapshot = await getDocs(collection(this.firestore, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  }

