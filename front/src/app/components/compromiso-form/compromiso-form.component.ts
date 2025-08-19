// src/app/components/compromiso-form/compromiso-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';

@Component({
    selector: 'app-compromiso-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule,RouterLink],
    templateUrl: './compromiso-form.component.html',
    styleUrls: ['./compromiso-form.component.css']
})
export class CompromisoFormComponent implements OnInit {
    compromisoForm: FormGroup;
    isEditMode: boolean = false;
    compromisoCodigo: string | null = null;
    loading: boolean = false;
    error: string | null = null;
    success: string | null = null;

    constructor(
        private fb: FormBuilder,
        private compromisosService: CompromisosService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.compromisoForm = this.fb.group({
            codigo: ['', Validators.required],
            provincia: ['', Validators.required],
            municipio: ['', Validators.required],
            compromiso_especifico: ['', Validators.required],
            tema: [''],
            subtema: [''],
            detalle_especifico: [''],
            meta_del_plan_de_desarrollo: [''],
            descripcion_meta_producto: [''],
            se_dara_cumplimiento_al_compromiso: [false],
            dispone_del_presupuesto: [false],
            el_compromiso_fue_modificado: [false],
            nuevo_compromiso: [''],
            prioridad: ['Baja', Validators.required], // Valor por defecto
            estado: ['Pendiente', Validators.required], // Valor por defecto
            valor_total: [0, [Validators.required, Validators.min(0)]],
            aporte_departamento: [0, Validators.min(0)],
            aporte_municipio: [0, Validators.min(0)],
            aporte_nacion: [0, Validators.min(0)],
            otro_aporte: [0, Validators.min(0)],
            fuente_cofinanciacion: [''],
            entidad_lider: [''],
            entidades_aliadas: [''],
            tipo_documento: [''],
            numero_documento: [''],
            objeto_documento: [''],
            valor_documento: [0, Validators.min(0)],
            bien_o_servicio_entregado: [''],
            fecha_estimada_inicio: [''],
            fecha_estimada_finalizacion: [''],
            accion_adelantada: [''],
            acciones_pendientes: [''],
            se_requiere_apoyo_despacho: [false],
            dificultades: [''],
            alternativas_de_solucion: [''],
            observaciones: ['']
        });
    }

    ngOnInit(): void {
        this.compromisoCodigo = this.route.snapshot.paramMap.get('codigo');
        if (this.compromisoCodigo) {
            this.isEditMode = true;
            this.compromisoForm.get('codigo')?.disable(); // Deshabilitar el código en modo edición
            this.loadCompromiso(this.compromisoCodigo);
        }
    }

    loadCompromiso(codigo: string): void {
        this.loading = true;
        this.compromisosService.getCompromisoByCodigo(codigo).subscribe({
            next: (data) => {
                this.compromisoForm.patchValue({
                    ...data,
                    fecha_estimada_inicio: data.fecha_estimada_inicio ? new Date(data.fecha_estimada_inicio).toISOString().substring(0, 10) : '',
                    fecha_estimada_finalizacion: data.fecha_estimada_finalizacion ? new Date(data.fecha_estimada_finalizacion).toISOString().substring(0, 10) : ''
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar compromiso para edición:', err);
                this.error = 'No se pudo cargar el compromiso para edición.';
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        this.error = null;
        this.success = null;
        if (this.compromisoForm.invalid) {
            this.error = 'Por favor, completa todos los campos requeridos.';
            this.compromisoForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
            return;
        }

        this.loading = true;
        const compromisoData: Compromiso = {
            ...this.compromisoForm.getRawValue() // Usa getRawValue para incluir campos deshabilitados
        };

        if (this.isEditMode && this.compromisoCodigo) {
            this.compromisosService.updateCompromiso(this.compromisoCodigo, compromisoData).subscribe({
                next: () => {
                    this.success = 'Compromiso actualizado exitosamente.';
                    this.loading = false;
                    this.router.navigate(['/compromisos', this.compromisoCodigo]); // Volver al detalle
                },
                error: (err) => {
                    console.error('Error al actualizar compromiso:', err);
                    this.error = 'Error al actualizar el compromiso. Intenta de nuevo.';
                    this.loading = false;
                }
            });
        } else {
            this.compromisosService.createCompromiso(compromisoData).subscribe({
                next: (newCompromiso) => {
                    this.success = 'Compromiso creado exitosamente.';
                    this.loading = false;
                    this.router.navigate(['/compromisos', newCompromiso.codigo]); // Ir al detalle del nuevo compromiso
                },
                error: (err) => {
                    console.error('Error al crear compromiso:', err);
                    this.error = 'Error al crear el compromiso. Asegúrate de que el código no exista ya.';
                    this.loading = false;
                }
            });
        }
    }
}
