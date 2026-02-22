"""
IPO TraQ - Professional IPO Prediction Engine
A hybrid ML-based listing gain & rating system
"""

import streamlit as st
import numpy as np
import sys
import os

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))
from prediction_utils import *
from ipo_constants import ONGOING_IPOS_2026, CLOSED_IPOS_2026

# Page Configuration
st.set_page_config(
    page_title="IPO TraQ - Intelligent IPO Analysis",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ... (CSS remains same) ...

# Initialize Session State
if 'qib' not in st.session_state: st.session_state.qib = 4.41
if 'nii' not in st.session_state: st.session_state.nii = 0.80
if 'retail' not in st.session_state: st.session_state.retail = 1.08
if 'total_sub' not in st.session_state: st.session_state.total_sub = 2.81
if 'issue_size' not in st.session_state: st.session_state.issue_size = 2833.90
if 'pe_ratio' not in st.session_state: st.session_state.pe_ratio = 65.50
if 'revenue' not in st.session_state: st.session_state.revenue = 2816.00
if 'pat' not in st.session_state: st.session_state.pat = 12.60
if 'roe' not in st.session_state: st.session_state.roe = 3.62
if 'roce' not in st.session_state: st.session_state.roce = 14.40
if 'profit_margin' not in st.session_state: st.session_state.profit_margin = 17.40
if 'revenue_growth' not in st.session_state: st.session_state.revenue_growth = 26.00
if 'analyze_trigger' not in st.session_state: st.session_state.analyze_trigger = False

def set_analysis_params(params):
    """Update session state with params and trigger analysis"""
    for key, val in params.items():
        if key == 'qib': st.session_state.qib = float(val)
        elif key == 'nii': st.session_state.nii = float(val)
        elif key == 'retail': st.session_state.retail = float(val)
        elif key == 'total': st.session_state.total_sub = float(val)
        elif key == 'issue_size': st.session_state.issue_size = float(val)
        elif key == 'pe': st.session_state.pe_ratio = float(val)
        elif key == 'revenue': st.session_state.revenue = float(val)
        elif key == 'pat': st.session_state.pat = float(val)
        elif key == 'roe': st.session_state.roe = float(val)
        elif key == 'roce': st.session_state.roce = float(val)
        elif key == 'margin': st.session_state.profit_margin = float(val)
        elif key == 'growth': st.session_state.revenue_growth = float(val)
    
    st.session_state.company_name = params.get('name', 'Custom Analysis')
    st.session_state.actual_gain = params.get('actual_gain', None) # Store actual gain if available
    st.session_state.active_view = "📊 IPO Analysis"
    st.session_state.analyze_trigger = True

# Custom CSS for distinctive design (keeping existing)
st.markdown("""
<style>
    /* Import distinctive fonts */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');
    
    /* Global theme */
    :root {
        --primary: #0f172a;
        --accent: #3b82f6;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --purple: #8b5cf6;
    }
    
    /* Main container */
    .main {
        background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%); /* Deep Charcoal / Black Theme */
        color: #f1f5f9;
        font-family: 'Poppins', sans-serif;
    }
    
    /* Typography */
    h1, h2, h3 {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
    
    p, div, span, label {
        font-family: 'Poppins', sans-serif;
        font-weight: 300;
    }
    
    /* Header */
    .header-container {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); /* Deep Royal Blue */
        padding: 3rem 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
        box-shadow: 0 20px 60px rgba(30, 58, 138, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .header-title {
        font-size: 3.5rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-family: 'Poppins', sans-serif;
    }
    
    .header-subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 0.5rem;
        font-weight: 300;
        font-family: 'Space Mono', monospace;
    }
    
    /* Input cards */
    .input-section {
        background: rgba(30, 30, 30, 0.6);
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        margin-bottom: 1.5rem;
        transition: all 0.3s ease;
    }
    
    .input-section:hover {
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }
    
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #60a5fa;
        margin-bottom: 1rem;
        font-family: 'Poppins', sans-serif;
    }
    
    /* Results cards */
    .result-card {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
        padding: 2rem;
        border-radius: 20px;
        border: 2px solid rgba(59, 130, 246, 0.3);
        margin: 1rem 0;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }
    
    .metric-card {
        background: rgba(40, 40, 40, 0.8);
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid var(--accent);
        margin: 0.8rem 0;
        transition: transform 0.2s ease;
    }
    
    .metric-card:hover {
        transform: translateX(5px);
        background: rgba(50, 50, 50, 0.9);
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: #a3a3a3;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 400;
        font-family: 'Space Mono', monospace;
    }
    
    .metric-value {
        font-size: 2.5rem;
        font-weight: 700;
        margin-top: 0.5rem;
        font-family: 'Poppins', sans-serif;
    }
    
    .metric-subtext {
        font-size: 1rem;
        color: #d1d5db;
        margin-top: 0.3rem;
    }
    
    /* Rating badge */
    .rating-badge {
        display: inline-block;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.8rem;
        font-weight: 800;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        font-family: 'Poppins', sans-serif;
    }
    
    /* Tag badges */
    .tag-badge {
        display: inline-block;
        padding: 0.5rem 1.2rem;
        border-radius: 25px;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0.3rem;
        font-family: 'Poppins', sans-serif;
    }
    
    /* Progress bars */
    .progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(60, 60, 60, 0.6);
        border-radius: 10px;
        overflow: hidden;
        margin-top: 0.5rem;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 10px;
        transition: width 0.8s ease;
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
        padding: 1rem 3rem;
        border-radius: 50px;
        border: none;
        box-shadow: 0 10px 30px rgba(30, 58, 138, 0.5);
        transition: all 0.3s ease;
        font-family: 'Poppins', sans-serif;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(30, 58, 138, 0.6);
    }
    
    /* Streamlit widget customization */
    .stNumberInput > div > div > input {
        background: rgba(40, 40, 40, 0.8) !important;
        color: #f1f5f9 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px;
        font-family: 'Space Mono', monospace;
        font-size: 1rem;
    }
    
    .stSelectbox > div > div {
        background: rgba(40, 40, 40, 0.8) !important;
        color: #f1f5f9 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px;
    }
    
    /* Sidebar */
    .css-1d391kg {
        background: #121212;
    }
    
    /* Info boxes */
    .info-box {
        background: rgba(30, 58, 138, 0.2);
        border-left: 4px solid #3b82f6;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        color: #e2e8f0;
    }
    
    /* Animation */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease-out;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="header-container">
    <h1 class="header-title">📈 IPO TraQ</h1>
    <p class="header-subtitle">AI-Powered IPO Performance Prediction Engine</p>
</div>
""", unsafe_allow_html=True)

# Load models
with st.spinner("🔄 Loading AI models..."):
    model1, model3, model4, model5, metadata = load_models()

if model1 is None:
    st.error("⚠️ Error loading models. Please ensure models are trained.")
    st.stop()

# Sidebar - Model Info
with st.sidebar:
    
    st.markdown("### 📊 Prediction Models")
    st.markdown("""
    1. **Listing Gain** - QIB to listing performance
    2. **Demand Analysis** - Subscription impact
    3. **Long-Term Growth** - Future performance
    4. **PE Valuation** - Pricing efficiency
    5. **Financial Strength** - Company fundamentals
    """)
    
    st.markdown("### ⚙️ Rating Scale")
    st.markdown("""
    - **1-3:** ❌ Avoid
    - **4-5:** ⚠️ Risky
    - **6-7:** ✓ Decent
    - **8-9:** ⭐ Strong
    - **10:** 💎 Blockbuster
    """)

    st.markdown("### 🤖 Model Information")
    if metadata:
        st.info(f"""
        **Training Date:** {metadata['training_date']}  
        **Training Samples:** {metadata['training_samples']}  
        **Test Samples:** {metadata['test_samples']}
        """)


# Main content
if 'active_view' not in st.session_state:
    st.session_state.active_view = "🏠 Home"

def set_view(view_name):
    st.session_state.active_view = view_name

# Custom Button-based Navigation (looks like tabs, functions like controlled state)
# st.markdown("---")
nav_col0, nav_col1, nav_col2, nav_col3, nav_col4 = st.columns(5)

with nav_col0:
    if st.button("🏠 Home", type="primary" if st.session_state.active_view == "🏠 Home" else "secondary", use_container_width=True):
        st.session_state.active_view = "🏠 Home"
        st.rerun()

with nav_col1:
    if st.button("📊 Analysis", type="primary" if st.session_state.active_view == "📊 IPO Analysis" else "secondary", use_container_width=True):
        st.session_state.active_view = "📊 IPO Analysis"
        st.rerun()

with nav_col2:
    if st.button("📈 Ongoing", type="primary" if st.session_state.active_view == "📈 Ongoing IPOs" else "secondary", use_container_width=True):
        st.session_state.active_view = "📈 Ongoing IPOs"
        st.rerun()

with nav_col3:
    if st.button("✅ Closed", type="primary" if st.session_state.active_view == "✅ Closed IPOs" else "secondary", use_container_width=True):
        st.session_state.active_view = "✅ Closed IPOs"
        st.rerun()

with nav_col4:
    if st.button("🔍 Search", type="primary" if st.session_state.active_view == "🔍 Search Past IPOs" else "secondary", use_container_width=True):
        st.session_state.active_view = "🔍 Search Past IPOs"
        st.rerun()

# -----------------------------------------------------------------------------
# VIEW: Home
# -----------------------------------------------------------------------------
if st.session_state.active_view == "🏠 Home":
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #60a5fa; margin-bottom: 0.5rem;">Welcome to IPO TraQ</h1>
        <p style="font-size: 1.2rem; color: #cbd5e1;">Your AI-Powered IPO Analysis Companion</p>
    </div>
    
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 3rem;">
        <div style="flex: 1; min-width: 300px; background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155;">
            <h3 style="color: #3b82f6; margin-top: 0;">🤔 What is IPO TraQ?</h3>
            <p style="color: #94a3b8; line-height: 1.6;">
                IPO TraQ is an advanced analytics platform that leverages machine learning to predict the performance of Initial Public Offerings (IPOs). 
                It analyzes comprehensive financial data, subscription figures, and market sentiment to provide you with actionable insights.
            </p>
        </div>
        <div style="flex: 1; min-width: 300px; background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155;">
            <h3 style="color: #10b981; margin-top: 0;">💡 Why IPO TraQ?</h3>
            <p style="color: #94a3b8; line-height: 1.6;">
                Investing in IPOs can be volatile. IPO TraQ removes the guesswork by using historical data from hundreds of past IPOs to identify patterns. 
                Whether you're looking for listing gains or long-term value, our AI models help you make data-driven decisions.
            </p>
        </div>
    </div>
    
    <h3 style="color: #f59e0b; text-align: center; margin-bottom: 1.5rem;">🤖 Our AI Models</h3>
    <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">
        Powered by a <strong>Hybrid Ensemble</strong> of <em>Random Forest</em>, <em>Gradient Boosting</em>, and <em>Linear Regression</em>.
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
            <strong style="color: #e2e8f0;">Listing Gain</strong>
            <p style="font-size: 0.8rem; color: #94a3b8;">Predicts opening day returns based on subscription & GMP.</p>
            <span class="tag-badge" style="font-size: 0.7rem; background: #334155;">Hybrid Regressor</span>
        </div>
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔥</div>
            <strong style="color: #e2e8f0;">Demand Tier</strong>
            <p style="font-size: 0.8rem; color: #94a3b8;">Classifies market hype and subscription demand.</p>
            <span class="tag-badge" style="font-size: 0.7rem; background: #334155;">Classification Logic</span>
        </div>
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
            <strong style="color: #e2e8f0;">Long-Term</strong>
            <p style="font-size: 0.8rem; color: #94a3b8;">Forecasts performance over a 6-12 month horizon.</p>
            <span class="tag-badge" style="font-size: 0.7rem; background: #334155;">Hybrid Regressor</span>
        </div>
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
            <strong style="color: #e2e8f0;">PE Valuation</strong>
            <p style="font-size: 0.8rem; color: #94a3b8;">Evaluates pricing efficiency relative to peers.</p>
            <span class="tag-badge" style="font-size: 0.7rem; background: #334155;">Comparative model</span>
        </div>
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏦</div>
            <strong style="color: #e2e8f0;">Fundamentals</strong>
            <p style="font-size: 0.8rem; color: #94a3b8;">Scores financial health (Revenue, PAT, ROE).</p>
            <span class="tag-badge" style="font-size: 0.7rem; background: #334155;">Scoring Algorithm</span>
        </div>
    </div>
    
    <div style="text-align: center;">
        <p style="color: #64748b; margin-bottom: 1rem;">Ready to explore? Select a module from the menu above to get started.</p>
    </div>
    """, unsafe_allow_html=True)

    col_home_btn1, col_home_btn2, col_home_btn3 = st.columns([1, 2, 1])
    with col_home_btn2:
        if st.button("🧪 Check Model Performance", use_container_width=True):
            st.session_state.active_view = "🧪 Model Performance"
            st.rerun()

# -----------------------------------------------------------------------------
# VIEW: IPO Analysis
# -----------------------------------------------------------------------------
if st.session_state.active_view == "📊 IPO Analysis":
    
    # Display Company Name if available
    if 'company_name' in st.session_state:
        st.markdown(f'<h2 class="section-title" style="color: #60a5fa;">🏢 {st.session_state.company_name}</h2>', unsafe_allow_html=True)
        st.markdown('<h3 class="section-title">📋 IPO Details</h3>', unsafe_allow_html=True)
    else:
        st.markdown('<h3 class="section-title">📋 IPO Details</h3>', unsafe_allow_html=True)
    
    st.markdown('<div class="metric-card" style="padding: 2rem;">', unsafe_allow_html=True)
    if st.session_state.analyze_trigger:
        st.success("✅ Data loaded! Click 'Analyze IPO Performance' below to view results.")
        st.session_state.analyze_trigger = False
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Subscription Data")
        qib = st.number_input("🏢 QIB Subscription (x)", min_value=0.0, step=0.1, key='qib',
                             help="Qualified Institutional Buyers subscription times")
        nii = st.number_input("💼 NII Subscription (x)", min_value=0.0, step=0.1, key='nii',
                             help="Non-Institutional Investors subscription times")
        retail = st.number_input("👥 Retail Subscription (x)", min_value=0.0, step=0.1, key='retail',
                               help="Retail investors subscription times")
        total_sub = st.number_input("📊 Total Subscription (x)", min_value=0.0, step=0.1, key='total_sub',
                                   help="Overall subscription times")
    
    with col2:
        st.markdown("#### Financial Metrics")
        issue_size = st.number_input("💰 Issue Size (₹ Cr)", min_value=0.0, step=10.0, key='issue_size',
                                    help="Total IPO size in crores")
        pe_ratio = st.number_input("📈 PE Ratio", min_value=0.0, step=0.5, key='pe_ratio',
                                  help="Price to Earnings ratio")
        revenue = st.number_input("💵 Revenue (₹ Cr)", min_value=0.0, step=10.0, key='revenue',
                                  help="Annual revenue in crores")
        pat = st.number_input("💎 PAT (₹ Cr)", min_value=0.0, step=1.0, key='pat',
                            help="Profit After Tax in crores")
    
    col3, col4 = st.columns(2)
    
    with col3:
        roe = st.number_input("📊 ROE (%)", min_value=0.0, max_value=100.0, step=0.5, key='roe',
                            help="Return on Equity percentage")
        roce = st.number_input("📊 ROCE (%)", min_value=0.0, max_value=100.0, step=0.5, key='roce',
                             help="Return on Capital Employed percentage")
    
    with col4:
        profit_margin = st.number_input("📊 Profit Margin (%)", min_value=0.0, max_value=100.0, step=0.5, key='profit_margin',
                                       help="Net profit margin percentage")
        revenue_growth = st.number_input("📈 Revenue Growth (%)", min_value=-100.0, step=0.5, key='revenue_growth',
                                        help="Year-over-year revenue growth")
    st.markdown('</div>', unsafe_allow_html=True)
    
    
    # Prediction button
    st.markdown("<br>", unsafe_allow_html=True)
    col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
    with col_btn2:
        predict_button = st.button("🚀 Analyze IPO Performance", use_container_width=True)
    
    if predict_button:
        with st.spinner("🔮 Running AI analysis..."):
            # Model 1: Listing Gain
            listing_gain, listing_rating = predict_listing_gain(
                qib, nii, retail, total_sub, issue_size, model1
            )
            
            # Model 2: Demand Classification
            gain_tag, gain_color = tag_gain(listing_gain)
            demand_tier, demand_color = classify_demand(total_sub)
            
            # Model 3: Long-term Gain
            longterm_gain = predict_longterm_gain(
                qib, total_sub, issue_size, listing_gain, model3
            )
            
            # Model 4: PE Impact
            pe_score = predict_pe_impact(
                pe_ratio, revenue, profit_margin, roe, model4
            )
            
            # Model 5: Financial Rating
            financial_rating = predict_financial_rating(
                revenue, pat, roe, roce, profit_margin, model5
            )
            
            # Unified Rating
            unified_rating = calculate_unified_rating(
                listing_rating, total_sub, longterm_gain, pe_score, financial_rating
            )
            
            rating_label, rating_color = get_rating_label(unified_rating)
            recommendation = get_recommendation(
                unified_rating, listing_gain, longterm_gain, financial_rating
            )
        
        # Results Display
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="result-card fade-in">', unsafe_allow_html=True)
        
        # Unified Rating - Prominent Display
        st.markdown(f"""
        <div style="text-align: center; margin: 2rem 0;">
            <div class="metric-label">UNIFIED IPO RATING</div>
            <div class="rating-badge" style="background: linear-gradient(135deg, {rating_color}dd 0%, {rating_color}99 100%); color: white; margin-top: 1rem;">
                {rating_label.split()[0]} {unified_rating}/10
            </div>
            <div style="margin-top: 1rem; font-size: 1.2rem; color: {rating_color}; font-weight: 600;">{rating_label.split()[1] if len(rating_label.split()) > 1 else ''}</div>
        </div>
        """, unsafe_allow_html=True)
        
        # ---------------------------------------------------------------------
        # NEW: Listing Sentiment Card
        # ---------------------------------------------------------------------
        # Logic: >30% Positive (Green), <0% Negative (Red), 0-30% Mild (Yellow)
        if listing_gain > 30:
            sent_title = "POSITIVE LISTING"
            sent_color = "#10b981" # Green
            sent_icon = "🚀"
            sent_bg = "rgba(16, 185, 129, 0.1)"
        elif listing_gain < 0:
            sent_title = "NEGATIVE LISTING"
            sent_color = "#ef4444" # Red
            sent_icon = "📉"
            sent_bg = "rgba(239, 68, 68, 0.1)"
        else:
            sent_title = "MILD LISTING"
            sent_color = "#f59e0b" # Yellow
            sent_icon = "😐"
            sent_bg = "rgba(245, 158, 11, 0.1)"
            
        st.markdown(f"""
        <div style="background: {sent_bg}; border: 2px solid {sent_color}; border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">{sent_icon}</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: {sent_color}; letter-spacing: 0.05em;">{sent_title}</div>
            <div style="color: #cbd5e1; margin-top: 0.5rem;">Based on current subscription levels and GMP trends</div>
        </div>
        """, unsafe_allow_html=True)
        # ---------------------------------------------------------------------

        # ---------------------------------------------------------------------
        # NEW: Actual vs Predicted (Only for Past IPOs)
        # ---------------------------------------------------------------------
        if 'actual_gain' in st.session_state and st.session_state.actual_gain is not None:
             act_gain = st.session_state.actual_gain
             # Show absolute difference (modulus)
             diff_abs = abs(listing_gain - act_gain)
             
             st.markdown(f"""
             <div style="background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-top: 0; text-align: center; color: #60a5fa;">🎯 Prediction Accuracy Check</h3>
                <div style="display: flex; justify-content: space-around; align-items: center; margin-top: 1rem;">
                    <div style="text-align: center;">
                        <small style="color: #94a3b8;">AI Predicted</small><br>
                        <span style="font-size: 1.5rem; font-weight: bold; color: #3b82f6;">{listing_gain:.1f}%</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 1.5rem;">🆚</span>
                    </div>
                    <div style="text-align: center;">
                        <small style="color: #94a3b8;">Actual Listing</small><br>
                        <span style="font-size: 1.5rem; font-weight: bold; color: {'#10b981' if act_gain>0 else '#ef4444'};">{act_gain:.1f}%</span>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1rem; color: #cbd5e1; font-size: 0.9rem;">
                    Error Margin: <strong>{diff_abs:.1f}%</strong> (absolute difference)
                </div>
             </div>
             """, unsafe_allow_html=True)
        # ---------------------------------------------------------------------
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Detailed Metrics
        st.markdown("### 📊 Detailed Analysis")
        
        col_m1, col_m2, col_m3 = st.columns(3)
        
        with col_m1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Listing Gain</div>
                <div class="metric-value" style="color: {gain_color};">{listing_gain:.1f}%</div>
                <div class="metric-subtext">
                    <span class="tag-badge" style="background: {gain_color}; color: white;">{gain_tag}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {min(100, abs(listing_gain))}%; background: {gain_color};"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col_m2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Long-Term Gain</div>
                <div class="metric-value" style="color: {'#10b981' if longterm_gain > 0 else '#ef4444'};">{longterm_gain:.1f}%</div>
                <div class="metric-subtext">Projected 6-12 month return</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {min(100, abs(longterm_gain))}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col_m3:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Demand Tier</div>
                <div class="metric-value" style="color: {demand_color};">{total_sub:.1f}x</div>
                <div class="metric-subtext">
                    <span class="tag-badge" style="background: {demand_color}; color: white;">{demand_tier}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {min(100, total_sub)}%; background: {demand_color};"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        col_m4, col_m5 = st.columns(2)
        
        with col_m4:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Financial Strength</div>
                <div class="metric-value" style="color: #8b5cf6;">{financial_rating:.1f}/10</div>
                <div class="metric-subtext">Fundamental analysis score</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {financial_rating * 10}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col_m5:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">PE Valuation</div>
                <div class="metric-value" style="color: #3b82f6;">{pe_score:.1f}/10</div>
                <div class="metric-subtext">Pricing efficiency score</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {pe_score * 10}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        # Recommendation
        st.markdown(f"""
        <div class="info-box" style="margin-top: 2rem;">
            <strong>💡 Investment Recommendation</strong><br>
            {recommendation}
        </div>
        """, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# VIEW: Ongoing IPOs
# -----------------------------------------------------------------------------
if st.session_state.active_view == "📈 Ongoing IPOs":
    st.markdown("### 🔜 Ongoing IPOs (2026)")
    
    for ipo in ONGOING_IPOS_2026:
        st.markdown(f'<div class="metric-card" style="border-left: 4px solid #f59e0b;">', unsafe_allow_html=True)
        col_list1, col_list2 = st.columns([3, 1])
        with col_list1:
            st.markdown(f"""
            <h3 style="color: #60a5fa; margin: 0;">{ipo['name']} ({ipo['symbol']})</h3>
            <p style="color: #94a3b8; margin: 0.5rem 0;">
                📅 <strong>Opens:</strong> {ipo['date']} | 
                💰 <strong>Size:</strong> ₹{ipo['size_cr']} Cr | 
                🏷️ <strong>Price:</strong> ₹{ipo['price_range']}
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span class="tag-badge" style="background: #1e293b; color: #94a3b8; font-size: 0.8rem;">PE: {ipo['details']['pe']}</span>
                <span class="tag-badge" style="background: #1e293b; color: #94a3b8; font-size: 0.8rem;">ROE: {ipo['details']['roe']}%</span>
                <span class="tag-badge" style="background: #1e293b; color: #94a3b8; font-size: 0.8rem;">Rev: ₹{ipo['details']['revenue']}Cr</span>
            </div>
            """, unsafe_allow_html=True)
        
        with col_list2:
            st.markdown("<br>", unsafe_allow_html=True)
            st.button("🔍 Analyze", 
                     key=f"btn_up_{ipo['symbol']}",
                     on_click=set_analysis_params,
                     args=({
                        'name': ipo['name'],
                        'qib': ipo['details']['qib'],
                        'nii': ipo['details']['nii'],
                        'retail': ipo['details']['retail'],
                        'total': ipo['details']['total'],
                        'issue_size': ipo['details']['issue_size'],
                        'pe': ipo['details']['pe'],
                        'revenue': ipo['details']['revenue'],
                        'pat': ipo['details']['pat'],
                        'roe': ipo['details']['roe'],
                        'roce': ipo['details']['roce'],
                        'margin': ipo['details']['margin'],
                        'growth': ipo['details']['growth']
                    },))
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# VIEW: Closed IPOs
# -----------------------------------------------------------------------------
if st.session_state.active_view == "✅ Closed IPOs":
    st.markdown("### ✅ Closed IPOs (2026)")
    
    for ipo in CLOSED_IPOS_2026:
        gain_color = "#10b981" if ipo['gain'] > 0 else "#ef4444"
        st.markdown(f'<div class="metric-card" style="border-left: 4px solid {gain_color};">', unsafe_allow_html=True)
        col_list1, col_list2 = st.columns([3, 1])
        with col_list1:
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between;">
                <h3 style="color: #ffffff; margin: 0;">{ipo['name']} ({ipo['symbol']})</h3>
                <span style="color: {gain_color}; font-weight: bold; font-size: 1.2rem;">{ipo['gain']}%</span>
            </div>
            <p style="color: #94a3b8; margin: 0.5rem 0;">
                📅 <strong>Listed:</strong> {ipo['listing_date']} | 
                💰 <strong>Issue Price:</strong> ₹{ipo['price']} | 
                📈 <strong>Listing Price:</strong> ₹{ipo['listing_price']}
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span class="tag-badge" style="background: #1e293b; color: #94a3b8; font-size: 0.8rem;">Sub: {ipo['details']['total']}x</span>
                <span class="tag-badge" style="background: #1e293b; color: #94a3b8; font-size: 0.8rem;">QIB: {ipo['details']['qib']}x</span>
            </div>
            """, unsafe_allow_html=True)
        
        with col_list2:
            st.markdown("<br>", unsafe_allow_html=True)
            st.button("📊 Re-Analyze", 
                     key=f"btn_closed_{ipo['symbol']}",
                     on_click=set_analysis_params,
                     args=({
                        'name': ipo['name'],
                        'qib': ipo['details']['qib'],
                        'nii': ipo['details']['nii'],
                        'retail': ipo['details']['retail'],
                        'total': ipo['details']['total'],
                        'issue_size': ipo['details']['issue_size'],
                        'pe': ipo['details']['pe'],
                        'revenue': ipo['details']['revenue'],
                        'pat': ipo['details']['pat'],
                        'roe': ipo['details']['roe'],
                        'roce': ipo['details']['roce'],
                        'margin': ipo['details']['margin'],
                        'growth': ipo['details']['growth']
                    },))
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# VIEW: Search Past IPOs
# -----------------------------------------------------------------------------
if st.session_state.active_view == "🔍 Search Past IPOs":
    st.markdown("### 🔍 Search Past IPOs (2023-2025)")
    
    try:
        # Load Main Database
        df_master = pd.read_csv('data/IPO_MasterDB.csv')
        df_master['Year'] = pd.to_datetime(df_master['Listing_Date']).dt.year
        
        # Search Box
        search_query = st.selectbox("Select Company", options=df_master['Company'].unique(), index=None, placeholder="Type to search...")
        
        if search_query:
            row = df_master[df_master['Company'] == search_query].iloc[0]
            
            # Cleaning helpers (reused from training logic roughly)
            def clean_val(v):
                if isinstance(v, str): return float(v.replace('%','').replace(',','').replace('Rs.','').strip())
                return float(v)
            
            # Extract data
            try:
                qib_val = clean_val(row['QIB_(x)'])
                nii_val = clean_val(row['NII_(x)'])
                ret_val = clean_val(row['Retail_(x)'])
                tot_val = clean_val(row['Total_(x)'])
                issue_val = clean_val(row['Issue_Amount_(Rs.cr.)'])
                pe_val = clean_val(row['P/E_(x)_Pre-IPO']) if pd.notna(row['P/E_(x)_Pre-IPO']) else 0
                rev_val = clean_val(row['Revenue_(Rs.cr.)'])
                pat_val = clean_val(row['Profit_After_Tax_(Rs.cr.)'])
                roe_val = clean_val(row['ROE'])
                roce_val = clean_val(row['ROCE'])
                marg_val = clean_val(row['PAT_Margin_%'])
                
                # Predict Listing Gain using AI Model (Model 1)
                pred_gain, _ = predict_listing_gain(qib_val, nii_val, ret_val, tot_val, issue_val, model1)
                actual_gain = float(row['%_Gain_/_Loss_(Issue_price_v/s_Close_price_on_Listing)'])
                
                diff = pred_gain - actual_gain
                
                # Display Summary with AI Prediction
                col_res1, col_res2 = st.columns([2, 1])
                with col_res1:
                    st.info(f"""
                    **{row['Company']}** (Listed: {row['Listing_Date']})  
                    Issue Size: ₹{issue_val} Cr | Offer Price: ₹{row['Issue_Price_(Rs.)']}  
                    Total Subscription: {tot_val}x
                    """)
                
                with col_res2:
                    st.markdown(f"""
                    <div style="background: {'#10b98122' if actual_gain>0 else '#ef444422'}; padding: 10px; border-radius: 8px; border: 1px solid {'#10b981' if actual_gain>0 else '#ef4444'}; text-align: center;">
                        <small>Actual Gain</small><br>
                        <strong style="font-size: 1.2rem; color: {'#10b981' if actual_gain>0 else '#ef4444'};">{actual_gain}%</strong>
                    </div>
                    <div style="margin-top: 5px; background: #3b82f622; padding: 10px; border-radius: 8px; border: 1px solid #3b82f6; text-align: center;">
                        <small>AI Predicted</small><br>
                        <strong style="font-size: 1.2rem; color: #3b82f6;">{pred_gain:.1f}%</strong>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.button("🚀 Analyze with AI Models",
                         on_click=set_analysis_params,
                         args=({
                            'name': row['Company'],
                            'actual_gain': actual_gain, # Pass actual gain too
                            'qib': qib_val,
                            'nii': nii_val,
                            'retail': ret_val,
                            'total': tot_val,
                            'issue_size': issue_val,
                            'pe': pe_val,
                            'revenue': rev_val,
                            'pat': pat_val,
                            'roe': roe_val,
                            'roce': roce_val,
                            'margin': marg_val,
                            'growth': 15.0 # default assumption if missing
                        },))
                     
            except Exception as e:
                st.error(f"Error parsing data for this IPO: {e}")

    except Exception as e:
        st.error(f"Could not load IPO Database: {e}")
        
    st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# VIEW: Model Performance
# -----------------------------------------------------------------------------
if st.session_state.active_view == "🧪 Model Performance":
    st.markdown("### 🧪 Model Performance (Test Set)", unsafe_allow_html=True)
    
    try:
        # Load test predictions
        test_results = pd.read_csv('data/test_predictions.csv')
        
        # Calculate metrics
        mae_listing = np.mean(np.abs(test_results['Actual_Listing_Gain'] - test_results['Predicted_Listing_Gain']))
        
        col_p1, col_p2 = st.columns(2)
        
        with col_p1:
             st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Test Set MAE</div>
                <div class="metric-value" style="color: #3b82f6;">{mae_listing:.2f}%</div>
                <div class="metric-subtext">Mean Absolute Error (Listing Gain)</div>
            </div>
            """, unsafe_allow_html=True)
            
        with col_p2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Test Samples</div>
                <div class="metric-value" style="color: #8b5cf6;">{len(test_results)}</div>
                <div class="metric-subtext">20% of Total Dataset</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Actual vs Predicted Plot
        st.markdown("#### 📉 Actual vs Predicted Listing Gain")
        
        chart_data = test_results[['Actual_Listing_Gain', 'Predicted_Listing_Gain']]
        st.scatter_chart(chart_data)
        
        # Data Table
        st.markdown("#### 📋 Detailed Test Results")
        st.dataframe(test_results, use_container_width=True)
        
    except FileNotFoundError:
        st.warning("⚠️ Test results file not found. Please retrain models to generate performance data.")
    except Exception as e:
        st.error(f"⚠️ Error loading updated results: {e}")
        
    st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("<br><br>", unsafe_allow_html=True)
st.markdown("""
<div style="text-align: center; color: #64748b; padding: 2rem; border-top: 1px solid rgba(59, 130, 246, 0.2);">
    <p style="font-family: 'Space Mono', monospace;">IPO TraQ v1.0 | Powered by AI | © 2026</p>
    <p style="font-size: 0.9rem;">Hybrid ML Models: Linear Regression + Random Forest + Gradient Boosting</p>
</div>
""", unsafe_allow_html=True)