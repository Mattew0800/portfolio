import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { ShipModuleScreen } from '../../screens/ship-module-screen/ship-module-screen';

@Component({
  selector: 'app-ship-module-modal',
  standalone: true,
  imports: [CommonModule, ShipModuleScreen],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">✕</button>
        <app-ship-module-screen></app-ship-module-screen>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      width: 100vw;
      height: 100vh;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      position: relative;
      background: #000;
      color: white;
      padding: 0;
      border-radius: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.4s ease-out;
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: #01f1f1;
      font-size: 28px;
      cursor: pointer;
      padding: 8px;
      transition: all 0.2s ease;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;

      &:hover {
        transform: rotate(90deg);
        text-shadow: 0 0 10px rgba(1, 241, 241, 0.6);
        filter: drop-shadow(0 0 6px rgba(1, 241, 241, 0.5));
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class ShipModuleModalComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Componente Ship Module Modal cargado');
  }

  closeModal(): void {
    console.log('📂 Cerrando Ship Module Modal');
    this.modalService.closeModal();
  }

  // Solo cerrar overlay si hace click fuera del contenido
  onOverlayClick(event: MouseEvent): void {
    // Si hace click en el overlay (no en el contenido), cerrar
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}

