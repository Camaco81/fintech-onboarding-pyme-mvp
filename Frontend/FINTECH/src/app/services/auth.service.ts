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

// Asegúrate de que tu interfaz de usuario esté bien definida
interface FlaskUser {
  email: string;
  // ... otros campos
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // 🔑 Inyección usando 'inject' (Patrón Angular Standalone)
  // El compilador busca tokens de inyección: Auth, Firestore y HttpClient tienen un valor inyectable.
  private auth: Auth = inject(Auth); 
  private firestore: Firestore = inject(Firestore); // 🔑 CORRECCIÓN: Inyección de Firestore
  private http = inject(HttpClient);
  
  // URL de tu API de Flask
  private FLASK_URL = 'http://127.0.0.1:5000/api/v1/auth'; 
  
  // =========================================================================
  // LOGIC FOR LOGIN
  // =========================================================================

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      // Usa this.auth como primer argumento
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password); 
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // =========================================================================
  // LOGIC FOR REGISTER (Llamada a Flask y Verificación de Email)
  // =========================================================================
  
 async callFlaskSetupUser(email: string, password: string, nombre: string, telefono: string): Promise<any> {
    const FLASK_URL = 'http://127.0.0.1:5000/api/v1/auth/setup-user';
    
    try {
        const response = await fetch(FLASK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                nombre_completo: nombre, // Asegúrate de que el nombre del campo coincida con Flask
                telefono: telefono
            })
        });

        const data = await response.json();

        // Si el código NO es 2xx (ej: 409 o 500), lanzamos el error con el mensaje de Flask
        if (!response.ok) {
            // data.mensaje viene del JSON de Flask (ej: {"mensaje": "El email ya está registrado..."})
            const error = new Error(data.mensaje || 'Error desconocido del backend');
            // Añadimos la respuesta completa como propiedad para un mejor manejo en el componente
            (error as any).error = data; 
            throw error;
        }

        // Éxito (código 200 OK)
        return data;

    } catch (error) {
        // Relanza cualquier error de red o el error del backend
        throw error;
    }
}

  // Métodos que faltaban en tu archivo:
  
  // -------------------------------------------------------------------------
  // EJEMPLO: Funcionalidad de Firestore (Descomentando tus métodos)
  // -------------------------------------------------------------------------

  // 🔑 CORRECCIÓN DE SINTAXIS (async/await, addDoc importado)
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

  // 🔑 CORRECCIÓN DE SINTAXIS (async/await, getDocs, collection importados)
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
  // EJEMPLO: Función Protegida (Implementación con RxJS y async/await)
  // -------------------------------------------------------------------------

  // 🔑 CORRECCIÓN DE SINTAXIS Y TIPADO (Observable importado, Auth inyectado)
  async testProtectedRoute(): Promise<Observable<any>> {
    const user: User | null = await this.auth.currentUser; // Obtiene el usuario actual
    
    if (!user) { // 🔑 CORRECCIÓN: Sintaxis y manejo de nulo
      // Si no hay usuario, retorna un observable con un error o un valor de acceso denegado.
      return new Observable(observer => {
        observer.error({ status: 401, message: 'Acceso Denegado' });
        observer.complete();
      });
    }

    const token = await user.getIdToken(true); // Obtiene token fresco
    
    const headers = { 'Authorization': `Bearer ${token}` };
    const url = `${this.FLASK_URL}/test-pyme-access`;
    
    // Retorna el Observable de la llamada HTTP
    return this.http.get(url, { headers: headers });
  }

}