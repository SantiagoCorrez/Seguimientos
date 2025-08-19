// src/app/services/compromisos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compromiso } from '../models/compromiso';
import { ReporteAvance } from '../models/reporte-avance';
import { FichaTecnicaVisita } from '../models/ficha-tecnica-visita.model';

@Injectable({
    providedIn: 'root'
})
export class CompromisosService {
    private apiUrl = '/api'; // URL base de tu backend Node.js

    constructor(private http: HttpClient) { }

    // --- Métodos para Compromisos ---

    getCompromisos(): Observable<Compromiso[]> {
        return this.http.get<Compromiso[]>(`${this.apiUrl}/compromisos`);
    }

    getCompromisoByCodigo(codigo: string): Observable<Compromiso> {
        return this.http.get<Compromiso>(`${this.apiUrl}/compromisos/${codigo}`);
    }

    createCompromiso(compromiso: Compromiso): Observable<Compromiso> {
        return this.http.post<Compromiso>(`${this.apiUrl}/compromisos`, compromiso);
    }

    updateCompromiso(codigo: string, compromiso: Compromiso): Observable<Compromiso> {
        return this.http.put<Compromiso>(`${this.apiUrl}/compromisos/${codigo}`, compromiso);
    }

    deleteCompromiso(codigo: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/compromisos/${codigo}`);
    }

    // --- Métodos para Reportes de Avance ---

    getReportesAvance(compromisoCodigo: string): Observable<ReporteAvance[]> {
        return this.http.get<ReporteAvance[]>(`${this.apiUrl}/compromisos/${compromisoCodigo}/reportes-avance`);
    }

    getReporteAvanceById(id: number): Observable<ReporteAvance> {
        return this.http.get<ReporteAvance>(`${this.apiUrl}/reportes-avance/${id}`);
    }

    createReporteAvance(reporte: any): Observable<ReporteAvance> {
        return this.http.post<ReporteAvance>(`${this.apiUrl}/reportes-avance`, reporte);
    }

    updateReporteAvance(id: number, reporte: any): Observable<ReporteAvance> {
        return this.http.put<ReporteAvance>(`${this.apiUrl}/reportes-avance/${id}`, reporte);
    }

    deleteReporteAvance(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/reportes-avance/${id}`);
    }

    getFichasTecnicasVisita(municipio: string): Observable<FichaTecnicaVisita[]> {
        return this.http.get<FichaTecnicaVisita[]>(`${this.apiUrl}/fichas-tecnicas-visita?municipio=${municipio}`);
    }

    getFichaTecnicaVisitaById(id: number): Observable<FichaTecnicaVisita> {
        return this.http.get<FichaTecnicaVisita>(`${this.apiUrl}/fichas-tecnicas-visita/${id}`);
    }

    /**
     * Crea una nueva ficha técnica con la posibilidad de subir un archivo.
     * @param ficha Los datos de la ficha técnica.
     * @param archivo El archivo a subir (opcional).
     * @returns Un Observable con el evento de HTTP, que permite rastrear el progreso de la subida.
     */
    createFichaTecnicaVisitaConArchivo(ficha: FichaTecnicaVisita, archivo: File | null): Observable<HttpEvent<FichaTecnicaVisita>> {
        const formData = new FormData();
        formData.append('ficha', JSON.stringify(ficha));
        if (archivo) {
            formData.append('archivo', archivo, archivo.name);
        }

        // Se configura reportProgress para obtener eventos de progreso
        return this.http.post<FichaTecnicaVisita>(`${this.apiUrl}/fichas-tecnicas-visita`, formData, {
            reportProgress: true,
            observe: 'events'
        });
    }

    /**
     * Actualiza una ficha técnica existente con la posibilidad de subir un nuevo archivo.
     * @param id El ID de la ficha a actualizar.
     * @param ficha Los datos de la ficha técnica.
     * @param archivo El nuevo archivo a subir (opcional).
     * @returns Un Observable con el evento de HTTP.
     */
    updateFichaTecnicaVisitaConArchivo(id: number, ficha: FichaTecnicaVisita, archivo: File | null): Observable<HttpEvent<FichaTecnicaVisita>> {
        const formData = new FormData();
        formData.append('ficha', JSON.stringify(ficha));
        if (archivo) {
            formData.append('archivo', archivo, archivo.name);
        }

        // Se configura reportProgress para obtener eventos de progreso
        return this.http.put<FichaTecnicaVisita>(`${this.apiUrl}/fichas-tecnicas-visita/${id}`, formData, {
            reportProgress: true,
            observe: 'events'
        });
    }

    deleteFichaTecnicaVisita(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/fichas-tecnicas-visita/${id}`);
    }
}
