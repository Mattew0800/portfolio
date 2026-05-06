import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BootEntry {
    id:      number;
    text:    string;
    status:  'pending' | 'ok' | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleStateService {
  private visitedModulesSubject = new BehaviorSubject<Set<number>>(new Set());
  public visitedModules$: Observable<Set<number>> = this.visitedModulesSubject.asObservable();

  private bootLogHistorySubject = new BehaviorSubject<BootEntry[]>([]);
  public bootLogHistory$: Observable<BootEntry[]> = this.bootLogHistorySubject.asObservable();

  private interactionLogHistorySubject = new BehaviorSubject<BootEntry[]>([]);
  public interactionLogHistory$: Observable<BootEntry[]> = this.interactionLogHistorySubject.asObservable();

  private showIdentitySubject = new BehaviorSubject<boolean>(false);
  public showIdentity$: Observable<boolean> = this.showIdentitySubject.asObservable();

  private showReadySubject = new BehaviorSubject<boolean>(false);
  public showReady$: Observable<boolean> = this.showReadySubject.asObservable();

  private isFirstVisitSubject = new BehaviorSubject<boolean>(true);
  public isFirstVisit$: Observable<boolean> = this.isFirstVisitSubject.asObservable();

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

  // Boot log management
  setBootLogHistory(entries: BootEntry[]): void {
    this.bootLogHistorySubject.next(entries);
  }

  getBootLogHistory(): BootEntry[] {
    return this.bootLogHistorySubject.value;
  }

  // Interaction log management
  setInteractionLogHistory(entries: BootEntry[]): void {
    this.interactionLogHistorySubject.next(entries);
  }

  getInteractionLogHistory(): BootEntry[] {
    return this.interactionLogHistorySubject.value;
  }

  setShowIdentity(show: boolean): void {
    this.showIdentitySubject.next(show);
  }

  getShowIdentity(): boolean {
    return this.showIdentitySubject.value;
  }

  setShowReady(show: boolean): void {
    this.showReadySubject.next(show);
  }

  getShowReady(): boolean {
    return this.showReadySubject.value;
  }

  setIsFirstVisit(isFirst: boolean): void {
    this.isFirstVisitSubject.next(isFirst);
  }

  getIsFirstVisit(): boolean {
    return this.isFirstVisitSubject.value;
  }

  resetBootLog(): void {
    this.bootLogHistorySubject.next([]);
    this.interactionLogHistorySubject.next([]);
    this.showIdentitySubject.next(false);
    this.showReadySubject.next(false);
    this.isFirstVisitSubject.next(true);
  }
}

