// src/app/models/compromiso.model.ts

export interface Compromiso {
    codigo: string;
    provincia: string;
    municipio: string;
    compromiso_especifico: string;
    tema: string;
    subtema: string;
    detalle_especifico: string;
    meta_del_plan_de_desarrollo: string;
    descripcion_meta_producto: string;
    se_dara_cumplimiento_al_compromiso: boolean;
    dispone_del_presupuesto: boolean;
    el_compromiso_fue_modificado: boolean;
    nuevo_compromiso: string;
    prioridad: string;
    estado: string;
    valor_total: number;
    aporte_departamento: number;
    aporte_municipio: number;
    aporte_nacion: number;
    otro_aporte: number;
    fuente_cofinanciacion: string;
    entidad_lider: string;
    entidades_aliadas: string;
    tipo_documento: string;
    numero_documento: string;
    objeto_documento: string;
    valor_documento: number;
    bien_o_servicio_entregado: string;
    fecha_estimada_inicio: string; // Usar string para fechas y luego parsear si es necesario
    fecha_estimada_finalizacion: string; // Usar string para fechas y luego parsear si es necesario
    accion_adelantada: string;
    acciones_pendientes: string;
    se_requiere_apoyo_despacho: boolean;
    dificultades: string;
    alternativas_de_solucion: string;
    observaciones: string;
}
