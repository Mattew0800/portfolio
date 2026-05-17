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
    { number: 1, label: 'Projects', visited: false },
    { number: 2, label: 'Skills', visited: false },
    { number: 3, label: 'About', visited: false },
    { number: 4, label: 'Contact', visited: false },
    { number: 5, label: 'Exit', visited: false }
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
    // Forzar la recarga de los módulos visitados desde el estado
    const currentVisitedModules = this.moduleStateService.getVisitedModules();
    console.log(`🔄 Recargando módulos visitados: ${Array.from(currentVisitedModules).join(', ') || 'ninguno'}`);
    this.updateModuleVisibility(currentVisitedModules);
    this.setupModuleClickListeners();
  }

  private setupModuleClickListeners(): void {
    if (!this.svgElement) {
      console.error('❌ SVG Element NO disponible');
      return;
    }

    const svg = this.svgElement.nativeElement as SVGSVGElement;
    const moduleRoutes: { [key: number]: string } = {
      1: 'projects',
      2: 'skills',
      3: 'about',
      4: 'contact',
      5: 'exit'  // EXIT action
    };

    console.log('🔗 Configurando listeners de click en módulos...');

    for (let i = 1; i <= 5; i++) {
      const modulePath = svg.getElementById(`MODULO ${i}`) as SVGPathElement;
      if (modulePath) {
        modulePath.style.cursor = 'pointer';
        modulePath.addEventListener('click', () => {
          console.log(`🚀 ¡CLICK DETECTADO EN MÓDULO ${i}!`);
          this.handleModuleClick(i, moduleRoutes[i]);
        });
        console.log(`✅ Listener registrado para MÓDULO ${i}`);
      } else {
        console.warn(`❌ MÓDULO ${i} NO ENCONTRADO en SVG`);
      }
    }
  }

  private handleModuleClick(moduleNumber: number, action: string): void {
    // Marcar como visitado
    this.moduleStateService.setVisitedModule(moduleNumber);
    console.log(`✅ Módulo ${moduleNumber} marcado como visitado`);

    // Forzar la actualización visual inmediata
    this.updateModuleVisibility(this.moduleStateService.getVisitedModules());

    if (action === 'exit') {
      // Si es EXIT, esperar un poco y luego cerrar el modal
      // Esto asegura que el estado se guarde correctamente
      setTimeout(() => {
        console.log(`🚀 Ejecutando EXIT después de marcar como visitado`);
        this.onBack();
      }, 100);
    } else {
      // Si es otro módulo, abrir el modal correspondiente
      this.modalService.openModal(action);
    }
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
    console.log('👋 Botón BACK presionado - Cerrando modal...');

    // Incrementar contador de veces que se presiona EXIT
    const pressCount = this.moduleStateService.incrementExitPressCount();

    // Solo marcar como visitado la SEGUNDA VEZ en adelante
    // (ignorar la primera vez que es la carga inicial en HOME)
    if (pressCount >= 2) {
      console.log('✅ EXIT presionado la segunda vez - marcando módulo 5 como visitado');
      this.moduleStateService.setVisitedModule(5);
      this.updateModuleVisibility(this.moduleStateService.getVisitedModules());
    } else {
      console.log('⏭️  Primera vez en EXIT (carga inicial) - ignorando');
    }

    this.modalService.closeModal();
  }
}
