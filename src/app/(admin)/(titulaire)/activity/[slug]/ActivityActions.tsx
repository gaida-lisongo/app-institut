'use client';

interface ActivityActionsProps {
    activityId: string;
    activityType: string;
}

const ActivityActions = ({ activityId, activityType }: ActivityActionsProps) => {
    const handleQuestionnaireAction = async (action: 'view' | 'create' | 'assign') => {
        try {
            switch (action) {
                case 'view':
                    window.location.href = `/activity/${activityId}/questionnaire`;
                    break;
                case 'create':
                    // Logique de création avant navigation
                    const response = await fetch('/api/questionnaires', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ activityId, activityType })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        window.location.href = `/activity/${activityId}/questionnaire/${result.data._id}`;
                    }
                    break;
                case 'assign':
                    // Logique d'affectation dynamique
                    window.location.href = `/activity/${activityId}/questionnaire/assign`;
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        }
    };

    return (
        <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-4">Actions avancées (Client Component)</h3>
            <div className="space-y-3">
                <button 
                    onClick={() => handleQuestionnaireAction('view')}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Voir Questionnaire
                </button>

                <button 
                    onClick={() => handleQuestionnaireAction('create')}
                    className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mr-2"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer & Affecter
                </button>

                <button 
                    onClick={() => handleQuestionnaireAction('assign')}
                    className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Affecter Existant
                </button>
            </div>
        </div>
    );
};

export default ActivityActions;