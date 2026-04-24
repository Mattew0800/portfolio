import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
} from '@angular/forms';
import {CockpitScreenFrameComponent} from "../../components/cockpit-screen-frame/cockpit-screen-frame";
import {ModalService} from "../../services/modal.service";

export interface ContactChannel {
    id:      string;
    label:   string;
    value:   string;   // texto visible (email, @usuario, etc.)
    url:     string;
    svgPath: string;
}

@Component({
    selector: 'app-contact-modal',
    standalone: true,
    templateUrl: './contact-modal.html',
    styleUrls: ['./contact-modal.scss'],
    imports: [
        CockpitScreenFrameComponent
    ]
})
export class ContactComponent {

    // ─── DATOS — editá con los tuyos ─────────────────────────────────────────
    readonly AVAILABILITY_MSG = 'Disponible para oportunidades laborales y proyectos freelance.';

    readonly channels: ContactChannel[] = [
        {
            id:      'email',
            label:   'EMAIL',
            value:   'matias@email.com',
            url:     'mailto:matias@email.com',
            svgPath: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
        },
        {
            id:      'linkedin',
            label:   'LINKEDIN',
            value:   'in/matias-oyhamburu',
            url:     'https://linkedin.com/in/tu-usuario',
            svgPath: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z',
        },
        {
            id:      'github',
            label:   'GITHUB',
            value:   'github.com/tu-usuario',
            url:     'https://github.com/tu-usuario',
            svgPath: 'M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.7.115 2.5.337 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z',
        },
        {
            id:      'whatsapp',
            label:   'WHATSAPP',
            value:   '+54 9 XXX XXX XXXX',
            url:     'https://wa.me/549XXXXXXXXXX',
            svgPath: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z',
        },
    ];
    // ─────────────────────────────────────────────────────────────────────────

    form: FormGroup;
    formState: 'idle' | 'sending' | 'sent' | 'error' = 'idle';
    focusedField: string | null = null;

    constructor(private fb: FormBuilder, public modalService: ModalService) {
        this.form = this.fb.group({
            name:    ['', [Validators.required, Validators.minLength(2)]],
            email:   ['', [Validators.required, Validators.email]],
            subject: ['', [Validators.required, Validators.minLength(4)]],
            message: ['', [Validators.required, Validators.minLength(20)]],
        });
    }

    // ─── CAMPO HELPERS ────────────────────────────────────────────────────────

    field(name: string): AbstractControl {
        return this.form.get(name)!;
    }

    isInvalid(name: string): boolean {
        const c = this.field(name);
        return c.invalid && (c.dirty || c.touched);
    }

    isValid(name: string): boolean {
        return this.field(name).valid && this.field(name).dirty;
    }

    charCount(name: string): number {
        return (this.field(name).value as string)?.length ?? 0;
    }

    // ─── SUBMIT (solo visual) ────────────────────────────────────────────────
    // Para conectar un backend real: integrá EmailJS, Formspree o tu API.

    onSubmit(): void {
        if (this.form.invalid || this.formState !== 'idle') return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        this.formState = 'sending';

        // Simulación de envío — reemplazá con tu servicio real
        setTimeout(() => {
            this.formState = 'sent';
            this.form.reset();
        }, 1800);
    }

    resetForm(): void {
        this.formState = 'idle';
        this.form.reset();
    }

    // ─── LINKS ───────────────────────────────────────────────────────────────

    openChannel(ch: ContactChannel): void {
        window.open(ch.url, '_blank', 'noopener,noreferrer');
    }

    onBack(): void {
        this.modalService.closeModal();
    }
}
