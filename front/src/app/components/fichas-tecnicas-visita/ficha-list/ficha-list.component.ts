import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { CompromisosService } from '../../../services/compromisos.service';
import { FichaTecnicaVisita } from '../../../models/ficha-tecnica-visita.model';
import { FormsModule } from '@angular/forms';
import * as docx from 'docx';
import { saveAs } from 'file-saver';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
    selector: 'app-ficha-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, NgFor, HeaderComponent, FooterComponent],
    templateUrl: './ficha-list.component.html',
    styleUrls: ['./ficha-list.component.css']
})
export class FichaTecnicaVisitaListComponent implements OnInit {
    fichas: FichaTecnicaVisita[] = [];
    municipio: string | null = null;
    loading: boolean = true;
    error: string | null = null;
    provinciasList: any[] = [
        {
            "NOMBRE_PROVINCIA": "ALMEIDAS",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Chocontá", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Machetá", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Manta", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Sesquilé", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Suesca", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Tibirita", "CODIGO_PROVINCIA": 1 },
                { "NOMBRE_MPIO": "Villapinzón", "CODIGO_PROVINCIA": 1 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "ALTO MAGDALENA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Agua De Dios", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Girardot", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Guataquí", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Jerusalén", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Nariño", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Nilo", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Ricaurte", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Tocaima", "CODIGO_PROVINCIA": 2 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "BAJO MAGDALENA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Caparrapí", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Guaduas", "CODIGO_PROVINCIA": 2 },
                { "NOMBRE_MPIO": "Puerto Salgar", "CODIGO_PROVINCIA": 2 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "GUALIVÁ",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Albán", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "La Peña", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "La Vega", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Nimaima", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Nocaima", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Quebradanegra", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "San Francisco", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Sasaima", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Supatá", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Útica", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Vergara", "CODIGO_PROVINCIA": 3 },
                { "NOMBRE_MPIO": "Villeta", "CODIGO_PROVINCIA": 3 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "GUAVIO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Gachala", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Gachetá", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Gama", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Guasca", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Guatavita", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Junín", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "La Calera", "CODIGO_PROVINCIA": 4 },
                { "NOMBRE_MPIO": "Ubalá", "CODIGO_PROVINCIA": 4 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "MAGDALENA CENTRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Beltrán", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "Bituima", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "Chaguaní", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "Guayabal De Síquima", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "Pulí", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "San Juan De Rioseco", "CODIGO_PROVINCIA": 5 },
                { "NOMBRE_MPIO": "Vianí", "CODIGO_PROVINCIA": 5 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "MEDINA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Medina", "CODIGO_PROVINCIA": 6 },
                { "NOMBRE_MPIO": "Paratebueno", "CODIGO_PROVINCIA": 6 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "ORIENTE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Cáqueza", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Chipaque", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Choachí", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Fómeque", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Fosca", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Guayabetal", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Gutiérrez", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Quetame", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Ubaque", "CODIGO_PROVINCIA": 7 },
                { "NOMBRE_MPIO": "Une", "CODIGO_PROVINCIA": 7 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "RIONEGRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "El Peñón", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "La Palma", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "Pacho", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "Paime", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "San Cayetano", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "Topaipí", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "Villagómez", "CODIGO_PROVINCIA": 8 },
                { "NOMBRE_MPIO": "Yacopí", "CODIGO_PROVINCIA": 8 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SABANA CENTRO",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Cajicá", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Chía", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Cogua", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Gachancipá", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Nemocón", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Sopó", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Tabio", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Tocancipá", "CODIGO_PROVINCIA": 9 },
                { "NOMBRE_MPIO": "Zipaquirá", "CODIGO_PROVINCIA": 9 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SABANA OCCIDENTE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Bojacá", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Cota", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "El Rosal", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Facatativá", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Funza", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Madrid", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Mosquera", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Subachoque", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Tenjo", "CODIGO_PROVINCIA": 10 },
                { "NOMBRE_MPIO": "Zipacón", "CODIGO_PROVINCIA": 10 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SOACHA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Sibaté", "CODIGO_PROVINCIA": 11 },
                { "NOMBRE_MPIO": "Soacha", "CODIGO_PROVINCIA": 11 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "SUMAPAZ",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Arbeláez", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Cabrera", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Fusagasugá", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Granada", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Pandi", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Pasca", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "San Bernardo", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Silvania", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Tibacuy", "CODIGO_PROVINCIA": 12 },
                { "NOMBRE_MPIO": "Venecia", "CODIGO_PROVINCIA": 12 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "TEQUENDAMA",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Anapoima", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Anolaima", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Apulo", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Cachipay", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "El Colegio", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "La Mesa", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Quipile", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "San Antonio De Tequendama", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Tena", "CODIGO_PROVINCIA": 13 },
                { "NOMBRE_MPIO": "Viotá", "CODIGO_PROVINCIA": 13 }
            ]
        },
        {
            "NOMBRE_PROVINCIA": "UBATE",
            "MUNICIPIOS": [
                { "NOMBRE_MPIO": "Carmen De Carupa", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Cucunubá", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Fúquene", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Guachetá", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Lenguazaque", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Simijaca", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Susa", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Sutatausa", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Tausa", "CODIGO_PROVINCIA": 14 },
                { "NOMBRE_MPIO": "Ubaté", "CODIGO_PROVINCIA": 14 }
            ]
        }
    ];

    provincias: string[] = [];
    municipios: string[] = [];
    selectedProvincia: string = '';
    selectedMunicipio: string = '';

    successMessage: string | null = null;
    errorMessage: string | null = null;

    priorityOrder = [
        'ICCU', 'IDACO', 'SALUD', 'EDUCACION', 'AGROCAMPESINADO', 'ACODER',
        'BIENESTAR VERDE', 'EPC', 'IDECUT', 'INDEPORTES', 'MINAS', 'VIVIENDA',
        'DE LO SOCIAL Y LA FAMILIA', 'UAEGRD', 'MUJER', 'TRANSFORMACION DIGITAL',
        'CIENCIA', 'IPYBAC', 'GOBIERNO'
    ];

    constructor(
        private route: ActivatedRoute,
        private compromisosService: CompromisosService
    ) { }

    ngOnInit(): void {
        this.loadProvinciasAndMunicipios();
    }



    loadProvinciasAndMunicipios(): void {
        this.provincias = this.provinciasList.map(p => p.NOMBRE_PROVINCIA);
        // Initially load all municipalities? Or wait for selection? 
        // Let's load ALL for now to match flexible filtering or just keep empty until province selected.
        // If we want "All" behavior, we might want all municipios.
        // Let's flatten all municipios for the initial list if no province selected.
        this.municipios = this.provinciasList.flatMap(p => p.MUNICIPIOS.map((m: any) => m.NOMBRE_MPIO)).sort();
    }

    onProvinciaChange(): void {
        if (this.selectedProvincia) {
            const provincia = this.provinciasList.find(p => p.NOMBRE_PROVINCIA === this.selectedProvincia);
            if (provincia) {
                this.municipios = provincia.MUNICIPIOS.map((m: any) => m.NOMBRE_MPIO);
            } else {
                this.municipios = [];
            }
            this.selectedMunicipio = '';
            this.fichas = [];
        } else {
            this.loadProvinciasAndMunicipios();
            this.fichas = [];
        }
    }

    onMunicipioChange(): void {
    }

    async generarReportePorMunicipio() {
        if (!this.selectedMunicipio) {
            alert('Por favor, seleccione un municipio.');
            return;
        }

        this.compromisosService.getCompromisos().subscribe({
            next: async (data) => {
                const compromisosMunicipio = data.filter(c => this.normalizeText(c.municipio).includes(this.normalizeText(this.selectedMunicipio)) && (c.numero_documento != null && c.numero_documento != ""));

                this.sortCompromisos(compromisosMunicipio);

                console.log(data)
                console.log(compromisosMunicipio)
                if (compromisosMunicipio.length === 0) {
                    this.showError('No hay compromisos para el municipio seleccionado.');
                    return;
                }
                this.compromisosService.getImageAsArrayBuffer('./assets/logo-gobernacion.png').subscribe({
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
                                                text: ``,
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
                                                text: ``,
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
                                                                            text: `${c.detalle_especifico || 'No hay información'}`, bold: true, break: 1,
                                                                            font: 'Arial',
                                                                            size: 26
                                                                        }),
                                                                        new docx.TextRun({
                                                                            text: `Numero Contrato: ${c.numero_documento}`,
                                                                            font: 'Arial',
                                                                            size: 26,
                                                                            break: 1
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
                                                                            text: `Tipo de Contrato: ${c.tipo_documento || 'No hay información'}`, break: 1,
                                                                            font: 'Arial',
                                                                            size: 26
                                                                        }),
                                                                        new docx.TextRun({
                                                                            text: `Detalle Especifico: ${c.detalle_especifico || 'No hay información'}`, break: 1,
                                                                            font: 'Arial',
                                                                            size: 26
                                                                        }),
                                                                        new docx.TextRun({
                                                                            text: `Valor del Contrato: ${c.valor_documento || 'No hay información'}`, break: 1,
                                                                            font: 'Arial',
                                                                            size: 26
                                                                        }),
                                                                        new docx.TextRun({
                                                                            text: `Objeto de Contrato: ${c.objeto_documento || 'No hay información'}`, break: 1,
                                                                            font: 'Arial',
                                                                            size: 26
                                                                        }),
                                                                        new docx.TextRun({
                                                                            text: `Estado: ${c.estado || 'No hay información'}`, break: 1,
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
                            this.showSuccess('El reporte seleccionado se ha descargado exitosamente y esta listo para ser usado.');
                        });
                    }
                })


            },
            error: (err) => {
                console.error('Error al generar el reporte:', err);
                this.showError('No se pudo generar el reporte. Inténtelo de nuevo.');
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
                data = data.filter(c => this.normalizeText(c.municipio) === this.normalizeText(this.selectedMunicipio) && (c.numero_documento != null && c.numero_documento != ""));
                this.sortCompromisos(data);
                if (data.length === 0) {
                    this.showError('No hay compromisos para generar un resumen.');
                    return;
                }
                this.compromisosService.getImageAsArrayBuffer('./assets/logo-gobernacion.png').subscribe({
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

                                                new docx.TextRun({ text: `Numero Contrato: ${c.numero_documento}`, bold: true, font: 'Arial', size: 26, break: 1 }),

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
                            this.showSuccess('El reporte de resumen se ha descargado exitosamente.');
                        });
                    }
                })
            },
            error: (err) => {
                console.error('Error al generar el reporte de resumen:', err);
                this.showError('No se pudo generar el reporte de resumen.');
            }
        });
    }



    sortCompromisos(list: any[]) {
        list.sort((a, b) => {
            const indexA = this.priorityOrder.indexOf(a.entidad);
            const indexB = this.priorityOrder.indexOf(b.entidad);

            const valA = indexA === -1 ? 999 : indexA;
            const valB = indexB === -1 ? 999 : indexB;

            if (valA !== valB) {
                return valA - valB;
            }

            // Secondary sort: Value Descending
            const valueA = parseFloat(a.valor_documento) || 0;
            const valueB = parseFloat(b.valor_documento) || 0;
            return valueB - valueA;
        });
    }

    /** Normalize text: uppercase + strip diacritics (áéíóú → AEIOU) */
    private normalizeText(text: string): string {
        if (!text) return '';
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
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
    showSuccess(msg: string) {
        this.successMessage = msg;
        this.errorMessage = null;
        setTimeout(() => this.successMessage = null, 5000);
    }

    showError(msg: string) {
        this.errorMessage = msg;
        this.successMessage = null;
        setTimeout(() => this.errorMessage = null, 5000);
    }

    clearFilters() {
        this.selectedProvincia = '';
        this.selectedMunicipio = '';
        this.fichas = [];
        this.loadProvinciasAndMunicipios();
    }
}

