import Link from 'next/link';
import { redirect } from 'next/navigation';
import ActivityTransactionWrapper from './ActivityTransactionWrapper';
import ActivityActions from './ActivityActions';

const ActivityDetailsPage = async ({ params }: { params: { slug: string } }) => {
    const { slug } = await params;

    // Server Actions pour les actions côté serveur
    async function navigateToQuestionnaire(formData: FormData) {
        'use server';
        const activityId = formData.get('activityId') as string;
        const activityType = formData.get('activityType') as string;
        redirect(`/activity/${activityId}/questionnaire`);
    }

    async function createQuestionnaireAction(formData: FormData) {
        'use server';
        const activityId = formData.get('activityId') as string;
        // Logique de création de questionnaire côté serveur
        // Puis redirection
        redirect(`/activity/${activityId}/questionnaire/create`);
    }

    const fetchActivity = async (slug: string) => {
        try {
            const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
            
            const req = await fetch(`${baseUrl}/api/activities?id=${slug}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!req.ok) {
                throw new Error('Failed to fetch activity');
            }

            const resp = await req.json();

            if(!resp.success) {
                throw new Error(resp.error || 'Failed to fetch activity');
            }
            const data = resp.data;

            return data;
        } catch (error) {
            console.error('Error fetching activity:', error);
            return null;
        }
    };

    const activityData = await fetchActivity(slug);

    console.log('Fetched activity data:', activityData);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {activityData ? (
                <div className="space-y-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">{activityData.title}</h1>
                        <p className="text-gray-600 mt-2">{activityData.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700">Type</h3>
                            <p className="text-gray-900">{activityData.type}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700">Score Maximum</h3>
                            <p className="text-gray-900">{activityData.maximumScore} points</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-4">Questionnaire du {activityData.type.toString().toUpperCase()}</h3>
                        
                        <div className="space-y-3">
                            {/* Solution 1: Link simple (navigation) */}
                            <Link 
                                href={`/activity/${activityData._id}/${activityData.type}`}
                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Voir Questionnaire
                            </Link>

                        </div>
                    </div>

                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Activité non trouvée</h3>
                    <p className="text-gray-600">L'activité demandée n'existe pas ou a été supprimée.</p>
                </div>
            )}

            {/* Composant de gestion des transactions */}
            {activityData && <ActivityTransactionWrapper activityData={activityData} />}
        </div>
    );
}

export default ActivityDetailsPage;