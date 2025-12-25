// Mock data simple pour l'ecommerce adapté à l'administration scolaire
export const mockEcommerceData = {
  years: [
    { _id: "2024-2025", totalSales: 4635, designation: "2024-2025" },
    { _id: "2023-2024", totalSales: 4250, designation: "2023-2024" },
    { _id: "2022-2023", totalSales: 3890, designation: "2022-2023" }
  ],
  
  chartData: [
    { yearId: "2024-2025", month: "Jan", totalSales: 450 },
    { yearId: "2024-2025", month: "Feb", totalSales: 380 },
    { yearId: "2024-2025", month: "Mar", totalSales: 420 },
    { yearId: "2024-2025", month: "Apr", totalSales: 285 },
    { yearId: "2024-2025", month: "May", totalSales: 520 },
    { yearId: "2024-2025", month: "Jun", totalSales: 365 },
    { yearId: "2024-2025", month: "Jul", totalSales: 470 },
    { yearId: "2024-2025", month: "Aug", totalSales: 395 },
    { yearId: "2024-2025", month: "Sep", totalSales: 560 },
    { yearId: "2024-2025", month: "Oct", totalSales: 320 },
    { yearId: "2024-2025", month: "Nov", totalSales: 280 },
    { yearId: "2024-2025", month: "Dec", totalSales: 190 }
  ],

  targetYears: [
    {
      _id: "2024-2025",
      totalTarget: 5000,
      amountSpent: 4635,
      totalTargetOK: 3500,
      totalTargetPending: 365,
      totalTargetMissed: 1135,
      designation: "2024-2025"
    },
    {
      _id: "2023-2024", 
      totalTarget: 4800,
      amountSpent: 4250,
      totalTargetOK: 3200,
      totalTargetPending: 550,
      totalTargetMissed: 1050,
      designation: "2023-2024"
    },
    {
      _id: "2022-2023",
      totalTarget: 4500,
      amountSpent: 3890,
      totalTargetOK: 2900,
      totalTargetPending: 990,
      totalTargetMissed: 610,
      designation: "2022-2023"
    }
  ]
};