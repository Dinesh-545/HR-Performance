import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'png';
  filename?: string;
  includeData?: boolean;
  includeCharts?: boolean;
  theme?: 'light' | 'dark' | 'brand';
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  // Export chart as PNG
  exportChartAsPNG(chart: Chart, filename: string = 'chart.png'): void {
    const canvas = chart.canvas;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Export chart as PDF
  async exportChartAsPDF(chart: Chart, options: ExportOptions): Promise<void> {
    try {
      // Convert chart to base64
      const canvas = chart.canvas;
      const imageData = canvas.toDataURL('image/png');
      
      // Create PDF content
      const pdfContent = this.createPDFContent(chart, imageData, options);
      
      // Generate and download PDF
      await this.generatePDF(pdfContent, options.filename || 'chart.pdf');
    } catch (error) {
      console.error('Error exporting chart as PDF:', error);
      throw error;
    }
  }

  // Export data as Excel
  exportDataAsExcel(data: any[], options: ExportOptions): void {
    try {
      const workbook = this.createExcelWorkbook(data, options);
      const excelBuffer = this.generateExcelBuffer(workbook);
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = options.filename || 'data.xlsx';
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting data as Excel:', error);
      throw error;
    }
  }

  // Export analytics dashboard
  async exportAnalyticsDashboard(charts: Chart[], data: any, options: ExportOptions): Promise<void> {
    try {
      if (options.format === 'pdf') {
        await this.exportDashboardAsPDF(charts, data, options);
      } else if (options.format === 'excel') {
        this.exportDashboardAsExcel(charts, data, options);
      }
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  // Create PDF content
  private createPDFContent(chart: Chart, imageData: string, options: ExportOptions): any {
    const content = {
      content: [
        {
          text: 'HR Performance Analytics Report',
          style: 'header',
          alignment: 'center' as const,
          margin: [0, 0, 0, 20]
        },
        {
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          style: 'subheader',
          alignment: 'center' as const,
          margin: [0, 0, 0, 20]
        },
        {
          image: imageData,
          width: 500,
          alignment: 'center' as const,
          margin: [0, 0, 0, 20]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1976d2'
        },
        subheader: {
          fontSize: 12,
          color: '#666666'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };

    if (options.includeData) {
      content.content.push({
        text: 'Chart Data',
        style: 'header',
        margin: [0, 20, 0, 10]
      });
      
      content.content.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: this.createDataTable(chart)
        }
      });
    }

    return content;
  }

  // Generate PDF using jsPDF
  private async generatePDF(content: any, filename: string): Promise<void> {
    // Note: In a real implementation, you would use a PDF library like jsPDF
    // For now, we'll create a simple HTML-based PDF
    const htmlContent = this.createHTMLPDF(content);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Create HTML-based PDF content
  private createHTMLPDF(content: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HR Performance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { font-size: 24px; font-weight: bold; color: #1976d2; text-align: center; margin-bottom: 20px; }
            .subheader { font-size: 14px; color: #666; text-align: center; margin-bottom: 30px; }
            .chart-container { text-align: center; margin: 20px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .data-table th { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">HR Performance Analytics Report</div>
          <div class="subheader">Generated on: ${new Date().toLocaleDateString()}</div>
          <div class="chart-container">
            <img src="${content.content[2].image}" width="500" />
          </div>
          ${content.content[4] ? `
            <h3>Chart Data</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Value</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${this.createDataTableRows(content.content[4].table.body)}
              </tbody>
            </table>
          ` : ''}
        </body>
      </html>
    `;
  }

  // Create data table for PDF
  private createDataTable(chart: Chart): any[][] {
    const table = [['Label', 'Value', 'Percentage']];
    
    if (chart.data.labels && chart.data.datasets[0]?.data) {
      const total = (chart.data.datasets[0].data as number[]).reduce((sum: number, val: number) => sum + val, 0);
      
      (chart.data.labels as string[]).forEach((label: string, index: number) => {
        const value = (chart.data.datasets[0].data as number[])[index];
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
        table.push([label, value.toString(), `${percentage}%`]);
      });
    }
    
    return table;
  }

  // Create data table rows for HTML
  private createDataTableRows(tableData: any[][]): string {
    return tableData.slice(1).map(row => 
      `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`
    ).join('');
  }

  // Create Excel workbook
  private createExcelWorkbook(data: any[], options: ExportOptions): any {
    const workbook: any = {
      Sheets: {},
      SheetNames: []
    };

    // Create main data sheet
    const mainSheet = this.createExcelSheet(data);
    workbook.Sheets['Data'] = mainSheet;
    workbook.SheetNames.push('Data');

    // Create summary sheet
    const summarySheet = this.createSummarySheet(data);
    workbook.Sheets['Summary'] = summarySheet;
    workbook.SheetNames.push('Summary');

    return workbook;
  }

  // Create Excel sheet
  private createExcelSheet(data: any[]): any {
    const sheet: any = {};
    
    // Add headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      headers.forEach((header, index) => {
        const cellRef = this.getCellRef(0, index);
        sheet[cellRef] = { v: header, t: 's' };
      });

      // Add data
      data.forEach((row, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cellRef = this.getCellRef(rowIndex + 1, colIndex);
          sheet[cellRef] = { v: row[header], t: typeof row[header] === 'number' ? 'n' : 's' };
        });
      });
    }

    return sheet;
  }

  // Create summary sheet
  private createSummarySheet(data: any[]): any {
    const sheet: any = {};
    
    // Add summary information
    sheet['A1'] = { v: 'HR Performance Analytics Summary', t: 's' };
    sheet['A2'] = { v: `Total Records: ${data.length}`, t: 's' };
    sheet['A3'] = { v: `Generated: ${new Date().toLocaleDateString()}`, t: 's' };
    
    return sheet;
  }

  // Generate Excel buffer
  private generateExcelBuffer(workbook: any): ArrayBuffer {
    // Note: In a real implementation, you would use a library like xlsx
    // For now, we'll create a simple CSV-like format
    const csvContent = this.convertWorkbookToCSV(workbook);
    const encoder = new TextEncoder();
    return encoder.encode(csvContent).buffer;
  }

  // Convert workbook to CSV
  private convertWorkbookToCSV(workbook: any): string {
    let csvContent = '';
    
    workbook.SheetNames.forEach(sheetName => {
      csvContent += `Sheet: ${sheetName}\n`;
      const sheet = workbook.Sheets[sheetName];
      
      // Get all cell references
      const cellRefs = Object.keys(sheet).sort();
      
      // Find max row and column
      let maxRow = 0;
      let maxCol = 0;
      
      cellRefs.forEach(ref => {
        const coords = this.parseCellRef(ref);
        maxRow = Math.max(maxRow, coords.row);
        maxCol = Math.max(maxCol, coords.col);
      });
      
      // Create CSV content
      for (let row = 0; row <= maxRow; row++) {
        const rowData = [];
        for (let col = 0; col <= maxCol; col++) {
          const cellRef = this.getCellRef(row, col);
          const cell = sheet[cellRef];
          rowData.push(cell ? cell.v : '');
        }
        csvContent += rowData.join(',') + '\n';
      }
      
      csvContent += '\n';
    });
    
    return csvContent;
  }

  // Helper methods for Excel
  private getCellRef(row: number, col: number): string {
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  }

  private parseCellRef(ref: string): { row: number; col: number } {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (match) {
      const colStr = match[1];
      const row = parseInt(match[2]) - 1;
      let col = 0;
      for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
      }
      return { row, col: col - 1 };
    }
    return { row: 0, col: 0 };
  }

  // Export dashboard as PDF
  private async exportDashboardAsPDF(charts: Chart[], data: any, options: ExportOptions): Promise<void> {
    const content = {
      content: [
        {
          text: 'HR Performance Dashboard Report',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 30]
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#1976d2'
        },
        subheader: {
          fontSize: 12,
          color: '#666666'
        }
      }
    };

    // Add each chart
    charts.forEach((chart, index) => {
      const imageData = chart.canvas.toDataURL('image/png');
      content.content.push({
        text: `Chart ${index + 1}`,
        style: 'subheader',
        margin: [0, 20, 0, 10]
      });
      content.content.push({
        image: imageData,
        width: 400,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      });
    });

    await this.generatePDF(content, options.filename || 'dashboard.pdf');
  }

  // Export dashboard as Excel
  private exportDashboardAsExcel(charts: Chart[], data: any, options: ExportOptions): void {
    const workbook = {
      Sheets: {},
      SheetNames: []
    };

    // Add data sheets
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        const sheet = this.createExcelSheet(data[key]);
        workbook.Sheets[key] = sheet;
        workbook.SheetNames.push(key);
      }
    });

    // Add summary sheet
    const summarySheet = this.createDashboardSummarySheet(data, charts.length);
    workbook.Sheets['Summary'] = summarySheet;
    workbook.SheetNames.push('Summary');

    const excelBuffer = this.generateExcelBuffer(workbook);
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = options.filename || 'dashboard.xlsx';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  // Create dashboard summary sheet
  private createDashboardSummarySheet(data: any, chartCount: number): any {
    const sheet: any = {};
    
    sheet['A1'] = { v: 'HR Performance Dashboard Summary', t: 's' };
    sheet['A2'] = { v: `Total Charts: ${chartCount}`, t: 's' };
    sheet['A3'] = { v: `Generated: ${new Date().toLocaleDateString()}`, t: 's' };
    sheet['A4'] = { v: `Data Sets: ${Object.keys(data).length}`, t: 's' };
    
    return sheet;
  }
} 