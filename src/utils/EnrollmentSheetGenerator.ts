import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices
(pdfMake as any).vfs = (pdfFonts.vfs as any);

// Import the real interface from enrollements page
import { Enrollement } from '@/app/(admin)/(academique)/enrollements/page';

export const generateEnrollmentSheet = (enrollement: Enrollement) => {
  const currentDate = new Date().toLocaleDateString('fr-FR');

  // URL pour l'inscription (vous pouvez ajuster cette URL selon votre application)
  const enrollmentUrl = `${window.location.origin}/enroll/${enrollement._id}`;

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    content: [
      // En-tête
      {
        columns: [
          {
            text: 'BATIS-NEXUS',
            style: 'header',
            width: '*'
          },
          {
            text: `Date: ${currentDate}`,
            style: 'dateText',
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      
      // Titre
      {
        text: 'FICHE D\'ENRÔLEMENT',
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      
      // Informations générales
      {
        text: 'INFORMATIONS GÉNÉRALES',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      
      {
        table: {
          widths: ['25%', '75%'],
          body: [
            [
              { text: 'Promotion:', style: 'labelText' },
              { text: enrollement.promotionId?.designation || 'Non définie', style: 'valueText' }
            ],
            [
              { text: 'Année Académique:', style: 'labelText' },
              { text: `${enrollement.anneeId?.debut}-${enrollement.anneeId?.fin}` || 'Non définie', style: 'valueText' }
            ],
            [
              { text: 'Titre:', style: 'labelText' },
              { text: enrollement.title || 'Non défini', style: 'valueText' }
            ],
            [
              { text: 'Description:', style: 'labelText' },
              { text: enrollement.description || 'Aucune description', style: 'valueText' }
            ],
            [
              { text: 'Montant:', style: 'labelText' },
              { text: `${enrollement.amount?.toLocaleString()} FC` || '0 FC', style: 'valueText' }
            ],
            [
              { text: 'Date d\'Examen:', style: 'labelText' },
              { text: enrollement.planing?.date_examen ? 
                new Date(enrollement.planing.date_examen).toLocaleDateString('fr-FR') : 
                'Non définie', style: 'valueText' }
            ],
            [
              { text: 'Statut:', style: 'labelText' },
              { text: enrollement.status || 'En attente', style: 'valueText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },
      
      // Matières sélectionnées
      {
        text: 'MATIÈRES SÉLECTIONNÉES',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10]
      },
      
      {
        table: {
          widths: ['40%', '15%', '15%', '30%'],
          headerRows: 1,
          body: [
            [
              { text: 'Désignation', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Crédits', style: 'tableHeader' },
              { text: 'Description', style: 'tableHeader' }
            ],
            ...(enrollement.matieres?.map(matiere => [
              { text: matiere.designation || '', style: 'tableCell' },
              { text: matiere.code || '', style: 'tableCell' },
              { text: matiere.credits?.toString() || '0', style: 'tableCell', alignment: 'center' },
              { text: matiere.descriptions || 'Non définie', style: 'tableCell' }
            ]) || [])
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#cccccc',
          vLineColor: () => '#cccccc',
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#f5f5f5' : null
        },
        margin: [0, 0, 0, 20]
      },
      
      // QR Code pour l'inscription
      {
        text: 'INSCRIPTION EN LIGNE',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10]
      },
      
      {
        columns: [
          {
            width: '60%',
            text: [
              'Scannez le QR code ci-contre pour vous inscrire à cet enrôlement en ligne.\n\n',
              'Ou rendez-vous sur :\n',
              { text: enrollmentUrl, style: 'urlText' }
            ],
            style: 'instructionText'
          },
          {
            width: '40%',
            qr: enrollmentUrl,
            fit: '100',
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 30]
      },
      
      // Pied de page
      {
        text: [
          'Cette fiche d\'enrôlement a été générée automatiquement par BATIS-NEXUS.\n',
          'Pour toute question, contactez l\'administration académique.'
        ],
        style: 'footer',
        alignment: 'center',
        margin: [0, 40, 0, 0]
      }
    ],
    
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        color: '#2563eb'
      },
      dateText: {
        fontSize: 10,
        color: '#6b7280'
      },
      title: {
        fontSize: 18,
        bold: true,
        color: '#1f2937'
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: '#374151',
        background: '#f3f4f6',
        margin: [0, 5, 0, 5]
      },
      labelText: {
        fontSize: 11,
        bold: true,
        color: '#374151'
      },
      valueText: {
        fontSize: 11,
        color: '#1f2937'
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#374151',
        fillColor: '#f9fafb'
      },
      tableCell: {
        fontSize: 10,
        color: '#1f2937'
      },
      statLabel: {
        fontSize: 10,
        bold: true,
        color: '#6b7280'
      },
      statValue: {
        fontSize: 16,
        bold: true,
        color: '#2563eb'
      },
      instructionText: {
        fontSize: 11,
        color: '#374151',
        lineHeight: 1.4
      },
      urlText: {
        fontSize: 9,
        color: '#2563eb',
        italics: true
      },
      footer: {
        fontSize: 9,
        color: '#9ca3af',
        lineHeight: 1.3
      }
    },
    
  };

  // Générer et télécharger le PDF
  const fileName = `fiche_enrollement_${enrollement.promotionId?.designation?.replace(/\s+/g, '_') || 'unknown'}_${new Date().getTime()}.pdf`;
  
  pdfMake.createPdf(docDefinition).download(fileName);
};