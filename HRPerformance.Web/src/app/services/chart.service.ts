import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface ChartOptions {
  type: ChartType;
  data: any;
  options?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  createChart(canvas: HTMLCanvasElement, config: ChartOptions): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const chartConfig: ChartConfiguration = {
      type: config.type,
      data: config.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true
          }
        },
        ...config.options
      }
    };

    return new Chart(ctx, chartConfig);
  }

  // Goal Completion Chart
  createGoalCompletionChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0].data,
          backgroundColor: [
            '#4caf50', // Completed
            '#2196f3', // In Progress
            '#ff9800', // Not Started
            '#f44336'  // On Hold
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Goal Completion Status',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        cutout: '60%'
      }
    };

    return this.createChart(canvas, config);
  }

  // Performance Trend Chart
  createPerformanceTrendChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Average Rating',
          data: data.datasets[0].data,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2196f3',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Performance Trends',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // Department Comparison Chart
  createDepartmentComparisonChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Performance Score',
            data: data.datasets[0].data,
            backgroundColor: 'rgba(76, 192, 192, 0.8)',
            borderColor: '#4bc0c0',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
          },
          {
            label: 'Goal Completion Rate',
            data: data.datasets[1].data,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: '#ff6384',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Department Performance Comparison',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value: any) {
                return value + '%';
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };

    return this.createChart(canvas, config);
  }

  // Employee Performance Chart
  createEmployeePerformanceChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'radar',
      data: {
        labels: ['Goal Completion', 'Average Rating', 'Skill Coverage', 'Team Collaboration', 'Innovation'],
        datasets: [{
          label: 'Current Performance',
          data: data.datasets[0].data,
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196f3',
          borderWidth: 2,
          pointBackgroundColor: '#2196f3',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Employee Performance Overview',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // Skill Distribution Chart
  createSkillDistributionChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0].data,
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#ff9800',
            '#9c27b0',
            '#f44336',
            '#00bcd4',
            '#8bc34a',
            '#ff5722'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Skill Distribution',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // Monthly Trends Chart
  createMonthlyTrendsChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Goal Completion Rate',
            data: data.datasets[0].data,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Average Rating',
            data: data.datasets[1].data,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Monthly Performance Trends',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // NEW: Bubble Chart for Employee Performance Analysis
  createEmployeeBubbleChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Employee Performance',
          data: data.datasets[0].data,
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: '#2196f3',
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Employee Performance Analysis',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `Employee: ${context.raw.label}\nRating: ${context.raw.y}\nGoals: ${context.raw.x}\nSize: ${context.raw.r} skills`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Goals Completed'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Average Rating'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // NEW: Scatter Plot for Skill vs Performance
  createSkillPerformanceScatterChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Skill vs Performance',
          data: data.datasets[0].data,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: '#ff6384',
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 10
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Skill Level vs Performance Rating',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Skill Level'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Performance Rating'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // NEW: Polar Area Chart for Department Skills
  createDepartmentSkillsPolarChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'polarArea',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0].data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            '#ff6384',
            '#36a2eb',
            '#ffce56',
            '#4bc0c0',
            '#9966ff',
            '#ff9f40'
          ],
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Department Skills Overview',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // NEW: Stacked Bar Chart for Monthly Performance
  createMonthlyPerformanceStackedChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Excellent',
            data: data.datasets[0].data,
            backgroundColor: '#4caf50',
            stack: 'Stack 0'
          },
          {
            label: 'Good',
            data: data.datasets[1].data,
            backgroundColor: '#2196f3',
            stack: 'Stack 0'
          },
          {
            label: 'Average',
            data: data.datasets[2].data,
            backgroundColor: '#ff9800',
            stack: 'Stack 0'
          },
          {
            label: 'Below Average',
            data: data.datasets[3].data,
            backgroundColor: '#f44336',
            stack: 'Stack 0'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Monthly Performance Distribution',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Number of Employees'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // NEW: Area Chart for Cumulative Performance
  createCumulativePerformanceAreaChart(canvas: HTMLCanvasElement, data: any): Chart {
    const config: ChartOptions = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Cumulative Performance',
            data: data.datasets[0].data,
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Cumulative Performance Over Time',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cumulative Score'
            }
          }
        }
      }
    };

    return this.createChart(canvas, config);
  }

  // Destroy chart to prevent memory leaks
  destroyChart(chart: Chart): void {
    if (chart) {
      chart.destroy();
    }
  }

  // Update chart data
  updateChartData(chart: Chart, newData: any): void {
    if (chart) {
      chart.data = newData;
      chart.update();
    }
  }

  // NEW: Apply custom theme to chart
  applyCustomTheme(chart: Chart, theme: 'light' | 'dark' | 'brand'): void {
    const themes = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        gridColor: '#e0e0e0'
      },
      dark: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        gridColor: '#333333'
      },
      brand: {
        backgroundColor: '#f8f9fa',
        textColor: '#1976d2',
        gridColor: '#e3f2fd'
      }
    };

    const selectedTheme = themes[theme];
    
    if (chart.options.plugins) {
      chart.options.plugins.legend = {
        ...chart.options.plugins.legend,
        labels: {
          ...chart.options.plugins.legend?.labels,
          color: selectedTheme.textColor
        }
      };
    }

    if (chart.options.scales) {
      Object.keys(chart.options.scales).forEach(scaleKey => {
        const scale = chart.options.scales?.[scaleKey as keyof typeof chart.options.scales];
        if (scale) {
          scale.grid = {
            ...scale.grid,
            color: selectedTheme.gridColor
          };
          scale.ticks = {
            ...scale.ticks,
            color: selectedTheme.textColor
          };
        }
      });
    }

    chart.update();
  }
} 