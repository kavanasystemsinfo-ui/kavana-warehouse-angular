import { Component } from '@angular/core';

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [],
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss']
})
export class AsistenteComponent {
  constructor() { }

  trackById(index: number, item: any): number {
    return item.id ?? index;
  }
  getBarWidth(value: number | null): number {
    return value !== null ? Math.min(value, 100) : 0;
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("es-ES");
  }

}
