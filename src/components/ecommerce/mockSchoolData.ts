// Mock data pour l'administration de l'établissement scolaire

export interface AcademicYear {
  _id: string;
  totalRevenue: number;
  designation: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MonthlyRevenue {
  yearId: string;
  month: string;
  totalRevenue: number;
  inscriptions: number;
  fraisScolarite: number;
  autresServices: number;
  nombreEtudiants: number;
}

export interface StudentStats {
  yearId: string;
  cycle: string;
  totalStudents: number;
  newEnrollments: number;
  graduatedStudents: number;
  dropoutRate: number;
}

export interface ServiceRevenue {
  _id: string;
  designation: string;
  category: 'academic' | 'administrative' | 'dormitory' | 'cafeteria' | 'library' | 'transport';
  monthlyRevenue: number;
  yearlyRevenue: number;
  usage: number;
}

// Années académiques
export const mockAcademicYears: AcademicYear[] = [
  {
    _id: "2024-2025",
    totalRevenue: 2850000000, // 2.85 milliards FC
    designation: "2024-2025",
    startDate: "2024-09-01",
    endDate: "2025-07-31",
    isActive: true,
  },
  {
    _id: "2023-2024",
    totalRevenue: 2650000000, // 2.65 milliards FC
    designation: "2023-2024", 
    startDate: "2023-09-01",
    endDate: "2024-07-31",
    isActive: false,
  },
  {
    _id: "2022-2023",
    totalRevenue: 2450000000, // 2.45 milliards FC
    designation: "2022-2023",
    startDate: "2022-09-01",
    endDate: "2023-07-31",
    isActive: false,
  },
];

// Revenus mensuels détaillés
export const mockMonthlyRevenues: MonthlyRevenue[] = [
  // Année 2024-2025
  { yearId: "2024-2025", month: "Sep", totalRevenue: 450000000, inscriptions: 180000000, fraisScolarite: 220000000, autresServices: 50000000, nombreEtudiants: 2800 },
  { yearId: "2024-2025", month: "Oct", totalRevenue: 280000000, inscriptions: 25000000, fraisScolarite: 200000000, autresServices: 55000000, nombreEtudiants: 2850 },
  { yearId: "2024-2025", month: "Nov", totalRevenue: 275000000, inscriptions: 20000000, fraisScolarite: 195000000, autresServices: 60000000, nombreEtudiants: 2870 },
  { yearId: "2024-2025", month: "Déc", totalRevenue: 185000000, inscriptions: 10000000, fraisScolarite: 120000000, autresServices: 55000000, nombreEtudiants: 2880 },
  { yearId: "2024-2025", month: "Jan", totalRevenue: 320000000, inscriptions: 75000000, fraisScolarite: 190000000, autresServices: 55000000, nombreEtudiants: 2950 },
  { yearId: "2024-2025", month: "Fév", totalRevenue: 265000000, inscriptions: 15000000, fraisScolarite: 185000000, autresServices: 65000000, nombreEtudiants: 2965 },
  { yearId: "2024-2025", month: "Mar", totalRevenue: 270000000, inscriptions: 20000000, fraisScolarite: 190000000, autresServices: 60000000, nombreEtudiants: 2980 },
  { yearId: "2024-2025", month: "Avr", totalRevenue: 275000000, inscriptions: 25000000, fraisScolarite: 185000000, autresServices: 65000000, nombreEtudiants: 3000 },
  { yearId: "2024-2025", month: "Mai", totalRevenue: 260000000, inscriptions: 15000000, fraisScolarite: 180000000, autresServices: 65000000, nombreEtudiants: 3010 },
  { yearId: "2024-2025", month: "Juin", totalRevenue: 170000000, inscriptions: 5000000, fraisScolarite: 110000000, autresServices: 55000000, nombreEtudiants: 3015 },
  { yearId: "2024-2025", month: "Juil", totalRevenue: 95000000, inscriptions: 2000000, fraisScolarite: 50000000, autresServices: 43000000, nombreEtudiants: 3020 },
  { yearId: "2024-2025", month: "Aoû", totalRevenue: 40000000, inscriptions: 1000000, fraisScolarite: 15000000, autresServices: 24000000, nombreEtudiants: 3020 },

  // Année 2023-2024
  { yearId: "2023-2024", month: "Sep", totalRevenue: 420000000, inscriptions: 170000000, fraisScolarite: 200000000, autresServices: 50000000, nombreEtudiants: 2650 },
  { yearId: "2023-2024", month: "Oct", totalRevenue: 265000000, inscriptions: 20000000, fraisScolarite: 190000000, autresServices: 55000000, nombreEtudiants: 2700 },
  { yearId: "2023-2024", month: "Nov", totalRevenue: 260000000, inscriptions: 15000000, fraisScolarite: 185000000, autresServices: 60000000, nombreEtudiants: 2720 },
  { yearId: "2023-2024", month: "Déc", totalRevenue: 175000000, inscriptions: 8000000, fraisScolarite: 110000000, autresServices: 57000000, nombreEtudiants: 2730 },
  { yearId: "2023-2024", month: "Jan", totalRevenue: 310000000, inscriptions: 70000000, fraisScolarite: 180000000, autresServices: 60000000, nombreEtudiants: 2800 },
  { yearId: "2023-2024", month: "Fév", totalRevenue: 255000000, inscriptions: 12000000, fraisScolarite: 178000000, autresServices: 65000000, nombreEtudiants: 2815 },
  { yearId: "2023-2024", month: "Mar", totalRevenue: 260000000, inscriptions: 18000000, fraisScolarite: 180000000, autresServices: 62000000, nombreEtudiants: 2830 },
  { yearId: "2023-2024", month: "Avr", totalRevenue: 265000000, inscriptions: 22000000, fraisScolarite: 175000000, autresServices: 68000000, nombreEtudiants: 2850 },
  { yearId: "2023-2024", month: "Mai", totalRevenue: 250000000, inscriptions: 12000000, fraisScolarite: 170000000, autresServices: 68000000, nombreEtudiants: 2860 },
  { yearId: "2023-2024", month: "Juin", totalRevenue: 160000000, inscriptions: 3000000, fraisScolarite: 105000000, autresServices: 52000000, nombreEtudiants: 2865 },
  { yearId: "2023-2024", month: "Juil", totalRevenue: 85000000, inscriptions: 1000000, fraisScolarite: 45000000, autresServices: 39000000, nombreEtudiants: 2870 },
  { yearId: "2023-2024", month: "Aoû", totalRevenue: 35000000, inscriptions: 500000, fraisScolarite: 12000000, autresServices: 22500000, nombreEtudiants: 2870 },
];

// Statistiques des étudiants par cycle
export const mockStudentStats: StudentStats[] = [
  // 2024-2025
  { yearId: "2024-2025", cycle: "License", totalStudents: 1850, newEnrollments: 650, graduatedStudents: 420, dropoutRate: 8.5 },
  { yearId: "2024-2025", cycle: "Master", totalStudents: 980, newEnrollments: 380, graduatedStudents: 275, dropoutRate: 6.2 },
  { yearId: "2024-2025", cycle: "Doctorat", totalStudents: 190, newEnrollments: 45, graduatedStudents: 28, dropoutRate: 4.1 },

  // 2023-2024
  { yearId: "2023-2024", cycle: "License", totalStudents: 1750, newEnrollments: 600, graduatedStudents: 400, dropoutRate: 9.2 },
  { yearId: "2023-2024", cycle: "Master", totalStudents: 920, newEnrollments: 350, graduatedStudents: 260, dropoutRate: 7.1 },
  { yearId: "2023-2024", cycle: "Doctorat", totalStudents: 200, newEnrollments: 50, graduatedStudents: 32, dropoutRate: 5.0 },
];

// Revenus par service
export const mockServiceRevenues: ServiceRevenue[] = [
  {
    _id: "bibliotheque",
    designation: "Bibliothèque universitaire",
    category: "library",
    monthlyRevenue: 12500000, // 12.5M FC/mois
    yearlyRevenue: 150000000, // 150M FC/an
    usage: 85,
  },
  {
    _id: "transport",
    designation: "Transport universitaire",
    category: "transport",
    monthlyRevenue: 18000000, // 18M FC/mois
    yearlyRevenue: 216000000, // 216M FC/an
    usage: 65,
  },
  {
    _id: "cafeteria",
    designation: "Cafétéria et restauration",
    category: "cafeteria",
    monthlyRevenue: 22000000, // 22M FC/mois
    yearlyRevenue: 264000000, // 264M FC/an
    usage: 78,
  },
  {
    _id: "residence",
    designation: "Résidence universitaire",
    category: "dormitory",
    monthlyRevenue: 35000000, // 35M FC/mois
    yearlyRevenue: 420000000, // 420M FC/an
    usage: 92,
  },
  {
    _id: "certificats",
    designation: "Émission de certificats",
    category: "administrative",
    monthlyRevenue: 8500000, // 8.5M FC/mois
    yearlyRevenue: 102000000, // 102M FC/an
    usage: 100,
  },
  {
    _id: "laboratoires",
    designation: "Travaux pratiques et laboratoires",
    category: "academic",
    monthlyRevenue: 15000000, // 15M FC/mois
    yearlyRevenue: 180000000, // 180M FC/an
    usage: 88,
  },
];

// Fonction utilitaire pour obtenir les données d'une année spécifique
export const getRevenueByYear = (yearId: string) => {
  return mockMonthlyRevenues.filter(revenue => revenue.yearId === yearId);
};

// Fonction utilitaire pour calculer le total mensuel
export const getTotalRevenueByMonth = (yearId: string, month: string) => {
  const data = mockMonthlyRevenues.find(revenue => 
    revenue.yearId === yearId && revenue.month === month
  );
  return data ? data.totalRevenue : 0;
};

// Fonction utilitaire pour obtenir les tendances
export const getRevenueTrends = () => {
  const currentYear = mockMonthlyRevenues.filter(r => r.yearId === "2024-2025");
  const previousYear = mockMonthlyRevenues.filter(r => r.yearId === "2023-2024");
  
  let totalCurrent = currentYear.reduce((sum, month) => sum + month.totalRevenue, 0);
  let totalPrevious = previousYear.reduce((sum, month) => sum + month.totalRevenue, 0);
  
  const growthRate = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
  
  return {
    currentYearTotal: totalCurrent,
    previousYearTotal: totalPrevious,
    growthRate: Math.round(growthRate * 100) / 100,
  };
};