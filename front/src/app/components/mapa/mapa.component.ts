import { Component, OnInit } from '@angular/core';
import { CompromisosService } from '../../services/compromisos.service';
import { HttpClientModule } from '@angular/common/http';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
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
import { map, Observable, startWith } from 'rxjs';
import { getCenter } from 'ol/extent';
import { Point } from 'ol/geom';
import Icon from 'ol/style/Icon';
import { RouterLink } from '@angular/router';
import * as turf from '@turf/turf';
@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css',
  providers: [CompromisosService],
  imports: [CurrencyPipe, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatAutocompleteModule, ReactiveFormsModule,
    AsyncPipe, DecimalPipe, RouterLink]
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

      this.estilosProvincias.getFill()?.setColor(this.conteoProyectosMunicipio[feature.get("munnombre").toUpperCase()] ? `rgba(0, 169, 230, ${0.2 + (0.5 * this.conteoProyectosMunicipio[feature.get("munnombre").toUpperCase()] / this.maxProyectosMunicipio)})` : 'rgba(0, 169, 230, 0.1)')
      return this.style
    },
    visible: false, // inicialmente oculta
  });

  layerDepartamento = new VectorLayer({
    source: new VectorSource({
      url: '/capas/Departamentos.geojson.json',
      format: new GeoJSON()
    }),
    style: (feature) => {
      return this.style
    },
    visible: true, // inicialmente oculta
  });

  layerProvincia = new VectorLayer({
    source: new VectorSource({
      url: '/capas/Provincias_de_Cundinamarca.json',
      format: new GeoJSON()
    }),
    style: (feature) => {
      this.labelStyle.getText()?.setText(feature.get("PROVINCIA"))
      this.estilosProvincias.getFill()?.setColor(this.conteoProyectos[feature.get("PROVINCIA")] ? `rgba(0, 169, 230, ${0.2 + (0.5 * this.conteoProyectos[feature.get("PROVINCIA")] / this.maxProyectos)})` : 'rgba(0, 169, 230, 0.1)')
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

  conteoProyectos: Record<string, number> = {};
  conteoProyectosMunicipio: Record<string, number> = {};
  maxProyectos: number = 0;
  maxProyectosMunicipio: number = 0;

  ngOnInit() {
    this.data.getCompromisos().subscribe((data: any) => {
      this.info = data;
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


      this.categoryCounts = data.reduce((acc: any, item: any) => {
        acc[item.entidad] = (acc[item.entidad] || 0) + 1;
        return acc;
      }, {});


      data.forEach((p: any) => {
        const nombre = p.municipio != null ? p.municipio.toUpperCase() : '';
        const provincia = p.provincia != null ? p.provincia.toUpperCase() : '';
        this.conteoProyectosMunicipio[nombre] = (this.conteoProyectos[nombre] || 0) + 1;
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

      this.proyectosPorMunicipio = {};

      this.info.forEach((p: any) => {
        const key = p.municipio.toUpperCase();
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
    })

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
          this.typeFilter = "PROVINCIA";
          this.valueFilter = e.selected[0].values_.PROVINCIA;

          this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, e.target.getFeatures().getArray()[0]);

        } else if (e.selected[0].values_.munnombre) {

          this.typeFilter = "MUNICIPIO";
          this.valueFilter = e.selected[0].values_.munnombre;
          this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, e.target.getFeatures().getArray()[0]);
        } else {

          this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, e.target.getFeatures().getArray()[0]);

        }

      } else {


        this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, e.target.getFeatures().getArray()[0]);
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
  private _filterS(value: string, array: any, field: string): string[] {
    const filterValue = value.toLowerCase();
    return array
      .filter((option: any) => option[field].toLowerCase().includes(filterValue))
      .map((option: any) => option[field]);
  }

  selectProvincia(event: any) {
    this.provinciaFilter = event.option.value;
    const selectedValue = event.option.value;
    let e: any = {}
    this.map.getView().setZoom(8.6);
    setTimeout(() => {
      this.layerProvincia.getSource()?.getFeatures().forEach((feature: any) => {
        if (feature.get('PROVINCIA') === selectedValue) {
          e = feature;
        }
      })
      this.filterType(selectedValue, "PROVINCIA", this.globalFilter, e);
    }, 1000);
    let valueProv = selectedValue != "" ? this.municipios.filter((ele: any) => ele.provincia == selectedValue) : this.municipios

    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");

    this.filteredmunicipio = this.municipio.valueChanges.pipe(
      startWith(''),
      map(value => this._filterS(value || '', valueProv, "NOMBRE_MPIO")),
    );
  }

  selectMunicipio(event: any) {
    this.municipioFilter = event.option.value;
    const selectedValue = event.option.value;
    let e: any = {}
    this.map.getView().setZoom(9.1);
    setTimeout(() => {
      this.layerMunicipios.getSource()?.getFeatures().forEach((feature: any) => {
        if (feature.get('munnombre') === selectedValue) {
          e = feature;
        }
      })
      this.filterType(selectedValue, "MUNICIPIO", this.globalFilter, e);
    }, 1000);

    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");

  }

  selectEntidad(event: any) {
    this.entidadFilter = event.option.value;
    const selectedValue = event.option.value;
    this.generarProyectosDesdeMunicipios(this.temaFilter, this.subtemaFilter, selectedValue);
    this.filterType(this.valueFilter, this.typeFilter, this.globalFilter, "");
  }

  municipioFilter: string = "";
  provinciaFilter: string = "";
  temaFilter: string = "";
  subtemaFilter: string = "";
  entidadFilter: string = "";

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
      this.projects = value.filter((ele: any) => ele.municipio == feature.get("municipio"))
      if (this.entidadFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.entidad == this.entidadFilter)
      }
      if (this.temaFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.tema == this.temaFilter)
      }
      if (this.subtemaFilter != "") {
        this.projects = this.projects.filter((ele: any) => ele.subtema == this.subtemaFilter)
      }
      this.projects.sort(function (a: any, b: any) {
        if (a.valor_total < b.valor_total) {
          return -1;
        }
        if (a.valor_total > b.valor_total) {
          return 1;
        }
        // a must be equal to b
        return 0;
      });
      this.projects.map((ele: any) => { this.totalModal += parseFloat(ele.valor_total) })
      this.nombreModal = feature.get("municipio")
      this.showModal = false;
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
        //this.featureDestacado.setStyle(this.style);
        this.featureDestacado.setStyle(null); // Quitar estilo de resaltado
      }
      if (hoveredFeature) {
        if (!hoveredFeature.get('munnombre')) {
          hoveredFeature.setStyle(this.estiloFalsaExtrusion(hoveredFeature));
        }

      }
      this.featureDestacado = hoveredFeature;
    }
    // Mostrar u ocultar tooltip correctamente
    if (hoveredFeature && hoveredFeature.get('munnombre')) {
      const coord = evt.coordinate;
      this.tooltipOverlay.setPosition(coord);
      this.tooltip.style.left = (evt.originalEvent as PointerEvent).x + 'px';
      this.tooltip.style.top = (evt.originalEvent as PointerEvent).y + 'px';
      this.tooltip.innerHTML = hoveredFeature.get('munnombre');
      this.tooltip.style.display = 'block';
    } else if (hoveredFeature && hoveredFeature.get('PROVINCIA')) {
      const coord = evt.coordinate;
      this.tooltipOverlay.setPosition(coord);
      this.tooltip.style.left = (evt.originalEvent as PointerEvent).x + 'px';
      this.tooltip.style.top = (evt.originalEvent as PointerEvent).y + 'px';
      this.tooltip.innerHTML = hoveredFeature.get('PROVINCIA');
      this.tooltip.style.display = 'block';
    } else if (hoveredFeature && hoveredFeature.get("NOMBRE_DPT")) {
      const coord = evt.coordinate;
      this.tooltipOverlay.setPosition(coord);
      this.tooltip.style.left = (evt.originalEvent as PointerEvent).x + 'px';
      this.tooltip.style.top = (evt.originalEvent as PointerEvent).y + 'px';
      this.tooltip.innerHTML = hoveredFeature.get('NOMBRE_DPT');
      this.tooltip.style.display = 'block';
    } else {
      this.tooltip.style.display = 'none';
      this.tooltip.innerHTML = '';
    }
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
    this.total = 0;
    let value = this.info;
    if (this.entidadFilter && this.entidadFilter != "") { value = value.filter((ele: any) => ele.entidad == this.entidadFilter) }
    if (this.temaFilter && this.temaFilter != "") { value = value.filter((ele: any) => ele.tema == this.temaFilter) }
    if (this.subtemaFilter && this.subtemaFilter != "") { value = value.filter((ele: any) => ele.subtema == this.subtemaFilter) }
    console.log(value)
    switch (tipo) {
      case "PROVINCIA":

        this.layerPuntos.setVisible(false);
        let pro_nombre: string = valor;
        value = value.filter((ele: any) => ele.provincia == pro_nombre)
        console.log(e)
        value.map((ele: any) => { if (ele.valor_total != null) { this.total += parseFloat(ele.valor_total) } })
        this.numPro = value.length
        var extent = e.getGeometry().getExtent();
        this.map.getView().fit(extent);
        this.hideMunicipio(pro_nombre, extent)
        this.map.getView().padding = [20, 50, 30, 150]
        this.filtrarValores(value);
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? p.municipio.toUpperCase() : '';
          const provincia = p.provincia != null ? p.provincia.toUpperCase() : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectos[nombre] || 0) + 1;
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
        value = value.filter((ele: any) => ele.municipio == mun_nombre.toLocaleUpperCase())
        value.map((ele: any) => { if (ele.valor_total != null) { this.total += parseFloat(ele.valor_total) } })
        this.generarProyectosDesdeMunicipios(this.entidadFilter, this.temaFilter, this.subtemaFilter);
        this.numPro = value.length
        var extent = e.getGeometry().getExtent();
        this.map.getView().fit(extent, {
          padding: [20, 50, 30, 150]
        });
        this.hideMunicipioUnico(mun_nombre, extent)
        this.filtrarValores(value);
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? p.municipio.toUpperCase() : '';
          const provincia = p.provincia != null ? p.provincia.toUpperCase() : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectos[nombre] || 0) + 1;
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
        this.conteoProyectosMunicipio = {};
        this.conteoProyectos = {};
        value.forEach((p: any) => {
          const nombre = p.municipio != null ? p.municipio.toUpperCase() : '';
          const provincia = p.provincia != null ? p.provincia.toUpperCase() : '';
          this.conteoProyectosMunicipio[nombre] = (this.conteoProyectos[nombre] || 0) + 1;
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
    let provincia = this.provincias.find(ele => ele.NOMBRE_PROVINCIA == mun)
    console.log(provincia)

    this.layerMunicipios.setStyle(function (feature, resolution) {
      // Define different styles based on feature properties or resolution
      if (provincia?.MUNICIPIOS.find(ele => ele.NOMBRE_MPIO == feature.get('munnombre'))) {
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

  proyectosFeatures: Feature[] = [];
  generarProyectosDesdeMunicipios(tema = this.temaFilter, subtema = this.subtemaFilter, entidad = this.entidadFilter) {


    this.map.removeLayer(this.proyectosLayer);
    const sourceMunicipios = this.layerMunicipios.getSource();
    if (!sourceMunicipios || sourceMunicipios.getState() !== 'ready') {

      return;
    }
    let filteredProyectos = this.proyectosPorMunicipio;
    if (entidad) {
      filteredProyectos = Object.fromEntries(
        Object.entries(filteredProyectos).filter(([municipio, listaProyectos]: [any, any]) => {
          return listaProyectos.some((proyecto: any) => proyecto.entidad === entidad);
        })
      )
    }

    if (tema) {
      filteredProyectos = Object.fromEntries(
        Object.entries(filteredProyectos).filter(([municipio, listaProyectos]: [any, any]) => {
          return listaProyectos.some((proyecto: any) => proyecto.tema === tema);
        })
      )
    }

    if (subtema) {
      filteredProyectos = Object.fromEntries(
        Object.entries(filteredProyectos).filter(([municipio, listaProyectos]: [any, any]) => {
          return listaProyectos.some((proyecto: any) => proyecto.subtema === subtema);
        })
      )
    }


    const municipiosFeatures = sourceMunicipios.getFeatures();
    console.log(filteredProyectos)
    this.proyectosFeatures = []; // Limpiar las features previas
    Object.entries(filteredProyectos).forEach(([municipio, listaProyectos]: [any, any]) => {
      const municipioFeature = municipiosFeatures.find(
        f => f.get('munnombre')?.toUpperCase() === municipio
      );

      if (!municipioFeature) {
        return;
      }

      listaProyectos.forEach((proyecto: any, i: any) => {
        const municipioGeoJSON = new GeoJSON().writeFeatureObject(municipioFeature);

        // Generar punto aleatorio dentro del polígono
        // Generar un punto aleatorio dentro del bbox y validar que esté dentro del polígono
        let puntoTurf;
        let intentos = 0;
        const maxIntentos = 10;
        const polygon = turf.polygon(
          (municipioGeoJSON.geometry as GeoJSON.Polygon).coordinates
        );

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

    this.layerMunicipios.setStyle(function (feature, resolution) {
      // Define different styles based on feature properties or resolution
      if (mun_nombre == feature.get('munnombre')) {
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
