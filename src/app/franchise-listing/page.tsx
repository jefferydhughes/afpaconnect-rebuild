import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuizStatus } from "../components/hooks/useQuizStatus";
import MobileBottomNav from "@/components/directory/MobileBottomNav";
import FitScoreRadialChart from "@/components/directory/FitScoreRadialChart";
import { CheckCircle, Star } from "lucide-react";

function slugify(name) {
  if (!name) return "";
  return name.
  toLowerCase().
  replace(/&/g, "and").
  replace(/[^a-z0-9]+/g, "-").
  replace(/-+/g, "-").
  replace(/^-|-$/g, "");
}

export default function FranchiseListing() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slugParam = params.get("slug");
  const nameParam = params.get("name");
  const idParam = params.get("id");

  // Load quiz status using custom hook
  const { quizResult, calculateFitScore, getMatchContext } = useQuizStatus();

  // ----------------------------
  // STATE (ALL HOOKS AT TOP LEVEL)
  // ----------------------------
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [quizContext, setQuizContext] = useState(null);

  // ----------------------------
  // LOAD BRAND
  // ----------------------------
  useEffect(() => {
    async function loadBrand() {
      setLoading(true);
      setErrorMsg("");

      try {
        let match = null;

        // 1️⃣ Try ID param first (admin / internal links)
        if (idParam) {
          try {
            match = await base44.entities.Franchise.get(idParam);
          } catch (e) {
            console.error("Failed to fetch by ID:", e);
          }
        }

        // 2️⃣ Fallback to slug or name
        if (!match) {
          const searchSlug = (slugParam || nameParam || "").trim().toLowerCase();

          if (!searchSlug) {
            setErrorMsg("No brand specified.");
            setLoading(false);
            return;
          }

          const allFranchises = await base44.entities.Franchise.list();

          // Exact slug match
          match = allFranchises.find((f) => {
            const fSlug = f.slug || slugify(f.name);
            return fSlug === searchSlug;
          });

          // Exact name match (case-insensitive)
          if (!match) {
            const searchTerms = searchSlug.replace(/-/g, " ").trim();
            match = allFranchises.find(
              (f) => f.name?.toLowerCase() === searchTerms
            );
          }

          // Partial name match - name contains search or search contains name
          if (!match) {
            const searchTerms = searchSlug.replace(/-/g, " ").trim();
            match = allFranchises.find(
              (f) =>
              f.name?.toLowerCase().includes(searchTerms) ||
              searchTerms.includes(f.name?.toLowerCase())
            );
          }

          // Slug-based partial match - compare slugified versions
          if (!match) {
            match = allFranchises.find((f) => {
              const fSlug = slugify(f.name);
              return fSlug.includes(searchSlug) || searchSlug.includes(fSlug);
            });
          }

          // Word-based match - any word in search matches any word in name
          if (!match) {
            const searchWords = searchSlug.replace(/-/g, " ").split(/\s+/).filter(w => w.length > 2);
            if (searchWords.length > 0) {
              match = allFranchises.find((f) => {
                const nameWords = f.name?.toLowerCase().split(/\s+/) || [];
                return searchWords.some(sw => nameWords.some(nw => nw.includes(sw) || sw.includes(nw)));
              });
            }
          }
        }

        if (!match) {
          setBrand(null);
          setErrorMsg("Brand not found.");
        } else {
          setBrand(match);
        }
      } catch (err) {
        console.error("Error loading brand:", err);
        setErrorMsg("There was a problem loading this brand.");
        setBrand(null);
      }

      setLoading(false);
    }

    loadBrand();
  }, [slugParam, nameParam, idParam]);

  // ----------------------------
  // LOAD QUIZ CONTEXT FOR THIS BRAND
  // ----------------------------
  useEffect(() => {
    async function loadQuizContext() {
      if (!brand?.id) return;
      
      try {
        const user = await base44.auth.me();
        if (!user?.email) return;

        const results = await base44.entities.QuizResult.filter(
          { email: user.email },
          "-created_date",
          1
        );

        if (!results.length) return;

        const qr = results[0];
        const match = qr.match_scores?.[brand.id];

        if (match) {
          setQuizContext(match);
        }
      } catch (e) {
        // User not logged in or error - ignore
        console.log("Could not load quiz context:", e);
      }
    }

    loadQuizContext();
  }, [brand?.id]);

  // ----------------------------
  // RENDER STATES
  // ----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>);

  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
          <h2 className="text-lg font-semibold">Brand Not Found</h2>
          <p className="text-slate-600 mt-2">{errorMsg}</p>
        </div>
      </div>);

  }

  // Calculate fit score and get match context for this brand
  const fitScore = brand ? calculateFitScore(brand) : null;
  const matchContext = brand ? getMatchContext(brand) : null;

  // Normalize a reason to always return a string
  const normalizeReason = (reason) => {
    if (typeof reason === 'string') return reason;
    if (typeof reason === 'object' && reason !== null) {
      if (typeof reason.text === 'string') return reason.text;
      if (Array.isArray(reason.reasons)) return reason.reasons.join(', ');
      return JSON.stringify(reason);
    }
    return String(reason);
  };

  // Get match reasons - prefer AI-generated reasons, fallback to computed
  const getMatchReasons = () => {
    // First check for AI-generated reasons from match context
    if (matchContext?.reasons) {
      // Case 1: reasons is already an array
      if (Array.isArray(matchContext.reasons)) {
        return matchContext.reasons.map(normalizeReason);
      }

      // Case 2: nested AI object { score, tier, reasons }
      if (
        typeof matchContext.reasons === "object" &&
        Array.isArray(matchContext.reasons.reasons)
      ) {
        return matchContext.reasons.reasons.map(normalizeReason);
      }

      // Case 3: single object or string
      return [normalizeReason(matchContext.reasons)];
    }
    
    if (!quizResult || !brand || !fitScore) return [];

    const reasons = [];

    // Budget match
    if (quizResult.budget_range && brand.initial_investment_min) {
      const budgetRanges = {
        under_50k: 50000,
        "50k_100k": 100000,
        "100k_250k": 250000,
        "250k_500k": 500000,
        over_500k: 1000000
      };
      const userMax = budgetRanges[quizResult.budget_range] || 0;
      if (brand.initial_investment_min <= userMax) {
        reasons.push("Investment fits perfectly within your budget");
      }
    }

    // Category match
    if (quizResult.preferred_categories?.includes(brand.category)) {
      reasons.push(`Matches your interest in ${brand.category.replace(/_/g, ' ')}`);
    }

    // Business model match
    if (quizResult.business_model_preference === brand.business_model) {
      reasons.push(`${brand.business_model} business model aligns with your preference`);
    }

    // Time commitment match
    if (quizResult.time_commitment === brand.time_commitment) {
      reasons.push(`${brand.time_commitment.replace(/_/g, ' ')} commitment matches your availability`);
    }

    return reasons.slice(0, 4);
  };

  const matchReasons = getMatchReasons();
  
  // Helper to get tier label
  const tierLabel = (tier) => {
    switch (tier) {
      case "best_fit": return "Best Fit";
      case "good_fit": return "Good Fit";
      default: return "Potential Fit";
    }
  };

  // ----------------------------
  // MAIN RENDER
  // ----------------------------
  return (
    <>
      <BrandPage brand={brand} quizResult={quizResult} fitScore={fitScore} matchReasons={matchReasons} />
      <MobileBottomNav />
    </>);

}

function BrandPage({ brand, quizResult, fitScore, matchReasons }) {
  const formatMoney = (v) =>
  typeof v === "number" ?
  `$${v.toLocaleString()}` :
  v === 0 ?
  "$0" :
  "—";

  const formatPercent = (v) =>
  typeof v === "number" ? `${v}%` : "—";

  const {
    name,
    display_name,
    logo_url,
    hero_image_url,
    cover_image_url,
    category,
    subcategory,
    description,
    summary_short,
    initial_investment_min,
    initial_investment_max,
    investment_midpoint,
    franchise_fee,
    royalty_fee_percentage,
    marketing_fee_percentage,
    net_worth_required,
    established_year,
    franchising_since,
    total_locations,
    business_model,
    ai_overview_markdown,
    full_description,
    ideal_candidate,
    ai_ideal_candidate_markdown,
    franchisee_support,
    ai_training_support_markdown,
    ai_faqs_markdown,
    info_kit_url,
    fdd_url,
    slug
  } = brand;

  const brandName = display_name || name;
  const brandSlug = slug || slugify(name);

  const hasFinancials =
  initial_investment_min || initial_investment_max || franchise_fee || royalty_fee_percentage;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <ol className="flex items-center text-sm text-slate-600 overflow-x-auto whitespace-nowrap">
            <li>
              <a href="/FranchiseDirectory" className="hover:text-[var(--brand-1)] transition-colors">
                Franchises
              </a>
            </li>
            {category &&
            <>
                <li className="mx-2 text-slate-400">/</li>
                <li>
                  <a
                  href={`/FranchiseDirectory?category=${encodeURIComponent(category)}`}
                  className="hover:text-[var(--brand-1)] transition-colors">

                    {category}
                  </a>
                </li>
              </>
            }
            <li className="mx-2 text-slate-400">/</li>
            <li className="font-medium text-slate-900 truncate">{brandName}</li>
          </ol>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative mb-6 border-b border-slate-200"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(15, 76, 92, 0.9) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(67, 167, 190, 0.7) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(79, 110, 247, 0.6) 0%, transparent 50%),
            linear-gradient(135deg, #0A3540 0%, #2E6A7C 50%, #3D5A9F 100%)
          `
        }}>

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }} />

        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-6 pt-6 lg:flex-row lg:items-center lg:gap-8 lg:pb-8 lg:pt-7">
          {/* Logo + Title */}
          <div className="flex flex-1 flex-col gap-3 lg:max-w-[680px]">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 pr-4 backdrop-blur-xl border border-white/10 w-fit">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                {logo_url ?
                <img
                  src={logo_url}
                  alt={brandName}
                  className="h-full w-full object-contain p-1.5" /> :
                <span className="text-xs font-semibold text-slate-500">
                    {brandName?.[0] || "F"}
                  </span>
                }
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white lg:text-2xl">
                {brandName}
              </h1>
            </div>

            {category &&
            <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                {category}
              </span>
            }

            <p className="max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
              {summary_short ||
              description ||
              "Explore investment, financials, and fit score insights to see if this franchise matches your goals."}
            </p>

            {/* CTAs */}
            <div className="mt-2 flex flex-wrap gap-3">
              {!quizResult &&
              <button
                onClick={() => window.location.href = `/quiz?brand=${brandSlug}`}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                  Take the Fit Quiz
                </button>
              }
              <button
                onClick={() => window.location.href = `/contact?brand=${brandSlug}`}
                className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Book a Call
              </button>
            </div>
          </div>

          {/* Hero financial summary card - Desktop Only */}
          <div className="hidden lg:flex flex-col gap-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-sm text-slate-100 shadow-2xl border border-white/10 w-[360px] shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              At a Glance
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Investment Range
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatMoney(initial_investment_min)} – {formatMoney(initial_investment_max)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Franchise Fee
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatMoney(franchise_fee)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Royalty
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatPercent(royalty_fee_percentage)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Brand Fund
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatPercent(marketing_fee_percentage)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE BODY */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 lg:flex-row lg:gap-8">
        {/* MAIN COLUMN */}
        <main className="flex-1 space-y-8">
          {/* Top nav buttons (anchor links) - Desktop only */}
          <nav className="mb-1 hidden md:flex flex-wrap gap-2">
            {["Overview", "Financials", "Ideal Candidate", "Support", "FAQs"].map(
              (label) =>
              <a
                key={label}
                href={`#${label.toLowerCase().replace(" ", "-")}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-teal-400 hover:text-slate-900">

                  {label}
                </a>

            )}
          </nav>

          {/* Overview / Brand story */}
          <section id="overview">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                Brand Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {summary_short ||
                "Learn how this franchise operates, who they serve, and what makes their model unique."}
              </p>

              <div className="mt-4 space-y-4 text-sm text-slate-700">
                {ai_overview_markdown ?
                <p className="whitespace-pre-line">
                    {ai_overview_markdown}
                  </p> :
                full_description ?
                <div
                  className="prose prose-sm sm:prose-base max-w-none text-slate-800"
                  dangerouslySetInnerHTML={{ __html: full_description }} /> :


                <>
                    <p>
                      This profile is based on the most recent franchise
                      disclosure filing and our AI-assisted analysis of the
                      business model, support systems, and risk factors.
                    </p>
                    <p>
                      Use the Fit Quiz to see how closely this opportunity
                      aligns with your financial capacity, lifestyle, and ideal
                      role in the business.
                    </p>
                  </>
                }
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                {established_year &&
                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Founded
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {established_year}
                    </p>
                  </div>
                }
                {franchising_since &&
                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Franchising Since
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {franchising_since}
                    </p>
                  </div>
                }
                {total_locations != null &&
                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Locations
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {total_locations} total units
                    </p>
                  </div>
                }
              </div>
            </div>
          </section>

          {/* Financials */}
          <section id="financials">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-2">
                    Investment & Financials
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Understand the capital requirements and ongoing fees to
                    launch and operate this franchise.
                  </p>
                </div>
              </div>

              {hasFinancials ?
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.7fr_1.3fr]">
                  {/* Simple range "chart" */}
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Expected Investment Range
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Plan for total startup costs between{" "}
                      <span className="font-semibold">
                        {formatMoney(initial_investment_min)}
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold">
                        {formatMoney(initial_investment_max)}
                      </span>
                      .
                    </p>

                    {/* Bar visualization */}
                    <div className="mt-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1 text-center text-xs text-slate-500">
                          <div className="mx-auto w-3 rounded-full bg-slate-300 pb-10" />
                          <span>Min</span>
                          <div className="text-[11px] font-semibold text-slate-700">
                            {formatMoney(initial_investment_min)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 text-center text-xs text-slate-500">
                          <div className="mx-auto w-3 rounded-full bg-teal-500 pb-16" />
                          <span>Midpoint</span>
                          <div className="text-[11px] font-semibold text-slate-700">
                            {formatMoney(investment_midpoint)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 text-center text-xs text-slate-500">
                          <div className="mx-auto w-3 rounded-full bg-slate-400 pb-24" />
                          <span>Max</span>
                          <div className="text-[11px] font-semibold text-slate-700">
                            {formatMoney(initial_investment_max)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee breakdown */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-slate-50 p-4 text-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Key Fees
                      </p>
                      <dl className="mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-600">Franchise Fee</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatMoney(franchise_fee)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-600">Royalty</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatPercent(royalty_fee_percentage)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-600">Brand Fund</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatPercent(marketing_fee_percentage)}
                          </dd>
                        </div>
                        {net_worth_required &&
                      <div className="flex items-center justify-between gap-2">
                            <dt className="text-slate-600">
                              Net Worth Required
                            </dt>
                            <dd className="font-semibold text-slate-900">
                              {formatMoney(net_worth_required)}
                            </dd>
                          </div>
                      }
                      </dl>
                    </div>
                  </div>
                </div> :

              <p className="mt-4 text-sm text-slate-500">
                  Detailed financials are not yet available for this brand. You
                  can still complete a Fit Quiz to explore whether it aligns
                  with your goals and risk tolerance.
                </p>
              }

              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <button
                  onClick={() => window.location.href = `/quiz?brand=${brandSlug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:border-teal-400 hover:text-slate-900">

                  Take Fit Quiz to Unlock Full Financials
                </button>
              </div>
            </div>
          </section>

          {/* Ideal candidate */}
          <section id="ideal-candidate">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                Ideal Franchisee Profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                See if your background, skills, and time commitment match what
                this brand is looking for.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Background & Experience
                  </p>
                  <p className="mt-2 text-slate-700">
                    {ai_ideal_candidate_markdown ||
                    ideal_candidate ||
                    "Most franchises prioritize leadership, sales, and relationship-building skills over specific industry experience. Training is designed to help you learn the model even if you're new to the sector."}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Time & Role
                  </p>
                  <p className="mt-2 text-slate-700">
                    Use the Fit Quiz to indicate whether you prefer an
                    owner-operator or semi-absentee role and see how this
                    opportunity lines up.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Training & support */}
          <section id="support">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                Training & Support
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                What you can expect from the franchisor before launch and after
                opening.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Pre-Opening
                  </p>
                  <p className="mt-2 text-slate-700">
                    {ai_training_support_markdown ||
                    franchisee_support ||
                    "Most brands include site selection guidance, initial training for owners and key staff, and launch marketing support to help you ramp up quickly."}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Ongoing Support
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-700">
                    <li>• Field support and regular check-ins</li>
                    <li>• Marketing assets and campaigns</li>
                    <li>• Access to technology / CRM tools</li>
                    <li>• Peer community of franchisees</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section id="faqs">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-2">FAQs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Common questions from prospective franchisees.
              </p>

              <div className="mt-4 divide-y divide-slate-100 rounded-2xl bg-slate-50/50">
                {/* Example accordions */}
                <details className="group p-4">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-slate-800">
                    What is the typical time to open?
                    <span className="ml-3 text-xs text-slate-400 group-open:hidden">
                      +
                    </span>
                    <span className="ml-3 hidden text-xs text-slate-400 group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-700">
                    Many franchises open within 3–9 months after signing,
                    depending on site selection, build-out, and permitting. The
                    franchisor can share specific timelines for this concept.
                  </p>
                </details>

                <details className="group p-4">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-slate-800">
                    Do I need prior industry experience?
                    <span className="ml-3 text-xs text-slate-400 group-open:hidden">
                      +
                    </span>
                    <span className="ml-3 hidden text-xs text-slate-400 group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-700">
                    Many successful franchisees come from outside the industry.
                    Strong people skills, basic business acumen, and a willingness
                    to follow the system are typically more important.
                  </p>
                </details>

                {ai_faqs_markdown &&
                <div className="p-4 text-sm text-slate-700 whitespace-pre-line">
                    {ai_faqs_markdown}
                  </div>
                }
              </div>
            </div>
          </section>
        </main>

        {/* STICKY SIDEBAR */}
        <aside className="mt-2 w-full max-w-md shrink-0 lg:mt-0 lg:w-80 lg:sticky lg:top-24">
          <div className="space-y-4">
            {/* Fit Score or Next steps */}
            {fitScore !== null && quizResult ?
            <div className="rounded-2xl bg-slate-900 p-6 text-slate-100 shadow-lg">
                {/* Tier badge if available */}
                {matchContext?.tier &&
                  <div className="flex justify-center mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      matchContext.tier === 'best_fit' ? 'bg-teal-500/20 text-teal-300' :
                      matchContext.tier === 'good_fit' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      <Star className="w-3 h-3 mr-1" />
                      {tierLabel(matchContext.tier)}
                    </span>
                  </div>
                }

                <h2 className="text-teal-200 mb-4 text-xs font-medium text-center uppercase tracking-wider">
                  {matchContext ? 'AI ASSESSMENT' : 'ASSESSMENT RESULT'}
                </h2>

                <FitScoreRadialChart score={fitScore} />

                <p className="mt-4 text-xs text-center text-slate-200/90">
                  {fitScore >= 75 ?
                "Excellent match for your profile!" :
                fitScore >= 50 ?
                "Good potential fit based on your preferences." :
                "Consider exploring other options."}
                </p>

                {matchReasons.length > 0 &&
              <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-xs font-semibold text-teal-200 mb-2">
                      Why it's a match:
                    </h3>
                    <ul className="space-y-2">
                      {matchReasons.map((reason, idx) =>
                  <li key={idx} className="flex items-start text-xs text-slate-200/90">
                          <CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-teal-400 flex-shrink-0" />
                          <span>{normalizeReason(reason)}</span>
                        </li>
                  )}
                    </ul>
                  </div>
              }

                <button
                onClick={() => window.location.href = `/contact?brand=${brandSlug}`} className="bg-cyan-500 text-slate-200 mt-5 px-4 py-2.5 text-xs font-medium rounded-full w-full hover:bg-slate-800 border border-slate-700/50 transition">


                  Check Availability
                </button>
              </div> :

            <div className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-lg">
                <h2 className="text-sm font-semibold text-teal-200">
                  Next Steps
                </h2>
                <p className="mt-2 text-xs text-slate-200/90">
                  Get a personalized Fit Score and connect with a franchise
                  specialist.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-200/90">
                  <li>• See if this franchise matches your budget</li>
                  <li>• Understand your ideal role and time commitment</li>
                  <li>• Get connected to the right brand contact</li>
                </ul>
                <button
                onClick={() => window.location.href = `/quiz?brand=${brandSlug}`}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:brightness-110">

                  Start My Fit Assessment
                </button>
              </div>
            }

            {/* Documents */}
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Documents & Disclosures
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Always review the current Franchise Disclosure Document (FDD)
                with your advisor before making decisions.
              </p>

              <div className="mt-3 space-y-2">
                {info_kit_url &&
                <a
                  href={info_kit_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-medium text-slate-700 hover:border-teal-400 hover:text-slate-900">

                    Download Info Kit (PDF)
                  </a>
                }

                <a
                  href={createPageUrl(`FddRequestPage?slug=${brandSlug}`)}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold bg-white border border-slate-300 hover:bg-slate-50 transition w-full text-center"
                >
                  Download FDD (PDF)
                </a>
              </div>
            </div>

            {/* Contact / Call to action */}
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Talk to an Advisor
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Not sure where to start? A certified franchise advisor can walk
                you through this brand and compare alternatives.
              </p>
              <button
                onClick={() => window.location.href = `/contact?brand=${brandSlug}`}
                className="mt-3 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:border-teal-400 hover:text-slate-900">

                Check Availability
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>);

}