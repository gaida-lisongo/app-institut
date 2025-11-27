'use client';

interface AvatarProps {
    photo?: string | null;
    nom?: string;
    prenom?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar = ({ photo, nom, prenom, size = 'md', className = '' }: AvatarProps) => {
    // Définir les tailles
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-32 h-32 text-4xl'
    };

    // Générer les initiales
    const getInitials = () => {
        const firstInitial = nom?.charAt(0)?.toUpperCase() || '';
        const lastInitial = prenom?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial;
    };

    return (
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden ${className}`}>
            {photo ? (
                <img 
                    src={photo} 
                    alt={`Photo de ${nom} ${prenom}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-white font-bold">
                    {getInitials()}
                </span>
            )}
        </div>
    );
};

export default Avatar;
