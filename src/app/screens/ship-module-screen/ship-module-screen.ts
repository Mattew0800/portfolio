import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ship-module-screen',
  standalone: true,
  imports: [],
  templateUrl: './ship-module-screen.html',
  styleUrl: './ship-module-screen.scss',
})
export class ShipModuleScreen implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svg', { static: false }) svgElement?: ElementRef<SVGSVGElement>;
  private moduleSubscription?: Subscription;

  constructor(
    private router: Router,
    private moduleStateService: ModuleStateService
  ) {}

  ngOnInit(): void {
    this.moduleSubscription = this.moduleStateService.visitedModules$.subscribe(
      (visitedModules: Set<number>) => {
        this.updateModuleVisibility(visitedModules);
      }
    );
  }

  ngAfterViewInit(): void {
    // Asegurar que el SVG esté disponible después de que la vista se inicialice
    const currentVisitedModules = this.moduleStateService.getVisitedModules();
    this.updateModuleVisibility(currentVisitedModules);
  }

  ngOnDestroy(): void {
    if (this.moduleSubscription) {
      this.moduleSubscription.unsubscribe();
    }
  }

  private updateModuleVisibility(visitedModules: Set<number>): void {
    // Si el SVG aún no está disponible, reintentar después de un pequeño delay
    if (!this.svgElement) {
      console.warn('SVG no está disponible, reintentando...');
      setTimeout(() => {
        this.updateModuleVisibility(visitedModules);
      }, 100);
      return;
    }

    const svg = this.svgElement.nativeElement as SVGSVGElement;

    console.log(`Actualizando módulos: módulos visitados = ${Array.from(visitedModules).join(', ') || 'ninguno'}`);

    const RED_COLOR = '#71040B';    // Color rojo por defecto
    const GREEN_COLOR = '#047109';  // Color verde cuando se visita
    const OPACITY = '0.6';          // Opacidad siempre 60%

    // Actualizar color de todos los módulos
    for (let i = 1; i <= 5; i++) {
      const modulePath = svg.getElementById(`MODULO ${i}`) as SVGPathElement;
      if (modulePath) {
        if (visitedModules.has(i)) {
          // Módulo visitado: cambia a verde y PERMANECE verde
          modulePath.setAttribute('fill', GREEN_COLOR);
          modulePath.setAttribute('fill-opacity', OPACITY);
          console.log(`✅ Módulo ${i} - VERDE (visitado)`);
        } else {
          // Módulos no visitados: rojo por defecto
          modulePath.setAttribute('fill', RED_COLOR);
          modulePath.setAttribute('fill-opacity', OPACITY);
          console.log(`🔴 Módulo ${i} - ROJO (no visitado)`);
        }
      } else {
        console.warn(`⚠️ No se encontró el elemento con id "MODULO ${i}"`);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
