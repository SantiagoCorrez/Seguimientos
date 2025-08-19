// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { CompromisoListComponent } from './components/compromiso-list/compromiso-list.component';
import { CompromisoDetailComponent } from './components/compromiso-detail/compromiso-detail.component';
import { CompromisoFormComponent } from './components/compromiso-form/compromiso-form.component';
import { ReporteAvanceFormComponent } from './components/reporte-avance-form/reporte-avance-form.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { HomeComponent } from './components/home/home.component';
import { FichaTecnicaVisitaListComponent } from './components/fichas-tecnicas-visita/ficha-list/ficha-list.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'mapa', component: MapaComponent },
    { path: 'ficha-tecnica', component: FichaTecnicaVisitaListComponent },
    { path: 'compromisos', component: CompromisoListComponent },
    { path: 'compromisos/nuevo', component: CompromisoFormComponent },
    { path: 'compromisos/editar/:codigo', component: CompromisoFormComponent },
    { path: 'compromisos/:codigo', component: CompromisoDetailComponent },
    { path: 'compromisos/:codigo/reportes-avance/nuevo', component: ReporteAvanceFormComponent },
    { path: 'reportes-avance/editar/:id', component: ReporteAvanceFormComponent },
    { path: '**', redirectTo: '/login' } // Wildcard route for any other URL
];
