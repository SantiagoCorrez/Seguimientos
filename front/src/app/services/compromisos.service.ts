// src/app/services/compromisos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compromiso } from '../models/compromiso';
import { ReporteAvance } from '../models/reporte-avance';
import { FichaTecnicaVisita } from '../models/ficha-tecnica-visita.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CompromisosService {
    private apiUrl = '/api'; // URL base de tu backend Node.js

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    constructor(private http: HttpClient, private authService: AuthService) { }

    // --- Métodos para Compromisos ---

    getCompromisos(): Observable<Compromiso[]> {
        return this.http.get<Compromiso[]>(`${this.apiUrl}/compromisos`, { headers: this.getAuthHeaders() });
    }

    getCompromisoById(id: number): Observable<Compromiso> {
        return this.http.get<Compromiso>(`${this.apiUrl}/compromisos/id/${id}`, { headers: this.getAuthHeaders() });
    }

    createCompromiso(compromiso: Compromiso): Observable<Compromiso> {
        return this.http.post<Compromiso>(`${this.apiUrl}/compromisos`, compromiso, { headers: this.getAuthHeaders() });
    }

    updateCompromisoById(id: number, compromiso: Compromiso): Observable<Compromiso> {
        return this.http.put<Compromiso>(`${this.apiUrl}/compromisos/id/${id}`, compromiso, { headers: this.getAuthHeaders() });
    }

    deleteCompromiso(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/compromisos/id/${id}`, { headers: this.getAuthHeaders() });
    }

    getFilteredMetrics(filters: any): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/public/filtrar/metricas`, { params: filters });
    }

    getFilteredProjects(filters: any): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/public/filtrar/proyectos`, { params: filters });
    }

    // --- Métodos para Reportes de Avance ---

    getReportesAvance(compromisoCodigo: string): Observable<ReporteAvance[]> {
        return this.http.get<ReporteAvance[]>(`${this.apiUrl}/compromisos/${compromisoCodigo}/reportes-avance`, { headers: this.getAuthHeaders() });
    }

    getReporteAvanceById(id: number): Observable<ReporteAvance> {
        return this.http.get<ReporteAvance>(`${this.apiUrl}/reportes-avance/${id}`, { headers: this.getAuthHeaders() });
    }

    createReporteAvance(reporte: any): Observable<ReporteAvance> {
        return this.http.post<ReporteAvance>(`${this.apiUrl}/reportes-avance`, reporte, { headers: this.getAuthHeaders() });
    }

    updateReporteAvance(id: number, reporte: any): Observable<ReporteAvance> {
        return this.http.put<ReporteAvance>(`${this.apiUrl}/reportes-avance/${id}`, reporte, { headers: this.getAuthHeaders() });
    }

    deleteReporteAvance(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/reportes-avance/${id}`, { headers: this.getAuthHeaders() });
    }

    getFichasTecnicasVisita(municipio: string): Observable<FichaTecnicaVisita[]> {
        return this.http.get<FichaTecnicaVisita[]>(`${this.apiUrl}/fichas-tecnicas-visita?municipio=${municipio}`, { headers: this.getAuthHeaders() });
    }

    getFichaTecnicaVisitaById(id: number): Observable<FichaTecnicaVisita> {
        return this.http.get<FichaTecnicaVisita>(`${this.apiUrl}/fichas-tecnicas-visita/${id}`, { headers: this.getAuthHeaders() });
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
            observe: 'events',
            headers: this.getAuthHeaders()
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
            observe: 'events',
            headers: this.getAuthHeaders()
        });
    }

    deleteFichaTecnicaVisita(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/fichas-tecnicas-visita/${id}`, { headers: this.getAuthHeaders() });
    }

    getImageAsArrayBuffer(url: string): Observable<ArrayBuffer> {
        return this.http.get(url, { responseType: 'arraybuffer' });
    }

    getInfoWikipedia(term: string): Observable<any> {
        const wikipediaApiUrl = `https://es.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${encodeURIComponent(term)}&prop=parsetree&formatversion=2`;
        return this.http.get<any>(wikipediaApiUrl);
    }
}
