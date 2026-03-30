import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleStateService {
  private visitedModulesSubject = new BehaviorSubject<Set<number>>(new Set());
  public visitedModules$: Observable<Set<number>> = this.visitedModulesSubject.asObservable();

  constructor() {}

  setVisitedModule(moduleNumber: number): void {
    const visitedModules = new Set(this.visitedModulesSubject.value);
    visitedModules.add(moduleNumber);
    this.visitedModulesSubject.next(visitedModules);
  }

  getVisitedModules(): Set<number> {
    return this.visitedModulesSubject.value;
  }

  isModuleVisited(moduleNumber: number): boolean {
    return this.visitedModulesSubject.value.has(moduleNumber);
  }
}

