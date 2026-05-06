import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModuleStateService, BootEntry } from './module-state.service';

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

  // Mapeo de modalName a texto legible
  private modalDisplayNames: { [key: string]: string } = {
    'projects': 'PROJECTS',
    'skills': 'SKILLS',
    'about': 'ABOUT',
    'contact': 'CONTACT',
    'ship-modules': 'SHIP MODULES',
    'logs': 'LOGS'
  };

  constructor(private moduleStateService: ModuleStateService) {}

  openModal(modalName: string): void {
    console.log(`📂 Abriendo modal: ${modalName}`);
    this.activeModalSubject.next(modalName);

    // Registrar en el log
    this.logUserAction(`Accessing modal: ${this.modalDisplayNames[modalName.toLowerCase()] || modalName}`);

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

  // ── User Action Logging ─────────────────────────────────────────────
  private logUserAction(action: string): void {
    const history = this.moduleStateService.getInteractionLogHistory();
    let nextId = 0;
    if (history.length > 0) {
      nextId = Math.max(...history.map(e => e.id)) + 1;
    }

    // Crear entrada de acción con estado "ok" (ya completada)
    const newEntry: BootEntry = {
      id: nextId,
      text: action,
      status: 'ok'
    };

    // Agregar al historial de interacción
    const updatedHistory = [...history, newEntry];
    this.moduleStateService.setInteractionLogHistory(updatedHistory);

    // Asegurar que showReady sigue siendo true
    if (!this.moduleStateService.getShowReady()) {
      this.moduleStateService.setShowReady(true);
    }
  }

  logDownloadAction(fileName: string): void {
    this.logUserAction(`Downloading: ${fileName}`);
  }

  logInteractionAction(action: string): void {
    this.logUserAction(action);
  }
}

