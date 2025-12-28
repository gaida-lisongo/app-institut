'use client';
import { baseUrl } from "@/app/(admin)/page";
import { Annee, Etudiant, Promotion } from "@/app/(resultat)/layout";
import { Agent } from "@/store/useUserStore";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import Input from "../form/input/InputField";
import LoadingSpinner from "../ui/jury/LoadingSpinner";
import RechercheDetail from "./RechercheDetail";

export interface Recherche {
    _id: string;
    promotionId: Promotion;
    anneeId: Annee;
    amount: number;
    title: string;
    description: string;
    categorie: 'Sujet' | 'Stage';
    status: string;
    subscribers: {
        title: string;
        description: string;
        student: Etudiant;
        tuteur?: Agent;
        date_inscription: Date;
        planing?: {
            date_tache: Date;
            tache: string;
            observation?: string;
            statut: string;
        }[];
        report?: string;
        note?: number;
    }[];
    createdAt: Date;
    updatedAt: Date;

}

interface RechercheData {
    promotionId: string;
    anneeId: string;
    amount: number;
    title: string;
    description: string;
    categorie: 'Sujet' | 'Stage';
    status: string;
}

const RecherchesManager = ({categorie, promotion, onBack, annees} : {categorie: 'Stage' | 'Sujet', promotion: Promotion, onBack: () => void, annees: Annee[]}) => {
    const [stages, setStages] = useState<Recherche[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingStage, setEditingStage] = useState<Recherche | null>(null);
    const [selectedStage, setSelectedStage] = useState<Recherche | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [formData, setFormData] = useState<RechercheData>({
    promotionId: promotion._id,
    anneeId: '',
    amount: 0,
    title: '',
    description: '',
    categorie: categorie,
    status: 'Pending'
    });

    const resetForm = () => {
        setFormData({
            promotionId: promotion._id,
            anneeId: '',
            amount: 0,
            title: '',
            description: '',
            categorie: categorie,
            status: 'Pending'
        });
        setEditingStage(null);
    };

    const handleViewDetail = (stage: Recherche) => {
        setSelectedStage(stage);
        setShowDetail(true);
    };

    const handleBackFromDetail = () => {
        setSelectedStage(null);
        setShowDetail(false);
        // Recharger les données pour avoir les dernières informations
        fetchStages();
    };

    const fetchStages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/recherche/promotion/${promotion._id}`);
            const result = await response.json();
            if (result.success) {
                const filteredStages = result.data.filter((stage: Recherche) => stage.categorie === categorie);
                setStages(filteredStages);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des recherches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Submitting form data:', formData);
            const method = editingStage ? 'PUT' : 'POST';
            const url = editingStage 
                ? `${baseUrl}/recherche/id/${editingStage._id}`
                : `${baseUrl}/recherche`;
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            if (result.success) {
                await fetchStages();
                setShowCreateForm(false);
                resetForm();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleEdit = (stage: Recherche) => {
        setEditingStage(stage);
        setFormData({
            promotionId: stage.promotionId._id,
            anneeId: stage.anneeId._id,
            amount: stage.amount,
            title: stage.title,
            description: stage.description,
            categorie: stage.categorie,
            status: stage.status
        });
        setShowCreateForm(true);
    };

    const handleDelete = async (stageId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) {
            try {
                const response = await fetch(`${baseUrl}/recherche/${stageId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    await fetchStages();
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    useEffect(() => {
        fetchStages();
    }, [promotion._id]);
    // Afficher le détail si une recherche est sélectionnée
    if (showDetail && selectedStage) {
        console.log("Showing detail for stage:", selectedStage);
        return (
            <RechercheDetail 
                stageData={selectedStage} 
                onBack={handleBackFromDetail}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux promotions
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gestion des {categorie}s - {promotion.niveau}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gérez les {categorie}s pour la promotion {promotion.designation}
                </p>
                </div>
                <Button
                onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                >
                + Nouveau {categorie}
                </Button>
            </div>

            {/* Formulaire de création/édition */}
            {showCreateForm ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {editingStage ? 'Modifier le ' : 'Créer un nouveau '}{categorie}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Année Académique</Label>
                            <Select
                            options={annees.map(annee => ({
                                label: `${annee.debut} - ${annee.fin}`,
                                value: annee._id
                            }))}
                            defaultValue={formData.anneeId}
                            onChange={(value) => setFormData(prev => ({ ...prev, anneeId: value }))}
                            />
                        </div>
                        <div>
                            <Label>Titre</Label>
                            <Input
                            type="text"
                            name="title"
                            defaultValue={formData.title}
                            onChange={handleInputChange}
                            placeholder={`Titre du ${categorie.toLowerCase()}`}
                            />
                        </div>
                        <div>
                            <Label>Montant</Label>
                            <Input
                            type="number"
                            name="amount"
                            defaultValue={formData.amount}
                            onChange={handleInputChange}
                            placeholder="Montant en FC"
                            />
                        </div>
                        <div>
                            <Label>Statut</Label>
                            <Select
                            options={[
                                { label: 'En Attente', value: 'Pending' },
                                { label: 'Terminé', value: 'Completed' },
                                { label: 'Échoué', value: 'Failed' }
                            ]}
                            defaultValue={formData.status}
                            onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                            />
                        </div>
                        </div>
                        <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={`Description du ${categorie.toLowerCase()}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            required
                        />
                        </div>
                        <div className="flex space-x-3">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            {editingStage ? 'Mettre à jour' : 'Créer'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                            setShowCreateForm(false);
                            resetForm();
                            }}
                        >
                            Annuler
                        </Button>
                        </div>
                    </form>
                </div>
            ) 
            : <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {categorie}s Existants ({stages.length})
                </h3>
                </div>
                <div className="p-6">
                {loading ? (
                    <LoadingSpinner />
                ) : stages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                    Aucun {categorie.toLowerCase()} trouvé pour cette promotion.
                    </p>
                ) : (
                    <div className="space-y-4">
                    {stages.map((stage) => (
                        <div
                        key={stage._id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {stage.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    stage.categorie === 'Stage' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                    {stage.categorie}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {stage.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600 font-medium">
                                {stage.amount.toLocaleString()} FC
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                stage.status === 'Completed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : stage.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                {stage.status === 'Pending' ? 'En Attente' : 
                                stage.status === 'Completed' ? 'Terminé' : 'Échoué'}
                                </span>
                                <span className="text-gray-500">
                                {stage.subscribers?.length || 0} inscrits
                                </span>
                            </div>
                            </div>
                            <div className="flex space-x-2">
                            <button
                                onClick={() => handleViewDetail(stage)}
                                className="text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-600 hover:bg-green-50"
                            >
                                Voir détail
                            </button>
                            <button
                                onClick={() => handleEdit(stage)}
                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => handleDelete(stage._id)}
                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                            >
                                Supprimer
                            </button>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>}


        </div>
    );
};

export default RecherchesManager;