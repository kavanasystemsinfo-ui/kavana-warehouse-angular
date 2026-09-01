import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { PeriodoService } from '../services/periodo.service';
import { PeriodoSelectorComponent } from '../components/periodo-selector/periodo-selector.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, PeriodoSelectorComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  sidebarOpen = false;
  contactoOpen = false;

  constructor(public api: ApiService, private router: Router, public periodo: PeriodoService) {}

  @HostListener('window:keydown.escape')
  onEsc(): void {
    this.sidebarOpen = false;
  }

  closeOnNav(): void {
    this.sidebarOpen = false;
  }

  handleLogout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}