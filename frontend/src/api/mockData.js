export const mockMedicines = [
    {
        "sku": "MED001",
        "name": "Paracetamol 500mg",
        "category": "Pain Relief",
        "manufacturer": "ABC Pharma",
        "brand": "Brand A",
        "mrp": 10.5,
        "cost": 8.0,
        "schedule": "OTC",
        "storage_requirements": "Room Temperature",
        "description": null,
        "id": 1,
        "is_active": true,
        "created_at": "2025-12-14T08:45:14"
    },
    {
        "sku": "MED002",
        "name": "Azithromycin 500mg",
        "category": "Antibiotics",
        "manufacturer": "XYZ Pharma",
        "brand": "Brand B",
        "mrp": 25.0,
        "cost": 20.0,
        "schedule": "Schedule H",
        "storage_requirements": "Room Temperature",
        "description": null,
        "id": 2,
        "is_active": true,
        "created_at": "2025-12-14T08:45:14"
    },
    {
        "sku": "MED003",
        "name": "Metformin 500mg",
        "category": "Diabetes",
        "manufacturer": "DEF Pharma",
        "brand": "Brand C",
        "mrp": 5.75,
        "cost": 4.5,
        "schedule": "Schedule H",
        "storage_requirements": "Room Temperature",
        "description": null,
        "id": 3,
        "is_active": true,
        "created_at": "2025-12-14T08:45:14"
    }
];

export const mockDashboardStats = {
    total_medicines: 1250,
    low_stock_count: 15,
    expired_count: 5,
    total_value: 450000,
    near_expiry_count: 12,
    active_alerts: 3
};

export const mockSalesTrends = {
    dates: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
    values: [1200, 1500, 1100, 1800, 2000]
};

export const mockTopMedicines = [
    { name: "Paracetamol 500mg", quantity: 1500, value: 15000 },
    { name: "Amoxicillin 250mg", quantity: 1200, value: 24000 },
    { name: "Dolo 650", quantity: 1000, value: 12000 },
    { name: "Cetirizine", quantity: 900, value: 4500 },
    { name: "Pantoprazole", quantity: 850, value: 8500 }
];

export const mockExpiryTimeline = [
    { date: "2024-01-15", count: 5, medicine: "Metformin" },
    { date: "2024-02-01", count: 12, medicine: "Aspirin" },
    { date: "2024-03-10", count: 8, medicine: "Vitamin C" }
];

export const mockInventoryByCategory = [
    { category: "Antibiotics", count: 450, value: 50000 },
    { category: "Pain Relief", count: 300, value: 15000 },
    { category: "Diabetes", count: 200, value: 35000 },
    { category: "Cardiology", count: 150, value: 45000 },
    { category: "Supplements", count: 150, value: 12000 }
];

export const mockAlerts = [
    { id: 1, type: "low_stock", message: "Paracetamol below threshold (50 units)", severity: "high", created_at: "2024-01-18T10:00:00", is_acknowledged: false },
    { id: 2, type: "expiry", message: "Amoxicillin batch #B123 expires in 15 days", severity: "critical", created_at: "2024-01-18T09:30:00", is_acknowledged: false },
    { id: 3, type: "trend", message: "Unusual localized demand for Flu meds", severity: "medium", created_at: "2024-01-17T14:20:00", is_acknowledged: true }
];

export const mockForecast = {
    dates: ["2024-02-01", "2024-02-02", "2024-02-03", "2024-02-04", "2024-02-05"],
    predicted_demand: [45, 48, 50, 42, 40],
    lower_bound: [40, 42, 45, 38, 35],
    upper_bound: [50, 54, 55, 46, 45]
};

export const mockReorderSuggestions = [
    { medicine_id: 1, name: "Paracetamol", current_stock: 40, suggested_order: 200, reason: "High demand predicted" },
    { medicine_id: 2, name: "Metformin", current_stock: 20, suggested_order: 150, reason: "Below safety stock" }
];

export const mockChatbotResponse = {
    response: "I can help you with that. Based on the current inventory data, we have adequate stock of pain relief medications, but antibiotic supplies are running low.",
    session_id: "mock-session-123",
    suggested_actions: ["Check Stock", "Place Order", "View Alerts"]
};
