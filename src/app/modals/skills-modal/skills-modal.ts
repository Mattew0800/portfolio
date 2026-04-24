import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import {ModalService} from "../../services/modal.service";

export interface Skill {
    name:  string;
    icon:  string;   // SVG path string o iniciales fallback
    type:  'svg' | 'text';
}

export interface SkillCategory {
    id:       string;
    codename: string;
    label:    string;
    isOpen:   boolean;
    skills:   Skill[];
}

@Component({
    selector: 'app-skills-modal',
    standalone: true,
    templateUrl: './skills-modal.html',
    styleUrls: ['./skills-modal.scss'],
    animations: [
        trigger('collapse', [
            state('open', style({height: '*', opacity: 1, marginTop: '0'})),
            state('closed', style({height: '0px', opacity: 0, marginTop: '0'})),
            transition('open <=> closed', animate('350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')),
        ]),
    ],
    imports: [
        CockpitScreenFrameComponent
    ]
})
export class SkillsModalComponent {

    constructor(public modalService: ModalService) {
    }

    // ─── DATOS — reemplazá con tus skills reales ─────────────────────────────
    categories: SkillCategory[] = [
        {
            id: '01', codename: 'BACKEND-CORE', label: 'Backend',
            isOpen: true,
            skills: [
                { name: 'Java',           type: 'text', icon: 'JV' },
                { name: 'Spring Boot',    type: 'svg',  icon: springBootPath() },
                { name: 'Spring Security',type: 'text', icon: 'SS' },
                { name: 'Spring Data JPA',type: 'text', icon: 'JP' },
                { name: 'Hibernate',      type: 'text', icon: 'HB' },
                { name: 'REST APIs',      type: 'text', icon: 'RE' },
                { name: 'JWT',            type: 'text', icon: 'JW' },
                { name: 'Maven',          type: 'text', icon: 'MV' },
            ],
        },
        {
            id: '02', codename: 'FRONTEND-CORE', label: 'Frontend',
            isOpen: true,
            skills: [
                { name: 'Angular',     type: 'svg',  icon: angularPath() },
                { name: 'TypeScript',  type: 'text', icon: 'TS' },
                { name: 'RxJS',        type: 'text', icon: 'RX' },
                { name: 'HTML5',       type: 'text', icon: 'HT' },
                { name: 'SCSS / CSS',  type: 'text', icon: 'SC' },
                { name: 'Three.js',    type: 'text', icon: '3J' },
            ],
        },
        {
            id: '03', codename: 'DATA-LAYER', label: 'Databases',
            isOpen: false,
            skills: [
                { name: 'PostgreSQL', type: 'text', icon: 'PG' },
                { name: 'MySQL',      type: 'text', icon: 'MY' },
                { name: 'MongoDB',    type: 'text', icon: 'MG' },
            ],
        },
        {
            id: '04', codename: 'DEVOPS-TOOLS', label: 'DevOps & Tools',
            isOpen: false,
            skills: [
                { name: 'Git',         type: 'svg',  icon: gitPath() },
                { name: 'GitHub',      type: 'text', icon: 'GH' },
                { name: 'Docker',      type: 'text', icon: 'DK' },
                { name: 'Postman',     type: 'text', icon: 'PM' },
                { name: 'IntelliJ',   type: 'text', icon: 'IJ' },
                { name: 'VS Code',     type: 'text', icon: 'VS' },
            ],
        },
        {
            id: '05', codename: 'ARCHITECTURE', label: 'Architecture',
            isOpen: false,
            skills: [
                { name: 'MVC Pattern',      type: 'text', icon: 'MV' },
                { name: 'Clean Architecture',type: 'text', icon: 'CA' },
                { name: 'Microservices',     type: 'text', icon: 'MS' },
                { name: 'SOLID Principles',  type: 'text', icon: 'SO' },
                { name: 'Design Patterns',   type: 'text', icon: 'DP' },
            ],
        },
    ];
    // ─────────────────────────────────────────────────────────────────────────

    toggle(cat: SkillCategory): void {
        cat.isOpen = !cat.isOpen;
    }

    get totalSkills(): number {
        return this.categories.reduce((acc, c) => acc + c.skills.length, 0);
    }

    get openCount(): number {
        return this.categories.filter(c => c.isOpen).length;
    }

    expandAll(): void   { this.categories.forEach(c => c.isOpen = true);  }
    collapseAll(): void { this.categories.forEach(c => c.isOpen = false); }

    onBack(): void {
        this.modalService.closeModal();
    }
}

// ─── SVG PATHS (inline, sin dependencias externas) ───────────────────────────

function springBootPath(): string {
    return 'M20.205 16.392c-2.469 3.289-7.758 2.692-11.018 2.692l-1.55 3.69c3.764.494 10.705.257 13.76-3.4a7.006 7.006 0 0 0-1.192-2.982zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.984-9.052c-1.274-.657-2.759-.926-3.63-1.81-.372-.41-.435-1.168.255-1.488.84-.38 2.143-.047 3.07.248l.438-1.835c-1.138-.418-2.33-.508-3.497-.247-2.47.55-2.975 2.592-2.226 3.988.806 1.492 2.65 1.82 3.908 2.39.586.264.896.835.553 1.411-.41.693-1.52.89-2.556.739-.788-.116-1.576-.4-2.32-.737l-.44 1.876c.757.337 1.688.601 2.67.67 1.847.136 4.057-.328 4.682-2.17.493-1.47-.152-2.427-1.907-3.035z';
}

function angularPath(): string {
    return 'M9.93 12.645h4.134L11.996 7.74zM11.996 2L2 6.285l1.498 12.927 8.498 4.788 8.503-4.788L22 6.285zm4.693 15.69l-1.381-3.456H10.685l-1.381 3.456-2.37-1.072 4.718-11.4h.704l4.718 11.4z';
}

function gitPath(): string {
    return 'M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 1 1-1.102 1.71 1.836 1.836 0 0 1 .048-.426L12.84 9.198v6.044 a1.835 1.835 0 1 1-1.51-.18V9.15a1.835 1.835 0 0 1-.987-2.41L7.585 4.005 .45 11.147a1.55 1.55 0 0 0 0 2.188l10.48 10.478a1.55 1.55 0 0 0 2.188 0l10.428-10.43a1.55 1.55 0 0 0 0-2.453z';
}
