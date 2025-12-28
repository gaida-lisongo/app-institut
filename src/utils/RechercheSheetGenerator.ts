import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices
(pdfMake as any).vfs = (pdfFonts.vfs as any);

// Import the interface from RecherchesManager
import { Recherche } from '@/components/recherche/RecherchesManager';

export const generateRechercheSubscriptionSheet = (recherche: Recherche) => {
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const currentTime = new Date().toLocaleTimeString('fr-FR');

  // URL pour la souscription (vous pouvez ajuster cette URL selon votre application)
  const subscriptionUrl = `${window.location.origin}/recherche/subscribe/${recherche._id}`;

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    content: [
      // En-tête
      {
        columns: [
          {
            text: `FICHE DE SOUSCRIPTION - ${recherche.categorie.toUpperCase()}`,
            style: 'header',
            width: '*'
          },
          {
            text: `Date: ${currentDate}\nHeure: ${currentTime}`,
            style: 'dateText',
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 25]
      },

      {
        columns: [
            {
                stack: [
                    // Informations de la recherche
                    {
                        text: 'INFORMATIONS DE LA RECHERCHE',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 5]
                    },
                    
                    // Table des informations principales
                    {
                        table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Titre:', style: 'labelText' },
                                { text: recherche.title || 'Non défini', style: 'valueText' }
                            ],
                            [
                                { text: 'Catégorie:', style: 'labelText' },
                                { text: recherche.categorie || 'Non défini', style: 'valueText' }
                            ],
                            [
                                { text: 'Promotion:', style: 'labelText' },
                                { text: recherche.promotionId?.designation || 'Non définie', style: 'valueText' }
                            ],
                            [
                                { text: 'Année Académique:', style: 'labelText' },
                                { text: `${recherche.anneeId?.debut}-${recherche.anneeId?.fin}` || 'Non définie', style: 'valueText' }
                            ],
                            [
                                { text: 'Montant:', style: 'labelText' },
                                { text: `${recherche.amount} FC` || '0 FC', style: 'valueText' }
                            ],
                            [
                                { text: 'Statut:', style: 'labelText' },
                                { text: recherche.status === 'Pending' ? 'En Attente' : recherche.status === 'Completed' ? 'Terminé' : 'Échoué', style: 'valueText' }
                            ]
                        ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 5]
                    },

                ],
                width: '50%',
            },
            {
                stack:[{
                    qr: subscriptionUrl,
                    fit: '120',
                    alignment: 'right',
                }],
                width: 'auto',
                alignment: 'center',
                margin: [55, 5, 5, 5]
            }
        ]
      },
      
      
      // Description
      {
        text: 'DESCRIPTION:',
        style: 'labelText',
        margin: [0, 0, 0, 5]
      },
      {
        text: recherche.description || 'Aucune description disponible.',
        style: 'descriptionText',
        margin: [0, 0, 0, 5]
      },
      
      
      // Instructions de souscription
      {
        columns: [
            {

                stack: [{
                    text: 'COMMENT SOUSCRIRE ?',
                    style: 'sectionHeader',
                    margin: [0, 20, 0, 10]
                }],
                width: '50%'
            },
            {
                stack: [
                
                // Conditions et engagement
                {
                    text: 'CONDITIONS ET ENGAGEMENT',
                    style: 'sectionHeader',
                    margin: [0, 20, 0, 5]
                },
                ],
                width: '50%'
            }
        ]
      },
      
      {
        columns: [
          {
            width: '50%',
            text: [
              '1. Scannez le QR code ci-contre avec votre smartphone\n',
              '2. Remplissez le formulaire en ligne avec :\n',
              '   • Votre matricule étudiant\n',
              '   • Le nom de votre tuteur proposé\n',
              '   • Le titre de votre recherche\n',
              '   • Une description détaillée\n',
              '3. Validez votre souscription\n',
              '4. Effectuez le paiement de ', 
              { text: `${recherche.amount} FC`, style: 'amountHighlight' },
              '\n\n',
              'Ou rendez-vous directement sur :\n',
              { text: subscriptionUrl, style: 'urlText' }
            ],
            style: 'instructionText'
          },
          {
            width: '*',
            stack: [         
                {
                    text: [
                    'En souscrivant à cette ', 
                    { text: recherche.categorie.toLowerCase(), style: 'categoryHighlight' },
                    ', vous vous engagez à :\n\n',
                    '• Respecter les délais fixés par votre tuteur\n',
                    '• Suivre rigoureusement les directives académiques\n',
                    '• Produire un rapport de qualité selon les standards\n',
                    '• Effectuer le paiement des frais dans les délais\n',
                    '• Maintenir une communication régulière avec votre tuteur\n\n',
                    { text: 'Important : ', style: 'important' },
                    'Cette souscription est définitive une fois validée et payée.'
                    ],
                    style: 'conditionsText',
                    margin: [0, 0, 0, 5]
                },
                
            ]
          }
        ],
        margin: [0, 0, 0, 5]
      },
      // Pied de page
      {
        text: [
          `Cette fiche de souscription a été générée automatiquement le ${currentDate} à ${currentTime}.\n`,
          'Pour toute question, contactez l\'administration académique.\n\n',
          { text: 'BATIS-NEXUS - Système de Gestion Académique', style: 'footerBrand' }
        ],
        style: 'footer',
        alignment: 'center',
        margin: [0, 40, 0, 0]
      }
    ],
    
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#2563eb'
      },
      dateText: {
        fontSize: 9,
        color: '#6b7280',
        alignment: 'right'
      },
      title: {
        fontSize: 18,
        bold: true,
        color: '#1f2937'
      },
      sectionHeader: {
        fontSize: 13,
        bold: true,
        color: '#374151',
        fillColor: '#f3f4f6',
        margin: [0, 3, 0, 3]
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
      descriptionText: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.4,
        italics: true,
        background: '#f9fafb',
        margin: [5, 5, 5, 5]
      },
      statLabel: {
        fontSize: 10,
        bold: true,
        color: '#6b7280'
      },
      statValue: {
        fontSize: 18,
        bold: true,
        color: '#2563eb'
      },
      instructionText: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.5
      },
      urlText: {
        fontSize: 8,
        color: '#2563eb',
        italics: true,
        decoration: 'underline'
      },
      amountHighlight: {
        fontSize: 11,
        bold: true,
        color: '#059669'
      },
      categoryHighlight: {
        bold: true,
        color: '#7c3aed'
      },
      conditionsText: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.4
      },
      important: {
        bold: true,
        color: '#dc2626'
      },
      footer: {
        fontSize: 8,
        color: '#9ca3af',
        lineHeight: 1.3
      },
      footerBrand: {
        bold: true,
        color: '#6b7280'
      }
    },
    
  };

  // Générer et télécharger le PDF
  const fileName = `fiche_souscription_${recherche.categorie.toLowerCase()}_${recherche.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'recherche'}_${new Date().getTime()}.pdf`;
  
  pdfMake.createPdf(docDefinition).download(fileName);
};