import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompromisosService } from '../../../services/compromisos.service';
import { FichaTecnicaVisita } from '../../../models/ficha-tecnica-visita.model';

@Component({
    selector: 'app-ficha-list',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe],
    templateUrl: './ficha-list.component.html',
    styleUrls: ['./ficha-list.component.css']
})
export class FichaTecnicaVisitaListComponent implements OnInit {
    fichas: FichaTecnicaVisita[] = [];
    municipio: string | null = null;
    loading: boolean = true;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private compromisosService: CompromisosService
    ) { }

    ngOnInit(): void {
        this.municipio = this.route.snapshot.paramMap.get('municipio');
        if (this.municipio) {
            this.loadFichas(this.municipio);
        } else {
            this.error = 'No se ha especificado un municipio.';
            this.loading = false;
        }
    }

    loadFichas(municipio: string): void {
        this.loading = true;
        this.error = null;
        this.compromisosService.getFichasTecnicasVisita(municipio).subscribe({
            next: (data) => {
                this.fichas = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar fichas:', err);
                this.error = 'No se pudieron cargar las fichas técnicas. Intenta de nuevo más tarde.';
                this.loading = false;
            }
        });
    }

    deleteFicha(id: number): void {
        if (confirm(`¿Estás seguro de que quieres eliminar esta ficha técnica?`)) {
            this.compromisosService.deleteFichaTecnicaVisita(id).subscribe({
                next: () => {
                    this.fichas = this.fichas.filter(f => f.id !== id);
                    alert('Ficha técnica eliminada exitosamente.');
                },
                error: (err) => {
                    console.error('Error al eliminar ficha:', err);
                    alert('No se pudo eliminar la ficha técnica.');
                }
            });
        }
    }
}
