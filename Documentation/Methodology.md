# Methodology

To guarantee accurate computational metrics without hindering the responsiveness of the graphical interface, StockTraQ was engineered using a fully decoupled Distributed Microservices architecture. 

## 1. System Architecture

The ecosystem relies on an asynchronous multi-server environment:
- **Client Application (Frontend):** Developed utilizing React 18 and Vite. It utilizes Tailwind CSS alongside Framer Motion to construct a high-density, glassmorphic analytics dashboard rendering real-time validation without stutter.
- **Intelligence Engine (Backend - ML):** A Python-based FastAPI server acts as the central data-science distributor. It hosts and executes synchronized Scikit-Learn pipelines and the PDF tracking modules instantly upon request.
- **Management Server (Backend - App):** A Node.js (Express) daemon strictly manages JSON Web Token (JWT) secured administrative protocols, user authorization edits, and localized MongoDB route caching.
- **Database Layer:** A MongoDB NoSQL database efficiently stores unformatted historical JSON arrays, managing flexible financial records scaling natively.

## 2. Process Workflow

### Step 1: Data Collection & Mappings
StockTraQ integrates two primary data paradigms:
- **Numerical Arrays:** Historic categorical listings capturing Subscription demand tiers (QIB, Retail), market capitalization boundaries, and baseline financials (Revenue, Profit After Tax, ROE).
- **Textual Processing:** Locally processing unformatted Red Herring Prospectus (RHP) PDF documents to prepare embedded text extractions.

### Step 2: Processing & Data Engineering 
Incoming tabular arrays are standardized and cleaned of missing constraints. Crucially, PDF manipulation relies on mapping exact physical page sections to limit text overlaps (sequestering text bound roughly to 'Risk Factors' safely apart from 'General Operations') via Python document extraction classes. 

### Step 3: Model Development (The Neural Engine)
The predictive infrastructure breaks down into distinctive specialized calculations:
1. **Listing Gain Predictor & Demand Tier:** Evaluates subscription thresholds.
2. **Financial Strength & Valuation Impact:** Scores baselines and scales P/E impact natively.

These are powered strictly by **Ensemble Regression Logic**. The final Unified IPO Rating is formulated by aggregating calculations parsed through a 40% Random Forest, 40% Gradient Boosting, and 20% Linear Regression split. This fallback execution guarantees mathematical fidelity.

### Step 4: AI Insights Integration (RAG)
An independent conversational pipeline allows users to issue prompt queries against the segmented document data, actively recalling structural texts mapped across the Prospectus to simplify the discovery workflow.
