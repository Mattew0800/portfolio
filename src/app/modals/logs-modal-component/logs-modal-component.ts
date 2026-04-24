import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { LogScreen } from '../../screens/log-screen/log-screen';

@Component({
  selector: 'app-logs-modal-component',
  standalone: true,
  imports: [CommonModule, LogScreen],
  templateUrl: './logs-modal-component.html',
  styleUrl: './logs-modal-component.scss',
})
export class LogsModalComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📋 Componente Log Modal cargado');
  }

  closeModal(): void {
    console.log('📂 Cerrando Log Modal');
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
