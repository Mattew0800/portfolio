import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

interface Star {
    x: number;
    y: number;
    r: number;
    twinkleOffset: number;
    twinkleSpeed: number;
    color: { r: number; g: number; b: number };
}

interface NebulaCloud {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    driftAngle: number;
    driftSpeed: number;
    color: { r: number; g: number; b: number };
}

interface WarpStar {
    x: number;
    y: number;
    angle: number;
    dist: number;
}

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrls: ['./home-page.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

    // ─── CONFIG — editá estos valores ────────────────────────────────────────
    readonly FULL_NAME    = 'MATIAS OYHAMBURU';
    readonly JOB_TITLE    = 'Fullstack Developer';
    readonly TECH_STACK   = 'Spring Boot · Angular · TypeScript';
    readonly GITHUB_URL   = 'https://github.com/tu-usuario';
    readonly LINKEDIN_URL = 'https://linkedin.com/in/tu-usuario';
    readonly COCKPIT_ROUTE = '/cockpit';          // ruta destino (raíz - CockpitViewerComponent)
    readonly TYPEWRITER_DELAY_MS  = 600;          // pausa antes de empezar a tipear
    readonly TYPEWRITER_SPEED_MS  = 90;           // ms por carácter
    readonly WARP_DURATION_MS     = 2800;         // duración animación warp (aumentada)
    readonly WARP_STARS_COUNT     = 800;          // cantidad de estrellas en el warp (aumentada)
    // ─────────────────────────────────────────────────────────────────────────

    @ViewChild('bgCanvas',   { static: true }) bgCanvasRef!:   ElementRef<HTMLCanvasElement>;
    @ViewChild('warpCanvas', { static: true }) warpCanvasRef!: ElementRef<HTMLCanvasElement>;

    displayedName  = '';
    showCursor     = false;
    isWarping      = false;
    typewriterComplete = false;
    systemTime     = '';

    private bgCtx!:   CanvasRenderingContext2D;
    private warpCtx!: CanvasRenderingContext2D;
    private W = 0;
    private H = 0;

    private stars:   Star[]        = [];
    private nebulas: NebulaCloud[] = [];
    private warpStars: WarpStar[]  = [];

    private animFrameId = 0;
    private warpFrameId = 0;
    private clockInterval: ReturnType<typeof setInterval> | null = null;

    private tick = 0;

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.startClock();
    }

    ngAfterViewInit(): void {
        this.initCanvas();
        this.spawnParticles();
        this.renderLoop();
        this.startTypewriter();
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animFrameId);
        cancelAnimationFrame(this.warpFrameId);
        if (this.clockInterval) clearInterval(this.clockInterval);
    }

    // ─── CANVAS SETUP ────────────────────────────────────────────────────────

    private initCanvas(): void {
        const bg   = this.bgCanvasRef.nativeElement;
        const warp = this.warpCanvasRef.nativeElement;

        this.bgCtx   = bg.getContext('2d')!;
        this.warpCtx = warp.getContext('2d')!;

        this.resizeCanvases();

        const ro = new ResizeObserver(() => {
            this.resizeCanvases();
            this.spawnParticles();
        });
        ro.observe(bg.parentElement!);
    }

    private resizeCanvases(): void {
        const wrap = this.bgCanvasRef.nativeElement.parentElement!;
        this.W = wrap.offsetWidth;
        this.H = wrap.offsetHeight;

        this.bgCanvasRef.nativeElement.width    = this.W;
        this.bgCanvasRef.nativeElement.height   = this.H;
        this.warpCanvasRef.nativeElement.width  = this.W;
        this.warpCanvasRef.nativeElement.height = this.H;
    }

    // ─── PARTICLE SPAWN ───────────────────────────────────────────────────────

    private spawnParticles(): void {
        // Estrellas — mezcla de blanco cálido + naranja
        this.stars = Array.from({ length: 220 }, () => ({
            x: Math.random() * this.W,
            y: Math.random() * this.H,
            r: Math.random() * 1.3 + 0.2,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed:  Math.random() * 0.025 + 0.008,
            color: this.randomStarColor(),
        }));

        // Nubes de nebulosa en tonos rojo / naranja / dorado
        this.nebulas = Array.from({ length: 70 }, () => ({
            x:          Math.random() * this.W,
            y:          Math.random() * this.H,
            radius:     Math.random() * 120 + 40,
            opacity:    Math.random() * 0.13 + 0.04,
            driftAngle: Math.random() * Math.PI * 2,
            driftSpeed: Math.random() * 0.003 + 0.001,
            color: this.randomNebulaColor(),
        }));
    }

    private randomStarColor(): { r: number; g: number; b: number } {
        const palette = [
            { r: 255, g: 200, b: 150 }, // naranja cálido
            { r: 255, g: 230, b: 200 }, // blanco cálido
            { r: 255, g: 160, b: 100 }, // naranja
            { r: 255, g: 240, b: 220 }, // blanco puro
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    private randomNebulaColor(): { r: number; g: number; b: number } {
        const palette = [
            { r: 180, g: 35,  b: 15  }, // rojo profundo
            { r: 210, g: 60,  b: 20  }, // rojo/naranja
            { r: 160, g: 25,  b: 10  }, // rojo oscuro
            { r: 220, g: 100, b: 20  }, // naranja
            { r: 190, g: 70,  b: 10  }, // naranja oscuro
            { r: 150, g: 20,  b: 20  }, // rojo muy oscuro
            { r: 200, g: 130, b: 30  }, // dorado
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    // ─── RENDER LOOP ──────────────────────────────────────────────────────────

    private renderLoop(): void {
        this.tick++;
        const ctx = this.bgCtx;

        ctx.clearRect(0, 0, this.W, this.H);

        // Nebulosa
        this.nebulas.forEach(n => {
            n.driftAngle += n.driftSpeed;
            const nx = n.x + Math.sin(n.driftAngle) * 4;
            const ny = n.y + Math.cos(n.driftAngle) * 2.5;
            const g  = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radius);
            g.addColorStop(0, `rgba(${n.color.r},${n.color.g},${n.color.b},${n.opacity})`);
            g.addColorStop(1, `rgba(${n.color.r},${n.color.g},${n.color.b},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Estrellas
        this.stars.forEach(s => {
            s.twinkleOffset += s.twinkleSpeed;
            const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.twinkleOffset));
            ctx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        this.animFrameId = requestAnimationFrame(() => this.renderLoop());
    }

    // ─── TYPEWRITER ──────────────────────────────────────────────────────────

    private startTypewriter(): void {
        this.showCursor = true;
        let i = 0;

        setTimeout(() => {
            const iv = setInterval(() => {
                this.displayedName = this.FULL_NAME.slice(0, ++i);
                if (i >= this.FULL_NAME.length) {
                    clearInterval(iv);
                    this.typewriterComplete = true;
                    setTimeout(() => (this.showCursor = false), 800);
                }
            }, this.TYPEWRITER_SPEED_MS);
        }, this.TYPEWRITER_DELAY_MS);
    }

    // ─── CLOCK ───────────────────────────────────────────────────────────────

    private startClock(): void {
        const update = () => {
            const d = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            this.systemTime = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        update();
        this.clockInterval = setInterval(update, 1000);
    }

    // ─── WARP TRANSITION ─────────────────────────────────────────────────────

    onEnterCockpit(): void {
        if (this.isWarping) return;
        this.isWarping = true;

        const wCtx   = this.warpCtx;
        const cx     = this.W / 2;
        const cy     = this.H / 2;
        const total  = this.WARP_DURATION_MS;
        const start  = performance.now();

        // Spawn de estrellas warp — MÁS CANTIDAD para efecto de velocidad
        this.warpStars = Array.from({ length: this.WARP_STARS_COUNT }, () => {
            const angle = Math.random() * Math.PI * 2;
            // Distribución más variada de distancias para crear profundidad
            const distType = Math.random();
            let dist: number;
            if (distType < 0.4) {
                // 40% muy cercanas (rápidas)
                dist = Math.random() * Math.min(this.W, this.H) * 0.15 + 5;
            } else if (distType < 0.7) {
                // 30% a distancia media
                dist = Math.random() * Math.min(this.W, this.H) * 0.3 + Math.min(this.W, this.H) * 0.15;
            } else {
                // 30% lejanas (lentas)
                dist = Math.random() * Math.min(this.W, this.H) * 0.35 + Math.min(this.W, this.H) * 0.45;
            }
            return {
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                angle,
                dist,
            };
        });

        const warpFrame = (now: number) => {
            const elapsed = now - start;
            const prog    = Math.min(elapsed / total, 1);

            // Easing más dramático para acelerar más al inicio
            const eased   = Math.pow(prog, 1.3);  // poder aumentado para aceleración más rápida

            // Fondo fade-in más oscuro y dramático
            wCtx.fillStyle = `rgba(10,2,4,${0.05 + eased * 0.9})`;
            wCtx.fillRect(0, 0, this.W, this.H);

            // Estrellas que se convierten en líneas — VELOCIDAD MÁS DRAMÁTICA
            const speed  = eased * 120 + 1;          // velocidad base más alta
            const trailK = eased * 28 + 2;           // trails más largos

            this.warpStars.forEach(s => {
                // Variación en velocidad según la profundidad
                const depthFactor = s.dist / (Math.min(this.W, this.H) * 0.5);
                const depthSpeed = 0.5 + (1 - Math.min(depthFactor, 1)) * 1.5;

                const currentDist = s.dist + speed * elapsed * 0.08 * depthSpeed;
                const nx  = cx + Math.cos(s.angle) * currentDist;
                const ny  = cy + Math.sin(s.angle) * currentDist;
                const trailLen = speed * trailK * depthSpeed;
                const x0  = nx - Math.cos(s.angle) * trailLen;
                const y0  = ny - Math.sin(s.angle) * trailLen;

                // Alpha más variable según progreso
                const alpha = Math.min(0.2 + eased * 0.8, 1);

                // Color más vibrante: cyan (#01f1f1) al final, naranja al inicio
                const colorProgress = eased;
                const r = Math.floor(255 - colorProgress * 254);
                const g = Math.floor(150 + colorProgress * 105);
                const b = Math.floor(80 + colorProgress * 171);

                wCtx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                wCtx.lineWidth   = 0.3 + eased * 3;
                wCtx.lineCap     = 'round';
                wCtx.beginPath();
                wCtx.moveTo(x0, y0);
                wCtx.lineTo(nx, ny);
                wCtx.stroke();
            });

            if (prog < 1) {
                this.warpFrameId = requestAnimationFrame(warpFrame);
            } else {
                // Flash negro al final
                wCtx.fillStyle = 'rgba(0,0,0,1)';
                wCtx.fillRect(0, 0, this.W, this.H);

                setTimeout(() => {
                    // Navegar al cockpit
                    this.router.navigate([this.COCKPIT_ROUTE]);
                }, 100);
            }
        };

        this.warpFrameId = requestAnimationFrame(warpFrame);
    }


    openLink(url: string): void {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}
