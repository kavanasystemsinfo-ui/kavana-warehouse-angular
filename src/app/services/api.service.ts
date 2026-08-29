import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  username?: string | null;
  rol: string;
  is_super_admin?: boolean;
  session_id?: string | null;
  demo?: boolean;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  icono: string;
  descripcion?: string;
}

export interface Centro {
  id_centro: number;
  nombre_centro: string;
  nombre?: string;
  direccion?: string;
  telefono?: string;
  presupuesto_mensual?: number;
  _count?: { asignaciones?: number; inventarioCentros?: number };
  asignaciones?: Array<{
    id_asignacion: number;
    usuario: {
      id_usuario: number;
      nombre: string;
      email: string;
      rol: string;
      numero_empleado?: string;
      telefono?: string;
    }
  }>;
  inventarioCentros?: Array<{
    id_centro: number;
    id_producto: number;
    cantidad_actual: number;
    stock_fisico: number | null;
    stock_minimo: number;
    producto: { id_producto: number; nombre_producto: string; unidad_medida: string };
  }>;
}

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  unidad_medida: string;
  coste_unitario: number;
  stock_minimo_alerta: number;
}

export interface InventarioItem {
  id_centro: number;
  id_producto: number;
  cantidad_actual: number;
  producto: Producto;
  centro?: Centro;
}

export interface ConsumptionData {
  total_consumo_unidades: number;
  total_gasto_euros: number;
  total_movimientos: number;
  evolucion_mensual?: Array<{
    mes: string;
    unidades: number;
    gasto_euros: number;
  }>;
  resumen_por_centro: Array<{
    centro: { id_centro: number; nombre_centro: string; presupuesto_mensual: number };
    presupuesto_mensual: number;
    total_consumo_unidades: number;
    gasto_total_euros: number;
    movimientos: number;
    porcentaje_consumido: number;
    productos: Array<{
      id_producto: number;
      nombre_producto: string;
      unidad_medida: string;
      coste_unitario: number;
      cantidad: number;
      gasto_euros: number;
    }>;
  }>;
  movimientos: Array<{
    id_movimiento: number;
    id_centro: number;
    id_producto: number;
    id_usuario: number;
    cantidad: number;
    fecha_hora: string;
    gasto_euros: number;
    producto: { id_producto: number; nombre_producto: string; unidad_medida: string; coste_unitario: number };
    centro: { id_centro: number; nombre_centro: string; presupuesto_mensual: number };
    usuario: { id_usuario: number; nombre: string };
  }>;
}

export interface AlertsData {
  total_alertas: number;
  criticas: Array<AlertItem>;
  advertencias: Array<AlertItem>;
}

export interface AlertItem {
  id_centro: number;
  centro: string;
  id_producto: number;
  producto: string;
  unidad_medida: string;
  cantidad_actual: number;
  stock_minimo_alerta: number;
  deficit: number;
}

// --- Incidencias ---
export interface Incidencia {
  id_incidencia: number;
  id_centro: number;
  id_usuario: number;
  categoria: string;
  titulo: string;
  descripcion: string;
  foto_url: string | null;
  estado: string;
  fecha_creacion: string;
  centro: { id_centro: number; nombre_centro: string };
  usuario: { id_usuario: number; nombre: string };
}

export interface IncidenciasResponse {
  total: number;
  incidencias: Incidencia[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((response) => {
          this.setTokens(response.token, response.refreshToken);
          this.storeUser(response.usuario);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {})
      .pipe(catchError(this.handleError));
  }

  getInventario(centroId?: number): Observable<InventarioItem[]> {
    let url = `${this.apiUrl}/stock/inventory`;
    if (centroId) {
      url += `?centro=${centroId}`;
    }
    return this.http.get<{ inventario: InventarioItem[] }>(url)
      .pipe(
        map(response => response.inventario),
        catchError(this.handleError)
      );
  }

  getCentros(): Observable<Centro[]> {
    return this.http.get<{ centros: Centro[] }>(`${this.apiUrl}/centros`)
      .pipe(
        map(response => response.centros),
        catchError(this.handleError)
      );
  }

  updateCentro(id: number, data: Partial<{ nombre_centro: string; direccion: string; presupuesto_mensual: number }>): Observable<{ centro: Centro }> {
    return this.http.put<{ centro: Centro }>(`${this.apiUrl}/centros/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  createCentro(data: { nombre: string; direccion?: string; telefono?: string }): Observable<{ centro: Centro }> {
    return this.http.post<{ centro: Centro }>(`${this.apiUrl}/centros`, data)
      .pipe(catchError(this.handleError));
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<{ categorias: Categoria[] }>(`${this.apiUrl}/categorias`)
      .pipe(
        map(response => response.categorias),
        catchError(this.handleError)
      );
  }

  getConsumos(centroId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/consumos`;
    if (centroId) {
      url += `?centro=${centroId}`;
    }
    return this.http.get<{ consumos: any[] }>(url)
      .pipe(
        map(response => response.consumos),
        catchError(this.handleError)
      );
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<{ productos: Producto[] }>(`${this.apiUrl}/productos`)
      .pipe(
        map(response => response.productos || []),
        catchError(this.handleError)
      );
  }

  getCatalogoProductos(): Observable<Producto[]> {
    return this.getProductos(); // same endpoint
  }

  updateProducto(id: number, data: {
    nombre_producto?: string;
    unidad_medida?: string;
    coste_unitario?: number;
    stock_minimo_alerta?: number;
  }): Observable<{ producto: Producto }> {
    return this.http.put<{ producto: Producto }>(`${this.apiUrl}/productos/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteProducto(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/productos/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProducto(data: {
    nombre_producto: string;
    unidad_medida: string;
    coste_unitario: number;
    stock_minimo_alerta: number;
  }): Observable<{ producto: Producto }> {
    return this.http.post<{ producto: Producto }>(`${this.apiUrl}/productos`, data)
      .pipe(catchError(this.handleError));
  }

  addProductoCentro(data: {
    id_centro: number;
    id_producto: number;
    cantidad_actual: number;
    stock_minimo?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario`, data)
      .pipe(catchError(this.handleError));
  }

  getDeviations(filters?: { centro?: number }): Observable<any> {
    let url = `${this.apiUrl}/dashboard/deviations`;
    if (filters?.centro) {
      url += `?centro=${filters.centro}`;
    }
    return this.http.get(url)
      .pipe(catchError(this.handleError));
  }

  guardarConteo(idCentro: number, idProducto: number, stockFisico: number): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/inventario/${idCentro}/${idProducto}/conteo`, { stock_fisico: stockFisico })
      .pipe(catchError(this.handleError));
  }

  resetDemo(): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.post<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/demo/reset`, {})
      .pipe(catchError(this.handleError));
  }


  getPurchaseProposal(centroId?: number): Observable<any> {
    let url = `${this.apiUrl}/purchases/proposal`;
    if (centroId) {
      url += `?centro=${centroId}`;
    }
    return this.http.get(url)
      .pipe(catchError(this.handleError));
  }

  getCostes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/costes`)
      .pipe(catchError(this.handleError));
  }

  setPresupuesto(idCentro: number, valor: number): Observable<{ ok: boolean; presupuesto_mensual: number }> {
    return this.http.post<{ ok: boolean; presupuesto_mensual: number }>(`${this.apiUrl}/centros/${idCentro}/presupuesto`, { presupuesto_mensual: valor })
      .pipe(catchError(this.handleError));
  }

  getResponsables(): Observable<any[]> {
    return this.http.get<{ usuarios: any[] }>(`${this.apiUrl}/asignaciones/users`)
      .pipe(
        map(response => (response.usuarios || []).filter((u: any) => u.rol === 'responsable')),
        catchError(this.handleError)
      );
  }

  assignCentrosToResponsable(idUsuario: number, centros: number[]): Observable<{ centros_asignados: Array<{ id_centro: number; nombre_centro: string }> }> {
    return this.http.post<{ centros_asignados: Array<{ id_centro: number; nombre_centro: string }> }>(`${this.apiUrl}/usuarios/${idUsuario}/centros`, { centros })
      .pipe(catchError(this.handleError));
  }

  createResponsable(data: { nombre: string; email: string; password: string; telefono?: string }): Observable<{ usuario: any }> {
    return this.http.post<{ usuario: any }>(`${this.apiUrl}/usuarios`, data)
      .pipe(catchError(this.handleError));
  }

  getRecuentos(centroId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/recuentos`;
    if (centroId) {
      url += `?centro=${centroId}`;
    }
    return this.http.get<{ recuentos: any[] }>(url)
      .pipe(
        map(response => response.recuentos || []),
        catchError(this.handleError)
      );
  }

  // Session ID for demo (same logic as React)
  getSessionId(): string {
    const KEY = 'kavana_session_id';
    let sid = localStorage.getItem(KEY);
    if (!sid) {
      sid = `vis-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, sid);
    }
    return sid;
  }

  // Auth token handling (simplified; in a real app you'd use an interceptor)
  getAccessToken(): string | null {
    return localStorage.getItem('dashboard_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('dashboard_refresh_token');
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('dashboard_access_token', token);
    localStorage.setItem('dashboard_refresh_token', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('dashboard_access_token');
    localStorage.removeItem('dashboard_refresh_token');
    localStorage.removeItem('dashboard_user');
  }

  storeUser(user: Usuario): void {
    localStorage.setItem('dashboard_user', JSON.stringify(user));
  }

  getStoredUser(): Usuario | null {
    const raw = localStorage.getItem('dashboard_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Add to ApiService class:
  getIncidencias(filters?: { centro?: number; estado?: string; categoria?: string; desde?: string; hasta?: string }): Observable<IncidenciasResponse> {
    let url = `${this.apiUrl}/incidencias`;
    const params = new URLSearchParams();
    if (filters?.centro) params.set('centro', String(filters.centro));
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.categoria) params.set('categoria', filters.categoria);
    if (filters?.desde) params.set('desde', filters.desde);
    if (filters?.hasta) params.set('hasta', filters.hasta);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return this.http.get<IncidenciasResponse>(url)
      .pipe(catchError(this.handleError));
  }

  updateIncidencia(id: number, data: { estado: string }): Observable<{ message: string; incidencia: Incidencia }> {
    return this.http.put<{ message: string; incidencia: Incidencia }>(`${this.apiUrl}/incidencias/${id}`, data)
      .pipe(catchError(this.handleError));
  }


  // --- Supervisores demo ---
  getSupervisoresDemo(sessionId: string): Observable<any[]> {
    return this.http.get<{ supervisores: any[] }>(`${this.apiUrl}/supervisores/demo?session_id=${sessionId}`)
      .pipe(
        map(response => response.supervisores || []),
        catchError(this.handleError)
      );
  }

  createSupervisorDemo(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/supervisores/demo`, payload)
      .pipe(catchError(this.handleError));
  }
}
