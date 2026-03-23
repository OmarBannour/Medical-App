import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Chart, registerables } from 'chart.js';
import { AuthService } from "../../auth.service";
import { ChartConfiguration, ChartType } from "chart.js";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { NotificationService } from "../../notification.service";
import { MedicalDocumentService } from "../../medical-document.service";
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

interface ChartPeriod {
  value: string;
  label: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashbored.component.html", // Corrected filename
  imports: [CommonModule, SidebarComponent, HeaderComponent, ChartModule, FormsModule],
  standalone: true,
})
export class DashboardComponent implements OnInit {
  NumberOfAppointments: number = 0;
  TodayAppointment: number = 0;
  ReportNumber: number = 0;
  ECGNumber: number = 0;
  labResultNumber: number = 0;
  isOpen: boolean = false;
  NumberOfPatients: number = 0;
  isLoading: boolean = true;
  loadingPatientChart: boolean = true;
  loadingAppointmentChart: boolean = true;

  // Chart period selection options
  chartPeriods: ChartPeriod[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];
  selectedPeriod: string = 'monthly';

  // Patient growth chart configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Patients Growth',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 0.8)',
      fill: 'origin',
      tension: 0.4
    }]
  };

  // Appointment growth chart configuration
  public lineChartDataAPP: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Appointments Growth',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 0.8)',
      fill: 'origin',
      tension: 0.4
    }]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          color: '#9ca3af',
          precision: 0,
          callback: (value) => value
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuad'
    }
  };

  public lineChartType: ChartType = 'line';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private medicalDocumentService: MedicalDocumentService
  ) {}

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  // Utility methods that work with any data array
  private calculateAverage(data: number[]): number {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / data.length);
  }

  private calculateTotal(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0);
  }

  // Patient chart methods
  getCurrentValue(): number {
    const data = this.lineChartData.datasets[0]?.data;
    if (!data || data.length === 0) return 0;

    const lastValue = data[data.length - 1];
    return typeof lastValue === 'number' ? lastValue : 0;
  }

  getAverageLabel(): string {
    const labelsMap: Record<string, string> = {
      weekly: 'Weekly Average',
      monthly: 'Monthly Average',
      yearly: 'Yearly Average'
    };
    return labelsMap[this.selectedPeriod] || 'Average';
  }

  getAverageValue(): number {
    const data = this.lineChartData.datasets[0]?.data as number[];
    if (!data || data.length === 0) return 0;

    return this.calculateAverage(data);
  }

  getTotalValue(): number {
    const data = this.lineChartData.datasets[0]?.data as number[];
    if (!data || data.length === 0) return 0;

    return this.calculateTotal(data);
  }

  // Appointment chart methods
  getCurrentValueApp(): number {
    const data = this.lineChartDataAPP.datasets[0]?.data;
    if (!data || data.length === 0) return 0;

    const lastValue = data[data.length - 1];
    return typeof lastValue === 'number' ? lastValue : 0;
  }

  getAverageLabelApp(): string {
    const labelsMap: Record<string, string> = {
      weekly: 'Weekly Average',
      monthly: 'Monthly Average',
      yearly: 'Yearly Average'
    };
    return labelsMap[this.selectedPeriod] || 'Average';
  }

  getAverageValueApp(): number {
    const data = this.lineChartDataAPP.datasets[0]?.data as number[];
    if (!data || data.length === 0) return 0;

    return this.calculateAverage(data);
  }

  getTotalValueApp(): number {
    const data = this.lineChartDataAPP.datasets[0]?.data as number[];
    if (!data || data.length === 0) return 0;

    return this.calculateTotal(data);
  }

  // Period change handlers
  onPeriodChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPeriod = selectElement.value;
    this.loadChartData();
    this.loadChartDataApp();
  }

  onPeriodChangeApp(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPeriod = selectElement.value;
    this.loadChartDataApp();
  }

  // Patient data loading methods
  private loadChartData(): void {
    this.loadingPatientChart = true;

    const loadMethods: Record<string, () => void> = {
      weekly: () => this.loadWeeklyData(),
      monthly: () => this.loadMonthlyData(),
      yearly: () => this.loadYearlyData()
    };

    const loadMethod = loadMethods[this.selectedPeriod] || this.loadMonthlyData;
    loadMethod();
  }

  private loadWeeklyData(): void {
    this.authService.PatientsEvolutionWeekly().pipe(
      finalize(() => this.loadingPatientChart = false)
    ).subscribe({
      next: (apiData) => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const labels = [];
        const counts = [];

        // Create a map of existing data for easy lookup
        const dataMap = new Map<number, number>();
        if (apiData && Array.isArray(apiData)) {
          apiData.forEach((item: { day: string | Date, count: number }) => {
            const date = new Date(item.day);
            dataMap.set(date.getDay(), item.count);
          });
        }

        // Get current date and calculate last 7 days
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)

          labels.push(dayNames[dayOfWeek]);
          counts.push(dataMap.get(dayOfWeek) || 0); // Use 0 if no data for this day
        }

        this.updateChartData(labels, counts);
      },
      error: (err) => {
        console.error('Error loading weekly patient data', err);
        this.updateChartData([], []);
      }
    });
  }

  private loadMonthlyData(): void {
    this.authService.PatientsEvolutionMonthly().pipe(
      finalize(() => this.loadingPatientChart = false)
    ).subscribe({
      next: (data) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        const counts = [];

        for (let i = 11; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          labels.push(monthNames[monthIndex]);

          const monthData = data?.find((d: { month: number }) => d.month === monthIndex + 1);
          counts.push(monthData?.count || 0);
        }

        this.updateChartData(labels, counts);
      },
      error: (err) => {
        console.error('Error loading monthly patient data', err);
        this.updateChartData([], []);
      }
    });
  }

  private loadYearlyData(): void {
    this.authService.PatientsEvolutionYearly().pipe(
      finalize(() => this.loadingPatientChart = false)
    ).subscribe({
      next: (apiData) => {
        const currentYear = new Date().getFullYear();
        const labels = [];
        const counts = [];

        // Create a map of existing data for easy lookup
        const dataMap = new Map<number, number>();
        if (apiData && Array.isArray(apiData)) {
          apiData.forEach((item: { year: number, count: number }) => {
            dataMap.set(item.year, item.count);
          });
        }

        // Show last 5 years
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          labels.push(year.toString());
          counts.push(dataMap.get(year) || 0); // Use 0 if no data for this year
        }

        this.updateChartData(labels, counts);
      },
      error: (err) => {
        console.error('Error loading yearly patient data', err);
        this.updateChartData([], []);
      }
    });
  }

  private updateChartData(labels: string[], counts: number[]): void {
    this.lineChartData = {
      ...this.lineChartData,
      labels: labels,
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: counts
      }]
    };
  }

  // Appointment data loading methods
  private loadChartDataApp(): void {
    this.loadingAppointmentChart = true;

    const loadMethods: Record<string, () => void> = {
      weekly: () => this.loadWeeklyDataApp(),
      monthly: () => this.loadMonthlyDataApp(),
      yearly: () => this.loadYearlyDataApp()
    };

    const loadMethod = loadMethods[this.selectedPeriod] || this.loadMonthlyDataApp;
    loadMethod();
  }

  private loadWeeklyDataApp(): void {
    this.notificationService.notificationByWeek().pipe(
      finalize(() => this.loadingAppointmentChart = false)
    ).subscribe({
      next: (apiData) => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const labels = [];
        const counts = [];

        // Create a map of existing data for easy lookup
        const dataMap = new Map<number, number>();
        if (apiData && Array.isArray(apiData)) {
          apiData.forEach((item: { day: string | Date, count: number }) => {
            const date = new Date(item.day);
            dataMap.set(date.getDay(), item.count);
          });
        }

        // Get current date and calculate last 7 days
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)

          labels.push(dayNames[dayOfWeek]);
          counts.push(dataMap.get(dayOfWeek) || 0); // Use 0 if no data for this day
        }

        this.updateChartDataApp(labels, counts);
      },
      error: (err) => {
        console.error('Error loading weekly appointment data', err);
        this.updateChartDataApp([], []);
      }
    });
  }

  private loadMonthlyDataApp(): void {
    this.notificationService.notificationByMonth().pipe(
      finalize(() => this.loadingAppointmentChart = false)
    ).subscribe({
      next: (data) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        const counts = [];

        for (let i = 11; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          labels.push(monthNames[monthIndex]);

          const monthData = data?.find((d: { month: number }) => d.month === monthIndex + 1);
          counts.push(monthData?.count || 0);
        }

        this.updateChartDataApp(labels, counts);
      },
      error: (err) => {
        console.error('Error loading monthly appointment data', err);
        this.updateChartDataApp([], []);
      }
    });
  }

  private loadYearlyDataApp(): void {
    this.notificationService.notifiactionByYear().pipe(
      finalize(() => this.loadingAppointmentChart = false)
    ).subscribe({
      next: (apiData) => {
        const currentYear = new Date().getFullYear();
        const labels = [];
        const counts = [];

        // Create a map of existing data for easy lookup
        const dataMap = new Map<number, number>();
        if (apiData && Array.isArray(apiData)) {
          apiData.forEach((item: { year: number, count: number }) => {
            dataMap.set(item.year, item.count);
          });
        }

        // Show last 5 years
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          labels.push(year.toString());
          counts.push(dataMap.get(year) || 0); // Use 0 if no data for this year
        }

        this.updateChartDataApp(labels, counts);
      },
      error: (err) => {
        console.error('Error loading yearly appointment data', err);
        this.updateChartDataApp([], []);
      }
    });
  }

  private updateChartDataApp(labels: string[], counts: number[]): void {
    this.lineChartDataAPP = {
      ...this.lineChartDataAPP,
      labels: labels,
      datasets: [{
        ...this.lineChartDataAPP.datasets[0],
        data: counts
      }]
    };
  }

  ngOnInit(): void {
    // Initialize both charts with loading indicators
    this.loadChartData();
    this.loadChartDataApp();

    // Load dashboard metrics in parallel
    this.loadDashboardMetrics();
  }

  private loadDashboardMetrics(): void {
    this.isLoading = true;

    // Create an array of observables for parallel execution
    const metrics = [
      this.authService.countAllPatients(),
      this.notificationService.countappointmentNotfications(),
      this.notificationService.TodayAppointments(),
      this.medicalDocumentService.CountReports(),
      this.medicalDocumentService.CountECG(),
      this.medicalDocumentService.CountLAbResults()
    ];

    // Execute all requests in parallel
    forkJoin(metrics)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: ([patientCount, appointmentCount, todayAppointments, reportCount, ecgCount, labCount]) => {
          this.NumberOfPatients = patientCount;
          this.NumberOfAppointments = appointmentCount;
          this.TodayAppointment = todayAppointments;
          this.ReportNumber = reportCount;
          this.ECGNumber = ecgCount;
          this.labResultNumber = labCount;
        },
        error: (err) => {
          console.error('Error loading dashboard metrics', err);
          // Set default values for metrics on error
          this.NumberOfPatients = 0;
          this.NumberOfAppointments = 0;
          this.TodayAppointment = 0;
          this.ReportNumber = 0;
          this.ECGNumber = 0;
          this.labResultNumber = 0;
        }
      });
  }
}
