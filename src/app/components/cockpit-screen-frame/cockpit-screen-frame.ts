// cockpit-screen-frame.component.ts
import {
    Component,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cockpit-screen-frame',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cockpit-screen-frame.html',
    styleUrls: ['./cockpit-screen-frame.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CockpitScreenFrameComponent implements OnInit, OnDestroy {

    /** Emite cuando el usuario presiona RETURN */
    @Output() back = new EventEmitter<void>();

    /** Controla la animación de encendido */
    poweredOn = false;

    /** Hora del sistema en el status bar */
    currentTime = '';

    /** Segmentos del VU meter decorativo */
    readonly vuSegments = Array.from({ length: 10 });

    private clockInterval: ReturnType<typeof setInterval> | null = null;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        // Pequeño delay para que el DOM esté listo antes de disparar la animación
        requestAnimationFrame(() => {
            this.poweredOn = true;
            this.cdr.markForCheck();
        });

        this.updateClock();
        this.clockInterval = setInterval(() => {
            this.updateClock();
            this.cdr.markForCheck();
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.clockInterval !== null) {
            clearInterval(this.clockInterval);
        }
    }

    onBack(): void {
        this.back.emit();
    }

    private updateClock(): void {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        this.currentTime =
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
}