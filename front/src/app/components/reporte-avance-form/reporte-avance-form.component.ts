// src/app/components/reporte-avance-form/reporte-avance-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompromisosService } from '../../services/compromisos.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-reporte-avance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './reporte-avance-form.component.html',
  styleUrls: ['./reporte-avance-form.component.css']
})
export class ReporteAvanceFormComponent implements OnInit {
  reporteForm: FormGroup;
  isEditMode: boolean = false;
  reporteId: number | null = null;
  compromisoCodigo: any | null = null;
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  imagenFile: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  fileBase64: string | null = null;
  isPdf: boolean = false;

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

  compromisoNombre: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      if (this.router.url.includes('/reportes-avance/editar/')) {
        // Editing an existing report
        this.isEditMode = true;
        this.reporteId = +idParam;
        this.loadReporteAvance(this.reporteId);
        this.reporteForm.get('compromiso_codigo')?.disable();
        this.reporteForm.get('mes_reporte')?.disable();
      } else if (this.router.url.includes('/compromisos/')) {
        // Creating a new report for a compromiso
        const compromisoId = +idParam;
        this.compromisosService.getCompromisoById(compromisoId).subscribe({
          next: (compromiso) => {
            if (compromiso && compromiso.codigo) {
              this.compromisoCodigo = compromiso.id;
              this.compromisoNombre = compromiso.compromiso_especifico || 'Sin nombre';
              this.reporteForm.patchValue({ compromiso_codigo: this.compromisoCodigo });
              this.reporteForm.get('compromiso_codigo')?.disable();
              this.loadLatestReport(this.compromisoCodigo);
            } else {
              this.error = 'El compromiso seleccionado no tiene un código, por lo que no se pueden agregar reportes de avance.';
              this.reporteForm.disable();
            }
          },
          error: (err) => {
            console.error('Error al cargar el compromiso:', err);
            this.error = 'No se pudo cargar el compromiso para crear el reporte.';
            this.reporteForm.disable();
          }
        });
      }
    } else {
      this.error = 'No se proporcionó un ID en la ruta.';
      this.reporteForm.disable();
    }
  }

  loadLatestReport(codigo: string): void {
    this.compromisosService.getReportesAvance(codigo).subscribe({
      next: (reportes) => {
        if (reportes && reportes.length > 0) {
          // Ordenar por fecha para asegurarse de que el último es el más reciente
          const latestReport = reportes.sort((a, b) => new Date(b.mes_reporte).getTime() - new Date(a.mes_reporte).getTime())[0];
          this.reporteForm.patchValue({
            reporte_avance_fisico: latestReport.reporte_avance_fisico,
            reporte_avance_financiero: latestReport.reporte_avance_financiero
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar el último reporte de avance:', err);
        // No se considera un error fatal, el formulario puede usarse con valores por defecto.
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (input.files[0].size > 10 * 1024 * 1024) {
        this.error = 'El archivo supera el límite de 10MB.';
        this.imagenFile = null;
        this.fileBase64 = null;
        this.imagenPreview = null;
        input.value = '';
        return;
      }

      this.error = null;
      this.imagenFile = input.files[0];
      this.isPdf = this.imagenFile.type === 'application/pdf';

      const reader = new FileReader();
      reader.onload = () => {
        this.fileBase64 = reader.result as string;
        if (!this.isPdf) {
          this.imagenPreview = this.fileBase64;
        } else {
          this.imagenPreview = null;
        }
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

    // Send as JSON
    const rawValue = this.reporteForm.getRawValue();
    const payload: any = {
      ...rawValue
    };

    // If new file selected, send as base64
    if (this.fileBase64) {
      payload.imagen = this.fileBase64;
    }

    // Remove imagen_url if it exists in rawValue but is empty or not needed
    // (Assuming backend doesn't expect it if we are uploading a new image)
    delete payload.imagen_url;

    if (this.isEditMode && this.reporteId) {
      this.compromisosService.updateReporteAvance(this.reporteId, payload).subscribe({
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
      this.compromisosService.createReporteAvance(payload).subscribe({
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
