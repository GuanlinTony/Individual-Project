# Aegis Nexus — Interactive CLV Dashboard

An interactive Streamlit dashboard that brings the CLV & unit economics
simulation from `Marketing_Individual.ipynb` to life. Sidebar sliders let a
viewer re-run the full 100k-user simulation with different assumptions
(prices, tier mix, retention, infra costs, CAC, discount rate, targeting
thresholds) and instantly see how the launch recommendation changes.

**Companion to:** RSM 8542 Individual Project, Spring 2026 — *Aegis Nexus:
AI-enabled cloud gaming asset-streaming platform*.

---

## What's in the dashboard

| Tab | What it shows |
| --- | --- |
| **Overview** | Headline KPIs (Avg CLV, CAC, Net CLV, CLV:CAC, payback), CLV distribution histogram, portfolio economics table, cumulative payback curve |
| **Segments** | CLV and CLV:CAC by segment, CLV-vs-CAC scatter with break-even & priority lines, full segment summary table |
| **Targeting Decision** | Decision tier counts, per-segment CAC bid ceilings, channel recommendations, gated 3-phase rollout plan |
| **Sensitivity** | Canonical scenarios (retention ±, infra shock, premium-share shift) benchmarked against current sidebar config; tornado chart of lever impacts |
| **Data** | Preview and download the simulated user-level CSV and segment summary CSV |

---

## Local run

```bash
# 1. Clone / download this folder
cd dashboard

# 2. (recommended) create a fresh virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run app.py
```

The app will open at **http://localhost:8501** and hot-reloads on file save.

---

## Public deployment (free, shareable URL)

Streamlit Community Cloud is the fastest path.

1. **Push this `dashboard/` folder to a public GitHub repo.** It must contain
   `app.py` and `requirements.txt` at the folder root.
2. Go to **https://share.streamlit.io** and sign in with GitHub.
3. Click **"New app"** → pick your repo, branch, and set the main file path
   to `dashboard/app.py` (or `app.py` if you put the folder at the repo root).
4. Click **Deploy**. After ~2 minutes you'll get a public URL like
   `https://aegis-nexus-tony.streamlit.app` that anyone can view.
5. **Re-deployment** is automatic — every `git push` to the connected branch
   redeploys the app.

### Alternative deployment options

- **Hugging Face Spaces** (free): create a new Space → select "Streamlit"
  runtime → upload these files. Public URL provided immediately.
- **Render / Railway / Fly.io**: work too but require a `Procfile`
  (`web: streamlit run app.py --server.port $PORT --server.address 0.0.0.0`).

---

## File inventory

```
dashboard/
├── app.py                 # main Streamlit application (single file)
├── requirements.txt       # pinned dependencies
├── README.md              # this file
└── .streamlit/
    └── config.toml        # navy/gold theme matching the deck
```

---

## Model recap (what happens inside `app.py`)

The app re-implements the notebook's data-generating process exactly:

1. Draw `n_users` from a 2 × 3 grid (Basic / Premium × Light / Medium / Heavy).
2. Sample `monthly_retention_prob`, `cac`, and `monthly_infrastructure_cost`
   from truncated Normal distributions whose segment-specific means live in
   `simulate_users()`.
3. Derive `gross_margin_per_month = price − infra cost`.
4. Compute **discounted contribution-margin CLV** in closed form:

   $$\text{CLV} = \frac{m}{1 - \dfrac{r}{1+d}}$$

5. Compute **discounted payback** by cumulating monthly discounted cash until
   it equals or exceeds CAC — fully vectorised, no Python loops over users.

The `@st.cache_data` decorator memoises the simulation so changing a single
slider only re-computes when inputs actually change.

---

## Troubleshooting

- **Port already in use** → `streamlit run app.py --server.port 8502`
- **Module not found** → make sure you activated the venv and ran
  `pip install -r requirements.txt`
- **Slow on Streamlit Cloud** → reduce the "Number of simulated users" slider
  to 25k–50k; 100k runs in ~1 s locally but free tier has limited CPU.
- **Nothing changes when I move a slider** → Streamlit reruns top-to-bottom
  on any widget change; if you see a stale chart, hit the browser refresh.
