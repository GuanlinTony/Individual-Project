"""
Aegis Nexus — Interactive CLV & Unit Economics Dashboard
========================================================
Built by Tony Chen for RSM 8542 Individual Project (Spring 2026).

This Streamlit app is a live, interactive version of the CLV simulation in
`Marketing_Individual.ipynb`. All core assumptions (tier mix, prices, retention,
CAC, infrastructure costs, discount rate) are exposed as sidebar controls so a
reader can stress-test the launch plan's key decisions in real time.

Model recap (matches notebook Section 4):
    monthly_margin = monthly_price - monthly_infrastructure_cost
    CLV = monthly_margin / (1 - retention / (1 + discount_rate))
    Max sustainable CAC = CLV

Run locally:
    streamlit run app.py

Deploy publicly (free):
    Push this folder to a public GitHub repo, then connect it at
    https://share.streamlit.io — Streamlit Community Cloud builds and hosts
    the app at a shareable URL (e.g. https://<repo>.streamlit.app).
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
import streamlit as st

# ──────────────────────────────────────────────────────────────────────────────
# Page configuration & styling
# ──────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Aegis Nexus · CLV Dashboard",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Cloud-gaming palette — deep space base with electric cyan / neon gold / violet accents
PALETTE = {
    "navy":   "#0B2545",   # kept for data references
    "steel":  "#13315C",
    "gold":   "#F0B429",   # warmer neon gold
    "teal":   "#00C8B8",   # electric teal
    "rose":   "#FF4D6D",   # vivid rose/alert
    "light":  "#E6EDF5",
    "dgrey":  "#C8DDEF",   # unified body text — light silver-blue, clearly distinct from dark bg
    # New accents
    "cyan":   "#00D4FF",
    "violet": "#7B2FFF",
    "bg":     "#060C1C",   # near-black deep-space background
}
TIER_COLORS = {"Premium": PALETTE["gold"], "Basic": PALETTE["teal"]}

# Global Plotly dark/gaming template — applied to every chart automatically
_aegis_template = go.layout.Template(
    layout=go.Layout(
        paper_bgcolor="rgba(6,12,28,0)",
        plot_bgcolor="rgba(6,12,28,0)",
        font=dict(color="#C8DDEF"),
        xaxis=dict(
            gridcolor="rgba(0,180,255,0.12)",
            color="#C8DDEF",
            linecolor="rgba(0,180,255,0.20)",
            zerolinecolor="rgba(0,180,255,0.18)",
        ),
        yaxis=dict(
            gridcolor="rgba(0,180,255,0.12)",
            color="#C8DDEF",
            linecolor="rgba(0,180,255,0.20)",
            zerolinecolor="rgba(0,180,255,0.18)",
        ),
    )
)
pio.templates["aegis"] = _aegis_template
pio.templates.default = "aegis"

# ── Injected CSS: dark cloud-gaming theme ─────────────────────────────────────
st.markdown(
    f"""
    <style>
    /* ── App-wide dark background ── */
    [data-testid="stAppViewContainer"] {{
        background:
            radial-gradient(ellipse at 12% 38%, rgba(20,80,220,0.18) 0%, transparent 52%),
            radial-gradient(ellipse at 88% 14%, rgba(120,20,240,0.14) 0%, transparent 44%),
            radial-gradient(ellipse at 58% 82%, rgba(0,180,200,0.12) 0%, transparent 48%),
            linear-gradient(160deg, #050a18 0%, #08112a 55%, #060c1e 100%);
        background-attachment: fixed;
    }}

    /* ── Animated network-grid overlay (suggests cloud topology) ── */
    [data-testid="stAppViewContainer"]::before {{
        content: '';
        position: fixed;
        inset: -60px 0 0 0;
        background-image:
            linear-gradient(rgba(0,190,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,190,255,0.045) 1px, transparent 1px);
        background-size: 64px 64px;
        animation: netScroll 22s linear infinite;
        pointer-events: none;
        z-index: 0;
    }}
    @keyframes netScroll {{
        from {{ background-position: 0 0;   }}
        to   {{ background-position: 0 64px; }}
    }}

    /* ── Node-dot pulse at grid intersections ── */
    [data-testid="stAppViewContainer"]::after {{
        content: '';
        position: fixed;
        inset: 0;
        background-image: radial-gradient(circle, rgba(0,190,255,0.22) 1.2px, transparent 1.2px);
        background-size: 64px 64px;
        animation: nodePulse 5s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
    }}
    @keyframes nodePulse {{
        0%, 100% {{ opacity: 0.30; }}
        50%       {{ opacity: 0.80; }}
    }}

    /* ── Glass content panel ── */
    .main .block-container {{
        position: relative;
        z-index: 1;
        padding-top: 1.5rem;
        padding-bottom: 2rem;
        max-width: 1400px;
        background: rgba(6, 12, 28, 0.62) !important;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-radius: 18px;
        border: 1px solid rgba(0,180,255,0.12);
    }}

    /* ── Headers ── */
    h1 {{
        color: {PALETTE["cyan"]} !important;
        text-shadow: 0 0 28px rgba(0,212,255,0.45);
    }}
    h2, h3 {{ color: #C8DDEF !important; }}

    /* ── KPI metric cards ── */
    [data-testid="stMetric"] {{
        background: rgba(0, 30, 70, 0.65) !important;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid rgba(0,180,255,0.22) !important;
        border-left: 4px solid {PALETTE["cyan"]} !important;
        backdrop-filter: blur(8px);
        box-shadow: 0 0 22px rgba(0,180,255,0.09), inset 0 1px 0 rgba(255,255,255,0.04);
        transition: box-shadow 0.3s ease;
    }}
    [data-testid="stMetric"]:hover {{
        box-shadow: 0 0 38px rgba(0,180,255,0.22), inset 0 1px 0 rgba(255,255,255,0.07);
    }}
    div[data-testid="stMetricValue"] {{ color: {PALETTE["cyan"]} !important; font-weight: 700; }}
    div[data-testid="stMetricLabel"] {{ color: {PALETTE["dgrey"]} !important; font-size: 0.85rem; }}

    /* ── Sidebar ── */
    section[data-testid="stSidebar"] {{
        background: linear-gradient(180deg, #04091a 0%, #070d22 100%) !important;
        border-right: 1px solid rgba(0,180,255,0.18) !important;
    }}
    section[data-testid="stSidebar"] label,
    section[data-testid="stSidebar"] p,
    section[data-testid="stSidebar"] span {{
        color: #C8DDEF !important;
    }}
    section[data-testid="stSidebar"] h2 {{
        color: {PALETTE["cyan"]} !important;
    }}

    /* ── Tabs ── */
    [data-testid="stTabs"] [role="tab"] {{
        color: #C8DDEF !important;
        border-color: rgba(0,150,255,0.15) !important;
    }}
    [data-testid="stTabs"] [role="tab"][aria-selected="true"] {{
        color: {PALETTE["cyan"]} !important;
        border-bottom: 2px solid {PALETTE["cyan"]} !important;
        background: rgba(0,100,200,0.14) !important;
    }}

    /* ── Divider ── */
    hr {{ border-color: rgba(0,180,255,0.18) !important; }}

    /* ── Callout block ── */
    .block-note {{
        background: rgba(0, 40, 90, 0.70);
        border-left: 4px solid {PALETTE["gold"]};
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 0.9rem;
        color: #C8DDEF;
        backdrop-filter: blur(6px);
    }}
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Fixed background: floating orbs + streaming data-packet lines ──────────────
st.markdown(
    """
    <div id="aegis-bg-layer" style="
        position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden;">

      <!-- Floating colour orbs -->
      <div style="position:absolute;width:520px;height:520px;
           background:radial-gradient(circle,rgba(0,100,255,0.13) 0%,transparent 70%);
           border-radius:50%;top:5%;left:3%;
           animation:orb1 18s ease-in-out infinite;"></div>
      <div style="position:absolute;width:380px;height:380px;
           background:radial-gradient(circle,rgba(110,0,255,0.11) 0%,transparent 70%);
           border-radius:50%;bottom:12%;right:6%;
           animation:orb2 24s ease-in-out infinite;"></div>
      <div style="position:absolute;width:300px;height:300px;
           background:radial-gradient(circle,rgba(0,200,180,0.09) 0%,transparent 70%);
           border-radius:50%;top:45%;left:55%;
           animation:orb3 20s ease-in-out infinite;"></div>
      <div style="position:absolute;width:200px;height:200px;
           background:radial-gradient(circle,rgba(240,180,0,0.08) 0%,transparent 70%);
           border-radius:50%;top:70%;left:25%;
           animation:orb4 16s ease-in-out infinite;"></div>

      <!-- Horizontal streaming data-packet lines -->
      <div class="sline" style="top:18%;width:240px;animation-delay:0s;"></div>
      <div class="sline" style="top:33%;width:180px;animation-delay:2.2s;"></div>
      <div class="sline" style="top:52%;width:310px;animation-delay:1.0s;"></div>
      <div class="sline" style="top:67%;width:200px;animation-delay:3.5s;"></div>
      <div class="sline" style="top:82%;width:260px;animation-delay:0.7s;"></div>
    </div>

    <style>
      @keyframes orb1 {
        0%,100% { transform:translate(0,0) scale(1);    opacity:.7; }
        33%      { transform:translate(70px,-50px) scale(1.12); opacity:1; }
        66%      { transform:translate(-40px,60px) scale(.94);  opacity:.75; }
      }
      @keyframes orb2 {
        0%,100% { transform:translate(0,0) scale(1);      opacity:.55; }
        40%      { transform:translate(-90px,-70px) scale(1.18); opacity:.85; }
        70%      { transform:translate(55px,45px) scale(.9);    opacity:.6; }
      }
      @keyframes orb3 {
        0%,100% { transform:translate(0,0) scale(1);   opacity:.5; }
        50%      { transform:translate(80px,65px) scale(1.22); opacity:.8; }
      }
      @keyframes orb4 {
        0%,100% { transform:translate(0,0) scale(1);     opacity:.45; }
        45%      { transform:translate(-60px,-45px) scale(1.15); opacity:.75; }
      }

      /* Streaming data-packet line */
      .sline {
        position:absolute; left:-320px; height:2px;
        background:linear-gradient(90deg,transparent,rgba(0,210,255,0.5),rgba(0,210,255,0.9),rgba(0,210,255,0.5),transparent);
        border-radius:2px;
        animation:streamFlow 7s linear infinite;
      }
      @keyframes streamFlow {
        from { transform:translateX(0);       opacity:0; }
        5%   { opacity:1; }
        92%  { opacity:1; }
        to   { transform:translateX(130vw);  opacity:0; }
      }
    </style>
    """,
    unsafe_allow_html=True,
)

# ──────────────────────────────────────────────────────────────────────────────
# Header
# ──────────────────────────────────────────────────────────────────────────────
st.title("Aegis Nexus — CLV & Unit Economics Dashboard")
st.markdown(
    f"""
    <div style="color:{PALETTE['dgrey']}; font-size:1.02rem; margin-bottom:1rem;">
    Interactive companion to the RSM 8542 launch plan.
    Aegis Nexus is an <b>AI-enabled cloud asset-streaming platform</b> — it runs game
    logic locally and streams only textures, audio, and geometry on demand,
    dramatically shrinking install size for mid-range smartphones and storage-constrained
    PC gamers. Adjust the sidebar controls to re-run the 100k-user CLV simulation live
    and stress-test the launch decisions.
    </div>
    """,
    unsafe_allow_html=True,
)

# ──────────────────────────────────────────────────────────────────────────────
# Sidebar controls — mirror Cell 1 of the notebook
# ──────────────────────────────────────────────────────────────────────────────
st.sidebar.header("⚙️ Simulation Controls")

with st.sidebar.expander("Scale & discounting", expanded=True):
    n_users = st.slider("Number of simulated users", 10_000, 200_000, 100_000, 10_000,
                         help="Larger n → more stable segment estimates; small n → faster re-run.")
    monthly_discount = st.slider("Monthly discount rate (%)", 0.0, 3.0, 1.0, 0.1,
                                  help="1%/month ≈ 12.7% annual. Reflects early-stage risk.") / 100
    payback_horizon = st.slider("Payback evaluation horizon (months)", 12, 60, 36, 6)
    seed = st.number_input("Random seed", value=42, step=1,
                            help="Change to draw a different synthetic dataset.")

with st.sidebar.expander("Tier mix & pricing", expanded=True):
    premium_share = st.slider("Premium tier share (%)", 10, 60, 28, 1) / 100
    basic_price = st.slider("Basic monthly price ($)", 5.0, 20.0, 11.99, 0.5)
    premium_price = st.slider("Premium monthly price ($)", 10.0, 30.0, 18.99, 0.5)

with st.sidebar.expander("Activity mix", expanded=False):
    light_share = st.slider("Light user share (%)", 10, 60, 35, 1) / 100
    medium_share = st.slider("Medium user share (%)", 10, 70, 45, 1) / 100
    heavy_share = max(0.01, 1 - light_share - medium_share)
    st.caption(f"Heavy user share = **{heavy_share:.0%}** (auto-balanced)")

with st.sidebar.expander("Retention shocks", expanded=False):
    retention_shift = st.slider(
        "Retention shift (percentage points)", -5.0, 5.0, 0.0, 0.5,
        help="Applied uniformly to all segments. −3pp reproduces the notebook's pessimistic scenario.",
    ) / 100

with st.sidebar.expander("Cost & CAC", expanded=False):
    infra_multiplier = st.slider(
        "Infrastructure cost multiplier", 0.70, 1.50, 1.00, 0.05,
        help="1.20 reproduces the notebook's infra cost shock scenario.",
    )
    cac_multiplier = st.slider("CAC multiplier", 0.70, 1.50, 1.00, 0.05)

with st.sidebar.expander("Launch decision thresholds", expanded=False):
    clv_cac_priority = st.slider(
        "CLV:CAC floor — Priority (×)", 1.5, 3.5, 2.0, 0.1,
        help="Human-set guardrail. Segments above this become Priority acquisition targets.",
    )
    clv_cac_secondary = st.slider(
        "CLV:CAC floor — Secondary (×)", 1.0, float(clv_cac_priority), 1.5, 0.1,
    )
    cac_ratio_priority = st.slider(
        "AI bid ceiling — Priority (CLV × ratio)", 0.30, 0.70, 0.50, 0.05,
    )
    cac_ratio_secondary = st.slider(
        "AI bid ceiling — Secondary (CLV × ratio)", 0.20, 0.50, 0.35, 0.05,
    )

st.sidebar.markdown("---")
if st.sidebar.button("↺ Reset to base case"):
    # Streamlit reruns on widget change — the simplest reset is to rerun with default URL
    st.rerun()

# ──────────────────────────────────────────────────────────────────────────────
# Simulation engine (cached so only re-runs when inputs change)
# ──────────────────────────────────────────────────────────────────────────────
@st.cache_data(show_spinner=False)
def simulate_users(
    n_users: int,
    seed: int,
    premium_share: float,
    basic_price: float,
    premium_price: float,
    light_share: float,
    medium_share: float,
    heavy_share: float,
    retention_shift: float,
    infra_multiplier: float,
    cac_multiplier: float,
    monthly_discount: float,
    payback_horizon: int,
) -> pd.DataFrame:
    """Re-implements Cells 1–5 of the notebook, vectorised."""
    rng = np.random.default_rng(seed)

    tier_mix = {"Basic": 1 - premium_share, "Premium": premium_share}
    tier_price = {"Basic": basic_price, "Premium": premium_price}
    activity_mix = {"Light": light_share, "Medium": medium_share, "Heavy": heavy_share}

    # Segment-level base parameters (identical to notebook Cell 1) ─────────────
    base_retention = {
        ("Basic", "Light"): 0.79, ("Basic", "Medium"): 0.84, ("Basic", "Heavy"): 0.88,
        ("Premium", "Light"): 0.83, ("Premium", "Medium"): 0.88, ("Premium", "Heavy"): 0.92,
    }
    retention_sd = {"Light": 0.020, "Medium": 0.018, "Heavy": 0.015}
    cac_mean = {"Basic": 27.0, "Premium": 35.0}
    cac_sd = {"Basic": 6.0, "Premium": 7.5}
    infra_cost_mean = {
        ("Basic", "Light"): 3.0, ("Basic", "Medium"): 4.6, ("Basic", "Heavy"): 6.4,
        ("Premium", "Light"): 4.8, ("Premium", "Medium"): 6.8, ("Premium", "Heavy"): 9.4,
    }
    infra_cost_sd = {"Light": 0.45, "Medium": 0.65, "Heavy": 0.90}

    # Draw categorical variables
    users = pd.DataFrame({
        "user_id": np.arange(1, n_users + 1),
        "subscription_tier": rng.choice(list(tier_mix.keys()), size=n_users, p=list(tier_mix.values())),
        "activity_level": rng.choice(list(activity_mix.keys()), size=n_users, p=list(activity_mix.values())),
    })
    users["monthly_price"] = users["subscription_tier"].map(tier_price)

    tier_arr = users["subscription_tier"].to_numpy()
    act_arr = users["activity_level"].to_numpy()

    ret_mean_arr = np.array([base_retention[(t, a)] + retention_shift for t, a in zip(tier_arr, act_arr)])
    ret_sd_arr = np.array([retention_sd[a] for a in act_arr])
    cac_mean_arr = np.array([cac_mean[t] * cac_multiplier for t in tier_arr])
    cac_sd_arr = np.array([cac_sd[t] * cac_multiplier for t in tier_arr])
    infra_mean_arr = np.array([infra_cost_mean[(t, a)] * infra_multiplier for t, a in zip(tier_arr, act_arr)])
    infra_sd_arr = np.array([infra_cost_sd[a] * infra_multiplier for a in act_arr])

    users["monthly_retention_prob"] = np.clip(rng.normal(ret_mean_arr, ret_sd_arr), 0.65, 0.97)
    users["cac"] = np.clip(rng.normal(cac_mean_arr, cac_sd_arr), 8.00, None)
    users["monthly_infrastructure_cost"] = np.clip(rng.normal(infra_mean_arr, infra_sd_arr), 1.00, None)

    # Derived economics ────────────────────────────────────────────────────────
    users["gross_margin_per_month"] = users["monthly_price"] - users["monthly_infrastructure_cost"]
    survival_factor = users["monthly_retention_prob"] / (1 + monthly_discount)
    # Guard against degenerate draws where survival_factor ≥ 1
    users["clv"] = np.where(
        survival_factor < 0.999,
        users["gross_margin_per_month"] / (1 - survival_factor),
        users["gross_margin_per_month"] * payback_horizon,
    )
    # Only count positive-margin users in profit calculations
    users["clv"] = users["clv"].clip(lower=0)
    users["net_clv_after_cac"] = users["clv"] - users["cac"]
    users["clv_to_cac_ratio"] = users["clv"] / users["cac"]
    users["expected_lifetime_months"] = 1 / (1 - users["monthly_retention_prob"])

    # Vectorised discounted payback ────────────────────────────────────────────
    months = np.arange(1, payback_horizon + 1)
    r = users["monthly_retention_prob"].to_numpy()[:, None]
    m = users["gross_margin_per_month"].to_numpy()[:, None]
    cac = users["cac"].to_numpy()[:, None]
    # Discount factor: margin in month t = m * (r / (1+d))^(t-1)
    factor = (r / (1 + monthly_discount)) ** (months - 1)
    monthly_cash = np.where(m > 0, m * factor, 0.0)
    cum_cash = monthly_cash.cumsum(axis=1)
    reached = cum_cash >= cac
    first_reached = np.where(reached.any(axis=1), reached.argmax(axis=1) + 1, np.nan)
    users["payback_months"] = first_reached

    return users


# ──────────────────────────────────────────────────────────────────────────────
# Run simulation
# ──────────────────────────────────────────────────────────────────────────────
with st.spinner("Running simulation…"):
    users = simulate_users(
        n_users=n_users,
        seed=int(seed),
        premium_share=premium_share,
        basic_price=basic_price,
        premium_price=premium_price,
        light_share=light_share,
        medium_share=medium_share,
        heavy_share=heavy_share,
        retention_shift=retention_shift,
        infra_multiplier=infra_multiplier,
        cac_multiplier=cac_multiplier,
        monthly_discount=monthly_discount,
        payback_horizon=payback_horizon,
    )

# ──────────────────────────────────────────────────────────────────────────────
# Headline KPIs
# ──────────────────────────────────────────────────────────────────────────────
avg_clv = users["clv"].mean()
avg_cac = users["cac"].mean()
avg_net_clv = users["net_clv_after_cac"].mean()
avg_ratio = users["clv_to_cac_ratio"].mean()
pct_12m = users["payback_months"].le(12).mean()

k1, k2, k3, k4, k5 = st.columns(5)
k1.metric("Avg CLV (contribution-margin)", f"${avg_clv:,.2f}")
k2.metric("Avg CAC", f"${avg_cac:,.2f}")
k3.metric("Avg Net CLV after CAC", f"${avg_net_clv:,.2f}",
          delta=f"{avg_net_clv/avg_cac*100:.0f}% of CAC" if avg_cac > 0 else None)
k4.metric("Avg CLV:CAC", f"{avg_ratio:.2f}×",
          delta=f"Floor = {clv_cac_priority:.1f}×",
          delta_color="normal" if avg_ratio >= clv_cac_priority else "inverse")
k5.metric("Pay back ≤12 mo", f"{pct_12m:.1%}")

st.markdown("---")

# ──────────────────────────────────────────────────────────────────────────────
# Tabs — organise analytics modules
# ──────────────────────────────────────────────────────────────────────────────
tab_overview, tab_segments, tab_targeting, tab_sensitivity, tab_data = st.tabs([
    "📊 Overview",
    "🧩 Segments",
    "🎯 Targeting Decision",
    "🌡️ Sensitivity",
    "📥 Data",
])

# ── Tab 1: Overview ───────────────────────────────────────────────────────────
with tab_overview:
    c1, c2 = st.columns([3, 2])

    with c1:
        st.subheader("Distribution of Simulated CLV")
        fig = px.histogram(
            users, x="clv", nbins=60, color="subscription_tier",
            color_discrete_map=TIER_COLORS,
            labels={"clv": "Contribution-Margin CLV ($)", "subscription_tier": "Tier"},
            opacity=0.85,
        )
        fig.add_vline(
            x=avg_clv, line_dash="dash", line_color=PALETTE["rose"], line_width=2,
            annotation_text=f"Mean = ${avg_clv:.0f}",
            annotation_position="top right",
        )
        fig.update_layout(
            height=420, bargap=0.05, plot_bgcolor="rgba(6,12,28,0)",
            legend=dict(orientation="h", y=1.12, x=0),
            margin=dict(t=50, b=40, l=10, r=10),
        )
        fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        st.subheader("Portfolio economics")
        econ_df = pd.DataFrame({
            "Metric": [
                "Users simulated", "Portfolio avg monthly price",
                "Portfolio avg monthly margin", "Avg monthly retention",
                "Avg expected lifetime", "Avg payback (users who recover)",
                "Share never paying back in horizon",
            ],
            "Value": [
                f"{len(users):,}",
                f"${users['monthly_price'].mean():.2f}",
                f"${users['gross_margin_per_month'].mean():.2f}",
                f"{users['monthly_retention_prob'].mean():.1%}",
                f"{users['expected_lifetime_months'].mean():.1f} months",
                (f"{users['payback_months'].dropna().mean():.1f} months"
                 if users['payback_months'].notna().any() else "n/a"),
                f"{users['payback_months'].isna().mean():.1%}",
            ],
        })
        st.dataframe(econ_df, hide_index=True, use_container_width=True)

        st.markdown(
            f"""
            <div class="block-note">
            <b>Launch guardrail:</b> the maximum sustainable CAC at this configuration is
            approximately <b>${avg_clv:,.0f}/user</b>. Spending above this level requires
            either higher retention or lower infrastructure costs to remain profitable.
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.subheader("Payback curve")
    # Share of users who have paid back by month t
    payback_series = users["payback_months"].dropna()
    months = np.arange(1, payback_horizon + 1)
    share = np.array([(payback_series <= t).mean() for t in months])
    pay_fig = go.Figure()
    pay_fig.add_trace(go.Scatter(
        x=months, y=share * 100, mode="lines", line=dict(color=PALETTE["cyan"], width=3),
        fill="tozeroy", fillcolor="rgba(0,180,255,0.10)",
        name="Cumulative payback share",
    ))
    pay_fig.add_hline(y=50, line_dash="dot", line_color=PALETTE["dgrey"])
    pay_fig.update_layout(
        height=340, plot_bgcolor="rgba(6,12,28,0)", showlegend=False,
        xaxis_title="Months since acquisition",
        yaxis_title="% of cohort paid back",
        margin=dict(t=20, b=40, l=10, r=10),
    )
    pay_fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); pay_fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)", range=[0, 101])
    st.plotly_chart(pay_fig, use_container_width=True)

# ── Tab 2: Segments ───────────────────────────────────────────────────────────
with tab_segments:
    st.subheader("Unit economics by segment (tier × activity)")

    seg = (
        users.groupby(["subscription_tier", "activity_level"])
        .agg(
            users=("user_id", "count"),
            avg_retention=("monthly_retention_prob", "mean"),
            avg_margin=("gross_margin_per_month", "mean"),
            avg_cac=("cac", "mean"),
            avg_clv=("clv", "mean"),
            avg_net_clv=("net_clv_after_cac", "mean"),
            avg_clv_cac=("clv_to_cac_ratio", "mean"),
            avg_payback=("payback_months", "mean"),
            pct_payback_12m=("payback_months", lambda x: x.le(12).mean()),
        )
        .reset_index()
        .sort_values("avg_clv", ascending=False)
    )
    seg["segment"] = seg["subscription_tier"] + " | " + seg["activity_level"]

    c1, c2 = st.columns(2)

    with c1:
        # Horizontal bar of CLV by segment
        fig = px.bar(
            seg.sort_values("avg_clv"),
            x="avg_clv", y="segment", orientation="h",
            color="subscription_tier", color_discrete_map=TIER_COLORS,
            labels={"avg_clv": "Avg CLV ($)", "segment": "", "subscription_tier": "Tier"},
            text=seg.sort_values("avg_clv")["avg_clv"].apply(lambda v: f"${v:,.0f}"),
        )
        fig.update_traces(textposition="outside")
        fig.update_layout(
            title="Avg CLV by segment",
            height=400, plot_bgcolor="rgba(6,12,28,0)",
            margin=dict(t=50, b=40, l=10, r=10),
            legend=dict(orientation="h", y=-0.15),
        )
        fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        # CLV:CAC with priority thresholds overlaid
        fig = px.bar(
            seg.sort_values("avg_clv_cac"),
            x="avg_clv_cac", y="segment", orientation="h",
            color="subscription_tier", color_discrete_map=TIER_COLORS,
            labels={"avg_clv_cac": "CLV : CAC ratio", "segment": "", "subscription_tier": "Tier"},
            text=seg.sort_values("avg_clv_cac")["avg_clv_cac"].apply(lambda v: f"{v:.2f}×"),
        )
        fig.add_vline(x=clv_cac_priority, line_dash="dash", line_color=PALETTE["rose"],
                      annotation_text=f"Priority floor {clv_cac_priority:.1f}×",
                      annotation_position="top")
        fig.add_vline(x=clv_cac_secondary, line_dash="dot", line_color=PALETTE["dgrey"],
                      annotation_text=f"Secondary floor {clv_cac_secondary:.1f}×",
                      annotation_position="bottom")
        fig.update_traces(textposition="outside")
        fig.update_layout(
            title="CLV : CAC by segment",
            height=400, plot_bgcolor="rgba(6,12,28,0)",
            margin=dict(t=50, b=40, l=10, r=10),
            legend=dict(orientation="h", y=-0.15),
        )
        fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
        st.plotly_chart(fig, use_container_width=True)

    # CLV vs CAC scatter — segment-level view of unit economics
    st.subheader("Unit economics landscape")
    scatter = px.scatter(
        seg, x="avg_cac", y="avg_clv",
        size="users", color="subscription_tier", color_discrete_map=TIER_COLORS,
        hover_name="segment",
        hover_data={"avg_clv_cac": ":.2f", "avg_payback": ":.1f",
                    "pct_payback_12m": ":.1%", "users": True},
        labels={"avg_cac": "Avg CAC ($)", "avg_clv": "Avg CLV ($)",
                "subscription_tier": "Tier"},
        size_max=48,
    )
    # Break-even line: CLV = CAC
    max_val = max(seg["avg_cac"].max(), seg["avg_clv"].max()) * 1.1
    scatter.add_trace(go.Scatter(
        x=[0, max_val], y=[0, max_val], mode="lines",
        line=dict(color=PALETTE["dgrey"], dash="dot", width=1.5),
        name="Break-even (CLV = CAC)", hoverinfo="skip",
    ))
    # CLV = 2× CAC line (priority floor)
    scatter.add_trace(go.Scatter(
        x=[0, max_val], y=[0, clv_cac_priority * max_val], mode="lines",
        line=dict(color=PALETTE["rose"], dash="dash", width=1.5),
        name=f"CLV:CAC = {clv_cac_priority:.1f}× (priority)", hoverinfo="skip",
    ))
    scatter.update_layout(
        height=460, plot_bgcolor="rgba(6,12,28,0)",
        margin=dict(t=20, b=40, l=10, r=10),
        legend=dict(orientation="h", y=-0.12),
    )
    scatter.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); scatter.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
    st.plotly_chart(scatter, use_container_width=True)

    st.subheader("Segment summary table")
    display_df = seg.copy()
    display_df["avg_clv"] = display_df["avg_clv"].apply(lambda v: f"${v:,.2f}")
    display_df["avg_cac"] = display_df["avg_cac"].apply(lambda v: f"${v:,.2f}")
    display_df["avg_net_clv"] = display_df["avg_net_clv"].apply(lambda v: f"${v:,.2f}")
    display_df["avg_margin"] = display_df["avg_margin"].apply(lambda v: f"${v:,.2f}")
    display_df["avg_clv_cac"] = display_df["avg_clv_cac"].apply(lambda v: f"{v:.2f}×")
    display_df["avg_retention"] = display_df["avg_retention"].apply(lambda v: f"{v:.1%}")
    display_df["avg_payback"] = display_df["avg_payback"].apply(
        lambda v: f"{v:.1f} mo" if pd.notna(v) else "—"
    )
    display_df["pct_payback_12m"] = display_df["pct_payback_12m"].apply(lambda v: f"{v:.1%}")
    st.dataframe(
        display_df[["segment", "users", "avg_retention", "avg_margin",
                    "avg_cac", "avg_clv", "avg_net_clv", "avg_clv_cac",
                    "avg_payback", "pct_payback_12m"]],
        hide_index=True, use_container_width=True,
    )

# ── Tab 3: Targeting decision ─────────────────────────────────────────────────
with tab_targeting:
    st.subheader("Per-segment targeting decision & CAC bid ceilings")
    st.markdown(
        f"""
        This table translates CLV:CAC ratios into actionable bid guardrails —
        the human sets the CLV:CAC floor in the sidebar; AI bid optimisers
        operate within those ceilings. Mirrors **Cell 8c** of the notebook.
        """
    )

    seg_t = (
        users.groupby(["subscription_tier", "activity_level"])
        .agg(
            avg_clv=("clv", "mean"),
            avg_cac=("cac", "mean"),
            avg_clv_cac=("clv_to_cac_ratio", "mean"),
            avg_payback=("payback_months", "mean"),
        ).reset_index()
    )
    seg_t["segment"] = seg_t["subscription_tier"] + " | " + seg_t["activity_level"]

    def tier_decision(r):
        if r >= clv_cac_priority: return "Priority"
        elif r >= clv_cac_secondary: return "Secondary"
        else: return "Exclude (organic only)"

    def channel(tier):
        if tier == "Priority":
            return "Playable ads (Meta/TikTok) + Google UAC — heavy-gaming genres"
        elif tier == "Secondary":
            return "Social display + retargeting — mid-core gaming audiences"
        return "Organic app store + referral program only"

    def ceiling(row):
        if row["targeting_tier"] == "Priority":
            return round(row["avg_clv"] * cac_ratio_priority, 2)
        elif row["targeting_tier"] == "Secondary":
            return round(row["avg_clv"] * cac_ratio_secondary, 2)
        return 0.0

    seg_t["targeting_tier"] = seg_t["avg_clv_cac"].apply(tier_decision)
    seg_t["max_cac_ceiling"] = seg_t.apply(ceiling, axis=1)
    seg_t["channel"] = seg_t["targeting_tier"].apply(channel)
    seg_t = seg_t.sort_values("avg_clv", ascending=False)

    tier_color_map = {"Priority": PALETTE["gold"], "Secondary": PALETTE["teal"],
                      "Exclude (organic only)": PALETTE["rose"]}

    # Summary counts by decision tier
    dec_counts = seg_t["targeting_tier"].value_counts().reindex(
        ["Priority", "Secondary", "Exclude (organic only)"]).fillna(0).astype(int)
    c1, c2, c3 = st.columns(3)
    c1.metric("Priority segments", int(dec_counts.get("Priority", 0)))
    c2.metric("Secondary segments", int(dec_counts.get("Secondary", 0)))
    c3.metric("Excluded from paid", int(dec_counts.get("Exclude (organic only)", 0)))

    # Visual: CAC ceiling per segment, coloured by decision
    fig = px.bar(
        seg_t.sort_values("max_cac_ceiling"),
        x="max_cac_ceiling", y="segment", orientation="h",
        color="targeting_tier", color_discrete_map=tier_color_map,
        labels={"max_cac_ceiling": "Max AI bid ceiling ($)", "segment": "",
                "targeting_tier": "Decision"},
        text=seg_t.sort_values("max_cac_ceiling")["max_cac_ceiling"].apply(
            lambda v: f"${v:,.2f}"),
        hover_data={"avg_clv": ":.2f", "avg_cac": ":.2f",
                    "avg_clv_cac": ":.2f", "avg_payback": ":.1f"},
    )
    fig.update_traces(textposition="outside")
    fig.update_layout(
        height=420, plot_bgcolor="rgba(6,12,28,0)",
        margin=dict(t=30, b=40, l=10, r=10),
        legend=dict(orientation="h", y=-0.15),
    )
    fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
    st.plotly_chart(fig, use_container_width=True)

    # Decision table
    table_df = seg_t[["segment", "avg_clv", "avg_cac", "avg_clv_cac",
                       "targeting_tier", "max_cac_ceiling", "avg_payback", "channel"]].copy()
    table_df.columns = ["Segment", "Avg CLV", "Avg CAC", "CLV:CAC",
                         "Decision", "Max CAC ceiling", "Avg payback (mo)", "Channel approach"]
    for col in ["Avg CLV", "Avg CAC", "Max CAC ceiling"]:
        table_df[col] = table_df[col].apply(lambda v: f"${v:,.2f}")
    table_df["CLV:CAC"] = table_df["CLV:CAC"].apply(lambda v: f"{v:.2f}×")
    table_df["Avg payback (mo)"] = table_df["Avg payback (mo)"].apply(
        lambda v: f"{v:.1f}" if pd.notna(v) else "—")
    st.dataframe(table_df, hide_index=True, use_container_width=True)

    # Rollout plan
    st.subheader("Phased rollout (gated by CLV:CAC checkpoints)")
    priority_names = seg_t[seg_t["targeting_tier"] == "Priority"]["segment"].tolist()
    secondary_names = seg_t[seg_t["targeting_tier"] == "Secondary"]["segment"].tolist()
    rollout = pd.DataFrame({
        "Phase": ["Phase 1 — MVP", "Phase 2 — Expansion", "Phase 3 — Full Launch"],
        "Timing": ["Months 1–3", "Months 4–9", "Months 10+"],
        "Target segments": [
            priority_names[0] if priority_names else "— none qualify",
            ", ".join((priority_names[1:] + secondary_names) or ["— none qualify"]),
            "All qualifying segments + publisher partnership expansion",
        ],
        "CLV:CAC gate": [
            f"≥ {clv_cac_priority:.1f}× on first 500 acquired users",
            f"Maintain ≥ {clv_cac_secondary:.1f}× across expanded segments",
            "Stable portfolio CLV:CAC ≥ 1.5× at 90-day cohort",
        ],
        "AI systems active": [
            "Bid optimiser (Priority ceiling only); no churn model yet",
            "Bid optimiser (all tiers); churn model v1",
            "Bid optimiser + churn model v2 (ML); creative A/B automation",
        ],
    })
    st.dataframe(rollout, hide_index=True, use_container_width=True)

# ── Tab 4: Sensitivity ────────────────────────────────────────────────────────
with tab_sensitivity:
    st.subheader("Scenario sensitivity — portfolio CLV under lever shifts")
    st.markdown(
        """
        The chart below runs the same simulation under alternative assumptions
        and compares portfolio average CLV. Mirrors **Cell 7** of the notebook.
        Current sidebar settings are shown as **"Current config"**.
        """
    )

    @st.cache_data(show_spinner=False)
    def run_scenarios(base_kwargs: dict) -> pd.DataFrame:
        """Re-run the sim under canonical scenarios."""
        scenarios = [
            ("Base case", dict()),
            ("Retention −3 pp", dict(retention_shift=-0.03)),
            ("Retention +2 pp", dict(retention_shift=0.02)),
            ("Infra cost +20%", dict(infra_multiplier=1.20)),
            ("Premium share → 35%", dict(premium_share=0.35)),
        ]
        rows = []
        for name, override in scenarios:
            kwargs = base_kwargs.copy()
            kwargs.update(override)
            df = simulate_users(**kwargs)
            rows.append({
                "Scenario": name,
                "Portfolio avg CLV": df["clv"].mean(),
                "Basic avg CLV": df.loc[df["subscription_tier"] == "Basic", "clv"].mean(),
                "Premium avg CLV": df.loc[df["subscription_tier"] == "Premium", "clv"].mean(),
                "Net CLV after CAC": df["net_clv_after_cac"].mean(),
                "Share payback ≤12 mo": df["payback_months"].le(12).mean(),
            })
        return pd.DataFrame(rows)

    # Base kwargs = notebook defaults (not the sidebar) so this tab is comparable across runs
    base_defaults = dict(
        n_users=100_000, seed=42,
        premium_share=0.28, basic_price=11.99, premium_price=18.99,
        light_share=0.35, medium_share=0.45, heavy_share=0.20,
        retention_shift=0.0, infra_multiplier=1.0, cac_multiplier=1.0,
        monthly_discount=0.01, payback_horizon=36,
    )
    scen_df = run_scenarios(base_defaults)

    # Append the user's current config as an extra row
    current_row = pd.DataFrame([{
        "Scenario": "Current config (your sidebar)",
        "Portfolio avg CLV": users["clv"].mean(),
        "Basic avg CLV": users.loc[users["subscription_tier"] == "Basic", "clv"].mean(),
        "Premium avg CLV": users.loc[users["subscription_tier"] == "Premium", "clv"].mean(),
        "Net CLV after CAC": users["net_clv_after_cac"].mean(),
        "Share payback ≤12 mo": users["payback_months"].le(12).mean(),
    }])
    scen_df = pd.concat([scen_df, current_row], ignore_index=True)

    # Chart: portfolio CLV vs scenario
    fig = px.bar(
        scen_df, x="Scenario", y="Portfolio avg CLV",
        color="Scenario",
        color_discrete_sequence=[PALETTE["cyan"], PALETTE["rose"], PALETTE["teal"],
                                  PALETTE["gold"], PALETTE["violet"], "#A78BFA"],
        text=scen_df["Portfolio avg CLV"].apply(lambda v: f"${v:,.0f}"),
        labels={"Portfolio avg CLV": "Portfolio avg CLV ($)"},
    )
    fig.update_traces(textposition="outside")
    fig.update_layout(
        height=420, plot_bgcolor="rgba(6,12,28,0)", showlegend=False,
        margin=dict(t=30, b=40, l=10, r=10),
        xaxis_tickangle=-15,
    )
    fig.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); fig.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
    st.plotly_chart(fig, use_container_width=True)

    # Formatted table
    disp = scen_df.copy()
    for col in ["Portfolio avg CLV", "Basic avg CLV", "Premium avg CLV", "Net CLV after CAC"]:
        disp[col] = disp[col].apply(lambda v: f"${v:,.2f}")
    disp["Share payback ≤12 mo"] = disp["Share payback ≤12 mo"].apply(lambda v: f"{v:.1%}")
    st.dataframe(disp, hide_index=True, use_container_width=True)

    # Tornado-style delta chart vs base case
    st.subheader("Lever impact vs base case")
    base_val = scen_df.iloc[0]["Portfolio avg CLV"]
    delta_df = scen_df.iloc[1:5].copy()
    delta_df["delta"] = delta_df["Portfolio avg CLV"] - base_val
    delta_df = delta_df.sort_values("delta")
    tor = px.bar(
        delta_df, x="delta", y="Scenario", orientation="h",
        color=delta_df["delta"].apply(lambda v: "Positive" if v >= 0 else "Negative"),
        color_discrete_map={"Positive": PALETTE["teal"], "Negative": PALETTE["rose"]},
        text=delta_df["delta"].apply(lambda v: f"{'+' if v >= 0 else ''}${v:,.1f}"),
        labels={"delta": "∆ vs base-case portfolio CLV ($)", "Scenario": "", "color": ""},
    )
    tor.update_traces(textposition="outside")
    tor.update_layout(
        height=320, plot_bgcolor="rgba(6,12,28,0)", showlegend=False,
        margin=dict(t=20, b=40, l=10, r=10),
    )
    tor.add_vline(x=0, line_color=PALETTE["dgrey"], line_width=1)
    tor.update_xaxes(gridcolor="rgba(0,180,255,0.12)"); tor.update_yaxes(gridcolor="rgba(0,180,255,0.12)")
    st.plotly_chart(tor, use_container_width=True)

    st.markdown(
        f"""
        <div class="block-note">
        <b>Key insight:</b> retention is typically the biggest single lever —
        a 3 pp drop in monthly retention often reduces portfolio CLV more than a 20%
        infrastructure cost increase. This argues for investing in onboarding
        quality, content freshness, and latency performance before chasing cost
        reductions.
        </div>
        """,
        unsafe_allow_html=True,
    )

# ── Tab 5: Data ───────────────────────────────────────────────────────────────
with tab_data:
    st.subheader("Download simulated dataset")
    st.markdown(
        "Inspect or export the underlying 100k-user (or resized) dataset. "
        "Useful as an appendix to the launch plan or for further ad-hoc analysis."
    )

    sample_n = st.slider("Rows to preview", 5, 200, 25, 5)
    st.dataframe(users.head(sample_n), use_container_width=True)

    csv = users.to_csv(index=False).encode("utf-8")
    st.download_button(
        "⬇️ Download full simulation CSV",
        data=csv,
        file_name="aegis_nexus_simulated_users.csv",
        mime="text/csv",
    )

    # Segment summary download
    seg_out = (
        users.groupby(["subscription_tier", "activity_level"])
        .agg(
            users=("user_id", "count"),
            avg_retention=("monthly_retention_prob", "mean"),
            avg_margin=("gross_margin_per_month", "mean"),
            avg_cac=("cac", "mean"),
            avg_clv=("clv", "mean"),
            avg_net_clv=("net_clv_after_cac", "mean"),
            avg_clv_cac=("clv_to_cac_ratio", "mean"),
            avg_payback=("payback_months", "mean"),
        ).reset_index().round(3)
    )
    st.download_button(
        "⬇️ Download segment summary CSV",
        data=seg_out.to_csv(index=False).encode("utf-8"),
        file_name="aegis_nexus_segment_summary.csv",
        mime="text/csv",
    )

# ──────────────────────────────────────────────────────────────────────────────
# Footer
# ──────────────────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    f"""
    <div style="color:{PALETTE['dgrey']}; font-size:0.8rem; text-align:center;">
    Aegis Nexus · RSM 8542 Individual Project · Spring 2026 · Tony Chen<br>
    All data is <b>synthetic</b> and generated from the data-generating process
    described in the technical appendix (notebook Section 2). Contribution-margin
    CLV, monthly discount = {monthly_discount:.1%}.
    </div>
    """,
    unsafe_allow_html=True,
)
