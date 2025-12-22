'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';

interface DescripteurProps {
    charge: any;
    onUpdate?: () => void;
}

const Descripteur = ({ charge, onUpdate }: DescripteurProps) => {
    const { updateCharge } = useUserStore();
    const [showMenu, setShowMenu] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState({ title: '', body: '' });
    const [loading, setLoading] = useState(false);

    // Configuration des sections
    const sections = [
        { key: 'objectif', label: 'Objectif', icon: '🎯' },
        { key: 'methodologie', label: 'Méthodologie', icon: '📚' },
        { key: 'evaluation', label: 'Evaluation', icon: '📝' },
        { key: 'contenu', label: 'Contenu', icon: '📖' },
        { key: 'references', label: 'Références', icon: '🔗' }
    ];

    const handleOpenEditor = (key: string) => {
        const content = charge[key] || '';
        // Essayer de parser le contenu existant (format simple: Titre\nCorps)
        const lines = content.split('\n');
        const title = lines[0] || '';
        const body = lines.slice(1).join('\n').replace(/^\t/gm, ''); // Enlever l'indentation pour l'édition

        setEditorContent({ title, body });
        setActiveModal(key);
    };

    const handleSave = async () => {
        if (!activeModal) return;

        setLoading(true);
        try {
            // Formater le contenu comme demandé: Titre\n\tLigne1\n\tLigne2...
            const formattedBody = editorContent.body
                .split('\n')
                .map(line => `\t${line}`)
                .join('\n');
            
            const finalContent = `${editorContent.title}\n${formattedBody}`;

            const success = await updateCharge(charge._id, {
                [activeModal]: finalContent
            });

            if (success) {
                if (onUpdate) onUpdate(); // Optionnel : rafraîchir si nécessaire
                setActiveModal(null);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Approuvé';
            case 'rejected': return 'Rejeté';
            default: return 'En attente';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Compact */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 truncate" title={charge.cours?.designation}>
                        {charge.cours?.designation || 'Cours sans nom'}
                    </h2>
                    <div className="flex items-center mt-0.5 space-x-2">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
                            {charge.cours?.credits || 0} C
                        </span>
                        <span className="text-xs text-gray-500 truncate">• {charge.cours?.code || 'N/A'}</span>
                    </div>
                </div>
                
                <div className="relative ml-2">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                                <button 
                                    onClick={() => { setActiveModal('cotation'); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <span className="mr-2">📊</span> Cotation
                                </button>
                                <button 
                                    onClick={() => { setActiveModal('recours'); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <span className="mr-2">⚖️</span> Recours
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Body Compact */}
            <div className="p-3 space-y-2">
                {sections.map((section) => (
                    <button
                        key={section.key}
                        onClick={() => handleOpenEditor(section.key)}
                        className="flex items-center w-full p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                    >
                        <span className="text-lg mr-3 flex-shrink-0">{section.icon}</span>
                        <div className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                {section.label}
                            </span>
                            <p className="text-xs text-gray-500 truncate">
                                {charge[section.key] ? charge[section.key].split('\n')[1]?.trim() || 'Défini' : 'Non défini'}
                            </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ))}
            </div>

            {/* Footer Compact */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs text-gray-500">Statut :</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(charge.status)}`}>
                    {getStatusLabel(charge.status)}
                </span>
            </div>

            {/* Modals */}
            {/* Modal Editeur */}
            {activeModal && !['cotation', 'recours'].includes(activeModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                Éditer : {sections.find(s => s.key === activeModal)?.label}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={editorContent.title}
                                    onChange={(e) => setEditorContent({...editorContent, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Titre de la section..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                                <textarea
                                    value={editorContent.body}
                                    onChange={(e) => setEditorContent({...editorContent, body: e.target.value})}
                                    rows={10}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    placeholder="Saisissez le contenu ici..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Le contenu sera automatiquement indenté à l'enregistrement.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Enregistrement...
                                    </>
                                ) : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cotation / Recours (Placeholders) */}
            {['cotation', 'recours'].includes(activeModal || '') && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {activeModal === 'cotation' ? 'Fiche de Cotation Session' : 'Gestion des Recours'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <span className="text-6xl mb-4 block">🚧</span>
                                <h4 className="text-xl font-medium text-gray-900">Module en construction</h4>
                                <p className="text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Descripteur;