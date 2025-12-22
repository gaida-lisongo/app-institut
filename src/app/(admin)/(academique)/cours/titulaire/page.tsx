'use client';

import { useState, useEffect } from "react";
import { Promotion } from "@/app/(resultat)/layout";
import { useAcademique } from "../../layout";
import { Agent } from "@/types/jury";

// Interface locale pour Matiere (compatible avec les données reçues)
interface Matiere {
  _id: string;
  designation: string;
  code?: string;
  credits: number;
  coefficient?: number;
}

// Interface locale pour Unite (compatible avec les données reçues)
interface Unite {
  _id: string;
  designation: string;
  code: string;
  credits: number;
  matieres?: Matiere[];
}

// Interface pour l'affectation
interface AffectationEnseignant {
  matiereId: string;
  enseignantId: string;
  annee: string;
}

// Interface pour les années académiques
interface Annee {
  _id: string;
  debut: number;
  fin: number;
  isActive: boolean;
}

// Interface pour une charge horaire existante
interface ChargeHoraire {
  _id: string;
  cours: string;
  enseignant: {
    _id: string;
    nom: string;
    prenom: string;
  };
  anneeId: string;
  status: string;
}

const ChargesHoraire = () => {
  const { selectedFiliere } = useAcademique();
  
  // États pour la gestion de l'interface
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedUnite, setSelectedUnite] = useState<Unite | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [enseignants, setEnseignants] = useState<Agent[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState("");
  const [anneeAffectation, setAnneeAffectation] = useState("");
  
  // Nouveaux états pour la gestion des années et charges
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [selectedAnneeId, setSelectedAnneeId] = useState("");
  const [chargeActuelle, setChargeActuelle] = useState<ChargeHoraire | null>(null);
  const [searchEnseignant, setSearchEnseignant] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCharge, setLoadingCharge] = useState(false);

  // État pour le rendu conditionnel
  const [currentView, setCurrentView] = useState<'liste' | 'detail'>('liste');

  // Récupérer les enseignants et années au chargement
  useEffect(() => {
    fetchEnseignants();
    fetchAnnees();
  }, []);

  // Choix par defaut de la première promotion
  useEffect(() => {
    if (selectedFiliere && selectedFiliere.promotions.length > 0) {
      setSelectedPromotion(selectedFiliere.promotions[0]);
    }
  }, [selectedFiliere]);

  // Récupérer la charge horaire quand une année est sélectionnée
  useEffect(() => {
    if (selectedMatiere && selectedAnneeId && showModal) {
      fetchChargeHoraire(selectedMatiere._id, selectedAnneeId);
    }
  }, [selectedMatiere, selectedAnneeId, showModal]);

  const fetchEnseignants = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setEnseignants(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    }
  };

  const fetchAnnees = async () => {
    try {
      const response = await fetch('/api/annees');
      if (response.ok) {
        const data = await response.json();
        setAnnees(data.data || []);
        // Sélectionner l'année active par défaut
        const activeYear = data.data.find((annee: Annee) => annee.isActive);
        if (activeYear) {
          setSelectedAnneeId(activeYear._id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error);
    }
  };

  const fetchChargeHoraire = async (coursId: string, anneeId: string) => {
    setLoadingCharge(true);
    try {
      const response = await fetch(`/api/charges?coursId=${coursId}&anneeId=${anneeId}`);
      if (response.ok) {
        const data = await response.json();
        setChargeActuelle(data.data);
      } else {
        setChargeActuelle(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la charge:', error);
      setChargeActuelle(null);
    } finally {
      setLoadingCharge(false);
    }
  };

  // Filtrer les unités par recherche
  const filteredUnites = selectedPromotion ? 
    selectedPromotion.semestres.flatMap(semestre => 
      (semestre.unites || []).filter(unite => 
        unite.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) : [];

  // Filtrer les enseignants par recherche
  const filteredEnseignants = enseignants.filter(enseignant =>
    `${enseignant.nom} ${enseignant.prenom}`.toLowerCase().includes(searchEnseignant.toLowerCase())
  );

  // Gestionnaire pour affecter un enseignant
  const handleAffectation = async () => {
    if (!selectedMatiere || !selectedEnseignant || !selectedAnneeId || !selectedPromotion) {
      alert("Veuillez remplir tous les champs et sélectionner une promotion");
      return;
    }

    setIsLoading(true);
    try {
      const chargeData = {
        cours: selectedMatiere._id,
        enseignant: selectedEnseignant,
        anneeId: selectedAnneeId,
        promotionId: selectedPromotion._id,
        status: 'pending' // Créé en mode pending par défaut
      };

      const response = await fetch('/api/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chargeData),
      });

      if (response.ok) {
        alert("Charge horaire créée avec succès en mode pending !");
        setShowModal(false);
        resetModalStates();
        // Recharger la charge actuelle
        if (selectedAnneeId) {
          fetchChargeHoraire(selectedMatiere._id, selectedAnneeId);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la création de la charge");
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      alert("Erreur lors de l'affectation");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour changer le statut
  const handleChangeStatus = async (newStatus: string) => {
    if (!chargeActuelle) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/charges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: chargeActuelle._id,
          status: newStatus
        }),
      });

      if (response.ok) {
        alert(`Statut changé vers "${newStatus}" avec succès !`);
        // Recharger la charge
        if (selectedMatiere && selectedAnneeId) {
          fetchChargeHoraire(selectedMatiere._id, selectedAnneeId);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors du changement de statut");
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert("Erreur lors du changement de statut");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour supprimer une charge
  const handleDeleteCharge = async () => {
    if (!chargeActuelle) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette charge horaire ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/charges?id=${chargeActuelle._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Charge horaire supprimée avec succès !");
        setChargeActuelle(null);
        // Recharger la charge
        if (selectedMatiere && selectedAnneeId) {
          fetchChargeHoraire(selectedMatiere._id, selectedAnneeId);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour modifier l'enseignant
  const handleChangeEnseignant = async (nouvelEnseignantId: string) => {
    if (!chargeActuelle || !nouvelEnseignantId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/charges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: chargeActuelle._id,
          enseignant: nouvelEnseignantId
        }),
      });

      if (response.ok) {
        alert("Enseignant modifié avec succès !");
        setSelectedEnseignant("");
        // Recharger la charge
        if (selectedMatiere && selectedAnneeId) {
          fetchChargeHoraire(selectedMatiere._id, selectedAnneeId);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModalStates = () => {
    setSelectedMatiere(null);
    setSelectedEnseignant("");
    setSearchEnseignant("");
    setChargeActuelle(null);
  };

  // Composant ListeUnites
  const ListeUnites = () => (
    <div className="space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Charges Horaires - {selectedPromotion?.designation}
            </h1>
            <p className="text-gray-600">
              {selectedPromotion?.systeme} • {selectedPromotion?.niveau} • {selectedPromotion?.cycle}
            </p>
          </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une unité..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grille de cartes d'unités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnites.map((unite) => {
          // Trouver le semestre de l'unité
          const semestre = selectedPromotion?.semestres.find(s => 
            s.unites?.some(u => u._id === unite._id)
          );

          return (
            <div 
              key={unite._id} 
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedUnite(unite);
                setCurrentView('detail');
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {unite.designation}
                </h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {unite.credits} crédits
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Code:</span> {unite.code}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Semestre:</span> {semestre?.designation || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Matières:</span> {unite.matieres?.length || 0}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cliquer pour voir détails</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUnites.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "Aucune unité trouvée pour cette recherche" : "Aucune unité disponible"}
        </div>
      )}
    </div>
  );

  // Composant DetailUnite
  const DetailUnite = () => {
    if (!selectedUnite) return null;

    const semestre = selectedPromotion?.semestres.find(s => 
      s.unites?.some(u => u._id === selectedUnite._id)
    );

    return (
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <button
              onClick={() => {
                setSelectedUnite(null);
                setCurrentView('liste');
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Retour à la liste
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{selectedUnite.designation}</h2>
            <p className="text-gray-600">
              {semestre?.designation} • {selectedUnite.credits} crédits • Code: {selectedUnite.code}
            </p>
          </div>
        </div>

        {/* Liste des matières */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Matières associées</h3>
          {selectedUnite.matieres && selectedUnite.matieres.length > 0 ? (
            <div className="space-y-3">
              {selectedUnite.matieres.map((matiere) => (
                <div 
                  key={matiere._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedMatiere(matiere);
                    setShowModal(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{matiere.designation}</h4>
                      <p className="text-sm text-gray-600">Code: {matiere.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{matiere.credits} crédits</p>
                      <p className="text-sm text-gray-600">Coeff. {matiere.coefficient}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Cliquer pour affecter un enseignant
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune matière associée à cette unité
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal d'affectation améliorée
  const ModalAffectation = () => {
    if (!showModal || !selectedMatiere) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gestion de la charge horaire</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedMatiere.designation} ({selectedMatiere.code})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetModalStates();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Sélection de l'année */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Année académique
                </span>
              </label>
              <select
                value={selectedAnneeId}
                onChange={(e) => setSelectedAnneeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Sélectionner une année</option>
                {annees.map((annee) => (
                  <option key={annee._id} value={annee._id}>
                    {annee.debut}-{annee.fin} {annee.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Affichage de l'enseignant actuel */}
            {selectedAnneeId && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Charge horaire actuelle
                </h4>
                
                {loadingCharge ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Vérification...</span>
                  </div>
                ) : chargeActuelle ? (
                  <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
                    {/* Informations de l'enseignant */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {chargeActuelle.enseignant.nom.charAt(0)}{chargeActuelle.enseignant.prenom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            {chargeActuelle.enseignant.nom} {chargeActuelle.enseignant.prenom}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              chargeActuelle.status === 'approved' ? 'bg-green-100 text-green-800' :
                              chargeActuelle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {chargeActuelle.status === 'approved' ? 'Approuvé' :
                               chargeActuelle.status === 'pending' ? 'En attente' : 'Rejeté'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Options de gestion */}
                    <div className="space-y-3">
                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Actions disponibles :</p>
                        
                        {/* Gestion du statut */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <label className="text-xs text-gray-600 block w-full">Changer le statut :</label>
                          <button
                            onClick={() => handleChangeStatus('approved')}
                            disabled={chargeActuelle.status === 'approved' || isLoading}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleChangeStatus('pending')}
                            disabled={chargeActuelle.status === 'pending' || isLoading}
                            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            En attente
                          </button>
                          <button
                            onClick={() => handleChangeStatus('rejected')}
                            disabled={chargeActuelle.status === 'rejected' || isLoading}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Rejeter
                          </button>
                        </div>

                        {/* Modifier l'enseignant */}
                        <div className="mb-3">
                          <label className="text-xs text-gray-600 block mb-1">Modifier l'enseignant :</label>
                          <div className="flex space-x-2">
                            <select
                              value={selectedEnseignant}
                              onChange={(e) => setSelectedEnseignant(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              disabled={isLoading}
                            >
                              <option value="">Choisir nouvel enseignant</option>
                              {enseignants
                                .filter(ens => ens._id !== chargeActuelle.enseignant._id)
                                .map((enseignant) => (
                                <option key={enseignant._id} value={enseignant._id}>
                                  {enseignant.nom} {enseignant.prenom}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleChangeEnseignant(selectedEnseignant)}
                              disabled={!selectedEnseignant || isLoading}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>

                        {/* Supprimer la charge */}
                        <button
                          onClick={handleDeleteCharge}
                          disabled={isLoading}
                          className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Supprimer la charge horaire
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <p className="text-orange-800 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Aucun enseignant assigné à ce cours pour cette année
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sélection d'un nouvel enseignant */}
            {selectedAnneeId && !chargeActuelle && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assigner un nouvel enseignant
                </h4>

                {/* Barre de recherche */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    value={searchEnseignant}
                    onChange={(e) => setSearchEnseignant(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Liste des enseignants */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredEnseignants.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredEnseignants.map((enseignant) => (
                        <label
                          key={enseignant._id}
                          className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedEnseignant === enseignant._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="enseignant"
                            value={enseignant._id}
                            checked={selectedEnseignant === enseignant._id}
                            onChange={(e) => setSelectedEnseignant(e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {enseignant.nom.charAt(0)}{enseignant.prenom.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {enseignant.nom} {enseignant.prenom}
                                </p>
                                <p className="text-sm text-gray-500">{enseignant.email}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {searchEnseignant ? 'Aucun enseignant trouvé' : 'Aucun enseignant disponible'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetModalStates();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              {selectedAnneeId && !chargeActuelle && selectedEnseignant && (
                <button
                  onClick={handleAffectation}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Créer la charge
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedFiliere || selectedFiliere.promotions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune promotion disponible pour cette filière.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabulation des promotions */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          {selectedFiliere.promotions.map((promotion) => (
            <button
              key={promotion._id}
              onClick={() => {
                setSelectedPromotion(promotion);
                setSelectedUnite(null);
                setCurrentView('liste');
                setSearchTerm("");
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedPromotion?._id === promotion._id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {promotion.designation}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      {selectedPromotion && (
        <div>
          {/* Rendu conditionnel */}
          {currentView === 'liste' ? <ListeUnites /> : <DetailUnite />}
        </div>
      )}

      {!selectedPromotion && (
        <div className="text-center py-8 text-gray-500">
          Sélectionnez une promotion pour voir ses unités
        </div>
      )}

      {/* Modal d'affectation */}
      <ModalAffectation />
    </div>
  );
};

export default ChargesHoraire;