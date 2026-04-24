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
    status:      'ONLINE' | 'ACTIVE' | 'ARCHIVED';
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
            codename: 'NEXUS-SHOP',
            title: 'NexusShop',
            status: 'ONLINE',
            role: 'Fullstack Developer',
            date: '2024',
            description: 'Plataforma de e-commerce completa con gestión de inventario, pagos y panel admin.',
            longDesc: 'Aplicación fullstack con carrito de compras, integración con pasarela de pagos, dashboard de administración, gestión de stock en tiempo real y sistema de roles (admin/cliente). Arquitectura REST con autenticación JWT.',
            stack: ['Angular', 'Spring Boot', 'PostgreSQL', 'JWT', 'Docker'],
            image: 'assets/projects/nexusshop.png',
            github: 'https://github.com/tu-usuario/nexusshop',
            demo: 'https://nexusshop.demo.com',
        },
        {
            id: '02',
            codename: 'ORBITCHAT',
            title: 'OrbitChat',
            status: 'ONLINE',
            role: 'Backend Developer',
            date: '2024',
            description: 'Aplicación de mensajería en tiempo real con salas, notificaciones y cifrado.',
            longDesc: 'Sistema de chat con comunicación bidireccional via WebSocket, salas públicas y privadas, notificaciones push, historial de mensajes persistido en base de datos, y cifrado de extremo a extremo en mensajes directos.',
            stack: ['Angular', 'Spring Boot', 'WebSocket', 'MongoDB', 'TypeScript'],
            image: 'assets/projects/orbitchat.png',
            github: 'https://github.com/tu-usuario/orbitchat',
            demo: null,
        },
        {
            id: '03',
            codename: 'TASKFORGE',
            title: 'TaskForge',
            status: 'ACTIVE',
            role: 'Fullstack Developer',
            date: '2023',
            description: 'Gestor de proyectos estilo Kanban con colaboración en tiempo real y métricas.',
            longDesc: 'Herramienta de gestión de tareas con tableros Kanban drag-and-drop, asignación de usuarios, fechas límite, etiquetas personalizadas, reportes de productividad y actualización en tiempo real entre colaboradores.',
            stack: ['Angular', 'Spring Boot', 'MySQL', 'RxJS', 'Chart.js'],
            image: 'assets/projects/taskforge.png',
            github: 'https://github.com/tu-usuario/taskforge',
            demo: 'https://taskforge.demo.com',
        },
        {
            id: '04',
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
        return { ONLINE: '● ONLINE', ACTIVE: '● ACTIVE', ARCHIVED: '○ ARCHIVED' }[s];
    }

    openLink(url: string): void {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}