import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Ordonnance } from '../models/ordonnance.model';
import { RendezVous } from '../models/rdv.model';
import { OrdonnanceMedicament } from '../models/OrdonnanceMedicament.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Generate a prescription PDF
   * @param ordonnance The prescription data
   */
  async generateOrdonnancePdf(ordonnance: Ordonnance): Promise<void> {
    // Create PDF document
    const doc = new jsPDF();
    
    // Handle potentially missing rendezVous
    if (!ordonnance.rendezVous) {
      console.warn('RendezVous information missing in ordonnance');
      ordonnance.rendezVous = {} as any;
    }
    
    const patient = ordonnance.rendezVous?.patient;
    const medecin = ordonnance.rendezVous?.medecin;

    // Gérer le cas où les données sont incomplètes
    if (!patient || !medecin) {
      console.warn('Patient or doctor information missing, using default values');
      
      // Créer un en-tête simplifié
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ORDONNANCE MÉDICALE', 105, 20, { align: 'center' });
      
      // Date information
      const currentDate = new Date().toLocaleDateString('fr-FR');
      const emissionDate = ordonnance.dateEmission ? this.formatDate(ordonnance.dateEmission) : currentDate;
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${emissionDate}`, 150, 40, { align: 'right' });
      
      doc.line(15, 65, 195, 65);
      doc.setFont('helvetica', 'bold');
      doc.text('Contenu de l\'ordonnance:', 15, 85);
      doc.setFont('helvetica', 'normal');
      
      // If no structured medications, use the content field
      let yPos = 100;
      if (ordonnance.contenu) {
        const contentLines = this.splitTextToLines(ordonnance.contenu, 170);
        contentLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 5;
        });
      }
      
      // Add remarks
      if (ordonnance.remarques) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Remarques:', 15, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        const remarkLines = this.splitTextToLines(ordonnance.remarques, 170);
        remarkLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 5;
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 105, 285, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`ordonnance_${emissionDate.replace(/\//g, '-')}.pdf`);
      return;
    }

    // Create prescription header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ORDONNANCE MÉDICALE', 105, 20, { align: 'center' });

    // Doctor information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Dr. ${medecin.nom || 'Non spécifié'}`, 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Spécialité: ${medecin.specialite || 'Non spécifiée'}`, 15, 45);
    doc.text(`Email: ${medecin.email || 'Non spécifié'}`, 15, 50);
    doc.text(`Téléphone: ${medecin.numeroTelephone || 'Non spécifié'}`, 15, 55);

    // Date information
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const emissionDate = ordonnance.dateEmission ? this.formatDate(ordonnance.dateEmission) : currentDate;
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${emissionDate}`, 150, 40, { align: 'right' });

    // Patient information
    doc.line(15, 65, 195, 65);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 15, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient.titre || ''} ${patient.nom || 'Non spécifié'}`, 50, 75);
    doc.text(`Date de naissance: ${patient.dateNaissance ? this.formatDate(patient.dateNaissance) : 'Non spécifiée'}`, 50, 80);
    doc.line(15, 85, 195, 85);

    // Prescription content
    doc.setFont('helvetica', 'bold');
    doc.text('Prescription:', 15, 100);
    doc.setFont('helvetica', 'normal');

    // Add medications
    let yPos = 110;
    if (ordonnance.medicaments && ordonnance.medicaments.length > 0) {
      for (let i = 0; i < ordonnance.medicaments.length; i++) {
        const med = ordonnance.medicaments[i];

        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${med.medicament?.nom || 'Médicament non spécifié'}`, 20, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(`   Posologie: ${med.posologie || 'Non spécifiée'}`, 20, yPos);
        yPos += 5;

        if (med.duree) {
          doc.text(`   Durée: ${med.duree}`, 20, yPos);
          yPos += 5;
        }

        if (med.frequence) {
          doc.text(`   Fréquence: ${med.frequence}`, 20, yPos);
          yPos += 5;
        }

        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`, 20, yPos);
          yPos += 5;
        }

        yPos += 5; // Extra space between medications
      }
    } else if (ordonnance.contenu) {
      // If no structured medications, use the content field
      const contentLines = this.splitTextToLines(ordonnance.contenu, 170);
      contentLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    // Add remarks
    if (ordonnance.remarques) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Remarques:', 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      const remarkLines = this.splitTextToLines(ordonnance.remarques, 170);
      remarkLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 5;
      });
    }

    // Signature
    yPos = Math.max(yPos + 15, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature et cachet:', 130, yPos);
    doc.text(`Dr. ${medecin.nom || 'Non spécifié'}`, 130, yPos + 20);

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 105, 285, { align: 'center' });
    }

    // Save the PDF
    const patientName = patient.nom ? patient.nom.replace(/[^a-zA-Z0-9]/g, '_') : 'patient';
    doc.save(`ordonnance_${patientName}_${currentDate.replace(/\//g, '-')}.pdf`);
  }

  /**
   * Generate an invoice PDF for an appointment
   * @param rdv The appointment data
   * @param withTVA Whether to include VAT (TVA)
   */
  async generateFacturePdf(rdv: RendezVous, withTVA: boolean = false): Promise<void> {
    // Create PDF document
    const doc = new jsPDF();
    const patient = rdv.patient;
    const medecin = rdv.medecin;

    if (!patient || !medecin) {
      throw new Error('Patient and doctor information required');
    }

    // Calculate amounts
    const prixBase = rdv.prix || 0;
    const tauxTVA = 0.20; // 20% VAT
    const montantTVA = withTVA ? prixBase * tauxTVA : 0;
    const totalTTC = prixBase + montantTVA;

    // Create invoice number
    const invoiceNumber = this.generateInvoiceNumber();

    // Create invoice header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FACTURE', 105, 20, { align: 'center' });

    // Logo placeholder (clinic name instead)
    doc.setFontSize(16);
    doc.text('Cabinet Médical', 15, 20);

    // Invoice details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('N° Facture:', 150, 40);
    doc.text('Date:', 150, 45);

    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, 180, 40);
    doc.text(new Date().toLocaleDateString('fr-FR'), 180, 45);

    // Provider info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Prestataire:', 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Dr. ${medecin.nom}`, 15, 45);
    doc.text(`${medecin.specialite}`, 15, 50);
    doc.text('123 Rue de la Santé', 15, 55);
    doc.text('75000 Paris', 15, 60);
    doc.text(`Tel: ${medecin.numeroTelephone}`, 15, 65);

    // Client info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Client:', 15, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${patient.titre || ''} ${patient.nom}`, 15, 85);
    doc.text(`${patient.adresse || ''}`, 15, 90);
    if (patient.codePostal) {
      doc.text(`${patient.codePostal}`, 15, 95);
    }
    doc.text(`Tel: ${patient.numeroTelephone || ''}`, 15, 100);

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 115, 180, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Description', 20, 122);
    doc.text('Quantité', 100, 122);
    doc.text('Prix unitaire', 130, 122);
    doc.text('Montant', 170, 122);

    // Service details
    let yPos = 135;
    doc.setFont('helvetica', 'normal');

    // Appointment date
    let appointmentDate = 'N/A';
    if (rdv.date) {
      const date = new Date(rdv.date);
      appointmentDate = date.toLocaleDateString('fr-FR');
    }

    // Add line for consultation
    doc.text(`Consultation médicale (${appointmentDate})`, 20, yPos);
    doc.text('1', 100, yPos);
    doc.text(`${prixBase.toFixed(2)} MAD`, 130, yPos);
    doc.text(`${prixBase.toFixed(2)} MAD`, 170, yPos);

    // Add TVA if requested
    if (withTVA) {
      yPos += 15;
      doc.text('TVA (20%)', 130, yPos);
      doc.text(`${montantTVA.toFixed(2)} MAD`, 170, yPos);
    }

    // Total
    yPos += 25;
    doc.line(15, yPos - 5, 195, yPos - 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Total' + (withTVA ? ' TTC' : ''), 130, yPos);
    doc.text(`${totalTTC.toFixed(2)} MAD`, 170, yPos);

    // Payment instructions
    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Modalités de paiement:', 15, yPos);
    doc.text('Paiement à réception de la facture', 15, yPos + 5);

    // Footer
    yPos += 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Merci de votre confiance. Pour toute question concernant cette facture, veuillez nous contacter.', 105, yPos, { align: 'center' });
    doc.text('Cabinet Médical - 123 Rue de la Santé - 75000 Paris - Tel: 01 23 45 67 89', 105, yPos + 5, { align: 'center' });

    // Page numbers
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} / ${pageCount}`, 195, 285, { align: 'right' });
    }

    // Save the PDF
    doc.save(`facture_${invoiceNumber}.pdf`);
  }

  /**
   * Generate a custom invoice number
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FACT-${datePart}-${randomPart}`;
  }

  /**
   * Format a date to a readable format
   */
  private formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Split text into lines of maximum width
   */
  private splitTextToLines(text: string, maxWidth: number): string[] {
    if (!text) return [];

    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    return doc.splitTextToSize(text, maxWidth);
  }
}
