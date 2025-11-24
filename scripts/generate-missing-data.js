const fs = require('fs');
const path = require('path');

// Listes de prénoms congolais/africains masculins
const prenomsHommes = [
    'Jean', 'Pierre', 'Paul', 'Michel', 'André', 'François', 'Joseph', 'Antoine',
    'Emmanuel', 'Daniel', 'David', 'Samuel', 'Matthieu', 'Luc', 'Marc', 'Thomas',
    'Olivier', 'Nicolas', 'Philippe', 'Christophe', 'Sébastien', 'Julien',
    'Fabrice', 'Patrice', 'Maurice', 'Alain', 'Bernard', 'Claude', 'Gérard',
    'Mukendi', 'Kabongo', 'Tshilobo', 'Mbuyi', 'Ngalula', 'Kasongo', 'Mwamba',
    'Kalala', 'Ilunga', 'Katanga', 'Mujinga', 'Kabila', 'Tshisekedi', 'Mulumba'
];

// Fonction pour générer un prénom aléatoire
function genererPrenom(sexe) {
    if (sexe === 'M') {
        return prenomsHommes[Math.floor(Math.random() * prenomsHommes.length)];
    }
    // Pour l'instant tous sont masculins dans le CSV
    return prenomsHommes[Math.floor(Math.random() * prenomsHommes.length)];
}

// Fonction pour générer un email
function genererEmail(nom, prenom) {
    const nomClean = nom.toLowerCase().replace(/[^a-z]/g, '');
    const prenomClean = prenom.toLowerCase().replace(/[^a-z]/g, '');
    const domaines = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com', 'univ-kinshasa.cd'];
    const domaine = domaines[Math.floor(Math.random() * domaines.length)];
    
    return `${prenomClean}.${nomClean}@${domaine}`;
}

// Fonction pour générer un numéro de téléphone congolais
function genererTelephone() {
    // Format: +243 9XX XXX XXX (numéros congolais)
    const prefixes = ['97', '98', '99', '81', '82', '83', '84', '85', '89'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const numero1 = Math.floor(Math.random() * 900) + 100; // 100-999
    const numero2 = Math.floor(Math.random() * 900) + 100; // 100-999
    
    return `+243 ${prefix}${numero1} ${numero2}`;
}

// Fonction pour traiter le CSV
function traiterCSV() {
    const cheminFichier = 'c:\\Users\\Tychique Mpukuta\\Downloads\\ENSEIGNANTS HE - agents-enseignant.csv';
    const cheminSortie = 'c:\\Users\\Tychique Mpukuta\\Downloads\\ENSEIGNANTS HE - agents-enseignant-complet.csv';
    
    try {
        // Lire le fichier CSV
        const contenu = fs.readFileSync(cheminFichier, 'utf8');
        const lignes = contenu.split('\n').filter(ligne => ligne.trim() !== '');
        
        // Traiter chaque ligne
        const lignesTraitees = lignes.map((ligne, index) => {
            if (index === 0) {
                // Garder l'en-tête tel quel
                return ligne;
            }
            
            const colonnes = ligne.split(',');
            if (colonnes.length < 9) return ligne; // Ligne incomplète
            
            const [nom, postNom, prenom, sexe, matricule, secure, grade, email, telephone] = colonnes;
            
            // Générer les données manquantes
            const nouveauPrenom = prenom.trim() === '' ? genererPrenom(sexe) : prenom;
            const nouvelEmail = email.trim() === '' ? genererEmail(nom, nouveauPrenom) : email;
            const nouveauTelephone = telephone.trim() === '' ? genererTelephone() : telephone;
            
            return `${nom},${postNom},${nouveauPrenom},${sexe},${matricule},${secure},${grade},${nouvelEmail},${nouveauTelephone}`;
        });
        
        // Écrire le nouveau fichier
        fs.writeFileSync(cheminSortie, lignesTraitees.join('\n'), 'utf8');
        
        console.log(`✅ Fichier traité avec succès !`);
        console.log(`📁 Fichier de sortie: ${cheminSortie}`);
        console.log(`📊 ${lignesTraitees.length - 1} agents traités`);
        
        // Afficher un aperçu des modifications
        console.log('\n📋 Aperçu des modifications:');
        lignesTraitees.slice(1, 6).forEach((ligne, index) => {
            const colonnes = ligne.split(',');
            console.log(`${index + 1}. ${colonnes[0]} ${colonnes[1]} ${colonnes[2]} - ${colonnes[7]} - ${colonnes[8]}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du traitement:', error.message);
    }
}

// Exécuter le script
traiterCSV();
