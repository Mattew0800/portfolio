import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import {ModalService} from "../../services/modal.service";

export interface Skill {
    name:  string;
    icon:  string;   // Ruta de imagen, SVG path string o iniciales fallback
    type:  'svg' | 'text' | 'image';
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
    ],
    changeDetection: ChangeDetectionStrategy.Default
})
export class SkillsModalComponent {

    constructor(public modalService: ModalService, private cdr: ChangeDetectorRef) {
    }

    // ─── DATOS — reemplazá con tus skills reales ─────────────────────────────
    categories: SkillCategory[] = [
        {
            id: '01', codename: 'FRONTEND-CORE', label: '',
            isOpen: true,
            skills: [
                { name: 'Angular',     type: 'image', icon: 'assets/technologies-images/angular-icon.svg' },
                { name: 'TypeScript',  type: 'image', icon: 'assets/technologies-images/typescript-icon.svg' },
                { name: 'RxJS',        type: 'image', icon: 'assets/technologies-images/reactivex.svg' },
                { name: 'HTML5',       type: 'image', icon: 'assets/technologies-images/html-5.svg' },
                { name: 'SCSS / CSS',  type: 'image', icon: 'assets/technologies-images/sass.svg' },
                { name: 'Three.js',    type: 'image', icon: 'assets/technologies-images/threejs.svg' },
            ],
        },
        {
            id: '02', codename: 'BACKEND-CORE', label: '',
            isOpen: false,
            skills: [
                { name: 'Java',           type: 'image', icon: 'assets/technologies-images/java.svg' },
                { name: 'Spring Boot',    type: 'image', icon: 'assets/technologies-images/spring-icon.svg' },
                { name: 'Spring Security',type: 'image',  icon: 'assets/technologies-images/spring-security.svg' },
                { name: 'Spring Data JPA',type: 'text',  icon: 'JPA' },
                { name: 'Hibernate',      type: 'image', icon: 'assets/technologies-images/hibernate.svg' },
                { name: 'JWT',            type: 'image', icon: 'assets/technologies-images/jwt-icon.svg' },
                { name: 'Maven',          type: 'image',  icon: 'assets/technologies-images/maven.svg' },
            ],
        },

        {
            id: '03', codename: 'DATA-LAYER', label: '',
            isOpen: false,
            skills: [
                { name: 'SQL', type: 'image', icon: 'assets/technologies-images/sql.svg' },
                { name: 'MySQL',      type: 'image', icon: 'assets/technologies-images/mysql-icon.svg' },
                { name: 'SQlite',    type: 'image', icon: 'assets/technologies-images/sqlite.svg' },
            ],
        },
        {
            id: '04', codename: 'DEVOPS-TOOLS', label: '',
            isOpen: false,
            skills: [
                { name: 'Git',         type: 'image', icon: 'assets/technologies-images/git.svg' },
                { name: 'GitHub',      type: 'image',  icon: 'assets/technologies-images/github-icon.svg' },
                { name: 'Postman',     type: 'image', icon: 'assets/technologies-images/postman-icon.svg' },
            ],
        },
        {
            id: '05', codename: 'ARCHITECTURE', label: '',
            isOpen: false,
            skills: [
                { name: 'MVC Pattern',       type: 'text', icon: 'MVC' },
                { name: 'Clean Architecture',type: 'text', icon: 'CA' },
                { name: 'SOLID Principles',  type: 'text', icon: 'SOLID' },
                { name: 'Design Patterns',   type: 'text', icon: 'DP' },
            ],
        },
    ];
    // ─────────────────────────────────────────────────────────────────────────

    toggle(cat: SkillCategory): void {
        cat.isOpen = !cat.isOpen;
        this.cdr.markForCheck();
    }

    get totalSkills(): number {
        return this.categories.reduce((acc, c) => acc + c.skills.length, 0);
    }

    expandAll(): void   {
        this.categories.forEach(c => c.isOpen = true);
        this.cdr.markForCheck();
    }

    collapseAll(): void {
        this.categories.forEach(c => c.isOpen = false);
        this.cdr.markForCheck();
    }

    onBack(): void {
        this.modalService.closeModal();
    }
}

