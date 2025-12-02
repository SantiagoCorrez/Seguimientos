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
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserAdminComponent } from './components/user-admin/user-admin.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'mapa', component: MapaComponent, canActivate: [AuthGuard] },
    { path: 'ficha-tecnica', component: FichaTecnicaVisitaListComponent, canActivate: [AuthGuard] },
    { path: 'compromisos', component: CompromisoListComponent, canActivate: [AuthGuard] },
    { path: 'compromisos/nuevo', component: CompromisoFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Administrador', 'Editor'] } },
    { path: 'compromisos/editar/:id', component: CompromisoFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Administrador', 'Editor'] } },
    { path: 'compromisos/:id', component: CompromisoDetailComponent, canActivate: [AuthGuard] },
    { path: 'compromisos/:id/reportes-avance/nuevo', component: ReporteAvanceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Administrador', 'Editor'] } },
    { path: 'reportes-avance/editar/:id', component: ReporteAvanceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Administrador', 'Editor'] } },
    { path: 'admin/users', component: UserAdminComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Administrador'] } },
    { path: '**', redirectTo: '/login' } // Wildcard route for any other URL
];
