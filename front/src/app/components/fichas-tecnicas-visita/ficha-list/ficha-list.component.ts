import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompromisosService } from '../../../services/compromisos.service';
import { FichaTecnicaVisita } from '../../../models/ficha-tecnica-visita.model';
import { FormsModule } from '@angular/forms';

declare const docx: any;
declare const saveAs: any;

@Component({
    selector: 'app-ficha-list',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, FormsModule],
    templateUrl: './ficha-list.component.html',
    styleUrls: ['./ficha-list.component.css']
})
export class FichaTecnicaVisitaListComponent implements OnInit {
    fichas: FichaTecnicaVisita[] = [];
    municipio: string | null = null;
    loading: boolean = true;
    error: string | null = null;
    provincias: string[] = [];
    municipios: string[] = [];
    selectedProvincia: string = '';
    selectedMunicipio: string = '';

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
        this.loadProvinciasAndMunicipios();
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

    loadProvinciasAndMunicipios(): void {
        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                this.provincias = [...new Set(data.map(c => c.provincia).filter(p => p) as string[])];
                this.municipios = [...new Set(data.map(c => c.municipio).filter(m => m) as string[])];
            },
            error: (err) => {
                console.error('Error al cargar provincias y municipios:', err);
            }
        });
    }

    onProvinciaChange(): void {
        if (this.selectedProvincia) {
            this.compromisosService.getCompromisos().subscribe({
                next: (data) => {
                    this.municipios = [...new Set(data.filter(c => c.provincia === this.selectedProvincia).map(c => c.municipio).filter(m => m) as string[])];
                    this.selectedMunicipio = '';
                    this.fichas = [];
                },
                error: (err) => {
                    console.error('Error al cargar municipios por provincia:', err);
                }
            });
        } else {
            this.loadProvinciasAndMunicipios();
            this.fichas = [];
        }
    }

    onMunicipioChange(): void {
        if (this.selectedMunicipio) {
            this.loadFichas(this.selectedMunicipio);
        } else {
            this.fichas = [];
        }
    }

    generarReportePorMunicipio(): void {
        if (!this.selectedMunicipio) {
            alert('Por favor, seleccione un municipio.');
            return;
        }

        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                const compromisosMunicipio = data.filter(c => c.municipio === this.selectedMunicipio);
                if (compromisosMunicipio.length === 0) {
                    alert('No hay compromisos para el municipio seleccionado.');
                    return;
                }

                const doc = new docx.Document({
                    sections: [{
                        properties: {},
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        text: `Reporte de Compromisos para ${this.selectedMunicipio}`,
                                        bold: true,
                                        size: 28,
                                    }),
                                ],
                                alignment: docx.AlignmentType.CENTER,
                            }),
                            ...compromisosMunicipio.map(c =>
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({ text: `Código: ${c.codigo}`, bold: true }),
                                        new docx.TextRun({ text: `\nCompromiso: ${c.compromiso_especifico}` }),
                                        new docx.TextRun({ text: `\nTema: ${c.tema}` }),
                                        new docx.TextRun({ text: `\nEstado: ${c.estado}` }),
                                    ],
                                    spacing: { after: 200 },
                                })
                            )
                        ],
                    }],
                });

                docx.Packer.toBlob(doc).then((blob: any) => {
                    saveAs(blob, `Reporte_${this.selectedMunicipio}.docx`);
                });
            },
            error: (err) => {
                console.error('Error al generar el reporte:', err);
                alert('No se pudo generar el reporte.');
            }
        });
    }

    generarReporteResumen(): void {
        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                if (data.length === 0) {
                    alert('No hay compromisos para generar un resumen.');
                    return;
                }

                const doc = new docx.Document({
                    sections: [{
                        properties: {},
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        text: 'Reporte de Resumen de Compromisos',
                                        bold: true,
                                        size: 28,
                                    }),
                                ],
                                alignment: docx.AlignmentType.CENTER,
                            }),
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        text: `Total de compromisos: ${data.length}`,
                                        size: 24,
                                    }),
                                ],
                            }),
                            ...data.map(c =>
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({ text: `Código: ${c.codigo}`, bold: true }),
                                        new docx.TextRun({ text: `\nCompromiso: ${c.compromiso_especifico}` }),
                                        new docx.TextRun({ text: `\nTema: ${c.tema}` }),
                                        new docx.TextRun({ text: `\nEstado: ${c.estado}` }),
                                    ],
                                    spacing: { after: 200 },
                                })
                            )
                        ],
                    }],
                });

                docx.Packer.toBlob(doc).then((blob: any) => {
                    saveAs(blob, 'Reporte_Resumen_Compromisos.docx');
                });
            },
            error: (err) => {
                console.error('Error al generar el reporte de resumen:', err);
                alert('No se pudo generar el reporte de resumen.');
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
