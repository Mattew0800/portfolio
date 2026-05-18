import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

export interface EmailRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    // Configuración de EmailJS
    // Reemplazá estos valores con los tuyos de EmailJS
    private readonly SERVICE_ID = 'service_cufr4jn';
    private readonly TEMPLATE_ID = 'template_2j01bao';
    private readonly PUBLIC_KEY = 'B7hZ6p5OEUWgV_q-8';

    constructor() {
        // Inicializar EmailJS solo si los datos están configurados
        if (this.isConfigured()) {
            this.initializeEmailJS();
        }
    }

    /**
     * Verifica si la configuración de EmailJS está presente
     */
    private isConfigured(): boolean {
        return (
            this.SERVICE_ID.trim() !== '' &&
            this.TEMPLATE_ID.trim() !== '' &&
            this.PUBLIC_KEY.trim() !== ''
        );
    }

    /**
     * Inicializa EmailJS con la clave pública
     */
    private initializeEmailJS(): void {
        emailjs.init(this.PUBLIC_KEY);
    }

    /**
     * Envía un correo de contacto
     * @param emailRequest Datos del correo a enviar
     * @returns Promise que se resuelve cuando el correo se envía exitosamente
     */
    async sendContactEmail(emailRequest: EmailRequest): Promise<void> {
        if (!this.isConfigured()) {
            throw new Error(
                'EmailJS no está configurado. Por favor, configura SERVICE_ID, TEMPLATE_ID y PUBLIC_KEY.'
            );
        }

        try {
            await emailjs.send(
                this.SERVICE_ID,
                this.TEMPLATE_ID,
                {
                    to_email: 'oyhamburumatias@gmail.com', // Tu email
                    from_name: emailRequest.name,
                    from_email: emailRequest.email,
                    subject: emailRequest.subject,
                    message: emailRequest.message,
                    reply_to: emailRequest.email,
                },
                this.PUBLIC_KEY
            );
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }
}

