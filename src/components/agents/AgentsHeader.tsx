'use client';

import { useState, useEffect } from 'react';
import { GroupIcon, DocsIcon } from '@/icons';
import { AgentData } from '@/models/Agent';
import { GradeData } from '@/models/Grade';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices pour pdfMake
pdfMake.vfs = pdfFonts.vfs;

interface AgentWithGrade extends Omit<AgentData, 'grade'> {
  grade: GradeData;
}

interface AgentsHeaderProps {
  className?: string;
}

export default function AgentsHeader({ className = '' }: AgentsHeaderProps) {
  const [agents, setAgents] = useState<AgentWithGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch des agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const result = await response.json();
        
        if (result.success) {
          setAgents(result.data);
        } else {
          console.error('Erreur lors du fetch des agents:', result.error);
        }
      } catch (error) {
        console.error('Erreur lors du fetch des agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Génération du PDF avec cartes d'accès
  const generateAccessCardsPdf = () => {
    setGeneratingPdf(true);

    try {
      // Configuration de la page A4 avec marges
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const cardWidth = (pageWidth - margin * 2 - 30) / 3; // 3 cartes par ligne avec espacement
      const cardHeight = (pageHeight - margin * 2 - 45) / 4; // 4 lignes par page avec espacement
      
      const content: any[] = [];
      const cardsPerPage = 12; // 3x4
      const totalPages = Math.ceil(agents.length / cardsPerPage);

      for (let page = 0; page < totalPages; page++) {
        const pageAgents = agents.slice(page * cardsPerPage, (page + 1) * cardsPerPage);
        
        // Créer une table 4x4 pour cette page
        const rows: any[] = [];
        
        for (let row = 0; row < 4; row++) {
          const rowCells: any[] = [];
          
          for (let col = 0; col < 3; col++) {
            const agentIndex = row * 3 + col;
            const agent = pageAgents[agentIndex];
            
            if (agent) {
              // Créer la carte d'accès pour cet agent
              const card = {
                stack: [
                  // En-tête
                  {
                    text: 'CARTE D\'ACCÈS',
                    style: 'cardHeader',
                    alignment: 'center',
                    margin: [0, 0, 0, 2]
                  },
                  // QR Code (3/4 de la hauteur)
                  {
                    qr: `http://172.20.10.14:3000/signin/${agent._id}`,
                    fit: 100,
                    alignment: 'center',
                    margin: [0, 0, 0, 3]
                  },
                  // Informations (1/4 de la hauteur)
                  {
                    stack: [
                      {
                        text: `${agent.matricule} | ${agent.sexe}`,
                        style: 'agentMatricule',
                        alignment: 'center',
                        margin: [0, 0, 0, 1]
                      },
                      {
                        text: `${agent.nom} ${agent.post_nom}`,
                        style: 'agentName',
                        alignment: 'center',
                        margin: [0, 0, 0, 1]
                      },
                      {
                        text: `${agent.grade?.code || ''}`,
                        style: 'agentGrade',
                        alignment: 'center',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: `${agent.grade?.description || ''}`,
                        style: 'agentPrenom',
                        alignment: 'center',
                        margin: [0, 0, 0, 0]
                      }
                    ]
                  }
                ],
                margin: [3, 3, 3, 3]
              };
              
              rowCells.push({
                stack: [card],
                border: [true, true, true, true],
                borderColor: '#cccccc',
                fillColor: '#f9f9f9'
              });
            } else {
              // Cellule vide
              rowCells.push({
                text: '',
                border: [true, true, true, true],
                borderColor: '#cccccc'
              });
            }
          }
          
          rows.push(rowCells);
        }
        
        // Ajouter la table à la page
        content.push({
          table: {
            headerRows: 0,
            widths: [cardWidth, cardWidth, cardWidth],
            heights: [cardHeight, cardHeight, cardHeight, cardHeight],
            body: rows
          },
          layout: {
            defaultBorder: false,
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2
          },
          pageBreak: page < totalPages - 1 ? 'after' : undefined
        });
      }

      // Configuration du document PDF
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [margin, margin - 10, margin, margin - 10],
        content: content,
        styles: {
          cardHeader: {
            bold: true,
            color: '#2563eb'
          },
          agentMatricule: {
            bold: true,
            color: '#dc2626'
          },
          agentName: {
            bold: true,
            color: '#1f2937'
          },
          agentPrenom: {
            color: '#6b7280'
          },
          agentInfo: {
            color: '#374151'
          },
          agentGrade: {
            color: '#059669',
            bold: true
          },
          default: {
            fontSize: 13,
            color: '#374151'
          }
        }
      };

      // Générer et télécharger le PDF
      pdfMake.createPdf(docDefinition).download(`cartes-acces-agents-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo/Icône de la section */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <GroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {/* Titre et description */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des Agents
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les enseignants, le personnel administratif et les autorisations de votre établissement
              </p>
            </div>
          </div>
          
          {/* Badge statistique et bouton PDF */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '--' : agents.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Agents
              </div>
            </div>
            
            {/* Bouton génération PDF */}
            <button
              onClick={generateAccessCardsPdf}
              disabled={generatingPdf || loading || agents.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <DocsIcon className="w-4 h-4 mr-2" />
              {generatingPdf ? 'Génération...' : 'Cartes d\'Accès PDF'}
            </button>
          </div>
        </div>
        
        {/* Navigation rapide */}
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            <GroupIcon className="w-4 h-4 mr-1.5" />
            Enseignants
          </div>
          <div className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
            <GroupIcon className="w-4 h-4 mr-1.5" />
            Personnel Administratif
          </div>
          <div className="flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
            <GroupIcon className="w-4 h-4 mr-1.5" />
            Autorisations
          </div>
        </div>
      </div>
    </div>
  );
}
