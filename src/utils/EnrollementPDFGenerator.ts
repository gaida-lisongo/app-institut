import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode';
import { Enrollement } from '@/app/(admin)/(academique)/enrollements/page';

// Configuration des polices
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generateEnrollementPDF = async (enrollement: Enrollement) => {
  try {
    // URL pour l'inscription via QR code
    const enrollementUrl = `${window.location.origin}/inscriptions/enrollement/${enrollement._id}`;
    
    // Génération du QR code en base64
    const qrCodeDataUrl = await QRCode.toDataURL(enrollementUrl, {
      width: 200,
      margin: 2,
    });

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      content: [
        // Header
        {
          text: 'BATIS-NEXUS',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        
        // Titre
        {
          text: 'FICHE D\'ENRÔLEMENT',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },
        
        // Informations de l'enrôlement
        {
          columns: [
            {
              width: '60%',
              stack: [
                {
                  text: 'INFORMATIONS DE L\'ENRÔLEMENT',
                  style: 'sectionHeader',
                  margin: [0, 0, 0, 15]
                },
                {
                  table: {
                    widths: ['30%', '70%'],
                    body: [
                      [
                        { text: 'Titre:', style: 'label' },
                        { text: enrollement.title, style: 'value' }
                      ],
                      [
                        { text: 'Description:', style: 'label' },
                        { text: enrollement.description || '-', style: 'value' }
                      ],
                      [
                        { text: 'Montant:', style: 'label' },
                        { text: `${enrollement.amount.toLocaleString()} FC`, style: 'value' }
                      ],
                      [
                        { text: 'Statut:', style: 'label' },
                        { 
                          text: enrollement.status === 'Pending' ? 'En Attente' : 
                                enrollement.status === 'Completed' ? 'Terminé' : 'Échoué', 
                          style: 'value' 
                        }
                      ],
                      [
                        { text: 'Date création:', style: 'label' },
                        { text: new Date(enrollement.created_at).toLocaleDateString('fr-FR'), style: 'value' }
                      ],
                      [
                        { text: 'Inscrits:', style: 'label' },
                        { text: `${enrollement.subscribers?.length || 0} étudiant(s)`, style: 'value' }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#cccccc',
                    vLineColor: () => '#cccccc'
                  }
                }
              ]
            },
            {
              width: '40%',
              stack: [
                {
                  text: 'QR CODE D\'INSCRIPTION',
                  style: 'sectionHeader',
                  alignment: 'center',
                  margin: [0, 0, 0, 15]
                },
                {
                  image: qrCodeDataUrl,
                  width: 150,
                  alignment: 'center',
                  margin: [0, 0, 0, 10]
                },
                {
                  text: 'Scannez ce QR code pour vous inscrire',
                  style: 'qrInstruction',
                  alignment: 'center'
                },
                {
                  text: enrollementUrl,
                  style: 'url',
                  alignment: 'center',
                  margin: [0, 10, 0, 0]
                }
              ]
            }
          ]
        },
        
        // Espacement
        { text: '', margin: [0, 30, 0, 0] },
        
        // Liste des inscrits si présents
        ...(enrollement.subscribers && enrollement.subscribers.length > 0 ? [
          {
            text: 'LISTE DES INSCRITS',
            style: 'sectionHeader',
            margin: [0, 0, 0, 15]
          },
          {
            table: {
              headerRows: 1,
              widths: ['5%', '35%', '25%', '20%', '15%'],
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'Nom Complet', style: 'tableHeader' },
                  { text: 'Matricule', style: 'tableHeader' },
                  { text: 'Code', style: 'tableHeader' },
                  { text: 'Date', style: 'tableHeader' }
                ],
                ...enrollement.subscribers.map((subscriber, index) => [
                  { text: (index + 1).toString(), style: 'tableCell' },
                  { 
                    text: `${subscriber.student?.nom || ''} ${subscriber.student?.post_nom || ''} ${subscriber.student?.prenom || ''}`.trim(),
                    style: 'tableCell' 
                  },
                  { text: subscriber.student?.matricule || '-', style: 'tableCell' },
                  { text: subscriber.code, style: 'tableCell' },
                  { text: new Date(subscriber.date_inscription).toLocaleDateString('fr-FR'), style: 'tableCell' }
                ])
              ]
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 2 : 1,
              vLineWidth: () => 1,
              hLineColor: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? '#000000' : '#cccccc',
              vLineColor: () => '#cccccc'
            }
          }
        ] : []),
        
        // Footer
        {
          text: `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          style: 'footer',
          alignment: 'center',
          margin: [0, 50, 0, 0]
        }
      ],
      
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#2563eb'
        },
        title: {
          fontSize: 16,
          bold: true,
          color: '#1e40af'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#374151',
          background: '#f3f4f6',
          margin: [0, 5, 0, 5]
        },
        label: {
          fontSize: 10,
          bold: true,
          color: '#6b7280'
        },
        value: {
          fontSize: 10,
          color: '#111827'
        },
        qrInstruction: {
          fontSize: 9,
          color: '#6b7280',
          italics: true
        },
        url: {
          fontSize: 8,
          color: '#2563eb'
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#1f2937',
          fillColor: '#f9fafb'
        },
        tableCell: {
          fontSize: 9,
          color: '#374151'
        },
        footer: {
          fontSize: 8,
          color: '#9ca3af',
          italics: true
        }
      }
    };

    // Générer et télécharger le PDF
    pdfMake.createPdf(docDefinition).download(`fiche-enrollement-${enrollement.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF');
  }
};