// src/app/components/fichas-tecnicas-visita/ficha-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompromisosService } from '../../../services/compromisos.service';
import { FichaTecnicaVisita } from '../../../models/ficha-tecnica-visita.model';

@Component({
    selector: 'app-ficha-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ficha-form.component.html',
    styleUrls: ['./ficha-form.component.css']
})
export class FichaTecnicaVisitaFormComponent implements OnInit {
    fichaForm: FormGroup;
    isEditMode: boolean = false;
    fichaId: number | null = null;
    municipio: string | null = null;
    loading: boolean = false;
    error: string | null = null;
    success: string | null = null;

    constructor(
        private fb: FormBuilder,
        private compromisosService: CompromisosService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.fichaForm = this.fb.group({
            municipio: ['', Validators.required],
            fecha_visita: ['', Validators.required],
            participantes: [''],
            observaciones: [''],
            recomendaciones: [''],
            url_documento: ['', Validators.pattern('https?://.+')]
        });
    }

    ngOnInit(): void {
        this.municipio = this.route.snapshot.paramMap.get('municipio'); // Para el modo creación
        const idParam = this.route.snapshot.paramMap.get('id'); // Para el modo edición

        if (idParam) {
            this.isEditMode = true;
            this.fichaId = +idParam;
            this.loadFicha(this.fichaId);
            this.fichaForm.get('municipio')?.disable(); // El municipio no se edita
        } else if (this.municipio) {
            this.fichaForm.patchValue({ municipio: this.municipio });
            this.fichaForm.get('municipio')?.disable(); // El municipio no se edita
        } else {
            this.error = 'No se ha especificado un municipio o ID de ficha.';
        }
    }

    loadFicha(id: number): void {
        this.loading = true;
        this.compromisosService.getFichaTecnicaVisitaById(id).subscribe({
            next: (data) => {
                this.fichaForm.patchValue({
                    ...data,
                    fecha_visita: data.fecha_visita ? new Date(data.fecha_visita).toISOString().substring(0, 10) : ''
                });
                this.municipio = data.municipio; // Asegurar que el municipio esté disponible para la redirección
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar ficha para edición:', err);
                this.error = 'No se pudo cargar la ficha para edición.';
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        /* this.error = null;
        this.success = null;
        if (this.fichaForm.invalid) {
            this.error = 'Por favor, completa todos los campos requeridos y verifica el formato de la URL.';
            this.fichaForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const fichaData: FichaTecnicaVisita = {
            ...this.fichaForm.getRawValue() // Usa getRawValue para incluir campos deshabilitados
        };

        if (this.isEditMode && this.fichaId) {
            this.compromisosService.updateFichaTecnicaVisita(this.fichaId, fichaData).subscribe({
                next: () => {
                    this.success = 'Ficha técnica actualizada exitosamente.';
                    this.loading = false;
                    this.router.navigate(['/fichas-tecnicas-visita', this.municipio]);
                },
                error: (err) => {
                    console.error('Error al actualizar ficha:', err);
                    this.error = 'Error al actualizar la ficha. Intenta de nuevo.';
                    this.loading = false;
                }
            });
        } else {
            this.compromisosService.createFichaTecnicaVisita(fichaData).subscribe({
                next: (newFicha) => {
                    this.success = 'Ficha técnica creada exitosamente.';
                    this.loading = false;
                    this.router.navigate(['/fichas-tecnicas-visita', newFicha.municipio]);
                },
                error: (err) => {
                    console.error('Error al crear ficha:', err);
                    this.error = 'Error al crear la ficha. Intenta de nuevo.';
                    this.loading = false;
                }
            });
        } */
    }
}
