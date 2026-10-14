// src/app/components/tablero/tablero.component.ts
// Capa de presentación: mantiene el estado de la vista y delega cálculos a tablero-logic.

import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { TableroDataService } from '../../services/tablero-data.service';
import {
    ColumnaDetalle, ESTADOS, EstadoKey, FilaResumen, Filtros, Geografia, Registro, Resumen,
    buscar, enriquecer, filtrar, formatoMoneda, opcionesFiltros, ordenar, porcentaje, resumir
} from './tablero-logic';
import { generarInformePdf } from './tablero-pdf';

registerLocaleData(localeEs, 'es');

@Component({
    selector: 'app-tablero',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
    templateUrl: './tablero.component.html',
    styleUrls: ['./tablero.component.css']
})
export class TableroComponent implements OnInit {
    readonly estadosDef = ESTADOS;
    readonly columnas: { key: ColumnaDetalle; label: string; texto?: boolean }[] = [
        { key: 'codigo', label: 'Código' },
        { key: 'municipio', label: 'Municipio' },
        { key: 'entidad', label: 'Entidad líder' },
        { key: 'compromiso', label: 'Compromiso específico', texto: true },
        { key: 'valorInicial', label: 'Valor inicial' },
        { key: 'detalle', label: 'Detalle específico', texto: true },
        { key: 'valorContrato', label: 'Valor contrato / convenio / ordenanza / resolución municipalizado' },
        { key: 'estado', label: 'Estado' },
        { key: 'observaciones', label: 'Observaciones', texto: true }
    ];

    private geo: Geografia = { provincias: [], municipios: [] };
    private registros: Registro[] = [];
    filtrados: Registro[] = [];

    filtros: Filtros = { provincia: '', municipio: '', entidad: '' };
    provincias: string[] = [];
    municipios: string[] = [];
    entidades: string[] = [];

    resumen: Resumen = resumir([]);
    matrices: { titulo: string; primera: string; filas: FilaResumen[]; nota: string }[] = [];
    donut: { key: EstadoKey; color: string; valor: number; dash: string; offset: number; lx: number; ly: number }[] = [];

    // Tabla detallada
    busqueda = '';
    ordenCol: ColumnaDetalle | null = null;
    ordenAsc = true;
    detalle: Registro[] = [];
    pagina = 1;
    porPagina = 25;
    readonly opcionesPorPagina = [10, 25, 50, 100];
    expandidas = new Set<number>();

    consultadoEn: Date | null = null;
    loading = true;
    error: string | null = null;
    generandoPdf = false;

    readonly formatoMoneda = formatoMoneda;
    private static readonly MAX_DETALLE_PDF = 2000;

    constructor(private datos: TableroDataService) { }

    ngOnInit(): void {
        this.datos.cargar().subscribe({
            next: ({ compromisos, geografia }) => {
                this.geo = geografia;
                this.registros = enriquecer(compromisos, geografia);
                this.consultadoEn = new Date();
                this.loading = false;
                this.aplicarFiltros();
            },
            error: (err) => {
                console.error('Error al cargar el tablero:', err);
                this.error = 'No se pudieron cargar los compromisos. Intenta de nuevo más tarde.';
                this.loading = false;
            }
        });
    }

    // --- Filtros ---

    onProvinciaChange(): void {
        this.filtros.municipio = '';
        this.aplicarFiltros();
    }

    limpiarFiltros(): void {
        this.filtros = { provincia: '', municipio: '', entidad: '' };
        this.busqueda = '';
        this.ordenCol = null;
        this.ordenAsc = true;
        this.aplicarFiltros();
    }

    aplicarFiltros(): void {
        let opciones = opcionesFiltros(this.registros, this.geo, this.filtros);
        // Si una selección ya no existe para la combinación actual, se libera.
        if (this.filtros.municipio && !opciones.municipios.includes(this.filtros.municipio)) this.filtros.municipio = '';
        if (this.filtros.entidad && !opciones.entidades.includes(this.filtros.entidad)) this.filtros.entidad = '';
        opciones = opcionesFiltros(this.registros, this.geo, this.filtros);
        this.provincias = opciones.provincias;
        this.municipios = opciones.municipios;
        this.entidades = opciones.entidades;

        this.filtrados = filtrar(this.registros, this.filtros);
        this.resumen = resumir(this.filtrados);
        this.matrices = [
            {
                titulo: 'Compromisos por municipio y estado', primera: 'Municipio', filas: this.resumen.porMunicipio,
                nota: this.resumen.multimunicipio
                    ? `${this.resumen.multimunicipio} compromiso(s) abarcan varios municipios y se cuentan en cada uno.` : ''
            },
            { titulo: 'Compromisos por entidad líder y estado', primera: 'Entidad líder', filas: this.resumen.porEntidad, nota: '' }
        ];
        this.calcularDonut();
        this.actualizarDetalle();
    }

    // --- Tabla detallada ---

    actualizarDetalle(): void {
        this.detalle = ordenar(buscar(this.filtrados, this.busqueda), this.ordenCol, this.ordenAsc);
        this.pagina = 1;
        this.expandidas.clear();
    }

    ordenarPor(col: ColumnaDetalle): void {
        if (this.ordenCol === col) {
            if (this.ordenAsc) this.ordenAsc = false;
            else this.ordenCol = null; // tercer clic: orden original
        } else {
            this.ordenCol = col;
            this.ordenAsc = true;
        }
        this.actualizarDetalle();
    }

    toggleFila(id: number): void {
        if (this.expandidas.has(id)) this.expandidas.delete(id);
        else this.expandidas.add(id);
    }

    get totalPaginas(): number {
        return Math.max(1, Math.ceil(this.detalle.length / this.porPagina));
    }

    get paginaActual(): Registro[] {
        const inicio = (this.pagina - 1) * this.porPagina;
        return this.detalle.slice(inicio, inicio + this.porPagina);
    }

    get paginasVisibles(): (number | null)[] {
        const total = this.totalPaginas;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const paginas: (number | null)[] = [1];
        const desde = Math.max(2, this.pagina - 1);
        const hasta = Math.min(total - 1, this.pagina + 1);
        if (desde > 2) paginas.push(null);
        for (let i = desde; i <= hasta; i++) paginas.push(i);
        if (hasta < total - 1) paginas.push(null);
        paginas.push(total);
        return paginas;
    }

    irA(p: number): void {
        this.pagina = Math.min(Math.max(1, p), this.totalPaginas);
        this.expandidas.clear();
    }

    cambiarPorPagina(): void {
        this.pagina = 1;
        this.expandidas.clear();
    }

    // --- Presentación ---

    porcentaje(n: number): string {
        return porcentaje(n, this.resumen.total);
    }

    colorEstado(key: EstadoKey): string {
        return ESTADOS.find(d => d.key === key)!.color;
    }

    // Donut SVG: radio 70
    readonly radio = 70;
    private readonly circ = 2 * Math.PI * 70;

    private calcularDonut(): void {
        const total = this.resumen.total;
        let acumulado = 0;
        this.donut = [];
        if (!total) return;
        for (const d of ESTADOS) {
            const valor = this.resumen.conteos[d.key];
            if (!valor) continue;
            const largo = (valor / total) * this.circ;
            const medio = (acumulado + valor / 2) / total * 2 * Math.PI - Math.PI / 2;
            this.donut.push({
                key: d.key,
                color: d.color,
                valor,
                dash: `${largo} ${this.circ - largo}`,
                offset: -(acumulado / total) * this.circ,
                lx: 100 + Math.cos(medio) * this.radio,
                ly: 100 + Math.sin(medio) * this.radio
            });
            acumulado += valor;
        }
    }

    // --- Informe PDF ---

    async descargarInforme(): Promise<void> {
        if (this.generandoPdf) return;
        let incluirDetalle = true;
        if (this.detalle.length > TableroComponent.MAX_DETALLE_PDF) {
            incluirDetalle = confirm(
                `El detalle tiene ${this.detalle.length.toLocaleString('es-CO')} registros y el PDF puede tardar varios minutos.\n\n` +
                'Aceptar: incluir el detalle completo.\nCancelar: descargar solo el resumen (KPI, matrices y gráfico).'
            );
        }
        this.generandoPdf = true;
        // Deja que el botón muestre "Generando..." antes del trabajo pesado.
        await new Promise(r => setTimeout(r, 50));
        try {
            await generarInformePdf({
                resumen: this.resumen,
                detalle: this.detalle,
                filtros: { ...this.filtros, busqueda: this.busqueda.trim() },
                incluirDetalle
            });
        } catch (err) {
            console.error('Error al generar el informe PDF:', err);
            alert('No se pudo generar el informe. Intenta de nuevo.');
        } finally {
            this.generandoPdf = false;
        }
    }
}
