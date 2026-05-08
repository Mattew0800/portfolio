// Sin cambios en lógica — solo se agrega el handler de teclado en el template (keydown.enter).
// El resto del componente permanece idéntico.
import {
    Component,
    OnInit,
    OnDestroy,
    HostListener,
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import {ModalService} from "../../services/modal.service";

export interface Project {
    id:          string;
    codename:    string;
    title:       string;
    status:      string;
    role:        string;
    date:        string;
    description: string;
    longDesc:    string;
    stack:       string[];
    image:       string;
    github:      string | null;
    demo:        string | null;
}

@Component({
    selector: 'app-projects',
    templateUrl: './projects-modal.html',
    styleUrls: ['./projects-modal.scss'],
    imports: [LowerCasePipe, CockpitScreenFrameComponent],
})
export class ProjectsComponent implements OnInit, OnDestroy {

    constructor(public modalService: ModalService) {
    }

    readonly projects: Project[] = [
        {
            id: '01',
            codename: 'Nomadia',
            title: '',
            status: 'ONLINE',
            role: 'Frontend Developer',
            date: '2025-2026',
            description: 'Desarrollo frontend de aplicación web para planificación colaborativa de viajes.',
            longDesc: 'Implementación de flujos de autenticación y guards de navegación, formularios reactivos con validaciones personalizadas\n' +
                'y gestión de estados. Comunicación con API REST mediante servicios e interceptores HTTP. Funcionalidades de CRUD para viajes, actividades y gastos compartidos, gestión de usuarios colaboradores y carga de\n' +
                'imágenes a la nube.\n Arquitectura basada en componentes reutilizables, programación reactiva y separación de responsabilidades.',
            stack: ['Angular', 'TypeScript', 'HTML', 'SCSS', 'RxJS'],
            image: 'assets/projects/nexusshop.png',
            github: 'https://github.com/Mattew0800/Nomadia',
            demo: 'https://nomadia-viajes.vercel.app/',
        },
        {
            id: '02',
            codename: 'AZTK ARENA SYSTEM',
            title: 'HoyJugas',
            status: 'IN DEVELOPMENT',
            role: 'Frontend Developer',
            date: '2026',
            description: 'AGREGAR DESCRIPCION',
            longDesc: 'AGREGAR DESCRIPCION',

            stack: ['Angular', 'TypeScript', 'HTML', 'SCSS', 'RxJS'],
            image: 'assets/projects/orbitchat.png',
            github: 'https://github.com/Mattew0800/hoyjugas',
            demo: null,
        },
        {
            id: '03',
            codename: 'Caprish',
            title: 'Complex Team',
            status: 'OFFLINE',
            role: 'Backend Developer',
            date: '2025',
            description: 'Desarrollo de plataforma de comercio electrónico',
            longDesc: 'Desarrollo de una plataforma de comercio electrónico utilizando Java y Spring Boot, con funcionalidades completas de gestión de productos, carritos de compra, control de stock y autenticación segura con JWT. El proyecto incluye arquitectura REST, integración con Gmail API, manejo de roles de usuario y documentación de API con OpenAPI/Swagger.',
            stack: ['Java', 'Spring Boot (REST)', 'MySQL', 'JWT', 'OpenAPI/Swagger'],
            image: 'assets/projects/taskforge.png',
            github: 'https://github.com/tu-usuario/taskforge',
            demo: 'https://taskforge.demo.com',
        },
        {
            id: '04',
            codename: 'TVBOX',
            title: 'v2',
            status: 'COMPLETED',
            role: 'Fullstack Developer',
            date: '2025',
            description: 'Plataforma multi-view para monitoreo simultáneo de canales de noticias en vivo.',
            longDesc: 'Aplicación desarrollada para un grupo de economistas que necesitaban seguir la cobertura de elecciones argentinas en tiempo real desde múltiples medios simultáneamente. La plataforma permite visualizar hasta 9 transmisiones en vivo en una grilla dinámica configurable, con controles independientes por canal. Incluye autenticación de usuarios con Django, panel administrativo para gestión de canales y conversión automática de enlaces de YouTube a formatos embebibles compatibles.',
            stack: ['Angular (RxJS)', 'TypeScript', 'HTML', 'SCSS', 'FastAPI (Python)'],
            image: 'assets/projects/portfolio3d.png',
            github: 'https://github.com/Mattew0800/tvbox',
            demo: null,
        },
        {
            id: '05',
            codename: 'PORTFOLIO-3D',
            title: 'Portfolio 3D',
            status: 'ACTIVE',
            role: 'Frontend Developer',
            date: '2025',
            description: 'Este mismo portfolio — escena 3D interactiva de una nave espacial con Three.js.',
            longDesc: 'Portfolio personal construido con Angular y Three.js. Incluye escena 3D de cockpit espacial navegable, sistema de cámaras, pantallas interactivas con navegación, animaciones de transición warp speed y renderizado de nebulosas procedurales.',
            stack: ['Angular', 'Three.js', 'SCSS', 'TypeScript', 'WebGL'],
            image: 'assets/projects/portfolio3d.png',
            github: 'https://github.com/tu-usuario/portfolio-3d',
            demo: null,
        },
    ];

    selectedProject: Project | null = null;
    isDetailOpen    = false;
    isClosing       = false;
    hoveredId: string | null = null;

    ngOnInit(): void {}
    ngOnDestroy(): void {}

    openDetail(project: Project): void {
        this.selectedProject = project;
        this.isDetailOpen    = true;
        this.isClosing       = false;
    }

    closeDetail(): void {
        this.isClosing = true;
        setTimeout(() => {
            this.isDetailOpen    = false;
            this.isClosing       = false;
            this.selectedProject = null;
        }, 380);
    }

    onBack(): void {
        this.modalService.closeModal();
    }

    @HostListener('document:keydown.escape')
    onEsc(): void {
        if (this.isDetailOpen) this.closeDetail();
    }

    statusLabel(s: Project['status']): string {
        const labels: { [key: string]: string } = {
            ONLINE: '● ONLINE',
            ACTIVE: '● ACTIVE',
            ARCHIVED: '○ ARCHIVED',
            'IN DEVELOPMENT': '◐ IN DEVELOPMENT',
            OFFLINE: '○ OFFLINE',
            COMPLETED: '✓ COMPLETED'
        };
        return labels[s] || s;
    }

    openLink(url: string): void {
        // Registrar acción en el log
        let linkType = 'PROJECT LINK';
        if (url.includes('github')) linkType = 'Source Code (GitHub)';
        else if (url.includes('demo')) linkType = 'Live Demo';

        this.modalService.logInteractionAction(`Viewing: ${linkType}`);

        window.open(url, '_blank', 'noopener,noreferrer');
    }
}