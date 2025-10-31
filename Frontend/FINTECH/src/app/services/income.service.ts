import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  private ingresosSubject = new BehaviorSubject<any[]>([]);
  ingresos$ = this.ingresosSubject.asObservable();

  async addIngreso(ingresoData: any) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const ingresosCollection = collection(this.firestore, 'ingresos');
    await addDoc(ingresosCollection, {
      ...ingresoData,
      userId: user.uid,
      createdAt: new Date()
    });

    // 🔁 Actualiza el listado después de agregar
    const nuevos = await this.getIngresosByUser();
    this.ingresosSubject.next(nuevos);
  }

  async getIngresosByUser() {
    const user = this.auth.currentUser;
    if (!user) return [];

    const ingresosCollection = collection(this.firestore, 'ingresos');
    const snapshot = await getDocs(ingresosCollection);
    const lista = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.userId === user.uid);

    // Actualizamos también el observable
    this.ingresosSubject.next(lista);
    return lista;
  }
}
