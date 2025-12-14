import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CompromisosService } from '../../services/compromisos.service';
import { HttpClientModule } from '@angular/common/http';
import { AsyncPipe, CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { Feature, Map, MapBrowserEvent, Overlay, View } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import Text from 'ol/style/Text';
import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';
import { defaults as defaultControls } from 'ol/control/defaults';
import Control from 'ol/control/Control';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { getCenter } from 'ol/extent';
import { Point } from 'ol/geom';
import Icon from 'ol/style/Icon';
import { RouterLink } from '@angular/router';
import * as turf from '@turf/turf';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css',
  providers: [CompromisosService],
  imports: [CurrencyPipe, FormsModule, MatAutocompleteModule, ReactiveFormsModule, MatIconModule, MatTableModule, MatPaginatorModule,
    AsyncPipe, DecimalPipe, RouterLink, HeaderComponent, FooterComponent, CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule]
})
export class MapaComponent {
  title = 'iccu';
  provincias =
    [
      {
        "NOMBRE_PROVINCIA": "ALMEIDAS",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Chocontá",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Machetá",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Manta",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Sesquilé",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Suesca",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Tibirita",
            "CODIGO_PROVINCIA": 1
          },
          {
            "NOMBRE_MPIO": "Villapinzón",
            "CODIGO_PROVINCIA": 1
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "ALTO MAGDALENA",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Agua De Dios",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Girardot",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Guataquí",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Jerusalén",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Nariño",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Nilo",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Ricaurte",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Tocaima",
            "CODIGO_PROVINCIA": 2
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "BAJO MAGDALENA",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Caparrapí",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Guaduas",
            "CODIGO_PROVINCIA": 2
          },
          {
            "NOMBRE_MPIO": "Puerto Salgar",
            "CODIGO_PROVINCIA": 2
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "GUALIVÁ",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Albán",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "La Peña",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "La Vega",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Nimaima",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Nocaima",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Quebradanegra",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "San Francisco",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Sasaima",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Supatá",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Útica",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Vergara",
            "CODIGO_PROVINCIA": 3
          },
          {
            "NOMBRE_MPIO": "Villeta",
            "CODIGO_PROVINCIA": 3
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "GUAVIO",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Gachala",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Gachetá",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Gama",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Guasca",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Guatavita",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Junín",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "La Calera",
            "CODIGO_PROVINCIA": 4
          },
          {
            "NOMBRE_MPIO": "Ubalá",
            "CODIGO_PROVINCIA": 4
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "MAGDALENA CENTRO",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Beltrán",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "Bituima",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "Chaguaní",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "Guayabal De Síquima",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "Pulí",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "San Juan De Rioseco",
            "CODIGO_PROVINCIA": 5
          },
          {
            "NOMBRE_MPIO": "Vianí",
            "CODIGO_PROVINCIA": 5
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "MEDINA",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Medina",
            "CODIGO_PROVINCIA": 6
          },
          {
            "NOMBRE_MPIO": "Paratebueno",
            "CODIGO_PROVINCIA": 6
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "ORIENTE",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Cáqueza",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Chipaque",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Choachí",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Fómeque",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Fosca",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Guayabetal",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Gutiérrez",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Quetame",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Ubaque",
            "CODIGO_PROVINCIA": 7
          },
          {
            "NOMBRE_MPIO": "Une",
            "CODIGO_PROVINCIA": 7
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "RIONEGRO",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "El Peñón",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "La Palma",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "Pacho",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "Paime",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "San Cayetano",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "Topaipí",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "Villagómez",
            "CODIGO_PROVINCIA": 8
          },
          {
            "NOMBRE_MPIO": "Yacopí",
            "CODIGO_PROVINCIA": 8
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "SABANA CENTRO",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Cajicá",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Chía",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Cogua",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Gachancipá",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Nemocón",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Sopó",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Tabio",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Tocancipá",
            "CODIGO_PROVINCIA": 9
          },
          {
            "NOMBRE_MPIO": "Zipaquirá",
            "CODIGO_PROVINCIA": 9
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "SABANA OCCIDENTE",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Bojacá",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Cota",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "El Rosal",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Facatativá",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Funza",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Madrid",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Mosquera",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Subachoque",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Tenjo",
            "CODIGO_PROVINCIA": 10
          },
          {
            "NOMBRE_MPIO": "Zipacón",
            "CODIGO_PROVINCIA": 10
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "SOACHA",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Sibaté",
            "CODIGO_PROVINCIA": 11
          },
          {
            "NOMBRE_MPIO": "Soacha",
            "CODIGO_PROVINCIA": 11
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "SUMAPAZ",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Arbeláez",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Cabrera",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Fusagasugá",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Granada",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Pandi",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Pasca",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "San Bernardo",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Silvania",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Tibacuy",
            "CODIGO_PROVINCIA": 12
          },
          {
            "NOMBRE_MPIO": "Venecia",
            "CODIGO_PROVINCIA": 12
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "TEQUENDAMA",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Anapoima",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Anolaima",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Apulo",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Cachipay",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "El Colegio",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "La Mesa",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Quipile",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "San Antonio De Tequendama",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Tena",
            "CODIGO_PROVINCIA": 13
          },
          {
            "NOMBRE_MPIO": "Viotá",
            "CODIGO_PROVINCIA": 13
          }
        ]
      },
      {
        "NOMBRE_PROVINCIA": "UBATÉ",
        "MUNICIPIOS": [
          {
            "NOMBRE_MPIO": "Carmen De Carupa",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Cucunubá",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Fúquene",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Guachetá",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Lenguazaque",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Simijaca",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Susa",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Sutatausa",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Tausa",
            "CODIGO_PROVINCIA": 14
          },
          {
            "NOMBRE_MPIO": "Ubaté",
            "CODIGO_PROVINCIA": 14
          }
        ]
      }
    ]
  municipios: any = [];
  values: any = {};
  estilosProvincias = new Style({
    stroke: new Stroke({
      color: '#fff',
      width: 2
    }),
    fill: new Fill({
      color: '#00a9e636'
    })
  });

  shadowStyle = new Style({
    stroke: new Stroke({
      color: 'rgba(0,0,0,0.5)', // sombra negra con transparencia
      width: 4
    })
  });

  labelStyle = new Style({
    text: new Text({
      font: '13px Calibri,sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 4,
      }),
      maxAngle: Math.PI / 4,
      overflow: true,
      padding: [2, 8, 2, 8],
      textAlign: 'center',
      placement: 'point',
      backgroundFill: new Fill({ color: 'rgba(255,255,255,0.7)' }),
      backgroundStroke: new Stroke({ color: '#aaa', width: 1 })
    }),
  });
  style = [this.estilosProvincias, this.labelStyle]
  layerMunicipios = new VectorLayer({
    source: new VectorSource({
      url: '/capas/Municipios_DANE.geojson',
      format: new GeoJSON()
    }),
    style: (feature) => {
      //this.labelStyle.getText()?.setText(feature.get("munnombre"))

      // Escala de colores personalizada según la cantidad de proyectos
      const cantidad = this.conteoProyectosMunicipio[this.normalizeString(feature.get("munnombre"))] || 0;
      let color = 'rgba(0, 0, 92, 0.7)'; // color por defecto (más bajo)
      if (cantidad > 0) {
        const ratio = cantidad / this.maxProyectosMunicipio;
        if (ratio > 0.8) {
          color = '#1F87C8'; // #4525d1
        } else if (ratio > 0.6) {
          color = '#1F87C8'; // #341cb7
        } else if (ratio > 0.4) {
          color = '#C0E1F5'; // #1509a6
        } else if (ratio > 0.2) {
          color = '#E7F2FF'; // #0b0581
        } else {
          color = '#FFFFFF'; // #00005c
        }
      }
      this.estilosProvincias.getFill()?.setColor(color);
      return this.style[0]
    },
    visible: false, // inicialmente oculta
  });

  layerDepartamento = new VectorLayer({
    source: new VectorSource({
      url: '/capas/Departamentos.geojson.json',
      format: new GeoJSON()
    }),
    style: (feature) => {
      return this.style[0]
    },
    visible: true, // inicialmente oculta
  });

  layerProvincia = new VectorLayer({
    source: new VectorSource({
      url: '/capas/Provincias_de_Cundinamarca.json',
      format: new GeoJSON()
    }),
    style: (feature) => {
      const cantidad = this.conteoProyectos[this.normalizeString(feature.get("PROVINCIA"))] || 0;
      let color = 'rgba(0, 0, 92, 0.7)'; // color por defecto (más bajo)
      if (cantidad > 0) {
        const ratio = cantidad / this.maxProyectos;
        console.log(ratio, cantidad, this.maxProyectos)
        if (ratio > 0.8) {
          color = '#1F87C8'; // #4525d1
        } else if (ratio > 0.6) {
          color = '#1F87C8'; // #341cb7
        } else if (ratio > 0.4) {
          color = '#C0E1F5'; // #1509a6
        } else if (ratio > 0.2) {
          color = '#E7F2FF'; // #0b0581
        } else {
          color = '#FFFFFF'; // #00005c
        }
      }
      this.estilosProvincias.getFill()?.setColor(color);
      this.labelStyle.getText()?.setText(feature.get("PROVINCIA") + "-" + cantidad)
      return this.style
    },
    visible: false, // inicialmente oculta
  });


  layerPuntos = new VectorLayer({
    source: new VectorSource({}),
    style: feature => {
      const cantidad = feature.get('cantidad');

      return new Style({
        text: new Text({
          text: cantidad.toString(),
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#000', width: 3 }),
          font: 'bold 30px sans-serif'
        }),
      });
    },
    visible: true, // inicialmente oculta
  });


  indicador = false

  map = new Map();
  info: any;
  proyectosPorMunicipio: any;
  proyectosLayer: any;
  categoryCounts: any = {};
  constructor(private data: CompromisosService) {

  }
  tooltip: any = 0;
  tooltipOverlay = new Overlay({
    element: this.tooltip,
    offset: [10, 0],
    positioning: 'bottom-left'
  });
  total: number = 0;
  numPro: number = 0;

  worldImagery = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
      maxZoom: 19 // Ajusta el zoom máximo según la disponibilidad del servicio
    }),
    visible: false // inicialmente oculta
  });

  relieveLayer = new TileLayer({
    source: new OSM(),
    visible: true // inicialmente oculta
  })

  readonly vistaInicial = {
    center: fromLonLat([-74, 4.75]), // cambia por tu centro
    zoom: 8.5
  };

  provincia = new FormControl('');
  filteredprovincia!: Observable<string[]>;
  municipio = new FormControl('');
  filteredmunicipio!: Observable<string[]>;

  entidades: any[] = [];
  entidad = new FormControl('');
  filteredentidad!: Observable<string[]>;
  temas: string[] = [];
  tema = new FormControl('');
  filteredtema!: Observable<string[]>;
  subtemas: string[] = [];
  subtema = new FormControl('');
  subfilteredtema!: Observable<string[]>;
  estados: string[] = [];
  estado = new FormControl('');
  filteredestado!: Observable<string[]>;
  prioridades: string[] = [];
  prioridad = new FormControl('');
  filteredprioridad!: Observable<string[]>;
  obligaciones: string[] = [];
  obligacion = new FormControl('');
  filteredobligacion!: Observable<string[]>;

  private normalizeString(str: string): string {
    if (!str) {
      return '';
    }
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  conteoProyectos: Record<string, number> = {};
  conteoProyectosMunicipio: Record<string, number> = {};
  maxProyectos: number = 0;
  maxProyectosMunicipio: number = 0;

  filteredCompromisos: any[] = [];
  avgAvance: number = 0;
  avgAvanceFisico: number = 0;
  avgAvanceFinanciero: number = 0;

  // Material Table Properties
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id', 'compromiso', 'entidad', 'inversion', 'estado', 'prioridad'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  calculateMetrics() {
    this.updateDashboardMetrics();
  }

  updateDashboardMetrics() {
    const p = this.provincia.value;
    const m = this.municipio.value;
    const e = this.entidad.value;
    const est = this.estado.value;
    const pri = this.prioridad.value;
    const obl = this.obligacion.value;
    const t = this.tema.value;
    const st = this.subtema.value;

    this.filteredCompromisos = this.info.filter((c: any) => {
      const matchP = !p || (c.provincia && this.normalizeString(c.provincia) === this.normalizeString(p));
      const matchM = !m || (c.municipio && this.normalizeString(c.municipio) === this.normalizeString(m));
      const matchE = !e || ((c.entidad_lider || c.entidad) === e);
      const matchEst = !est || (c.estado === est);
      const matchPri = !pri || (c.prioridad === pri);
      const matchObl = !obl || (c.obligacion_contraida === obl);
      const matchT = !t || (c.tema === t);
      const matchSt = !st || (c.subtema === st);

      return matchP && matchM && matchE && matchEst && matchPri && matchObl && matchT && matchSt;
    });

    this.numPro = this.filteredCompromisos.length;
    this.total = this.filteredCompromisos.reduce((sum: number, c: any) => sum + (parseFloat(c.valor_total) || 0), 0);

    if (this.numPro > 0) {
      const totalAvance = this.filteredCompromisos.reduce((sum: any, c: any) => {
        let avance = c.avance_real;
        if (typeof avance !== 'number') {
          avance = (c.estado === 'Finalizado' || c.estado === 'FINALIZADO') ? 100 : 0;
        }
        return sum + avance;
      }, 0);
      this.avgAvance = totalAvance / this.numPro;

      this.avgAvanceFisico = this.filteredCompromisos.reduce((sum: any, c: any) => sum + (typeof c.avance_fisico !== 'number' ? 0 : c.avance_fisico), 0) / this.numPro;
      this.avgAvanceFinanciero = this.filteredCompromisos.reduce((sum: any, c: any) => sum + (typeof c.avance_financiero !== 'number' ? 0 : c.avance_financiero), 0) / this.numPro;
      console.log(this.avgAvance);
      console.log(this.avgAvanceFisico);
      console.log(this.avgAvanceFinanciero);
    } else {
      this.avgAvance = 0;
      this.avgAvanceFisico = 0;
      this.avgAvanceFinanciero = 0;
    }

    // Update Table DataSource
    this.dataSource.data = this.filteredCompromisos;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit() {
    this.data.getCompromisos().subscribe((data: any) => {
      this.info = data;
      this.filteredCompromisos = data;
      this.calculateMetrics();

      this.filterType("", "", "", null);
      this.temas = Array.from(new Set(data.map((obj: any) => obj.tema)))
        .map(id => data.find((obj: any) => obj.tema === id && id !== null && id !== undefined && obj !== undefined))
      this.subtemas = Array.from(new Set(data.map((obj: any) => obj.subtema)))
        .map(id => data.find((obj: any) => obj.subtema === id && id !== null && id !== undefined && obj !== undefined))
      this.entidades = Array.from(new Set(data.map((obj: any) => obj.entidad)))
        .map(id => data.find((obj: any) => obj.entidad === id && id !== null && id !== undefined && obj !== undefined))
      this.subtemas = this.subtemas.filter((ele: any) => ele !== null && ele !== undefined && ele !== "")
      this.temas = this.temas.filter((ele: any) => ele !== null && ele !== undefined && ele !== "")
      this.entidades = this.entidades.filter((ele: any) => ele !== null && ele !== undefined && ele !== "")

      this.estados = Array.from(new Set(data.map((obj: any) => obj.estado))).filter(e => e != null)
        .map(id => data.find((obj: any) => obj.estado === id && id !== null && id !== undefined && obj !== undefined))
        .map((obj: any) => obj.estado).filter((e: any) => e);
      this.prioridades = Array.from(new Set(data.map((obj: any) => obj.prioridad))).filter(e => e != null)
        .map(id => data.find((obj: any) => obj.prioridad === id && id !== null && id !== undefined && obj !== undefined))
        .map((obj: any) => obj.prioridad).filter((e: any) => e);
      this.obligaciones = Array.from(new Set(data.map((obj: any) => obj.obligacion_contraida))).filter(e => e != null)
        .map(id => data.find((obj: any) => obj.obligacion_contraida === id && id !== null && id !== undefined && obj !== undefined))
        .map((obj: any) => obj.obligacion_contraida).filter((e: any) => e);


      this.categoryCounts = data.reduce((acc: any, item: any) => {
        acc[item.entidad] = (acc[item.entidad] || 0) + 1;
        return acc;
      }, {});


      data.forEach((p: any) => {
        const nombre = p.municipio != null ? this.normalizeString(p.municipio) : '';
        const provincia = p.provincia != null ? this.normalizeString(p.provincia) : '';
        this.conteoProyectosMunicipio[nombre] = (this.conteoProyectosMunicipio[nombre] || 0) + 1;
        this.conteoProyectos[provincia] = (this.conteoProyectos[provincia] || 0) + 1;
      });
      console.log(this.conteoProyectos);

      this.maxProyectos = Math.max(...Object.values(this.conteoProyectos));
      this.maxProyectosMunicipio = Math.max(...Object.values(this.conteoProyectosMunicipio));
      this.layerMunicipios.changed();

    }).add(() => {
      this.filteredprovincia = this.provincia.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.provincias, "NOMBRE_PROVINCIA")),
      );
      this.filteredmunicipio = this.municipio.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.municipios, "NOMBRE_MPIO")),
      );
      this.filteredentidad = this.entidad.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.entidades, "entidad")),
      );
      this.filteredtema = this.tema.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.temas, "tema")),
      );
      this.subfilteredtema = this.subtema.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.subtemas, "subtema")),
      );
      this.filteredestado = this.estado.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.estados, "estado", true)),
      );
      this.filteredprioridad = this.prioridad.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.prioridades, "prioridad", true)),
      );
      this.filteredobligacion = this.obligacion.valueChanges.pipe(
        startWith(''),
        map(value => this._filterS(value || '', this.obligaciones, "obligacion_contraida", true)),
      );

      this.proyectosPorMunicipio = {};

      this.info.forEach((p: any) => {
        const key = this.normalizeString(p.municipio);
        if (!this.proyectosPorMunicipio[key]) {
          this.proyectosPorMunicipio[key] = [];
        }
        this.proyectosPorMunicipio[key].push(p);
      });
    });
    this.provincias.forEach((provincia: any) => {
      provincia.MUNICIPIOS.forEach((municipio: any) => {
        this.municipios.push({
          NOMBRE_MPIO: municipio.NOMBRE_MPIO,
          codigo: municipio.CODIGO_PROVINCIA,
          provincia: provincia.NOMBRE_PROVINCIA
        });
      });
    });

    // Ordenar Provincias alfabéticamente
    this.provincias.sort((a, b) => a.NOMBRE_PROVINCIA.localeCompare(b.NOMBRE_PROVINCIA));

    // Ordenar Municipios alfabéticamente
    this.municipios.sort((a: any, b: any) => a.NOMBRE_MPIO.localeCompare(b.NOMBRE_MPIO));

    console.log(this.municipios)
    this.tooltip = document.getElementById('tooltip');
    this.map = new Map({
      target: 'map',
      layers: [
        this.worldImagery, this.relieveLayer, this.layerDepartamento, this.layerProvincia, this.layerMunicipios
      ],
      // Capa vectorial que solo aparecerá con zoom >= 10

      view: new View({
        center: fromLonLat([-74, 4.75]),
        zoom: 8.5,
        minZoom: 8,
        maxZoom: 18,
      }),
    });

    const selectInteraction = new Select({
      layers: [this.layerDepartamento, this.layerProvincia, this.layerMunicipios],
      style: [this.estilosProvincias],       // estilo que quieres aplicar al seleccionado
      multi: false,                   // solo un feature a la vez
    });
    this.map.addInteraction(selectInteraction);

    this.map.on('pointermove', (eve) => this.onMapPointerMove(eve))
    this.map.on('moveend', () => this.onMapMoveEnd());
    this.map.on('click', (eve) => this.onMapClick(eve))

    selectInteraction.on('select', (e: any) => {
      this.total = 0;
      if (e.selected[0]) {
        if (e.selected[0].values_.PROVINCIA) {
          const provName = e.selected[0].values_.PROVINCIA;
          this.provincia.setValue(provName);
          // Trigger the detailed filter update logic which handles zooming and metrics
          // We call onSelectProvincia or simulate it, but since setValue doesn't emit if emitEvent:false,
          // we can just stick to `onSelectProvincia` logic being triggered manually or by value change if we subscribe.
          // However, existing onSelectProvincia relies on control value.

          this.onSelectProvincia();

        } else if (e.selected[0].values_.munnombre) {
          const munName = e.selected[0].values_.munnombre;
          this.municipio.setValue(munName);
          this.onSelectMunicipio();

        } else {
          // Fallback or other layres
        }

      } else {
        // Deselect -> Reset? Or do nothing?
        // Usually clicking empty space deselects.
        // We might want to reset the specific filter if it matches the current selection.
        // For now, let's keep it simple. If they click to select, we select.
      }

    });


  }

  getColorDinamico(cantidad: number): string {
    if (this.maxProyectos === 0) return '#e0e0e0';

    const ratio = cantidad / this.maxProyectos; // valor entre 0 y 1
    const r = Math.floor(255 * ratio);  // rojo
    const g = Math.floor(255 * (1 - ratio)); // verde decreciente
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
  hide: boolean = false;
  alto: string = "25%";
  analitic: any = { titulo: "", estados: {} };
  showAnalystics(filter: any, alto: string = "25%") {
    console.log(filter)
    this.alto = alto;
    let data = this.info.filter((ele: any) => ele.entidad == filter)
    this.analitic = {
      "titulo": filter,
      "estados": data.reduce((acc: any, item: any) => {
        acc[item.estado] = (acc[item.estado] || 0) + 1;
        return acc;
      }, {}),
    }
    this.hide = !this.hide;
  };
  private _filterS(value: string, array: any, field: string, isSimpleArray: boolean = false): string[] {
    const filterValue = this.normalizeString(value);
    if (isSimpleArray) {
      return array.filter((option: string) => this.normalizeString(option).includes(filterValue));
    }
    return array
      .filter((option: any) => option[field] && this.normalizeString(option[field]).includes(filterValue))
      .map((option: any) => option[field]);
  }

  onSelectProvincia() {
    const selectedValue = this.provincia.value;
    this.provinciaFilter = selectedValue || '';

    if (!selectedValue) {
      this.resetMapa();
      return;
    }

    let e: any = {}
    this.map.getView().setZoom(8.6);
    setTimeout(() => {
      this.layerProvincia.getSource()?.getFeatures().forEach((feature: any) => {
        if (this.normalizeString(feature.get('PROVINCIA')) === this.normalizeString(selectedValue)) {
          e = feature;
        }
      })
      this.filterType(selectedValue, "PROVINCIA", this.globalFilter, e);
    }, 1000);

    let valueProv = selectedValue != "" ? this.municipios.filter((ele: any) => ele.provincia && this.normalizeString(ele.provincia) == this.normalizeString(selectedValue)) : this.municipios

    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");

    // Mocking value changes for municipio dependent filter
    // Since we are not using autocomplete pipe anymore for filtering the options, we can just update the list if we want
    // But for now, user can see all municipos or filtered
  }

  onSelectMunicipio() {
    const selectedValue = this.municipio.value;
    this.municipioFilter = selectedValue || '';

    if (!selectedValue) {
      // Handle clear?
      return; // or reset
    }

    let e: any = {}
    this.map.getView().setZoom(9.1);
    setTimeout(() => {
      this.layerMunicipios.getSource()?.getFeatures().forEach((feature: any) => {
        if (this.normalizeString(feature.get('munnombre')) === this.normalizeString(selectedValue)) {
          e = feature;
        }
      })
      this.filterType(selectedValue, "MUNICIPIO", this.globalFilter, e);
    }, 1000);

    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");

  }

  onSelectEntidad() {
    this.entidadFilter = this.entidad.value || '';
    const selectedValue = this.entidadFilter;
    this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, selectedValue, this.estadoFilter, this.prioridadFilter, this.obligacionFilter);
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");
  }

  onSelectEstado() {
    this.estadoFilter = this.estado.value || '';
    this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, this.entidadFilter, this.estadoFilter, this.prioridadFilter, this.obligacionFilter);
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");
  }

  onSelectPrioridad() {
    this.prioridadFilter = this.prioridad.value || '';
    this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, this.entidadFilter, this.estadoFilter, this.prioridadFilter, this.obligacionFilter);
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");
  }

  onSelectObligacion() {
    this.obligacionFilter = this.obligacion.value || '';
    this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, this.entidadFilter, this.estadoFilter, this.prioridadFilter, this.obligacionFilter);
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");

  }

  municipioFilter: string = "";
  provinciaFilter: string = "";
  temaFilter: string = "";
  subtemaFilter: string = "";
  entidadFilter: string = "";
  estadoFilter: string = "";
  prioridadFilter: string = "";
  obligacionFilter: string = "";

  projects: any = [];
  totalModal: any;
  nombreModal: string = "";
  showModal: boolean = true;
  onMapClick(eve: any) {

    const feature = this.map.forEachFeatureAtPixel(eve.pixel, function (feat) {
      return feat;
    });
    console.log(feature)
    if (feature && feature.get("municipio")) {
      this.totalModal = 0;
      let value = this.info
      this.projects = value.filter((ele: any) => ele.municipio && feature.get("municipio") && this.normalizeString(ele.municipio) == this.normalizeString(feature.get("municipio")))
      if (this.entidadFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.entidad == this.entidadFilter)
      }
      if (this.temaFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.tema == this.temaFilter)
      }
      if (this.subtemaFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.subtema == this.subtemaFilter)
      }
      if (this.estadoFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.estado == this.estadoFilter)
      }
      if (this.prioridadFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.prioridad == this.prioridadFilter)
      }
      if (this.obligacionFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.obligacion_contraida == this.obligacionFilter)
      }

      const reportObservables = this.projects.map((project: any) => {
        return this.data.getReportesAvance(project.codigo);
      });

      forkJoin(reportObservables).subscribe((reportesArrays: any) => {
        this.projects.forEach((project: any, index: number) => {
          const reportes = reportesArrays[index];
          if (reportes.length > 0) {
            reportes.sort((a: any, b: any) => new Date(b.mes_reporte).getTime() - new Date(a.mes_reporte).getTime());
            project.avance_real = reportes[0].reporte_avance_fisico;
          } else {
            project.avance_real = 0;
          }
        });

        this.projects.sort(function (a: any, b: any) {
          if (a.valor_total < b.valor_total) {
            return -1;
          }
          if (a.valor_total > b.valor_total) {
            return 1;
          }
          return 0;
        });

        this.projects.map((ele: any) => { this.totalModal += parseFloat(ele.valor_total) })
        this.nombreModal = feature.get("municipio")
        this.showModal = false;
      });
    }
  }
  onMapPointerMove(evt: MapBrowserEvent): any {
    let hoveredFeature: any = null;
    // Solo resaltar un feature a la vez
    this.map.forEachFeatureAtPixel(evt.pixel, (feature: any, layer: any) => {
      hoveredFeature = feature;
      return true; // solo el primero
    });

    // Si hay un feature nuevo, resalta y desresalta el anterior
    if (hoveredFeature !== this.featureDestacado) {
      if (this.featureDestacado) {
        const isProjectFeature = this.featureDestacado.get('id');
        if (!isProjectFeature) {
          this.featureDestacado.setStyle(null); // Quitar estilo de resaltado para polígonos
        }
      }
      if (hoveredFeature) {
        const isProjectFeature = hoveredFeature.get('id');
        if (!isProjectFeature) {
          if (!hoveredFeature.get('munnombre')) {
            hoveredFeature.setStyle(this.estiloFalsaExtrusion(hoveredFeature));
          }
        }
      }
      this.featureDestacado = hoveredFeature;
    }
    // Mostrar u ocultar tooltip correctamente

  }
  onMapMoveEnd(): any {
    const zoom = this.map.getView().getZoom()!;
    if (zoom < 8.5) {
      this.layerDepartamento.setVisible(true)
      this.layerProvincia.setVisible(false)
      this.layerMunicipios.setVisible(false)
      this.layerPuntos.setVisible(false);
    }
    if (zoom > 8.5 && zoom < 9) {
      // Oculta todas las veredas si no hay suficiente zoom
      this.layerDepartamento.setVisible(false)
      this.layerProvincia.setVisible(true)
      this.layerMunicipios.setVisible(false)
      this.layerPuntos.setVisible(false);
    }
    if (zoom > 9) {
      // Oculta todas las veredas si no hay suficiente zoom
      this.layerDepartamento.setVisible(false)
      this.layerProvincia.setVisible(false)
      this.layerMunicipios.setVisible(true)
      this.layerPuntos.setVisible(true);
    }
  }

  featureDestacado: any = null;
  estiloFalsaExtrusion(feature: any) {
    // Efecto de sombra desplazada
    const desplazamiento = [5, -5];
    const sombra = new Style({
      geometry: function (f) {
        const geom = f.getGeometry()?.clone();
        if (geom && typeof (geom as any).translate === 'function') {
          (geom as any).translate(desplazamiento[0], desplazamiento[1]);
        }
        return geom;
      },
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.6)',
        width: 1
      }),
      text: new Text({
        font: '13px Calibri,sans-serif',
        fill: new Fill({
          color: '#000',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 4,
        }),
        text: feature.get('munnombre') || feature.get('PROVINCIA') || feature.get("NOMBRE_DPT"),
        maxAngle: Math.PI / 4,
        overflow: true,
        padding: [2, 8, 2, 8],
        textAlign: 'center',
        placement: 'point',
      }),
    });

    // Efecto de expansión (escalado)
    const escala = 1.08; // 8% más grande
    const expandida = new Style({
      geometry: function (f) {
        const geom = f.getGeometry()?.clone();
        // Escalar el polígono respecto a su centroide
        if (geom && typeof (geom as any).scale === 'function') {
          // Obtener centroide
          const extent = geom.getExtent();
          const center = [
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2
          ];
          (geom as any).scale(escala, escala, center);
        }
        return geom;
      },
      fill: new Fill({
        color: '#00a9e636'
      }),
      stroke: new Stroke({
        color: '#00a9e67a',
        width: 3
      })
    });

    return [sombra, expandida];
  }
  filtro = "";
  globalFilter = "";
  valueFilter = "";
  typeFilter = "";
  filter(type: string) {
    this.globalFilter = type;
    this.filtro = type;
    console.log(this.filtro)
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");
  }

  showCapas(capa: string) {
    switch (capa) {
      case "s":
        this.worldImagery.setVisible(true);
        this.relieveLayer.setVisible(false);
        break;

      case "r":
        this.worldImagery.setVisible(false);
        this.relieveLayer.setVisible(true);
        break;

      default:
        this.worldImagery.setVisible(false);
        this.relieveLayer.setVisible(false);
    }
  }

  filterType(valor: string, tipo: string, global: string = "", e: any) {
    // Sync triggers
    this.updateDashboardMetrics();

    this.total = 0;
    let value = this.info;
    if (this.entidadFilter && this.entidadFilter != "") { value = value.filter((ele: any) => ele.entidad == this.entidadFilter) }
    if (this.temaFilter && this.temaFilter != "") { value = value.filter((ele: any) => ele.tema == this.temaFilter) }
    if (this.subtemaFilter && this.subtemaFilter != "") { value = value.filter((ele: any) => ele.subtema == this.subtemaFilter) }
    if (this.estadoFilter && this.estadoFilter != "") { value = value.filter((ele: any) => ele.estado == this.estadoFilter) }
    if (this.prioridadFilter && this.prioridadFilter != "") { value = value.filter((ele: any) => ele.prioridad == this.prioridadFilter) }
    if (this.obligacionFilter && this.obligacionFilter != "") { value = value.filter((ele: any) => ele.obligacion_contraida == this.obligacionFilter) }
    console.log(value)
    switch (tipo) {
      case "PROVINCIA":

        this.layerPuntos.setVisible(false);
        let pro_nombre: string = valor;
        value = value.filter((ele: any) => ele.provincia && this.normalizeString(ele.provincia) == this.normalizeString(pro_nombre))
        console.log(e)
        value.map((ele: any) => { if (ele.valor_total != null) { this.total += parseFloat(ele.valor_total) } })
        this.numPro = value.length
        if (e && e.getGeometry) {
          var extent = e.getGeometry().getExtent();
          this.map.getView().fit(extent);
          this.hideMunicipio(pro_nombre, extent)
        }
        this.map.getView().padding = [20, 50, 30, 150]
        this.filtrarValores(value);
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? this.normalizeString(p.municipio) : '';
          const provincia = p.provincia != null ? this.normalizeString(p.provincia) : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectosMunicipio[nombre] || 0) + 1;
          this.conteoProyectos[provincia] = (this.conteoProyectos[provincia] || 0) + 1;
        });
        console.log(this.conteoProyectos);

        this.maxProyectos = Math.max(...Object.values(this.conteoProyectos));
        this.maxProyectosMunicipio = Math.max(...Object.values(this.conteoProyectosMunicipio));
        this.layerMunicipios.changed();
        this.layerProvincia.changed();
        break;
      case "MUNICIPIO":
        let mun_nombre: string = valor;
        value = value.filter((ele: any) => ele.municipio && this.normalizeString(ele.municipio) == this.normalizeString(mun_nombre))

        value.map((ele: any) => { if (ele.valor_total != null) { this.total += parseFloat(ele.valor_total) } })
        this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, this.entidadFilter, this.estadoFilter, this.prioridadFilter, this.obligacionFilter, mun_nombre);
        this.numPro = value.length

        if (e && e.getGeometry) {
          var extent = e.getGeometry().getExtent();
          this.map.getView().fit(extent, {
            padding: [20, 50, 30, 150]
          });
          this.hideMunicipioUnico(mun_nombre, extent)
        }
        this.filtrarValores(value);
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? this.normalizeString(p.municipio) : '';
          const provincia = p.provincia != null ? this.normalizeString(p.provincia) : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectosMunicipio[nombre] || 0) + 1;
          this.conteoProyectos[provincia] = (this.conteoProyectos[provincia] || 0) + 1;
        });
        console.log(this.conteoProyectos);

        this.maxProyectos = Math.max(...Object.values(this.conteoProyectos));
        this.maxProyectosMunicipio = Math.max(...Object.values(this.conteoProyectosMunicipio));
        this.layerMunicipios.changed();
        this.layerProvincia.changed();
        break;

      default:
        value.map((ele: any) => { if (ele.valor_total != null) { this.total += parseFloat(ele.valor_total) } })
        console.log(this.total);
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? this.normalizeString(p.municipio) : '';
          const provincia = p.provincia != null ? this.normalizeString(p.provincia) : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectosMunicipio[nombre] || 0) + 1;
          this.conteoProyectos[provincia] = (this.conteoProyectos[provincia] || 0) + 1;
        });
        console.log(this.conteoProyectos);

        this.maxProyectos = Math.max(...Object.values(this.conteoProyectos));
        this.maxProyectosMunicipio = Math.max(...Object.values(this.conteoProyectosMunicipio));
        this.layerMunicipios.changed();
        this.layerProvincia.changed();
        this.numPro = value.length
        this.filtrarValores(value);
        break;
    }

  }


  filtrarValores(value: any) {

  }

  hideMunicipio(mun: string, feature: any) {
    let provincia = this.provincias.find(ele => this.normalizeString(ele.NOMBRE_PROVINCIA) == this.normalizeString(mun))
    console.log(provincia)

    this.layerMunicipios.setStyle((feature, resolution) => {
      // Define different styles based on feature properties or resolution
      if (provincia?.MUNICIPIOS.find(ele => this.normalizeString(ele.NOMBRE_MPIO) == this.normalizeString(feature.get('munnombre')))) {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(0,0,0,0.5)', // sombra negra con transparencia
            width: 4,
          }),
          fill: new Fill({
            color: '#00a9e636'
          }),
          text: new Text({
            font: '13px Calibri,sans-serif',
            fill: new Fill({
              color: '#000',
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 4,
            }),
            text: feature.get('munnombre')
          }),
        });
      } else {
        return new Style(
          {}
        );
      }
    })


  }
  resetMapa() {
    this.map.getView().animate({
      center: this.vistaInicial.center,
      zoom: this.vistaInicial.zoom,
      duration: 1000
    });

    // Reset Form Controls
    this.provincia.setValue('');
    this.municipio.setValue('');
    this.entidad.setValue('');
    this.estado.setValue('');
    this.prioridad.setValue('');
    this.obligacion.setValue('');
    this.tema.setValue('');
    this.subtema.setValue('');

    // Reset Filters strings
    this.estadoFilter = "";
    this.prioridadFilter = "";
    this.obligacionFilter = "";
    this.entidadFilter = "";
    this.temaFilter = "";
    this.subtemaFilter = "";
    this.valueFilter = "";
    this.typeFilter = "";
    this.globalFilter = "";

    // Reset Layers
    this.layerDepartamento.setVisible(true);
    this.layerProvincia.setVisible(false);
    this.layerMunicipios.setVisible(false);
    this.layerPuntos.setVisible(false);
    this.layerMunicipios.setStyle(this.estilosProvincias);
    if (this.proyectosLayer) {
      this.map.removeLayer(this.proyectosLayer);
    }

    // Reset Data
    this.filterType('', '', '', null);
  }
  proyectosFeatures: Feature[] = [];
  generarProyectosDesdeMunicipios(tema = this.temaFilter, subtema = this.subtemaFilter, entidad = this.entidadFilter, estado = this.estadoFilter, prioridad = this.prioridadFilter, obligacion = this.obligacionFilter, municipioNombre: string | null = null) {


    this.map.removeLayer(this.proyectosLayer);
    const sourceMunicipios = this.layerMunicipios.getSource();
    if (!sourceMunicipios || sourceMunicipios.getState() !== 'ready') {

      return;
    }

    let tempProyectosPorMunicipio = this.proyectosPorMunicipio;

    if (municipioNombre) {
      const normalizedMunNombre = this.normalizeString(municipioNombre);
      const projs = this.proyectosPorMunicipio[normalizedMunNombre];
      tempProyectosPorMunicipio = projs ? { [normalizedMunNombre]: projs } : {};
    }

    const filteredProyectos = Object.fromEntries(
      Object.entries(tempProyectosPorMunicipio).map(([municipio, listaProyectos]: [any, any]) => {
        let filteredList = listaProyectos;
        if (entidad) {
          filteredList = filteredList.filter((p: any) => p.entidad === entidad);
        }
        if (tema) {
          filteredList = filteredList.filter((p: any) => p.tema === tema);
        }
        if (subtema) {
          filteredList = filteredList.filter((p: any) => p.subtema === subtema);
        }
        if (estado) {
          filteredList = filteredList.filter((p: any) => p.estado === estado);
        }
        if (prioridad) {
          filteredList = filteredList.filter((p: any) => p.prioridad === prioridad);
        }
        if (obligacion) {
          filteredList = filteredList.filter((p: any) => p.obligacion_contraida === obligacion);
        }
        return [municipio, filteredList];
      }).filter(([_, listaProyectos]) => listaProyectos.length > 0)
    );


    const municipiosFeatures = sourceMunicipios.getFeatures();
    console.log(filteredProyectos)
    this.proyectosFeatures = []; // Limpiar las features previas
    Object.entries(filteredProyectos).forEach(([municipio, listaProyectos]: [any, any]) => {
      const municipioFeature = municipiosFeatures.find(
        f => f.get('munnombre') && this.normalizeString(f.get('munnombre')) === this.normalizeString(municipio)
      );

      if (!municipioFeature) {
        return;
      }
      listaProyectos.forEach((proyecto: any, i: any) => {
        const municipioGeoJSON: any = new GeoJSON().writeFeatureObject(municipioFeature);

        // Generar punto aleatorio dentro del polígono
        // Generar un punto aleatorio dentro del bbox y validar que esté dentro del polígono

        let puntoTurf;
        let intentos = 0;
        const maxIntentos = 10;
        console.log(municipio, municipioGeoJSON);
        let polygon: any;
        if (municipioGeoJSON.geometry.type === "MultiPolygon") {
          polygon = turf.multiPolygon(municipioGeoJSON.geometry.coordinates);
        } else {
          polygon = turf.polygon(
            municipioGeoJSON.geometry.coordinates
          );
        }


        do {
          puntoTurf = turf.randomPoint(1, { bbox: turf.bbox(municipioGeoJSON) }).features[0].geometry.coordinates;
          intentos++;
        } while (
          !turf.booleanPointInPolygon(turf.point(puntoTurf), polygon) &&
          intentos < maxIntentos
        );

        // Si no se encontró un punto válido, usar el centroide
        if (!turf.booleanPointInPolygon(turf.point(puntoTurf), polygon)) {
          puntoTurf = turf.centroid(polygon).geometry.coordinates;
        }

        municipioFeature.getGeometry()?.getClosestPoint(puntoTurf);
        const feature = new Feature({
          geometry: new Point(puntoTurf),
          nombre: proyecto.nombre,
          municipio: proyecto.municipio,
          id: proyecto.id,
        });

        feature.setStyle(new Style({
          image: new Icon({
            src: '/assets/lupa.png',
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.1 // Ajusta este valor según el tamaño deseado
          })
        }));

        this.proyectosFeatures.push(feature);
      });
    });

    const proyectosSource = new VectorSource({
      features: this.proyectosFeatures
    });

    this.proyectosLayer = new VectorLayer({
      source: proyectosSource,
      zIndex: 100
    });
    this.proyectosLayer.changed();
    this.map.addLayer(this.proyectosLayer);
  }

  hideMunicipioUnico(mun_nombre: string, extent: any) {

    this.layerMunicipios.setStyle((feature, resolution) => {
      // Define different styles based on feature properties or resolution
      if (this.normalizeString(mun_nombre) == this.normalizeString(feature.get('munnombre'))) {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(0,0,0,0.5)', // sombra negra con transparencia
            width: 4,
          }),
          fill: new Fill({
            color: '#00a9e636'
          }),
          text: new Text({
            font: '13px Calibri,sans-serif',
            fill: new Fill({
              color: '#000',
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 4,
            }),
            text: feature.get('munnombre')
          }),
        });
      } else {
        return new Style(
          {}
        );
      }
    })
  }
}
