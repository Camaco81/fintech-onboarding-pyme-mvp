import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// 🔑 1. Importaciones de Firebase AUTH (Necesarias para sendEmailVerification, signOut)
import { 
  Auth, 
  UserCredential, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  User
} from '@angular/fire/auth'; 
// 🔑 2. Importaciones de Firestore (Necesarias para usar Firestore)
import { 
  Firestore, 
  collection, 
  getDocs, 
  addDoc 
} from '@angular/fire/firestore'; 

// 🔑 3. Importaciones de RxJS (Necesarias para from, firstValueFrom, switchMap)
import { firstValueFrom, from, Observable, switchMap } from 'rxjs'; 

// 🚨 IMPORTANTE: En un proyecto real de Angular, usarías 'environment.prod.ts' aquí
// Para simplificar, definimos la constante directamente.
const API_BASE_URL = 'https://fintech-onboarding-pyme-mvp.onrender.com/api/v1';


interface FlaskUser {
  email: string;
  token: string;
  uid: string;
  providerId: string;

  // ... otros campos
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // 🔑 Inyección usando 'inject' (Patrón Angular Standalone)
  private auth: Auth = inject(Auth); 
  private firestore: Firestore = inject(Firestore); 
  private http = inject(HttpClient);
  
  // 🟢 URL de tu API de Flask AJUSTADA a la de Render
  private FLASK_BASE_URL = API_BASE_URL; 
  private AUTH_URL = `${API_BASE_URL}/auth`;
  
  // =========================================================================
  // LOGIC FOR LOGIN
  // =========================================================================

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password); 
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // =========================================================================
  // LOGIC FOR REGISTER (Llamada a Flask y Verificación de Email)
  // =========================================================================
  
  async callFlaskSetupUser(nombre: string,email: string, password: string,  telefono: string): Promise<any> {
    // 🟢 CORREGIDO: Usamos la URL de Producción
    const FLASK_SETUP_USER_URL = `${this.AUTH_URL}/setup-user`; 
    
    try {
      // 🟢 CORREGIDO: Usamos la nueva constante para el endpoint de producción
      const response = await fetch(FLASK_SETUP_USER_URL, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_completo: nombre, 
          email: email,
          password: password,
          telefono: telefono
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.mensaje || 'Error desconocido del backend');
        (error as any).error = data; 
        throw error;
      }

      return data;

    } catch (error) {
      throw error;
    }
  }
  async getUserDisplayName(): Promise<string | null> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const FLASK_USER_URL = `${this.AUTH_URL}/user/${currentUser.uid}`;
      const response = await fetch(FLASK_USER_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      return userData.nombre_completo || null;

    } catch (error) {
      console.error('Error getting user display name:', error);
      return null;
    }
  }

  // Métodos que faltaban en tu archivo:
  
  // -------------------------------------------------------------------------
  // EJEMPLO: Funcionalidad de Firestore
  // -------------------------------------------------------------------------

  async addData(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, collectionName), data);
      console.log("Documento escrito con ID: ", docRef.id);
      return docRef;
    } catch (e) {
      console.error("Error al añadir documento: ", e);
      throw e;
    }
  }

  async getData(collectionName: string) {
    try {
      const snapshot = await getDocs(collection(this.firestore, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error al obtener documentos: ", e);
      throw e;
    }
  }

  // -------------------------------------------------------------------------
  // EJEMPLO: Función Protegida
  // -------------------------------------------------------------------------

  async testProtectedRoute(): Promise<Observable<any>> {
    const user: User | null = await this.auth.currentUser; 
    
    if (!user) { 
      return new Observable(observer => {
        observer.error({ status: 401, message: 'Acceso Denegado' });
        observer.complete();
      });
    }

    const token = await user.getIdToken(true); 
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // 🟢 CORREGIDO: Usamos la URL de Producción
    const url = `${this.AUTH_URL}/test-pyme-access`;
    
    return this.http.get(url, { headers: headers });
  }
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  authStatus(): boolean {
    return this.auth.currentUser !== null;
  }
}