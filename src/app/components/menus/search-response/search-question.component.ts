// Importando dependências necessárias do Angular
import { Component, OnInit } from '@angular/core';
import { ResponseService } from 'src/app/service/response/response.service';
import { Response } from 'src/app/models/response.model';
import { ResponseStatistics } from 'src/app/models/responseStatistics';




@Component({
  selector: 'app-search-question', // Seletor do componente
  templateUrl: './search-question.component.html', // Template HTML associado ao componente
  styleUrls: ['./search-question.component.css'] // Estilos CSS associados ao componente
})
export class SearchQuestionComponent implements OnInit {

  // Id da aplicação a ser pesquisada
  idApp: string = ""

  // Variáveis para armazenar datas de início e fim da pesquisa
  startDate = null;
  endDate = null;

  // Variável das estastísticas das respostass
  questionStatistics: ResponseStatistics = new ResponseStatistics();

  // Mensagem de erro
  errorMessage: string = "";

  // Array para armazenar as questões retornadas pela pesquisa
  questionSearch: any[] = [];

  // Variáveis para armazenar as fases e atividades selecionadas pelo usuário
  selectedPhase = "";
  selectedActivity = "";

  // Váriavel para mostrar ou não o menu de datas
  dataOn = false;

  
  applicationsOptions: string[] = [];
  phaseOptions: string[] = [];
  activityOptions: string[] = [];


  constructor(private responseService: ResponseService) { }

  ngOnInit(): void {
    this.loadApplications();
  }


  private verifyApp(app: string): boolean {
    return this.applicationsOptions.includes(app);
}
  private verifyPhase(phase: string): boolean {
    return this.phaseOptions.includes(phase);
  }

  // Verifica se contém uma aplicação válida digitada
  onClickHandler(idApp: string, phase: string) {
    if (this.verifyApp(idApp)) {
      if (idApp != this.idApp){ // Faz uma verificação para que não fazer requisições descenessárias
        this.idApp = idApp; // Define o idApp que vai ser usado para pesquisar as respostas 
        this.getPhases(idApp); // Chama o método que trás as fases disponíveis
        this.errorMessage = "";
      }
        
      if (this.verifyPhase(phase)){
        if (phase != this.selectedPhase) { // Faz uma verificação para que não fazer requisições descenessárias
          this.selectedPhase = phase; // Define a fase que vai ser usado para pesquisar as atividades 
          this.getActivity(idApp,phase); // Chama o método que trás as atividades disponíveis
          this.errorMessage = "";
        }      
        } else {
          this.errorMessage = "Por favor, digite uma Fase válida!";
        }
         
    } else{
       this.errorMessage = "Por favor, digite uma aplicação válida!";
    }
}

  // Carrega as opções de aplicações disponíveis
  private loadApplications(): void {
    this.responseService.getApplications().subscribe(
      (idApps: string[]) => {
        if (idApps.length > 0) {
          this.applicationsOptions = idApps;
          console.log("Apps:", this.applicationsOptions);
        }
      },
      (error) => {
        console.error('Erro ao buscar as aplicações:', error);
        this.errorMessage = "Ocorreu um erro ao buscar as aplicações no banco";
        this.applicationsOptions = [];
      }
    );
  }

  // Carrega as fases do aplicativos que possuí algum cadastro
  private getPhases(idApp: string): void {
    this.responseService.getPhases(idApp).subscribe(
      (phases: string[]) => {
        if (phases.length > 0) {
          this.phaseOptions = phases;
          console.log("Phases:", this.phaseOptions);
        }
      },

      (error) => {
        console.error('Erro ao buscar as fases:', error);
        this.errorMessage = "Ocorreu um erro ao buscar as fases no banco";
        this.phaseOptions = [];
      }
    );
  }

  // Carrega as atividades do aplicativos que possuí algum cadastro
  private getActivity(idApp: string, phase: string): void {
    this.responseService.getActivity(idApp,phase).subscribe(
      (activities: string[]) => {
        if (activities.length > 0) {
          this.activityOptions = activities;
          console.log("Activities:", this.activityOptions);
        }
      },

      (error) => {
        console.error('Erro ao buscar as atividades:', error);
        this.errorMessage = "Ocorreu um erro ao buscar as atividades no banco";
        this.activityOptions = [];
      }
    );
  }

  

  // Método para realizar a pesquisa da questão
  searchQuestion(phase: string, activity: string) {
    this.selectedActivity = activity;
    this.selectedPhase = phase;
    // Verifica se há alguma fase ou atividade selecionada
    if (this.selectedActivity.trim() !== "" || this.selectedPhase.trim() !== "" ) {
      // Verifica se há uma data específica
      if (this.startDate != null && this.endDate != null) {      
        this.getQuestionWithDate();
        this.getStaticsWithDate();

      } else {     
        this.getQuestion();
        this.getStatics();

      }
    } else {  
      // Limpa a lista de respostas da questão e exibe a mensagem de erro se a fase ou a atividade não estiver preenchido
      this.questionSearch = [];
      this.errorMessage = "Por favor, selecione alguma FASE e ATIVIDADE!";
    }
  }

  // Método para buscar as respostas de uma questão sem uma data específica
  getQuestion() {
    this.responseService.getSearchQuestion(this.idApp,this.selectedActivity,this.selectedPhase).subscribe(
      // Callback de sucesso
      (questions: Response[]) => {
        // Verifica se há respostas retornadas
        if (questions.length > 0) {
          // Atribui as respostas retornadas pelo serviço à variável questionSearch
          this.questionSearch = questions;
          // Limpa a mensagem de erro, caso exista
          this.errorMessage = "";
        } else {
          // Limpa a lista de respostas e exibe a mensagem de erro
          this.questionSearch = [];
          this.errorMessage = "Nenhuma resposta encontrada para a FASE e ATIVIDADE especificadas.";
        }
        this.questionSearch.reverse(); // Coloca as respostas por ordem de respostas mais recente
        console.log(this.questionSearch);
      },
      // Callback de erro
      (error) => {
        console.error('Ocorreu um erro ao buscar as respostas dessa questão:', error);
        // Limpa a lista de respostas e exibe a mensagem de erro
        this.questionSearch = [];
        this.errorMessage = "Ocorreu um erro ao buscar as respostas dessa questão específica. Por favor, tente novamente mais tarde.";
      }
    );
  }

  // Método para buscar as respostas de uma questão com uma data específica
  getQuestionWithDate() {
    if (this.startDate != null && this.endDate != null) {
      this.responseService.getSearchQuestionWithDate(this.idApp,this.selectedActivity, this.selectedPhase, this.startDate, this.endDate).subscribe(
        // Callback de sucesso
        (questions: Response[]) => {
          // Verifica se há respostas retornadas
          if (questions.length > 0) {
            // Atribui as respostas da questção retornado pelo serviço à variável questionSearch
            this.questionSearch = questions;
            // Limpa a mensagem de erro, caso exista
            this.errorMessage = "";
          } else {
            // Limpa a lista de respostas e exibe a mensagem de erro
            this.questionSearch = [];
            this.errorMessage = "Nenhuma respostas encontrada para essa FASE, ATIVIDADE e DATA especificados.";
          }
          this.questionSearch.reverse(); // Coloca as respostas por ordem de respostas mais recente
          console.log(this.questionSearch);
        },
        // Callback de erro
        (error) => {
          console.error('Ocorreu um erro ao buscar as perguntas do usuário:', error);
          // Limpa a lista de respostas e exibe a mensagem de erro
          this.questionSearch = [];
          this.errorMessage = "Ocorreu um erro ao buscar as respostas da questão. Por favor, tente novamente mais tarde.";
        }
      );
    }
  }

  // Método para buscar as estatísticas das respostas sem uma data específica
  getStatics() {
    this.responseService.getStatisticsResponse(this.idApp,this.selectedActivity,this.selectedPhase).subscribe(
      // Callback de sucesso
      (questionStatistics: ResponseStatistics) => {
        // Atribui as estatísticas das respostas retornado pelo serviço à variável questionStatistics
        this.questionStatistics = questionStatistics;
        console.log(this.questionStatistics);
        // Limpa a mensagem de erro
        this.errorMessage = "";
      },
      // Callback de erro
      (error) => {
        console.error('Ocorreu um erro ao buscar as estatísticas do usuário:', error);
        // Limpa as estatísticas do usuário em caso de erro
        this.questionStatistics = new ResponseStatistics();
        // Exibe a mensagem de erro
        this.errorMessage = "Ocorreu um erro ao buscar as estatísticas da questão específicada. Por favor, tente novamente mais tarde.";
      }
    );
  }

  // Método para buscar as estatísticas da questão com uma data específica
  getStaticsWithDate() {
    if (this.startDate != null && this.endDate != null) {
      this.responseService.getStatisticsResponseWithDate(this.idApp,this.selectedActivity, this.selectedPhase, this.startDate, this.endDate).subscribe(
        // Callback de sucesso
        (questionStatistics: ResponseStatistics) => {
          // Atribui as estatísticas da questão retornado pelo serviço à variável questionStatistics
          this.questionStatistics = questionStatistics;
          console.log(this.questionStatistics);
          // Limpa a mensagem de erro
          this.errorMessage = "";
        },
        // Callback de erro
        (error) => {
          console.error('Ocorreu um erro ao buscar as estatísticas da questão específicada:', error);
          // Limpa as estatísticas do usuário em caso de erro
          this.questionStatistics = new ResponseStatistics();
          // Exibe a mensagem de erro
          this.errorMessage = "Ocorreu um erro ao buscar as estatísticas da questão específicada. Por favor, tente novamente mais tarde.";
        }
      );
    }
  }
}

