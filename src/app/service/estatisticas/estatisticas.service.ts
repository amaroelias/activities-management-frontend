import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Shape do payload retornado por /api/estatisticas/gerais */
export interface EstatisticasGerais {
  quantityAllAnswers: number;
  quantityCorrectsAnswers: number;
  quantityWrongsAnswers: number;
  percentageCorrectsAnswers: number;
  percentageWrongsAnswers: number;
}

export interface FiltrosEstatisticas {
  idApp: string;
  phase?: string;
  activity?: string;
  typeOfQuestion?: string;
  startDate?: string; // yyyy-MM-dd
  endDate?: string;   // yyyy-MM-dd
}

@Injectable({ providedIn: 'root' })
export class EstatisticasService {

  private readonly API = `${environment.apiUrl}/api/estatisticas`;
  private readonly RESPONSE_API = `${environment.apiUrl}/response`;

  constructor(private http: HttpClient) {}

  /** Busca estatísticas gerais filtradas */
  getEstatisticasGerais(filtros: FiltrosEstatisticas): Observable<EstatisticasGerais> {
    let params = new HttpParams().set('idApp', filtros.idApp);
    if (filtros.phase)          params = params.set('phase', filtros.phase);
    if (filtros.activity)       params = params.set('activity', filtros.activity);
    if (filtros.typeOfQuestion) params = params.set('typeOfQuestion', filtros.typeOfQuestion);
    if (filtros.startDate)      params = params.set('startDate', filtros.startDate);
    if (filtros.endDate)        params = params.set('endDate', filtros.endDate);

    return this.http.get<EstatisticasGerais>(`${this.API}/gerais`, { params });
  }

  /** Lista de aplicações disponíveis */
  getAplicacoes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.RESPONSE_API}/getApplications`);
  }

  /** Fases disponíveis para uma aplicação */
  getFases(idApp: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.RESPONSE_API}/getPhases?idApp=${encodeURIComponent(idApp)}`
    );
  }

  /** Atividades disponíveis para uma aplicação + fase */
  getAtividades(idApp: string, phase: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.RESPONSE_API}/getActivity?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}`
    );
  }

  /** Tipos de questão disponíveis para uma aplicação */
  getTiposQuestao(idApp: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.RESPONSE_API}/getTypesOfQuestions?idApp=${encodeURIComponent(idApp)}`
    );
  }
}
