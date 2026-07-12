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
    readonly ROLE      = 'DISPONIBLE';
    readonly PHOTO_URL = 'assets/about/photo.jpeg';
    private readonly CV_URL = 'https://drive.google.com/uc?export=download&id=17uvZf02etTM55g3sbO6fAbamXOH_JGxW';
    private readonly CV_NAME = 'Matias_Oyhamburu_CV.pdf';

    readonly BIO = `Soy Desarrollador Full Stack Junior egresado de la Tecnicatura Universitaria en Programación (UTN), con experiencia y especial interés en el desarrollo frontend utilizando Angular, TypeScript, RxJS y SCSS para construir aplicaciones web modernas, escalables y mantenibles, con foco en la experiencia de usuario y la calidad técnica.

    Cuento con formación en desarrollo backend utilizando Java y Spring Boot para la construcción de APIs REST, lógica de negocio y persistencia de datos. Además, poseo una sólida formación en bases de datos y arquitectura de software.
    
    Trabajo bajo metodologías ágiles como Scrum y utilizo herramientas como Git para control de versiones y trabajo colaborativo.
    
    Busco incorporarme a un equipo IT donde pueda aplicar mis conocimientos, continuar desarrollándome profesionalmente y participar en proyectos de impacto real.`;

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
        this.modalService.logDownloadAction(this.CV_NAME);

        const a = document.createElement('a');
        a.href = this.CV_URL;
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