import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CostesComponent } from './pages/costes/costes.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ResponsablesComponent } from './pages/responsables/responsables.component';
import { CentrosComponent } from './pages/centros/centros.component';
import { DeviationsComponent } from './pages/deviations/deviations.component';
import { IncidentsComponent } from './pages/incidents/incidents.component';
import { AsistenteComponent } from './pages/asistente/asistente.component';
import { SupervisoresComponent } from './pages/supervisores/supervisores.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'costes', component: CostesComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'responsables', component: ResponsablesComponent },
      { path: 'centros', component: CentrosComponent },
      { path: 'desviaciones', component: DeviationsComponent },
      { path: 'incidents', component: IncidentsComponent },
      { path: 'asistente', component: AsistenteComponent },
      { path: 'supervisores', component: SupervisoresComponent },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];