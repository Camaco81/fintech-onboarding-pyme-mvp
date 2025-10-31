import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 🔑 Firebase AUTH
import { 
  Auth, 
  UserCredential, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  updateProfile, // 🟢 NUEVO: Importamos esta función
  User
} from '@angular/fire/auth'; 

// 🔑 Firestore
import { 
  Firestore, 
  collection, 
  getDocs, 
  addDoc 
} from '@angular/fire/firestore'; 

// 🔑 RxJS
import { firstValueFrom, from, Observable, switchMap } from 'rxjs'; 

// URL del backend Flask
const API_BASE_URL = 'https://fintech-onboarding-pyme-mvp.onrender.com/api/v1';

interface FlaskUser {
  email: string;
  token: string;
  uid: string;
  providerId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private auth: Auth = inject(Auth); 
  private firestore: Firestore = inject(Firestore); 
  private http = inject(HttpClient);
  
  private FLASK_BASE_URL = API_BASE_URL; 
  private AUTH_URL = `${API_BASE_URL}/auth`;

  // =========================================================================
  // LOGIN
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
  // REGISTER (Llamada a Flask + actualización de nombre en Firebase)
  // =========================================================================
  
  async callFlaskSetupUser(nombre: string, email: string, password: string, telefono: string): Promise<any> {
    const FLASK_SETUP_USER_URL = `${this.AUTH_URL}/setup-user`; 
    
    try {
      // 🔹 1. Crear usuario en el backend Flask
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

      // 🔹 2. Hacer login en Firebase para obtener el usuario actual
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

      // 🔹 3. Actualizar el displayName del usuario recién creado
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: nombre
        });
        console.log('✅ Nombre actualizado en Firebase Auth:', nombre);
      }

      return data;

    } catch (error) {
      console.error('❌ Error en callFlaskSetupUser:', error);
      throw error;
    }
  }

  // =========================================================================
  // Obtener el nombre (si está disponible en backend)
  // =========================================================================

  async getUserDisplayName(): Promise<string > {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) return 'string';

      const FLASK_USER_URL = `${this.AUTH_URL}/user/${currentUser.uid}`;
      const response = await fetch(FLASK_USER_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user data');

      const userData = await response.json();
      return userData.nombre_completo || currentUser.displayName || null; // 🟢 Devuelve el que exista

    } catch (error) {
      console.error('Error getting user display name:', error);
      return 'string';
    }
  }

  // =========================================================================
  // Firestore Utils
  // =========================================================================

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

  // =========================================================================
  // Test Protected Route
  // =========================================================================

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
    const url = `${this.AUTH_URL}/test-pyme-access`;
    
    return this.http.get(url, { headers });
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  authStatus(): boolean {
    return this.auth.currentUser !== null;
  }
}
