'use client';

import { ArrowLeftIcon } from "@/icons";
import ManageJury from "./ManageJury";

interface ManageJuryWrapperProps {
    filiere: any;
    onBack: () => void;
}

const ManageJuryWrapper = ({ filiere, onBack }: ManageJuryWrapperProps) => {
    return (
        <div className="space-y-6">
            {/* Bouton retour client-side */}
            <div className="flex items-start">
                <button 
                    onClick={onBack}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Retour aux promotions</span>
                </button>
            </div>
            
            {/* Composant ManageJury client */}
            <ManageJury filiere={filiere} onBack={onBack} />
        </div>
    );
};

export default ManageJuryWrapper;
