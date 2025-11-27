// Test du formatage des numéros de téléphone
function formatPhone(phone) {
    // Récupérer les 9 derniers chiffres
    let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    console.log("Phone of user : ", cleanPhone);
    cleanPhone = cleanPhone.slice(-9);
    console.log("Phone of user formatted : ", cleanPhone);
    
    // Vérifier qu'on a bien 9 chiffres
    if (cleanPhone.length !== 9) {
        console.error("Erreur: Le numéro doit contenir exactement 9 chiffres après formatage");
        return phone; // Retourner le numéro original en cas d'erreur
    }
    
    return '243' + cleanPhone;
}

// Tests
const testNumbers = [
    '+243853102426',
    '0853102426',
    '243853102426',
    '853102426',
    '+243 853 102 426',
    '0 853 102 426'
];

console.log('=== Test de formatage des numéros ===');
testNumbers.forEach(num => {
    const formatted = formatPhone(num);
    const isValid = /^243[0-9]{9}$/.test(formatted);
    console.log(`${num} -> ${formatted} (${isValid ? '✅ Valide' : '❌ Invalide'})`);
});
