"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── tiny SVG icons ─────────────────────────────────────── */
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconChart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBell = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── feature cards data ──────────────────────────────────── */
const features = [
  {
    icon: <IconChart />,
    title: "Smart Expense Tracking",
    desc: "Automatically categorise every transaction. See where your money goes at a glance with beautiful, real-time charts.",
    color: "emerald",
  },
  {
    icon: <IconTarget />,
    title: "Goal-Based Budgets",
    desc: "Set spending limits per category, track progress daily, and get nudges before you overshoot.",
    color: "violet",
  },
  {
    icon: <IconBell />,
    title: "Instant Alerts",
    desc: "Never miss a bill or unusual charge. Real-time notifications keep you one step ahead of your finances.",
    color: "amber",
  },
  {
    icon: <IconShield />,
    title: "Bank-Level Security",
    desc: "Your data is encrypted end-to-end and protected by Firebase's enterprise-grade infrastructure.",
    color: "sky",
  },
];

/* ─── stat counter ────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(to / 60);
      const id = setInterval(() => {
        start += step;
        if (start >= to) { setVal(to); clearInterval(id); }
        else setVal(start);
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── main component ──────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}>
      <style>{`
        /* Reset & base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Gradient background */
        .landing-root {
          background: #030712;
          color: #e2e8f0;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 6vw, 5rem);
          height: 64px;
          background: rgba(3,7,18,.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .nav-logo { display: flex; align-items: center; gap: .6rem; font-weight: 700; font-size: 1.25rem; color: #fff; text-decoration: none; }
        .nav-logo-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg,#34d399,#10b981); box-shadow: 0 0 12px #34d399; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { color: #94a3b8; font-size: .875rem; text-decoration: none; transition: color .2s; }
        .nav-links a:hover { color: #fff; }
        .nav-cta {
          display: flex; gap: .75rem; align-items: center;
        }
        .btn-ghost { background: none; border: 1px solid rgba(255,255,255,.15); color: #e2e8f0; padding: .45rem 1.1rem; border-radius: 8px; font-size: .875rem; cursor: pointer; text-decoration: none; transition: border-color .2s, color .2s; }
        .btn-ghost:hover { border-color: rgba(255,255,255,.4); color: #fff; }
        .btn-primary {
          background: linear-gradient(135deg,#059669,#10b981);
          color: #fff; padding: .5rem 1.3rem; border-radius: 8px;
          font-size: .875rem; font-weight: 600; cursor: pointer;
          text-decoration: none; border: none;
          box-shadow: 0 0 20px rgba(16,185,129,.25);
          transition: box-shadow .25s, transform .2s;
        }
        .btn-primary:hover { box-shadow: 0 0 32px rgba(16,185,129,.45); transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 0 clamp(1.5rem, 6vw, 5rem);
          position: relative;
        }
        .hero-glow {
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
          color: #34d399; font-size: .78rem; font-weight: 600; letter-spacing: .06em;
          padding: .35rem 1rem; border-radius: 999px; margin-bottom: 2rem;
          text-transform: uppercase;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .hero h1 {
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 800; letter-spacing: -.03em; line-height: 1.08;
          color: #fff; max-width: 14ch; margin: 0 auto .5rem;
        }
        .hero h1 .gradient-text {
          background: linear-gradient(120deg,#34d399 20%,#6ee7b7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          max-width: 520px; margin: 1.25rem auto 2.5rem;
          font-size: clamp(1rem, 2vw, 1.15rem); color: #94a3b8; line-height: 1.7;
        }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary-lg {
          background: linear-gradient(135deg,#059669,#10b981);
          color: #fff; padding: .8rem 2rem; border-radius: 10px;
          font-size: 1rem; font-weight: 600; cursor: pointer;
          text-decoration: none; border: none;
          box-shadow: 0 0 28px rgba(16,185,129,.3);
          transition: box-shadow .25s, transform .2s;
          display: inline-flex; align-items: center; gap: .5rem;
        }
        .btn-primary-lg:hover { box-shadow: 0 0 44px rgba(16,185,129,.5); transform: translateY(-2px); }
        .btn-outline-lg {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.12);
          color: #e2e8f0; padding: .8rem 2rem; border-radius: 10px;
          font-size: 1rem; font-weight: 500; cursor: pointer;
          text-decoration: none; transition: background .2s, border-color .2s;
        }
        .btn-outline-lg:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.25); }

        /* ── Mockup card ── */
        .hero-mockup {
          margin-top: 4.5rem; position: relative;
          max-width: 780px; width: 100%;
        }
        .mockup-card {
          background: linear-gradient(145deg,rgba(15,23,42,1),rgba(30,41,59,.9));
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px; padding: 2rem;
          box-shadow: 0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04);
        }
        .mockup-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .mockup-title { font-size: .8rem; font-weight: 600; color: #64748b; letter-spacing: .08em; text-transform: uppercase; }
        .mockup-badge { font-size: .72rem; padding: .25rem .7rem; border-radius: 999px; background: rgba(52,211,153,.12); color: #34d399; font-weight: 600; }
        .mockup-amount { font-size: 2.8rem; font-weight: 800; color: #fff; letter-spacing: -.02em; }
        .mockup-amount span { font-size: 1.5rem; color: #64748b; font-weight: 400; vertical-align: super; margin-right: .15rem; }
        .mockup-change { font-size: .8rem; color: #34d399; margin-top: .25rem; }
        .mockup-bars { display: flex; align-items: flex-end; gap: .5rem; height: 80px; margin-top: 1.5rem; }
        .bar {
          flex: 1; border-radius: 6px 6px 0 0;
          background: rgba(255,255,255,.06);
          animation: barGrow 1s ease forwards;
          transform-origin: bottom;
        }
        .bar-active { background: linear-gradient(180deg,#34d399,#059669); }
        @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        .mockup-categories { display: flex; gap: .75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .cat-chip {
          display: flex; align-items: center; gap: .45rem;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px; padding: .4rem .75rem; font-size: .78rem; color: #94a3b8;
        }
        .cat-dot { width: 7px; height: 7px; border-radius: 50%; }

        /* ── Stats ── */
        .stats-section {
          padding: 4rem clamp(1.5rem, 6vw, 5rem);
          border-top: 1px solid rgba(255,255,255,.06);
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .stats-grid { display: flex; justify-content: center; gap: clamp(2rem, 6vw, 6rem); flex-wrap: wrap; }
        .stat-item { text-align: center; }
        .stat-number { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; color: #fff; letter-spacing: -.02em; }
        .stat-label { font-size: .82rem; color: #64748b; margin-top: .3rem; font-weight: 500; }

        /* ── Features ── */
        .features-section { padding: 6rem clamp(1.5rem, 6vw, 5rem); }
        .section-label { font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #34d399; margin-bottom: .75rem; }
        .section-title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: #fff; letter-spacing: -.02em; line-height: 1.15; max-width: 28ch; }
        .section-sub { color: #64748b; margin-top: .75rem; font-size: 1rem; max-width: 44ch; line-height: 1.7; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 3.5rem; }
        .feature-card {
          background: rgba(15,23,42,.7); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 1.75rem;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          cursor: default;
        }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,.14); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
        .feature-icon {
          width: 52px; height: 52px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.1rem;
        }
        .icon-emerald { background: rgba(16,185,129,.12); color: #34d399; }
        .icon-violet  { background: rgba(139,92,246,.12); color: #a78bfa; }
        .icon-amber   { background: rgba(245,158,11,.12); color: #fbbf24; }
        .icon-sky     { background: rgba(14,165,233,.12); color: #38bdf8; }
        .feature-title { font-size: 1.05rem; font-weight: 700; color: #e2e8f0; margin-bottom: .5rem; }
        .feature-desc { font-size: .875rem; color: #64748b; line-height: 1.65; }

        /* ── How it works ── */
        .how-section { padding: 6rem clamp(1.5rem, 6vw, 5rem); background: rgba(15,23,42,.5); }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 3.5rem; position: relative; }
        .step { text-align: center; }
        .step-number {
          width: 48px; height: 48px; border-radius: 50%;
          border: 2px solid rgba(52,211,153,.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800; color: #34d399;
          margin: 0 auto 1rem;
          background: rgba(52,211,153,.06);
        }
        .step-title { font-size: .95rem; font-weight: 700; color: #e2e8f0; margin-bottom: .4rem; }
        .step-desc { font-size: .82rem; color: #64748b; line-height: 1.6; }

        /* ── CTA ── */
        .cta-section {
          padding: 6rem clamp(1.5rem, 6vw, 5rem);
          text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; bottom: -150px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-card {
          background: linear-gradient(145deg,rgba(15,23,42,.9),rgba(30,41,59,.8));
          border: 1px solid rgba(52,211,153,.2);
          border-radius: 24px; padding: clamp(2.5rem, 5vw, 4rem);
          max-width: 640px; margin: 0 auto;
          box-shadow: 0 0 60px rgba(16,185,129,.08);
        }
        .cta-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; color: #fff; letter-spacing: -.02em; margin-bottom: .75rem; }
        .cta-sub { font-size: .95rem; color: #64748b; line-height: 1.7; margin-bottom: 2rem; }
        .cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ── */
        .footer {
          padding: 2.5rem clamp(1.5rem, 6vw, 5rem);
          border-top: 1px solid rgba(255,255,255,.06);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
        }
        .footer-copy { font-size: .8rem; color: #475569; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a { font-size: .8rem; color: #475569; text-decoration: none; transition: color .2s; }
        .footer-links a:hover { color: #94a3b8; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .nav-links { display: none; }
          .hero-mockup { margin-top: 3rem; }
        }
      `}</style>

      <div className="landing-root">
        {/* ── NAV ── */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-dot" />
            FinSync
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
          </ul>
          <div className="nav-cta">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero" style={{ paddingTop: "64px" }}>
          <div className="hero-glow" />
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Smarter finances start here
          </div>
          <h1>
            Take control of<br />
            your <span className="gradient-text">money</span>
          </h1>
          <p className="hero-sub">
            FinSync is the all-in-one personal finance tracker that helps you understand spending, set budgets, and reach your goals — effortlessly.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary-lg">
              Start for free <IconArrow />
            </Link>
            <Link href="/login" className="btn-outline-lg">
              I have an account
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="hero-mockup">
            <div className="mockup-card">
              <div className="mockup-header">
                <span className="mockup-title">Monthly Overview</span>
                <span className="mockup-badge">↑ 12% vs last month</span>
              </div>
              <div className="mockup-amount"><span>$</span>4,280</div>
              <div className="mockup-change">Saved $620 this month</div>
              <div className="mockup-bars">
                {[40, 65, 50, 80, 60, 100, 75, 55, 90, 70, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`bar${i === 11 ? " bar-active" : ""}`}
                    style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              <div className="mockup-categories">
                {[
                  { label: "Food", color: "#34d399" },
                  { label: "Transport", color: "#6ee7b7" },
                  { label: "Housing", color: "#a78bfa" },
                  { label: "Entertainment", color: "#fbbf24" },
                  { label: "Savings", color: "#38bdf8" },
                ].map((c) => (
                  <div key={c.label} className="cat-chip">
                    <span className="cat-dot" style={{ background: c.color }} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section">
          <div className="stats-grid">
            {[
              // { val: 12000, suffix: "+", label: "Active users" },
              { val: 98, suffix: "%", label: "Uptime" },
              { val: 5, suffix: " min", label: "To get started" },
              { val: 0, suffix: " $", label: "Cost forever" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-number"><Counter to={s.val} suffix={s.suffix} /></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="features-section" id="features">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need to stay on track</h2>
          <p className="section-sub">Purpose-built tools to give you a clear picture of your finances — today, this month, and beyond.</p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon icon-${f.color}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="how-section" id="how-it-works">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Up and running in minutes</h2>
          <div className="steps">
            {[
              { n: "1", title: "Create your account", desc: "Sign up in seconds with your email or Google account." },
              { n: "2", title: "Log your transactions", desc: "Add expenses manually or let FinSync categorise them automatically." },
              { n: "3", title: "Set your budgets", desc: "Define monthly limits for each spending category." },
              { n: "4", title: "Watch your money grow", desc: "Hit your savings goals and celebrate every win." },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-number">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-glow" />
          <div className="cta-card">
            <h2 className="cta-title">Ready to sync your finances?</h2>
            <p className="cta-sub">Join thousands of people who already use FinSync to build healthier money habits — no credit card required.</p>
            <div className="cta-actions">
              <Link href="/register" className="btn-primary-lg">
                Create free account <IconArrow />
              </Link>
              <Link href="/login" className="btn-outline-lg">Sign in</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <span className="footer-copy">© {new Date().getFullYear()} FinSync. All rights reserved.</span>
          <div className="footer-links">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
