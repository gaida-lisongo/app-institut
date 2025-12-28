'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Promotion, Annee } from '@/app/(admin)/(appariteur)/inscriptions/[cycle]/page';
import { Enrollement, EnrolementData } from '@/app/(admin)/(academique)/enrollements/page';
import { baseUrl } from '@/app/(admin)/page';
import LoadingSpinner from '@/components/ui/jury/LoadingSpinner';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { Matiere } from '@/types/cours';

interface EnrollementManagerProps {
  promotion: Promotion;
  onBack: () => void;
  onCreateEnrolement: (data: EnrolementData) => Promise<void>;
  onUpdateEnrolement: (id: string, data: Partial<EnrolementData>) => Promise<void>;
  onDeleteEnrolement: (id: string) => Promise<void>;
  onReadEnrolements: (promotionId: string) => Promise<Enrollement[]>;
  onClick?: (enrollement: Enrollement) => void;
}

const EnrollementManager: React.FC<EnrollementManagerProps> = ({
  promotion,
  onBack,
  onCreateEnrolement,
  onUpdateEnrolement,
  onDeleteEnrolement,
  onReadEnrolements,
  onClick
}) => {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [enrolements, setEnrolements] = useState<Enrollement[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEnrolement, setEditingEnrolement] = useState<Enrollement | null>(null);
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
  const [planningMatieres, setPlanningMatieres] = useState<string[]>([]);
  const [matieresWithDates, setMatieresWithDates] = useState<{[key: string]: string}>({});

  // Extraire les matières de la promotion
  const getMatieres = (): Matiere[] => {
    const matieres: Matiere[] = [];
    promotion.semestres?.forEach(semestre => {
      semestre.unites?.forEach(unite => {
        unite.matieres?.forEach(matiere => {
          matieres.push(matiere);
        });
      });
    });
    return matieres;
  };

  const matieres = getMatieres();
  
  const [formData, setFormData] = useState<EnrolementData>({
    promotionId: promotion._id,
    anneeId: '',
    amount: 0,
    title: '',
    description: '',
    matieres: [],
    status: 'Pending',
    planing: {
      date_examen: new Date(),
      matieres: []
    }
  });

  // Fetch années académiques
  const fetchAnnees = async () => {
    try {
      const request = await fetch('/api/annees');
      const response = await request.json();
      
      if (response.success && response.data) {
        setAnnees(response.data as Annee[]);
        if (response.data.length > 0) {
          setSelectedAnnee(response.data[0]);
          setFormData(prev => ({ ...prev, anneeId: response.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error);
    }
  };

  // Fetch enrolements pour la promotion courante
  const fetchEnrolements = async () => {
    setLoading(true);
    try {
      const enrolementsData = await onReadEnrolements(promotion._id);
      setEnrolements(enrolementsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des enrôlements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnees();
    fetchEnrolements();
  }, [promotion._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Construire le planning avec les matières et leurs dates
      const planningData = planningMatieres.map(matiereId => ({
        matiereId,
        date_epreuve: matieresWithDates[matiereId] || new Date().toISOString().split('T')[0]
      }));

      const dataToSubmit = {
        ...formData,
        matieres: selectedMatieres,
        planing: {
          date_examen: new Date(), // Date générale (peut être la première date des épreuves)
          matieres: planningMatieres,
          epreuves: planningData // Détails des épreuves par matière avec dates
        }
      };

      if (editingEnrolement) {
        await onUpdateEnrolement(editingEnrolement._id, dataToSubmit);
        setEditingEnrolement(null);
      } else {
        await onCreateEnrolement(dataToSubmit);
      }
      await fetchEnrolements();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  const handleEdit = (enrolement: Enrollement) => {
    setFormData({
      promotionId: enrolement.promotionId._id,
      anneeId: enrolement.anneeId._id,
      amount: enrolement.amount,
      title: enrolement.title,
      description: enrolement.description,
      matieres: enrolement.matieres.map(m => m._id),
      status: enrolement.status,
      planing: {
        date_examen: new Date(enrolement.planing.date_examen),
        matieres: enrolement.planing.matieres.map(m => m._id)
      }
    });
    setSelectedMatieres(enrolement.matieres.map(m => m._id));
    setPlanningMatieres(enrolement.planing.matieres.map(m => m._id));
    
    // Restaurer les dates des épreuves si elles existent
    const datesMap: {[key: string]: string} = {};
    if (enrolement.planing.epreuves) {
      enrolement.planing.epreuves.forEach((epreuve: any) => {
        datesMap[epreuve.matiereId] = epreuve.date_epreuve;
      });
    }
    setMatieresWithDates(datesMap);
    
    setEditingEnrolement(enrolement);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enrôlement ?')) {
      try {
        await onDeleteEnrolement(id);
        await fetchEnrolements();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      promotionId: promotion._id,
      anneeId: selectedAnnee?._id || '',
      amount: 0,
      title: '',
      description: '',
      matieres: [],
      status: 'Pending',
      planing: {
        date_examen: new Date(),
        matieres: []
      }
    });
    setSelectedMatieres([]);
    setPlanningMatieres([]);
    setMatieresWithDates({});
    setEditingEnrolement(null);
  };

  const handleMatiereToggle = (matiereId: string) => {
    setSelectedMatieres(prev => 
      prev.includes(matiereId) 
        ? prev.filter(id => id !== matiereId)
        : [...prev, matiereId]
    );
  };

  const handlePlanningMatiereToggle = (matiereId: string) => {
    setPlanningMatieres(prev => 
      prev.includes(matiereId) 
        ? prev.filter(id => id !== matiereId)
        : [...prev, matiereId]
    );
  };

  const handleDateChange = (matiereId: string, date: string) => {
    setMatieresWithDates(prev => ({
      ...prev,
      [matiereId]: date
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Gestion des Enrôlements - {promotion.designation}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les enrôlements pour la promotion {promotion.designation}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nouvel Enrôlement
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingEnrolement ? 'Modifier l\'enrôlement' : 'Créer un nouvel enrôlement'}
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
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titre de l'enrôlement"
                  required
                />
              </div>
              <div>
                <Label>Montant</Label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Montant en FC"
                  required
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
                placeholder="Description de l'enrôlement"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                required
              />
            </div>
            
            {/* Section Matières */}
            <div className="space-y-4">
              <div>
                <Label>Matières de l'Enrôlement</Label>
                <div className="mt-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                  {matieres.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune matière disponible pour cette promotion.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matieres.map((matiere) => (
                        <label key={matiere._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMatieres.includes(matiere._id)}
                            onChange={() => handleMatiereToggle(matiere._id)}
                            className="rounded border-gray-300 text-blue-600 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {matiere.designation}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez les matières incluses dans cet enrôlement
                </p>
              </div>

              {/* Section Planning */}
              <div>
                <Label>Planning des Épreuves par Matière</Label>
                <div className="mt-2 space-y-3">
                  {selectedMatieres.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      Sélectionnez d'abord les matières de l'enrôlement pour planifier les épreuves.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                      {matieres
                        .filter(matiere => selectedMatieres.includes(matiere._id))
                        .map((matiere) => (
                          <div key={matiere._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={planningMatieres.includes(matiere._id)}
                                onChange={() => handlePlanningMatiereToggle(matiere._id)}
                                className="rounded border-gray-300 text-green-600 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {matiere.designation}
                              </span>
                            </div>
                            {planningMatieres.includes(matiere._id) && (
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-600 dark:text-gray-400">
                                  Date d'épreuve :
                                </label>
                                <input
                                  type="date"
                                  value={matieresWithDates[matiere._id] || ''}
                                  onChange={(e) => handleDateChange(matiere._id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez les matières pour l'examen et fixez la date d'épreuve pour chaque matière
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingEnrolement ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button
                type="button"
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
      )}

      {/* Liste des enrôlements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Enrôlements Existants ({enrolements.length})
          </h3>
        </div>
        <div className="p-6">
          {enrolements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun enrôlement trouvé pour cette promotion.
            </p>
          ) : (
            <div className="space-y-4">
              {enrolements.map((enrolement) => (
                <div
                  key={enrolement._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {enrolement.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {enrolement.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          {enrolement.amount.toLocaleString()} FC
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          enrolement.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : enrolement.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {enrolement.status === 'Pending' ? 'En Attente' : 
                           enrolement.status === 'Completed' ? 'Terminé' : 'Échoué'}
                        </span>
                        <span className="text-gray-500">
                          {enrolement.subscribers?.length || 0} inscrits
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onClick && onClick(enrolement)}
                        className="text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-600 hover:bg-green-50 inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir détails
                      </Button>
                      <button
                        onClick={() => handleEdit(enrolement)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(enrolement._id)}
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
      </div>
    </div>
  );
};

export default EnrollementManager;