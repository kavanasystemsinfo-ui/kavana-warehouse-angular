import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Cliente API del panel KAVANA WAREHOUSE (migrado del dashboard React).
// Endpoints verificados contra src/app.js del backend (2026-08-31):
// - NO existe /auth/refresh ni /auth/logout: el logout es local (borrar tokens).
// - Supervisores demo viven en /supervisores (GET con ?session_id=, POST para crear),
//   NO en /supervisores/demo (lo que usaba la primera versión de este repo, 404).
// - GET /incidencias devuelve solo { incidencias } (no { total }): total se calcula.

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
    };
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

export interface DeviationItem {
  centro: { id_centro: number; nombre_centro: string };
  producto: { id_producto: number; nombre_producto: string; unidad_medida: string; coste_unitario: number };
  cantidad_actual: number;
  stock_fisico: number | null;
  desviacion: number | null;
  porcentaje_desviacion: number | null;
  coste_desviacion: number;
  estado: 'falta' | 'sobra' | 'pendiente' | 'normal';
}

export interface DeviationsData {
  mes: string;
  total_desviaciones: number;
  desviaciones: DeviationItem[];
}

export interface CosteCentro {
  centro: { id_centro: number; nombre_centro: string };
  coste_material: number;
  presupuesto_mensual: number;
  porcentaje_usado: number | null;
  diferencia: number | null;
  estado: 'verde' | 'ambar' | 'rojo' | 'sin_presupuesto';
}

export interface CostesData {
  mes: string;
  total_coste: number;
  total_presupuesto: number;
  centros: CosteCentro[];
}

export interface Responsable {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string | null;
  centros_asignados?: Array<{ id_centro: number; nombre_centro: string }>;
}

export interface SupervisorDemo {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  session_id: string | null;
  expira_en: string | null;
}

export interface Recuento {
  id_movimiento: number;
  fecha_hora: string;
  responsable: { id_usuario: number; nombre: string };
  centro: { id_centro: number; nombre_centro: string };
  producto: { id_producto: number; nombre_producto: string; unidad_medida: string };
  cantidad_nueva: number;
}

export interface PurchaseProposal {
  fecha_generacion: string;
  total_articulos: number;
  total_unidades: number;
  total_coste_estimado: number;
  propuestas: Array<{
    centro: { id_centro: number; nombre_centro: string };
    producto: { id_producto: number; nombre_producto: string; unidad_medida: string; coste_unitario: number };
    stock_actual: number;
    stock_minimo: number;
    deficit: number;
    cantidad_pedido: number;
    coste_estimado: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // Error handler sin window.alert (el alert bloqueaba el hilo del navegador
  // y rompía las pruebas e2e; cada componente muestra su propio error en DOM).
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión. Por favor, inténtalo de nuevo.`;
    } else if (error.status === 401) {
      errorMessage = error.error?.error || 'Su sesión ha expirado o no tiene acceso. Por favor, inicie sesión de nuevo.';
    } else if (error.status === 403) {
      errorMessage = error.error?.error || 'No tiene permisos para realizar esta acción.';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Por favor, inténtalo de nuevo cuando tengas cobertura.';
    } else {
      errorMessage = error.error?.error || `Error del servidor (${error.status}).`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // --- Auth ---
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

  // Logout local: el backend no expone POST /auth/logout (verificado en app.js).
  logout(): void {
    this.clearTokens();
  }

  isLoggedIn(): boolean {
    return this.getStoredUser() !== null && this.getAccessToken() !== null;
  }

  // Visitante de la demo: supervisor con session_id (24h) o la cuenta demo
  // (warehouse/kavana). Lo existente es solo lectura; puede CREAR cosas nuevas
  // que caducan en 24h.
  esVisita(): boolean {
    const u = this.getStoredUser();
    return Boolean(u?.session_id || u?.demo);
  }

  // --- Dashboard ---
  getConsumption(filters?: { centro?: number; producto?: number; desde?: string; hasta?: string }): Observable<ConsumptionData> {
    const params = new URLSearchParams();
    if (filters?.centro) params.set('centro', String(filters.centro));
    if (filters?.producto) params.set('producto', String(filters.producto));
    if (filters?.desde) params.set('desde', filters.desde);
    if (filters?.hasta) params.set('hasta', filters.hasta);
    const qs = params.toString();
    return this.http.get<ConsumptionData>(`${this.apiUrl}/dashboard/consumption${qs ? `?${qs}` : ''}`)
      .pipe(catchError(this.handleError));
  }

  getAlerts(): Observable<AlertsData> {
    return this.http.get<AlertsData>(`${this.apiUrl}/dashboard/alerts`)
      .pipe(catchError(this.handleError));
  }

  // --- Stock ---
  getInventario(centroId?: number): Observable<InventarioItem[]> {
    let url = `${this.apiUrl}/stock/inventory`;
    if (centroId) url += `?centro=${centroId}`;
    return this.http.get<{ inventario: InventarioItem[] }>(url)
      .pipe(
        map((response) => response.inventario),
        catchError(this.handleError)
      );
  }

  getCentros(): Observable<Centro[]> {
    return this.http.get<{ centros: Centro[] }>(`${this.apiUrl}/centros`)
      .pipe(
        map((response) => response.centros),
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
        map((response) => response.categorias),
        catchError(this.handleError)
      );
  }

  getConsumos(centroId?: number): Observable<ConsumptionData['movimientos']> {
    let url = `${this.apiUrl}/consumos`;
    if (centroId) url += `?centro=${centroId}`;
    return this.http.get<{ consumos: ConsumptionData['movimientos'] }>(url)
      .pipe(
        map((response) => response.consumos),
        catchError(this.handleError)
      );
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<{ productos: Producto[] }>(`${this.apiUrl}/productos`)
      .pipe(
        map((response) => response.productos || []),
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

  // --- Deviations ---
  getDeviations(filters?: { centro?: number }): Observable<DeviationsData> {
    let url = `${this.apiUrl}/dashboard/deviations`;
    if (filters?.centro) url += `?centro=${filters.centro}`;
    return this.http.get<DeviationsData>(url)
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

  // --- Purchases ---
  getPurchaseProposal(centroId?: number): Observable<PurchaseProposal> {
    let url = `${this.apiUrl}/purchases/proposal`;
    if (centroId) url += `?centro=${centroId}`;
    return this.http.get<PurchaseProposal>(url)
      .pipe(catchError(this.handleError));
  }

  // --- Costes ---
  getCostes(): Observable<CostesData> {
    return this.http.get<CostesData>(`${this.apiUrl}/dashboard/costes`)
      .pipe(catchError(this.handleError));
  }

  setPresupuesto(idCentro: number, valor: number): Observable<{ ok: boolean; presupuesto_mensual: number }> {
    return this.http.post<{ ok: boolean; presupuesto_mensual: number }>(`${this.apiUrl}/centros/${idCentro}/presupuesto`, { presupuesto_mensual: valor })
      .pipe(catchError(this.handleError));
  }

  // --- Responsables ---
  getResponsables(): Observable<Responsable[]> {
    return this.http.get<{ usuarios: Responsable[] }>(`${this.apiUrl}/asignaciones/users`)
      .pipe(
        map((response) => (response.usuarios || []).filter((u) => u.rol === 'responsable')),
        catchError(this.handleError)
      );
  }

  assignCentrosToResponsable(idUsuario: number, centros: number[]): Observable<{ centros_asignados: Array<{ id_centro: number; nombre_centro: string }> }> {
    return this.http.post<{ centros_asignados: Array<{ id_centro: number; nombre_centro: string }> }>(`${this.apiUrl}/usuarios/${idUsuario}/centros`, { centros })
      .pipe(catchError(this.handleError));
  }

  createResponsable(data: { nombre: string; email: string; password: string; telefono?: string }): Observable<{ usuario: Responsable }> {
    return this.http.post<{ usuario: Responsable }>(`${this.apiUrl}/usuarios`, data)
      .pipe(catchError(this.handleError));
  }

  // --- Recuentos ---
  getRecuentos(centroId?: number): Observable<Recuento[]> {
    let url = `${this.apiUrl}/recuentos`;
    if (centroId) url += `?centro=${centroId}`;
    return this.http.get<{ recuentos: Recuento[] }>(url)
      .pipe(
        map((response) => response.recuentos || []),
        catchError(this.handleError)
      );
  }

  // --- Incidencias ---
  getIncidencias(filters?: { centro?: number; estado?: string; categoria?: string; desde?: string; hasta?: string }): Observable<IncidenciasResponse> {
    let url = `${this.apiUrl}/incidencias`;
    const params = new URLSearchParams();
    if (filters?.centro) params.set('centro', String(filters.centro));
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.categoria) params.set('categoria', filters.categoria);
    if (filters?.desde) params.set('desde', filters.desde);
    if (filters?.hasta) params.set('hasta', filters.hasta);
    if (params.toString()) url += `?${params.toString()}`;
    // El backend devuelve solo { incidencias } (sin total): se calcula aquí.
    return this.http.get<{ incidencias: Incidencia[] }>(url)
      .pipe(
        map((response) => ({ incidencias: response.incidencias, total: response.incidencias.length })),
        catchError(this.handleError)
      );
  }

  updateIncidencia(id: number, data: { estado: string }): Observable<{ message: string; incidencia: Incidencia }> {
    return this.http.put<{ message: string; incidencia: Incidencia }>(`${this.apiUrl}/incidencias/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // --- Supervisores demo (endpoints reales /supervisores, NO /supervisores/demo) ---
  getSupervisoresDemo(sessionId: string): Observable<SupervisorDemo[]> {
    return this.http.get<{ supervisores: SupervisorDemo[] }>(`${this.apiUrl}/supervisores?session_id=${encodeURIComponent(sessionId)}`)
      .pipe(
        map((response) => response.supervisores || []),
        catchError(this.handleError)
      );
  }

  createSupervisorDemo(payload: { nombre: string; email: string; password: string; session_id: string }): Observable<{ supervisor: SupervisorDemo }> {
    return this.http.post<{ supervisor: SupervisorDemo }>(`${this.apiUrl}/supervisores`, payload)
      .pipe(catchError(this.handleError));
  }

  // --- Session ID (etiqueta de visitante para la demo) ---
  getSessionId(): string {
    const KEY = 'kavana_session_id';
    let sid = localStorage.getItem(KEY);
    if (!sid) {
      sid = `vis-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, sid);
    }
    return sid;
  }

  // --- Token storage ---
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
}