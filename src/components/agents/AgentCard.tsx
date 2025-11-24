"use client";
import { AgentData } from "@/models/Agent";

interface AgentCardProps {
    agent: AgentData;
    index: number;
    onEdit: (agent: AgentData) => void;
    onDelete: (id: string) => void;
}

export const AgentCard = ({ agent, index, onEdit, onDelete }: AgentCardProps) => {
    return (
        <div 
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {agent.nom} {agent.post_nom}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            agent.sexe === 'M' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-pink-100 text-pink-800'
                        }`}>
                            {agent.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm font-medium">{agent.prenom}</p>
                    
                    <div className="mt-3 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0h4" />
                            </svg>
                            <span className="font-medium">Matricule:</span>
                            <span className="ml-1">{agent.matricule}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Sécure:</span>
                            <span className="ml-1">{agent.secure}</span>
                        </div>
                        
                        {agent.email && (
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                <span className="font-medium">Email:</span>
                                <span className="ml-1 truncate">{agent.email}</span>
                            </div>
                        )}
                        
                        {agent.telephone && (
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="font-medium">Tél:</span>
                                <span className="ml-1">{agent.telephone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => onEdit(agent)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                </button>
                <button
                    onClick={() => agent._id && onDelete(agent._id)}
                    disabled={!agent._id}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                </button>
            </div>
        </div>
    );
};

export default AgentCard;
