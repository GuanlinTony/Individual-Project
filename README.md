# Aegis Nexus — Technical Appendix

**Course**: RSM 8542 Analytics for Marketing Strategy (Spring 2026)  
**Notebook**: `Marketing_Individual.ipynb`  
**Last updated**: April 2026

---

## What this notebook does

This notebook implements a simulated **Customer Lifetime Value (CLV) and unit economics** analysis for **Aegis Nexus**, an AI-enabled cloud gaming asset-streaming platform.

**What Aegis Nexus is (product clarification):** Unlike full-game cloud streaming services (e.g., GeForce NOW, Xbox Cloud Gaming) that render the entire game on remote servers and stream the video output, Aegis Nexus runs game logic locally on the player's device and streams only graphical assets (textures, audio, geometry) on demand. This reduces installation size dramatically and enables instant play on mid-range smartphones and large-storage PC titles without requiring high-end hardware or full file downloads. The platform targets two primary use cases: (1) mobile gamers on mid-range smartphones constrained by storage, and (2) PC gamers seeking access to large AAA titles without full local installs.

Because the product has not launched, all user data is synthetic. The simulation is built around five variables stated in the project proposal: subscription tier, monthly retention probability, user activity level, customer acquisition cost (CAC), and monthly cloud infrastructure cost per user.

The notebook serves three deliverables at once:

1. **Technical appendix** for the final report (this file + its outputs)
2. **Analytics exhibits** (figures and tables) used in the written launch plan
3. **One presentation-ready scorecard** (`outputs/slide_scorecard.png`) for the class pitch

--- 

## Project Dashboard and Product Demo

### Analytical Dashboard

Please check the following link to check my deployed analytical dashboard.

[Analytical Dashboard](https://individual-project-mn4a33u6cehtcm4jrdbvug.streamlit.app/)

### Product Demo

Please click the following link to see our product demo, glimpsing what Aegis Nexus would look like when it is coming sooon!

[Aegis Nexus Official](https://product-demo-aegis-nexus-esltgyl0b-guanlintonys-projects.vercel.app)


---

## Reproducing the results

### Requirements

Python 3.10 or later. Install dependencies with:

```bash
pip install numpy pandas matplotlib seaborn
```

Tested versions:

| Package | Version |
|---|---|
| numpy | 1.26+ |
| pandas | 2.1+ |
| matplotlib | 3.8+ |
| seaborn | 0.13+ |

No external data files are required — all data is generated inside the notebook.

### How to run

1. Open `Marketing_Individual.ipynb` in Jupyter Lab, Jupyter Notebook, or VS Code.
2. **Update `OUTPUT_DIR` in Cell 0** to a valid path on your machine before running.
3. **Run all cells from top to bottom, in order.** Do not skip cells; each section depends on variables defined above it.
4. All outputs (figures and CSV tables) are saved automatically to the directory specified in `OUTPUT_DIR`.

Random seed `42` is fixed at the top of the notebook. Running the notebook from scratch will always produce identical numerical results.

---

## Notebook structure

| Section | Cell ID(s) | Description |
|---|---|---|
| 0. Setup | `cell-0-setup` | Imports, random seed, brand palette, output directory |
| 1. Assumptions | `cell-1-assumptions` | All top-level parameters in one editable cell |
| 2. Synthetic data generation | `cell-2-dgp` | 100,000 simulated users; vectorised DGP |
| 3. Validation checks | `cell-3-validation` | Bounds, segment mix, and retention-ordering sanity checks |
| 4. CLV model | `cell-4a-clv-core`, `cell-4b-clv-compute` | Discounted contribution-margin CLV; payback period (loop + closed-form cross-check) |
| 5. Decision-facing outputs | `cell-5a-summary-tables`, `cell-5b-clv-cac-heatmap` | Headline metrics; tier, activity, and cross-segment summaries; CLV:CAC heatmap |
| 6. Visualizations | `cell-6a-panel`, `cell-6b-payback-cdf` | CLV distribution, segment box plots, payback CDF, retention scatter |
| 7. Sensitivity analysis | `cell-7a-scenario-table`, `cell-7b-tornado` | Five scenarios (retention shock, infra cost shock, premium-mix shift); tornado chart |
| 8. Launch implications | `cell-8a-implications`, `cell-8c-segment-targeting`, `cell-8b-scorecard` | Acquisition guardrails; **per-segment CAC bid ceilings** (the key launch decision); AI-in-marketing framework; slide-ready scorecard |
| 9. Limitations | `md-section9` | Scope and caveats for the simulation, including AI model assumptions |
| 10. Export | `cell-10-export` | All tables saved to `outputs/` as CSV |

---

## Data-generating process

Users are drawn independently from a 2 × 3 segment grid (tier ∈ {Basic, Premium} × activity ∈ {Light, Medium, Heavy}). The marginal distributions are:

- **Tier mix**: 72 % Basic, 28 % Premium
- **Activity mix**: 35 % Light, 45 % Medium, 20 % Heavy

Within each segment cell, individual-level values are drawn from truncated Normal distributions:

| Variable | Distribution | Notes |
|---|---|---|
| `monthly_retention_prob` | Normal(μ\_seg, σ\_act), clipped [0.65, 0.97] | μ ranges from 0.79 (Basic/Light) to 0.92 (Premium/Heavy) |
| `cac` | Normal(μ\_tier, σ\_tier), clipped [8, ∞) | μ = $27 Basic, $35 Premium |
| `monthly_infrastructure_cost` | Normal(μ\_seg, σ\_act), clipped [1, ∞) | μ ranges from $3.00 to $9.40 |
| `monthly_price` | Deterministic | $11.99 Basic, $18.99 Premium |

All draws use `numpy.random.default_rng(42)` for full reproducibility.

---

## CLV methodology

The notebook uses **discounted contribution-margin CLV**, not revenue-only CLV. The formula for user *i* is:

```
CLV_i = m_i / (1 - r_i / (1 + d))
```

where:
- `m_i` = monthly contribution margin = `monthly_price - monthly_infrastructure_cost`
- `r_i` = monthly retention probability
- `d`   = monthly discount rate (default 1 %)

This formula is the infinite-horizon discounted geometric series, which is the standard closed-form expression under a constant-retention Markov model. It is preferred over revenue-only CLV because it directly supports CAC and payback decisions: the maximum sustainable CAC equals CLV, and the payback period is the number of months until cumulative discounted margin exceeds CAC.

---

## Key results (base case)

| Metric | Value |
|---|---|
| Average CLV (contribution-margin) | $57.52 |
| Average CAC | $29.24 |
| Average net CLV after CAC | $28.28 |
| Average CLV:CAC ratio | 2.02× |
| Share paying back within 12 months | 95.1% |
| Priority segment | Premium \| Heavy |
| Maximum sustainable CAC | ~$58 / user |

Premium users (CLV $93.88, CLV:CAC 2.83×) substantially outperform Basic users (CLV $43.38, CLV:CAC 1.70×). Sensitivity analysis shows that a 3 pp retention drop reduces portfolio CLV more than a 20% infrastructure cost increase, making retention the dominant lever for value creation.

---

## Analytics-to-decision linkage (Cell 8c)

The notebook's primary launch decision output is a **per-segment CAC bid ceiling table** (Cell `cell-8c-segment-targeting`, exported as `table_targeting_decision.csv`). The table maps each of the six tier × activity segments to one of three acquisition tiers:

| Acquisition tier | CLV:CAC threshold | Max CAC ceiling | Channel approach |
|---|---|---|---|
| Priority | ≥ 2.0× | CLV × 0.50 | Playable ads (Meta/TikTok) + Google UAC — heavy-gaming genres |
| Secondary | 1.5–2.0× | CLV × 0.35 | Social display + retargeting — mid-core gaming audiences |
| Excluded | < 1.5× | $0 (organic only) | App store organic + referral program |

**Human-in-the-loop design**: The CLV:CAC floors and budget ratio multipliers are set by human marketers. AI bid optimisers (e.g., Meta Advantage+, Google tROAS) operate within these ceilings and cannot override them. Any change to a ceiling requires human approval.

---

## AI in marketing — roles and data sources

Three AI systems are modelled in the launch plan:

| Marketing function | Automated | Human judgment required | Data sources |
|---|---|---|---|
| Paid acquisition / bid optimisation | Real-time CPI bid adjustments within approved CAC ceiling; creative rotation; budget pacing | Human sets per-segment CAC ceiling derived from CLV:CAC ratios; ceiling changes require approval | Impression-level auction data; in-app event signals (install, trial start, subscription); segment labels |
| Ad creative generation | Generation of playable-ad A/B variants; auto-rejection of low-CTR creatives after minimum impression threshold | Human creative director approves all new concepts before live deployment; final variant selection is human | Historical CTR/CVR by creative; brand guidelines; competitor creative signals |
| Retention / churn management | Monthly churn scoring; automated push notifications / in-app offers when score exceeds threshold; threshold calibrated monthly | Human sets churn probability threshold and offer parameters; Premium\|Heavy at-risk users flagged for manual review | In-app session data (play hours, frequency, last-active); subscription age; tier; device specs |

---

## Outputs

All files are written to `OUTPUT_DIR` on each run (overwriting previous versions).

### Figures

| File | Description | Used in |
|---|---|---|
| `fig_clv_panel.png` | 2×2 panel: CLV distribution, segment boxes, payback bar, retention scatter | Report analytics section |
| `fig_clv_cac_heatmap.png` | CLV:CAC ratio by tier × activity (heatmap) | Report + presentation |
| `fig_payback_cdf.png` | Payback period CDF by subscription tier | Report analytics section |
| `fig_sensitivity.png` | Tornado-style sensitivity of portfolio CLV | Report sensitivity discussion |
| `slide_scorecard.png` | Headline metrics table formatted for one slide | Presentation |

### Tables (CSV)

| File | Description |
|---|---|
| `table_headline_metrics.csv` | 7 top-line numbers (avg CLV, avg CAC, payback shares, …) |
| `table_tier_summary.csv` | Full unit-economics breakdown by subscription tier |
| `table_activity_summary.csv` | Unit-economics breakdown by activity level |
| `table_segment_summary.csv` | Full 6-cell segment grid (tier × activity) |
| `table_sensitivity.csv` | Five-scenario sensitivity results |
| `table_targeting_decision.csv` | **Per-segment CAC bid ceilings and channel recommendations** — the key launch decision output |

---

## Key assumptions and how to change them

All assumptions live in **Section 1** of the notebook (Cell `cell-1-assumptions`). To run a different scenario, edit the values there and re-run all cells. The most decision-relevant parameters are:

| Parameter | Default | What it drives |
|---|---|---|
| `tier_mix['Premium']` | 0.28 | Portfolio CLV; premium adoption sensitivity |
| `base_retention` (all 6 cells) | 0.79–0.92 | CLV level and payback period |
| `MONTHLY_DISCOUNT_RATE` | 0.01 (1 %) | How heavily future cash flows are discounted |
| `cac_mean` | $27 / $35 | CLV:CAC ratio; payback period |
| `infra_cost_mean` | $3–$9.40 | Contribution margin; CLV |
| `CLV_CAC_FLOOR_PRIORITY` | 2.0× | Which segments qualify for priority paid acquisition |
| `CLV_CAC_FLOOR_SECONDARY` | 1.5× | Which segments qualify for secondary paid acquisition |
| `CAC_BUDGET_RATIO_PRIMARY` | 0.50 | Max CAC as share of CLV for priority segments |

---

## Limitations

1. **Simulated, not observed data.** Results should be read as scenario-based guardrails, not post-launch forecasts.
2. **Stationary retention model.** No cohort effects, seasonality, or content-driven churn spikes are modelled.
3. **Fixed pricing.** Pricing optimisation is discussed qualitatively in the written report but not modelled here.
4. **No publisher revenue-sharing.** Contribution margin assumes Aegis Nexus captures 100% of subscription revenue.
5. **Independent user draws.** Network effects and social clustering are not modelled.
6. **AI model assumptions.** The churn prediction model and bid-optimisation systems are conceptual. Actual performance depends on post-launch data. Human oversight is especially critical in the first 6 months when training data is sparse.

---

## Optional elements (Section 10)

Three optional elements are implemented in the notebook after Section 9 and before the final export cell.

### Measurement plan (Cells 11a–11b)

**Cell `cell-11a-kpi-dashboard`** defines a three-tier KPI framework:
- *North Star* (monthly): portfolio CLV and CLV:CAC ratio — tied directly to simulation outputs
- *Weekly operational*: subscriber count, blended CPI, D30 retention, median payback period
- *Diagnostic*: Premium conversion rate, churn model precision, infrastructure cost per user

Each KPI has a target or guardrail derived from the base-case simulation, a data source, and a review cadence. Exported as `table_kpi_dashboard.csv`.

**Cell `cell-11b-ab-test-power`** designs a statistically powered A/B test:
- **Test**: Playable ads vs. standard video ads, measured on D30 retention
- **Segment**: Premium | Heavy (the Priority acquisition segment from Cell 8c)
- **Rationale**: Retention is the dominant CLV lever (sensitivity analysis, Section 7); a creative format that self-selects higher-retention users directly improves portfolio CLV
- **MDE**: +3 pp retention lift (chosen because −3 pp is the breakeven shock in the sensitivity analysis)
- **Method**: Two-proportion z-test via `scipy.stats.norm.ppf`; α = 0.05, power = 0.80
- **Outputs**: Required sample per arm, total sample, CLV uplift per user if MDE is achieved, total CLV uplift across test cohort, and a plain-English decision rule
- Exported as `table_ab_test_design.csv`

### Rollout plan (Cell 11c)

**Cell `cell-11c-rollout-plan`** defines a three-phase sequenced launch:

| Phase | Timing | Segments | CLV:CAC gate |
|---|---|---|---|
| Phase 1 — MVP | Months 1–3 | Premium \| Heavy (mobile) | ≥ 2.0× on first 500 users |
| Phase 2 — Expansion | Months 4–9 | Premium \| Medium + Basic \| Heavy; PC beta | ≥ 1.5× across expanded segments |
| Phase 3 — Full Launch | Months 10+ | All segments; publisher expansion | Stable ≥ 1.5× at 90-day cohort |

Each phase specifies active AI systems, acquisition channels, and human oversight cadence. The A/B test runs in Phase 1 so results are available before Phase 2 spend scales. Exported as `table_rollout_plan.csv`.

### Non-market constraints (Cell md-11d-nonmarket)

Three constraints documented as a markdown cell:
1. **Data privacy (PIPEDA / Bill C-27)**: behavioural data consent, Apple ATT / GAID opt-in implications for bid-optimiser signal quality
2. **Game asset copyright**: publisher licensing requirement; directly explains Limitation 4 (no revenue-sharing in the model) and the asymmetric risk to the Priority segment from a thin content library
3. **Digital equity**: connectivity heterogeneity means base-case retention assumptions may be optimistic in low-5G markets; Phase 1 geography should be limited to high-penetration markets

---

## Complete output inventory (after all cells run)

### Figures (5)
`fig_clv_panel.png`, `fig_clv_cac_heatmap.png`, `fig_payback_cdf.png`, `fig_sensitivity.png`, `slide_scorecard.png`

### Tables (9)
| File | Section |
|---|---|
| `table_headline_metrics.csv` | Section 5 |
| `table_tier_summary.csv` | Section 5 |
| `table_activity_summary.csv` | Section 5 |
| `table_segment_summary.csv` | Section 5 |
| `table_sensitivity.csv` | Section 7 |
| `table_targeting_decision.csv` | Section 8c — key launch decision |
| `table_kpi_dashboard.csv` | Section 10 — measurement plan |
| `table_ab_test_design.csv` | Section 10 — A/B test power calculation |
| `table_rollout_plan.csv` | Section 10 — rollout plan |
