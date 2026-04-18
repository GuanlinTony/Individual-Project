# Aegis Nexus — RSM 8542 Individual Marketing Launch Project

**Course**: RSM 8542 Analytics for Marketing Strategy (Spring 2026)  
**Student**: Tony Chen  
**Last updated**: April 2026

---

## What Is Aegis Nexus?

Aegis Nexus is a fictional **AI-enabled cloud gaming asset-streaming platform**. Unlike full-game cloud streaming services (e.g., GeForce NOW, Xbox Cloud Gaming) that render the entire game remotely and stream a video feed, Aegis Nexus runs game logic **locally on the player's device** and streams only graphical assets — textures, audio, and geometry — on demand. This distinction matters:

- Installation footprints shrink dramatically, enabling instant play on **mid-range smartphones** constrained by storage.
- **PC gamers** can access large AAA titles without full local installs.
- Compute requirements are lower, so the platform is viable on hardware that cannot support full remote rendering.

The product is pre-launch. All user data in this project is **fully synthetic**, generated from an explicitly stated data-generating process (DGP) with a fixed random seed for complete reproducibility.

---

## Project Deliverables

| Deliverable | File | Description |
|---|---|---|
| Analytical notebook (technical appendix) | `Marketing_Individual.ipynb` | CLV simulation, unit economics, sensitivity analysis, A/B test design, rollout plan |
| Written launch plan report | `Aegis_Nexus_Launch_Plan.docx` | Full written plan — strategy, targeting, measurement, non-market constraints |
| Presentation deck | `Aegis_Nexus_Tony_Chen.pptx` | 8-slide navy/gold/teal pitch deck (6-minute delivery) |
| Speaker script | `presentation_script.docx` | Per-slide timing, full spoken text, delivery notes, Q&A responses |
| Technical plan (PDF) | `Technical_Plan_Aegis_Nexus.pdf` | Code snippets, methodology details, supplementary tables not in main report |
| This file | `README.md` | Reproduction guide for all project components |

---

## Live Deployments

### Analytical Dashboard
An interactive Streamlit dashboard visualising the CLV simulation outputs, segment heatmaps, sensitivity scenarios, and KPI targets.

**→ [Launch Dashboard](https://individual-project-mn4a33u6cehtcm4jrdbvug.streamlit.app/)**

### Product Demo (UI Prototype)
A Vercel-hosted product demo showing what the Aegis Nexus app interface would look like — home screen, game library browser, and asset-streaming download flow.

**→ [Aegis Nexus Product Demo](https://product-demo-aegis-nexus-esltgyl0b-guanlintonys-projects.vercel.app)**

---

## Reproducing the Analytical Notebook

### Requirements

Python 3.10 or later. Install all dependencies:

```bash
pip install numpy pandas matplotlib seaborn scipy
```

Verified package versions:

| Package | Minimum version |
|---|---|
| numpy | 1.26 |
| pandas | 2.1 |
| matplotlib | 3.8 |
| seaborn | 0.13 |
| scipy | 1.11 |

No external data files are required. Every user record is generated inside the notebook.

### Step-by-step Reproduction

```bash
# 1. Clone or download the project directory
cd <project-root>

# 2. (Recommended) create a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install numpy pandas matplotlib seaborn scipy

# 4. Open the notebook
jupyter lab Marketing_Individual.ipynb
# OR: jupyter notebook Marketing_Individual.ipynb
# OR: open in VS Code with the Jupyter extension
```

**Before running**: open `Cell 0` (the Setup cell) and update `OUTPUT_DIR` to a valid path on your machine. For example:

```python
OUTPUT_DIR = '/path/to/your/outputs'   # macOS / Linux
OUTPUT_DIR = r'C:\Users\you\outputs'   # Windows
```

Then run **all cells from top to bottom, in order**. Every downstream section depends on variables computed above it. Running cells out of order will produce `NameError` exceptions.

Random seed `42` is fixed at the very top. Re-running the entire notebook from scratch always produces **numerically identical results**.

---

## Notebook Structure and Cell Reference

| Section | Notebook label | What it does |
|---|---|---|
| 0 — Setup | Cell 0 | Imports, `SEED = 42`, brand colour palette, output directory |
| 1 — Assumptions | Cell 1 | All top-level parameters in one editable block; edit here to re-run any scenario |
| 2 — Data-generating process | Cell 2 | 100,000 synthetic users drawn from a 2 × 3 segment grid; fully vectorised |
| 3 — Validation | Cell 3 | Bounds checks, segment-mix checks, retention-ordering assertion |
| 4 — CLV model | Cells 4a–4b | Discounted contribution-margin CLV; loop-based payback + closed-form cross-check |
| 5 — Decision outputs | Cells 5a–5b | Headline metrics; tier / activity / cross-segment summaries; CLV:CAC heatmap |
| 6 — Visualisations | Cells 6a–6b | CLV distribution, segment box plots, payback CDF, retention scatter |
| 7 — Sensitivity analysis | Cells 7a–7b | Five scenarios; tornado chart |
| 8 — Launch implications | Cells 8a–8c | Acquisition guardrails; per-segment CAC bid ceilings; AI-in-marketing framework; scorecard |
| 9 — Limitations | Markdown cell | Scope and caveats |
| 10 — Export | Cell 10 | All nine summary tables saved as CSV to `OUTPUT_DIR` |
| 10 (optional) — Measurement plan | Cell 11a | Three-tier KPI dashboard with simulation-derived targets and guardrails |
| 10 (optional) — A/B test design | Cell 11b | Statistically powered two-proportion z-test; MDE = +3 pp D30 retention |
| 10 (optional) — Rollout plan | Cell 11c | Three-phase sequencing gated by CLV:CAC checkpoints |
| 10 (optional) — Non-market constraints | Markdown cell | PIPEDA/Bill C-27, publisher licensing, digital equity |

---

## Data-Generating Process (DGP)

All synthetic users are drawn independently from a **2 × 3 segment grid**: tier ∈ {Basic, Premium} × activity level ∈ {Light, Medium, Heavy}.

**Marginal distributions (tier mix and activity mix):**

| Segment dimension | Category | Share |
|---|---|---|
| Subscription tier | Basic | 72% |
| Subscription tier | Premium | 28% |
| Activity level | Light | 35% |
| Activity level | Medium | 45% |
| Activity level | Heavy | 20% |

**Per-user stochastic variables (drawn from truncated Normal distributions):**

| Variable | Distribution | Clip bounds | Notes |
|---|---|---|---|
| `monthly_retention_prob` | Normal(μ_seg, σ_act) | [0.65, 0.97] | μ ranges from 0.79 (Basic/Light) to 0.92 (Premium/Heavy) |
| `cac` | Normal(μ_tier, σ_tier) | [8, ∞) | μ = $27 Basic, $35 Premium |
| `monthly_infrastructure_cost` | Normal(μ_seg, σ_act) | [1, ∞) | μ ranges from $3.00 to $9.40 |
| `monthly_price` | Deterministic | — | $11.99 Basic, $18.99 Premium |

All draws use `numpy.random.default_rng(42)`. The implementation is fully vectorised — no row-wise `apply()` loops — keeping runtime under one second for 100,000 users.

---

## CLV Model

The notebook uses **discounted contribution-margin CLV** under a constant-retention Markov model. The closed-form formula for user *i* is:

```
CLV_i = m_i / (1 - r_i / (1 + d))
```

where:
- `m_i` = monthly contribution margin = `monthly_price − monthly_infrastructure_cost`
- `r_i` = monthly retention probability (individual-level draw)
- `d` = monthly discount rate (default: 1% per month ≈ 12.7% annually)

Payback period is computed two ways (cross-checked):
1. **Loop-based** (`discounted_payback_months`): iterates month by month until cumulative discounted margin ≥ CAC.
2. **Closed-form** (`payback_approx`): solves the geometric series inequality analytically via `log()`.

---

## Key Base-Case Results

| Metric | Value |
|---|---|
| Average CLV (contribution-margin) | $57.52 |
| Average CAC | $29.24 |
| Average net CLV after CAC | $28.28 |
| Average CLV:CAC ratio | 2.02× |
| Share paying back ≤ 12 months | 95.1% |
| Priority acquisition segment | Premium \| Heavy |
| Maximum sustainable CAC (avg) | ~$58 / user |

Premium users (CLV ≈ $93.88, CLV:CAC ≈ 2.83×) substantially outperform Basic users (CLV ≈ $43.38, CLV:CAC ≈ 1.70×). Sensitivity analysis shows a −3 pp retention shock reduces portfolio CLV more than a +20% infrastructure cost increase, making **retention the dominant value lever**.

---

## Analytics-to-Decision Linkage: Per-Segment CAC Bid Ceilings

The primary launch decision output (Cell 8c, `table_targeting_decision.csv`) maps each segment to an acquisition tier:

| Acquisition tier | CLV:CAC threshold | Max CAC ceiling | Channel |
|---|---|---|---|
| Priority | ≥ 2.0× | CLV × 0.50 | Playable ads (Meta/TikTok) + Google UAC |
| Secondary | 1.5–2.0× | CLV × 0.35 | Social display + retargeting |
| Excluded | < 1.5× | $0 (organic only) | App store organic + referral |

**Human-in-the-loop design**: CLV:CAC floors and budget multipliers are human-set. AI bid optimisers operate only within these ceilings and cannot override them. Any ceiling change requires human approval.

---

## Sensitivity Analysis

Five scenarios bound the plausible launch outcomes:

| Scenario | Lever | Direction |
|---|---|---|
| Base case | — | — |
| Retention −3 pp | Monthly retention shifted down 3 pp for all users | Pessimistic |
| Retention +2 pp | Monthly retention shifted up 2 pp | Optimistic |
| Infrastructure cost +20% | All infra costs × 1.20 | Cost shock |
| Premium adoption rises to 35% | Tier mix reweighted | Mix shift |

To run a custom scenario: edit the parameter values in **Section 1 (Cell 1)** and re-run all cells.

---

## Measurement Plan (A/B Test Design)

**Test**: Playable ads vs. standard video ads, primary metric D30 retention.  
**Segment**: Premium \| Heavy (the Priority acquisition segment).  
**Rationale**: The sensitivity analysis shows retention is the dominant CLV lever. A creative format that self-selects higher-retention users directly improves portfolio CLV.

**Statistical design:**
- MDE: +3 pp D30 retention lift (the sensitivity-analysis breakeven shock)
- Method: two-proportion z-test via `scipy.stats.norm.ppf`
- α = 0.05 (two-sided), power = 0.80
- The calculated required sample size per arm and total cohort are printed by Cell 11b.

---

## Phased Rollout Plan

| Phase | Timing | Target segment | CLV:CAC gate |
|---|---|---|---|
| Phase 1 — MVP | Months 1–3 | Premium \| Heavy (mobile) | ≥ 2.0× on first 500 acquired users |
| Phase 2 — Expansion | Months 4–9 | Premium \| Medium + Basic \| Heavy; PC beta | ≥ 1.5× across expanded segments |
| Phase 3 — Full Launch | Months 10+ | All segments; publisher expansion | Stable ≥ 1.5× at 90-day cohort |

The A/B test runs in Phase 1 so results are available before Phase 2 spend scales up.

---

## Non-Market Constraints

Three constraints documented in the notebook's final markdown cell:

1. **Data privacy (PIPEDA / Bill C-27)** — Behavioural data used by the churn model and bid optimiser requires explicit user consent. Apple ATT and Google Privacy Sandbox changes may degrade bid-optimiser signal quality and push effective CPI above base-case CAC assumptions.
2. **Game asset copyright / publisher licensing** — Streaming graphical assets requires explicit publisher agreements. Revenue-sharing will reduce net contribution margins below the base-case simulation. A thin content library also threatens retention — the dominant CLV lever.
3. **Digital equity** — Connectivity heterogeneity means base-case retention assumptions may be optimistic in low-5G markets. Phase 1 geography should be restricted to high-penetration markets.

---

## Output Inventory (after full notebook execution)

All outputs are written to `OUTPUT_DIR` (set in Cell 0) and overwritten on each re-run.

### Figures (5 PNG files)

| File | Description | Used in |
|---|---|---|
| `fig_clv_panel.png` | 2×2 panel: CLV distribution, segment boxes, payback bars, retention scatter | Report analytics section |
| `fig_clv_cac_heatmap.png` | CLV:CAC ratio by tier × activity (heatmap) | Report + presentation |
| `fig_payback_cdf.png` | Payback period CDF by subscription tier | Report analytics section |
| `fig_sensitivity.png` | Tornado-style sensitivity chart (5 scenarios) | Report sensitivity section |
| `slide_scorecard.png` | Headline metrics table formatted for one presentation slide | Deck slide 5 |

### Tables (9 CSV files)

| File | Section | Description |
|---|---|---|
| `table_headline_metrics.csv` | §5 | 7 top-line numbers (avg CLV, CAC, payback shares, …) |
| `table_tier_summary.csv` | §5 | Full unit-economics breakdown by subscription tier |
| `table_activity_summary.csv` | §5 | Unit-economics breakdown by activity level |
| `table_segment_summary.csv` | §5 | Complete 6-cell segment grid (tier × activity) |
| `table_sensitivity.csv` | §7 | Five-scenario sensitivity results |
| `table_targeting_decision.csv` | §8c | **Per-segment CAC bid ceilings and channel recommendations** |
| `table_kpi_dashboard.csv` | §10 | Three-tier KPI framework with simulation-derived targets |
| `table_ab_test_design.csv` | §10 | A/B test power calculation outputs |
| `table_rollout_plan.csv` | §10 | Three-phase rollout with CLV:CAC gates |

---

## Key Assumptions and How to Change Them

All assumptions live in **Section 1** (Cell 1). Edit there and re-run all cells to explore alternative scenarios.

| Parameter | Default | What it drives |
|---|---|---|
| `N_USERS` | 100,000 | Simulation precision; ↑ narrows standard errors |
| `tier_mix['Premium']` | 0.28 | Portfolio CLV via tier mix |
| `base_retention` (6 cells) | 0.79–0.92 | CLV level and payback period |
| `MONTHLY_DISCOUNT_RATE` | 0.01 | How heavily future cash flows are discounted |
| `cac_mean` | $27 / $35 | CLV:CAC ratio; payback period |
| `infra_cost_mean` | $3.00–$9.40 | Contribution margin; CLV |
| `CLV_CAC_FLOOR_PRIORITY` | 2.0× | Segments qualifying for priority paid acquisition |
| `CLV_CAC_FLOOR_SECONDARY` | 1.5× | Segments qualifying for secondary paid acquisition |
| `CAC_BUDGET_RATIO_PRIMARY` | 0.50 | Max CAC as share of CLV (priority segments) |
| `PAYBACK_HORIZON_MONTHS` | 36 | Evaluation window for payback calculation |

---

## Limitations

1. **Simulated, not observed data.** Results are scenario-based guardrails, not post-launch forecasts.
2. **Stationary retention model.** No cohort effects, seasonality, or content-driven churn spikes are modelled.
3. **Fixed pricing.** Pricing optimisation is discussed qualitatively in the written report but is not modelled.
4. **No publisher revenue-sharing.** Contribution margin assumes Aegis Nexus captures 100% of subscription revenue. Real agreements would reduce net margin.
5. **Independent user draws.** Network effects, referral clustering, and churn contagion are not modelled.
6. **Conceptual AI systems.** The churn prediction model and bid-optimiser are design-level descriptions. Actual precision/recall and bid win-rates depend on post-launch training data. Human oversight is critical in the first 6 months.

---

## References (APA 7)

Cited in the written report and notebook commentary:

- Clement, J. (2023). *Cloud gaming market size worldwide 2022–2027*. Statista.
- Coherent Market Insights. (2023). *Cloud gaming market — global industry insights, trends, size, share, growth, opportunity, and forecast 2023–2030.*
- Kumar, V., & Reinartz, W. (2016). Creating enduring customer value. *Journal of Marketing, 80*(6), 36–68.
- Medium. (2022). *The economics of cloud gaming: Why streaming games is harder than streaming video.*
- STL Partners. (2022). *Cloud gaming: Market sizing and forecasts.*
- USC Illumin. (2021). *Cloud gaming: The next frontier of interactive entertainment.*
- Varian, H. R. (2014). *Intermediate microeconomics: A modern approach* (9th ed.). W. W. Norton.
