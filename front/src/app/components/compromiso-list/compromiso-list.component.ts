
// src/app/components/compromiso-list/compromiso-list.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
    selector: 'app-compromiso-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatInputModule, HeaderComponent, FooterComponent],
    templateUrl: './compromiso-list.component.html',
    styleUrls: ['./compromiso-list.component.css'],
    providers: [CompromisosService, HttpClient]
})
export class CompromisoListComponent implements OnInit, AfterViewInit {
    aplicarBusqueda(valor: string): void {
        const filterValue = (valor || '').trim().toLowerCase();
        // ensure the predicate is set
        if (!this.dataSource.filterPredicate) {
            this.dataSource.filterPredicate = (data: Compromiso, filter: string) => {
                const dataStr = Object.values(data).join(' ').toLowerCase();
                return dataStr.includes(filter);
            };
        }
        this.dataSource.filter = filterValue;
        // reset paginator to first page when searching
        if (this.paginator) {
            this.paginator.firstPage();
        }
    }
    compromisos: Compromiso[] = [];
    compromisosFiltrados: Compromiso[] = [];
    provincias: string[] = [];
    municipios: string[] = [];
    entidades: string[] = [];
    filtroProvincia: string = '';
    filtroMunicipio: string = '';
    filtroEntidad: string = '';
    loading: boolean = true;
    error: string | null = null;
    displayedColumns: string[] = ['codigo', 'entidad_lider', 'provincia', 'municipio', 'compromiso_especifico', 'estado', 'acciones'];
    dataSource:MatTableDataSource<Compromiso> = new MatTableDataSource<Compromiso>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private compromisosService: CompromisosService, public authService: AuthService) { }

    ngOnInit(): void {
        // Filtro global para todos los campos
        this.dataSource.filterPredicate = (data: Compromiso, filter: string) => {
            const dataStr = Object.values(data).join(' ').toLowerCase();
            return dataStr.includes(filter);
        };
        this.loadCompromisos();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    loadCompromisos(): void {
        this.loading = true;
        this.error = null;
        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                this.compromisos = data;
                this.provincias = this.getUnicos(data.map(c => c.provincia));
                this.municipios = this.getUnicos(data.map(c => c.municipio));
                this.entidades = this.getUnicos(data.map(c => c.entidad_lider || c.entidad));
                this.aplicarFiltros();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar compromisos:', err);
                this.error = 'No se pudieron cargar los compromisos. Intenta de nuevo más tarde.';
                this.loading = false;
            }
        });
    }

    getUnicos(arr: string[]): string[] {
        return Array.from(new Set(arr.filter(x => !!x))).sort();
    }

    aplicarFiltros(): void {
        this.compromisosFiltrados = this.compromisos.filter(c =>
            (!this.filtroProvincia || c.provincia === this.filtroProvincia) &&
            (!this.filtroMunicipio || c.municipio === this.filtroMunicipio) &&
            (!this.filtroEntidad || (c.entidad_lider || c.entidad) === this.filtroEntidad)
        );
        this.dataSource.data = this.compromisosFiltrados;
        // paginator may not yet be available due to *ngIf; assign asynchronously
        setTimeout(() => {
            if (this.paginator) {
                this.dataSource.paginator = this.paginator;
                this.paginator.firstPage();
            }
        });
    }

    deleteCompromiso(codigo: string): void {
        if (confirm(`¿Estás seguro de que quieres eliminar el compromiso con código ${codigo}?`)) {
            this.compromisosService.deleteCompromiso(codigo).subscribe({
                next: () => {
                    this.compromisos = this.compromisos.filter(c => c.codigo !== codigo);
                    this.aplicarFiltros();
                    alert('Compromiso eliminado exitosamente.');
                },
                error: (err) => {
                    console.error('Error al eliminar compromiso:', err);
                    alert('No se pudo eliminar el compromiso. Verifica que no tenga reportes de avance asociados.');
                }
            });
        }
    }
}
