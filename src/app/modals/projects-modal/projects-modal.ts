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
    images:      string[];
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
            images: ['assets/projects/nomadia/landing.png','assets/projects/nomadia/login.png','assets/projects/nomadia/register.png','assets/projects/nomadia/viajes.png','assets/projects/nomadia/home_page.png','assets/projects/nomadia/gastos.png','assets/projects/nomadia/nuevo_gasto.png','assets/projects/nomadia/balance.png'],
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
            images: ['assets/projects/aztk/onboarding.png','assets/projects/aztk/landing.png','assets/projects/aztk/login.png','assets/projects/aztk/password.png','assets/projects/aztk/register.png','assets/projects/aztk/home.png','assets/projects/aztk/reservar.png','assets/projects/aztk/detalle-reserva.png','assets/projects/aztk/hoyjugas.png'],
            github: 'https://github.com/Mattew0800/hoyjugas',
            demo: null,
        },
        {
            id: '03',
            codename: 'Caprish',
            title: 'Complex Team',
            status: 'COMPLETED',
            role: 'Backend Developer',
            date: '2025',
            description: 'Desarrollo de plataforma de comercio electrónico',
            longDesc: 'Desarrollo de API de comercio electrónico utilizando Java y Spring Boot, con funcionalidades completas de gestión de productos, carritos de compra, control de stock y autenticación segura con JWT. El proyecto incluye arquitectura REST, integración con Gmail API, manejo de roles de usuario y documentación de API con OpenAPI/Swagger.',
            stack: ['Java', 'Spring Boot (REST)', 'MySQL', 'JWT', 'OpenAPI/Swagger'],
            images: ['assets/projects/caprish/caprish.png'],
            github: 'https://github.com/Mattew0800/Caprish',
            demo: null,
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
            images: ['assets/projects/tvbox/login.png', 'assets/projects/tvbox/register.png','assets/projects/tvbox/fullscreen_modal.png','assets/projects/tvbox/grilla_modal.png','assets/projects/tvbox/grilla_6.png','assets/projects/tvbox/grilla_9.png','assets/projects/tvbox/grilla_4.png','assets/projects/tvbox/grilla_1.png'],
            github: 'https://github.com/Mattew0800/tvbox',
            demo: null,
        },
        {
            id: '05',
            codename: 'PORTFOLIO-3D',
            title: 'Portfolio 3D',
            status: 'ONLINE',
            role: 'Frontend Developer',
            date: '2025',
            description: 'Portfolio interactivo immersivo con experiencia 3D de cockpit espacial navegable y pantallas dinámicas.',
            longDesc: 'Portfolio personal inmersivo construido con Angular, Three.js y WebGL. Implementa una escena 3D interactiva de un cockpit espacial completamente funcional con múltiples pantallas dinámicas que muestran contenido renderizado en tiempo real. Características avanzadas incluyen: paneles interactivos que renderizan componentes Angular como texturas (html2canvas), carga asincrónica de modelos GLTF/GLB, renderizado dinámico de video en texturas, animaciones de transición smooth, sistema de logs integrado y navegación contextual. La arquitectura utiliza inyección de dependencias de Angular, gestión de estados reactiva con RxJS, y patrones avanzados de WebGL para optimizar el renderizado en tiempo real. Cada pantalla es clickeable y navega a diferentes secciones del portfolio (proyectos, habilidades, experiencia, contacto) manteniendo una experiencia inmersiva y moderna.',
            stack: ['Angular', 'Three.js', 'WebGL', 'TypeScript', 'SCSS', 'GLTF/GLB', 'html2canvas', 'RxJS', 'Vectary'],
            images: ['assets/projects/portfolio/cockpit.png','assets/projects/portfolio/cockpit-2.png','assets/projects/portfolio/module-ship.png','assets/projects/portfolio/log-screen.png','assets/projects/portfolio/log-screen-2.png'],
            github: 'https://github.com/mattew0800/portfolio',
            demo: null,
        },
        {
            id: '06',
            codename: 'ZMAIL-MANAGER',
            title: 'Academic Project',
            status: 'COMPLETED',
            role: 'Backend Developer',
            date: '2024',
            description: 'Desarrollo de una aplicación en Java para la gestión de correos electrónicos',
            longDesc: 'Desarrollo de una aplicación en Java para la gestión de correos electrónicos, con modelado de entidades, manejo de\n' +
                'colecciones y lógica de negocio orientada a la administración de mensajes. Proyecto estructurado en múltiples clases,\n' +
                'aplicando programación orientada a objetos y buenas prácticas de organización del código.\n',
            stack: ['Java (POO)', 'Colecciones', 'JSON', 'Persistencia en archivos', 'Excepciones'],
            images: ['assets/projects/zmail/zmail.png'],
            github: 'https://github.com/Mattew0800/ZMAIL-MANAGER',
            demo: null,
        },
    ];

    selectedProject: Project | null = null;
    isDetailOpen    = false;
    isClosing       = false;
    hoveredId: string | null = null;

    // Propiedades para el visor de imágenes
    isImageViewerOpen = false;
    currentImageIndex = 0;
    isImageViewerClosing = false;

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

    openImageViewer(index: number = 0): void {
        this.currentImageIndex = index;
        this.isImageViewerOpen = true;
        this.isImageViewerClosing = false;
        // Agregar clase al documento para ocultar scanlines
        document.body.classList.add('image-viewer-active');
    }

    closeImageViewer(): void {
        this.isImageViewerClosing = true;
        setTimeout(() => {
            this.isImageViewerOpen = false;
            this.isImageViewerClosing = false;
            // Remover clase del documento
            document.body.classList.remove('image-viewer-active');
        }, 300);
    }

    selectThumbnail(index: number): void {
        if (this.selectedProject) {
            this.currentImageIndex = index;
        }
    }

    nextImage(): void {
        if (this.selectedProject) {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProject.images.length;
        }
    }

    prevImage(): void {
        if (this.selectedProject) {
            this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedProject.images.length) % this.selectedProject.images.length;
        }
    }

    @HostListener('document:keydown.escape')
    onEsc(): void {
        if (this.isImageViewerOpen) {
            this.closeImageViewer();
        } else if (this.isDetailOpen) {
            this.closeDetail();
        }
    }

    @HostListener('document:keydown.arrowright')
    onArrowRight(): void {
        if (this.isImageViewerOpen) this.nextImage();
    }

    @HostListener('document:keydown.arrowleft')
    onArrowLeft(): void {
        if (this.isImageViewerOpen) this.prevImage();
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