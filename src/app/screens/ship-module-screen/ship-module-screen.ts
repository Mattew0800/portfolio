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
    const currentVisitedModules = this.moduleStateService.getVisitedModules();
    this.updateModuleVisibility(currentVisitedModules);
  }

  ngOnDestroy(): void {
    if (this.moduleSubscription) {
      this.moduleSubscription.unsubscribe();
    }
  }

  private updateModuleVisibility(visitedModules: Set<number>): void {
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
}

