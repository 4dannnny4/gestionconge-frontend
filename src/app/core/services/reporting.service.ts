import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private apiUrl = `${environment.apiUrl}/reporting`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la répartition des demandes par statut
   */
  getDemandesRepartition(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/demandes-repartition`);
  }

  /**
   * Récupère les demandes par mois
   */
  getDemandesParMois(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/demandes-par-mois`);
  }

  /**
   * Récupère le top 5 des utilisateurs avec le plus de jours restants
   */
  getTop5JoursRestants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top5-jours-restants`);
  }

  /**
   * Récupère le top 5 des utilisateurs avec le plus de demandes
   */
  getTop5Demandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top5-demandes`);
  }

  /**
   * Récupère les statistiques générales
   */
  getStatistiquesGenerales(): Observable<{[key: string]: any}> {
    return this.http.get<{[key: string]: any}>(`${this.apiUrl}/statistiques-generales`);
  }

  /**
   * Exporte les données en CSV
   */
  exportToCSV(data: any[], filename: string, headers: string[]): void {
    const csvContent = this.generateCSVContent(data, headers);
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Exporte le tableau de bord en PDF
   */
  async exportDashboardToPDF(elementId: string, title: string): Promise<void> {
    console.log('Export PDF non implémenté pour:', elementId, title);
    // TODO: Implémenter l'export PDF
  }

  /**
   * Exporte les demandes en PDF
   */
  async exportDemandesToPDF(demandes: any[], users: any[], title: string): Promise<void> {
    console.log('Export demandes PDF non implémenté:', demandes.length, users.length, title);
    // TODO: Implémenter l'export PDF
  }

  /**
   * Exporte les soldes en PDF
   */
  async exportSoldesToPDF(soldes: any[], users: any[], title: string): Promise<void> {
    console.log('Export soldes PDF non implémenté:', soldes.length, users.length, title);
    // TODO: Implémenter l'export PDF
  }

  /**
   * Génère un rapport mensuel
   */
  async generateMonthlyReport(demandes: any[], users: any[], month: number, year: number): Promise<void> {
    console.log('Rapport mensuel non implémenté:', month, year);
    // TODO: Implémenter le rapport mensuel
  }

  /**
   * Génère un rapport annuel
   */
  async generateAnnualReport(demandes: any[], users: any[], year: number): Promise<void> {
    console.log('Rapport annuel non implémenté:', year);
    // TODO: Implémenter le rapport annuel
  }

  /**
   * Génère le contenu CSV
   */
  private generateCSVContent(data: any[], headers: string[]): string {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  /**
   * Télécharge un fichier
   */
  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}