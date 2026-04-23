import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSubject = new BehaviorSubject<string | null>(null);
  public activeModal$ = this.activeModalSubject.asObservable();

  constructor() {}

  openModal(modalName: string): void {
    console.log(`📂 Abriendo modal: ${modalName}`);
    this.activeModalSubject.next(modalName);
  }

  closeModal(): void {
    console.log(`✅ Cerrando modal`);
    this.activeModalSubject.next(null);
  }
}

