// src/app/components/reporte-avance-form/reporte-avance-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { ReporteAvance } from '../../models/reporte-avance';

@Component({
  selector: 'app-reporte-avance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporte-avance-form.component.html',
  styleUrls: ['./reporte-avance-form.component.css']
})
export class ReporteAvanceFormComponent implements OnInit {
  reporteForm: FormGroup;
  isEditMode: boolean = false;
  reporteId: number | null = null;
  compromisoCodigo: string | null = null;
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private compromisosService: CompromisosService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.reporteForm = this.fb.group({
      compromiso_codigo: ['', Validators.required],
      mes_reporte: ['', Validators.required], // Formato YYYY-MM-DD
      reporte_avance_fisico: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      reporte_avance_financiero: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      observaciones_reporte: [''],
      imagen_url: ['']
    });
  }

  ngOnInit(): void {
    this.compromisoCodigo = this.route.snapshot.paramMap.get('codigo'); // Obtener de la URL para crear
    const idParam = this.route.snapshot.paramMap.get('id'); // Obtener de la URL para editar

    if (idParam) {
      this.isEditMode = true;
      this.reporteId = +idParam; // Convertir a número
      this.loadReporteAvance(this.reporteId);
      this.reporteForm.get('compromiso_codigo')?.disable(); // Deshabilitar en edición
      this.reporteForm.get('mes_reporte')?.disable(); // Deshabilitar en edición
    } else if (this.compromisoCodigo) {
      this.reporteForm.patchValue({ compromiso_codigo: this.compromisoCodigo });
      this.reporteForm.get('compromiso_codigo')?.disable(); // Deshabilitar para que no se cambie
    } else {
      this.error = 'No se pudo determinar el compromiso asociado.';
    }
  }
  imagenFile: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenFile = input.files[0];

      // Vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(this.imagenFile);
    }
  }
  loadReporteAvance(id: number): void {
    this.loading = true;
    this.compromisosService.getReporteAvanceById(id).subscribe({
      next: (data) => {
        this.reporteForm.patchValue({
          ...data,
          mes_reporte: data.mes_reporte ? new Date(data.mes_reporte).toISOString().substring(0, 10) : ''
        });
        this.compromisoCodigo = data.compromiso_codigo; // Asegurar que tenemos el código del compromiso
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reporte de avance para edición:', err);
        this.error = 'No se pudo cargar el reporte de avance para edición.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.error = null;
    this.success = null;
    if (this.reporteForm.invalid) {
      this.error = 'Por favor, completa todos los campos requeridos y verifica los porcentajes.';
      this.reporteForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Usar FormData para enviar archivo + datos
    const formData = new FormData();
    const rawValue = this.reporteForm.getRawValue();
    Object.keys(rawValue).forEach(key => {
      if (key !== 'imagen') {
        formData.append(key, rawValue[key]);
      }
    });
    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    if (this.isEditMode && this.reporteId) {
      this.compromisosService.updateReporteAvance(this.reporteId, formData).subscribe({
        next: () => {
          this.success = 'Reporte de avance actualizado exitosamente.';
          this.loading = false;
          this.router.navigate(['/compromisos', this.compromisoCodigo]);
        },
        error: (err) => {
          console.error('Error al actualizar reporte de avance:', err);
          this.error = 'Error al actualizar el reporte de avance. Intenta de nuevo.';
          this.loading = false;
        }
      });
    } else {
      this.compromisosService.createReporteAvance(formData).subscribe({
        next: (newReporte) => {
          this.success = 'Reporte de avance creado exitosamente.';
          this.loading = false;
          this.router.navigate(['/compromisos', newReporte.compromiso_codigo]);
        },
        error: (err) => {
          console.error('Error al crear reporte de avance:', err);
          this.error = 'Error al crear el reporte de avance. Asegúrate de que no exista un reporte para este mes.';
          this.loading = false;
        }
      });
    }
  }
}
