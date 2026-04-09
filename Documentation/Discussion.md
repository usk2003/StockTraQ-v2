# Discussion

StockTraQ establishes a cohesive data framework combining predictive statistical mathematics with robust interface architectures. 

## 1. System Performance and Results
The explicit partitioning of backend layers has proven exceptionally robust. Because the Python FastAPI infrastructure exclusively handles the heavy Scikit-Learn algorithmic load alongside iterative PDF chunking, dashboard operations via the Node.js daemon (such as historical queries or admin-level state configurations) remain continually responsive and unblocked globally.

Mathematical regressions leveraging the 40-40-20 ensemble distribution (Random Forest, Gradient Boosting, Linear Regression) successfully nullify mathematical outliers. The system yields deterministic numbers based purely on mapped factual logic without subjecting the calculations to the risk of Generative AI's innate numerical hallucinations. 

## 2. System Strengths
- **Decoupled Architecture Scalability:** API segregation allows independent vertical scaling and restricts crashing thresholds effectively.
- **Structured RAG Determinism:** Confining conversational agents exclusively to mapped PDF indexing drastically limits unverified corporate summaries. 
- **Backtest Transparency:** Integrating a visual, live verification dashboard allows analysts to compare simulated AI findings intimately with historical benchmarks, solidifying platform trust. 

## 3. Limitations 
- **Macro-Economic Dependency:** The predictive algorithms execute bounds based squarely on known pre-market data and comparative histories. Spontaneous widespread market crashes (or unforeseen geopolitical global events) immediately following subscription phases cannot be forecasted dynamically.
- **Parsing Inflexibility:** Advanced insight generation leans heavily upon the structured bounds of standard RHP files. Extremely unformatted or heavily misaligned tabular PDFs occasionally degrade text-extraction continuity.

## 4. Development Challenges
Balancing React's asynchronous state lifecycle against heavy numerical API yields required strict state-lock protocols. Developing secure Axios routing interceptors ensuring the React client correctly directs queries (Port 8000 for intelligence logic versus Port 5000 for standard CRUD administration) demanded comprehensive configuration mapping. Furthermore, optimizing PyMuPDF mapping engines to aggressively prune irrelevant page arrays was vital to maintaining rapid server query executions.
