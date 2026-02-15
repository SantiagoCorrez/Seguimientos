
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-compromiso-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatInputModule, HeaderComponent, FooterComponent, FormsModule, ReactiveFormsModule],
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

    // Filter Lists
    provincias: string[] = [];
    municipios: string[] = [];
    entidades: any[] = [];
    prioridades: string[] = [];
    estados: string[] = [];
    obligaciones: string[] = [];

    // Filter Values
    filtroProvincia: string = '';
    filtroMunicipio: string = '';
    filtroEntidad: string = '';
    filtroPrioridad: string = '';
    filtroEstado: string = '';
    filtroObligacion: string = '';

    loading: boolean = true;
    error: string | null = null;

    // Displayed Columns (Updated)
    displayedColumns: string[] = ['id', 'proyecto', 'entidad', 'inversion', 'estado', 'avance', 'prioridad', 'acciones'];
    dataSource: MatTableDataSource<Compromiso> = new MatTableDataSource<Compromiso>([]);

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private compromisosService: CompromisosService, public authService: AuthService, private userService: UserService) { }

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
                this.prioridades = this.getUnicos(data.map(c => c.prioridad));
                this.estados = this.getUnicos(data.map(c => c.estado));
                this.obligaciones = this.getUnicos(data.map(c => c.obligacion_contraida));
                this.entidades = this.getUnicos(data.map(c => c.entidad));
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
            (!this.filtroEntidad || (c.entidad) === this.filtroEntidad) &&
            (!this.filtroPrioridad || c.prioridad === this.filtroPrioridad) &&
            (!this.filtroEstado || c.estado === this.filtroEstado) &&
            (!this.filtroObligacion || c.obligacion_contraida === this.filtroObligacion)
        );
        this.compromisosFiltrados.map(c => c.detalle_especifico == null ? c.detalle_especifico = "" : c.detalle_especifico);
        this.compromisosFiltrados.sort((a, b) => b.valor_documento - a.valor_documento);
        this.dataSource.data = this.compromisosFiltrados;
        // paginator may not yet be available due to *ngIf; assign asynchronously
        setTimeout(() => {
            if (this.paginator) {
                this.dataSource.paginator = this.paginator;
                this.paginator.firstPage();
            }
        });
    }

    deleteCompromiso(id: number): void {
        if (confirm(`¿Estás seguro de que quieres eliminar este compromiso?`)) {
            this.compromisosService.deleteCompromiso(id).subscribe({
                next: () => {
                    this.compromisos = this.compromisos.filter(c => c.id !== id);
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
