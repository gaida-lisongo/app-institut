'use client'

import { Etudiant } from "@/types/etudiant";

interface SoldeRechargeProps {
    etudiant: Etudiant;
}

const SoldeRecharge = ({
    etudiant
}: SoldeRechargeProps) => {
    return (
        <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600 dark:text-blue-400">
                    {etudiant.nom.charAt(0)}{etudiant.post_nom.charAt(0)}
                </span>
            </div>
            <span>{etudiant?.solde}</span>
        </div>
        
        <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                etudiant.sexe === 'M' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
            }`}>
                {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
            </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
                <span className="font-medium">Matricule:</span> {etudiant.matricule}
            </div>
            <div>
                <span className="font-medium">Code sécurisé:</span> {etudiant.secure}
            </div>
            <div>
                <span className="font-medium">Inscrit le:</span> {new Date(etudiant.createdAt).toLocaleDateString()}
            </div>
            </div>
        </div>
        </div>
    );
};

export default SoldeRecharge;
