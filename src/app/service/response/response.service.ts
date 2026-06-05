import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from 'src/app/models/response.model';
import { ResponseStatistics } from 'src/app/models/responseStatistics';
import { UserStatistics } from 'src/app/models/userStatistics';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ResponseService {
  private readonly API = `${environment.apiUrl}/response`;

  constructor(private httpClient: HttpClient) {}

  // Pega todas as respostas com paginação.
  getAllQuestion(idApp: string, page: number, size: number) {
    return this.httpClient.get<PageResponse<Response>>(
      `${this.API}?idApp=${encodeURIComponent(idApp)}&page=${page}&size=${size}`,
    );
  }

  // Pega todas as respostas com datas específicas e paginação.
  getAllQuestionWithDate(
    idApp: string,
    startDate: any,
    endDate: any,
    page: number,
    size: number,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<PageResponse<Response>>(
      `${this.API}?idApp=${encodeURIComponent(idApp)}&startDate=${startStr}&endDate=${endStr}&page=${page}&size=${size}`,
    );
  }

  // Pega todas as respostas de uma questão específica
  getSearchQuestion(idApp: string, activity: string, phase: string) {
    return this.httpClient.get<Response[]>(
      `${this.API}/getSearchResponse?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}&activity=${encodeURIComponent(activity)}`,
    );
  }

  // Pega todas as respostas de uma questão específica em uma data específica
  getSearchQuestionWithDate(
    idApp: string,
    activity: string,
    phase: string,
    startDate: any,
    endDate: any,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<Response[]>(
      `${this.API}/getSearchResponse?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}&activity=${encodeURIComponent(activity)}&startDate=${startStr}&endDate=${endStr}`,
    );
  }

  // Pega todas as estatísticas de uma questão específica
  getStatisticsResponse(idApp: string, activity: string, phase: string) {
    return this.httpClient.get<ResponseStatistics>(
      `${this.API}/getStatisticsResponse?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}&activity=${encodeURIComponent(activity)}`,
    );
  }

  // Pega todas as estatísticas de uma questão específica em uma data específica
  getStatisticsResponseWithDate(
    idApp: string,
    activity: string,
    phase: string,
    startDate: any,
    endDate: any,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<ResponseStatistics>(
      `${this.API}/getStatisticsResponse?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}&activity=${encodeURIComponent(activity)}&startDate=${startStr}&endDate=${endStr}`,
    );
  }

  // Pega todas as questões de um usuário específico.
  getQuestionsOfUser(userID: string, idApp: string) {
    return this.httpClient.get<Response[]>(
      `${this.API}/getUniqueUser?userID=${encodeURIComponent(userID)}&idApp=${encodeURIComponent(idApp)}`,
    );
  }

  // Pega todas as questões de um usuário específico e em uma data específica.
  getQuestionsOfUserWithDate(
    userID: string,
    idApp: string,
    startDate: any,
    endDate: any,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<Response[]>(
      `${this.API}/getUniqueUser?userID=${encodeURIComponent(userID)}&idApp=${encodeURIComponent(idApp)}&startDate=${startStr}&endDate=${endStr}`,
    );
  }

  // Pega todas as estatísticas de um usuário específico.
  getStatisticsUser(userID: string, idApp: string) {
    return this.httpClient.get<UserStatistics>(
      `${this.API}/getStatisticsUser?userID=${encodeURIComponent(userID)}&idApp=${encodeURIComponent(idApp)}`,
    );
  }

  // Pega todas as estatísticas de um usuário específico em uma data específica.
  getStatisticsUserWithDate(
    userID: string,
    idApp: string,
    startDate: any,
    endDate: any,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<UserStatistics>(
      `${this.API}/getStatisticsUser?userID=${encodeURIComponent(userID)}&idApp=${encodeURIComponent(idApp)}&startDate=${startStr}&endDate=${endStr}`,
    );
  }

  // Pega as estatísticas de todas as respostas
  getStatisticsAllResponse(idApp: string) {
    return this.httpClient.get<ResponseStatistics>(
      `${this.API}/getStatisticsAllResponse?idApp=${encodeURIComponent(idApp)}`,
    );
  }

  // Pega as estatísticas de todas as respostas com data específica
  getStatisticsAllResponseWithDate(
    idApp: string,
    startDate: any,
    endDate: any,
  ) {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    return this.httpClient.get<ResponseStatistics>(
      `${this.API}/getStatisticsAllResponse?idApp=${encodeURIComponent(idApp)}&startDate=${startStr}&endDate=${endStr}`,
    );
  }

  // Pega todas as aplicações com respostas cadastradas no backend/db
  getApplications() {
    return this.httpClient.get<string[]>(`${this.API}/getApplications`);
  }

  // Pega todos os usuários com respostas cadastradas na aplicação específica
  getUsers(idApp: string) {
    return this.httpClient.get<string[]>(`${this.API}/getUsers?idApp=${encodeURIComponent(idApp)}`);
  }

  getPhases(idApp: string) {
    return this.httpClient.get<string[]>(
      `${this.API}/getPhases?idApp=${encodeURIComponent(idApp)}`,
    );
  }

  getActivity(idApp: string, phase: string) {
    return this.httpClient.get<string[]>(
      `${this.API}/getActivity?idApp=${encodeURIComponent(idApp)}&phase=${encodeURIComponent(phase)}`,
    );
  }

  // -- NOVOS MÉTODOS DE FILTRAGEM DINÂMICA --

  getFilteredQuestions(
    idApp: string,
    filters: {
      userID?: string;
      phase?: string;
      activity?: string;
      isCorrect?: boolean | null;
      typeOfQuestion?: string;
      startDate?: any;
      endDate?: any;
    },
    page: number,
    size: number,
    sort?: string
  ): Observable<PageResponse<Response>> {
    let query = `idApp=${encodeURIComponent(idApp)}&page=${page}&size=${size}`;
    if (filters.userID) query += `&userID=${encodeURIComponent(filters.userID)}`;
    if (filters.phase) query += `&phase=${encodeURIComponent(filters.phase)}`;
    if (filters.activity) query += `&activity=${encodeURIComponent(filters.activity)}`;
    if (filters.isCorrect !== undefined && filters.isCorrect !== null) query += `&isCorrect=${filters.isCorrect}`;
    if (filters.typeOfQuestion) query += `&typeOfQuestion=${encodeURIComponent(filters.typeOfQuestion)}`;
    
    const startStr = this.formatDate(filters.startDate);
    const endStr = this.formatDate(filters.endDate);
    if (startStr) query += `&startDate=${startStr}`;
    if (endStr) query += `&endDate=${endStr}`;
    if (sort) query += `&sort=${encodeURIComponent(sort)}`;

    return this.httpClient.get<PageResponse<Response>>(`${this.API}?${query}`);
  }

  getStatisticsFiltered(
    idApp: string,
    filters: {
      userID?: string;
      phase?: string;
      activity?: string;
      isCorrect?: boolean | null;
      typeOfQuestion?: string;
      startDate?: any;
      endDate?: any;
    }
  ): Observable<ResponseStatistics> {
    let query = `idApp=${encodeURIComponent(idApp)}`;
    if (filters.userID) query += `&userID=${encodeURIComponent(filters.userID)}`;
    if (filters.phase) query += `&phase=${encodeURIComponent(filters.phase)}`;
    if (filters.activity) query += `&activity=${encodeURIComponent(filters.activity)}`;
    if (filters.isCorrect !== undefined && filters.isCorrect !== null) query += `&isCorrect=${filters.isCorrect}`;
    if (filters.typeOfQuestion) query += `&typeOfQuestion=${encodeURIComponent(filters.typeOfQuestion)}`;
    
    const startStr = this.formatDate(filters.startDate);
    const endStr = this.formatDate(filters.endDate);
    if (startStr) query += `&startDate=${startStr}`;
    if (endStr) query += `&endDate=${endStr}`;

    return this.httpClient.get<ResponseStatistics>(`${this.API}/getStatisticsAllResponse?${query}`);
  }

  getTypesOfQuestions(idApp: string): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${this.API}/getTypesOfQuestions?idApp=${encodeURIComponent(idApp)}`
    );
  }

  private formatDate(date: any): string | null {
    if (!date) return null;
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date.toString();
  }
}
