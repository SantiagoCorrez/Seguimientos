import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompromisosService } from '../../../services/compromisos.service';
import { FichaTecnicaVisita } from '../../../models/ficha-tecnica-visita.model';
import { FormsModule } from '@angular/forms';
import * as docx from 'docx';
import { saveAs } from 'file-saver';
import * as xml2js from 'xml2js';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
    selector: 'app-ficha-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgFor, HeaderComponent,FooterComponent],
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

    async generarReportePorMunicipio() {
        if (!this.selectedMunicipio) {
            alert('Por favor, seleccione un municipio.');
            return;
        }

        this.compromisosService.getCompromisos().subscribe({
            next: async (data) => {
                const compromisosMunicipio = data.filter(c => c.municipio === this.selectedMunicipio);
                if (compromisosMunicipio.length === 0) {
                    alert('No hay compromisos para el municipio seleccionado.');
                    return;
                }
                let result: any;
                let xmlData: string = '';
                await this.compromisosService.getInfoWikipedia(this.selectedMunicipio.toLowerCase().replace(/\s/g, '%20')).subscribe(
                    {
                        next: (wikiData) => {
                            xmlData = wikiData.parse.parsetree;
                            console.log(xmlData);
                            xml2js.parseString(xmlData, { explicitArray: false, ignoreAttrs: false, trim: false }, (err, data) => {
                                if (err) {
                                    console.error('Error parsing XML:', err);
                                    return;
                                }
                                result = data;
                                console.log(result);

                                this.compromisosService.getImageAsArrayBuffer('./assets/logo-gobernacion.jpg').subscribe({
                                    next: (imageBuffer) => {
                                        const img = new docx.ImageRun(
                                            {
                                                type: 'png',
                                                data: imageBuffer,
                                                transformation:
                                                {
                                                    width: 400,
                                                    height: 100
                                                }
                                            }
                                        )
                                        const doc = new docx.Document({
                                            sections: [{
                                                properties: {},
                                                headers: {
                                                    default: new docx.Header({
                                                        children: [
                                                            new docx.Paragraph({
                                                                children: [
                                                                    img
                                                                ],
                                                                alignment: docx.AlignmentType.CENTER,
                                                            }),
                                                        ],
                                                    }),
                                                },
                                                children: [
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `${this.selectedMunicipio} #`,
                                                                bold: true,
                                                                size: 32,
                                                                font: 'Arial',
                                                            })
                                                        ],
                                                        alignment: docx.AlignmentType.CENTER,
                                                    }),
                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Compromisos: ${compromisosMunicipio.length}`,
                                                                size: 36,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.RIGHT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Fecha visita Nos Comprometemos A:  `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Alcalde: `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                            new docx.TextRun({
                                                                text: `${result.root.template[0].part.filter((p: any) => p.name === " dirigentes_nombres ")[0].value.replace("<small>", "").replace("</small>", "") || ''}`,
                                                                size: 28,
                                                                font: 'Arial',
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Candidatos a la Alcaldía:  `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Población:`,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                            new docx.TextRun({
                                                                text: `${result.root.template[0].part.filter((p: any) => p.name === " población ")[0].value || ''}`,
                                                                size: 28,
                                                                font: 'Arial',
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Centro de Salud`,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Gerente: `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Fecha Visita Mesa PDD: `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                    new docx.Paragraph({}),
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `Temperatura promedio: `,
                                                                size: 28,
                                                                font: 'Arial',
                                                                bold: true,
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),

                                                ],
                                            },
                                            {
                                                properties: {
                                                    type: docx.SectionType.NEXT_PAGE
                                                },
                                                headers: {
                                                    default: new docx.Header({
                                                        children: [
                                                            new docx.Paragraph({
                                                                children: [
                                                                    img
                                                                ],
                                                                alignment: docx.AlignmentType.CENTER,
                                                            }),
                                                        ],
                                                    }),
                                                },
                                                children: [
                                                    new docx.Paragraph({
                                                        children: [
                                                            new docx.TextRun({
                                                                text: `1. Proyectos a firmar en territorio`,
                                                                bold: true,
                                                                size: 28,
                                                                font: 'Arial',
                                                            }),
                                                        ],
                                                        alignment: docx.AlignmentType.LEFT,
                                                    }),
                                                    new docx.Table({

                                                        rows: [
                                                            new docx.TableRow({
                                                                children: [
                                                                    new docx.TableCell({
                                                                        children: [new docx.Paragraph({
                                                                            children:
                                                                                [
                                                                                    new docx.TextRun({
                                                                                        text: "Proyecto",
                                                                                        bold: true,
                                                                                        font: 'Arial',
                                                                                        size: 26
                                                                                    })
                                                                                ]
                                                                        })],
                                                                    }),
                                                                    new docx.TableCell({
                                                                        children: [new docx.Paragraph({
                                                                            children:
                                                                                [
                                                                                    new docx.TextRun({
                                                                                        text: "Detalle",
                                                                                        bold: true,
                                                                                        font: 'Arial',
                                                                                        size: 26
                                                                                    })
                                                                                ]
                                                                        })],
                                                                    }),
                                                                ],
                                                            }),
                                                            ...compromisosMunicipio.map(c =>


                                                                new docx.TableRow({
                                                                    children: [
                                                                        new docx.TableCell({
                                                                            children: [
                                                                                new docx.Paragraph({
                                                                                    children: [
                                                                                        new docx.TextRun({
                                                                                            text: `Entidad: ${c.entidad}`, bold: true, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                        new docx.TextRun({
                                                                                            text: `${c.compromiso_especifico||'No hay información'}`, bold: true, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new docx.TableCell({
                                                                            children: [

                                                                                new docx.Paragraph({
                                                                                    children: [
                                                                                        new docx.TextRun({
                                                                                            text: `Tipo de Contrato: ${c.tipo_documento||'No hay información'}`, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                        new docx.TextRun({
                                                                                            text: `Detalle Especifico: ${c.detalle_especifico||'No hay información'}`, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                        new docx.TextRun({
                                                                                            text: `Valor del Contrato: ${c.valor_documento||'No hay información'}`, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                        new docx.TextRun({
                                                                                            text: `Objeto de Contrato: ${c.objeto_documento||'No hay información'}`, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),
                                                                                        new docx.TextRun({
                                                                                            text: `Estado: ${c.estado||'No hay información'}`, break: 1,
                                                                                            font: 'Arial',
                                                                                            size: 26
                                                                                        }),

                                                                                    ]
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            )
                                                        ]
                                                    }),



                                                ]
                                            }],
                                        });

                                        docx.Packer.toBlob(doc).then((blob: any) => {
                                            saveAs(blob, `Reporte_${this.selectedMunicipio}.docx`);
                                        });
                                    }
                                })
                            });

                        }
                    }
                );

            },
            error: (err) => {
                console.error('Error al generar el reporte:', err);
                alert('No se pudo generar el reporte.');
            }
        });
    }

    generarReporteResumen(): void {
        if (!this.selectedMunicipio) {
            alert('Por favor, seleccione un municipio.');
            return;
        }

        this.compromisosService.getCompromisos().subscribe({
            next: (data) => {
                data = data.filter(c => c.municipio === this.selectedMunicipio);
                if (data.length === 0) {
                    alert('No hay compromisos para generar un resumen.');
                    return;
                }
                this.compromisosService.getImageAsArrayBuffer('./assets/logo-gobernacion.jpg').subscribe({
                    next: (imageBuffer) => {
                        const img = new docx.ImageRun(
                            {
                                type: 'png',
                                data: imageBuffer,
                                transformation:
                                {
                                    width: 400,
                                    height: 100
                                }
                            }
                        )
                        const doc = new docx.Document({
                            sections: [{
                                properties: {},
                                headers: {
                                    default: new docx.Header({
                                        children: [
                                            new docx.Paragraph({
                                                children: [
                                                    img
                                                ],
                                                alignment: docx.AlignmentType.CENTER,
                                            }),
                                        ],
                                    }),
                                },
                                children: [
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                text: 'Reporte de Resumen de Compromisos',
                                                bold: true,
                                                size: 28,
                                                font: 'Arial',
                                            }),
                                        ],
                                        alignment: docx.AlignmentType.CENTER,
                                    }),
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                text: `Total de compromisos: ${data.length}`,
                                                size: 24,
                                                font: 'Arial',
                                            }),
                                        ],
                                    }),
                                    ...data.map(c =>
                                        new docx.Paragraph({
                                            children: [

                                                new docx.TextRun({ text: `Entidad: ${c.entidad}`, bold: true, font: 'Arial', size: 26, break: 1 }),
                                                new docx.TextRun({
                                                    text: `Código: ${c.codigo}`, bold: true,
                                                    font: 'Arial', size: 26, break: 1
                                                }),
                                                new docx.TextRun({
                                                    text: `\nCompromiso: ${c.compromiso_especifico}`,
                                                    font: 'Arial', size: 26, break: 1
                                                }),
                                                new docx.TextRun({
                                                    text: `\nTema: ${c.tema}`,
                                                    font: 'Arial', size: 26, break: 1
                                                }),
                                                new docx.TextRun({
                                                    text: `\nEstado: ${c.estado}`,
                                                    font: 'Arial', size: 26, break: 1
                                                }),
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
                    }
                })
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
