// src/app/components/tablero/tablero-logic.ts
// Lógica de negocio del tablero: funciones puras sin dependencias de Angular.
// Ningún municipio, entidad o cifra está codificado: todo se calcula desde la fuente y los geojson.

import { Compromiso } from '../../models/compromiso';

// --- Estados ---

export type EstadoKey = 'finalizado' | 'ejecucion' | 'noIniciado' | 'noSeHara' | 'adjudicado' | 'otros';

export interface EstadoDef {
    key: EstadoKey;
    label: string;
    color: string;
    /** Valor del campo ESTADO (normalizado) que corresponde a esta categoría. */
    valor?: string;
}

/** Estados principales definidos en el requerimiento + la categoría que agrupa cualquier otro estado presente. */
export const ESTADOS: EstadoDef[] = [
    { key: 'finalizado', label: 'Finalizado', color: '#2E8B3D', valor: 'FINALIZADO' },
    { key: 'ejecucion', label: 'En ejecución', color: '#F5C21B', valor: 'EN EJECUCION' },
    { key: 'noIniciado', label: 'No se ha iniciado', color: '#E5262E', valor: 'NO SE HA INICIADO' },
    { key: 'noSeHara', label: 'No se va a hacer', color: '#8E3FD1', valor: 'NO SE VA A HACER' },
    { key: 'adjudicado', label: 'Adjudicado', color: '#1F7CE0', valor: 'ADJUDICADO' },
    { key: 'otros', label: 'Otros estados', color: '#6B7280' }
];

export const SIN_ESTADO = 'SIN ESTADO';
export const SIN_MUNICIPIO = 'SIN MUNICIPIO IDENTIFICADO';
export const SIN_ENTIDAD = 'SIN ENTIDAD';

/**
 * Un compromiso es un registro con código real: letras seguidas de un número (CGNC546, COI128, CAC12, EFR3).
 * Vacíos, números sueltos ("1", "2"…) y textos como "NO APLICA" o "SIN DEFINIR" son proyectos/acciones de la entidad.
 */
export function tieneCodigo(codigo: string | null | undefined): boolean {
    return /^[A-Z]{2,}\s*-?\s*\d+$/.test(normalizarTexto(codigo));
}


/**
 * Clasifica un estado solo por coincidencia exacta (sin distinguir mayúsculas, tildes ni espacios).
 * Cualquier otro valor se conserva tal cual y se agrupa en "otros", nunca se reclasifica.
 */
export function clasificarEstado(estado: string | null | undefined): EstadoKey {
    const e = normalizarTexto(estado);
    return ESTADOS.find(d => d.valor === e)?.key ?? 'otros';
}

// --- Geografía (geojson) ---

export interface MunicipioGeo {
    nombre: string;     // nombre a mostrar
    clave: string;      // nombre normalizado para coincidencias
    provincia: string;
}

export interface Geografia {
    provincias: { nombre: string; clave: string }[];
    municipios: MunicipioGeo[];
}

/**
 * Construye el catálogo geográfico. El geojson de municipios no trae la provincia,
 * así que se asigna con la función `provinciaQueContiene` (cruce espacial).
 */
export function construirGeografia(
    provinciasGeojson: any,
    municipiosGeojson: any,
    provinciaQueContiene: (municipioFeature: any, provincias: any[]) => any | undefined
): Geografia {
    const provFeatures: any[] = provinciasGeojson?.features ?? [];
    const provincias = provFeatures
        .map(f => String(f.properties?.PROVINCIA ?? '').trim())
        .filter(Boolean)
        .map(nombre => ({ nombre, clave: claveLugar(nombre) }));

    const municipios: MunicipioGeo[] = [];
    for (const f of municipiosGeojson?.features ?? []) {
        const original = String(f.properties?.munnombre ?? '').trim();
        if (!original) continue;
        const prov = provinciaQueContiene(f, provFeatures);
        municipios.push({
            nombre: original.replace(/\s+/g, ' ').toUpperCase(),
            clave: claveLugar(original),
            provincia: prov ? String(prov.properties.PROVINCIA).trim() : ''
        });
    }
    // Primero los nombres más largos, para que coincidan antes que uno contenido en ellos.
    municipios.sort((a, b) => b.clave.length - a.clave.length);
    return { provincias, municipios };
}

// --- Registros enriquecidos ---

export interface Registro {
    c: Compromiso;
    municipios: string[];   // municipios del geojson mencionados en el campo MUNICIPIO
    provincias: string[];   // provincias derivadas de esos municipios (o del campo PROVINCIA)
    entidad: string;
    estado: string;         // valor original del campo ESTADO
    estadoKey: EstadoKey;
    valorInicial: number | null;
    valorContrato: number | null;
    textoBusqueda: string;
}

/**
 * Asocia cada compromiso con los municipios del geojson cuyo nombre aparece como palabra
 * completa en el campo MUNICIPIO (equivalente al LIKE del endpoint proyectos-por-municipio,
 * pero sin que "TAUSA" coincida con "SUTATAUSA").
 */
export function enriquecer(compromisos: Compromiso[], geo: Geografia): Registro[] {
    // El tablero solo muestra compromisos (registros con código); el resto son proyectos/acciones de las entidades.
    return compromisos.filter(c => tieneCodigo(c.codigo)).map(c => {
        const texto = ` ${claveLugar(c.municipio)} `;
        const municipios: string[] = [];
        let restante = texto;
        for (const m of geo.municipios) {
            const patron = ` ${m.clave} `;
            if (restante.includes(patron)) {
                municipios.push(m.nombre);
                restante = restante.split(patron).join(' ');
            }
        }

        let provincias = unicos(municipios
            .map(n => geo.municipios.find(m => m.nombre === n)?.provincia ?? '')
            .filter(Boolean));
        if (!provincias.length) {
            const textoProv = ` ${claveLugar(c.provincia)} `;
            provincias = geo.provincias.filter(p => textoProv.includes(` ${p.clave} `)).map(p => p.nombre);
        }

        const estado = (c.estado ?? '').trim() || SIN_ESTADO;
        const entidad = (c.entidad ?? '').trim() || SIN_ENTIDAD;
        return {
            c,
            municipios,
            provincias,
            entidad,
            estado,
            estadoKey: clasificarEstado(c.estado),
            valorInicial: aNumero(c.valor_total),
            valorContrato: aNumero(c.valor_documento),
            textoBusqueda: normalizarTexto([
                c.codigo, c.municipio, entidad, c.compromiso_especifico,
                c.detalle_especifico, estado, c.observaciones
            ].join(' '))
        };
    });
}

// --- Filtros ---

export interface Filtros {
    provincia: string;
    municipio: string;
    entidad: string;
}

export function filtrosVacios(): Filtros {
    return { provincia: '', municipio: '', entidad: '' };
}

export function filtrar(registros: Registro[], f: Filtros, ignorar?: keyof Filtros): Registro[] {
    return registros.filter(r =>
        (ignorar === 'provincia' || !f.provincia || r.provincias.includes(f.provincia)) &&
        (ignorar === 'municipio' || !f.municipio || r.municipios.includes(f.municipio)) &&
        (ignorar === 'entidad' || !f.entidad || r.entidad === f.entidad)
    );
}

/** Opciones dependientes: solo valores que existen en la fuente para la combinación elegida. */
export function opcionesFiltros(registros: Registro[], geo: Geografia, f: Filtros) {
    const conDatosProv = new Set(registros.flatMap(r => r.provincias));
    const provincias = geo.provincias.map(p => p.nombre).filter(p => conDatosProv.has(p));

    const porProvincia = filtrar(registros, { ...f, municipio: '', entidad: '' });
    const conDatosMun = new Set(porProvincia.flatMap(r => r.municipios));
    const municipios = geo.municipios
        .filter(m => conDatosMun.has(m.nombre) && (!f.provincia || m.provincia === f.provincia))
        .map(m => m.nombre)
        .sort(comparar);

    const entidades = unicos(filtrar(registros, f, 'entidad').map(r => r.entidad)).sort(comparar);
    return { provincias: [...provincias].sort(comparar), municipios, entidades };
}

// --- Agregados ---

export type Conteos = Record<EstadoKey, number>;

export interface FilaResumen {
    nombre: string;
    conteos: Conteos;
    total: number;
}

export interface Resumen {
    total: number;
    conteos: Conteos;
    otrosDetalle: { estado: string; cantidad: number }[];
    porMunicipio: FilaResumen[];
    porEntidad: FilaResumen[];
    multimunicipio: number;
}

export function conteosVacios(): Conteos {
    return { finalizado: 0, ejecucion: 0, noIniciado: 0, noSeHara: 0, adjudicado: 0, otros: 0 };
}

export function resumir(registros: Registro[]): Resumen {
    const conteos = conteosVacios();
    const otros = new Map<string, number>();
    const muni = new Map<string, FilaResumen>();
    const ent = new Map<string, FilaResumen>();
    let multimunicipio = 0;

    for (const r of registros) {
        conteos[r.estadoKey]++;
        if (r.estadoKey === 'otros') otros.set(r.estado, (otros.get(r.estado) ?? 0) + 1);
        if (r.municipios.length > 1) multimunicipio++;
        // Un compromiso que abarca varios municipios se cuenta en cada uno de ellos.
        for (const m of r.municipios.length ? r.municipios : [SIN_MUNICIPIO]) sumar(muni, m, r.estadoKey);
        sumar(ent, r.entidad, r.estadoKey);
    }

    const alFinal = (n: string) => n === SIN_MUNICIPIO || n === SIN_ENTIDAD;
    const ordenar = (a: FilaResumen, b: FilaResumen) =>
        Number(alFinal(a.nombre)) - Number(alFinal(b.nombre)) || b.total - a.total || comparar(a.nombre, b.nombre);

    return {
        total: registros.length,
        conteos,
        otrosDetalle: [...otros.entries()]
            .map(([estado, cantidad]) => ({ estado, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad),
        porMunicipio: [...muni.values()].sort(ordenar),
        porEntidad: [...ent.values()].sort(ordenar),
        multimunicipio
    };
}

function sumar(mapa: Map<string, FilaResumen>, nombre: string, key: EstadoKey): void {
    let fila = mapa.get(nombre);
    if (!fila) {
        fila = { nombre, conteos: conteosVacios(), total: 0 };
        mapa.set(nombre, fila);
    }
    fila.conteos[key]++;
    fila.total++;
}

export function porcentaje(n: number, total: number): string {
    const p = total ? (n / total) * 100 : 0;
    return p.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// --- Búsqueda y orden de la tabla detallada ---

export function buscar(registros: Registro[], texto: string): Registro[] {
    const q = normalizarTexto(texto);
    return q ? registros.filter(r => r.textoBusqueda.includes(q)) : registros;
}

export type ColumnaDetalle = 'codigo' | 'municipio' | 'entidad' | 'compromiso' | 'valorInicial'
    | 'detalle' | 'valorContrato' | 'estado' | 'observaciones';

export function ordenar(registros: Registro[], col: ColumnaDetalle | null, asc: boolean): Registro[] {
    if (!col) return registros;
    const dir = asc ? 1 : -1;
    const valor = (r: Registro): string | number | null => {
        switch (col) {
            case 'codigo': return r.c.codigo;
            case 'municipio': return r.c.municipio;
            case 'entidad': return r.entidad;
            case 'compromiso': return r.c.compromiso_especifico;
            case 'valorInicial': return r.valorInicial;
            case 'detalle': return r.c.detalle_especifico;
            case 'valorContrato': return r.valorContrato;
            case 'estado': return r.estado;
            case 'observaciones': return r.c.observaciones;
        }
    };
    return [...registros].sort((a, b) => {
        const va = valor(a), vb = valor(b);
        const vaVacio = va === null || va === undefined || va === '';
        const vbVacio = vb === null || vb === undefined || vb === '';
        if (vaVacio || vbVacio) return Number(vaVacio) - Number(vbVacio); // vacíos siempre al final
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return comparar(String(va), String(vb)) * dir;
    });
}

// --- Formato ---

/** Formatea como moneda solo los valores numéricos; textos como "SIN DEFINIR" o "N/A" se conservan. */
export function formatoMoneda(valor: unknown): string {
    if (valor === null || valor === undefined) return '';
    const texto = String(valor).trim();
    const n = aNumero(texto);
    if (n === null) return texto;
    return '$ ' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

export function aNumero(valor: unknown): number | null {
    if (valor === null || valor === undefined) return null;
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
    const texto = String(valor).trim();
    // Solo números "planos" como los entrega la base (p. ej. "1500000000" o "622798670.00")
    if (!/^-?\d+(\.\d+)?$/.test(texto)) return null;
    return Number(texto);
}

// --- Utilidades ---

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

export function comparar(a: string, b: string): number {
    return collator.compare(a, b);
}

function unicos(arr: string[]): string[] {
    return Array.from(new Set(arr));
}

export function normalizarTexto(s: string | null | undefined): string {
    return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').toUpperCase().trim();
}

/** Clave para comparar nombres de lugares: sin tildes, sin signos y sin "DE"/"DEL". */
function claveLugar(s: string | null | undefined): string {
    return normalizarTexto(s)
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\b(DE|DEL)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
