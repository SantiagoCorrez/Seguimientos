// src/app/components/compromiso-list/compromiso-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-compromiso-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './compromiso-list.component.html',
    styleUrls: ['./compromiso-list.component.css'],
    providers: [CompromisosService, HttpClient]
})
export class CompromisoListComponent implements OnInit {
    compromisos: Compromiso[] = [];
    loading: boolean = true;
    error: string | null = null;

    constructor(private compromisosService: CompromisosService, public authService: AuthService) { }

    ngOnInit(): void {
        this.loadCompromisos();
    }

    loadCompromisos(): void {
        this.loading = true;
        this.error = null;
        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                this.compromisos = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar compromisos:', err);
                this.error = 'No se pudieron cargar los compromisos. Intenta de nuevo más tarde.';
                this.loading = false;
            }
        });
    }

    deleteCompromiso(codigo: string): void {
        if (confirm(`¿Estás seguro de que quieres eliminar el compromiso con código ${codigo}?`)) {
            this.compromisosService.deleteCompromiso(codigo).subscribe({
                next: () => {
                    this.compromisos = this.compromisos.filter(c => c.codigo !== codigo);
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
