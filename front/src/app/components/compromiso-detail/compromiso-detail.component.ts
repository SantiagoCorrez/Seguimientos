// src/app/components/compromiso-detail/compromiso-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';
import { ReporteAvance } from '../../models/reporte-avance';

@Component({
    selector: 'app-compromiso-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './compromiso-detail.component.html',
    styleUrls: ['./compromiso-detail.component.css']
})
export class CompromisoDetailComponent implements OnInit {
    compromiso: Compromiso | undefined;
    reportesAvance: ReporteAvance[] = [];
    loadingCompromiso: boolean = true;
    loadingReportes: boolean = true;
    errorCompromiso: string | null = null;
    errorReportes: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private compromisosService: CompromisosService
    ) { }

    ngOnInit(): void {
        const codigo = this.route.snapshot.paramMap.get('codigo');
        if (codigo) {
            this.loadCompromiso(codigo);
            this.loadReportesAvance(codigo);
        } else {
            this.errorCompromiso = 'Código de compromiso no proporcionado.';
            this.loadingCompromiso = false;
            this.loadingReportes = false;
        }
    }

    loadCompromiso(codigo: string): void {
        this.loadingCompromiso = true;
        this.errorCompromiso = null;
        this.compromisosService.getCompromisoByCodigo(codigo).subscribe({
            next: (data) => {
                this.compromiso = data;
                this.loadingCompromiso = false;
            },
            error: (err) => {
                console.error('Error al cargar el compromiso:', err);
                this.errorCompromiso = 'No se pudo cargar el compromiso.';
                this.loadingCompromiso = false;
            }
        });
    }

    loadReportesAvance(codigo: string): void {
        this.loadingReportes = true;
        this.errorReportes = null;
        this.compromisosService.getReportesAvance(codigo).subscribe({
            next: (data) => {
                this.reportesAvance = data;
                this.loadingReportes = false;
            },
            error: (err) => {
                console.error('Error al cargar reportes de avance:', err);
                this.errorReportes = 'No se pudieron cargar los reportes de avance.';
                this.loadingReportes = false;
            }
        });
    }

    deleteReporteAvance(id: number): void {
        if (confirm(`¿Estás seguro de que quieres eliminar este reporte de avance?`)) {
            this.compromisosService.deleteReporteAvance(id).subscribe({
                next: () => {
                    this.reportesAvance = this.reportesAvance.filter(r => r.id !== id);
                    alert('Reporte de avance eliminado exitosamente.');
                },
                error: (err) => {
                    console.error('Error al eliminar reporte de avance:', err);
                    alert('No se pudo eliminar el reporte de avance.');
                }
            });
        }
    }
}
