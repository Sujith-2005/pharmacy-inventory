# Smart Pharmacy Inventory System 💊

A modern, full-stack pharmacy inventory management system designed to streamline operations, optimize stock levels, and provide intelligent insights through data analytics and AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18.x-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-009688.svg)

# 🚀 Features

*   Inventory Management: Real-time tracking of drug stock levels, expiration dates, and batch information.
*   Intelligent Forecasting: AI-driven demand forecasting to prevent stockouts and overstocking.
*   Waste Analytics: Detailed analysis of expired and wasted inventory to identify cost-saving opportunities.
*   Alert System: Automated notifications for low stock, expiring items, and other critical events.
*   Supplier Management: Maintain a database of suppliers and generate purchase orders.
*   Interactive Dashboard: A comprehensive overview of key performance indicators (KPIs) and operational metrics.
*   AI Chatbot: An integrated assistant to answer queries about inventory and operations.
*   User Authentication: Secure login and role-based access control.

# 🛠️ Tech Stack

# Backend
*   Framework: FastAPI - High-performance web framework for building APIs with Python.
*   Database: SQLAlchemy (likely SQLite for local development)
*   Data Processing: Pandas, NumPy
*   AI/ML: Scikit-learn (or similar for forecasting logic)

# Frontend
*   Framework: React
*   Build Tool: Vite
*   Styling: Tailwind CSS
*   State Management: React Query / Context API
*   Icons: Heroicons

📋 Prerequisites

Before you begin, ensure you have the following installed:
*   Python 3.8+
*   Node.js (v16 or higher recommended)
*   npm (usually comes with Node.js)

# ⚡ Installation & Setup

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd pharmacy-inventory
    ```

# Backend Setup

2.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

3.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Activate on Windows:
    .\venv\Scripts\activate
    # Activate on macOS/Linux:
    source venv/bin/activate
    ```

4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5.  Environment Configuration:
    *   Create a .env file in the backend/ directory based on .env.example.
    *   Add necessary API keys and configuration settings (e.g., Database URL, Secret Key).

6.  Run the Backend Server:
    ```bash
    python main.py
    # OR using uvicorn directly:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
    The API will be available at http://localhost:8000. API documentation is available at http://localhost:8000/docs.

### Frontend Setup

7.  Navigate to the frontend directory:
    Open a new terminal window and navigate to the project root, then:
    ```bash
    cd frontend
    ```

8.  Install dependencies:
    ```bash
    npm install
    ```

9.  Run the Frontend Development Server:
    ```bash
    npm run dev
    ```
    The application will typically run at http://localhost:3000 (or another port if 3000 is busy).

📂 Project Structure

```
pharmacy-inventory/
├── backend/                # FastAPI backend source code
│   ├── main.py             # Application entry point
│   ├── routers/            # API route definitions
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── ml_models/          # Machine learning models
│   ├── requirements.txt    # Python dependencies
│   └── ...
├── frontend/               # React frontend source code
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   └── ...
│   ├── package.json        # NPM dependencies
│   └── vite.config.js      # Vite configuration
├── scripts/                # Utility and analysis scripts
├── data/                   # Data storage (csv, json, etc.)
└── README.md               # Project documentation
```

 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch: git checkout -b feature/your-feature-name
3.  Make your changes and commit them: git commit -m 'Add some feature'
4.  Push to the branch: git push origin feature/your-feature-name
5.  Submit a pull request.

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
