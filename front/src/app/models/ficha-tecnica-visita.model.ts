export interface FichaTecnicaVisita {
    id?: number; // El ID es opcional al crear una nueva ficha
    municipio: string;
    fecha_visita: string; // Usaremos un string en formato ISO (YYYY-MM-DD)
    participantes: string; // Puede ser una lista de nombres separados por comas
    observaciones: string;
    recomendaciones: string;
    url_documento?: string; // URL al documento de la ficha
}
