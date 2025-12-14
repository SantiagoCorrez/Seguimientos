// src/app/components/compromiso-form/compromiso-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { Compromiso } from '../../models/compromiso';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-compromiso-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
    templateUrl: './compromiso-form.component.html',
    styleUrls: ['./compromiso-form.component.css']
})
export class CompromisoFormComponent implements OnInit {
    compromisoForm: FormGroup;
    isEditMode: boolean = false;
    compromisoId: number | null = null;
    loading: boolean = false;
    error: string | null = null;
    success: string | null = null;

    currentStep: number = 1;
    totalSteps: number = 4;
    fileName: string = '';

    // Data for dropdowns
    provinciasList: any[] = [
        {
            "NOMBRE_PROVINCIA": "ALMEIDAS",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "CHOCONTÁ", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "MACHETÁ", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "MANTA", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "SESQUILÉ", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "SUESCA", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "TIBIRITA", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "VILLAPINZÓN", "CODIGO_PROVINCIA": 1 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "ALTO MAGDALENA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "AGUA DE DIOS", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "GIRARDOT", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "GUATAQUÍ", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "JERUSALÉN", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "NARIÑO", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "NILO", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "RICAURTE", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "TOCAIMA", "CODIGO_PROVINCIA": 2 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "BAJO MAGDALENA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "CAPARRAPÍ", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "GUADUAS", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "PUERTO SALGAR", "CODIGO_PROVINCIA": 2 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "GUALIVÁ",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "ALBÁN", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "LA PEÑA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "LA VEGA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "NIMAIMA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "NOCAIMA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "QUEBRADANEGRA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "SAN FRANCISCO", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "SASAIMA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "SUPATÁ", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "ÚTICA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "VERGARA", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "VILLETA", "CODIGO_PROVINCIA": 3 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "GUAVIO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "GACHALA", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "GACHETÁ", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "GAMA", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "GUASCA", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "GUATAVITA", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "JUNÍN", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "LA CALERA", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "UBALÁ", "CODIGO_PROVINCIA": 4 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "MAGDALENA CENTRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "BELTRÁN", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "BITUIMA", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "CHAGUANÍ", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "GUAYABAL DE SÍQUIMA", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "PULÍ", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "SAN JUAN DE RIOSECO", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "VIANÍ", "CODIGO_PROVINCIA": 5 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "MEDINA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "MEDINA", "CODIGO_PROVINCIA": 6 },
                { "NOMBRE_MPIO": "PARATEBUENO", "CODIGO_PROVINCIA": 6 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "ORIENTE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "CÁQUEZA", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "CHIPAQUE", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "CHOACHÍ", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "FÓMEQUE", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "FOSCA", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "GUAYABETAL", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "GUTIÉRREZ", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "QUETAME", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "UBAQUE", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "UNE", "CODIGO_PROVINCIA": 7 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "RIONEGRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "EL PEÑÓN", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "LA PALMA", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "PACHO", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "PAIME", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "SAN CAYETANO", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "TOPAIPÍ", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "VILLAGÓMEZ", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "YACOPÍ", "CODIGO_PROVINCIA": 8 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SABANA CENTRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "CAJICÁ", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "CHÍA", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "COGUA", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "GACHANCIPÁ", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "NEMOCÓN", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "SOPÓ", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "TABIO", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "TOCANCIPÁ", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "ZIPAQUIRÁ", "CODIGO_PROVINCIA": 9 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SABANA OCCIDENTE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "BOJACÁ", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "COTA", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "EL ROSAL", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "FACATATIVÁ", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "FUNZA", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "MADRID", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "MOSQUERA", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "SUBACHOQUE", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "TENJO", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "ZIPACÓN", "CODIGO_PROVINCIA": 10 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SOACHA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "SIBATÉ", "CODIGO_PROVINCIA": 11 },
                { "NOMBRE_MPIO": "SOACHA", "CODIGO_PROVINCIA": 11 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SUMAPAZ",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "ARBELÁEZ", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "CABRERA", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "FUSAGASUGÁ", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "GRANADA", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "PANDI", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "PASCA", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "SAN BERNARDO", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "SILVANIA", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "TIBACUY", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "VENECIA", "CODIGO_PROVINCIA": 12 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "TEQUENDAMA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "ANAPOIMA", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "ANOLAIMA", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "APULO", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "CACHIPAY", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "EL COLEGIO", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "LA MESA", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "QUIPILE", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "SAN ANTONIO DE TEQUENDAMA", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "TENA", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "VIOTÁ", "CODIGO_PROVINCIA": 13 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "UBATE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "CARMEN DE CARUPA", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "CUCUNUBÁ", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "FÚQUENE", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "GUACHETÁ", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "LENGUAZAQUE", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "SIMIJACA", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "SUSA", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "SUTATAUSA", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "TAUSA", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "UBATÉ", "CODIGO_PROVINCIA": 14 }
            ]
        }
    ];

    // Simplified lists for other dropdowns
    entidadesLider: string[] = [];


    provincias: string[] = [];
    municipios: string[] = [];

    constructor(
        private fb: FormBuilder,
        private compromisosService: CompromisosService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.compromisoForm = this.fb.group({
            // Step 1
            codigo: ['', Validators.required],
            provincia: ['', Validators.required],
            municipio: ['', Validators.required],
            entidad: ['', Validators.required],
            prioridad: ['', Validators.required],
            estado: ['', Validators.required],
            fecha_estimada_inicio: ['', Validators.required],
            fecha_estimada_finalizacion: ['', Validators.required],
            compromiso_especifico: ['', Validators.required],
            bien_o_servicio_entregado: ['', Validators.required],
            // Step 2
            tema: [''],
            subtema: [''],
            entidades_aliadas: [''],
            detalle_especifico: [''],
            accion_adelantada: [''],
            dificultades: [''],
            alternativas_de_solucion: [''],
            observaciones: [''],
            meta_del_plan_de_desarrollo: [''],
            descripcion_meta_producto: [''],
            nuevo_compromiso: [''],
            acciones_pendientes: [''],
            el_compromiso_fue_modificado: [false],
            se_dara_cumplimiento_al_compromiso: [false],
            dispone_del_presupuesto: [false],
            se_requiere_apoyo_despacho: [false],

            // Step 3
            valor_total: [0], // Calculated or input?
            aporte_departamento: [0],
            aporte_municipio: [0],
            aporte_nacion: [0],
            otro_aporte: [0],
            fuente_cofinanciacion: [''],

            // Step 4
            tipo_documento: [''],
            numero_documento: [''],
            objeto_documento: [''],
            valor_documento: [0]
        });
    }

    ngOnInit(): void {
        this.loadProvincias();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.compromisoId = +id;
            this.loadCompromiso(this.compromisoId);
        }
        this.userService.getSecretarias().subscribe(data => {
            this.entidadesLider = data;
        });
    }

    loadProvincias() {
        // In a real app, this might come from a service. 
        // We initialize with the provided JSON structure.
        this.provincias = this.provinciasList.map(p => p.NOMBRE_PROVINCIA);
    }

    onProvinciaChange() {
        const selectedProv = this.compromisoForm.get('provincia')?.value;
        const provinciaData = this.provinciasList.find(p => p.NOMBRE_PROVINCIA === selectedProv);
        if (provinciaData) {
            this.municipios = provinciaData.MUNICIPIOS.map((m: any) => m.NOMBRE_MPIO);
            this.compromisoForm.patchValue({ municipio: '' });
        } else {
            this.municipios = [];
        }
    }

    loadCompromiso(id: number): void {
        this.loading = true;
        this.compromisosService.getCompromisoById(id).subscribe({
            next: (data) => {
                this.compromisoForm.patchValue({
                    ...data,
                    fecha_estimada_inicio: data.fecha_estimada_inicio ? new Date(data.fecha_estimada_inicio).toISOString().substring(0, 10) : '',
                    fecha_estimada_finalizacion: data.fecha_estimada_finalizacion ? new Date(data.fecha_estimada_finalizacion).toISOString().substring(0, 10) : ''
                });
                // Trigger municipality load
                this.onProvinciaChange();
                this.compromisoForm.patchValue({ municipio: data.municipio }); // Set municipio after loading list
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar compromiso:', err);
                this.error = 'No se pudo cargar el compromiso.';
                this.loading = false;
            }
        });
    }

    get step1Valid(): boolean {
        const fields = ['codigo', 'provincia', 'municipio', 'entidad', 'prioridad', 'estado', 'fecha_estimada_inicio', 'fecha_estimada_finalizacion', 'compromiso_especifico', 'bien_o_servicio_entregado'];
        return fields.every(f => this.compromisoForm.get(f)?.valid);
    }

    nextStep() {
        if (this.currentStep === 1 && !this.step1Valid) {
            this.compromisoForm.markAllAsTouched();
            this.error = 'Por favor completa todos los campos obligatorios del paso 1.';
            return;
        }
        this.error = null;
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            // Here you would upload the file or append it to FormData
        }
    }

    onSubmit(): void {
        if (this.compromisoForm.invalid) {
            this.error = 'Por favor, completa todos los campos requeridos.';
            this.compromisoForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const compromisoData: Compromiso = {
            ...this.compromisoForm.getRawValue()
        };

        const request$ = this.isEditMode && this.compromisoId
            ? this.compromisosService.updateCompromisoById(this.compromisoId, compromisoData)
            : this.compromisosService.createCompromiso(compromisoData);

        request$.subscribe({
            next: () => {
                this.success = this.isEditMode ? 'Compromiso actualizado.' : 'Compromiso creado.';
                this.loading = false;
                setTimeout(() => this.router.navigate(['/compromisos']), 1500);
            },
            error: (err) => {
                console.error('Error:', err);
                this.error = 'Ocurrió un error al guardar el compromiso.';
                this.loading = false;
            }
        });
    }
}
