import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModuleStateService } from '../../services/module-state.service';
import { Subscription } from 'rxjs';
import { CockpitScreenFrameComponent } from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import { ModalService } from "../../services/modal.service";

@Component({
  selector: 'app-ship-modal-component',
  standalone: true,
  imports: [CommonModule, CockpitScreenFrameComponent],
  templateUrl: './ship-modal-component.html',
  styleUrl: './ship-modal-component.scss',
})
export class ShipModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svg', { static: false }) svgElement?: ElementRef<SVGSVGElement>;
  private moduleSubscription?: Subscription;

  // Para el template
  modules = [
    { number: 1, label: 'Home', visited: false },
    { number: 2, label: 'Projects', visited: false },
    { number: 3, label: 'Skills', visited: false },
    { number: 4, label: 'About', visited: false },
    { number: 5, label: 'Contact', visited: false }
  ];
  visitedModules = new Set<number>();

  constructor(
    private router: Router,
    private moduleStateService: ModuleStateService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.moduleSubscription = this.moduleStateService.visitedModules$.subscribe(
      (visitedModules: Set<number>) => {
        this.updateModuleVisibility(visitedModules);
      }
    );
  }

  ngAfterViewInit(): void {
    const currentVisitedModules = this.moduleStateService.getVisitedModules();
    this.updateModuleVisibility(currentVisitedModules);
  }

  ngOnDestroy(): void {
    if (this.moduleSubscription) {
      this.moduleSubscription.unsubscribe();
    }
  }

  private updateModuleVisibility(visitedModules: Set<number>): void {
    // Actualizar el conjunto de módulos visitados para el template
    this.visitedModules = visitedModules;

    // Actualizar el arreglo de módulos
    this.modules.forEach(module => {
      module.visited = visitedModules.has(module.number);
    });

    if (!this.svgElement) {
      console.warn('SVG no está disponible, reintentando...');
      setTimeout(() => {
        this.updateModuleVisibility(visitedModules);
      }, 100);
      return;
    }

    const svg = this.svgElement.nativeElement as SVGSVGElement;

    console.log(`Actualizando módulos: módulos visitados = ${Array.from(visitedModules).join(', ') || 'ninguno'}`);

    const RED_COLOR = '#71040B';
    const GREEN_COLOR = '#047109';
    const OPACITY = '0.6';

    for (let i = 1; i <= 5; i++) {
      const modulePath = svg.getElementById(`MODULO ${i}`) as SVGPathElement;
      if (modulePath) {
        if (visitedModules.has(i)) {
          modulePath.setAttribute('fill', GREEN_COLOR);
          modulePath.setAttribute('fill-opacity', OPACITY);
          console.log(`✅ Módulo ${i} - VERDE (visitado)`);
        } else {
          modulePath.setAttribute('fill', RED_COLOR);
          modulePath.setAttribute('fill-opacity', OPACITY);
          console.log(`🔴 Módulo ${i} - ROJO (no visitado)`);
        }
      } else {
        console.warn(`⚠️ No se encontró el elemento con id "MODULO ${i}"`);
      }
    }
  }

  onBack(): void {
    this.modalService.closeModal();
  }
}
