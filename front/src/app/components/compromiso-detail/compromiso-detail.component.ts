// src/app/components/compromiso-detail/compromiso-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';
import { ReporteAvance } from '../../models/reporte-avance';
import { AuthService } from '../../services/auth.service';

import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
    selector: 'app-compromiso-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
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
        private compromisosService: CompromisosService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadCompromisoAndReportes(+id);
        } else {
            this.errorCompromiso = 'ID de compromiso no proporcionado.';
            this.loadingCompromiso = false;
            this.loadingReportes = false;
        }
    }

    loadCompromisoAndReportes(id: number): void {
        this.loadingCompromiso = true;
        this.errorCompromiso = null;
        this.compromisosService.getCompromisoById(id).subscribe({
            next: (data) => {
                this.compromiso = data;
                this.loadingCompromiso = false;
                if (this.compromiso && this.compromiso.codigo) {
                    this.loadReportesAvance(this.compromiso.codigo);
                } else {
                    this.loadingReportes = false;
                    this.reportesAvance = [];
                }
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
