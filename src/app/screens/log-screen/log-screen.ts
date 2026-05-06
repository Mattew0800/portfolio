import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CockpitScreenFrameComponent } from '../../components/cockpit-screen-frame/cockpit-screen-frame';
import { ModalService } from '../../services/modal.service';
import { ModuleStateService, BootEntry } from '../../services/module-state.service';

@Component({
    selector: 'app-log-screen',
    standalone: true,
    imports: [CommonModule, CockpitScreenFrameComponent],
    templateUrl: './log-screen.html',
    styleUrl: './log-screen.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogScreen implements OnInit, OnDestroy {

    readonly NAME  = 'MATIAS OYHAMBURU';
    readonly ROLE  = 'Frontend Developer';
    readonly STACK = 'Angular / TypeScript / CSS';

    private readonly BOOT_STEPS = [
        'Initializing core systems',
        'Loading navigation interface',
        'Mounting UI modules',
        'Establishing environment',
        'Verifying dependencies',
    ];

    // Delay between each log line appearing (ms)
    private readonly STEP_DELAY   = 380;
    // Delay between "pending" → "ok" resolve
    private readonly RESOLVE_DELAY = 260;
    // Maximum number of log entries for each section
    private readonly MAX_BOOT_ENTRIES = 5;
    private readonly MAX_INTERACTION_ENTRIES = 7;

    bootEntries: BootEntry[] = [];
    interactionEntries: BootEntry[] = [];
    showIdentity = false;
    showReady    = false;

    @ViewChild('bootScreen') bootScreenElement?: ElementRef<HTMLDivElement>;

    private bootEntryId = 0;
    private interactionEntryId = 0;
    private destroy$ = new Subject<void>();

    constructor(
        private cdr: ChangeDetectorRef,
        private router: Router,
        private moduleStateService: ModuleStateService,
        public modalService: ModalService,
    ) {}

    ngOnInit(): void {
        // Check if this is the first visit
        const isFirstVisit = this.moduleStateService.getIsFirstVisit();

        if (isFirstVisit) {
            // First visit: run boot sequence
            this.runBootSequence();
            this.moduleStateService.setIsFirstVisit(false);
        } else {
            // Subsequent visits: restore from saved state
            this.restoreLogState();
        }

        this.subscribeToNavigation();
        this.subscribeToLogUpdates();

        // Scroll al bottom cuando se ingresa a la screen (después de un pequeño delay para asegurar que el DOM esté actualizado)
        setTimeout(() => this.scrollToBottom(), 100);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    private scrollToBottom(): void {
        try {
            if (this.bootScreenElement?.nativeElement) {
                const element = this.bootScreenElement.nativeElement;
                element.scrollTop = element.scrollHeight;
            }
        } catch (err) {
            // Silently fail if scrolling is not possible
        }
    }

    // ── Boot sequence ───────────────────────────────────────────────
    private runBootSequence(): void {
        this.BOOT_STEPS.forEach((text, i) => {
            const lineDelay    = i * this.STEP_DELAY;
            const resolveDelay = lineDelay + this.RESOLVE_DELAY;

            // Appear as "pending"
            setTimeout(() => {
                this.addEntry(text, 'pending');
            }, lineDelay);

            // Resolve to "ok"
            setTimeout(() => {
                this.resolveLastEntry();
            }, resolveDelay);
        });

        const totalTime = this.BOOT_STEPS.length * this.STEP_DELAY + this.RESOLVE_DELAY;
        setTimeout(() => {
            this.showIdentity = true;
            this.moduleStateService.setShowIdentity(true);
            this.cdr.markForCheck();
        }, totalTime + 200);
        setTimeout(() => {
            this.showReady    = true;
            this.moduleStateService.setShowReady(true);
            this.saveLogState();
            this.cdr.markForCheck();
        }, totalTime + 750);
    }

    private addEntry(text: string, status: BootEntry['status'], type: 'boot' | 'interaction' = 'boot'): void {
        const entry = type === 'boot'
            ? { id: this.bootEntryId++, text, status }
            : { id: this.interactionEntryId++, text, status };

        if (type === 'boot') {
            this.bootEntries.push(entry);
            this.trimBootEntries();
        } else {
            this.interactionEntries.push(entry);
            this.trimInteractionEntries();
        }

        this.cdr.markForCheck();
    }

    private resolveLastEntry(type: 'boot' | 'interaction' = 'boot'): void {
        const entries = type === 'boot' ? this.bootEntries : this.interactionEntries;
        const last = entries[entries.length - 1];
        if (last) { last.status = 'ok'; }
        this.cdr.markForCheck();
    }

    private trimBootEntries(): void {
        if (this.bootEntries.length > this.MAX_BOOT_ENTRIES) {
            this.bootEntries = this.bootEntries.slice(-this.MAX_BOOT_ENTRIES);
        }
    }

    private trimInteractionEntries(): void {
        if (this.interactionEntries.length > this.MAX_INTERACTION_ENTRIES) {
            this.interactionEntries = this.interactionEntries.slice(-this.MAX_INTERACTION_ENTRIES);
        }
    }

    // ── State management ────────────────────────────────────────────
    private saveLogState(): void {
        this.moduleStateService.setBootLogHistory([...this.bootEntries]);
        this.moduleStateService.setInteractionLogHistory([...this.interactionEntries]);
        this.moduleStateService.setShowIdentity(this.showIdentity);
        this.moduleStateService.setShowReady(this.showReady);
    }

    private restoreLogState(): void {
        this.bootEntries = [...this.moduleStateService.getBootLogHistory()];
        this.interactionEntries = [...this.moduleStateService.getInteractionLogHistory()];
        this.showIdentity = this.moduleStateService.getShowIdentity();
        this.showReady = this.moduleStateService.getShowReady();
        this.bootEntryId = Math.max(0, ...this.bootEntries.map(e => e.id), this.bootEntryId) + 1;
        this.interactionEntryId = Math.max(0, ...this.interactionEntries.map(e => e.id), this.interactionEntryId) + 1;
        this.cdr.markForCheck();
    }

    private subscribeToLogUpdates(): void {
        this.moduleStateService.bootLogHistory$
            .pipe(takeUntil(this.destroy$))
            .subscribe((entries) => {
                this.bootEntries = [...entries];
                this.cdr.markForCheck();
            });

        this.moduleStateService.interactionLogHistory$
            .pipe(takeUntil(this.destroy$))
            .subscribe((entries) => {
                this.interactionEntries = [...entries];
                this.cdr.markForCheck();
            });
    }

    // ── Navigation logs ─────────────────────────────────────────────
    private subscribeToNavigation(): void {
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            takeUntil(this.destroy$),
        ).subscribe((e: any) => {
            const module = this.moduleFromUrl(e.url);
            if (module) { this.addModuleLogs(module); }
        });
    }

    private moduleFromUrl(url: string): string | null {
        if (url.includes('home'))     return 'HOME';
        if (url.includes('projects')) return 'PROJECTS';
        if (url.includes('skills'))   return 'SKILLS';
        if (url.includes('about'))    return 'ABOUT';
        if (url.includes('contact'))  return 'CONTACT';
        return null;
    }

    private addModuleLogs(module: string): void {
        const steps = [
            `Accessing module: ${module}`,
            'Loading component data',
            'Rendering interface',
        ];
        // Reset ready on new nav
        this.showReady = false;
        this.cdr.markForCheck();

        steps.forEach((text, i) => {
            setTimeout(() => this.addEntry(text, 'pending', 'interaction'),           i * this.STEP_DELAY);
            setTimeout(() => this.resolveLastEntry('interaction'), i * this.STEP_DELAY + this.RESOLVE_DELAY);
        });

        const done = steps.length * this.STEP_DELAY + this.RESOLVE_DELAY;
        setTimeout(() => {
            this.showReady = true;
            this.saveLogState();
            this.cdr.markForCheck();
        }, done + 300);
    }

    onBack(): void {
        this.modalService.closeModal();
    }
}