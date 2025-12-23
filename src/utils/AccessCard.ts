import { Annee, Parcours, Promotion } from "@/app/(admin)/(appariteur)/inscriptions/[cycle]/page";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices pour pdfMake
pdfMake.vfs = pdfFonts.vfs;

class AccessCard {
    private promotion: Promotion;
    private annee: Annee;
    private inscriptions: Parcours[];

    constructor(promotion: Promotion, annee: Annee, inscriptions: Parcours[]) {
        this.promotion = promotion;
        this.annee = annee;
        this.inscriptions = inscriptions;
    }

    // Créer une carte d'accès individuelle
    private createSingleCard(inscription: Parcours): any {
        const qrCodeUrl = `https://app.inbtp.net/api/parcours/${inscription._id}`;
        const nomComplet = `${inscription.etudiantId.nom} ${inscription.etudiantId.prenom}`;

        return {
            table: {
                widths: ['*'],
                heights: [180], // Hauteur fixe pour chaque carte
                body: [
                    [{
                        stack: [
                            // Titre de la carte
                            {
                                text: 'CARTE D\'ACCÈS',
                                style: 'cardTitle',
                                alignment: 'center',
                                margin: [0, 5, 0, 8]
                            },
                            // QR Code natif pdfMake
                            {
                                qr: qrCodeUrl,
                                fit: 100,
                                alignment: 'center',
                                margin: [0, 0, 0, 8]
                            },
                            // Nom complet
                            {
                                text: nomComplet.toUpperCase(),
                                style: 'studentName',
                                alignment: 'center',
                                margin: [0, 0, 0, 4]
                            },
                            { 
                                text: inscription.etudiantId.sexe, 
                                style: 'label',
                                alignment: 'center',
                                fontSize: 12,
                            },
                            { 
                                text: inscription.etudiantId.matricule, 
                                style: 'value',
                                alignment: 'center',
                                fontSize: 12,
                            },
                            // Année académique
                            {
                                text: `${this.annee.debut} - ${this.annee.fin}`, 
                                style: 'value',
                                fontSize: 12,
                                alignment: 'center',
                                margin: [0, 0, 0, 3]
                            },
                            // Promotion
                            {
                                text: this.promotion.designation, 
                                style: 'value',
                                fontSize: 12,
                                alignment: 'center',
                                margin: [0, 0, 0, 0]
                            }
                        ],
                        margin: [8, 8, 8, 8]
                    }]
                ]
            },
            layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
            }
        };
    }

    // Organiser les cartes en grille 4x3 (12 cartes par page)
    private createCardsGrid(inscriptions: Parcours[]): any[] {
        const pages: any[] = [];
        const cardsPerPage = 12;
        const cardsPerRow = 4;
        
        // Trier les inscriptions par ordre alphabétique (nom + prénom)
        const sortedInscriptions = [...inscriptions].sort((a, b) => {
            const nameA = `${a.etudiantId.nom} ${a.etudiantId.prenom}`.toLowerCase();
            const nameB = `${b.etudiantId.nom} ${b.etudiantId.prenom}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Diviser en pages de 12 cartes
        for (let i = 0; i < sortedInscriptions.length; i += cardsPerPage) {
            const pageInscriptions = sortedInscriptions.slice(i, i + cardsPerPage);
            const cards = pageInscriptions.map(inscription => this.createSingleCard(inscription));

            // Organiser en grille 4x3
            const rows: any[] = [];
            for (let j = 0; j < cards.length; j += cardsPerRow) {
                const rowCards = cards.slice(j, j + cardsPerRow);
                
                // Compléter la ligne avec des cellules vides si nécessaire
                while (rowCards.length < cardsPerRow) {
                    rowCards.push({ text: '', border: [false, false, false, false] });
                }
                
                rows.push({
                    columns: rowCards.map(card => ({
                        width: '25%',
                        ...card
                    })),
                    margin: [0, 0, 0, 10]
                });
            }

            // Compléter la page avec des lignes vides si nécessaire
            while (rows.length < 3) {
                const emptyRow = {
                    columns: Array(cardsPerRow).fill({
                        width: '25%',
                        text: '',
                        border: [false, false, false, false]
                    }),
                    margin: [0, 0, 0, 10]
                };
                rows.push(emptyRow);
            }

            pages.push({
                stack: rows,
                pageBreak: i + cardsPerPage < sortedInscriptions.length ? 'after' : undefined
            });
        }

        return pages;
    }

    // Générer et télécharger le PDF
    public async generatePDF(): Promise<void> {
        try {
            if (this.inscriptions.length === 0) {
                alert('Aucune inscription trouvée pour générer les cartes d\'accès.');
                return;
            }

            console.log(`Génération de ${this.inscriptions.length} cartes d'accès...`);
            
            const cardsContent = this.createCardsGrid(this.inscriptions);

            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [20, 20, 20, 20],
                content: [
                    // Contenu des cartes
                    ...cardsContent
                ],
                styles: {
                    cardTitle: {
                        fontSize: 10,
                        bold: true,
                        color: '#1f2937'
                    },
                    studentName: {
                        fontSize: 9,
                        bold: true,
                        color: '#2563eb'
                    },
                    label: {
                        fontSize: 7,
                        color: '#6b7280'
                    },
                    value: {
                        fontSize: 7,
                        bold: true,
                        color: '#1f2937'
                    }
                }
            };

            // Générer et télécharger le PDF
            const fileName = `cartes_acces_${this.promotion.designation.replace(/\s+/g, '_')}_${this.annee.debut}-${this.annee.fin}.pdf`;
            pdfMake.createPdf(docDefinition).download(fileName);
            
            console.log(`PDF généré avec succès: ${fileName}`);
            
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération des cartes d\'accès. Veuillez réessayer.');
        }
    }
}

export default AccessCard;