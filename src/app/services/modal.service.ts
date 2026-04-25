import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModuleStateService } from './module-state.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSubject = new BehaviorSubject<string | null>(null);
  public activeModal$ = this.activeModalSubject.asObservable();

  // Mapeo de nombres de modal a números de módulo
  private modalToModuleMap: { [key: string]: number } = {
    'home': 1,
    'projects': 2,
    'skills': 3,
    'about': 4,
    'contact': 5,
    'ship-modules': 0, // No tiene módulo asignado (es el mapa en sí)
    'logs': 0           // No tiene módulo asignado
  };

  constructor(private moduleStateService: ModuleStateService) {}

  openModal(modalName: string): void {
    console.log(`📂 Abriendo modal: ${modalName}`);
    this.activeModalSubject.next(modalName);

    // Marcar el módulo como visitado
    const moduleNumber = this.modalToModuleMap[modalName.toLowerCase()];
    if (moduleNumber) {
      this.moduleStateService.setVisitedModule(moduleNumber);
      console.log(`✅ Módulo ${moduleNumber} marcado como visitado`);
    }
  }

  closeModal(): void {
    console.log(`✅ Cerrando modal`);
    this.activeModalSubject.next(null);
  }
}

