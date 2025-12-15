import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EtudiantPalmares } from '@/app/(admin)/(jury)/deliberations/palmaresse/page';

// Configuration des polices
(pdfMake as any).vfs = (pdfFonts.vfs as any);

interface PromotionInfo {
    designation: string;
    anneeAcademique: string;
    section?: string;
    mention?: string;
    systeme?: string;
    orientation?: string;
    president?: string;
    cycle?: string;
}

// Fonction utilitaire pour le style des cellules
const cellStyle = (text: string | number, alignment: 'left' | 'center' | 'right' = 'center', color?: string) => {
    return {
        text: String(text),
        alignment: alignment,
        style: 'normal',
        fontSize: 9,
        ...(color && { color: color })
    };
};

// Fonction pour déterminer la couleur selon la moyenne
const getCellStyleForAverage = (moyenne: number, text: string, alignment: 'left' | 'center' | 'right' = 'center') => {
    const color = moyenne >= 10 ? 'green' : 'red';
    return cellStyle(text, alignment, color);
};

// Fonction pour charger une image en base64
async function getImageBase64(imagePath: string): Promise<string> {
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
        return '';
    }
}

//Generate qr-code with pdfmake
async function generatorQr(url: string) {
    return {
        qr: url,
        fit: [50, 50],
        foreground: 'blue',
        background: '#e0e7ff' // Fond bleu très clair
    }
}

// Fonction pour générer le bulletin d'un seul étudiant
export const generateSingleBulletin = async (etudiant: EtudiantPalmares, promotionInfo: PromotionInfo, type: string = 'Bulletin Annuel ') => {
    console.log("Promotion data : ", promotionInfo)
    console.log("Etudiant data : ", etudiant)
    // Charger les images en base64
    const logoRDCBase64 = await getImageBase64('/images/drc_flag.png');
    const logoESURSIBase64 = await getImageBase64('/images/min_logo.png');
    const filigraneBase64 = await getImageBase64('/images/background.jpg');

    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content: [],
        // Ajouter l'image de fond (filigrane) si disponible
        background: filigraneBase64 ? {
            image: filigraneBase64,
            width: 595.28, // Largeur A4 en points
            height: 841.89, // Hauteur A4 en points
            absolutePosition: { x: 0, y: 0 },
        } : undefined,
        styles: {
            header: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 10, bold: true, margin: [0, 5, 0, 3] },
            studentInfo: { fontSize: 10, margin: [0, 2, 0, 2] },
            tableHeader: { bold: true, fillColor: '#f0f0f0', alignment: 'center', fontSize: 7 },
            normal: { fontSize: 10 },
            small: { fontSize: 10 }
        },
        defaultStyle: { 
            fontSize: 10,
            alignment: 'center'
        }
    };

    // Générer un N/ref unique de 14 caractères basé sur la timestamp
    const timestamp = Date.now().toString();
    const nRef = ((parseInt(timestamp) * (etudiant.parcours._id?.length || 1))).toString().slice(-14).padStart(14, '0');
    const nRefDigits = (nRef).split('');

    // En-tête institutionnel avec logos
    docDefinition.content.push({
        table: {
            widths: [55, '*', 55], 
            body: [
                [
                    // Logo RDC
                    logoRDCBase64 ? {
                        image: logoRDCBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [true, true, false, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small' 
                    },
                    // Texte central
                    {
                        text: "République Démocratique du Congo\nMinistère de l'Enseignement Supérieur, Universitaire, Recherche Scientique et Innovations\nInstitut National du Bâtiment et des Travaux Publics\n\"I.N.B.T.P/Kinshasa - Ngaliema\"",
                        alignment: "center",
                        style: 'small',
                        border: [false, true, false, true]
                    },
                    // Logo ESURSI
                    logoESURSIBase64 ? {
                        image: logoESURSIBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [false, true, true, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small',
                        border: [false, true, true, true] 
                    }
                ]
            ]
        },
        style: 'studentInfo',
        margin: [0, 0, 0, 0]
    });
    
    // Calcul pour 14 cases (100 / 14 ≈ 7.14%)
    const caseWidth = `${100 / 14}%`;
    const widths14Cases = Array(14).fill(caseWidth); 

    // Tableau N/ref avec 14 cases
    docDefinition.content.push({
        table: {
            widths: ['10%', '90%'],
            body: [
                [
                    { 
                        text: 'N/ref', 
                        alignment: 'right', 
                        style: 'normal', 
                        border: [true, false, false, false],
                        margin: [0, 4, 0, 0] 
                    },
                    {
                        border: [false, false, true, false],
                        table: {
                            widths: widths14Cases, 
                            body: [
                                [
                                    { text: nRefDigits[0], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[1], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[2], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[3], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[4], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[5], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[6], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[7], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[8], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[9], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[10], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[11], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[12], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[13], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                ]
                            ]
                        }
                    }
                ],
                [
                    {
                        text: `${type}`,
                        style: 'normal',
                        alignment: 'center',
                        colSpan: 2
                    }
                ]
            ]
        },
        margin: [0, 0, 0, 0]
    });

    // Tableau des notes selon votre structure originale (8 colonnes)
    const tableBody : any[] = [];
    

    etudiant.moyennesUnites.forEach(moyenneUnite => {

        // Lignes des matières selon votre structure originale
        moyenneUnite.notesUnites.forEach(noteUnite => {
            const note = noteUnite.notes;
            const totalSession = (note.cmi || 0) + (note.examen || 0);
            const noteFinale = note.rattrapage > 0 ? Math.max(totalSession, note.rattrapage) : totalSession;
            const totalP = noteFinale * noteUnite.matiere.credits;
            
            // tableBody.push([
            //     // Colonne 1: Matière
            //     cellStyle(noteUnite.matiere.designation || 'N/A', 'left'), 
            //     // Colonne 2: CMI (Session)
            //     cellStyle((note.cmi) ? parseFloat(note.cmi.toString()).toFixed(2) : 'X'), 
            //     // Colonne 3: EXA (Session)
            //     cellStyle((note.examen) ? parseFloat(note.examen.toString()).toFixed(2) : 'X'),
            //     // Colonne 4: TOT.S (Session Total)
            //     cellStyle((note.cmi && note.examen) ? totalSession.toFixed(2) : 'X'), 
            //     // Colonne 5: EXA (Rattrapage)
            //     cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
            //     // Colonne 6: TOT.R (Rattrapage Total)
            //     cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
            //     // Colonne 7: CRD
            //     cellStyle(noteUnite.matiere.credits || ''), 
            //     // Colonne 8: TOTAL.P
            //     cellStyle(totalP.toFixed(2)),
            // ]);
        });

        // Ligne de synthèse de l'unité
        tableBody.push([            
            {
                text: moyenneUnite.unite.designation,
                colSpan: 6,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5',
                margin: [1,1,1,1]
            },
            {}, {}, {}, {},{},
            cellStyle(moyenneUnite.unite.credits, 'center'),
            getCellStyleForAverage(moyenneUnite.moyenneUnite, `${moyenneUnite.moyenneUnite.toFixed(2)}`),
            // cellStyle((moyenneUnite.moyenneUnite * moyenneUnite.unite.credits).toFixed(2))
        ]);
    });

    // Calculs pour la synthèse
    let totalCredit = 0;
    let totalNote = 0;
    let ncv = 0; // Nombre de crédits validés
    
    etudiant.moyennesUnites.forEach(moyenneUnite => {
        totalCredit += moyenneUnite.unite.credits;
        totalNote += moyenneUnite.moyenneUnite * moyenneUnite.unite.credits;
        if (moyenneUnite.moyenneUnite >= 10) {
            ncv += moyenneUnite.unite.credits;
        }
    });
    
    const maxNote = totalCredit * 20; // Note maximale possible
    const pourcentageCalcule = maxNote ? ((totalNote / maxNote) * 100) : 0;
    
    const mentionJurry = (pourcentage: number) => {
        if(pourcentage >= 90.0) return 'Excellent';
        else if(pourcentage >= 80.0) return 'Très Bien';
        else if(pourcentage >= 70.0) return 'Bien';
        else if(pourcentage >= 60.0) return 'Assez Bien';
        else if(pourcentage >= 50.0) return 'Passable';
        else return 'Insuffisant';
    };

    // Section de synthèse selon votre structure originale
    const syntheseRow = [
        [
            {
                text: 'Synthèse des notes',
                colSpan: 2,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5' 
            },
            {}
        ],
        [
            {
                text: 'Total crédits',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(ncv, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits non validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit - ncv, 'center'),
        ],
        [
            {
                text: 'Pourcentage',
                alignment: 'left',
                bold: true,
            },
            cellStyle(pourcentageCalcule.toFixed(2), 'center'),
        ],
        [
            {
                text: 'Mention du jury',
                alignment: 'left',
                bold: true,
            },
            cellStyle(mentionJurry(pourcentageCalcule), 'center'),
        ]
    ];


    docDefinition.content.push({
        table: {
            widths: ['50%', '50%'],
            body: [
            [
                {
                stack: [
                    `CYCLE : ${promotionInfo.cycle}`,
                    `SYTEME : ${promotionInfo.systeme}`,                    
                    `PROMOTION : ${promotionInfo.designation}`,
                    `DECISION DU JURY : ${pourcentageCalcule >= 50 ? 'Admis' : 'Non Admis'}`,
                ],
                style: 'small',
                alignment: 'left'
                },
                {
                stack: [
                    `ETUDIANT : ${etudiant?.parcours?.etudiantId?.nom} ${etudiant?.parcours?.etudiantId?.post_nom} ${etudiant?.parcours?.etudiantId?.prenom ? etudiant?.parcours?.etudiantId?.prenom : ''}`,                    
                    `SEXE : ${etudiant?.parcours?.etudiantId?.sexe}`, 
                    `NE(E) A : ${etudiant?.parcours?.etudiantId?.lieu_naissance ? etudiant?.parcours?.etudiantId?.lieu_naissance : 'S/N'}, LE ${etudiant?.parcours?.etudiantId?.date_naissance ? new Date(etudiant?.parcours?.etudiantId?.date_naissance).toLocaleDateString() : 'S/N'}`,                    
                    `MATRICULE : ${etudiant?.parcours?.etudiantId?.matricule}`,
                ],
                style: 'small',
                alignment: 'left'
                }
            ],
            [
                {
                    text: `RANG : ${etudiant?.rang}e`,
                    style: 'small',
                    alignment: 'left',
                    border: [true, false, false, false]
                },
                {
                    text: `ANNEE ACADEMIQUE : ${promotionInfo.anneeAcademique}`,
                    style: 'small',
                    alignment: 'right',
                    border: [false, false, true, false]
                }
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    });


    // Header des notes CORRIGÉ
    docDefinition.content.push({
        table: {
            // 8 colonnes// Tentons la première approche : widths proportionnelles (*) (plus stable)
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'], 
            body: [
            // LIGNE 1 (Total de 5 entrées définissant 8 colonnes)
            [
                { 
                    text: 'MATIERES', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'SESSION', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 3,
                    bold: true
                },
                {}, // Placeholder pour Session (automatiquement ignoré, mais gardé par convention)
                {}, // Placeholder pour Session
                { 
                    text: 'RATTRAPAGE', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 2,
                    bold: true
                },
                {}, // Placeholder pour Rattrapage
                { 
                    text: 'CRD', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'TOT.P', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                }
            ],
            // LIGNE 2 (DOIT contenir UNIQUEMENT les 6 cellules qui ne sont pas couvertes par un rowSpan)
            [
                '', // 1. Cellule vide pour rowSpan de 'Matière' (OK)
                { 
                    text: 'CMI', 
                    style: 'small',
                    alignment: 'center',
                }, // 2. Sous-colonne de 'Session'
                { 
                    text: 'EXA', 
                    style: 'small',
                    alignment: 'center',
                }, // 3. Sous-colonne de 'Session'
                { 
                    text: 'TOT', 
                    style: 'small',
                    alignment: 'center',
                }, // 4. Sous-colonne de 'Session'
                { 
                    text: 'EXA', 
                    style: 'small',
                    alignment: 'center',
                }, // 5. Sous-colonne de 'Rattrapage'
                {
                    text: 'TOT', 
                    style: 'small',
                    alignment: 'center',
                }, // 6. Sous-colonne de 'Rattrapage'
                // ❌ Les cellules pour 'CRD' et 'TOTAL.P' sont maintenant ABSENTES.
            ],
            [
                '',
                { text: '10', style: 'small' },
                { text: '10', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' },
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    })

    docDefinition.content.push({
        table: {
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'],
            body: tableBody
        },
        margin: [0, 0, 0, 20]
    });

    docDefinition.content.push({
        columns: [
            {
                width: '60%',
                table: {
                    widths: ['70%', '30%'],
                    body: syntheseRow 
                },
                margin: [0, 0, 10, 0]
            },
            {
                width: '40%',
                stack: [
                    {
                        qr: 'http://172.20.10.1:3000/recours/' + etudiant.parcours._id,
                        fit: 100,
                        foreground: 'blue',
                        background: '#e0e7ff',
                        alignment: 'center'
                    },
                    {
                        text: `Fait à Kinshasa, le ${new Date().toLocaleDateString('fr-FR')}`,
                        alignment: 'center',
                        fontSize: 10,
                        margin: [0, 10, 0, 5]
                    },
                    {
                        text: `${promotionInfo.president || 'Le Directeur des Études'}`,
                        alignment: 'center',
                        fontSize: 10,
                        bold: true,
                        margin: [0, 5, 0, 0]
                    }
                ],
                alignment: 'center'
            }
        ],
        columnGap: 20,
        margin: [0, 10, 0, 0]
    });
    
    return pdfMake.createPdf(docDefinition);
};

export const generateSemestreBulletin = async (etudiant: EtudiantPalmares, promotionInfo: PromotionInfo, decision: string, semestre: string = 'Semestre 5') => {
    console.log("Promotion data : ", promotionInfo)
    console.log("Etudiant data : ", etudiant)
    // Charger les images en base64
    const logoRDCBase64 = await getImageBase64('/images/drc_flag.png');
    const logoESURSIBase64 = await getImageBase64('/images/min_logo.png');
    const filigraneBase64 = await getImageBase64('/images/background.jpg');

    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content: [],
        // Ajouter l'image de fond (filigrane) si disponible
        background: filigraneBase64 ? {
            image: filigraneBase64,
            width: 595.28, // Largeur A4 en points
            height: 841.89, // Hauteur A4 en points
            absolutePosition: { x: 0, y: 0 },
        } : undefined,
        styles: {
            header: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 10, bold: true, margin: [0, 5, 0, 3] },
            studentInfo: { fontSize: 10, margin: [0, 2, 0, 2] },
            tableHeader: { bold: true, fillColor: '#f0f0f0', alignment: 'center', fontSize: 7 },
            normal: { fontSize: 10 },
            small: { fontSize: 10 }
        },
        defaultStyle: { 
            fontSize: 10,
            alignment: 'center'
        }
    };

    // Générer un N/ref unique de 14 caractères basé sur la timestamp
    const timestamp = Date.now().toString();
    const nRef = ((parseInt(timestamp) * (etudiant.parcours._id?.length || 1))).toString().slice(-14).padStart(14, '0');
    const nRefDigits = (nRef).split('');

    // En-tête institutionnel avec logos
    docDefinition.content.push({
        table: {
            widths: [55, '*', 55], 
            body: [
                [
                    // Logo RDC
                    logoRDCBase64 ? {
                        image: logoRDCBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [true, true, false, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small' 
                    },
                    // Texte central
                    {
                        text: "République Démocratique du Congo\nMinistère de l'Enseignement Supérieur, Universitaire, Recherche Scientique et Innovations\nInstitut National du Bâtiment et des Travaux Publics\n\"I.N.B.T.P/Kinshasa - Ngaliema\"",
                        alignment: "center",
                        style: 'small',
                        border: [false, true, false, true]
                    },
                    // Logo ESURSI
                    logoESURSIBase64 ? {
                        image: logoESURSIBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [false, true, true, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small',
                        border: [false, true, true, true] 
                    }
                ]
            ]
        },
        style: 'studentInfo',
        margin: [0, 0, 0, 0]
    });
    
    // Calcul pour 14 cases (100 / 14 ≈ 7.14%)
    const caseWidth = `${100 / 14}%`;
    const widths14Cases = Array(14).fill(caseWidth); 

    // Tableau N/ref avec 14 cases
    docDefinition.content.push({
        table: {
            widths: ['10%', '90%'],
            body: [
                [
                    { 
                        text: 'N/ref', 
                        alignment: 'right', 
                        style: 'normal', 
                        border: [true, false, false, false],
                        margin: [0, 4, 0, 0] 
                    },
                    {
                        border: [false, false, true, false],
                        table: {
                            widths: widths14Cases, 
                            body: [
                                [
                                    { text: nRefDigits[0], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[1], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[2], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[3], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[4], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[5], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[6], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[7], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[8], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[9], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[10], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[11], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[12], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[13], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                ]
                            ]
                        }
                    }
                ],
                [
                    {
                        text: `Bulletin du ${semestre}`,
                        style: 'normal',
                        alignment: 'center',
                        colSpan: 2
                    }
                ]
            ]
        },
        margin: [0, 0, 0, 0]
    });

    docDefinition.content.push({
        table: {
            widths: ['50%', '50%'],
            body: [
            [
                {
                stack: [
                    `CYCLE : ${promotionInfo.cycle}`,
                    `SYTEME : ${promotionInfo.systeme}`,                    
                    `PROMOTION : ${promotionInfo.designation}`,
                    `DECISION DU JURY : ${decision}`,
                ],
                style: 'small',
                alignment: 'left'
                },
                {
                stack: [
                    `ETUDIANT : ${etudiant?.parcours?.etudiantId?.nom} ${etudiant?.parcours?.etudiantId?.post_nom} ${etudiant?.parcours?.etudiantId?.prenom ? etudiant?.parcours?.etudiantId?.prenom : ''}`,                    
                    `SEXE : ${etudiant?.parcours?.etudiantId?.sexe}`, 
                    `NE(E) A : ${etudiant?.parcours?.etudiantId?.lieu_naissance ? etudiant?.parcours?.etudiantId?.lieu_naissance : 'S/N'}, LE ${etudiant?.parcours?.etudiantId?.date_naissance ? new Date(etudiant?.parcours?.etudiantId?.date_naissance).toLocaleDateString() : 'S/N'}`,                    
                    `MATRICULE : ${etudiant?.parcours?.etudiantId?.matricule}`,
                ],
                style: 'small',
                alignment: 'left'
                }
            ],
            [
                {
                    text: `RANG : ${etudiant?.rang}e`,
                    style: 'small',
                    alignment: 'left',
                    border: [true, false, false, false]
                },
                {
                    text: `ANNEE ACADEMIQUE : ${promotionInfo.anneeAcademique}`,
                    style: 'small',
                    alignment: 'right',
                    border: [false, false, true, false]
                }
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    });


    // Header des notes CORRIGÉ
    docDefinition.content.push({
        table: {
            // 8 colonnes// Tentons la première approche : widths proportionnelles (*) (plus stable)
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'], 
            body: [
            // LIGNE 1 (Total de 5 entrées définissant 8 colonnes)
            [
                { 
                    text: 'MATIERES', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'SESSION', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 3,
                    bold: true
                },
                {}, // Placeholder pour Session (automatiquement ignoré, mais gardé par convention)
                {}, // Placeholder pour Session
                { 
                    text: 'RATTRAPAGE', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 2,
                    bold: true
                },
                {}, // Placeholder pour Rattrapage
                { 
                    text: 'CRD', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'TOT.P', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                }
            ],
            // LIGNE 2 (DOIT contenir UNIQUEMENT les 6 cellules qui ne sont pas couvertes par un rowSpan)
            [
                '', // 1. Cellule vide pour rowSpan de 'Matière' (OK)
                { 
                    text: 'CMI', 
                    style: 'small',
                    alignment: 'center',
                }, // 2. Sous-colonne de 'Session'
                { 
                    text: 'EXA', 
                    style: 'small',
                    alignment: 'center',
                }, // 3. Sous-colonne de 'Session'
                { 
                    text: 'TOT', 
                    style: 'small',
                    alignment: 'center',
                }, // 4. Sous-colonne de 'Session'
                { 
                    text: 'EXA', 
                    style: 'small',
                    alignment: 'center',
                }, // 5. Sous-colonne de 'Rattrapage'
                {
                    text: 'TOT', 
                    style: 'small',
                    alignment: 'center',
                }, // 6. Sous-colonne de 'Rattrapage'
                // ❌ Les cellules pour 'CRD' et 'TOTAL.P' sont maintenant ABSENTES.
            ],
            [
                '',
                { text: '10', style: 'small' },
                { text: '10', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' },
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    });
    
    // Tableau des notes selon votre structure originale (8 colonnes)
    const tableBody : any[] = [];
    
    // Filtrer les unités par semestre (utiliser une logique plus robuste)
    const moyennesUnites = etudiant.moyennesUnites.filter(moyenneUnite => {
        console.log("Current moyenneUnite", moyenneUnite);

        console.log("Semestre : ", semestre)
        // Si pas de semestre défini, prendre toutes les unités
        if (!moyenneUnite.semestre) return true;
        // Sinon filtrer par le libellé du semestre
        return moyenneUnite.semestre.libelle === semestre;
    });

    console.log("moyennesUnites", moyennesUnites);

    if(moyennesUnites.length === 0){
        return;
    }

    moyennesUnites.forEach(moyenneUnite => {

        // Lignes des matières selon votre structure originale
        moyenneUnite.notesUnites.forEach(noteUnite => {
            const note = noteUnite.notes;
            const totalSession = (note.cmi || 0) + (note.examen || 0);
            const noteFinale = note.rattrapage > 0 ? Math.max(totalSession, note.rattrapage) : totalSession;
            const totalP = noteFinale * noteUnite.matiere.credits;
            
            tableBody.push([
                // Colonne 1: Matière
                cellStyle(noteUnite.matiere.designation || 'N/A', 'left'), 
                // Colonne 2: CMI (Session)
                cellStyle((note.cmi) ? parseFloat(note.cmi.toString()).toFixed(2) : 'X'), 
                // Colonne 3: EXA (Session)
                cellStyle((note.examen) ? parseFloat(note.examen.toString()).toFixed(2) : 'X'),
                // Colonne 4: TOT.S (Session Total)
                cellStyle((note.cmi && note.examen) ? totalSession.toFixed(2) : 'X'), 
                // Colonne 5: EXA (Rattrapage)
                cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
                // Colonne 6: TOT.R (Rattrapage Total)
                cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
                // Colonne 7: CRD
                cellStyle(noteUnite.matiere.credits || ''), 
                // Colonne 8: TOTAL.P
                cellStyle(totalP.toFixed(2)),
            ]);
        });

        // Ligne de synthèse de l'unité
        tableBody.push([            
            {
                text: moyenneUnite.unite.designation,
                colSpan: 6,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5',
                margin: [1,1,1,1]
            },
            {}, {}, {}, {},{},
            cellStyle(moyenneUnite.unite.credits, 'center'),
            getCellStyleForAverage(moyenneUnite.moyenneUnite, `${moyenneUnite.moyenneUnite.toFixed(2)}`),
            // cellStyle((moyenneUnite.moyenneUnite * moyenneUnite.unite.credits).toFixed(2))
        ]);
    });

    docDefinition.content.push({
        table: {
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'],
            body: tableBody
        },
        margin: [0, 0, 0, 5]
    });

    // Calculs pour la synthèse
    let totalCredit = 0;
    let totalNote = 0;
    let ncv = 0; // Nombre de crédits validés
    
    moyennesUnites.forEach(moyenneUnite => {
        totalCredit += moyenneUnite.unite.credits;
        totalNote += moyenneUnite.moyenneUnite * moyenneUnite.unite.credits;
        if (moyenneUnite.moyenneUnite >= 10) {
            ncv += moyenneUnite.unite.credits;
        }
    });
    
    const maxNote = totalCredit * 20; // Note maximale possible
    const pourcentageCalcule = maxNote ? ((totalNote / maxNote) * 100) : 0;
    
    const mentionJurry = (pourcentage: number) => {
        if(pourcentage >= 90.0) return 'Excellent';
        else if(pourcentage >= 80.0) return 'Très Bien';
        else if(pourcentage >= 70.0) return 'Bien';
        else if(pourcentage >= 60.0) return 'Assez Bien';
        else if(pourcentage >= 50.0) return 'Passable';
        else return 'Insuffisant';
    };

    // Section de synthèse selon votre structure originale
    const syntheseRow = [
        [
            {
                text: 'Synthèse des notes du semestre ',
                colSpan: 2,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5' 
            },
            {}
        ],
        [
            {
                text: 'Total crédits',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(ncv, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits non validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit - ncv, 'center'),
        ],
        [
            {
                text: 'Pourcentage',
                alignment: 'left',
                bold: true,
            },
            cellStyle(pourcentageCalcule.toFixed(2), 'center'),
        ],
        [
            {
                text: 'Mention du jury',
                alignment: 'left',
                bold: true,
            },
            cellStyle(mentionJurry(pourcentageCalcule), 'center'),
        ]
    ];

    docDefinition.content.push({
        columns: [
            {
                width: '60%',
                table: {
                    widths: ['70%', '30%'],
                    body: syntheseRow 
                },
                margin: [0, 0, 10, 0]
            },
            {
                width: '40%',
                stack: [
                    {
                        qr: 'http://172.20.10.1:3000/recours/' + etudiant.parcours._id,
                        fit: 100,
                        alignment: 'center'
                    },
                    {
                        text: `Fait à Kinshasa, le ${new Date().toLocaleDateString('fr-FR')}`,
                        alignment: 'center',
                        fontSize: 10,
                        margin: [0, 15, 0, 0]
                    }
                ],
                alignment: 'center'
            }
        ],
        columnGap: 20,
        margin: [0, 1, 0, 0]
    });
    return pdfMake.createPdf(docDefinition);
};
// Fonction pour générer les bulletins de plusieurs étudiants
export const generateGroupBulletins = async (etudiants: EtudiantPalmares[], promotionInfo: PromotionInfo) => {
    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [],
        styles: {
            header: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 3] },
            studentInfo: { fontSize: 10, margin: [0, 2, 0, 2] },
            tableHeader: { bold: true, fillColor: '#f0f0f0', alignment: 'center', fontSize: 9 },
            normal: { fontSize: 10 },
            small: { fontSize: 8 }
        },
        defaultStyle: { 
            fontSize: 10,
            alignment: 'left'
        }
    };

    for (let i = 0; i < etudiants.length; i++) {
        const etudiant = etudiants[i];
        
        // Ajouter un saut de page sauf pour le premier étudiant
        if (i > 0) {
            docDefinition.content.push({ text: '', pageBreak: 'before' });
        }

        // Générer le contenu du bulletin pour cet étudiant
        const singleBulletinContent = await getSingleBulletinContent(etudiant, promotionInfo);
        docDefinition.content.push(...singleBulletinContent);
    }

    return pdfMake.createPdf(docDefinition);
};

// Fonction helper pour obtenir le contenu d'un bulletin (utilise la même logique que generateSingleBulletin)
const getSingleBulletinContent = async (etudiant: EtudiantPalmares, promotionInfo: PromotionInfo) => {
    // Charger les images en base64
    const logoRDCBase64 = await getImageBase64('/images/drc_flag.png');
    const logoESURSIBase64 = await getImageBase64('/images/min_logo.png');

    const content = [];

    // Générer un N/ref unique de 14 caractères basé sur la timestamp
    const timestamp = Date.now().toString();
    const nRef = ((parseInt(timestamp) * (etudiant.parcours._id?.length || 1))).toString().slice(-14).padStart(14, '0');
    const nRefDigits = (nRef).split('');

    // En-tête institutionnel avec logos
    content.push({
        table: {
            widths: [55, '*', 55], 
            body: [
                [
                    // Logo RDC
                    logoRDCBase64 ? {
                        image: logoRDCBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [true, true, false, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small' 
                    },
                    // Texte central
                    {
                        text: "République Démocratique du Congo\nMinistère de l'Enseignement Supérieur, Universitaire, Recherche Scientique et Innovations\nInstitut National du Bâtiment et des Travaux Publics\n\"I.N.B.T.P/Kinshasa - Ngaliema\"",
                        alignment: "center",
                        style: 'small',
                        border: [false, true, false, true]
                    },
                    // Logo ESURSI
                    logoESURSIBase64 ? {
                        image: logoESURSIBase64,
                        width: 50,
                        height: 50,
                        alignment: 'center',
                        margin: [0, 5, 0, 0],
                        border: [false, true, true, true]
                    } : { 
                        text: "", 
                        alignment: 'center', 
                        style: 'small',
                        border: [false, true, true, true] 
                    }
                ]
            ]
        },
        style: 'studentInfo',
        margin: [0, 0, 0, 0]
    });
    
    // Calcul pour 14 cases (100 / 14 ≈ 7.14%)
    const caseWidth = `${100 / 14}%`;
    const widths14Cases = Array(14).fill(caseWidth); 

    // Tableau N/ref avec 14 cases
    content.push({
        table: {
            widths: ['10%', '90%'],
            body: [
                [
                    { 
                        text: 'N/ref', 
                        alignment: 'right', 
                        style: 'normal', 
                        border: [true, false, false, false],
                        margin: [0, 4, 0, 0] 
                    },
                    {
                        border: [false, false, true, false],
                        table: {
                            widths: widths14Cases, 
                            body: [
                                [
                                    { text: nRefDigits[0], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[1], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[2], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[3], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[4], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[5], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[6], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[7], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[8], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[9], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[10], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[11], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[12], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                    { text: nRefDigits[13], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                                ]
                            ]
                        }
                    }
                ],
                [
                    {
                        text: `Bulletin Annuel`,
                        style: 'normal',
                        alignment: 'center',
                        colSpan: 2
                    }
                ]
            ]
        },
        margin: [0, 0, 0, 0]
    });

    // Calculs pour la synthèse
    let totalCredit = 0;
    let totalNote = 0;
    let ncv = 0; // Nombre de crédits validés
    
    etudiant.moyennesUnites.forEach(moyenneUnite => {
        totalCredit += moyenneUnite.unite.credits;
        totalNote += moyenneUnite.moyenneUnite * moyenneUnite.unite.credits;
        if (moyenneUnite.moyenneUnite >= 10) {
            ncv += moyenneUnite.unite.credits;
        }
    });
    
    const maxNote = totalCredit * 20; // Note maximale possible
    const pourcentageCalcule = maxNote ? ((totalNote / maxNote) * 100) : 0;
    
    const mentionJurry = (pourcentage: number) => {
        if(pourcentage >= 90.0) return 'Excellent';
        else if(pourcentage >= 80.0) return 'Très Bien';
        else if(pourcentage >= 70.0) return 'Bien';
        else if(pourcentage >= 60.0) return 'Assez Bien';
        else if(pourcentage >= 50.0) return 'Passable';
        else return 'Insuffisant';
    };

    // Informations de l'étudiant
    content.push({
        table: {
            widths: ['50%', '50%'],
            body: [
            [
                {
                stack: [
                    `CYCLE : ${promotionInfo.cycle}`,
                    `SYTEME : ${promotionInfo.systeme}`,                    
                    `PROMOTION : ${promotionInfo.designation}`,
                    `DECISION DU JURY : ${pourcentageCalcule >= 50 ? 'Admis' : 'Non Admis'}`,
                ],
                style: 'small',
                alignment: 'left'
                },
                {
                stack: [
                    `ETUDIANT : ${etudiant?.parcours?.etudiantId?.nom} ${etudiant?.parcours?.etudiantId?.post_nom} ${etudiant?.parcours?.etudiantId?.prenom ? etudiant?.parcours?.etudiantId?.prenom : ''}`,                    
                    `SEXE : ${etudiant?.parcours?.etudiantId?.sexe}`, 
                    `NE(E) A : ${etudiant?.parcours?.etudiantId?.lieu_naissance ? etudiant?.parcours?.etudiantId?.lieu_naissance : 'S/N'}, LE ${etudiant?.parcours?.etudiantId?.date_naissance ? new Date(etudiant?.parcours?.etudiantId?.date_naissance).toLocaleDateString() : 'S/N'}`,                    
                    `MATRICULE : ${etudiant?.parcours?.etudiantId?.matricule}`,
                ],
                style: 'small',
                alignment: 'left'
                }
            ],
            [
                {
                    text: `RANG : ${etudiant?.rang}e`,
                    style: 'small',
                    alignment: 'left',
                    border: [true, false, false, false]
                },
                {
                    text: `ANNEE ACADEMIQUE : ${promotionInfo.anneeAcademique}`,
                    style: 'small',
                    alignment: 'right',
                    border: [false, false, true, false]
                }
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    });

    // Header des notes
    content.push({
        table: {
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'], 
            body: [
            [
                { 
                    text: 'MATIERES', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'SESSION', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 3,
                    bold: true
                },
                {}, {}, 
                { 
                    text: 'RATTRAPAGE', 
                    style: 'small',
                    alignment: 'center',
                    colSpan: 2,
                    bold: true
                },
                {}, 
                { 
                    text: 'CRD', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                },
                { 
                    text: 'TOT.P', 
                    style: 'small',
                    alignment: 'center',
                    rowSpan: 3,
                    bold: true
                }
            ],
            [
                '', 
                { text: 'CMI', style: 'small', alignment: 'center' },
                { text: 'EXA', style: 'small', alignment: 'center' },
                { text: 'TOT', style: 'small', alignment: 'center' },
                { text: 'EXA', style: 'small', alignment: 'center' },
                { text: 'TOT', style: 'small', alignment: 'center' }
            ],
            [
                '',
                { text: '10', style: 'small' },
                { text: '10', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' },
                { text: '20', style: 'small' }
            ]
            ]
        },
        margin: [0, 0, 0, 0]
    });

    // Tableau des notes par unité
    const tableBody: any[] = [];

    etudiant.moyennesUnites.forEach(moyenneUnite => {
        // Lignes des matières selon votre structure originale
        moyenneUnite.notesUnites.forEach(noteUnite => {
            const note = noteUnite.notes;
            const totalSession = (note.cmi || 0) + (note.examen || 0);
            const noteFinale = note.rattrapage > 0 ? Math.max(totalSession, note.rattrapage) : totalSession;
            const totalP = noteFinale * noteUnite.matiere.credits;
            
            // tableBody.push([
            //     // Colonne 1: Matière
            //     cellStyle(noteUnite.matiere.designation || 'N/A', 'left'), 
            //     // Colonne 2: CMI (Session)
            //     cellStyle((note.cmi) ? parseFloat(note.cmi.toString()).toFixed(2) : 'X'), 
            //     // Colonne 3: EXA (Session)
            //     cellStyle((note.examen) ? parseFloat(note.examen.toString()).toFixed(2) : 'X'),
            //     // Colonne 4: TOT.S (Session Total)
            //     cellStyle((note.cmi && note.examen) ? totalSession.toFixed(2) : 'X'), 
            //     // Colonne 5: EXA (Rattrapage)
            //     cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
            //     // Colonne 6: TOT.R (Rattrapage Total)
            //     cellStyle((note.rattrapage) ? note.rattrapage.toFixed(2) : 'X'), 
            //     // Colonne 7: CRD
            //     cellStyle(noteUnite.matiere.credits || ''), 
            //     // Colonne 8: TOTAL.P
            //     cellStyle(totalP.toFixed(2)),
            // ]);
        });

        // Ligne de synthèse de l'unité
        tableBody.push([            
            {
                text: moyenneUnite.unite.designation,
                colSpan: 6,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5',
                margin: [1,1,1,1]
            },
            {}, {}, {}, {},{},
            cellStyle(moyenneUnite.unite.credits, 'center'),
            getCellStyleForAverage(moyenneUnite.moyenneUnite, `${moyenneUnite.moyenneUnite.toFixed(2)}`),
        ]);
    });

    content.push({
        table: {
            widths: ['40%', '8%', '8%', '8%', '8%', '8%', '10%', '10%'],
            body: tableBody
        },
        margin: [0, 0, 0, 20]
    });

    // Section de synthèse selon votre structure originale
    const syntheseRow = [
        [
            {
                text: 'Synthèse des notes',
                colSpan: 2,
                alignment: 'left',
                bold: true,
                fillColor: '#f5f5f5' 
            },
            {}
        ],
        [
            {
                text: 'Total crédits',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(ncv, 'center'),
        ],
        [
            {
                text: 'Nombre des crédits non validés',
                alignment: 'left',
                bold: true,
            },
            cellStyle(totalCredit - ncv, 'center'),
        ],
        [
            {
                text: 'Pourcentage',
                alignment: 'left',
                bold: true,
            },
            cellStyle(pourcentageCalcule.toFixed(2), 'center'),
        ],
        [
            {
                text: 'Mention du jury',
                alignment: 'left',
                bold: true,
            },
            cellStyle(mentionJurry(pourcentageCalcule), 'center'),
        ]
    ];

    content.push({
        columns: [
            {
                width: '60%',
                table: {
                    widths: ['70%', '30%'],
                    body: syntheseRow 
                },
                margin: [0, 0, 10, 0]
            },
            {
                width: '40%',
                stack: [
                    {
                        qr: 'http://172.20.10.1:3000/recours/' + etudiant.parcours._id,
                        fit: 100,
                        foreground: 'blue',
                        background: '#e0e7ff',
                        alignment: 'center'
                    },
                    {
                        text: `Fait à Kinshasa, le ${new Date().toLocaleDateString('fr-FR')}`,
                        alignment: 'center',
                        fontSize: 10,
                        margin: [0, 10, 0, 5]
                    },
                    {
                        text: `${promotionInfo.president || 'Le Directeur des Études'}`,
                        alignment: 'center',
                        fontSize: 10,
                        bold: true,
                        margin: [0, 5, 0, 0]
                    }
                ],
                alignment: 'center'
            }
        ],
        columnGap: 20,
        margin: [0, 10, 0, 0]
    });

    return content;
};

// Fonction helper pour obtenir le texte de la mention
const getMentionText = (mention: string): string => {
    switch (mention) {
        case 'A': return 'Excellent';
        case 'B': return 'Très Bien';
        case 'C': return 'Bien';
        case 'D': return 'Assez Bien';
        case 'E': return 'Passable';
        case 'F': return 'Insuffisant';
        default: return 'Non défini';
    }
};

// Fonction pour télécharger le PDF
export const downloadPDF = (pdfDoc: any, filename: string) => {
    pdfDoc.download(filename);
};

// Fonction pour ouvrir le PDF dans un nouvel onglet
export const openPDF = (pdfDoc: any) => {
    pdfDoc.open();
};

