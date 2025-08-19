// src/app/models/reporte-avance.model.ts

export interface ReporteAvance {
    id?: number; // Opcional para cuando se crea un nuevo reporte
    compromiso_codigo: string;
    mes_reporte: string; // Formato 'YYYY-MM-DD' (ej. '2024-07-01')
    reporte_avance_fisico: number;
    reporte_avance_financiero: number;
    observaciones_reporte: string;
    imagen_url?: string; // Opcional, URL de la imagen
    fecha_creacion?: string; // Opcional, generado por el backend
}
