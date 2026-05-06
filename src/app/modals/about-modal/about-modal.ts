import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChild,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';

import { UpperCasePipe } from '@angular/common';
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import { ModalService } from "../../services/modal.service";

export interface DataField {
    key:   string;
    value: string;
    highlight?: boolean;
}

export interface TimelineEntry {
    year:  string;
    title: string;
    place: string;
    type:  'edu' | 'exp';
}

@Component({
    selector: 'app-about-modal',
    standalone: true,
    templateUrl: './about-modal.html',
    styleUrls: ['./about-modal.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [UpperCasePipe, CockpitScreenFrameComponent]
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {

    readonly NAME      = 'MATIAS OYHAMBURU';
    readonly ROLE      = 'Fullstack Developer';
    readonly PHOTO_URL = 'assets/about/photo.jpg';
    readonly CV_URL    = 'assets/cv/matias-oyhamburu-cv.pdf';
    readonly CV_NAME   = 'matias-oyhamburu-cv.pdf';

    readonly BIO = `Soy un desarrollador Fullstack Junior con sólidas bases en
Java y Spring Boot en el backend, y Angular en el frontend.
Me apasiona construir soluciones robustas, escalables y con
una experiencia de usuario memorable. Siempre buscando
aprender nuevas tecnologías y resolver problemas reales.`;

    readonly dataFields: DataField[] = [
        { key: 'NOMBRE',      value: 'MATIAS OYHAMBURU'      },
        { key: 'ROL',         value: 'FULLSTACK DEVELOPER',   highlight: true },
        { key: 'UBICACIÓN',   value: 'ARGENTINA'              },
        { key: 'IDIOMAS',     value: 'ESPAÑOL / INGLÉS'       },
        { key: 'STACK',       value: 'SPRING BOOT · ANGULAR', highlight: true },
        { key: 'ESTADO',      value: '● DISPONIBLE',          highlight: true },
    ];

    readonly timeline: TimelineEntry[] = [
        { year: '2025', title: 'Desarrollador Fullstack Junior', place: 'Freelance / Proyectos personales', type: 'exp' },
        { year: '2024', title: 'Técnico en Programación',        place: 'Universidad Tecnológica Nacional', type: 'edu' },
        { year: '2023', title: 'Desarrollo Web Fullstack',       place: 'Coderhouse',                      type: 'edu' },
        { year: '2022', title: 'Java + Spring Boot',             place: 'Autodidacta / Udemy',             type: 'edu' },
    ];

    @ViewChild('photoCanvas', { static: false })
    photoCanvasRef?: ElementRef<HTMLCanvasElement>;

    scanProgress = 0;
    isScanDone   = false;
    private scanInterval: ReturnType<typeof setInterval> | null = null;

    constructor(private cdr: ChangeDetectorRef, private modalService: ModalService) {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        setTimeout(() => this.startScan(), 600);
    }

    ngOnDestroy(): void {
        if (this.scanInterval) clearInterval(this.scanInterval);
    }

    private startScan(): void {
        this.scanProgress = 0;
        this.scanInterval = setInterval(() => {
            this.scanProgress += Math.random() * 8 + 3;
            if (this.scanProgress >= 100) {
                this.scanProgress = 100;
                this.isScanDone   = true;
                clearInterval(this.scanInterval!);
            }
            this.cdr.markForCheck(); // necesario con OnPush
        }, 60);
    }

    get scanWidth(): string {
        return `${Math.min(this.scanProgress, 100).toFixed(1)}%`;
    }

    onBack(): void {
        this.modalService.closeModal();
    }

    downloadCV(): void {
        // Registrar acción en el log
        this.modalService.logDownloadAction(this.CV_NAME);

        const a = document.createElement('a');
        a.href     = this.CV_URL;
        a.download = this.CV_NAME;
        a.click();
    }

    openLink(url: string): void {
        // Registrar acción en el log
        let linkType = 'EXTERNAL LINK';
        if (url.includes('github')) linkType = 'GitHub';
        else if (url.includes('linkedin')) linkType = 'LinkedIn';

        this.modalService.logInteractionAction(`Opening: ${linkType}`);

        window.open(url, '_blank', 'noopener,noreferrer');
    }
}