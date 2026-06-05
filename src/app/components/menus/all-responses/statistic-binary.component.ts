import { Component, OnInit } from '@angular/core';
import { ResponseService } from 'src/app/service/response/response.service';
import { ResponseStatistics } from 'src/app/models/responseStatistics';
import { Response } from 'src/app/models/response.model';

@Component({
  selector: 'app-statistic-binary',
  templateUrl: './statistic-binary.component.html',
  styleUrls: ['./statistic-binary.component.css']
})
export class StatisticBinaryComponent implements OnInit {

  responses: Response[] = [];
  dataOn: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  errorMessageOn: boolean = false;
  errorMessage: string = "";
  idApp: string = "";
  applicationsOptions: string[] = [];
  responseStatistics: ResponseStatistics = new ResponseStatistics();

  // Filtros dinâmicos adicionais
  selectedUser: string = "";
  selectedPhase: string = "";
  selectedActivity: string = "";
  selectedIsCorrect: boolean | null = null;
  selectedTypeOfQuestion: string = "";

  // Opções para preenchimento dos filtros
  usersOptions: string[] = [];
  phaseOptions: string[] = [];
  activityOptions: string[] = [];
  typeOfQuestionOptions: string[] = [];

  // Variáveis de paginação
  page: number = 0;
  size: number = 30;
  totalPages: number = 0;

  constructor(private responseService: ResponseService) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  searchResponses(idApp: string): void {
    this.idApp = idApp;
    this.page = 0;
    this.fetchFilteredData();
  }

  fetchFilteredData(): void {
    this.errorMessage = "Carregando respostas...";
    this.errorMessageOn = true;

    const filters = {
      userID: this.selectedUser,
      phase: this.selectedPhase,
      activity: this.selectedActivity,
      isCorrect: this.selectedIsCorrect,
      typeOfQuestion: this.selectedTypeOfQuestion,
      startDate: this.startDate,
      endDate: this.endDate
    };

    // Busca as respostas paginadas com os filtros aplicados
    this.responseService.getFilteredQuestions(this.idApp, filters, this.page, this.size, "dateResponse,desc").subscribe(
      (data) => {
        if (data && data.content) {
          this.responses = data.content;
          this.totalPages = data.totalPages;
          this.errorMessageOn = false;
          if (this.responses.length === 0) {
            this.errorMessage = "Nenhuma resposta encontrada para os filtros selecionados!";
            this.errorMessageOn = true;
          }
        } else {
          this.responses = [];
          this.errorMessage = "Nenhum dado retornado!";
          this.errorMessageOn = true;
        }
      },
      (error) => {
        console.error('Erro ao buscar respostas:', error);
        this.responses = [];
        this.errorMessage = "Erro ao carregar respostas!";
        this.errorMessageOn = true;
      }
    );

    // Busca as estatísticas consolidadas com os mesmos filtros aplicados
    this.responseService.getStatisticsFiltered(this.idApp, filters).subscribe(
      (stats) => {
        this.responseStatistics = stats;
      },
      (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.responseStatistics = new ResponseStatistics();
      }
    );
  }

  onAppSelected(idApp: string): void {
    this.idApp = idApp;
    this.selectedUser = "";
    this.selectedPhase = "";
    this.selectedActivity = "";
    this.selectedIsCorrect = null;
    this.selectedTypeOfQuestion = "";

    this.usersOptions = [];
    this.phaseOptions = [];
    this.activityOptions = [];
    this.typeOfQuestionOptions = [];

    if (idApp) {
      this.loadPhases(idApp);
      this.loadUsers(idApp);
      this.loadQuestionTypes(idApp);
    }
  }

  onPhaseSelected(phase: string): void {
    this.selectedPhase = phase;
    this.selectedActivity = "";
    this.activityOptions = [];

    if (phase) {
      this.loadActivities(this.idApp, phase);
    }
  }

  onUserSelected(userID: string): void {
    this.selectedUser = userID;
  }

  onActivitySelected(activity: string): void {
    this.selectedActivity = activity;
  }

  onTypeOfQuestionSelected(typeOfQuestion: string): void {
    this.selectedTypeOfQuestion = typeOfQuestion;
  }

  onIsCorrectSelected(value: string): void {
    if (value === "true") {
      this.selectedIsCorrect = true;
    } else if (value === "false") {
      this.selectedIsCorrect = false;
    } else {
      this.selectedIsCorrect = null;
    }
  }

  private loadApplications(): void {
    this.errorMessage = "Carregando aplicações...";
    this.errorMessageOn = true;
    
    this.responseService.getApplications().subscribe(
      (idApps: string[]) => {
        if (idApps.length > 0) {
          this.applicationsOptions = idApps;
          this.errorMessageOn = false;
        }
      },
      (error) => {
        console.error('Erro ao buscar as aplicações:', error);
        this.errorMessage = "Ocorreu um erro ao buscar as aplicações no banco";
        this.errorMessageOn = true;
        this.applicationsOptions = [];
      }
    );
  }

  private loadPhases(idApp: string): void {
    this.responseService.getPhases(idApp).subscribe(
      (phases) => this.phaseOptions = phases,
      (err) => console.error('Erro ao carregar fases:', err)
    );
  }

  private loadUsers(idApp: string): void {
    this.responseService.getUsers(idApp).subscribe(
      (users) => this.usersOptions = users,
      (err) => console.error('Erro ao carregar usuários:', err)
    );
  }

  private loadQuestionTypes(idApp: string): void {
    this.responseService.getTypesOfQuestions(idApp).subscribe(
      (types) => this.typeOfQuestionOptions = types,
      (err) => console.error('Erro ao carregar tipos de questões:', err)
    );
  }

  private loadActivities(idApp: string, phase: string): void {
    this.responseService.getActivity(idApp, phase).subscribe(
      (activities) => this.activityOptions = activities,
      (err) => console.error('Erro ao carregar atividades:', err)
    );
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.fetchFilteredData();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchFilteredData();
    }
  }
}
