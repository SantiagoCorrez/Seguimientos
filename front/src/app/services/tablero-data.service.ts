// src/app/services/tablero-data.service.ts
// Capa de carga de datos del tablero: compromisos (fuente) + capas geográficas (geojson).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { booleanPointInPolygon, pointOnFeature } from '@turf/turf';
import { CompromisosService } from './compromisos.service';
import { Compromiso } from '../models/compromiso';
import { Geografia, construirGeografia } from '../components/tablero/tablero-logic';

export interface DatosTablero {
    compromisos: Compromiso[];
    geografia: Geografia;
}

@Injectable({ providedIn: 'root' })
export class TableroDataService {
    constructor(private http: HttpClient, private compromisosService: CompromisosService) { }

    cargar(): Observable<DatosTablero> {
        return forkJoin({
            compromisos: this.compromisosService.getProyectosPorMunicipio(),
            provincias: this.http.get<any>('/capas/Provincias_de_Cundinamarca.json'),
            municipios: this.http.get<any>('/capas/Municipios_DANE.geojson')
        }).pipe(
            map(({ compromisos, provincias, municipios }) => ({
                compromisos,
                geografia: construirGeografia(provincias, municipios, (municipio, provFeatures) => {
                    const punto = pointOnFeature(municipio);
                    return provFeatures.find(p => booleanPointInPolygon(punto, p));
                })
            }))
        );
    }
}
