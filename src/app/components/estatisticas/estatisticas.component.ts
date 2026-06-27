import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  EstatisticasService,
  EstatisticasGerais,
  FiltrosEstatisticas,
} from 'src/app/service/estatisticas/estatisticas.service';

@Component({
  selector: 'app-estatisticas',
  templateUrl: './estatisticas.component.html',
  styleUrls: ['./estatisticas.component.css'],
})
export class EstatisticasComponent implements OnInit {

  // geral
  isLoading = false;
  errorMessage: string | null = null;

  // Filtros
  aplicacoes: string[] = [];
  fases: string[] = [];
  atividades: string[] = [];
  tiposQuestao: string[] = [];

  filtros: FiltrosEstatisticas = { idApp: '' };
  faseSelecionada  = '';
  atividadeSelecionada = '';

  // Estatísticas
  stats: EstatisticasGerais | null = null;

  // Gráfico 1 Rosca: corretas vs incorretas
  doughnutData: ChartData<'doughnut'> = {
    labels: ['Corretas', 'Incorretas'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['rgba(29, 158, 117, 0.85)', 'rgba(216, 90, 48, 0.85)'],
      borderColor: ['#1D9E75', '#D85A30'],
      borderWidth: 2,
      hoverOffset: 12,
    }],
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Poppins', size: 12 }, padding: 18 },
      },
      title: {
        display: true,
        text: 'Corretas vs Incorretas',
        font: { family: 'Poppins', size: 14, weight: 'bold' },
        color: '#1a2840',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: ${ctx.parsed} respostas (${pct}%)`;
          },
        },
      },
    },
  };

  // Gráfico 2 Barras empilhadas: taxa de acertos por fase
  faseData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Corretas (%)',
        data: [],
        backgroundColor: 'rgba(29, 158, 117, 0.82)',
        borderColor: '#1D9E75',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Incorretas (%)',
        data: [],
        backgroundColor: 'rgba(216, 90, 48, 0.82)',
        borderColor: '#D85A30',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  faseOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { family: 'Poppins', size: 12 }, padding: 16 },
      },
      title: {
        display: true,
        text: 'Taxa de Acertos por Fase',
        font: { family: 'Poppins', size: 14, weight: 'bold' },
        color: '#1a2840',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { family: 'Poppins', size: 11 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { family: 'Poppins', size: 11 },
          callback: (v) => `${v}%`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  constructor(private estatisticasService: EstatisticasService) {}

  ngOnInit(): void {
    this.carregarAplicacoes();
  }

  // Carregamento de listas de filtro

  carregarAplicacoes(): void {
    this.estatisticasService.getAplicacoes().subscribe({
      next: apps => {
        this.aplicacoes = apps;
        if (apps.length > 0) {
          this.filtros.idApp = apps[0];
          this.onAplicacaoChange();
        }
      },
      error: () => {
        this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está ativo.';
      },
    });
  }

  onAplicacaoChange(): void {
    this.faseSelecionada = '';
    this.atividadeSelecionada = '';
    this.fases = [];
    this.atividades = [];
    this.filtros.phase = undefined;
    this.filtros.activity = undefined;

    if (!this.filtros.idApp) return;

    this.estatisticasService.getFases(this.filtros.idApp).subscribe(f => {
      this.fases = f;
      this.carregarEstatisticasPorFase();
    });
    this.estatisticasService.getTiposQuestao(this.filtros.idApp).subscribe(t => this.tiposQuestao = t);
    this.aplicarFiltros();
  }

  onFaseChange(): void {
    this.atividadeSelecionada = '';
    this.atividades = [];
    this.filtros.phase    = this.faseSelecionada    || undefined;
    this.filtros.activity = undefined;

    if (this.faseSelecionada && this.filtros.idApp) {
      this.estatisticasService
        .getAtividades(this.filtros.idApp, this.faseSelecionada)
        .subscribe(a => this.atividades = a);
    }
    this.aplicarFiltros();
  }

  onAtividadeChange(): void {
    this.filtros.activity = this.atividadeSelecionada || undefined;
    this.aplicarFiltros();
  }

  // Consulta principal

  aplicarFiltros(): void {
    if (!this.filtros.idApp) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.estatisticasService.getEstatisticasGerais(this.filtros).subscribe({
      next: data => {
        this.stats = data;
        this.atualizarDoughnut(data);
        this.carregarEstatisticasPorFase();
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = 'Erro ao carregar estatísticas. Tente novamente.';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  limparFiltros(): void {
    this.faseSelecionada = '';
    this.atividadeSelecionada = '';
    this.atividades = [];
    this.filtros = { idApp: this.filtros.idApp };
    this.aplicarFiltros();
  }

  // Gráfico 2: taxa de acertos por fase

  carregarEstatisticasPorFase(): void {
    if (!this.filtros.idApp || this.fases.length === 0) return;

    const requests = this.fases.map(fase =>
      this.estatisticasService.getEstatisticasGerais({
        idApp: this.filtros.idApp,
        phase: fase,
        startDate: this.filtros.startDate,
        endDate: this.filtros.endDate,
      })
    );

    forkJoin(requests).subscribe({
      next: results => {
        this.faseData = {
          labels: [...this.fases],
          datasets: [
            {
              ...this.faseData.datasets[0],
              data: results.map(r => r.percentageCorrectsAnswers),
            },
            {
              ...this.faseData.datasets[1],
              data: results.map(r => r.percentageWrongsAnswers),
            },
          ],
        };
      },
      error: () => {},
    });
  }

  // Atualização dos gráficos

  private atualizarDoughnut(data: EstatisticasGerais): void {
    // ng2-charts v3: cria novo objeto para forçar detecção de mudança
    this.doughnutData = {
      ...this.doughnutData,
      datasets: [{
        ...this.doughnutData.datasets[0],
        data: [data.quantityCorrectsAnswers, data.quantityWrongsAnswers],
      }],
    };
  }
}