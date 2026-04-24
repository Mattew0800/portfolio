import {Component, OnInit, OnDestroy} from '@angular/core';
import {ModuleStateService} from "../../services/module-state.service";
import {Router, NavigationEnd} from "@angular/router";
import {CommonModule} from "@angular/common";
import {filter, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'app-log-screen',
    imports: [CommonModule, CockpitScreenFrameComponent],
  templateUrl: './log-screen.html',
  styleUrl: './log-screen.scss',
})
export class LogScreen implements OnInit, OnDestroy {
    logs: string[] = [];
    private readonly MAX_LOGS = 12;
    private readonly LOG_DELAY = 100;
    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private moduleStateService: ModuleStateService,
        public modalService: ModalService
    ) {}

    ngOnInit(): void {
        this.bootSequence();
        this.subscribeToNavigationEvents();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private bootSequence(): void {
        const bootLogs = [
            '> BOOT_SEQUENCE_INIT',
            '> Verificando sistemas centrales.............OK',
            '> Inicializando interfaz de navegación.......OK',
            '> Cargando módulos...........................OK',
            '> Estableciendo interfaz.....................OK',
            '',
            '> USUARIO: MATI',
            '> ROL: FRONTEND DEVELOPER',
            '> STACK: ANGULAR / TYPESCRIPT / CSS',
            '> ESTADO: LISTO',
            '',
            '> ESPERANDO INPUT...'
        ];

        this.addLogsWithDelay(bootLogs);
    }

    private subscribeToNavigationEvents(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                const module = this.getModuleFromUrl(event.url);
                if (module) {
                    this.addModuleAccessLogs(module);
                }
            });
    }

    private getModuleFromUrl(url: string): string | null {
        if (url.includes('home')) return 'HOME';
        if (url.includes('projects')) return 'PROJECTS';
        if (url.includes('skills')) return 'SKILLS';
        if (url.includes('about')) return 'ABOUT';
        if (url.includes('contact')) return 'CONTACT';
        return null;
    }

    private addModuleAccessLogs(module: string): void {
        const moduleLogs = [
            `> ACCESO CONCEDIDO: ${module}`,
            `> Cargando datos...`,
            `> Construyendo componentes UI...`,
            `> Inyectando recursos...`,
            '',
            `> MÓDULO LISTO`
        ];

        this.addLogsWithDelay(moduleLogs);
    }

    private addLogsWithDelay(newLogs: string[]): void {
        newLogs.forEach((log, index) => {
            setTimeout(() => {
                this.logs.push(log);
                if (this.logs.length > this.MAX_LOGS) {
                    this.logs.shift();
                }
            }, index * this.LOG_DELAY);
        });
    }

    onBack(): void {
        this.modalService.closeModal();
    }
}

