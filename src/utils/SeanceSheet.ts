import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices pour pdfMake
pdfMake.vfs = pdfFonts.vfs;

interface SeanceData {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    description?: string;
    location?: string;
}

interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

class SeanceSheetGenerator {
    private seance: SeanceData;
    private coordinates: LocationCoordinates | null;

    constructor(seance: SeanceData, coordinates?: LocationCoordinates) {
        this.seance = seance;
        this.coordinates = coordinates || null;
    }

    // Obtenir la géolocalisation du navigateur
    private async getCurrentLocation(): Promise<LocationCoordinates> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur.'));
                return;
            }

            // Timeout manuel pour plus de contrôle
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout de géolocalisation - Utilisation des coordonnées par défaut'));
            }, 5000); // Réduit à 5 secondes

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    clearTimeout(timeoutId);
                    let errorMessage = '';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permission de géolocalisation refusée';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Position indisponible';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Timeout de géolocalisation';
                            break;
                        default:
                            errorMessage = 'Erreur de géolocalisation inconnue';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: false, // Réduit la précision pour plus de rapidité
                    timeout: 4000, // Timeout plus court
                    maximumAge: 60000 // 1 minute
                }
            );
        });
    }

    // Obtenir la géolocalisation avec fallback automatique
    private async getLocationWithFallback(): Promise<LocationCoordinates> {
        try {
            return await this.getCurrentLocation();
        } catch (error) {
            console.warn('Géolocalisation échouée, utilisation des coordonnées par défaut:', error);
            // Coordonnées par défaut pour Kinshasa
            return { latitude: -4.4419, longitude: 15.2663 };
        }
    }

    // Générer le contenu QR-code
    private generateQRContent(coordinates: LocationCoordinates): string {
        return `${this.seance._id}:${coordinates.latitude}:${coordinates.longitude}`;
    }

    // Créer le document PDF
    private createDocumentDefinition(qrContent: string) {
        const dateFormatted = new Date(this.seance.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                // En-tête avec logo et titre
                {
                    stack: [
                        {
                            text: 'FICHE DE SÉANCE',
                            style: 'mainTitle',
                            alignment: 'center',
                            margin: [0, 0, 0, 20]
                        },
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0, y1: 0,
                                    x2: 515, y2: 0,
                                    lineWidth: 3,
                                    lineColor: '#2563eb'
                                }
                            ],
                            margin: [0, 0, 0, 5]
                        }
                    ]
                },

                // Informations de la séance dans un design moderne
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [{
                                stack: [
                                    // Titre de la séance
                                    {
                                        text: this.seance.topic,
                                        style: 'seanceTitle',
                                        alignment: 'center',
                                        margin: [0, 0, 0, 5]
                                    },
                                    // Informations en colonnes
                                    {
                                        columns: [
                                            {
                                                width: '50%',
                                                stack: [
                                                    {
                                                        text: ' Date & Heure',
                                                        style: 'sectionHeader',
                                                        margin: [0, 0, 0, 8]
                                                    },
                                                    {
                                                        text: dateFormatted,
                                                        style: 'infoText',
                                                        margin: [0, 0, 0, 5]
                                                    },
                                                    {
                                                        text: `${this.seance.startTime} - ${this.seance.endTime}`,
                                                        style: 'timeText',
                                                        margin: [0, 0, 0, 15]
                                                    },
                                                    {
                                                        text: ' Lieu',
                                                        style: 'sectionHeader',
                                                        margin: [0, 0, 0, 8]
                                                    },
                                                    {
                                                        text: this.seance.location || 'Non spécifié',
                                                        style: 'infoText'
                                                    }
                                                ]
                                            },
                                            {
                                                width: '50%',
                                                stack: [
                                                    {
                                                        text: ' QR Code de Présence',
                                                        style: 'sectionHeader',
                                                        alignment: 'center',
                                                        margin: [0, 0, 0, 15]
                                                    },
                                                    {
                                                        qr: qrContent,
                                                        fit: 150,
                                                        alignment: 'center',
                                                        margin: [0, 0, 0, 15]
                                                    },
                                                    {
                                                        text: 'Scannez pour marquer votre présence',
                                                        style: 'qrInstruction',
                                                        alignment: 'center'
                                                    }
                                                ]
                                            }
                                        ],
                                        columnGap: 30
                                    }
                                ],
                                fillColor: '#f8fafc',
                                margin: [20, 20, 20, 5]
                            }]
                        ]
                    },
                    layout: {
                        defaultBorder: false,
                        fillColor: '#f8fafc'
                    },
                    margin: [0, 0, 0, 5]
                },

                // Description si elle existe
                ...(this.seance.description ? [{
                    stack: [
                        {
                            text: 'Description',
                            style: 'sectionHeader',
                            margin: [0, 0, 0, 5]
                        },
                        {
                            text: this.seance.description,
                            style: 'descriptionText',
                            margin: [10, 0, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 30]
                }] : []),

                // Instructions pour les étudiants
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [{
                                stack: [
                                    {
                                        text: 'Instructions',
                                        style: 'instructionHeader',
                                        margin: [0, 0, 0, 5]
                                    },
                                    {
                                        ul: [
                                            'Arrivez à l\'heure pour ne pas perturber le cours',
                                            'Scannez le QR code dès votre arrivée pour marquer votre présence',
                                            'Gardez vos téléphones en mode silencieux pendant le cours',
                                            'Participez activement aux discussions et exercices',
                                            'N\'hésitez pas à poser des questions si quelque chose n\'est pas clair'
                                        ],
                                        style: 'instructionList'
                                    }
                                ],
                                margin: [15, 15, 15, 15]
                            }]
                        ]
                    },
                    layout: {
                        defaultBorder: false,
                        fillColor: '#fef3c7'
                    },
                    margin: [0, 20, 0, 10]
                },

                // Pied de page avec informations techniques
                {
                    columns: [
                        {
                            width: '50%',
                            text: `ID Séance: ${this.seance._id}`,
                            style: 'footerInfo'
                        },
                        {
                            width: '50%',
                            text: `Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
                            style: 'footerInfo',
                            alignment: 'right'
                        }
                    ],
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: {
                mainTitle: {
                    fontSize: 28,
                    bold: true,
                    color: '#1e40af',
                    font: 'Roboto'
                },
                seanceTitle: {
                    fontSize: 22,
                    bold: true,
                    color: '#374151',
                    font: 'Roboto'
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#059669',
                    font: 'Roboto'
                },
                infoText: {
                    fontSize: 12,
                    color: '#374151',
                    font: 'Roboto'
                },
                timeText: {
                    fontSize: 14,
                    bold: true,
                    color: '#dc2626',
                    font: 'Roboto'
                },
                qrInstruction: {
                    fontSize: 10,
                    italic: true,
                    color: '#6b7280',
                    font: 'Roboto'
                },
                descriptionText: {
                    fontSize: 11,
                    color: '#374151',
                    lineHeight: 1.4,
                    font: 'Roboto'
                },
                instructionHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#d97706',
                    font: 'Roboto'
                },
                instructionList: {
                    fontSize: 11,
                    color: '#374151',
                    lineHeight: 1.3,
                    font: 'Roboto'
                },
                footerInfo: {
                    fontSize: 8,
                    color: '#9ca3af',
                    font: 'Roboto'
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
    }

    // Méthode principale pour générer le PDF
    public async generatePDF(useCurrentLocation: boolean = true): Promise<{ success: boolean; message: string; usedDefaultLocation: boolean }> {
        try {
            let coordinates: LocationCoordinates;
            let usedDefaultLocation = false;

            if (useCurrentLocation) {
                // Demander la géolocalisation avec fallback automatique
                coordinates = await this.getLocationWithFallback();
                // Vérifier si on a utilisé les coordonnées par défaut
                usedDefaultLocation = (coordinates.latitude === -4.4419 && coordinates.longitude === 15.2663);
            } else if (this.coordinates) {
                // Utiliser les coordonnées fournies
                coordinates = this.coordinates;
            } else {
                // Coordonnées par défaut (exemple: Kinshasa)
                coordinates = { latitude: -4.4419, longitude: 15.2663 };
                usedDefaultLocation = true;
                console.warn('Aucune coordonnée fournie, utilisation des coordonnées par défaut');
            }

            // Générer le contenu QR
            const qrContent = this.generateQRContent(coordinates);

            // Créer le document
            const docDefinition = this.createDocumentDefinition(qrContent);

            // Générer et télécharger le PDF
            const fileName = `fiche_seance_${this.seance.topic.replace(/\s+/g, '_')}_${this.seance.date}.pdf`;
            pdfMake.createPdf(docDefinition).download(fileName);

            const message = usedDefaultLocation 
                ? 'Fiche générée avec coordonnées par défaut (géolocalisation indisponible)'
                : 'Fiche générée avec votre position actuelle';

            console.log(`Fiche de séance générée avec succès: ${fileName}`);
            console.log(`Coordonnées utilisées: Lat ${coordinates.latitude}, Lng ${coordinates.longitude}`);

            return { success: true, message, usedDefaultLocation };

        } catch (error) {
            console.error('Erreur lors de la génération de la fiche de séance:', error);
            return { 
                success: false, 
                message: `Impossible de générer la fiche de séance: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                usedDefaultLocation: false
            };
        }
    }

    // Méthode statique pour une utilisation rapide
    public static async generateSeanceSheet(
        seance: SeanceData, 
        coordinates?: LocationCoordinates,
        useCurrentLocation: boolean = true
    ): Promise<{ success: boolean; message: string; usedDefaultLocation: boolean }> {
        const generator = new SeanceSheetGenerator(seance, coordinates);
        return await generator.generatePDF(useCurrentLocation);
    }
}

export default SeanceSheetGenerator;
export type { SeanceData, LocationCoordinates };