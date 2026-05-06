import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CockpitScreenFrameComponent } from '../../components/cockpit-screen-frame/cockpit-screen-frame';
import { ModalService } from '../../services/modal.service';
import { ModuleStateService } from '../../services/module-state.service';

interface BootEntry {
    id:      number;
    text:    string;
    status:  'pending' | 'ok' | null;
}

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

    visibleEntries: BootEntry[] = [];
    showIdentity = false;
    showReady    = false;

    private entryId  = 0;
    private destroy$ = new Subject<void>();

    constructor(
        private cdr: ChangeDetectorRef,
        private router: Router,
        private moduleStateService: ModuleStateService,
        public modalService: ModalService,
    ) {}

    ngOnInit(): void {
        this.runBootSequence();
        this.subscribeToNavigation();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
        setTimeout(() => { this.showIdentity = true; this.cdr.markForCheck(); }, totalTime + 200);
        setTimeout(() => { this.showReady    = true; this.cdr.markForCheck(); }, totalTime + 750);
    }

    private addEntry(text: string, status: BootEntry['status']): void {
        this.visibleEntries.push({ id: this.entryId++, text, status });
        this.cdr.markForCheck();
    }

    private resolveLastEntry(): void {
        const last = this.visibleEntries[this.visibleEntries.length - 1];
        if (last) { last.status = 'ok'; }
        this.cdr.markForCheck();
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
        // Reset identity on new nav
        this.showReady = false;
        this.cdr.markForCheck();

        steps.forEach((text, i) => {
            setTimeout(() => this.addEntry(text, 'pending'),           i * this.STEP_DELAY);
            setTimeout(() => this.resolveLastEntry(), i * this.STEP_DELAY + this.RESOLVE_DELAY);
        });

        const done = steps.length * this.STEP_DELAY + this.RESOLVE_DELAY;
        setTimeout(() => { this.showReady = true; this.cdr.markForCheck(); }, done + 300);
    }

    onBack(): void {
        this.modalService.closeModal();
    }
}