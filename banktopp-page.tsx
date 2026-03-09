/**
 * BANKTOPP.COM — NorwegianSpark SA
 * Complete affiliate comparison site — single .tsx file
 * Drag into v0.dev → deploy to Vercel
 *
 * Plans 1–8 implemented:
 * 1. Tech stack (Vite + React 19 + TS + Router v7 + Tailwind + lucide-react + framer-motion + sonner + zod)
 * 2. Design system (dark-first, Gold #F5C842, Jade #2DD4BF, Playfair Display + DM Sans)
 * 3. File architecture (all components inlined as functions)
 * 4. Data layer (Bank interface, 8 categories, 60 seed items)
 * 5. Full page inventory (Home, Banks, Category, Detail, Compare, Quiz, About, Advertise, Privacy, Terms, 404)
 * 6. Performance rules (lazy sections, no SVG noise, CLS-safe)
 * 7. Accessibility rules (WCAG AA, skip nav, aria-labels, landmarks)
 * 8. Master system prompt encoded as config
 *
 * NorwegianSpark SA · Org no. 834 984 172
 * norwegianspark@gmail.com · +47 99 73 74 67
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import {
  Search, Star, ChevronDown, ChevronUp, ArrowRight, Shield, TrendingUp,
  Award, Users, CheckCircle, XCircle, ExternalLink, Menu, X, BarChart2,
  Zap, DollarSign, Grid3X3, List, ChevronLeft, ChevronRight,
  Building2, BookOpen, Mail, Phone, MapPin, AlertTriangle,
  Sparkles, Crown, ArrowUpDown, RotateCcw, Send
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg: #04040A;
    --card-bg: #0F0F1A;
    --card-border: rgba(255,255,255,0.07);
    --card-hover: rgba(245,200,66,0.12);
    --text-primary: #F0F0FA;
    --text-muted: rgba(255,255,255,0.55);
    --text-faint: rgba(255,255,255,0.30);
    --accent-primary: #F5C842;
    --accent-secondary: #2DD4BF;
    --accent-danger: #FF4D2B;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', Consolas, monospace;
    --radius: 12px;
    --glow-gold: 0 0 30px rgba(245,200,66,0.25), 0 0 60px rgba(245,200,66,0.1);
    --glow-jade: 0 0 30px rgba(45,212,191,0.25), 0 0 60px rgba(45,212,191,0.1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .skip-nav {
    position: absolute;
    top: -100px;
    left: 16px;
    background: var(--accent-primary);
    color: #000;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
    z-index: 9999;
    transition: top 0.2s;
    text-decoration: none;
  }
  .skip-nav:focus { top: 16px; }

  *:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 3px; }

  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  .ticker-track {
    display: flex;
    animation: ticker-scroll 40s linear infinite;
    will-change: transform;
    contain: layout style;
  }
  @keyframes ticker-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-track:hover { animation-play-state: paused; }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    contain: layout style;
  }
  .card:hover {
    border-color: rgba(245,200,66,0.3);
    box-shadow: var(--glow-gold);
    transform: translateY(-2px);
  }

  .btn-primary {
    background: var(--accent-primary);
    color: #000;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 15px;
    transition: opacity 0.15s, transform 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 14px;
    transition: border-color 0.15s, background 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-primary); background: rgba(245,200,66,0.06); }

  .tag-sponsored {
    background: rgba(245,200,66,0.15);
    color: var(--accent-primary);
    border: 1px solid rgba(245,200,66,0.3);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .apy-badge {
    font-family: var(--font-mono);
    color: var(--accent-secondary);
    font-size: 22px;
    font-weight: 500;
  }

  .mega-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius);
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(2, 220px);
    gap: 8px;
    min-width: 460px;
    z-index: 200;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }

  .star-filled { color: var(--accent-primary); }
  .star-empty { color: var(--text-faint); }

  .progress-bar {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }

  .disclaimer {
    color: var(--text-muted);
    font-size: 12px;
    padding: 12px 16px;
    background: rgba(255,77,43,0.05);
    border: 1px solid rgba(255,77,43,0.15);
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .affiliate-disclosure {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 6px;
  }

  input, select, textarea {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-body);
    padding: 10px 14px;
    font-size: 14px;
    width: 100%;
    transition: border-color 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent-primary);
    background: rgba(255,255,255,0.07);
    outline: none;
  }
  input::placeholder { color: var(--text-muted); }

  table { border-collapse: collapse; width: 100%; }
  th {
    background: rgba(255,255,255,0.04);
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    text-align: left;
    white-space: nowrap;
  }
  th:first-child { border-radius: 8px 0 0 8px; }
  th:last-child { border-radius: 0 8px 8px 0; }
  td {
    padding: 16px;
    border-bottom: 1px solid var(--card-border);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(245,200,66,0.03); }

  .accordion-content {
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);
  }

  .nav-link {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.15s;
    cursor: pointer;
  }
  .nav-link:hover, .nav-link.active { color: var(--text-primary); }

  .hero-gradient {
    background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,200,66,0.12) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 60%, rgba(45,212,191,0.08) 0%, transparent 50%),
                var(--bg);
  }

  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--card-border), transparent);
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    .ticker-track { animation: none; }
  }

  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .mega-menu { grid-template-columns: 1fr; min-width: 280px; }
  }
`;

// ─── DATA LAYER ───────────────────────────────────────────────────────────────

export interface Bank {
  id: string;
  slug: string;
  name: string;
  type: "neobank" | "traditional" | "savings" | "business" | "student" | "crypto";
  description: string;
  rating: number;
  is_sponsored: boolean;
  affiliate_url: string | null;
  logo_url: string | null;
  pros: string[];
  cons: string[];
  established: number | null;
  ratings: { app: number; fees: number; returns: number; access: number; support: number; security: number; };
  apy: number;
  monthly_fee: number;
  min_balance: number;
  fdic_insured: boolean;
  signup_bonus: number | null;
  atm_fee: boolean;
  mobile_only: boolean;
}

const SEED_BANKS: Bank[] = [
  // ── SPONSORED (top 3) ────────────────────────────────────────────────────
  { id:"b001",slug:"marcus-goldman",name:"Marcus by Goldman Sachs",type:"savings",description:"High-yield savings from Wall Street's most trusted name. No fees, no minimums.",rating:4.8,is_sponsored:true,affiliate_url:"https://example.com/go/marcus",logo_url:null,pros:["5.50% APY","No fees","FDIC insured","No minimum balance"],cons:["No checking account","No ATM access","Wire fees"],established:2016,ratings:{app:4.7,fees:5.0,returns:4.9,access:3.8,support:4.5,security:4.9},apy:5.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b002",slug:"sofi-bank",name:"SoFi Bank",type:"neobank",description:"All-in-one neobank with up to 4.60% APY when you set up direct deposit.",rating:4.7,is_sponsored:true,affiliate_url:"https://example.com/go/sofi",logo_url:null,pros:["4.60% APY with DD","$300 signup bonus","No account fees","Early paycheck"],cons:["APY requires direct deposit","Some fee reports"],established:2011,ratings:{app:4.8,fees:4.7,returns:4.6,access:4.5,support:4.4,security:4.8},apy:4.60,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false },
  { id:"b003",slug:"ally-bank",name:"Ally Bank",type:"savings",description:"Online bank pioneer offering consistent high yields since 2009.",rating:4.6,is_sponsored:true,affiliate_url:"https://example.com/go/ally",logo_url:null,pros:["4.35% APY","No monthly fees","Excellent mobile app","24/7 support"],cons:["No physical branches","Cash deposits complicated"],established:2009,ratings:{app:4.9,fees:4.8,returns:4.5,access:4.2,support:4.8,security:4.7},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── TRADITIONAL ──────────────────────────────────────────────────────────
  { id:"b004",slug:"chase-bank",name:"Chase Bank",type:"traditional",description:"America's largest bank with unmatched branch network and solid digital tools.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Massive ATM network","Strong credit card ecosystem","Chase Sapphire integration"],cons:["0.01% savings APY","Monthly fees","Large minimum balances"],established:1799,ratings:{app:4.3,fees:2.1,returns:1.5,access:5.0,support:4.0,security:4.5},apy:0.01,monthly_fee:15,min_balance:1500,fdic_insured:true,signup_bonus:200,atm_fee:false,mobile_only:false },
  { id:"b005",slug:"bank-of-america",name:"Bank of America",type:"traditional",description:"Full-service banking with Preferred Rewards program for loyal customers.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Preferred Rewards perks","Extensive branch network","Merrill Lynch integration"],cons:["Very low savings APY","Monthly maintenance fees","High overdraft fees"],established:1904,ratings:{app:4.2,fees:2.0,returns:1.4,access:4.9,support:3.8,security:4.4},apy:0.01,monthly_fee:12,min_balance:1500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b006",slug:"wells-fargo",name:"Wells Fargo",type:"traditional",description:"Nationwide bank with comprehensive financial services despite past controversies.",rating:3.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Ubiquitous ATMs","Full product suite","Long history"],cons:["Very low APY","High fees","Past regulatory issues"],established:1852,ratings:{app:3.9,fees:1.8,returns:1.3,access:4.8,support:3.6,security:4.2},apy:0.01,monthly_fee:10,min_balance:500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b007",slug:"us-bank",name:"U.S. Bank",type:"traditional",description:"Midwestern powerhouse with improving digital offerings and solid security.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Good mobile app","US Bank Shopper Cash Rewards","Solid security"],cons:["Below-average APY","Monthly fees","Limited ATM network vs Chase"],established:1863,ratings:{app:4.1,fees:2.5,returns:1.8,access:4.0,support:4.0,security:4.6},apy:0.05,monthly_fee:6.95,min_balance:0,fdic_insured:true,signup_bonus:400,atm_fee:false,mobile_only:false },
  { id:"b008",slug:"pnc-bank",name:"PNC Bank",type:"traditional",description:"Regional powerhouse known for its Virtual Wallet budgeting tools.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Virtual Wallet feature","Low Cashtow feature","Strong Midwest presence"],cons:["Limited APY","Monthly fees","Smaller national footprint"],established:1845,ratings:{app:4.2,fees:2.6,returns:1.9,access:3.9,support:4.1,security:4.5},apy:0.02,monthly_fee:7,min_balance:0,fdic_insured:true,signup_bonus:200,atm_fee:false,mobile_only:false },
  // ── HIGH-YIELD SAVINGS ───────────────────────────────────────────────────
  { id:"b009",slug:"citibank-savings",name:"Citi Accelerate Savings",type:"savings",description:"Competitive high-yield savings with the trust of a global banking giant.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","No minimum balance","Citi ecosystem benefits"],cons:["Available in select markets","Savings only account"],established:1812,ratings:{app:4.4,fees:4.2,returns:4.5,access:3.7,support:4.3,security:4.8},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b010",slug:"discover-bank",name:"Discover Online Savings",type:"savings",description:"Zero-fee high-yield savings backed by Discover's award-winning customer service.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.25% APY","No fees ever","Excellent CS rated #1","Cash back checking"],cons:["No ATM deposits","No local branches"],established:1986,ratings:{app:4.6,fees:5.0,returns:4.3,access:3.9,support:5.0,security:4.7},apy:4.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b011",slug:"american-express-savings",name:"American Express HYSA",type:"savings",description:"AmEx brings its premium brand to high-yield savings with consistently top rates.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","No minimums","AmEx brand trust","Easy transfers"],cons:["Savings only","No debit card","No ATM access"],established:1850,ratings:{app:4.5,fees:5.0,returns:4.5,access:3.6,support:4.6,security:4.9},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b012",slug:"synchrony-bank",name:"Synchrony Bank HYSA",type:"savings",description:"Consistently competitive rates with optional ATM card for a savings account.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY","ATM card available","No minimums"],cons:["No checking account","Limited features"],established:2003,ratings:{app:4.0,fees:4.8,returns:4.8,access:4.2,support:3.9,security:4.5},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b013",slug:"capital-one-360",name:"Capital One 360",type:"savings",description:"Popular online bank with no fees and a growing network of Capital One Cafés.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.25% APY","Capital One Cafés","No fees","Auto-Save feature"],cons:["Lower APY than top competitors","Cafés limited to major cities"],established:1994,ratings:{app:4.7,fees:4.9,returns:4.3,access:4.1,support:4.4,security:4.7},apy:4.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── NEOBANKS ─────────────────────────────────────────────────────────────
  { id:"b014",slug:"chime",name:"Chime",type:"neobank",description:"America's most popular neobank with SpotMe overdraft protection.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","SpotMe overdraft","Early paycheck","60K+ ATMs"],cons:["No APY on savings","Customer service issues","Banking restrictions"],established:2012,ratings:{app:4.5,fees:4.9,returns:2.0,access:4.6,support:3.2,security:4.3},apy:2.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b015",slug:"varo-bank",name:"Varo Bank",type:"neobank",description:"Full neobank with FDIC-insured savings and a path to 5.00% APY.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 5.00% APY (conditions)","No monthly fees","Early paycheck"],cons:["High APY has conditions","Limited customer service"],established:2015,ratings:{app:4.3,fees:4.5,returns:4.0,access:4.0,support:3.3,security:4.4},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b016",slug:"current-bank",name:"Current",type:"neobank",description:"Mobile-first bank with instant paycheck access and crypto trading.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Early paycheck","Crypto available","No overdraft fee","Teen accounts"],cons:["Lower interest rates","App-only"],established:2015,ratings:{app:4.4,fees:4.3,returns:2.5,access:3.8,support:3.5,security:4.2},apy:4.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b017",slug:"one-finance",name:"ONE Finance",type:"neobank",description:"Walmart-backed neobank with one of the highest APYs with direct deposit.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY with DD","No fees","Walmart integration","3% cashback at Walmart"],cons:["APY requires conditions","Limited features"],established:2019,ratings:{app:4.2,fees:4.6,returns:4.8,access:3.9,support:3.8,security:4.3},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b018",slug:"dave-banking",name:"Dave Banking",type:"neobank",description:"Banking app focused on helping you avoid overdraft fees with advances.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["$500 cash advance","No overdraft fees","Side hustle finder","Low fees"],cons:["Subscription fee","Low APY","Advance requires qualifying"],established:2016,ratings:{app:4.1,fees:3.8,returns:2.0,access:3.7,support:3.6,security:4.0},apy:2.00,monthly_fee:1,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── STUDENT ───────────────────────────────────────────────────────────────
  { id:"b019",slug:"student-bank-wells",name:"Wells Fargo Student",type:"student",description:"Fee-waived checking for college students with easy branch access on campus.",rating:3.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fee (student)","Large ATM network","Branch access"],cons:["Low APY","Fees post-graduation","Past controversies"],established:1852,ratings:{app:3.9,fees:3.5,returns:1.0,access:4.8,support:3.6,security:4.2},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b020",slug:"discover-student",name:"Discover Cashback Debit",type:"student",description:"1% cashback on debit with zero fees — perfect for building financial habits.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["1% cashback on debit","No fees","No minimum balance","ATM fee reimbursement"],cons:["No savings APY","No branches","Limited cash deposits"],established:1986,ratings:{app:4.6,fees:5.0,returns:3.0,access:3.8,support:4.9,security:4.7},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  { id:"b021",slug:"chase-student",name:"Chase College Checking",type:"student",description:"Free for college students up to 5 years with Chase branch and ATM access.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Free for 5 years","Massive ATM network","Chase Pay integration","Good app"],cons:["Becomes paid post-school","Low savings APY","Not best for non-Chase ecosystem"],established:1799,ratings:{app:4.3,fees:3.8,returns:1.0,access:5.0,support:4.0,security:4.5},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:100,atm_fee:false,mobile_only:false },
  // ── BUSINESS ─────────────────────────────────────────────────────────────
  { id:"b022",slug:"relay-business",name:"Relay Business Banking",type:"business",description:"Modern business banking built for growing companies — 20 checking accounts, unlimited cards.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","20 checking accounts","50 virtual cards","Accounting integrations"],cons:["No interest on deposits","No cash deposits","No physical presence"],established:2018,ratings:{app:4.7,fees:5.0,returns:2.0,access:3.5,support:4.5,security:4.6},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b023",slug:"mercury-bank",name:"Mercury",type:"business",description:"Banking built for startups with venture-focused features and superior UX.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Excellent UX","API access","Treasury accounts (yield)","FDIC up to $5M via sweep"],cons:["Not for all business types","Limited physical presence","Wait-list for new features"],established:2019,ratings:{app:4.9,fees:4.8,returns:3.5,access:3.4,support:4.4,security:4.8},apy:4.79,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b024",slug:"bluevine-business",name:"Bluevine Business",type:"business",description:"2.0% APY on business checking — ideal for cash-rich small businesses.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2.00% APY","No monthly fee","Free ACH","Bluevine Line of Credit"],cons:["2.0% APY requires $500/mo spend","Limited integrations"],established:2013,ratings:{app:4.3,fees:4.7,returns:4.0,access:3.6,support:4.1,security:4.4},apy:2.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MORE HIGH-YIELD ───────────────────────────────────────────────────────
  { id:"b025",slug:"bask-bank",name:"Bask Bank",type:"savings",description:"Earn American Airlines miles instead of (or in addition to) cash interest.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["AA Miles option","2.45 miles/$ or 5.10% APY","No fees","No minimum"],cons:["Miles value varies","Savings only","Less known brand"],established:2020,ratings:{app:4.0,fees:4.9,returns:4.5,access:3.5,support:4.0,security:4.5},apy:5.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b026",slug:"bread-savings",name:"Bread Savings",type:"savings",description:"Simple, competitive high-yield savings with terms up to 5 years.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.15% APY (12-month CD)","5.20% on select CDs","No monthly fees","CD options"],cons:["CDs have early withdrawal penalty","Savings only"],established:2021,ratings:{app:4.1,fees:4.8,returns:4.9,access:3.5,support:4.0,security:4.5},apy:5.15,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b027",slug:"western-alliance",name:"Western Alliance Bank",type:"savings",description:"Institution-grade high-yield savings now available to individual consumers.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.36% APY","No monthly fee","Large deposit limits","Stable institution"],cons:["Less consumer-facing UX","Limited app features"],established:1994,ratings:{app:3.8,fees:4.8,returns:5.0,access:3.5,support:4.1,security:4.7},apy:5.36,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b028",slug:"ufo-savings",name:"UFB Direct",type:"savings",description:"Consistently top-3 savings rates with no fees and a simple interface.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No monthly fee","Free ATM card","No minimum balance"],cons:["Portal UX is dated","No checking account","Limited features"],established:2004,ratings:{app:3.7,fees:4.9,returns:5.0,access:4.3,support:4.0,security:4.6},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b029",slug:"popular-direct",name:"Popular Direct",type:"savings",description:"Puerto Rico-based banking giant with some of the best CD rates in the US.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","High CD rates","FDIC insured","Stable institution"],cons:["Minimum $100 to open","Limited product range","Older UX"],established:1893,ratings:{app:3.8,fees:4.5,returns:4.9,access:3.3,support:3.9,security:4.7},apy:5.30,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b030",slug:"cit-bank",name:"CIT Bank Platinum Savings",type:"savings",description:"Earn 5.05% APY on balances of $5,000+ with First Citizens subsidiary.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.05% APY ($5k+)","No monthly fees","First Citizens safety"],cons:["APY drops for smaller balances","$5,000 threshold","Limited UX"],established:2000,ratings:{app:4.0,fees:4.6,returns:4.7,access:3.6,support:4.0,security:4.6},apy:5.05,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MORE NEOBBANKS ────────────────────────────────────────────────────────
  { id:"b031",slug:"revolut",name:"Revolut",type:"neobank",description:"Global fintech with multi-currency accounts, crypto, and stock trading.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Multi-currency","Crypto & stocks","Good FX rates","Metal card"],cons:["Not FDIC if no partner bank","Premium features cost","CS variable"],established:2015,ratings:{app:4.8,fees:3.8,returns:3.5,access:4.5,support:3.4,security:4.5},apy:3.50,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b032",slug:"wise-account",name:"Wise Account",type:"neobank",description:"The best account for international transfers with real exchange rates.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Real exchange rates","50+ currencies","Low fees","Interest on balances"],cons:["Not a full bank","No cash deposits","Transfer focused"],established:2011,ratings:{app:4.7,fees:4.5,returns:3.8,access:4.0,support:4.2,security:4.6},apy:4.10,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b033",slug:"step-teen",name:"Step (Teen Banking)",type:"student",description:"Build credit from day one with Step's teen-focused secured card and banking.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Credit building for teens","No fees","Parental controls","5% APY savings"],cons:["Under 18 or parent account","Limited features for adults"],established:2019,ratings:{app:4.5,fees:5.0,returns:4.2,access:3.8,support:4.0,security:4.4},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b034",slug:"greenlight-family",name:"Greenlight",type:"student",description:"Family banking with chores, allowances, investing for kids, and parental controls.",rating:4.5,is_sponsored:false,affiliate_url:null,pros:["5 family members","Chore tracking","Kids investing","Strong parental controls"],cons:["Monthly fee $5.99+","No savings APY","App focused"],established:2014,affiliate_url:null,logo_url:null,ratings:{app:4.7,fees:3.8,returns:3.5,access:4.0,support:4.3,security:4.6},apy:2.00,monthly_fee:5.99,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b035",slug:"aspiration",name:"Aspiration Plus",type:"neobank",description:"Sustainable bank that plants trees with every purchase and offers 3-5% APY.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY on savings","Plant trees feature","Pay what is fair","1% cashback on conscience stores"],cons:["$7.99/mo for Plus","Main APY requires conditions","Smaller institution"],established:2015,ratings:{app:4.1,fees:3.5,returns:4.5,access:3.5,support:3.8,security:4.2},apy:5.00,monthly_fee:7.99,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── MORE TRADITIONAL ──────────────────────────────────────────────────────
  { id:"b036",slug:"citizens-bank",name:"Citizens Bank",type:"traditional",description:"New England's largest bank with improving digital tools and competitive CD rates.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Solid regional presence","Good CD rates","Citizens Access HYSA"],cons:["Monthly fees","Low standard savings APY","Branch-heavy model"],established:1828,ratings:{app:4.0,fees:2.8,returns:2.5,access:4.1,support:3.9,security:4.4},apy:0.06,monthly_fee:4.99,min_balance:0,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false },
  { id:"b037",slug:"regions-bank",name:"Regions Bank",type:"traditional",description:"Southeast's dominant bank with LifeGreen Savings and Now Banking options.",rating:3.8,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Strong SE presence","Now Banking alternative","Home loan focus"],cons:["Low savings APY","$8/mo fee","Poor digital experience"],established:1971,ratings:{app:3.8,fees:2.6,returns:1.8,access:4.3,support:3.8,security:4.3},apy:0.01,monthly_fee:8,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b038",slug:"td-bank",name:"TD Bank",type:"traditional",description:"America's Most Convenient Bank with extended hours including Sundays.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Extended branch hours","Sunday banking","Strong East Coast presence","Good CS"],cons:["Very low APY","Monthly fees","High minimum balances"],established:1855,ratings:{app:4.0,fees:2.4,returns:1.6,access:4.5,support:4.2,security:4.3},apy:0.01,monthly_fee:5.99,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MORE BUSINESS ────────────────────────────────────────────────────────
  { id:"b039",slug:"novo-business",name:"Novo",type:"business",description:"Small business checking with free ACH, integrations, and reserve accounts.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","100+ integrations","Reserve accounts","Invoice creation"],cons:["No APY","No cash deposits","Limited wire functionality"],established:2016,ratings:{app:4.5,fees:5.0,returns:1.5,access:3.4,support:4.2,security:4.5},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b040",slug:"found-self-employed",name:"Found (Self-Employed)",type:"business",description:"Banking and taxes in one app for freelancers and self-employed individuals.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Auto tax savings","1099 tracking","Expense categorization","No fees"],cons:["Freelancer focus","No payroll","Limited features for corps"],established:2019,ratings:{app:4.6,fees:5.0,returns:2.0,access:3.5,support:4.3,security:4.5},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── COMMUNITY / CREDIT UNIONS ────────────────────────────────────────────
  { id:"b041",slug:"alliant-credit-union",name:"Alliant Credit Union",type:"savings",description:"One of the nation's largest credit unions with 3.10% APY and top-rated CS.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.10% APY","No monthly fee","80K+ fee-free ATMs","Credit union member perks"],cons:["Membership required (easy)","Lower APY than some competitors"],established:1935,ratings:{app:4.4,fees:4.7,returns:3.8,access:4.5,support:4.7,security:4.8},apy:3.10,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b042",slug:"navy-federal",name:"Navy Federal Credit Union",type:"savings",description:"Best rates for active military and veterans — 6.17% APY on Share Savings.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 6.17% APY","Military benefits","No fees","Low loan rates"],cons:["Military/family only","Limited public access"],established:1933,ratings:{app:4.5,fees:4.8,returns:5.0,access:4.0,support:4.6,security:4.9},apy:6.17,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── HIGH-YIELD & INVESTMENT-LINKED (formerly filler — now comprehensive data) ─
  { id:"b043",slug:"milli-bank",name:"Milli Bank",type:"savings",description:"App-native savings with 5.50% APY, envelope-style Jars budgeting, real-time rate alerts, and automatic round-up savings. Built on nbkc Bank FDIC infrastructure.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY — top-of-market rate","Jars envelope budgeting system","Zero monthly fees","Instant rate-change push notifications","Automatic round-up savings feature"],cons:["Founded 2022 — limited track record","No checking account companion","Mobile-only access","No debit card for savings"],established:2022,ratings:{app:4.5,fees:5.0,returns:5.0,access:3.2,support:3.9,security:4.3},apy:5.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b044",slug:"boost-infinite",name:"Boost Infinite",type:"neobank",description:"Amazon-backed neobank delivering 5.00% APY on savings with Prime ecosystem integration, 2-day early paycheck, and Amazon shopping rewards on every purchase.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY with direct deposit","Amazon/Prime ecosystem integration","Early paycheck up to 2 days","No account fees","Amazon cashback rewards"],cons:["Best APY requires Prime membership","Limited non-Amazon features","Brand new to banking space","CS infrastructure still maturing"],established:2022,ratings:{app:4.2,fees:4.6,returns:4.6,access:3.9,support:3.7,security:4.2},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b045",slug:"betterment-cash",name:"Betterment Cash Reserve",type:"savings",description:"Betterment sweeps deposits across 13 partner banks for 5.50% APY with up to $2M FDIC — the smartest cash account for investor-savers.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY","$2M+ FDIC via 13-bank sweep network","Seamless Betterment investing link","No fees, no minimums","Automated cash optimization engine"],cons:["Not a direct bank — partner network dependent","1-2 day transfer lag","Betterment account required"],established:2010,ratings:{app:4.7,fees:5.0,returns:5.0,access:3.7,support:4.3,security:4.8},apy:5.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b046",slug:"wealthfront-cash",name:"Wealthfront Cash Account",type:"savings",description:"Wealthfront sweeps cash across 32 FDIC banks for 5.50% APY and an industry-leading $8M FDIC protection — the ultimate high-net-worth cash solution.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY","$8M FDIC — highest in market","Autopilot auto-invest feature","No fees, no minimums","Same-day transfers to Wealthfront brokerage"],cons:["Not a bank charter — partner-dependent","Investment account needed for full features","Limited bill pay functionality"],established:2008,ratings:{app:4.8,fees:5.0,returns:5.0,access:3.6,support:4.2,security:4.9},apy:5.50,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b047",slug:"m1-high-yield",name:"M1 High-Yield Savings",type:"savings",description:"M1 Plus members earn 5.00% APY with automated invest-from-savings Smart Transfer rules that keep your money working as hard as you do.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY for M1 Plus members","Smart Transfer rules (save to invest automatically)","No transaction fees","Portfolio integration for wealth building","Fractional share investing alongside savings"],cons:["$3/mo M1 Plus fee after free trial","Investment-first philosophy — savings is secondary","Not suitable as sole banking relationship"],established:2015,ratings:{app:4.6,fees:3.9,returns:4.8,access:3.6,support:4.1,security:4.5},apy:5.00,monthly_fee:3,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b048",slug:"axos-bank",name:"Axos Bank HYSA",type:"savings",description:"Full-service online bank pioneering AI-driven banking since 2000 — cashback checking, mortgage origination, and no-fee savings under one digital roof.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Full product suite (checking, savings, mortgage, loans)","Cashback checking up to 1%","No monthly fees","Strong 25-year security track record","AI-powered financial insights dashboard"],cons:["Savings APY trails top HYSA competitors","App UI is dated vs. neobanks","Customer service inconsistency reports"],established:2000,ratings:{app:4.1,fees:4.5,returns:3.9,access:3.9,support:3.9,security:4.5},apy:0.61,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b049",slug:"nbkc-bank",name:"nbkc Bank",type:"neobank",description:"Kansas City-chartered online bank with zero fees across every product — no overdraft, no NSF, no monthly, no wire fees. Zelle included free.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["100% fee-free — no overdraft, NSF, monthly, or wire fees","No minimums ever","Strong Kansas City-based CS team","Zelle + ACH + wires all free","Free cashier checks"],cons:["APY below top-tier HYSA","Less national brand recognition","Fewer premium app features than top neobanks"],established:1999,ratings:{app:4.3,fees:5.0,returns:2.6,access:4.0,support:4.6,security:4.6},apy:1.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b050",slug:"sallie-mae-savings",name:"Sallie Mae High-Yield Savings",type:"savings",description:"Sallie Mae Bank delivers 4.65% APY — trusted brand from 50+ years in education finance offering competitive savings rates.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.65% APY — strong mid-tier rate","No fees, no minimums","50-year brand trust in student finance","Clean web and app interface"],cons:["Savings only — no checking account","No ATM access or debit card","Not a full banking relationship"],established:1972,ratings:{app:4.0,fees:4.9,returns:4.6,access:3.5,support:4.1,security:4.5},apy:4.65,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b051",slug:"quontic-bank",name:"Quontic Bank",type:"savings",description:"NYC Community Development Financial Institution — the only US bank offering Bitcoin cashback on debit purchases alongside 4.50% APY savings.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["1.5% Bitcoin cashback on debit purchases","4.50% APY savings account","No monthly fees","FDIC insured","CRA-designated community development bank"],cons:["Bitcoin rewards subject to crypto market volatility","$100 opening deposit required","Smaller ATM network than major banks"],established:2005,ratings:{app:4.2,fees:4.7,returns:4.5,access:3.8,support:4.1,security:4.5},apy:4.50,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b052",slug:"live-oak-bank",name:"Live Oak Bank",type:"savings",description:"America's #1 SBA lender (by volume) entered consumer savings with 5.30% APY — $10B+ institutional bank with retail-accessible rates.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","$10B+ asset base for institutional stability","No monthly fees","Strong FDIC-member standing since 2008"],cons:["Consumer-facing savings only (no checking)","No debit or ATM card","Business-first brand identity"],established:2008,ratings:{app:4.1,fees:4.9,returns:4.9,access:3.5,support:4.3,security:4.8},apy:5.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b053",slug:"citizens-access",name:"Citizens Access",type:"savings",description:"Citizens Bank digital division offering 4.65% APY HYSA and CDs — $190B-asset bank backing with zero-fee digital front-end.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.65% APY HYSA","1-yr CD at 5.00%","No monthly maintenance fees","$190B Citizens Bank institutional backing","CD ladder options (6mo to 5yr)"],cons:["$5,000 minimum opening deposit","Savings and CDs only — no checking","Transfers limited to linked external accounts"],established:2018,ratings:{app:4.2,fees:4.7,returns:4.6,access:3.6,support:4.2,security:4.7},apy:4.65,monthly_fee:0,min_balance:5000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b054",slug:"affirm-savings",name:"Affirm Savings",type:"savings",description:"BNPL pioneer Affirm enters savings with 5.35% APY via Cross River Bank — high yield, zero fees, zero minimums, no debt-product baggage.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY — top-5 in market","Zero fees, zero minimums","FDIC insured via Cross River Bank","Clean, simple interface","Affirm brand trust from 18M+ borrowers"],cons:["Savings only — no checking or debit card","BNPL brand association may concern some","Limited customer service channels"],established:2012,ratings:{app:4.1,fees:5.0,returns:5.0,access:3.3,support:3.9,security:4.5},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b055",slug:"first-internet-bank",name:"First Internet Bank",type:"savings",description:"The original online bank (federally chartered 1999) — 25-year pioneer offering 5.01% APY and best-in-class CD ladder tools.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["25-year online banking track record","5.01% APY savings","Excellent CD rate ladder (3-60 month)","Full personal and business banking","FDIC insured since 1999"],cons:["Website UX reflects legacy architecture","App ratings trail modern neobanks","CD rates on some terms below competitors"],established:1999,ratings:{app:3.9,fees:4.5,returns:4.0,access:3.6,support:4.1,security:4.6},apy:5.01,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b056",slug:"prime-alliance-bank",name:"Prime Alliance Bank",type:"savings",description:"Weber County, Utah community bank with 20-year stability record offering 5.30% APY savings to customers nationwide — no app required.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY — top 10 nationally","No monthly fees","FDIC insured since 2004","No minimum balance"],cons:["No mobile app (website only)","Limited brand footprint outside Utah","No additional consumer product lines"],established:2004,ratings:{app:3.5,fees:4.7,returns:5.0,access:3.3,support:4.0,security:4.4},apy:5.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b057",slug:"cloudbank-24",name:"CloudBank 24/7",type:"savings",description:"BaaS-powered savings product delivering 5.26% APY 24/7 — built on Grasshopper Bank regulated infrastructure with real-time rate tracking.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.26% APY — top-tier","No fees, no minimums","Regulated BaaS infrastructure","FDIC insured"],cons:["Not a standalone bank charter","Limited product range beyond savings","Less brand history (est. 2021)"],established:2021,ratings:{app:4.1,fees:5.0,returns:5.0,access:3.3,support:3.7,security:4.3},apy:5.26,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b058",slug:"brilliant-bank",name:"Brilliant Bank",type:"savings",description:"Harrison, Arkansas community bank with 65-year stability record now offering 5.35% APY to online savers nationwide — FDIC insured since 1959.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","65 years of banking stability","FDIC insured since 1959","No monthly fees","Consistent top-tier rate history"],cons:["$1,000 minimum deposit","No mobile app — web portal only","Very limited product breadth"],established:1959,ratings:{app:3.5,fees:4.8,returns:5.0,access:3.1,support:4.1,security:4.7},apy:5.35,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b059",slug:"upgrade-premier",name:"Upgrade Premier Savings",type:"savings",description:"Upgrade combines 5.07% APY with free credit score monitoring and personal loan pre-approval — banking designed to improve total financial health.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.07% APY","Free credit monitoring (VantageScore 3.0)","Personal loan pre-qualification in-app","No monthly fees","Credit health improvement dashboard"],cons:["$1,000 minimum for best APY","Fintech BaaS — not direct bank charter","Customer service wait times reported"],established:2016,ratings:{app:4.4,fees:4.7,returns:4.8,access:3.7,support:4.0,security:4.5},apy:5.07,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b060",slug:"ivy-bank",name:"Ivy Bank",type:"savings",description:"Cambridge Savings Bank digital brand (est. 1853) offers 5.30% APY — 170-year institutional stability meets modern digital savings.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","Cambridge Savings Bank backing (est. 1853)","No monthly fees","170-year institutional security infrastructure","Conservative lending practices"],cons:["$2,500 minimum balance","Savings only — no checking","Very limited branch access"],established:2021,ratings:{app:4.0,fees:4.6,returns:4.9,access:3.4,support:4.1,security:4.8},apy:5.30,monthly_fee:0,min_balance:2500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── CREDIT UNIONS ─────────────────────────────────────────────────────────────
  { id:"b061",slug:"pentagon-federal",name:"PenFed Credit Union",type:"savings",description:"Pentagon Federal Credit Union: 2.8M members, open to all via $5 donation, delivering premium savings rates and the best credit card rewards in the credit union space.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 4.00% APY on savings","Ultra-low auto loan rates (from 4.44% APR)","Best credit card rewards in CU space (2% everywhere)","80K+ fee-free ATMs","Open membership via $5 to Voices for America's Troops"],cons:["APY slightly lags top HYSA","Online experience less polished than top neobanks","Customer service wait times during peak periods"],established:1935,ratings:{app:4.4,fees:4.8,returns:4.2,access:4.5,support:4.7,security:4.8},apy:4.00,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b062",slug:"first-tech-federal",name:"First Tech Federal Credit Union",type:"savings",description:"Silicon Valley credit union serving tech employees at Amazon, Google, Microsoft, Intel — fintech-grade UX combined with credit union member economics.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.50% APY on savings","Exclusive tech-employee financial benefits","Award-winning digital banking app","Strong mortgage and auto loan portfolio","52K+ ATMs nationwide"],cons:["Membership tied to tech employers or Computer History Museum ($15)","Savings rate below top HYSA","Geographic concentration in tech hubs"],established:1952,ratings:{app:4.7,fees:4.8,returns:3.8,access:4.3,support:4.6,security:4.9},apy:3.50,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b063",slug:"consumers-credit-union",name:"Consumers Credit Union",type:"savings",description:"Illinois CU with one of the highest rewards checking yields in America — up to 5.00% APY on balances with nationwide open membership.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 5.00% APY on Rewards Checking — highest checking yield available","Open membership (anyone can join for $5)","No monthly fee","30K+ ATMs","ATM fee reimbursements up to unlimited"],cons:["APY requires 12+ debit transactions plus $500 qualifying spend per month","5% APY capped at $10,000 balance","Rewards Checking — not traditional savings"],established:1930,ratings:{app:4.3,fees:4.7,returns:4.8,access:4.2,support:4.5,security:4.7},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b064",slug:"lake-michigan-credit-union",name:"Lake Michigan Credit Union",type:"savings",description:"Max Checking from LMCU delivers 3.00% APY with zero qualifying requirements — best no-strings interest checking in the nation for balances up to $15,000.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.00% APY Max Checking — NO qualifying requirements at all","Free ATM fee reimbursements (up to $15/mo)","Open membership via $5 ALS Foundation donation","No monthly fee","Exceptional Michigan community banking roots"],cons:["3.00% APY capped at $15,000 balance","Michigan-focused branches (55 locations)","Online UX functional but not neobank-level polished"],established:1933,ratings:{app:4.1,fees:4.8,returns:4.0,access:4.2,support:4.5,security:4.6},apy:3.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  { id:"b065",slug:"connexus-credit-union",name:"Connexus Credit Union",type:"savings",description:"Wisconsin CU with the absolute highest rewards checking yield in America — 6.17% APY on balances up to $25,000 with straightforward monthly requirements.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["6.17% APY on High-Yield Checking — highest checking rate in US","Requirements: 15 monthly debit transactions plus e-statements","Open membership via $5 Connex Foundation donation","No monthly fee","55,000+ fee-free ATMs nationwide"],cons:["6.17% APY applies only to first $25,000","Balance over $25K earns just 0.25%","High transaction requirement may not suit all"],established:1935,ratings:{app:4.4,fees:4.8,returns:5.0,access:4.3,support:4.6,security:4.7},apy:6.17,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── INTERNATIONAL MULTI-CURRENCY ──────────────────────────────────────────────
  { id:"b066",slug:"n26-account",name:"N26 US",type:"neobank",description:"Berlin-born global neobank with 8M customers — fee-free US banking, Spaces sub-accounts, real Mastercard exchange rates, and minimalist design.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Spaces virtual accounts (up to 10)","Real Mastercard exchange rates","No foreign exchange fees","Sleek minimalist interface","Instant push notifications for all transactions"],cons:["Limited US product vs. European N26","No savings APY currently in US","Customer service response time concerns","Not available in all US states"],established:2013,ratings:{app:4.6,fees:4.0,returns:2.5,access:4.0,support:3.5,security:4.6},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b067",slug:"wise-interest",name:"Wise Interest Multi-Currency",type:"neobank",description:"Wise Interest earns yield on USD, GBP, EUR simultaneously via BlackRock funds — the world's only true multi-currency high-yield account for global workers.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Multi-currency yield: USD 4.44%, GBP 4.90%, EUR 3.55%","Hold 40+ currencies simultaneously","Real exchange rates (no markup) on 50+ currencies","Excellent for international workers and expats","Visa/Mastercard debit in 150+ countries"],cons:["NOT FDIC insured — BlackRock money market fund","Transfer fees still apply on currency exchange","Not a full bank in most countries","Limited customer service channels"],established:2011,ratings:{app:4.8,fees:4.2,returns:4.4,access:4.6,support:4.3,security:4.7},apy:4.44,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── PREMIUM WEALTH BANKING ────────────────────────────────────────────────────
  { id:"b068",slug:"charles-schwab-checking",name:"Charles Schwab Investor Checking",type:"savings",description:"The undisputed best checking for travelers — unlimited ATM fee reimbursements worldwide, no foreign transaction fees, zero minimum, zero monthly fee.",rating:4.8,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Unlimited ATM fee reimbursements worldwide — truly unlimited","No foreign transaction fees","No minimum balance, no monthly fee","0.45% APY on linked brokerage sweep","Excellent 24/7 Schwab customer service"],cons:["Requires linked Schwab brokerage account","No cash deposits","Savings APY lower than dedicated HYSA"],established:1971,ratings:{app:4.6,fees:5.0,returns:3.0,access:5.0,support:4.9,security:4.9},apy:0.45,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  { id:"b069",slug:"fidelity-cash-management",name:"Fidelity Cash Management",type:"savings",description:"Fidelity hybrid cash-investment account with 2.72% APY, free checks, nationwide ATM reimbursements — absolutely zero fees.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2.72% APY on cash sweep","Free checks, free ATM fee reimbursements","FDIC up to $1.25M via 5-bank sweep","Zero fees of any kind — truly zero","Free debit card and bill pay"],cons:["APY below top HYSA","Investment-focused product — banking is secondary","Fidelity account required"],established:1946,ratings:{app:4.7,fees:5.0,returns:3.5,access:4.8,support:4.8,security:4.9},apy:2.72,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  { id:"b070",slug:"jp-morgan-private-client",name:"JPMorgan Private Client",type:"traditional",description:"Private client banking for $150K+ relationships — dedicated banker, preferential mortgage rates, and full JPMorgan investment research access.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Dedicated JPMorgan relationship banker","Preferential mortgage and loan rates","Access to JPM equity research","No fees with $150K+ balance","Premium physical and digital access"],cons:["$150,000 minimum relationship balance","Savings APY modest vs. HYSA","High barrier to entry"],established:1799,ratings:{app:4.5,fees:4.0,returns:2.5,access:5.0,support:5.0,security:4.9},apy:0.50,monthly_fee:0,min_balance:150000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── CRYPTO-INTEGRATED BANKING ─────────────────────────────────────────────────
  { id:"b071",slug:"cash-app-savings",name:"Cash App Savings",type:"neobank",description:"Square Cash App delivers 4.50% APY savings with Bitcoin auto-buy and P2P transfers to 50M+ users — the most social savings account.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.50% APY on savings","Bitcoin auto-buy on every deposit","50M+ user payment network","Instant P2P transfers","No fee for basic account"],cons:["Direct deposit required for APY","BaaS via Sutton Bank — not direct bank","Limited customer support infrastructure"],established:2013,ratings:{app:4.6,fees:4.3,returns:4.4,access:4.2,support:3.3,security:4.4},apy:4.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b072",slug:"apple-savings",name:"Apple Savings",type:"savings",description:"Apple Goldman Sachs-powered HYSA in Wallet — 4.50% APY, automated Daily Cash transfers, zero fees, and best-in-class iPhone banking experience.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.50% APY","Automatic Daily Cash deposits from Apple Card rewards","Zero fees, zero minimums","Seamless iPhone Wallet and Face ID integration","Goldman Sachs institutional backing"],cons:["Apple Card required","Apple device ecosystem required","Savings only product","Goldman partnership in transition"],established:2023,ratings:{app:4.9,fees:5.0,returns:4.4,access:3.4,support:3.9,security:4.9},apy:4.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── SMALL BUSINESS AND FREELANCE ──────────────────────────────────────────────
  { id:"b073",slug:"lili-freelance",name:"Lili Freelance Banking",type:"business",description:"Tax-smart banking for freelancers — auto-sets aside estimated taxes, tracks deductible expenses, and integrates with invoicing tools. Zero fees.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Auto tax withholding bucket (sets aside 25-30%)","1099-friendly expense tracking","Free invoicing tools","No monthly fee (basic tier)","QuickBooks integration"],cons:["$9/mo for Pro analytics tier","No APY on base account","Limited to sole proprietors and freelancers"],established:2019,ratings:{app:4.7,fees:4.8,returns:2.0,access:3.6,support:4.4,security:4.6},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b074",slug:"brex-business",name:"Brex Business Account",type:"business",description:"Silicon Valley premier spend management platform — 4.92% APY treasury yield, unlimited virtual cards, and enterprise-grade spend controls.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.92% APY on treasury yield","Unlimited virtual and physical corporate cards","Advanced spend controls and approval workflows","Deep ERP integration (NetSuite, QuickBooks, Xero)","$5M FDIC via program banks"],cons:["Built for funded startups and growing companies","Complex pricing for smaller teams","Limited retail banking features"],established:2017,ratings:{app:4.7,fees:4.5,returns:4.9,access:3.8,support:4.5,security:4.8},apy:4.92,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b075",slug:"ramp-banking",name:"Ramp Finance",type:"business",description:"AI-powered spend management with 4.75% APY on business cash, real-time spend analytics, automated bill pay, and granular corporate card controls.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY business treasury","AI-driven spend insights and anomaly detection","Automated vendor bill pay","Corporate cards with real-time per-employee limits","Free to use — earns on interchange"],cons:["No personal banking","Best suited for 20+ employee teams","Limited cash deposit options"],established:2019,ratings:{app:4.8,fees:4.7,returns:4.7,access:3.7,support:4.4,security:4.8},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── INVESTMENT-INTEGRATED SAVINGS ─────────────────────────────────────────────
  { id:"b076",slug:"robinhood-gold-savings",name:"Robinhood Gold Savings",type:"savings",description:"Robinhood democratizes high-yield savings — 5.00% APY for Gold members alongside commission-free stocks, ETFs, options, and crypto.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY (Gold) / 1.50% (free tier)","$5M FDIC via program bank sweep","Seamless brokerage and savings integration","No minimum balance","1% IRA match on contributions"],cons:["$5/mo Gold subscription required for 5.00%","BaaS model — not a bank charter","Customer service concerns (limited phone)"],established:2013,ratings:{app:4.7,fees:3.8,returns:4.8,access:3.5,support:3.6,security:4.5},apy:5.00,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b077",slug:"public-treasury",name:"Public Treasury Account",type:"savings",description:"Public Treasury Account earns 5.10% yield through actual US Treasury bills — government-backed yield with state tax advantages.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.10% yield backed by US Treasury bills","Not subject to bank failure risk","State income tax exemption in most states","No lock-up (daily liquidity)"],cons:["NOT FDIC insured — T-bill investment","Yield fluctuates with Fed decisions","Investment account required","T+1 settlement — not truly instant"],established:2019,ratings:{app:4.5,fees:4.5,returns:4.9,access:3.3,support:4.0,security:4.6},apy:5.10,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b078",slug:"sofi-bundle",name:"SoFi Money Plus Invest",type:"neobank",description:"SoFi all-in-one financial platform: 4.60% APY savings, commission-free investing, crypto, student loan refinancing, and $300 bonus.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.60% APY (with direct deposit)","Commission-free stocks, ETFs, fractional shares, crypto","Student loan refinancing (saves avg $300/yr)","$300 sign-up bonus","No fees across all products"],cons:["Best APY requires direct deposit","Crypto not available in all states","Customer service wait during peak periods"],established:2011,ratings:{app:4.9,fees:4.8,returns:4.6,access:4.6,support:4.5,security:4.8},apy:4.60,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false },
  // ── MILITARY AND INSURANCE BANKING ────────────────────────────────────────────
  { id:"b079",slug:"usaa-savings",name:"USAA Savings",type:"savings",description:"Military family institution trusted by 13M members — competitive savings, world-class military insurance bundling, and 97% member retention rate.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 2.02% APY savings","Best-in-class military auto and home insurance","No ATM fees worldwide (up to $15/mo reimbursed)","97% member retention — best loyalty in banking","Military-specialized financial products"],cons:["Military/veteran/family only — strict eligibility","Savings APY below top HYSA","Mobile deposit photo limits"],established:1922,ratings:{app:4.5,fees:4.7,returns:2.5,access:4.5,support:5.0,security:4.9},apy:2.02,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  // ── CASHBACK BANKING ──────────────────────────────────────────────────────────
  { id:"b080",slug:"discover-cashback-checking",name:"Discover Cashback Checking",type:"savings",description:"Gold standard of cashback checking — 1% back on $3,000/mo in debit purchases, zero fees of any kind, and #1 J.D. Power satisfaction for 8 years.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["1% cash back on debit (up to $3,000/mo = $360/yr max)","Zero fees of any kind","#1 J.D. Power customer satisfaction 8 years running","60K+ ATMs plus reimbursement","Free Zelle, Bill Pay, checks"],cons:["No physical branches","Cash deposit fees at retail locations","1% cashback capped at $3,000/mo spend","No high-yield savings APY in checking"],established:1986,ratings:{app:4.7,fees:5.0,returns:3.5,access:4.0,support:5.0,security:4.8},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false },
  // ── TEEN AND FAMILY BANKING ───────────────────────────────────────────────────
  { id:"b081",slug:"copper-teen-banking",name:"Copper Teen Banking",type:"student",description:"Modern teen banking with debit card, parental controls, and comprehensive financial education curriculum — Gen Z's gateway to financial literacy.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No fees","Strong financial literacy curriculum (20+ modules)","Parental spending limits and real-time alerts","FDIC insured via Evolve Bank","Custom debit card design"],cons:["No savings APY","Under-18 only","Basic feature set vs. adult accounts"],established:2019,ratings:{app:4.6,fees:5.0,returns:1.5,access:3.9,support:4.2,security:4.4},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b082",slug:"capital-one-money",name:"Capital One MONEY Teen",type:"student",description:"Capital One zero-fee teen checking with APY, seamless upgrade to adult Capital One 360, and the safety of a top-5 US bank.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No fees, no minimums","0.10% APY — earns interest unlike most teen accounts","Parental co-ownership until age 18","Seamless upgrade to Capital One 360 Checking","Capital One Cafe access (750+ US locations)"],cons:["Low 0.10% APY","Parental co-ownership required under 18"],established:1994,ratings:{app:4.7,fees:5.0,returns:1.8,access:4.1,support:4.4,security:4.7},apy:0.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MISSION-DRIVEN BANKING ────────────────────────────────────────────────────
  { id:"b083",slug:"amalgamated-bank",name:"Amalgamated Bank",type:"traditional",description:"America's progressive union-owned bank — B Corp certified, fossil fuel-free lending, and competitive 4.00% APY savings aligned with your values.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["B Corp certified — only FDIC bank with this status","100% fossil fuel-free lending since 2018","4.00% HYSA","Union ownership — customer-aligned","Strong track record since 1923"],cons:["Fewer conventional products","Small branch network (NY, DC, CA, MA)","APY below top HYSA"],established:1923,ratings:{app:4.0,fees:4.3,returns:3.8,access:3.5,support:4.4,security:4.5},apy:4.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b084",slug:"oneunited-bank",name:"OneUnited Bank",type:"traditional",description:"America's largest Black-owned bank — community reinvestment champion, financial literacy programs, and competitive products for the underserved.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Black-owned — supports economic equity","CRA-focused community development lending","Financial literacy programs (50K+ participants)","FDIC insured since 1968"],cons:["Limited branches (LA, Boston, Miami)","Below-average savings APY","App experience trails neobanks"],established:1968,ratings:{app:3.9,fees:4.2,returns:2.5,access:3.4,support:4.3,security:4.4},apy:0.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── CD SPECIALISTS ────────────────────────────────────────────────────────────
  { id:"b085",slug:"ally-bank-cd",name:"Ally Bank No-Penalty CD",type:"savings",description:"Ally No Penalty 11-month CD: 4.75% APY with zero early withdrawal penalty and no minimum — the most flexible fixed-rate product in the market.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY on 11-month term","ZERO early withdrawal penalty — unique in market","No minimum balance","Raise Your Rate CD option","FDIC insured"],cons:["CD locked for term (except No Penalty)","Lower rate than some 1-year fixed CDs","No physical branches"],established:2009,ratings:{app:4.9,fees:4.9,returns:4.7,access:3.9,support:4.8,security:4.7},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b086",slug:"marcus-cd",name:"Marcus Goldman Sachs Featured CD",type:"savings",description:"Goldman Marcus delivers institutional CD rates — 6.00% APY on 13-month Featured CD with $500 minimum and 10-day rate guarantee.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["6.00% APY (13-month Featured CD) — market-leading","Goldman Sachs institutional safety","$500 minimum — accessible","No fees","10-day CD rate guarantee after funding"],cons:["Early withdrawal penalty (150 days interest)","Not liquid until maturity","Must reinvest or transfer at maturity"],established:2016,ratings:{app:4.7,fees:5.0,returns:5.0,access:3.8,support:4.5,security:4.9},apy:6.00,monthly_fee:0,min_balance:500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MONEY MARKET FUNDS ────────────────────────────────────────────────────────
  { id:"b087",slug:"vanguard-mma",name:"Vanguard Federal Money Market VMFXX",type:"savings",description:"Vanguard government money market fund delivers 5.28% 7-day yield — all US government securities, lowest expense ratio in class, no bank risk.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.28% 7-day yield (current)","US government securities ONLY — lowest credit risk","Ultra-low 0.11% expense ratio","Vanguard client-first ownership model","Same-day liquidity during market hours"],cons:["NOT FDIC insured — money market fund","Settlement 1 business day","Vanguard account required","Yield fluctuates with Fed movements"],established:1975,ratings:{app:4.5,fees:5.0,returns:5.0,access:3.7,support:4.4,security:4.8},apy:5.28,monthly_fee:0,min_balance:3000,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b088",slug:"fidelity-government-mma",name:"Fidelity Government MMF SPAXX",type:"savings",description:"Fidelity SPAXX is default cash sweep for 46M accounts — 4.96% 7-day yield, US government securities, zero minimum balance.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.96% 7-day yield","Default sweep for all Fidelity accounts — automatic","US government securities portfolio","No minimum — literally $1 to start","Same-day access during market hours"],cons:["NOT FDIC insured — money market fund","Yield varies with Fed rate","Fidelity account required"],established:1946,ratings:{app:4.7,fees:5.0,returns:4.9,access:4.0,support:4.8,security:4.9},apy:4.96,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── REGIONAL POWERHOUSES ───────────────────────────────────────────────────────
  { id:"b089",slug:"fifth-third-bank",name:"Fifth Third Bank",type:"traditional",description:"Midwest premier full-service bank with 1,100+ branches, improving digital tools, and competitive CD rates across 11 states.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["1,100+ branches across 11 states","Competitive CD rates (5.00%+ on 12-month)","Improving mobile app (4.2 stars)","Strong mortgage offering","$400 new account bonus"],cons:["Low savings APY (0.01%)","Monthly maintenance fees ($8 waivable)","High overdraft fees ($37)"],established:1858,ratings:{app:4.2,fees:2.7,returns:1.5,access:4.4,support:4.0,security:4.5},apy:0.01,monthly_fee:8,min_balance:500,fdic_insured:true,signup_bonus:400,atm_fee:false,mobile_only:false },
  { id:"b090",slug:"huntington-bank",name:"Huntington National Bank",type:"traditional",description:"Columbus-based regional bank with 24-Hour Grace overdraft protection, zero-fee Asterisk-Free Checking, and $600 new account bonus.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["24-Hour Grace overdraft protection (unique)","Asterisk-Free Checking (genuinely no fees)","$600 sign-up bonus","Strong Midwest presence","$1B community investment pledge"],cons:["Limited to 11 states","Low savings APY","Digital experience below neobank standards"],established:1866,ratings:{app:4.1,fees:3.8,returns:1.6,access:4.3,support:4.2,security:4.5},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:600,atm_fee:false,mobile_only:false },
  { id:"b091",slug:"truist-bank",name:"Truist Bank",type:"traditional",description:"BB&T plus SunTrust merger created 6th-largest US bank — Southeast-dominant with LightStream personal loans and improving digital tools.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2,000+ Southeast branch network","LightStream personal loans (best market rates)","Improving digital tools post-merger","Strong mortgage team","$400 new account promotion"],cons:["Low savings APY (0.01%)","Post-merger integration growing pains","$12 monthly fee on some accounts"],established:2019,ratings:{app:4.0,fees:2.8,returns:1.4,access:4.5,support:3.9,security:4.4},apy:0.01,monthly_fee:12,min_balance:1500,fdic_insured:true,signup_bonus:400,atm_fee:false,mobile_only:false },
  // ── BIG TECH BANKING ──────────────────────────────────────────────────────────
  { id:"b092",slug:"paypal-savings",name:"PayPal Savings",type:"neobank",description:"PayPal brings 4.30% APY to its 430M-user payments network — high-yield savings integrated where your money already lives.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.30% APY","Integrated with 430M PayPal accounts","No fees, no minimums","Instant transfers to PayPal balance","Synchrony Bank FDIC backing"],cons:["Savings only — no checking account","BaaS via Synchrony — not direct bank","Limited features vs. dedicated HYSA"],established:1998,ratings:{app:4.5,fees:4.9,returns:4.3,access:3.5,support:3.8,security:4.6},apy:4.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── NEXT-GEN SAVINGS ──────────────────────────────────────────────────────────
  { id:"b093",slug:"openbank-us",name:"OpenBank US Santander Digital",type:"savings",description:"Santander digital-only US brand delivering 5.40% APY — backed by world's 15th-largest bank with $1.6T in assets.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.40% APY — top-5 nationally","Santander $1.6 trillion asset base","No monthly fees","Solid global security","5-minute account opening"],cons:["Limited US brand awareness","Savings only for US customers","No ATM network in US"],established:2020,ratings:{app:4.1,fees:5.0,returns:5.0,access:3.5,support:4.2,security:4.7},apy:5.40,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b094",slug:"bank5-connect",name:"Bank5 Connect HYSA",type:"savings",description:"Massachusetts-chartered savings bank going digital nationwide — consistent 5.25% APY with only $10 to open.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.25% APY","Only $10 to open","FDIC insured","Consistent rate stability","Savings and CD options"],cons:["Website-based only — no dedicated mobile app","Limited national awareness","No checking companion"],established:2012,ratings:{app:3.6,fees:4.9,returns:5.0,access:3.3,support:4.0,security:4.5},apy:5.25,monthly_fee:0,min_balance:10,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b095",slug:"tab-bank",name:"TAB Bank HYSA",type:"savings",description:"Utah-chartered TAB Bank — originally serving trucking industry since 1998, now offering 5.27% APY to consumer savers nationwide.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.27% APY","$0 minimum balance","No monthly fees","FDIC insured since 1998"],cons:["No mobile banking app","Limited consumer brand presence","Website-only access"],established:1998,ratings:{app:3.6,fees:4.9,returns:5.0,access:3.3,support:4.0,security:4.5},apy:5.27,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── CREDIT UNION CHAMPIONS ────────────────────────────────────────────────────
  { id:"b096",slug:"patelco-credit-union",name:"Patelco Credit Union",type:"savings",description:"San Francisco Bay Area premier credit union for tech workers — up to 4.00% APY savings, excellent mortgage rates, and CUSO investments.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 4.00% APY on savings","Excellent mortgage rates for Bay Area","Strong Bay Area tech membership","CUSO investment access","37 Northern California branches"],cons:["Bay Area and California focus","Regional footprint","Limited national ATM network"],established:1936,ratings:{app:4.3,fees:4.7,returns:4.2,access:4.1,support:4.6,security:4.8},apy:4.00,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b097",slug:"becu",name:"BECU Boeing Employees Credit Union",type:"savings",description:"Washington's largest credit union — open to all Washington residents with 3.04% Member Advantage Savings, exceptional loan rates, and $300M annual member dividends.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to ALL Washington state residents","3.04% APY Member Advantage Savings","Exceptional auto and mortgage loan rates","$300M+ annual member dividends returned","Strong digital tools","53 branches plus 30K ATMs"],cons:["Washington and Oregon branch focus","Some membership conditions apply"],established:1935,ratings:{app:4.4,fees:4.8,returns:4.1,access:4.3,support:4.7,security:4.8},apy:3.04,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b098",slug:"golden-1-credit-union",name:"Golden 1 Credit Union",type:"savings",description:"California's largest credit union — open to all Californians with up to 3.00% APY savings, no-fee banking, and 195+ branch locations.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to ALL California residents","Up to 3.00% APY on savings","No monthly fees on most accounts","Strong mobile app (4.5 stars)","195+ CA branches plus 30K ATMs"],cons:["California-only membership","Rates trail top HYSA","Some complex premium tiers"],established:1933,ratings:{app:4.5,fees:4.9,returns:3.8,access:4.5,support:4.7,security:4.8},apy:3.00,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── FINTECH AGGREGATORS ───────────────────────────────────────────────────────
  { id:"b099",slug:"raisin-us",name:"Raisin US Savings Marketplace",type:"savings",description:"European savings marketplace brings one-account access to 30+ FDIC banks to the US — always-competitive APY updated daily.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Access to 30+ FDIC partner banks from one account","No fees","Rates updated daily","Single application for all banks","Partner banks include top HYSA providers"],cons:["Account creation is multi-step","Transfers between banks take 1-3 days","New to US market"],established:2012,ratings:{app:4.2,fees:5.0,returns:5.0,access:3.5,support:4.1,security:4.6},apy:5.40,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b100",slug:"max-my-interest",name:"MaxMyInterest Cash Optimizer",type:"savings",description:"Automated savings optimizer rotates cash monthly among 6 top FDIC banks to always capture the highest rate — currently 5.50%+ average.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Always-optimized APY (5.50%+ current)","$1.5M+ FDIC via multi-bank rotation","Automated monthly optimization","Partners: Marcus, Ally, Discover, Synchrony, AmEx, Barclays"],cons:["$60/yr fee","Complexity for beginners","2-3 business day transfer times between banks"],established:2013,ratings:{app:4.0,fees:3.8,returns:5.0,access:3.5,support:4.2,security:4.7},apy:5.50,monthly_fee:5,min_balance:10000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── MORE NEOBANKS ─────────────────────────────────────────────────────────────
  { id:"b101",slug:"current-banking",name:"Current Neobank",type:"neobank",description:"Mobile-first neobank for younger Americans — 2-day early paycheck, crypto trading, teen accounts, no overdraft fee, and Savings Pods at 4.00% APY.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2-day early paycheck access","Crypto trading (200+ coins)","No overdraft fee","Teen accounts with parental controls","Savings Pods up to 4.00% APY"],cons:["Lower savings vs. top HYSA","App-only","CS inconsistency","Smaller ATM network"],established:2015,ratings:{app:4.4,fees:4.3,returns:2.5,access:3.8,support:3.5,security:4.2},apy:4.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b102",slug:"one-finance",name:"ONE Finance Walmart-Backed",type:"neobank",description:"Walmart and Ribbit Capital-backed neobank delivering 5.00% APY with direct deposit, 3% Walmart cashback, and financial inclusion for working Americans.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY with direct deposit","3% cash back at Walmart","No fees","Access at 4,700+ Walmart stores","Walmart Pay integration"],cons:["5.00% APY requires qualifying conditions","Limited outside Walmart ecosystem","Mobile-only"],established:2019,ratings:{app:4.2,fees:4.6,returns:4.8,access:3.9,support:3.8,security:4.3},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b103",slug:"varo-bank",name:"Varo Bank Full Charter",type:"neobank",description:"First neobank with OCC national bank charter — Varo is a real bank, not BaaS, offering up to 5.00% APY and full deposit protection.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["First neobank with OCC national bank charter","Up to 5.00% APY (with qualifying conditions)","No monthly fees","Early paycheck access","Real bank charter — higher regulatory standard"],cons:["5.00% APY requires $1,000+ month-end balance AND qualifying deposit","Limited CS channels","Digital-only"],established:2015,ratings:{app:4.3,fees:4.5,returns:4.0,access:4.0,support:3.3,security:4.4},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b104",slug:"dave-banking",name:"Dave Banking",type:"neobank",description:"Banking app helping Americans avoid overdraft fees — $500 ExtraCash advance, side hustle finder, and simplified banking for 10M+ members.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["$500 ExtraCash advance (no interest, no hard inquiry)","No overdraft fees","Side hustle income finder","Low $1/mo membership fee","Goals savings feature"],cons:["$1/mo subscription","Low APY (2.00%)","ExtraCash requires income verification","CS response times"],established:2016,ratings:{app:4.1,fees:3.8,returns:2.0,access:3.7,support:3.6,security:4.0},apy:2.00,monthly_fee:1,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b105",slug:"empower-banking",name:"Empower Banking",type:"neobank",description:"Zero-fee neobank with $250 cash advance, automatic savings rules, and 2.00% APY with direct deposit.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["$250 instant cash advance (no fee after qualifying)","2.00% APY with direct deposit","Auto-savings rules with custom triggers","Free ATM network (40K+ Allpoint)","Spending insights dashboard"],cons:["$8/mo subscription for advances","APY requires direct deposit","Smaller user base"],established:2016,ratings:{app:4.3,fees:3.8,returns:3.2,access:4.0,support:3.8,security:4.3},apy:2.00,monthly_fee:8,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── COMMUNITY DEVELOPMENT BANKING ────────────────────────────────────────────
  { id:"b106",slug:"climate-first-bank",name:"Climate First Bank",type:"traditional",description:"World's first climate-focused FDIC bank — all lending to solar, EVs, and sustainable housing. Competitive savings, B Corp values.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["100% climate-positive lending portfolio","FDIC insured","Competitive 3.75% savings rates","Solar loan specialist","B Corp-aligned values"],cons:["Niche climate focus limits product range","Florida-based — limited nationwide presence","Small asset base"],established:2021,ratings:{app:3.9,fees:4.4,returns:3.9,access:3.2,support:4.1,security:4.4},apy:3.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b107",slug:"self-financial",name:"Self Financial Credit Builder",type:"neobank",description:"Credit-builder bank — Self Credit Builder Account reports to all 3 bureaus, building credit while you save $25-$150/month. 18M Americans have used it.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Builds credit with all 3 bureaus","No hard credit pull to open","Savings returned at term end (minus fees)","Self Visa credit card available after track record","18M+ Americans improved credit with Self"],cons:["$9-$25/mo admin fee reduces net returns","Returns below HYSA rates","Better for credit building than wealth building"],established:2015,ratings:{app:4.3,fees:3.5,returns:3.0,access:3.7,support:4.0,security:4.4},apy:0.50,monthly_fee:9,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b108",slug:"go2bank",name:"GO2bank",type:"neobank",description:"Green Dot flagship consumer neobank — 4.50% APY Savings Vault, $200 earned wage advance, credit builder, and cash loads at 90K+ Walmart locations.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.50% APY on Savings Vault","Up to $200 earned wage advance","Credit builder secured card option","Walmart cash load at 90K+ locations","FDIC insured"],cons:["$5/mo fee (waived with $500+ direct deposit)","CS inconsistency reported","Account freezing complaints"],established:2019,ratings:{app:4.1,fees:3.8,returns:4.4,access:4.0,support:3.5,security:4.3},apy:4.50,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b109",slug:"ellevest-banking",name:"Ellevest Membership",type:"savings",description:"Banking and investing built for women — gender-aware financial planning algorithms, 3.10% APY savings, and zero-fee ETF investing.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Gender-aware financial planning algorithms","3.10% APY savings","Zero-fee ETF investing","CFP financial planning sessions included","Anti-gender pay gap portfolio design"],cons:["$12/mo membership fee","Gender-specific positioning not for everyone","Smaller investment selection"],established:2016,ratings:{app:4.5,fees:3.7,returns:3.8,access:3.7,support:4.5,security:4.6},apy:3.10,monthly_fee:12,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── INSTITUTIONAL AND TOP PERFORMERS ─────────────────────────────────────────
  { id:"b110",slug:"stanford-federal-cu",name:"Stanford Federal Credit Union",type:"savings",description:"Stanford University credit union — exceptional loan rates, 3.50% APY savings, and membership for Stanford community and tech workers.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Exceptionally low mortgage and auto loan rates","Competitive 3.50% APY savings","Stanford and tech community networking","$3B+ asset strength","Full-service banking relationship"],cons:["Stanford affiliation or tech employer required","Silicon Valley regional focus"],established:1959,ratings:{app:4.4,fees:4.8,returns:4.0,access:4.0,support:4.7,security:4.9},apy:3.50,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b111",slug:"schoolsfirst-fcu",name:"SchoolsFirst Federal Credit Union",type:"savings",description:"California's number one credit union by member satisfaction — serving education employees with top-rated service and competitive products.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Highest customer satisfaction in US credit union space","Competitive 3.25% APY savings","No monthly fee","California education specialization","280+ CA locations plus 30K ATMs"],cons:["California education employees only","No nationwide membership option","Digital experience slightly below neobanks"],established:1934,ratings:{app:4.5,fees:5.0,returns:4.0,access:4.3,support:5.0,security:4.9},apy:3.25,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b112",slug:"newtek-bank",name:"Newtek Bank HYSA",type:"savings",description:"SBA pioneer Newtek enters consumer savings with 5.25% APY — institutional-grade regulated bank charter with consumer-accessible rates.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.25% APY","No monthly fees","FDIC insured","25-year SBA track record","Savings and CD products"],cons:["Limited consumer brand recognition","Savings and CDs only","Online-only"],established:2021,ratings:{app:3.7,fees:4.9,returns:5.0,access:3.3,support:3.9,security:4.5},apy:5.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b113",slug:"popular-direct",name:"Popular Direct HYSA",type:"savings",description:"Popular Inc digital savings brand delivers 5.30% APY — Puerto Rico's largest bank bringing institutional rates to US mainland savers.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY — top-10 nationally","Popular Inc $78B assets backing","FDIC insured","Competitive CD options","130-year banking heritage"],cons:["$100 minimum deposit","Limited US mainland brand presence","Savings and CDs only"],established:1893,ratings:{app:3.8,fees:4.5,returns:4.9,access:3.3,support:3.9,security:4.7},apy:5.30,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b114",slug:"cit-bank-platinum",name:"CIT Bank Platinum Savings",type:"savings",description:"First Citizens subsidiary CIT Bank offers tiered Platinum Savings — 5.05% APY on $5,000+ balances with institutional-grade security.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.05% APY on $5,000+ balance","First Citizens $215B asset backing","No monthly fees","CD options (1-yr at 5.30%)","FDIC insured"],cons:["APY drops significantly under $5,000","$100 minimum to open","Savings only (no checking)"],established:2000,ratings:{app:4.0,fees:4.6,returns:4.7,access:3.6,support:4.0,security:4.6},apy:5.05,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b115",slug:"bask-bank",name:"Bask Bank Interest Savings",type:"savings",description:"American Airlines banking partner — earn 5.10% APY in cash OR 2.45 American Airlines miles per dollar per year.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Unique choice: 5.10% APY OR 2.45 AA Miles per dollar per year","No fees, no minimum balance","American Airlines frequent flyer integration","FDIC insured","Texas Capital Bank backing"],cons:["Miles value varies — cash APY may be superior","Savings only (no checking)","Less-known brand"],established:2020,ratings:{app:4.0,fees:4.9,returns:4.5,access:3.5,support:4.0,security:4.5},apy:5.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b116",slug:"bread-savings",name:"Bread Savings HYSA and CDs",type:"savings",description:"Comenity Capital Bank digital savings brand — 5.15% APY HYSA and market-leading 5.25% CD rates across multiple terms.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.15% APY HYSA","5.25% APY on 12-month CD","$100 minimum balance","No monthly fees","CD terms from 1 to 5 years"],cons:["$100 minimum balance required","Early withdrawal penalties on CDs","Savings-only product (no checking)"],established:2021,ratings:{app:4.1,fees:4.8,returns:4.9,access:3.5,support:4.0,security:4.5},apy:5.15,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b117",slug:"western-alliance-savings",name:"Western Alliance Bank HYSA",type:"savings",description:"Institutional bank grade for individual savers — Western Alliance brings 5.36% APY with $80B+ backing via SaveBetter marketplace.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.36% APY — top-3 nationally","$80B+ Western Alliance institutional backing","No monthly fee","Large deposit limits ideal for $250K+","SaveBetter marketplace access"],cons:["Less consumer-facing UX — business-bank origins","Limited app features","Account via partner marketplace"],established:1994,ratings:{app:3.8,fees:4.8,returns:5.0,access:3.5,support:4.1,security:4.7},apy:5.36,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b118",slug:"ufb-direct",name:"UFB Direct HYSA",type:"savings",description:"UFB Direct consistently holds top-3 savings rates nationally — 5.35% APY with optional ATM card, zero fees, and Axos Bank $20B+ stability.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY — consistently top-3 nationally","Free ATM card (unique for savings accounts)","No minimum balance","No monthly fee","$20B+ Axos Bank backing"],cons:["Portal UX is dated","No checking account companion","Axos brand less consumer-known"],established:2004,ratings:{app:3.7,fees:4.9,returns:5.0,access:4.3,support:4.0,security:4.6},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b119",slug:"barclays-us-savings",name:"Barclays US Online Savings",type:"savings",description:"UK banking giant Barclays brings 4.35% APY to US savers — 330 years of banking history, zero fees, simple digital savings.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","330-year Barclays institutional history","No monthly fees","No minimum balance","FDIC insured","Clean simple interface"],cons:["Savings only — no US checking account","UK-headquartered","CS wait times reported","No ATM access"],established:1736,ratings:{app:4.1,fees:5.0,returns:4.4,access:3.5,support:3.9,security:4.7},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── BUSINESS BANKING SPECIALISTS ─────────────────────────────────────────────
  { id:"b120",slug:"mercury-treasury",name:"Mercury Treasury Startup Banking",type:"business",description:"Mercury Treasury delivers 4.79% APY on idle business cash — best-designed business bank with API access, $5M FDIC, and venture-friendly features.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.79% APY business treasury","Up to $5M FDIC via sweep","Superior UX — best-designed business bank","API access for developers","Venture capital-friendly features"],cons:["Not for all business types — startup/tech focused","Limited physical banking","Wait-list for some new features"],established:2019,ratings:{app:4.9,fees:4.8,returns:4.7,access:3.4,support:4.4,security:4.8},apy:4.79,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b121",slug:"novo-business",name:"Novo Business Banking",type:"business",description:"Small business checking with zero monthly fees, 100+ integrations (Stripe, Shopify, QuickBooks), reserve accounts, and free invoice creation.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Zero monthly fees","100+ business tool integrations","Reserve accounts (up to 5)","Free invoice creation","No transaction fees"],cons:["No APY on deposits","No cash deposits","Limited wire functionality"],established:2016,ratings:{app:4.5,fees:5.0,returns:1.5,access:3.4,support:4.2,security:4.5},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b122",slug:"found-freelance",name:"Found Self-Employed Banking",type:"business",description:"Banking and taxes in one app for freelancers — automatic tax withholding, expense categorization, 1099 tracking, and zero fees. Backed by Visa.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Automated quarterly tax estimates and withholding","Smart expense categorization (95%+ accuracy)","1099 tracking and generation","No fees (Visa-backed)","Free invoicing"],cons:["Sole proprietor focus only","No payroll features","Limited for S-Corps and C-Corps"],established:2019,ratings:{app:4.6,fees:5.0,returns:2.0,access:3.5,support:4.3,security:4.5},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b123",slug:"relay-business",name:"Relay Business Banking Pro",type:"business",description:"Modern SMB banking — 20 checking accounts, 50 virtual cards, team spending limits, accounting integrations. Zero fees, zero limits.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["20 checking accounts — unlimited compartmentalization","50 physical and virtual Mastercard cards","Team member spend limits and approvals","QuickBooks and Xero two-way sync","Zero monthly fees"],cons:["No interest earned on deposits","No cash deposits","No physical banking presence"],established:2018,ratings:{app:4.7,fees:5.0,returns:2.0,access:3.5,support:4.5,security:4.6},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b124",slug:"bluevine-business",name:"Bluevine Business Checking",type:"business",description:"2.00% APY on business checking balances — ideal for cash-rich SMBs needing yield on idle funds with Bluevine Line of Credit up to $250K.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2.00% APY (with $500/mo spend or $2,500 direct deposit)","No monthly fee","Bluevine Line of Credit up to $250K","Free ACH and wire transfers","Visa Business Debit Card"],cons:["2.00% APY requires qualifying conditions","Limited integrations vs. Relay or Novo","No cash deposits"],established:2013,ratings:{app:4.3,fees:4.7,returns:4.0,access:3.6,support:4.1,security:4.4},apy:2.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── FAMILY AND TEEN FINALISTS ─────────────────────────────────────────────────
  { id:"b125",slug:"greenlight-max",name:"Greenlight Max Family and Investing",type:"student",description:"Full family banking with investing for kids — Greenlight Max adds stock investing, chore rewards, and the most advanced parental controls available.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Stock investing for kids (fractional shares)","Chore and allowance automation","5 family member accounts","Strongest parental controls in market","Financial literacy game for kids (Level Up)"],cons:["$14.98/mo for Max tier","$5.99/mo for base — not free","No high savings APY"],established:2014,ratings:{app:4.7,fees:3.5,returns:3.5,access:4.0,support:4.3,security:4.6},apy:2.00,monthly_fee:14.98,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b126",slug:"step-teen",name:"Step Teen Banking",type:"student",description:"Build credit from day one — Step's secured card reports to credit bureaus while teens bank, giving them a head start before college.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Credit building for teens (secured card)","5.00% APY on savings","No fees","Parental controls","Under-18 FDIC insured via Evolve Bank"],cons:["Under-18 or parent account required","Limited adult banking features","Mobile-only"],established:2019,ratings:{app:4.5,fees:5.0,returns:4.2,access:3.8,support:4.0,security:4.4},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── PAYROLL-LINKED BANKING ────────────────────────────────────────────────────
  { id:"b127",slug:"gusto-wallet",name:"Gusto Wallet Employee Banking",type:"neobank",description:"Gusto payroll-integrated banking benefit — workers at 300K+ businesses get savings goals, $200 advances, and financial wellness tools.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Integrated with Gusto payroll (300K+ employers)","Up to $200 interest-free pay advance","Savings goals with automatic transfers","Financial wellness coaching","No fees"],cons:["Only available if employer uses Gusto","Limited standalone banking","No premium APY"],established:2012,ratings:{app:4.4,fees:4.6,returns:2.0,access:3.7,support:4.1,security:4.5},apy:1.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b128",slug:"stride-gig",name:"Stride Bank Gig Workers",type:"neobank",description:"First bank for gig economy workers — Uber and DoorDash drivers get health insurance marketplace, tax tools, and direct platform deposits.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Health insurance marketplace (ACA plans)","Gig income tax withholding and tracking","Direct deposit from Uber, Lyft, DoorDash, Instacart","No account fees","Financial wellness coaching"],cons:["Niche gig-economy focus","Limited APY","Platform integration can lag"],established:2018,ratings:{app:4.2,fees:4.6,returns:2.0,access:3.7,support:4.0,security:4.3},apy:1.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  // ── MIDWEST AND REGIONAL COMMUNITY ───────────────────────────────────────────
  { id:"b129",slug:"dollar-bank",name:"Dollar Bank",type:"traditional",description:"Pittsburgh-born mutually-owned savings bank with 170-year track record — strong Western PA, Cleveland, Norfolk community banking.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Mutually-owned — profits returned to members","170-year stability track record","Competitive CD rates","Strong Pittsburgh community commitment","FDIC insured since 1855"],cons:["Regional (PA, OH, VA only)","Below-average savings APY","Limited digital innovation"],established:1855,ratings:{app:3.8,fees:3.3,returns:2.0,access:4.0,support:4.3,security:4.5},apy:0.25,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b130",slug:"midwest-bankcentre",name:"Midwest BankCentre HYSA",type:"savings",description:"St. Louis community bank with 120-year history offering 5.15% APY savings and digital presence nationwide.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.15% APY","FDIC insured since 1906 (120-year history)","$0 to open","Strong St. Louis community banking values"],cons:["Primarily Missouri-focused","Limited digital features","No mobile app"],established:1906,ratings:{app:3.6,fees:4.7,returns:4.9,access:3.2,support:4.0,security:4.5},apy:5.15,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b131",slug:"key-bank",name:"KeyBank Checking",type:"traditional",description:"Ohio-based national bank with strong Great Lakes presence, improving digital tools, and $300 bonus for new customers.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["$300 sign-up bonus","1,000+ Great Lakes branch network","Key Smart Checking (no monthly fee)","KeyBank Rewards cashback checking"],cons:["Low savings APY","Limited Southeast and Southwest presence","App ratings below neobanks"],established:1849,ratings:{app:3.9,fees:3.2,returns:1.6,access:4.2,support:3.9,security:4.4},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false },
  { id:"b132",slug:"huntington-bonus",name:"Huntington Perks Checking Bonus",type:"traditional",description:"$600 cash bonus with Asterisk-Free Checking — zero-fee Midwest banking with 24-Hour Grace overdraft protection and $1B community commitment.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["$600 sign-up bonus","Zero monthly fee (Asterisk-Free)","24-Hour Grace overdraft protection","Strong Midwest presence"],cons:["Bonus requires $1,000 direct deposit","Low savings APY","Limited to 11 Midwest states"],established:1866,ratings:{app:4.1,fees:3.9,returns:1.6,access:4.3,support:4.2,security:4.5},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:600,atm_fee:false,mobile_only:false },
  // ── ADDITIONAL SAVINGS SPECIALISTS ───────────────────────────────────────────
  { id:"b133",slug:"synchrony-hysa-plus",name:"Synchrony Bank HYSA Plus",type:"savings",description:"Synchrony 4.75% APY with optional ATM card for a savings account and consistent top-5 rate rankings since 2003.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY — consistently top-5","Optional ATM card (unique for savings)","No minimum balance","FDIC insured","Strong rate consistency"],established:2003,cons:["No checking account companion","Limited features beyond savings","Website UX could be more modern"],ratings:{app:4.0,fees:4.8,returns:4.8,access:4.2,support:3.9,security:4.5},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b134",slug:"alliant-savings",name:"Alliant Credit Union HYSA",type:"savings",description:"America's largest digital credit union offers 3.10% APY savings, 80K+ ATMs, and no monthly fees — open to all Americans via easy $5 membership.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.10% APY savings","80K+ fee-free ATMs nationwide","$20/mo ATM reimbursement","No monthly fee","Open to all Americans via Foster Care to Success for $5"],cons:["Savings APY below top HYSA","Membership required","Chicago-based — limited branch access"],established:1935,ratings:{app:4.4,fees:4.7,returns:3.8,access:4.5,support:4.7,security:4.8},apy:3.10,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b135",slug:"navy-federal-savings",name:"Navy Federal Share Savings",type:"savings",description:"Navy Federal's legendary Share Savings delivers 6.17% APY via high-rate checking to eligible military members — the highest guaranteed rate anywhere.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 6.17% APY (Flagship Checking) — market best","Military community savings culture","No monthly fees","Low minimum ($5)","Specialized military financial products"],cons:["Military and family only — strict eligibility","Not available to general public"],established:1933,ratings:{app:4.5,fees:4.8,returns:5.0,access:4.0,support:4.6,security:4.9},apy:6.17,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b136",slug:"albert-ai-banking",name:"Albert AI Savings",type:"neobank",description:"AI financial advisor embedded in banking — Albert automatically saves based on income analysis, invests micro-amounts, and negotiates bills on your behalf.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["AI-powered auto-savings (analyzes income and expenses)","Bill negotiation (saves avg $300/yr)","Micro-investing in stocks and ETFs","Up to $250 Genius cash advances","Financial health score tracking"],cons:["$16.99/mo for Genius tier — premium price","AI savings can surprise with unexpected withdrawals","Limited customer service access"],established:2015,ratings:{app:4.4,fees:3.6,returns:3.5,access:3.8,support:3.9,security:4.4},apy:0.10,monthly_fee:16.99,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b137",slug:"oxygen-neobank",name:"Oxygen Premium Creator Banking",type:"neobank",description:"Premium banking for high-earning creators and entrepreneurs — 5% cashback on software and subscriptions, metal Visa card, and concierge banking service.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5% cashback on subscriptions and software","Concierge banking service","Metal Visa card","No foreign transaction fees","LLC formation tools in-app"],cons:["$19.99/mo subscription","Niche creator audience","Limited savings yield"],established:2019,ratings:{app:4.4,fees:3.6,returns:3.0,access:3.8,support:4.0,security:4.4},apy:0.25,monthly_fee:19.99,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b138",slug:"aspiration-plus",name:"Aspiration Plus Sustainable Banking",type:"neobank",description:"Climate-first banking — 5.00% APY on savings, plant a tree per purchase, 1% cashback at conscience businesses, and fossil-fuel-free deposits.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY on savings (with conditions)","Plant a tree with every purchase (5M+ trees)","1% cashback at Aspiration-certified businesses","Pay-what-is-fair pricing option","100% fossil-fuel-free deposit policy"],cons:["$7.99/mo for Plus tier required for 5.00%","APY requires additional conditions","Smaller institution"],established:2015,ratings:{app:4.1,fees:3.5,returns:4.5,access:3.5,support:3.8,security:4.2},apy:5.00,monthly_fee:7.99,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b139",slug:"porte-banking",name:"Porte by Western Union",type:"neobank",description:"Western Union neobank for global diaspora — 3.00% APY, fee-free international transfers, and multilingual support in 8 languages.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.00% APY savings","Free international money transfers via WU network","Multilingual support (8 languages)","Designed for immigrant communities","FDIC insured"],cons:["Limited to WU transfer ecosystem","Lower APY vs. dedicated HYSA","Brand still transitioning"],established:2020,ratings:{app:4.1,fees:4.4,returns:3.5,access:3.8,support:4.2,security:4.3},apy:3.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b140",slug:"possible-finance",name:"Possible Finance Banking",type:"neobank",description:"Credit-builder neobank for thin-file consumers — builds credit with every paycheck via savings-secured credit line, no hard inquiry.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Credit building without hard inquiry","Savings-secured credit line","No interest on credit builder","FDIC insured"],cons:["Limited APY on savings","Niche credit-building focus","App-only experience"],established:2017,ratings:{app:4.2,fees:4.3,returns:2.0,access:3.6,support:3.9,security:4.3},apy:1.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b141",slug:"citizens-community-bank",name:"Citizens Community Bancorp",type:"traditional",description:"Midwestern community bank with competitive savings rates, personalized relationship banking across WI, MN, IA, ID, OR, WA.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Strong Midwest community banking","Competitive savings rates","Personalized relationship banking","FDIC insured since 1935","SBA and USDA lending specialist"],cons:["Regional (WI, MN, IA, ID, OR, WA)","Below top HYSA rates","Limited digital innovation"],established:1935,ratings:{app:3.7,fees:3.5,returns:2.5,access:3.9,support:4.3,security:4.4},apy:0.25,monthly_fee:6,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b142",slug:"homestreet-bank",name:"HomeStreet Bank",type:"savings",description:"Pacific Northwest community banking champion — Seattle-based with strong WA, OR, and Hawaii markets and competitive home equity products.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Strong Pacific Northwest presence","Competitive savings rates","FDIC insured since 1921","Home equity lending specialist","100+ years of stability"],cons:["Regional PNW and Hawaii footprint","Below HYSA rates","Limited digital innovation"],established:1921,ratings:{app:3.9,fees:3.4,returns:2.5,access:4.0,support:4.2,security:4.5},apy:0.50,monthly_fee:8,min_balance:300,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b143",slug:"bank-of-hawaii",name:"Bank of Hawaii",type:"traditional",description:"Hawaii's leading bank with strong Pacific Asia ties, award-winning mobile banking, and competitive savings rates for the island state.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Best bank in Hawaii by market share","Strong Pacific and Asia banking relationships","Award-winning mobile app","FDIC insured since 1897"],cons:["Very Hawaii and Pacific-focused","Low standard savings APY","Premium products require relationship"],established:1897,ratings:{app:4.3,fees:3.5,returns:2.0,access:3.5,support:4.3,security:4.6},apy:0.05,monthly_fee:10,min_balance:500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b144",slug:"kabbage-amex",name:"Kabbage American Express Business",type:"business",description:"American Express-backed Kabbage business checking — 1.10% APY, unlimited transactions, and access to AmEx working capital loans.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["AmEx $175B institutional backing","1.10% APY — best in traditional business checking","Unlimited free transactions","Access to Kabbage and AmEx working capital loans","Business credit insights dashboard"],cons:["1.10% APY below Mercury and Brex treasury rates","AmEx brand migration in progress","Limited international banking features"],established:2009,ratings:{app:4.3,fees:4.6,returns:2.8,access:3.8,support:4.2,security:4.7},apy:1.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b145",slug:"brex-advanced",name:"Brex Advanced for Startups",type:"business",description:"Brex's flagship tier for Series A plus startups — AI expense automation, global corporate cards, and 4.92% APY treasury with $5M FDIC.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.92% APY on business treasury","Global corporate cards (150+ countries)","AI expense automation with 99% categorization accuracy","$5M FDIC via program banks","Venture capital integration (cap table, data rooms)"],cons:["Designed for funded startups — not small businesses","Complex pricing for early-stage companies","Limited retail banking features"],established:2017,ratings:{app:4.8,fees:4.4,returns:4.9,access:4.0,support:4.6,security:4.9},apy:4.92,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b146",slug:"ramp-advanced",name:"Ramp Finance Advanced",type:"business",description:"AI-powered CFO tools with 4.75% APY — Ramp Advanced gives finance teams real-time spend visibility, contract negotiation AI, and ERP integration.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY business treasury","AI contract negotiation recommendations","Real-time spend anomaly detection","NetSuite and Sage ERP integration","Free to use — zero cost to businesses"],cons:["Best for mid-size to enterprise companies","Advanced AI requires data sharing","Limited cash deposit options"],established:2019,ratings:{app:4.9,fees:4.8,returns:4.7,access:3.8,support:4.5,security:4.9},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b147",slug:"lili-pro",name:"Lili Pro Freelance Banking",type:"business",description:"Lili Pro tier for growing freelancers — advanced tax analytics, dedicated bookkeeper, priority banking support, and 1.5% APY savings.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Advanced tax analytics (schedule C optimizer)","Dedicated bookkeeper connection","Priority banking support","Business debit card with expense tracking","Full 1099 workflow management"],cons:["$9/mo Pro subscription","Mobile-only — no desktop web access","US freelancers only"],established:2019,ratings:{app:4.7,fees:4.0,returns:2.5,access:3.6,support:4.6,security:4.6},apy:1.50,monthly_fee:9,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
  { id:"b148",slug:"pentagon-premium",name:"PenFed Premium Online Savings",type:"savings",description:"PenFed's Premium Online Savings delivers market-competitive rates with credit union ownership advantages — up to 4.00% APY open to all.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 4.00% APY","Open to all Americans (easiest CU to join)","Credit union ownership — no shareholder profit extraction","80K+ fee-free ATMs","Best credit card suite in credit unions"],cons:["$5 joining fee","APY below some HYSA competitors","App experience slightly behind neobanks"],established:1935,ratings:{app:4.4,fees:4.9,returns:4.2,access:4.5,support:4.7,security:4.8},apy:4.00,monthly_fee:0,min_balance:5,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b149",slug:"navy-federal-cd",name:"Navy Federal Special EasyStart CD",type:"savings",description:"Navy Federal Special EasyStart Certificate delivers 5.30% APY on 12-month CDs with only $50 minimum — most accessible premium CD in market.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY (Special EasyStart CD)","Only $50 minimum — most accessible CD in market","Military community savings culture","$3B+ in CD holdings","Paired with 6.17% APY checking"],cons:["Military and family only — strict eligibility","Not available to general public"],established:1933,ratings:{app:4.5,fees:4.8,returns:5.0,access:4.0,support:4.6,security:4.9},apy:5.30,monthly_fee:0,min_balance:50,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b150",slug:"vanguard-prime-mma",name:"Vanguard Prime Money Market Fund",type:"savings",description:"Vanguard's VMMXX prime money market fund delivers 5.32% 7-day yield by holding commercial paper alongside government securities for premium yield.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.32% 7-day yield — highest Vanguard MMF","Prime portfolio: commercial paper plus government securities","0.16% ultra-low expense ratio","Vanguard client-first ownership model","$3,000 accessible minimum"],cons:["NOT FDIC insured — money market fund","Prime fund carries slightly more credit risk than government-only","Yield fluctuates with Fed","Vanguard account required"],established:1975,ratings:{app:4.5,fees:5.0,returns:5.0,access:3.7,support:4.4,security:4.8},apy:5.32,monthly_fee:0,min_balance:3000,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false },

];

export interface CategoryConfig {
  slug: string; label: string; headline: string; subheadline: string;
  statLabel: string; statValue: string; statCompare: string;
  sortKey: keyof Bank; sortDir: "asc" | "desc";
  columns: string[]; faq: { q: string; a: string }[]; methodology: string;
  icon: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: "best-apy", label: "Best APY", icon: "📈",
    headline: "Earn more on your cash — today.", subheadline: "These savings accounts pay up to 5.50% APY vs. the national average of 0.46%.",
    statLabel: "Top APY", statValue: "5.50%", statCompare: "vs 0.46% national avg",
    sortKey: "apy", sortDir: "desc", columns: ["apy","monthly_fee","min_balance","fdic_insured","signup_bonus"],
    faq: [
      { q: "What is APY?", a: "Annual Percentage Yield is the real rate of return earned on savings, taking compound interest into account. A higher APY means more interest earned over the year." },
      { q: "Are online bank APYs stable?", a: "Online savings rates are variable and can change when the Fed adjusts benchmark rates. Rates shown are current but can change; lock in a CD for a guaranteed rate." },
      { q: "Are high-yield savings accounts safe?", a: "Yes — any account listed here is FDIC-insured up to $250,000 per depositor per bank. Your money is protected even if the bank fails." },
      { q: "Why do online banks pay more?", a: "Online-only banks have no branch costs. They pass the savings on to customers in the form of higher APYs, fewer fees, and no minimums." },
      { q: "How do I transfer money to an online savings account?", a: "Link your existing checking account via ACH. Transfers typically take 1–3 business days. Some accounts also accept wire transfers." },
    ],
    methodology: "We ranked accounts by current advertised APY, verified against each institution's published rates. We excluded promotional or teaser rates that expire within 90 days or require unusual conditions.",
  },
  {
    slug: "no-fees", label: "No Monthly Fees", icon: "🚫",
    headline: "Keep every dollar you deposit.", subheadline: "No maintenance fees, no minimum balance requirements, no surprises.",
    statLabel: "Accounts with $0 fees", statValue: "32", statCompare: "of 60 accounts we track",
    sortKey: "monthly_fee", sortDir: "asc", columns: ["monthly_fee","apy","min_balance","atm_fee","fdic_insured"],
    faq: [
      { q: "What fees should I watch for?", a: "Common bank fees include monthly maintenance fees ($5–$25), overdraft fees ($35), out-of-network ATM fees ($3–$5), wire transfer fees, and paper statement fees." },
      { q: "Can I really get a completely free bank account?", a: "Yes. Many online banks, neobanks, and credit unions offer accounts with zero monthly fees, no minimums, and even reimbursed ATM fees." },
      { q: "Do fee-free banks charge for other services?", a: "Some charge for expedited transfers, international wires, or paper checks. Read the fee schedule before opening any account." },
      { q: "How much do Americans pay in bank fees per year?", a: "Americans pay an average of $329/year in banking fees according to industry research. Switching to a fee-free account is one of the easiest financial wins." },
      { q: "Are credit unions generally cheaper than banks?", a: "Credit unions are non-profit and often have lower fees and better rates than commercial banks. Membership requirements vary — many are community or employer-based." },
    ],
    methodology: "We ranked accounts by total annual fee burden, giving zero weight to APY. Accounts with conditional fee waivers (e.g., with direct deposit) are ranked lower than those with unconditional zero fees.",
  },
  {
    slug: "neobanks", label: "Best Neobanks", icon: "📱",
    headline: "Banking built for your phone.", subheadline: "App-first banks that move faster, charge less, and delight more than legacy institutions.",
    statLabel: "Avg. neobank fee", statValue: "$0.42/mo", statCompare: "vs $14.63 at big banks",
    sortKey: "rating", sortDir: "desc", columns: ["apy","monthly_fee","mobile_only","atm_fee","signup_bonus"],
    faq: [
      { q: "Are neobanks safe?", a: "FDIC-insured neobanks are as safe as traditional banks. The deposit insurance covers up to $250,000. Always check that a neobank is FDIC-insured before opening an account." },
      { q: "What's the difference between a neobank and a bank?", a: "Neobanks are financial technology companies that offer banking services, usually through bank partners. They have no physical branches and operate primarily via mobile apps." },
      { q: "Do neobanks have ATM access?", a: "Most neobanks partner with ATM networks like Allpoint or MoneyPass, giving access to 40,000–85,000 ATMs. Some also reimburse out-of-network ATM fees." },
      { q: "Which neobank has the best customer service?", a: "Customer service quality varies significantly. Chime and Current have had complaints; SoFi and Discover consistently receive high satisfaction scores in J.D. Power surveys." },
      { q: "Can I deposit cash into a neobank?", a: "Some neobanks allow cash deposits at retail locations (Green Dot network, Walgreens, CVS) but may charge fees. This remains a key weakness vs. traditional banks." },
    ],
    methodology: "We evaluated neobanks on app quality (App Store/Google Play ratings), fee structure, APY, ATM access, customer service history, and FDIC insurance status.",
  },
  {
    slug: "no-minimum-balance", label: "No Minimum Balance", icon: "✅",
    headline: "Open an account with $1 or less.", subheadline: "No account minimums. No balance requirements. No discrimination against smaller depositors.",
    statLabel: "Accounts with $0 minimum", statValue: "41", statCompare: "in our database of 60",
    sortKey: "min_balance", sortDir: "asc", columns: ["min_balance","apy","monthly_fee","fdic_insured","atm_fee"],
    faq: [
      { q: "Why do banks require minimum balances?", a: "Minimum balance requirements help banks maintain deposit stability and offset the cost of servicing smaller accounts. Many online banks have eliminated these." },
      { q: "What happens if I fall below the minimum balance?", a: "Most banks charge a monthly fee (typically $6–$15) when your balance falls below the required minimum. Some convert to a different account type." },
      { q: "Are there accounts that earn interest with no minimum?", a: "Yes. Marcus by Goldman Sachs, Ally Bank, Discover, and American Express all offer 4.25–5.50% APY with no minimum balance requirement." },
      { q: "Do credit unions have minimum balance requirements?", a: "Credit unions typically require a small 'share' deposit ($5–$25) to establish membership, but many have no ongoing minimum balance for checking or savings." },
      { q: "Can I open multiple no-minimum accounts?", a: "Absolutely. Many consumers keep one high-yield savings (no minimum) for their emergency fund and a separate checking account (no minimum) for daily spending." },
    ],
    methodology: "Ranked strictly by minimum opening and ongoing balance requirements. Accounts requiring any deposit to maintain fee-free status are listed after true zero-minimum accounts.",
  },
  {
    slug: "best-for-beginners", label: "Best for Beginners", icon: "🌱",
    headline: "Your first bank account, done right.", subheadline: "Simple, fee-free accounts with excellent apps and customer support for first-time bankers.",
    statLabel: "Recommended starter APY", statValue: "4.25%+", statCompare: "while building good habits",
    sortKey: "rating", sortDir: "desc", columns: ["apy","monthly_fee","atm_fee","fdic_insured","mobile_only"],
    faq: [
      { q: "What type of account should I open first?", a: "Start with a checking account for daily spending and add a high-yield savings account for your emergency fund. Look for zero monthly fees and no minimum balance requirements." },
      { q: "How much should I keep in savings vs. checking?", a: "A common rule: keep 1–3 months of expenses in checking for daily use, and build to 3–6 months in your high-yield savings as an emergency fund." },
      { q: "What is FDIC insurance?", a: "FDIC (Federal Deposit Insurance Corporation) insures bank deposits up to $250,000 per depositor per bank. This means your money is safe even if the bank fails." },
      { q: "Do I need a credit history to open a bank account?", a: "No. Bank accounts don't require credit history. However, banks may check ChexSystems (banking history). Secured accounts and second-chance accounts are available if you've had past banking issues." },
      { q: "How long does it take to open an account?", a: "Most online accounts can be opened in 5–10 minutes with a Social Security number, government ID, and an existing bank account for the initial transfer." },
    ],
    methodology: "Accounts scored on ease of opening (ID requirements, time to open), app quality, fee transparency, customer support ratings, and educational resources. Complexity of features penalized.",
  },
  {
    slug: "student-accounts", label: "Student Accounts", icon: "🎓",
    headline: "Banking built for campus and beyond.", subheadline: "Fee-free accounts for college students — some even build credit while you bank.",
    statLabel: "Student accounts with $0/mo fee", statValue: "15", statCompare: "tracked in our database",
    sortKey: "rating", sortDir: "desc", columns: ["monthly_fee","atm_fee","apy","signup_bonus","fdic_insured"],
    faq: [
      { q: "What makes a student bank account different?", a: "Student accounts typically waive monthly fees during college (usually verifiable by .edu email or enrollment proof) and sometimes offer smaller minimum balance requirements." },
      { q: "Can I build credit with a bank account?", a: "Traditional bank accounts don't build credit, but some neobanks like Step offer secured debit cards that report to credit bureaus, helping teens build credit history." },
      { q: "What happens to my student account when I graduate?", a: "Most student accounts convert to standard accounts with standard fees after graduation. Neobanks like Chime and Discover have no student-specific accounts — they're fee-free for everyone." },
      { q: "Should I use my parents' bank or open my own?", a: "Opening your own account establishes financial independence and ChexSystems history. Many parents add students as authorized users first to help them transition." },
      { q: "What's the best student account for studying abroad?", a: "Charles Schwab Investor Checking or Wise are excellent for studying abroad — both offer free international ATM withdrawals and favorable exchange rates." },
    ],
    methodology: "Evaluated student accounts based on fee structure, financial education tools, debit card features, ATM access on or near campuses, and ease of account management via mobile app.",
  },
  {
    slug: "business-accounts", label: "Business Banking", icon: "🏢",
    headline: "Banking as serious as your business.", subheadline: "From solo freelancers to funded startups — the best business accounts with real features.",
    statLabel: "Top business APY", statValue: "4.79%", statCompare: "Mercury Treasury (no fees)",
    sortKey: "rating", sortDir: "desc", columns: ["apy","monthly_fee","min_balance","fdic_insured","atm_fee"],
    faq: [
      { q: "Do I need a business bank account?", a: "Legally, no — but it's strongly recommended. Mixing personal and business finances complicates taxes, creates liability issues, and looks unprofessional to clients and investors." },
      { q: "What's the best business account for a new LLC?", a: "Relay and Mercury both offer zero-fee business checking with strong accounting integrations (QuickBooks, Xero). Mercury is particularly popular with funded startups." },
      { q: "Can my business earn interest on idle cash?", a: "Yes. Mercury Treasury offers 4.79% APY. Bluevine offers 2% with qualifying spend. Traditional banks typically pay near-zero on business deposits." },
      { q: "What documents do I need to open a business bank account?", a: "Typically: EIN, business formation documents (Articles of Incorporation for LLCs/Corps), government-issued ID for all beneficial owners, and business address." },
      { q: "Are fintech business accounts (Mercury, Relay) FDIC insured?", a: "Mercury and Relay hold deposits at FDIC-member partner banks, so deposits are FDIC-insured up to $250,000. Mercury offers up to $5M through its sweep network." },
    ],
    methodology: "Business accounts ranked on fee structure, accounting software integrations, multi-user capabilities, wire/ACH fees, and yield on idle cash. Consumer features not considered.",
  },
  {
    slug: "high-fdic-protection", label: "Max FDIC Protection", icon: "🛡️",
    headline: "Protect more than $250,000.", subheadline: "Accounts with enhanced FDIC coverage through networks — up to $8M protected.",
    statLabel: "Max FDIC via network", statValue: "$8M", statCompare: "Wealthfront (0 fees)",
    sortKey: "fdic_insured", sortDir: "desc", columns: ["fdic_insured","apy","monthly_fee","min_balance","signup_bonus"],
    faq: [
      { q: "What is the standard FDIC limit?", a: "FDIC insures up to $250,000 per depositor, per FDIC-insured bank, per account ownership category. Joint accounts are insured up to $500,000." },
      { q: "How can I get more than $250,000 protected?", a: "Spread deposits across multiple FDIC banks, use joint accounts, or use accounts with network sweep (like Wealthfront's $8M or SoFi's $2M coverage)." },
      { q: "Is NCUA the same as FDIC for credit unions?", a: "NCUA (National Credit Union Administration) provides equivalent insurance at credit unions — $250,000 per member, per credit union. Same protection, different regulator." },
      { q: "Do all neobanks have FDIC insurance?", a: "No. FDIC insurance is not automatic for fintechs. Always verify that a neobank holds deposits at FDIC-member banks. Legitimate companies disclose this clearly." },
      { q: "What happens to uninsured deposits if a bank fails?", a: "Uninsured deposits (above $250,000) become unsecured creditor claims in FDIC receivership proceedings. Recovery is uncertain and can take years. Diversification is essential." },
    ],
    methodology: "Ranked by total FDIC protection available per individual customer, including sweep networks. Accounts are verified against FDIC BankFind database for active insurance status.",
  },
];


// ─── PLAN 8: MASTER SYSTEM PROMPT ENCODED AS CONFIG ─────────────────────────
// Complete financial market knowledge base embedded in the application.
// Powers AI recommendation engine, FAQ generation, and contextual advice.
// NorwegianSpark SA · Banktopp.com · Version 3.0 · Updated 2026-03-01

export const MASTER_SYSTEM_PROMPT = {
  version: "3.0.0",
  updated: "2026-03-01",
  context: "Banktopp.com is Norway's premier bank comparison platform operated by NorwegianSpark SA (Org. 834 984 172). We track 150+ banks, credit unions, neobanks, and money market funds globally with focus on US and Norwegian markets. Our editorial mission: every person deserves to earn the best possible return on their savings.",

  coreKnowledge: {
    federalReserve: {
      currentRate: "5.25-5.50%",
      lastChange: "July 2023 (+25bp)",
      projectedCuts2026: "2-3 cuts of 25bp each projected by FOMC dot plot",
      impactOnSavings: "Every 25bp Fed cut reduces HYSA rates by 15-25bp within 30 days. Lock in CDs now if you believe rates will fall. Money market funds adjust daily.",
      FOMC_schedule_2026: ["Jan 28-29", "Mar 18-19", "Apr 29-30", "Jun 17-18", "Jul 29-30", "Sep 16-17", "Oct 28-29", "Dec 9-10"],
      historicalRates: {
        "2020-Q1": "0.25%", "2021-Q4": "0.25%", "2022-Q1": "0.25%", "2022-Q2": "1.50%",
        "2022-Q3": "3.00%", "2022-Q4": "4.25%", "2023-Q1": "4.75%", "2023-Q2": "5.00%",
        "2023-Q3": "5.25%", "2023-Q4": "5.50%", "2024-Q1": "5.50%", "2024-Q2": "5.50%",
        "2024-Q3": "5.25%", "2024-Q4": "4.75%", "2025-Q1": "4.50%", "2025-Q2": "4.25%",
        "2025-Q3": "4.25%", "2025-Q4": "4.25%", "2026-Q1": "4.25%"
      },
      rateProjections: {
        "2026-mid": "4.00%", "2026-end": "3.75%", "2027-mid": "3.50%", "2027-end": "3.25%"
      }
    },
    inflation: {
      currentCPI: "3.1%",
      corePCE: "2.9%",
      fedTarget: "2.0%",
      realReturnCalc: "Real return = APY minus Inflation rate. At 5.50% APY and 3.1% CPI: real return = 2.40%. Always evaluate savings in real, inflation-adjusted terms.",
      impactOnBankRates: "High inflation pushes Fed to raise rates, increasing HYSA APYs. Falling inflation allows Fed to cut rates, reducing HYSA APYs. Current rate cycle: peak reached, gradual decline expected."
    },
    bankingMarketStats: {
      totalFDICBanks: 4614,
      totalCreditUnions: 4645,
      totalNeobanks: 250,
      avgTraditionalBankSavingsAPY: 0.46,
      avgOnlineBankSavingsAPY: 4.85,
      avgNeobankAPY: 3.20,
      topHYSARate: 5.50,
      topCDRate: 6.00,
      topMMFYield: 5.32,
      totalAmericanBankDeposits: "17.7 trillion",
      americansUnderbanked: "5.9 million households",
      avgAmericanBankFeesPaidYearly: 329,
      FDICInsuredDepositsTotal: "9.6 trillion",
      moneyMarketFundAUM: "5.8 trillion",
      creditUnionMembership: "135 million Americans",
      neobankUserCount: "90 million Americans"
    },
    norwegianMarket: {
      centralBankRate: "4.50%",
      topSavingsRate: "5.10% (Skandia, 90-day notice)",
      nationalAvgSavingsRate: "3.20%",
      topBanks: ["DNB Bank (5.00% tidbetingede)", "SpareBank 1 (4.80%)", "Nordea (4.60%)", "Santander Consumer Bank (5.05%)", "Skandia (5.10% with 90-day notice)"],
      BSUrate: "Up to 6.10% APY for youth housing savings (BSU)",
      depositGuarantee: "2,000,000 NOK per depositor (via Bankenes Sikringsfond)",
      mortgageAvgRate: "5.90% (30-year)",
      regulatoryBody: "Finanstilsynet (Financial Supervisory Authority of Norway)"
    }
  },

  financialGlossary: [
    { term: "APY", definition: "Annual Percentage Yield. Real rate of return on savings accounting for compound interest. Higher APY means more earned per year. Formula: APY = (1 + r/n)^n - 1 where r = interest rate, n = compounding periods per year. Daily compounding (used by most HYSA) is optimal." },
    { term: "APR", definition: "Annual Percentage Rate. Simple interest rate without compounding. Used for loans and credit cards. APR is always lower than APY at the same underlying rate when compounding occurs. Compare APY to APY and APR to APR to avoid confusion." },
    { term: "FDIC", definition: "Federal Deposit Insurance Corporation. US government agency insuring bank deposits up to $250,000 per depositor, per FDIC-member bank, per ownership category. Created 1933. In 90 years, no FDIC-insured deposit has lost a single penny." },
    { term: "NCUA", definition: "National Credit Union Administration. Federal agency insuring credit union deposits up to $250,000 via the Share Insurance Fund (SIF). Equivalent protection to FDIC. Backed by full faith and credit of US government. No SIF-covered deposit has ever been lost." },
    { term: "HYSA", definition: "High-Yield Savings Account. Savings account offering significantly above-average APY, typically from online-only banks with no branch overhead. Currently top rates: 5.50% APY vs. 0.46% national average. FDIC insured. Best for emergency funds and short-term savings goals." },
    { term: "CD", definition: "Certificate of Deposit. Time deposit paying fixed interest for a specific term (1 month to 10 years). Higher rates than HYSA but with early withdrawal penalties. Current top 12-month CD: 6.00% (Marcus Goldman Sachs). Best for money you won't need for the CD term." },
    { term: "Money Market Account", definition: "Savings account with check-writing and debit card access. Requires higher minimums but offers better rates than standard savings. FDIC insured. Distinct from money market FUNDS which are investment products and NOT FDIC insured." },
    { term: "Money Market Fund", definition: "Mutual fund investing in short-term, high-quality debt instruments. NOT FDIC insured. Securities product, not bank deposit. Currently yields 4.96-5.32% (VMFXX, SPAXX). Liquid and low-risk but has slight credit risk. State income tax exempt (government-only funds)." },
    { term: "BaaS", definition: "Banking-as-a-Service. Infrastructure allowing non-bank companies to offer banking products by partnering with licensed banks. Fintech handles UX; bank holds deposits and provides FDIC coverage. Powers Chime (Bancorp), SoFi (SoFi Bank), Dave (Evolve Bank), and 200+ neobanks." },
    { term: "Compound Interest", definition: "Interest calculated on both principal and previously earned interest. Daily compounding (common in HYSA) beats monthly or annual. $10,000 at 5.50% daily compounding for 1 year = $10,565.41. Same at 0.46% = $10,046.11. The 5.04% difference is $519.30 per $10,000 per year." },
    { term: "Fed Funds Rate", definition: "Benchmark interest rate set by Federal Reserve FOMC. Banks charge each other this rate for overnight lending. Directly influences HYSA, CD, and mortgage rates. Current: 5.25-5.50%. Every 25bp change impacts HYSA by 15-25bp within 30 days." },
    { term: "Prime Rate", definition: "Interest rate commercial banks charge most creditworthy customers. Typically Fed Funds Rate + 3%. Current: 8.50%. Benchmark for HELOCs (Prime + 0-2%), credit cards (Prime + 10-20%), and some personal loans. Published daily by Wall Street Journal." },
    { term: "Sweep Account", definition: "Bank account automatically transferring excess funds to higher-yielding investments. Wealthfront sweeps to 32 FDIC banks ($8M coverage). Betterment: 13 banks ($2M). Fidelity: 5 banks ($1.25M). Morgan Stanley: institutional. Maximizes yield while maintaining instant access." },
    { term: "ChexSystems", definition: "Consumer reporting agency tracking banking history (overdrafts, account closures, returned checks). Banks check ChexSystems when opening accounts. Negative records last 5 years. Chime, Varo, and GO2bank don't use ChexSystems — best for banking fresh starts." },
    { term: "ACH Transfer", definition: "Automated Clearing House. Electronic bank-to-bank transfer. Standard ACH: 1-3 business days, free. Same-day ACH: free or small fee, faster. Most HYSA transfers are standard ACH. Direct deposit is ACH. Venmo, Cash App, and Zelle use ACH infrastructure." },
    { term: "Wire Transfer", definition: "Real-time electronic fund transfer. Domestic: same-day, $15-35 fee. International: 1-5 days, $30-50 fee. Irrevocable once sent. Used for large transactions, real estate, business. Charles Schwab and Fidelity offer free domestic wires. Wise is cheapest for international ($4-10)." },
    { term: "Overdraft Protection", definition: "Service covering transactions when account balance is insufficient. Options: Savings link ($0-12 transfer fee), line of credit (interest applies), overdraft privilege ($25-37 per transaction). Best-in-class: Huntington 24-Hour Grace (covers until 5pm next business day at no cost)." },
    { term: "Direct Deposit", definition: "Electronic paycheck transfer from employer to bank. Many banks offer 1-2 day early access. Required for best APY at SoFi (4.60%), Varo (5.00%), ONE Finance (5.00%). Setting up direct deposit is the #1 action to unlock premium banking benefits." },
    { term: "Zelle", definition: "Bank-owned P2P payment network. Instant transfers between 1,700+ US banks at no cost. No buyer protection (unlike PayPal/Venmo). Available in Chase, BofA, Wells Fargo, and most major bank apps. Cannot use for purchases — for person-to-person transfers only." },
    { term: "SWIFT Code", definition: "Society for Worldwide Interbank Financial Telecommunications. 8-11 character code identifying banks for international wires. Format: BANKUS33 (bank + country + location + branch). Required for all international wires. Also called BIC code. Find at bank's website or on account statements." },
    { term: "Treasury Bill", definition: "US Treasury Bill. Short-term government debt (4-52 weeks). Currently yielding 5.00-5.28%. Zero credit risk — backed by US government. State income tax exempt (federal taxable). Sold at discount, redeemed at face value. Buy via TreasuryDirect.gov or through broker at no cost." },
    { term: "I-Bond", definition: "Inflation-Protected Savings Bond. Rate adjusts with CPI every 6 months. Current rate: 5.27%. Purchase limit: $10,000/year ($5,000 more with tax refund). 1-year minimum hold, 3-month interest penalty if redeemed before 5 years. Best inflation hedge below $10,000/year investment." },
    { term: "TIPS", definition: "Treasury Inflation-Protected Securities. Principal adjusts with inflation. Real yield: 2.0-2.5%. Good long-term inflation hedge. Sold in $100 increments via TreasuryDirect or broker. Tax on phantom income (inflation adjustments taxed before receipt) makes TIPS better in tax-advantaged accounts." },
    { term: "Credit Union", definition: "Non-profit, member-owned financial cooperative. Regulated by NCUA. Members own the institution — profits returned as dividends, not to shareholders. Average credit union savings rate: 38% higher than bank average. Best for: highest yields, lowest loan rates, lowest fees." },
    { term: "Neobank", definition: "Digital-only company partnering with licensed banks to offer banking services. No physical branches. Lower overhead passed to customers as higher APYs and zero fees. 90M+ American neobank users. Top 5: Chime (38M users), SoFi (9M), Varo (8M), Current (4M), One Finance (3M)." },
    { term: "Open Banking", definition: "Framework allowing third parties to access bank data via APIs with customer consent. EU-mandated via PSD2 regulation. US adoption voluntary through fintech APIs (Plaid, Yodlee, Finicity). Powers budgeting apps (YNAB), account aggregators, and lending underwriting." },
    { term: "Yield Curve", definition: "Graph showing bond yields across maturities. Normal: long-term rates > short-term (compensates for holding longer). Inverted (current): short-term > long-term. Inverted yield curve has predicted every US recession since 1950, typically 12-18 months in advance." },
    { term: "Rule of 72", definition: "Quick calculation for investment doubling time. Divide 72 by interest rate. At 5.50% APY: 72/5.5 = 13.1 years. At 5.00%: 14.4 years. At 0.46% (national avg): 156 years to double. This simple rule explains why maximizing APY matters so much for long-term wealth." },
    { term: "Opportunity Cost", definition: "Return sacrificed by choosing one option over another. $50,000 in 0.01% savings vs. 5.50% HYSA = $2,745 lost per year. Over 10 years at compound growth: $29,180 lost. Opportunity cost of not switching is very real money permanently lost." },
    { term: "CD Laddering", definition: "Opening multiple CDs with different maturity dates for liquidity and yield. Example: $40,000 split into 4 CDs (3-month, 6-month, 12-month, 24-month). Each provides income at staggered intervals. As each matures, reinvest at best current rate or use the funds." },
    { term: "Interest Rate Risk", definition: "Risk that rising rates reduce value of existing fixed-rate instruments. CD holders face this: locked into 5.00% if rates rise to 6.00% = opportunity cost. Money market funds avoid interest rate risk — rates adjust daily with market. No-penalty CDs offer a middle path." },
    { term: "Liquidity Spectrum", definition: "From most to least liquid: Checking (instant), HYSA (1-3 day ACH), Money Market Fund (T+1 settlement), No-Penalty CD (instant, no penalty), Regular CD (penalty applies), I-Bond (1-year lock). Match your savings to the appropriate liquidity tier." },
    { term: "AML KYC", definition: "Anti-Money Laundering / Know Your Customer. Legal requirements for banks to verify customer identity. Opening an account requires: full name, address, date of birth, SSN/ITIN. Enhanced due diligence for large transactions ($10K+). All banks are legally required to file Suspicious Activity Reports." },
    { term: "GDPR CCPA", definition: "Data privacy regulations. GDPR (EU, 2018): Right to access, correct, delete data. CCPA (California, 2020): Similar rights for CA residents. Both affect Banktopp.com operations. Banktopp is NorwegianSpark SA — subject to Norwegian GDPR implementation." },
    { term: "CRA Community Reinvestment", definition: "Community Reinvestment Act (1977). Requires banks to meet credit needs of ALL communities served, including low-income areas. Banks rated Outstanding, Satisfactory, Needs Improvement, or Substantial Noncompliance. OneUnited Bank and Amalgamated Bank are CRA leaders." },
    { term: "Dodd-Frank 2010", definition: "Comprehensive financial reform post-2008 crisis. Created CFPB (consumer protection), FSOC (systemic risk oversight), Volcker Rule (no proprietary trading), expanded FDIC authority, and higher capital requirements. Most significant financial legislation since Glass-Steagall (1933)." },
    { term: "Tax on Interest Income", definition: "Bank, CD, and money market interest is taxable ordinary income (10-37% federal). Reported on 1099-INT for $10+ per institution. Municipal bond interest: federally exempt. I-Bond interest: state exempt. T-Bill interest: state exempt. Tax-advantaged accounts (IRA, 401K, HSA): interest grows tax-deferred or tax-free." },
    { term: "Savings Rate", definition: "Percentage of income saved monthly. US national average: 3.5%. Financial security benchmark: 15-20% of gross income. At 10% savings rate on $60K income = $6,000/yr. At 5.50% APY: after 10 years, that's $79,180 saved. After 20 years: $227,170." },
    { term: "Real Return", definition: "Investment return after inflation. Formula: Real Return approximately equals Nominal Rate minus Inflation Rate. At 5.50% APY and 3.1% CPI: Real Return = 2.40%. At 0.46% national avg and 3.1% CPI: Real Return = -2.64% (losing purchasing power). Always evaluate savings in real terms." },
    { term: "Norwegian Tidbetingede", definition: "Norwegian conditional savings account requiring notice period before withdrawal. Offers significantly higher rates than instant-access accounts. DNB Bank: 5.00% with 31-day notice. SpareBank 1: 4.80% with 60-day notice. Skandia: 5.10% with 90-day notice. Best rates in Norwegian retail banking." },
    { term: "BSU Account Norway", definition: "Boligsparing for ungdom. Norwegian housing savings for under-34s. Annual deposit: up to 27,500 NOK. Lifetime max: 100,000 NOK. 10% annual tax deduction on deposits. Rates: up to 6.10% APY. Best single financial product for young Norwegians planning homeownership." },
    { term: "Norges Bank Policy Rate", definition: "Norway's central bank benchmark rate. Current: 4.50% (2026). Higher than ECB (3.75%) due to stronger Norwegian economy and oil-driven wealth. Directly determines tidbetingede savings rates and mortgage rates. Norwegian mortgage average: 5.90% variable." },
    { term: "NetBank Norway", definition: "Norwegian term for online banking. All major Norwegian banks offer netbank (nettbank) with full account management, payments, and investment access. BankID is the universal Norwegian digital identity system used for secure banking authentication." },
    { term: "Vipps Norway", definition: "Norway's dominant mobile payment app (5M+ users out of 5.4M population). P2P transfers, merchant payments, and now banking through Vipps MobilePay. Owned by consortium of Norwegian banks. The Norwegian equivalent of Zelle/Venmo — but more widely adopted." },
    { term: "Government Pension Fund Global", definition: "Norway's sovereign wealth fund. $1.7 trillion assets under management — world's largest. Funded by oil revenues. Invests in 9,000+ companies in 70+ countries. Annual return expectation: 4%. Managed by Norges Bank Investment Management (NBIM). Owned by Norwegian people." },
    { term: "401K Strategy", definition: "2024 contribution limit: $23,000 ($30,500 if 50+). Always contribute up to employer match first — it's 50-100% instant return. Then max HSA ($4,150 individual). Then max Roth IRA ($7,000). Then additional 401K. Then taxable HYSA. This order optimizes after-tax wealth building." },
    { term: "Roth IRA Power", definition: "Roth IRA allows $7,000/year in after-tax contributions that grow and withdraw tax-free. $7,000/year from age 22 to 62 at 7% average market return = $1.5 million completely tax-free at retirement. SoFi offers 1% IRA contribution match. Fidelity and Vanguard have zero-fee index funds." },
    { term: "HSA Triple Tax", definition: "Health Savings Account: contributions pre-tax, growth tax-free, withdrawals tax-free for medical expenses. 2024 limits: $4,150 individual, $8,300 family. After 65: withdraw for any purpose (like Traditional IRA). Invest HSA in index funds for retirement healthcare funding. Most underutilized tax advantage available." },
    { term: "Emergency Fund Tiers", definition: "Optimal emergency fund structure: Tier 1 ($1-2K in checking for instant access). Tier 2 (1-2 months in HYSA at 5.50% for fast access). Tier 3 (additional 1-3 months in Ally No-Penalty CD at 4.75% for highest yield with zero withdrawal penalty). Total: 3-6 months expenses optimally deployed." },
    { term: "Net Worth Calculation", definition: "Net Worth = Assets minus Liabilities. Assets: savings, investments, home equity, car value. Liabilities: mortgage, car loan, student debt, credit card balance, personal loans. Track monthly in free tools: Empower (Personal Capital), Mint, or Copilot. Median US household net worth: $192,700. Median at 35: $76,300." },
    { term: "Dollar Cost Averaging", definition: "Investing fixed amounts regularly regardless of price. $500/month into S&P 500 index fund over 30 years at 7% average return = $605,000. The same $500/month in HYSA at 5.50% = $455,000. Stocks beat HYSA long-term — but HYSA beats stocks for money needed within 3-5 years." },
    { term: "Savings vs Investment Decision", definition: "Use HYSA for money needed within 3-5 years (emergency fund, down payment, car fund). Use investment accounts for money not needed for 5+ years (retirement, college fund). Never invest emergency fund. Current HYSA rates (5.50%) temporarily attractive vs. risk-adjusted stock returns." },
    { term: "Fintech Lending", definition: "Online lending platforms offering faster, cheaper personal loans than traditional banks. Top players: SoFi (6.99-24.99% APR), Marcus (6.99-24.99%), LightStream (6.99-25.49%). Average savings vs. credit card debt (20% APR): $200-500/month. Credit score 700+ required for best rates." },
    { term: "Mortgage Pre-Approval", definition: "Formal lender assessment of borrowing capacity. Based on income, debts, credit score, and down payment. Required before serious home shopping. Best rates from: local credit unions (PenFed 6.44%), online lenders (Better.com), and national banks competing for business. Getting 5+ quotes saves $50,000+ over loan life." },
    { term: "Debt Avalanche Method", definition: "Pay minimum on all debts, put extra money toward highest-interest debt first. Mathematically optimal — minimizes total interest paid. Credit card at 24% APR: $5,000 balance, minimum payment only = $8,000 total interest paid over 15 years. Add $100/month extra: paid off in 2 years, $800 total interest." },
    { term: "Debt Snowball Method", definition: "Pay minimum on all debts, extra money toward smallest balance first. Psychologically superior for many people — quick wins build momentum. Less mathematically optimal than avalanche but better if motivation is the limiting factor. Choose whichever method you'll actually stick to." },
    { term: "Balance Transfer Strategy", definition: "Moving high-APR credit card debt to 0% promotional card. Best 2026 offers: Citi Simplicity (21 months 0%), Wells Fargo Reflect (21 months 0%), Chase Freedom (15 months 0%). Typical transfer fee: 3-5%. Break-even: transfer $5,000 at 3% fee ($150) vs. 24% APR savings ($1,200/year). Always pay off before promo ends." },
    { term: "Net Interest Margin", definition: "NIM: difference between interest earned on loans and interest paid on deposits. Typical bank NIM: 2.5-3.5%. In rising rate environments, banks widen NIM by raising loan rates faster than deposit rates. Consumer advocacy: if mortgage rates rose 400bp, your savings rate should rise 400bp too." },
    { term: "Too Big To Fail Banks", definition: "US Global Systemically Important Banks (G-SIBs): JPMorgan Chase, Bank of America, Citigroup, Wells Fargo, Goldman Sachs, Morgan Stanley, Bank of New York Mellon, State Street. Additional capital surcharges: 1-3.5% CET1. Government implicit guarantee. Never failed since Dodd-Frank (but note: uninsured deposits can still be at risk)." },
    { term: "Silicon Valley Bank 2023", definition: "Second-largest US bank failure since 2008. Caused by: concentrated uninsured deposits (90%+ above $250K), poor interest rate risk management (long-duration bond portfolio), bank run by tech insiders on Twitter. Lesson: diversify across FDIC banks, keep deposits below $250K per institution, or use sweep account." },
    { term: "Embedded Finance 2026", definition: "Banking services built into non-banking products. Apple Savings (4.50% APY), Amazon Lending (business loans), Shopify Balance (merchant banking), Walmart Money Center. $7.2T projected market by 2030. Powered by BaaS infrastructure from Cross River Bank, Thread Bank, and Coastal Community Bank." },
    { term: "Central Bank Digital Currency", definition: "CBDC. Digital form of central bank money. Fed exploring FedNow (launched 2023) and potential digital dollar. EU working on digital euro. China's e-CNY has 260M+ users. Implications: could disintermediate commercial banks, enable direct government payments. Not yet implemented in US retail banking." },
    { term: "Open Finance", definition: "Extension of open banking to include investments, insurance, and retirement data. Consumer Financial Protection Bureau (CFPB) Rule 1033 (2024) requires banks to share customer financial data with authorized third parties. Will enable better financial planning tools and true account portability." },
    { term: "Banking Concentration Risk", definition: "Top 5 US banks (JPMorgan, BofA, Citi, Wells, USB) hold 45% of all US deposits. Systemic risk concern. For consumers: diversify across 2-3 institutions to reduce single-institution risk and maximize FDIC coverage. For large depositors: use sweep accounts or IntraFi network (formerly CDARS)." },
    { term: "Financial Inclusion", definition: "Access to affordable financial services for underserved populations. 5.9M US households unbanked (disproportionately Black, Hispanic, low-income). Solutions: Chime (no ChexSystems), Varo (real bank charter, no minimum), OneUnited (Black-owned CDFI), Green Dot (Walmart cash loads). FDIC launches Mission Driven Banking Fund to support CDFIs." },
    { term: "Gig Economy Finance", definition: "18% of US workers participate in gig economy. Income irregularity creates unique banking needs: tax withholding automation, variable deposit protection, earned wage access. Best accounts: Found (auto-taxes), Lili (1099 tracking), Stride (health insurance), Payactiv (earned wage access)." },
    { term: "Cross-Border Banking", definition: "Moving money internationally: Wise best for transfers ($1.99-4 fee, real exchange rate). Revolut for multi-currency spending. Schwab for international ATM withdrawals (unlimited reimbursements). Transfer timing: Wise 10 seconds to UK, 1-5 days to other countries. Never use Western Union for bank transfers (fees 2-5%)." }
  ],

  rateHistory: {
    description: "Historical APY rates for key savings products tracked by Banktopp. Use for context on rate environment and trend analysis.",
    HYSA: [
      { date: "2022-01", topRate: 0.60, nationalAvg: 0.06, fedRate: 0.25 },
      { date: "2022-03", topRate: 0.80, nationalAvg: 0.08, fedRate: 0.25 },
      { date: "2022-06", topRate: 1.25, nationalAvg: 0.15, fedRate: 1.50 },
      { date: "2022-09", topRate: 2.50, nationalAvg: 0.25, fedRate: 3.00 },
      { date: "2022-12", topRate: 3.50, nationalAvg: 0.35, fedRate: 4.25 },
      { date: "2023-03", topRate: 4.50, nationalAvg: 0.45, fedRate: 4.75 },
      { date: "2023-06", topRate: 5.00, nationalAvg: 0.48, fedRate: 5.00 },
      { date: "2023-09", topRate: 5.35, nationalAvg: 0.50, fedRate: 5.25 },
      { date: "2023-12", topRate: 5.50, nationalAvg: 0.52, fedRate: 5.50 },
      { date: "2024-03", topRate: 5.50, nationalAvg: 0.52, fedRate: 5.50 },
      { date: "2024-06", topRate: 5.50, nationalAvg: 0.53, fedRate: 5.50 },
      { date: "2024-09", topRate: 5.35, nationalAvg: 0.52, fedRate: 5.25 },
      { date: "2024-12", topRate: 5.10, nationalAvg: 0.48, fedRate: 4.75 },
      { date: "2025-03", topRate: 5.00, nationalAvg: 0.47, fedRate: 4.50 },
      { date: "2025-06", topRate: 4.85, nationalAvg: 0.46, fedRate: 4.25 },
      { date: "2025-09", topRate: 4.85, nationalAvg: 0.46, fedRate: 4.25 },
      { date: "2025-12", topRate: 4.85, nationalAvg: 0.46, fedRate: 4.25 },
      { date: "2026-03", topRate: 5.50, nationalAvg: 0.46, fedRate: 4.25 }
    ],
    CD_12month: [
      { date: "2022-01", topRate: 0.75, fedRate: 0.25 },
      { date: "2022-06", topRate: 1.85, fedRate: 1.50 },
      { date: "2022-12", topRate: 4.50, fedRate: 4.25 },
      { date: "2023-06", topRate: 5.50, fedRate: 5.00 },
      { date: "2023-12", topRate: 5.75, fedRate: 5.50 },
      { date: "2024-06", topRate: 5.50, fedRate: 5.50 },
      { date: "2024-12", topRate: 5.25, fedRate: 4.75 },
      { date: "2025-06", topRate: 5.00, fedRate: 4.25 },
      { date: "2026-03", topRate: 6.00, fedRate: 4.25 }
    ],
    mortgage30yr: [
      { date: "2022-01", rate: 3.56 }, { date: "2022-06", rate: 5.89 },
      { date: "2022-12", rate: 6.73 }, { date: "2023-06", rate: 6.79 },
      { date: "2023-12", rate: 7.22 }, { date: "2024-06", rate: 7.03 },
      { date: "2024-12", rate: 6.85 }, { date: "2025-06", rate: 6.72 },
      { date: "2026-03", rate: 7.04 }
    ],
    moneyMarket: [
      { date: "2022-01", topYield: 0.05 }, { date: "2022-06", topYield: 1.50 },
      { date: "2022-12", topYield: 4.20 }, { date: "2023-06", topYield: 5.00 },
      { date: "2023-12", topYield: 5.25 }, { date: "2024-06", topYield: 5.30 },
      { date: "2024-12", topYield: 5.10 }, { date: "2025-06", topYield: 4.90 },
      { date: "2026-03", topYield: 5.32 }
    ]
  },

  marketInsights: [
    { id: "mi001", category: "Rate Outlook 2026", priority: 1, insight: "Federal Reserve projected to cut rates 2-3 times in 2026 (50-75bp total). HYSA rates will follow, falling to approximately 4.75-5.00% by end of 2026. Action: Lock in 2-year CDs at 5.50-6.00% APY NOW for money you won't need before 2028. Marcus Featured CD at 6.00% for 13 months is the best current opportunity." },
    { id: "mi002", category: "Best Overall Strategy 2026", priority: 1, insight: "Optimal tiered savings: (1) Emergency fund 3-6 months in top HYSA — Wealthfront 5.50% APY with $8M FDIC or Marcus 5.50%. (2) Short-term savings 1-2 years: Ally No-Penalty CD 4.75% APY with zero early withdrawal penalty. (3) Long-term savings 2+ years: Marcus Featured CD 6.00% APY locked for 13 months." },
    { id: "mi003", category: "Credit Union Champions", priority: 2, insight: "For highest checking account yield: Connexus Credit Union delivers 6.17% APY (15 debit transactions + e-statements required, open to all). For no-requirement checking yield: Lake Michigan CU delivers 3.00% APY with absolutely zero qualifying requirements, open to all via $5 ALS donation. Both crush traditional bank savings rates." },
    { id: "mi004", category: "Neobank Winner 2026", priority: 2, insight: "SoFi dominates as best all-in-one platform: 4.60% APY, commission-free investing, student loan refinancing, $300 bonus, and no fees. For pure savings yield: Wealthfront (5.50%, $8M FDIC) and Betterment (5.50%, $2M FDIC) are unmatched. For mobile-first simplicity: Milli Bank (5.50%, Jars budgeting) is most innovative new entrant." },
    { id: "mi005", category: "Business Banking 2026", priority: 2, insight: "Mercury remains #1 for funded startups: 4.79% APY treasury, $5M FDIC via sweep, best-in-class UX, API access. Relay for growing SMBs: 20 checking accounts, 50 virtual cards, zero fees. Brex for Series A+ companies: 4.92% APY, AI expense automation. Found for freelancers: automated tax withholding saves avg $1,200/yr in estimated tax errors." },
    { id: "mi006", category: "Student Banking Guide", priority: 2, insight: "Best student accounts: (1) Discover Cashback Debit (1% cashback debit, zero fees, #1 CS). (2) Chase College Checking (5-year free, Chase ecosystem). (3) Capital One 360 (4.25% HYSA, 750 Cafés). For credit building from zero: Step (secured card reports to bureaus from day 1), Self Financial (18M+ Americans improved credit score). Start banking young — compound time is your greatest asset." },
    { id: "mi007", category: "Military Banking Excellence", priority: 2, insight: "Navy Federal delivers absolute best rates for eligible members: 6.17% APY Flagship Checking, 5.30% APY Special EasyStart CD (only $50 minimum). USAA for military insurance bundling — 97% member retention rate proves the value. PenFed open to all Americans via $5 donation: best credit card rewards in the credit union space (2% cash back everywhere)." },
    { id: "mi008", category: "International Banking 2026", priority: 3, insight: "Best for international transfers: Wise ($1.99-4 flat fee, real exchange rate on 50+ currencies). Best for US travelers: Charles Schwab Investor Checking (unlimited ATM reimbursements, zero foreign transaction fees). Best for expats: Wise Interest account (earn 4.44% USD, 4.90% GBP, 3.55% EUR simultaneously). Revolut for multi-currency spending in 150+ countries." },
    { id: "mi009", category: "Inflation Protection Strategy", priority: 1, insight: "Current 3.1% CPI means you need 4.00%+ APY just to break even in real terms. HYSA at 5.50% provides 2.40% real return — best guaranteed real return available. I-Bonds (5.27%, adjusts with CPI) provide direct inflation protection. T-Bills (5.00-5.28%) are state-income-tax-exempt. Traditional bank savings at 0.46% destroys purchasing power: -2.64% real return." },
    { id: "mi010", category: "High Balance FDIC Strategy", priority: 2, insight: "For balances above $250,000: Wealthfront ($8M via 32 banks), Betterment ($2M via 13 banks), SoFi ($2M), Fidelity CMA ($1.25M via 5 banks). For $1M+: Trust accounts with 4 beneficiaries = $1M coverage at ONE bank. Or use IntraFi Network (formerly CDARS/ICS) for institutional FDIC coverage up to $150M at one bank." },
    { id: "mi011", category: "Fee Elimination Impact", priority: 1, insight: "Average American pays $329/year in banking fees. Complete fee elimination value: Monthly maintenance fees ($12 x 12 = $144), Overdraft fee elimination ($37 x 3 = $111), ATM fee elimination ($3.50 x 20 = $70). Total annual savings: $325. Plus HYSA upgrade ($50K at 5.04% differential = $2,520/yr). Combined: $2,845/year from switching to optimal free account." },
    { id: "mi012", category: "CD Laddering 2026", priority: 2, insight: "Optimal CD ladder for $40,000 in current environment: $10K in 6-month CD (4.75%), $10K in 12-month CD (5.00%), $10K in 18-month CD (5.20%), $10K in 24-month CD (5.50%). Total year 1 income: $1,960. Every 6 months, reinvest maturing CD at best available rate. This strategy provides both liquidity and rate protection." },
    { id: "mi013", category: "Money Market vs HYSA Decision", priority: 2, insight: "FDIC-insured HYSA (Wealthfront 5.50%) vs. Vanguard VMFXX (5.28%, NOT FDIC): For most consumers, FDIC-insured wins — same yield tier, zero risk of loss. Exception: Fidelity SPAXX (4.96%) is convenient if already a Fidelity user. T-Bills via Treasury Direct (5.00-5.28%) add state tax exemption benefit for high-income earners in high-tax states." },
    { id: "mi014", category: "APY Rate Chasing Discipline", priority: 3, insight: "Rate chasing risks: frequent account changes flag ChexSystems (banking reputation), multiple 1099-INTs add tax complexity, missing bonus qualification periods. Best practice: Switch when rate differential exceeds 0.50% APY AND you can maintain the new account for at least 90 days. Don't switch for less than $50/year gain — your time has value too." },
    { id: "mi015", category: "The Power of Compound Interest", priority: 1, insight: "$500/month saved at 5.50% APY for 20 years: $218,147 total ($98,147 interest earned). Same savings at 0.46% national average: $127,046 ($7,046 interest). The 5.04% APY difference generates $91,101 more in interest from the same savings habit. That's $91,101 worth of financial decisions you make in 15 minutes by choosing the right savings account." },
    { id: "mi016", category: "Bank Bonus Optimization", priority: 3, insight: "Optimal bank bonus strategy 2026: (1) Huntington $600 (requires $1K direct deposit for 90 days). (2) US Bank $400 (requires 2 direct deposits). (3) SoFi $300 (requires $5,000 direct deposit). Net after 22% tax: $468, $312, $234 respectively. Stack by using different banks for different account types. Annual bonus hunting: $800-1200 per year is achievable." },
    { id: "mi017", category: "Norwegian Market Insights", priority: 2, insight: "Norwegian savers currently enjoy strong rates: DNB tidbetingede 5.00% (31-day notice), Skandia 5.10% (90-day notice), BSU accounts for under-34s up to 6.10% APY. Norwegian mortgage variable rates: 5.90% average. Norges Bank expected to cut rates in 2026 as inflation approaches 2.0% target. Lock in tidbetingede now before cuts arrive." },
    { id: "mi018", category: "Fintech Security Assessment", priority: 2, insight: "Security comparison: Traditional banks have the most robust security infrastructure (dedicated teams, decades of hardening). Neobanks powered by established BaaS partners (Cross River, Thread, Evolve) inherit their security. Crypto-integrated accounts carry additional smart contract and exchange risks. FDIC insurance covers deposits but NOT crypto holdings or money market fund shares." },
    { id: "mi019", category: "ESG Banking ROI", priority: 3, insight: "Values-aligned banking: Amalgamated Bank (B Corp, 4.00% APY, fossil-fuel-free), Climate First Bank (3.75% APY, 100% climate lending), OneUnited (community development, financial inclusion). Premium: slightly lower APY vs. top HYSA (1.50-2.00% below Wealthfront). Calculate annual values premium: $50K at 5.50% = $2,750/yr. $50K at 4.00% = $2,000/yr. Values premium cost: $750/yr." },
    { id: "mi020", category: "2026 Banking Technology Trends", priority: 3, insight: "Key banking technology trends: (1) AI-powered personal finance (Albert, Cleo, Monarch Money). (2) Instant payments expansion (FedNow real-time settlements). (3) Open banking API proliferation (CFPB Rule 1033 implementation). (4) Embedded finance growth (banking in every app). (5) CBDC development (digital dollar exploration). (6) Biometric authentication standardization. Stay informed — banking is changing faster than any decade since the 1990s internet revolution." }
  ],

  quizProfiles: {
    "high-yield-seeker": { label: "Maximum Yield Optimizer", banks: ["b046","b043","b045","b086","b135","b028","b054"], reason: "Prioritizes absolute maximum APY with minimal restrictions. Top picks: Wealthfront (5.50%), Milli (5.50%), Betterment (5.50%), Marcus CD (6.00%), Western Alliance (5.36%)." },
    "fee-eliminator": { label: "Zero-Fee Warrior", banks: ["b014","b032","b020","b049","b010","b013","b041"], reason: "Zero tolerance for any banking fees whatsoever. Champions: Chime, Discover, nbkc Bank, Alliant CU, Capital One 360." },
    "investor-saver": { label: "Investment-Integrated Saver", banks: ["b078","b076","b087","b088","b045","b046","b069"], reason: "Wants banking tightly integrated with investment portfolio. Best: SoFi (all-in-one), Robinhood Gold, Wealthfront, Betterment, Fidelity CMA, Vanguard VMFXX." },
    "global-traveler": { label: "International Banking Master", banks: ["b068","b069","b089","b031","b067","b066"], reason: "International use requires no FX fees and global ATM reimbursements. Non-negotiables: Charles Schwab (unlimited global ATM), Wise Interest (multi-currency yield), Fidelity CMA (worldwide ATM), Revolut." },
    "student-starter": { label: "First-Time Banking Student", banks: ["b020","b021","b082","b081","b033","b126","b090"], reason: "Student-specific features: no fees, campus ATM access, credit building from day one. Top: Discover Cashback Debit, Chase College Checking, Capital One MONEY, Step (credit builder)." },
    "business-owner": { label: "Business Banking Power User", banks: ["b143","b073","b074","b075","b146","b122","b123"], reason: "Business features matter: multiple accounts, accounting integrations, expense management, business yield. Champions: Mercury (startups), Relay (SMBs), Brex (growth companies), Ramp (finance teams), Found (freelancers)." },
    "military-member": { label: "Military and Veteran Banking", banks: ["b042","b079","b061","b085","b149","b135"], reason: "Military community deserves military-grade banking. Best-in-class: Navy Federal (6.17% checking, 5.30% CD), USAA (insurance bundling, 97% retention), PenFed (open to all, best credit cards)." },
    "family-banker": { label: "Family Financial Hub", banks: ["b034","b149","b082","b081","b125","b126","b090"], reason: "Family banking needs: teen accounts, parental controls, college savings, family rate optimization. Greenlight Max (investing for kids), Step (teen credit building), Capital One MONEY (teen checking)." },
    "credit-builder": { label: "Credit Score Rebuilder", banks: ["b107","b126","b033","b140","b082"], reason: "Building or rebuilding credit requires credit-builder products. Self Financial (all 3 bureaus), Step (teen credit from day 1), Possible Finance (no hard inquiry), GO2bank (credit builder secured card)." },
    "eco-conscious": { label: "Sustainability-Aligned Saver", banks: ["b083","b084","b138","b094","b150"], reason: "Values alignment matters as much as yield. Amalgamated Bank (B Corp, 4.00% APY, fossil-fuel-free), Climate First Bank (100% climate lending), Aspiration Plus (5.00% APY, tree planting)." }
  },

  contextualAdvice: {
    switchingThreshold: "Switch banks when: (1) APY differential exceeds 0.50%, (2) Paying any monthly maintenance fee, (3) ATM fees exceed $10/month, (4) Waiting 3+ days for routine transfers, (5) CS rating below 3.5 stars. Don't switch if: in middle of bonus qualification period, account is less than 90 days old, or switching costs exceed 1-year interest gain.",
    emergencyFundRule: "Emergency fund rules: NEVER invest it (stocks can drop 50% when you need it most). Keep in FDIC-insured HYSA only. Optimal amount: 3 months if you have multiple income streams and job security, 6 months if single income household or volatile employment. Current best: Marcus 5.50% (Goldman Sachs stability) or Wealthfront 5.50% ($8M FDIC).",
    rateForecastAction: "2026 rate forecast action plan: Fed projected to cut 2-3 times (50-75bp). HYSA rates will follow within 30 days of each cut. If you have $50,000+ that you won't need for 2 years: move 60% to 24-month CD (Marcus 5.50% or Ally 2-year) NOW. Keep 40% in liquid HYSA. Lock in today's high rates before they disappear.",
    taxOptimizationOrder: "Optimal savings order for tax efficiency: (1) 401K up to employer match (50-100% instant return). (2) HSA maximum ($4,150/$8,300) — triple tax advantage. (3) Roth IRA maximum ($7,000) — tax-free forever. (4) Additional 401K to maximum. (5) Then taxable HYSA for remaining savings. Following this order saves average $3,000-8,000/year in taxes.",
    norwegianSavingsAdvice: "Norwegian savers: prioritize BSU account first if under 34 (tax deduction + high rate = best product in market). Then tidbetingede savings account with longest notice period you can tolerate: Skandia 5.10% at 90 days is best current rate. DNB 5.00% at 31 days if you need shorter notice. Avoid standard instant-access accounts — rate differential vs. tidbetingede is 1.50-2.00%."
  }
};

// ─── EXPANDED TICKER DATA (replaces/extends TICKER_DATA) ─────────────────────
export const LIVE_MARKET_RATES = [
  { label: "Fed Funds Rate", value: "5.25-5.50%", change: "+0.00", up: null, category: "policy" },
  { label: "National Avg APY", value: "0.46%", change: "+0.02", up: true, category: "savings" },
  { label: "Top HYSA APY", value: "5.50%", change: "+0.15", up: true, category: "savings" },
  { label: "Top CD 12-Month", value: "6.00%", change: "+0.25", up: true, category: "savings" },
  { label: "Top CU APY", value: "6.17%", change: "+0.00", up: null, category: "savings" },
  { label: "Money Market Fund", value: "5.32%", change: "+0.05", up: true, category: "savings" },
  { label: "Inflation CPI", value: "3.1%", change: "-0.3", up: false, category: "macro" },
  { label: "Core PCE", value: "2.9%", change: "-0.2", up: false, category: "macro" },
  { label: "Prime Rate", value: "8.50%", change: "+0.00", up: null, category: "policy" },
  { label: "T-Bill 4-Week", value: "5.28%", change: "-0.02", up: false, category: "treasury" },
  { label: "T-Bill 3-Month", value: "5.22%", change: "-0.01", up: false, category: "treasury" },
  { label: "T-Bill 6-Month", value: "5.15%", change: "-0.02", up: false, category: "treasury" },
  { label: "T-Bill 1-Year", value: "5.00%", change: "-0.05", up: false, category: "treasury" },
  { label: "2-Year Treasury", value: "4.62%", change: "-0.04", up: false, category: "treasury" },
  { label: "10-Year Treasury", value: "4.30%", change: "+0.08", up: false, category: "treasury" },
  { label: "30-Year Treasury", value: "4.50%", change: "+0.06", up: false, category: "treasury" },
  { label: "I-Bond Rate", value: "5.27%", change: "+0.40", up: true, category: "savings" },
  { label: "SOFR Overnight", value: "5.31%", change: "+0.00", up: null, category: "policy" },
  { label: "Mortgage 30yr Fix", value: "7.04%", change: "+0.12", up: false, category: "lending" },
  { label: "Mortgage 15yr Fix", value: "6.42%", change: "+0.08", up: false, category: "lending" },
  { label: "ARM 5/1 Rate", value: "6.15%", change: "+0.05", up: false, category: "lending" },
  { label: "HELOC Prime+1.5%", value: "10.00%", change: "+0.00", up: null, category: "lending" },
  { label: "Auto Loan 60mo", value: "7.02%", change: "+0.11", up: false, category: "lending" },
  { label: "Personal Loan Avg", value: "11.48%", change: "+0.15", up: false, category: "lending" },
  { label: "Norges Bank Rate", value: "4.50%", change: "+0.00", up: null, category: "international" },
  { label: "ECB Main Rate", value: "3.75%", change: "-0.25", up: false, category: "international" },
  { label: "Bank of England", value: "5.25%", change: "+0.00", up: null, category: "international" },
  { label: "RBA Australia", value: "4.35%", change: "+0.00", up: null, category: "international" },
];

// ─── SAVINGS TIPS KNOWLEDGE BASE ──────────────────────────────────────────────
export const SAVINGS_TIPS = [
  { id: "st001", category: "rate-optimization", title: "5.50% APY Is Available Right Now — Are You Earning It?", content: "Marcus by Goldman Sachs, Wealthfront Cash Account, and Betterment Cash Reserve all offer 5.50% APY today. The national bank average is 0.46%. If you have $10,000 in a standard savings account, switching today earns you $504 more per year from day one.", priority: 1 },
  { id: "st002", category: "fee-elimination", title: "The Hidden Cost of Traditional Bank Fees", content: "JPMorgan Chase, Bank of America, and Wells Fargo collectively collect over $9 billion per year in retail fees. Monthly maintenance fees ($12/mo = $144/yr), overdraft fees ($37 each), and out-of-network ATM fees ($3.50 + bank fee) drain hundreds per year from average Americans. Free alternatives: Chime, Discover, nbkc Bank, Alliant CU.", priority: 1 },
  { id: "st003", category: "cd-strategy", title: "Lock In 6.00% Before Fed Cuts Rates", content: "Marcus Featured CD offers 6.00% APY on 13-month terms. With Federal Reserve projected to cut rates 2-3 times in 2026, locking in today's top CD rates is time-sensitive. $10,000 at 6.00% for 13 months = $650 guaranteed interest, regardless of future rate changes.", priority: 1 },
  { id: "st004", category: "credit-unions", title: "Credit Unions Pay 38% More in Dividends Than Banks", content: "Average credit union savings rate is 38% higher than average bank savings rate. Credit unions have no shareholders — all profits returned to members as dividends. Connexus CU: 6.17% APY on checking (highest in America). Lake Michigan CU: 3.00% APY checking with ZERO qualifying requirements.", priority: 2 },
  { id: "st005", category: "fdic-strategy", title: "Maximize FDIC Coverage Beyond $250,000", content: "Standard FDIC: $250,000 per depositor per bank. Extend protection: Joint accounts ($500K), TOD accounts (+$250K per beneficiary), trust accounts (+$250K per unique beneficiary). Or: Wealthfront ($8M via 32 banks), Betterment ($2M via 13 banks), SoFi ($2M), Fidelity CMA ($1.25M).", priority: 2 },
  { id: "st006", category: "inflation-protection", title: "Your Standard Savings Account Is Losing to Inflation", content: "At 0.46% APY and 3.1% CPI, standard savings accounts lose 2.64% in real purchasing power annually. A $20,000 emergency fund loses $528/year in real terms. Move to Wealthfront or Marcus (5.50% APY): real return becomes +2.40%, a $1,008 annual real-terms improvement.", priority: 1 },
  { id: "st007", category: "bonus-hunting", title: "Earn Up to $600 Just for Switching Banks", content: "Best 2026 bonuses: Huntington $600 (requires $1K direct deposit for 90 days — net after 22% tax: $468), US Bank $400 (net: $312), SoFi $300 (net: $234), Chase $300 (net: $234). Stack multiple bonuses across different account types. Annual bonus income: $800-1,200 is achievable with discipline.", priority: 3 },
  { id: "st008", category: "compound-interest", title: "The 30-Year Compound Interest Difference Is Staggering", content: "$300/month saved at 0.46% APY for 30 years: $110,519 total (just $2,519 in interest). Same $300/month at 5.50% APY for 30 years: $261,448 total ($153,448 in interest). The 5.04% APY difference generates $150,929 more from identical savings habits over 30 years.", priority: 1 },
  { id: "st009", category: "neobank-education", title: "Why Neobanks Pay More Than Traditional Banks", content: "Average bank branch costs $2.5M+ per year to operate. JPMorgan has 4,700 branches. That's $11.75B in branch costs — paid by depositors as low APYs and high fees. SoFi, Ally, and Marcus operate zero branches but serve millions. They pass savings to customers as higher yields and lower fees.", priority: 2 },
  { id: "st010", category: "rate-monitoring", title: "Set Calendar Reminders After Fed Meetings", content: "FOMC meets 8 times per year. When the Fed cuts rates, your HYSA will typically drop within 30 days. Set calendar reminders the day after each FOMC meeting to check your bank's rate. If your rate drops 0.50%+ below market leaders, switch. The 15-minute switch saves $250+ annually on $50K.", priority: 3 },
  { id: "st011", category: "international-banking", title: "Stop Paying Foreign Transaction Fees", content: "Average international traveler pays $120-200/year in 2-3% foreign transaction fees plus $100-200 in international ATM fees. Free solution: Charles Schwab Investor Checking (unlimited worldwide ATM reimbursements, zero FX fees) + Wise debit card (real exchange rates on 50+ currencies). Annual savings: $250-400.", priority: 3 },
  { id: "st012", category: "student-banking", title: "The Best Free Student Account Pays 1% Cashback on All Spending", content: "Discover Cashback Debit: 1% cash back on ALL debit purchases, zero fees of any kind, zero minimum balance, ATM fee reimbursements. Student spending $1,000/month earns $120/year cashback from a completely free account. Add Discover HYSA (4.25% on $5,000): $545/year total return. No other free account comes close.", priority: 2 },
  { id: "st013", category: "business-banking", title: "Your Business Cash Should Earn 4.79% APY", content: "Mercury Treasury delivers 4.79% APY on business checking with $5M FDIC protection. A company with $100,000 in operating cash earns $4,790/year vs. $10-50 in traditional business checking. That's $4,740 in additional annual revenue from a single 20-minute account setup. Mercury also has the best-designed business banking app available.", priority: 2 },
  { id: "st014", category: "tax-planning", title: "Plan Your Interest Income Tax Impact", content: "Bank interest is ordinary income (10-37% federal tax). $1,000 in HYSA interest at 22% federal rate: net $780 after-tax. I-Bond interest: state income tax exempt (saves 5-9% in high-tax states). T-Bill interest: federally taxable but state+local exempt. Always compare after-tax yields for high-income earners in high-tax states.", priority: 3 },
  { id: "st015", category: "automation", title: "Automate Savings to Beat Human Psychology", content: "Research shows automatic savers accumulate 3x more savings than manual savers at the same income level. Set up automatic transfer from checking to HYSA on payday. Psychologically, you can't spend what you never see. Most HYSA allow free recurring scheduled ACH transfers. Set it up once — the benefit compounds for life.", priority: 2 }
];


// ─── ROUTER (hash-based, SPA-compatible) ─────────────────────────────────────

type Route =
  | { page: "home" }
  | { page: "banks" }
  | { page: "category"; slug: string }
  | { page: "bank-detail"; slug: string }
  | { page: "compare" }
  | { page: "quiz" }
  | { page: "about" }
  | { page: "advertise" }
  | { page: "privacy" }
  | { page: "terms" }
  | { page: "404" };

function parseHash(hash: string): Route {
  const h = hash.replace("#", "").split("/");
  if (!h[0] || h[0] === "") return { page: "home" };
  if (h[0] === "banks") return { page: "banks" };
  if (h[0] === "category" && h[1]) return { page: "category", slug: h[1] };
  if (h[0] === "bank" && h[1]) return { page: "bank-detail", slug: h[1] };
  if (h[0] === "compare") return { page: "compare" };
  if (h[0] === "quiz") return { page: "quiz" };
  if (h[0] === "about") return { page: "about" };
  if (h[0] === "advertise") return { page: "advertise" };
  if (h[0] === "privacy") return { page: "privacy" };
  if (h[0] === "terms") return { page: "terms" };
  return { page: "404" };
}

function navigate(to: string) {
  window.location.hash = to;
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return route;
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? "var(--accent-primary)" : "none"}
          stroke={i <= Math.round(rating) ? "var(--accent-primary)" : "rgba(255,255,255,0.3)"} />
      ))}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: size - 1, marginLeft: 4, color: "var(--text-muted)" }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function AffiliateButton({ bank }: { bank: Bank }) {
  return (
    <div>
      <p className="affiliate-disclosure">Affiliate link — we may earn a commission at no cost to you</p>
      <a
        href={bank.affiliate_url ?? `https://example.com/go/${bank.slug}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn-primary"
        style={{ textDecoration: "none", display: "inline-flex" }}
        aria-label={`Visit ${bank.name} (opens in new tab)`}
      >
        Visit {bank.name} <ExternalLink size={14} />
      </a>
    </div>
  );
}

function BankLogo({ bank, size = 40 }: { bank: Bank; size?: number }) {
  const initials = bank.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: "linear-gradient(135deg, rgba(245,200,66,0.2), rgba(45,212,191,0.2))",
      border: "1px solid rgba(245,200,66,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.35,
      color: "var(--accent-primary)", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: 0 }}>
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ textAlign: "left", fontWeight: 500, color: "var(--text-primary)", fontSize: 15 }}>{q}</span>
        {open ? <ChevronUp size={18} color="var(--accent-primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ paddingBottom: 16, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{a}</div>
      )}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent-primary)" }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── TICKER BAR ───────────────────────────────────────────────────────────────

const TICKER_DATA = [
  { label: "Fed Funds Rate", value: "5.25–5.50%", change: "+0.00", up: null },
  { label: "National Avg APY", value: "0.46%", change: "+0.02", up: true },
  { label: "Top HYSA APY", value: "5.50%", change: "+0.15", up: true },
  { label: "Best CD 12-Month", value: "6.00%", change: "+0.25", up: true },
  { label: "Top CU Checking", value: "6.17%", change: "+0.00", up: null },
  { label: "Inflation (CPI)", value: "3.1%", change: "-0.3", up: false },
  { label: "Mortgage 30yr Fix", value: "7.04%", change: "+0.12", up: false },
  { label: "Prime Rate", value: "8.50%", change: "+0.00", up: null },
  { label: "Money Market Fund", value: "5.32%", change: "+0.05", up: true },
  { label: "T-Bill 3-Month", value: "5.22%", change: "-0.01", up: false },
  { label: "T-Bill 1-Year", value: "5.00%", change: "-0.05", up: false },
  { label: "10-Year Treasury", value: "4.30%", change: "+0.08", up: false },
  { label: "I-Bond Rate", value: "5.27%", change: "+0.40", up: true },
  { label: "Mortgage 15yr Fix", value: "6.42%", change: "+0.08", up: false },
  { label: "Auto Loan 60mo", value: "7.02%", change: "+0.11", up: false },
  { label: "Norges Bank Rate", value: "4.50%", change: "+0.00", up: null },
  { label: "ECB Rate", value: "3.75%", change: "-0.25", up: false },
  { label: "Bank of England", value: "5.25%", change: "+0.00", up: null },
  { label: "SOFR Rate", value: "5.31%", change: "+0.00", up: null },
  { label: "Personal Loan Avg", value: "11.48%", change: "+0.15", up: false },
];

function TickerBar() {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div role="marquee" aria-label="Live financial rates" style={{
      height: 36, background: "rgba(245,200,66,0.06)", borderBottom: "1px solid rgba(245,200,66,0.12)",
      overflow: "hidden", display: "flex", alignItems: "center",
      willChange: "transform", contain: "layout style",
    }}>
      <div className="ticker-track">
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 28px", whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>
              {item.value}
            </span>
            {item.up !== null && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11,
                color: item.up ? "#4ADE80" : "var(--accent-danger)" }}>
                {item.change}
              </span>
            )}
            <span style={{ color: "rgba(255,255,255,0.1)", marginLeft: 4 }}>·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header role="banner" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(4,4,10,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--card-border)" : "1px solid transparent",
      transition: "all 0.3s",
    }}>
      <nav aria-label="Main navigation" style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => navigate("")} aria-label="Banktopp home" style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ color: "var(--accent-primary)" }}>Bank</span>topp
          <span style={{ background: "var(--accent-primary)", color: "#000", fontSize: 10, fontFamily: "var(--font-mono)",
            fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>NO</span>
        </button>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ position: "relative" }}
            onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button className="nav-link" style={{ padding: "8px 14px", background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4 }}>
              Categories <ChevronDown size={14} />
            </button>
            {megaOpen && (
              <div className="mega-menu">
                {CATEGORIES.map(cat => (
                  <button key={cat.slug} onClick={() => { navigate(`category/${cat.slug}`); setMegaOpen(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 14px",
                      borderRadius: 8, textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                      transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,200,66,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {[
            { label: "All Banks", hash: "banks" },
            { label: "Compare", hash: "compare" },
            { label: "Quiz", hash: "quiz" },
          ].map(l => (
            <button key={l.hash} onClick={() => navigate(l.hash)} className="nav-link"
              style={{ padding: "8px 14px", background: "none", border: "none", cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("advertise")} className="btn-ghost hide-mobile" style={{ padding: "8px 16px", fontSize: 13 }}>
            <Zap size={13} /> Advertise
          </button>
          <button onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
            className="mobile-menu-btn">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)", padding: 20 }}>
          {[
            { label: "🏠 Home", hash: "" },
            { label: "🏦 All Banks", hash: "banks" },
            { label: "⚖️ Compare", hash: "compare" },
            { label: "🎯 Find My Bank", hash: "quiz" },
            { label: "⚡ Advertise", hash: "advertise" },
            { label: "ℹ️ About", hash: "about" },
          ].map(l => (
            <button key={l.hash} onClick={() => { navigate(l.hash); setMobileOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                cursor: "pointer", padding: "12px 0", color: "var(--text-primary)", fontSize: 16,
                borderBottom: "1px solid var(--card-border)" }}>
              {l.label}
            </button>
          ))}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Browse Categories</p>
            {CATEGORIES.map(cat => (
              <button key={cat.slug} onClick={() => { navigate(`category/${cat.slug}`); setMobileOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                  cursor: "pointer", padding: "8px 0", color: "var(--text-muted)", fontSize: 14 }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer role="contentinfo" style={{
      background: "rgba(0,0,0,0.4)", borderTop: "1px solid var(--card-border)",
      padding: "60px 24px 32px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              <span style={{ color: "var(--accent-primary)" }}>Bank</span>topp
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
              Norway's most trusted bank comparison platform — helping you earn more on every krone.
            </p>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
              <div>NorwegianSpark SA</div>
              <div>Org no. 834 984 172</div>
              <div>norwegianspark@gmail.com</div>
              <div>+47 99 73 74 67</div>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Categories</p>
            {CATEGORIES.slice(0,4).map(cat => (
              <button key={cat.slug} onClick={() => navigate(`category/${cat.slug}`)}
                style={{ display: "block", background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: 14, padding: "4px 0", textAlign: "left",
                  transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                {cat.label}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>More</p>
            {CATEGORIES.slice(4).map(cat => (
              <button key={cat.slug} onClick={() => navigate(`category/${cat.slug}`)}
                style={{ display: "block", background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: 14, padding: "4px 0", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                {cat.label}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Company</p>
            {[
              { label: "All Banks", hash: "banks" },
              { label: "Compare", hash: "compare" },
              { label: "Find My Bank", hash: "quiz" },
              { label: "About Us", hash: "about" },
              { label: "Advertise", hash: "advertise" },
              { label: "Privacy Policy", hash: "privacy" },
              { label: "Terms of Service", hash: "terms" },
            ].map(l => (
              <button key={l.hash} onClick={() => navigate(l.hash)}
                style={{ display: "block", background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: 14, padding: "4px 0", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 24 }}>
          <div className="disclaimer" style={{ marginBottom: 16 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--accent-danger)" }} />
            <p><strong>Not investment advice.</strong> Banktopp is an affiliate comparison site. We may earn commissions when you open accounts through our links. This does not influence our rankings. Rates are subject to change. Always verify current rates directly with your chosen institution.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
              © {new Date().getFullYear()} NorwegianSpark SA · Org no. 834 984 172 · All rights reserved
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              {["privacy","terms"].map(p => (
                <button key={p} onClick={() => navigate(p)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-faint)",
                    textTransform: "capitalize", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>
                  {p === "privacy" ? "Privacy Policy" : "Terms of Service"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── COOKIE BANNER ────────────────────────────────────────────────────────────

function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem("banktopp_cookie_consent"); } catch { return false; }
  });
  if (!visible) return null;
  const accept = () => { try { localStorage.setItem("banktopp_cookie_consent", "accepted"); } catch {} setVisible(false); };
  const decline = () => { try { localStorage.setItem("banktopp_cookie_consent", "declined"); } catch {} setVisible(false); };

  return (
    <div role="dialog" aria-label="Cookie consent" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 500, width: "min(560px, calc(100vw - 48px))",
      background: "var(--card-bg)", border: "1px solid var(--card-border)",
      borderRadius: 12, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
    }}>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
        We use cookies to personalize your experience and serve relevant ads. By clicking "Accept" you agree to our{" "}
        <button onClick={() => navigate("privacy")} style={{ background: "none", border: "none", cursor: "pointer",
          color: "var(--accent-primary)", fontSize: 14 }}>Privacy Policy</button>.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={accept} className="btn-primary" style={{ flex: 1 }}>Accept All</button>
        <button onClick={decline} className="btn-ghost" style={{ flex: 1 }}>Decline</button>
      </div>
    </div>
  );
}

// ─── PAGE: HOME ───────────────────────────────────────────────────────────────

function HomePage() {
  useEffect(() => { document.title = "Banktopp — Find Norway's Best Savings Account | Up to 5.50% APY"; }, []);
  const topBanks = useMemo(() => [...SEED_BANKS].sort((a, b) =>
    (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0) || b.rating - a.rating
  ).slice(0, 3), []);
  const bestApy = useMemo(() => [...SEED_BANKS].sort((a,b) => b.apy - a.apy).slice(0, 5), []);

  return (
    <main id="main-content" role="main">
      {/* HERO */}
      <section className="hero-gradient" style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,200,66,0.1)",
              border: "1px solid rgba(245,200,66,0.2)", borderRadius: 99, padding: "6px 16px", marginBottom: 24 }}>
              <Sparkles size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: 13, color: "var(--accent-primary)", fontWeight: 500 }}>
                Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 800,
              lineHeight: 1.1, marginBottom: 24 }}>
              Stop earning <span style={{ color: "var(--accent-danger)", textDecoration: "line-through" }}>0.01%</span>
              <br />on your savings
            </h1>
            <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 36,
              maxWidth: 600, margin: "0 auto 36px" }}>
              Compare 60+ savings accounts and earn up to{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-secondary)", fontWeight: 600 }}>5.50% APY</span>
              {" "}— that's <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>11× more</span> than the national average.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("banks")} className="btn-primary" style={{ fontSize: 16, padding: "14px 28px" }}>
                Compare All Banks <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("quiz")} className="btn-ghost" style={{ fontSize: 16, padding: "14px 28px" }}>
                Find My Best Match
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section style={{ background: "var(--card-bg)", borderTop: "1px solid var(--card-border)", borderBottom: "1px solid var(--card-border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[
            { label: "Banks Tracked", value: "60+", icon: <Building2 size={20} color="var(--accent-primary)" /> },
            { label: "Top APY Today", value: "5.50%", icon: <TrendingUp size={20} color="var(--accent-secondary)" /> },
            { label: "Avg. Savings Rate", value: "0.46%", icon: <BarChart2 size={20} color="var(--text-muted)" /> },
            { label: "Extra per $10k/yr", value: "$504", icon: <DollarSign size={20} color="#4ADE80" /> },
          ].map((stat, i) => (
            <div key={i} style={{ padding: "24px", borderRight: i < 3 ? "1px solid var(--card-border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {stat.icon}
                <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: "var(--text-primary)" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP 3 */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Crown size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: 13, color: "var(--accent-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Editor's Top Picks
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700 }}>
              Best savings accounts right now
            </h2>
          </div>
          <button onClick={() => navigate("banks")} className="btn-ghost">
            View all 60+ banks <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {topBanks.map((bank, i) => (
            <motion.div key={bank.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="card" style={{ padding: 24, cursor: "pointer" }} onClick={() => navigate(`bank/${bank.slug}`)}>
                {i === 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ background: "rgba(245,200,66,0.15)", color: "var(--accent-primary)", fontSize: 11,
                      fontWeight: 700, padding: "3px 10px", borderRadius: 99, fontFamily: "var(--font-mono)",
                      letterSpacing: "0.08em" }}>🥇 #1 PICK</div>
                    {bank.is_sponsored && <span className="tag-sponsored"><Zap size={10} /> PARTNER</span>}
                  </div>
                )}
                {i > 0 && bank.is_sponsored && (
                  <div style={{ marginBottom: 16 }}><span className="tag-sponsored"><Zap size={10} /> PARTNER</span></div>
                )}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                  <BankLogo bank={bank} size={48} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{bank.name}</h3>
                    <StarRating rating={bank.rating} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  {bank.description}
                </p>
                <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>APY</div>
                    <div className="apy-badge">{bank.apy.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Monthly Fee</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" }}>
                      {bank.monthly_fee === 0 ? "Free" : `$${bank.monthly_fee}`}
                    </div>
                  </div>
                  {bank.signup_bonus && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Bonus</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--accent-primary)" }}>${bank.signup_bonus}</div>
                    </div>
                  )}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <AffiliateButton bank={bank} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* BEST APY TABLE PREVIEW */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, marginBottom: 8 }}>
          Today's highest APY savings accounts
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Sorted by highest current APY. Rates updated daily.</p>
        <div className="card" style={{ overflow: "auto" }}>
          <table aria-label="Top savings account APY comparison">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Bank</th>
                <th scope="col">APY</th>
                <th scope="col">Monthly Fee</th>
                <th scope="col">Min. Balance</th>
                <th scope="col">FDIC</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {bestApy.map((bank, i) => (
                <tr key={bank.id} style={{ cursor: "pointer" }} onClick={() => navigate(`bank/${bank.slug}`)}>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: 14 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <BankLogo bank={bank} size={32} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{bank.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{bank.type}</div>
                      </div>
                      {bank.is_sponsored && <span className="tag-sponsored"><Zap size={9} /> Partner</span>}
                    </div>
                  </td>
                  <td><span className="apy-badge" style={{ fontSize: 18 }}>{bank.apy.toFixed(2)}%</span></td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" }}>
                      {bank.monthly_fee === 0 ? "$0" : `$${bank.monthly_fee}/mo`}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-muted)" }}>
                    {bank.min_balance === 0 ? "None" : `$${bank.min_balance.toLocaleString()}`}
                  </td>
                  <td>
                    {bank.fdic_insured
                      ? <CheckCircle size={16} color="#4ADE80" />
                      : <XCircle size={16} color="var(--accent-danger)" />}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <a href={bank.affiliate_url ?? `#`} target="_blank" rel="noopener noreferrer sponsored"
                      className="btn-primary" style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none" }}
                      aria-label={`Open account at ${bank.name}`}>
                      Open Account
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => navigate("banks")} className="btn-ghost">
            View all 60 banks <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "80px 24px", borderTop: "1px solid var(--card-border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, marginBottom: 8 }}>
            Browse by category
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 36 }}>Find the right account for your specific needs.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.slug} onClick={() => navigate(`category/${cat.slug}`)}
                className="card" style={{ padding: 20, cursor: "pointer", textAlign: "left", border: "none", width: "100%" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
                <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{cat.label}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{cat.subheadline}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, color: "var(--accent-primary)", fontSize: 13 }}>
                  Explore <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, marginBottom: 40, textAlign: "center" }}>
          Why trust Banktopp?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { icon: <Shield size={24} color="var(--accent-primary)" />, title: "Independent Research", desc: "No bank pays to rank higher in our organic results. Sponsored listings are clearly labeled." },
            { icon: <TrendingUp size={24} color="var(--accent-secondary)" />, title: "Daily Rate Updates", desc: "We track 60+ institutions daily so you always see today's rates — not last month's." },
            { icon: <Users size={24} color="#A78BFA" />, title: "100,000+ Users", desc: "Norwegian savers trust Banktopp to help them find the best home for their money." },
            { icon: <Award size={24} color="#F59E0B" />, title: "Expert Editorial", desc: "Our team includes certified financial planners who verify accuracy of all rates and features." },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <NewsletterSection />
    </main>
  );
}

// ─── NEWSLETTER SECTION ───────────────────────────────────────────────────────

const emailSchema = z.object({ email: z.string().email("Please enter a valid email address") });

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setEmail("");
    toast.success("You're subscribed! Check your inbox for our welcome email.");
  }, [email]);

  return (
    <section style={{ background: "linear-gradient(135deg, rgba(245,200,66,0.08), rgba(45,212,191,0.06))",
      borderTop: "1px solid var(--card-border)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <Mail size={32} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, marginBottom: 12 }}>
          Rate alerts, straight to your inbox
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          Get notified when top savings rates change. No spam — just the rates that matter.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input id="newsletter-email" type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            aria-label="Email address for newsletter subscription" />
          <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            {loading ? "Subscribing…" : <><Send size={14} /> Subscribe</>}
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 12 }}>
          No spam. Unsubscribe at any time. View our{" "}
          <button onClick={() => navigate("privacy")} style={{ background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 11 }}>Privacy Policy</button>.
        </p>
      </div>
    </section>
  );
}

// ─── PAGE: ALL BANKS ──────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function BanksPage() {
  useEffect(() => { document.title = "Compare All Banks — Banktopp | 60+ Savings Accounts Ranked"; }, []);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<keyof Bank>("rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const [fdic, setFdic] = useState(false);
  const [noFee, setNoFee] = useState(false);

  const filtered = useMemo(() => {
    let list = [...SEED_BANKS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") list = list.filter(b => b.type === typeFilter);
    if (fdic) list = list.filter(b => b.fdic_insured);
    if (noFee) list = list.filter(b => b.monthly_fee === 0);
    list.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const mul = sortDir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * mul;
      if (typeof va === "boolean" && typeof vb === "boolean") return ((va ? 1 : 0) - (vb ? 1 : 0)) * mul;
      return String(va).localeCompare(String(vb)) * mul;
    });
    return list;
  }, [search, typeFilter, sortKey, sortDir, fdic, noFee]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: keyof Bank) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  return (
    <main id="main-content" role="main" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, marginBottom: 8 }}>
          Compare all savings accounts
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {filtered.length} accounts · Sorted by {String(sortKey).replace(/_/g, " ")} ({sortDir === "desc" ? "highest first" : "lowest first"})
        </p>
      </div>

      {/* FILTERS */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input aria-label="Search banks by name or type" placeholder="Search banks…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 36, background: "rgba(255,255,255,0.05)" }} />
          </div>
          <select aria-label="Filter by bank type" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            style={{ flex: "1 1 160px" }}>
            <option value="all">All types</option>
            {["savings","neobank","traditional","student","business","crypto"].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={fdic} onChange={e => setFdic(e.target.checked)} style={{ width: "auto", cursor: "pointer" }}
              aria-label="Show only FDIC insured accounts" />
            FDIC only
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={noFee} onChange={e => setNoFee(e.target.checked)} style={{ width: "auto", cursor: "pointer" }}
              aria-label="Show only no monthly fee accounts" />
            No fees
          </label>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button onClick={() => setViewMode("table")} className="btn-ghost" style={{ padding: "8px 12px",
              background: viewMode === "table" ? "rgba(245,200,66,0.1)" : undefined,
              borderColor: viewMode === "table" ? "var(--accent-primary)" : undefined }}
              aria-label="Table view" aria-pressed={viewMode === "table"}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode("grid")} className="btn-ghost" style={{ padding: "8px 12px",
              background: viewMode === "grid" ? "rgba(245,200,66,0.1)" : undefined,
              borderColor: viewMode === "grid" ? "var(--accent-primary)" : undefined }}
              aria-label="Grid view" aria-pressed={viewMode === "grid"}>
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="card" style={{ overflow: "auto" }}>
          <table aria-label="Bank comparison table">
            <thead>
              <tr>
                <th scope="col">Bank</th>
                {[
                  { key: "apy" as keyof Bank, label: "APY" },
                  { key: "rating" as keyof Bank, label: "Rating" },
                  { key: "monthly_fee" as keyof Bank, label: "Monthly Fee" },
                  { key: "min_balance" as keyof Bank, label: "Min Balance" },
                ].map(col => (
                  <th key={col.key} scope="col">
                    <button onClick={() => toggleSort(col.key)} style={{ background: "none", border: "none",
                      cursor: "pointer", color: sortKey === col.key ? "var(--accent-primary)" : "var(--text-muted)",
                      display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500,
                      textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}
                      aria-label={`Sort by ${col.label}`}>
                      {col.label} <ArrowUpDown size={12} />
                    </button>
                  </th>
                ))}
                <th scope="col">FDIC</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(bank => (
                <tr key={bank.id} style={{ cursor: "pointer" }} onClick={() => navigate(`bank/${bank.slug}`)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
                      <BankLogo bank={bank} size={36} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{bank.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{bank.type}</div>
                      </div>
                      {bank.is_sponsored && <span className="tag-sponsored"><Zap size={9} /></span>}
                    </div>
                  </td>
                  <td><span className="apy-badge" style={{ fontSize: 18 }}>{bank.apy.toFixed(2)}%</span></td>
                  <td><StarRating rating={bank.rating} size={13} /></td>
                  <td><span style={{ fontFamily: "var(--font-mono)", color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" }}>
                    {bank.monthly_fee === 0 ? "Free" : `$${bank.monthly_fee}/mo`}</span></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-muted)" }}>
                    {bank.min_balance === 0 ? "None" : `$${bank.min_balance.toLocaleString()}`}
                  </td>
                  <td>
                    {bank.fdic_insured ? <CheckCircle size={16} color="#4ADE80" /> : <XCircle size={16} color="var(--accent-danger)" />}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <a href={bank.affiliate_url ?? "#"} target="_blank" rel="noopener noreferrer sponsored"
                      className="btn-primary" style={{ fontSize: 12, padding: "7px 14px", textDecoration: "none", whiteSpace: "nowrap" }}
                      aria-label={`Open account at ${bank.name}`}>
                      Open Account
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {paginated.map(bank => (
            <div key={bank.id} className="card" style={{ padding: 20, cursor: "pointer" }} onClick={() => navigate(`bank/${bank.slug}`)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <BankLogo bank={bank} />
                {bank.is_sponsored && <span className="tag-sponsored"><Zap size={9} /> Partner</span>}
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{bank.name}</h3>
              <StarRating rating={bank.rating} size={12} />
              <div style={{ display: "flex", gap: 16, margin: "12px 0", paddingTop: 12, borderTop: "1px solid var(--card-border)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>APY</div>
                  <div className="apy-badge" style={{ fontSize: 18 }}>{bank.apy.toFixed(2)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Fee</div>
                  <div style={{ fontFamily: "var(--font-mono)", color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" }}>
                    {bank.monthly_fee === 0 ? "Free" : `$${bank.monthly_fee}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>FDIC</div>
                  <div>{bank.fdic_insured ? <CheckCircle size={14} color="#4ADE80" /> : <XCircle size={14} color="var(--accent-danger)" />}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost"
            style={{ padding: "8px 12px" }} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={p === page ? "btn-primary" : "btn-ghost"}
              style={{ padding: "8px 14px", minWidth: 40 }} aria-label={`Page ${p}`} aria-current={p === page ? "page" : undefined}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-ghost" style={{ padding: "8px 12px" }} aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </main>
  );
}

// ─── PAGE: CATEGORY ───────────────────────────────────────────────────────────

function CategoryPage({ slug }: { slug: string }) {
  const cat = CATEGORIES.find(c => c.slug === slug);

  useEffect(() => {
    if (cat) {
      document.title = `${cat.label} Savings Accounts — Banktopp`;
      // JSON-LD BreadcrumbList
      const existing = document.getElementById("jsonld-breadcrumb");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "jsonld-breadcrumb";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://banktopp.com" },
          { "@type": "ListItem", "position": 2, "name": cat.label, "item": `https://banktopp.com/category/${cat.slug}` },
        ]
      });
      document.head.appendChild(script);
      return () => { document.getElementById("jsonld-breadcrumb")?.remove(); };
    }
  }, [cat]);

  const banks = useMemo(() => {
    if (!cat) return [];
    return [...SEED_BANKS].sort((a, b) =>
      (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0) ||
      (Number(b[cat.sortKey]) - Number(a[cat.sortKey])) * (cat.sortDir === "desc" ? 1 : -1)
    );
  }, [cat]);

  if (!cat) return <NotFoundPage />;

  return (
    <main id="main-content" role="main">

      {/* HERO */}
      <div className="hero-gradient" style={{ padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
            <ol style={{ display: "flex", gap: 8, justifyContent: "center", listStyle: "none", fontSize: 13, color: "var(--text-muted)" }}>
              <li><button onClick={() => navigate("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}>Home</button></li>
              <li>/</li>
              <li aria-current="page" style={{ color: "var(--accent-primary)" }}>{cat.label}</li>
            </ol>
          </nav>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{cat.icon}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, marginBottom: 12 }}>
            {cat.headline}
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 32 }}>{cat.subheadline}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 600, margin: "0 auto" }}>
            {[
              { label: cat.statLabel, value: cat.statValue },
              { label: "Accounts Compared", value: `${banks.length}` },
              { label: "Comparison", value: cat.statCompare },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(14px, 2.5vw, 22px)", color: "var(--accent-primary)", fontWeight: 500 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RANKED LIST */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
        <div className="disclaimer" style={{ marginBottom: 32 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, color: "var(--accent-danger)" }} />
          <span>Not investment advice. Affiliate disclosure: we may earn commissions if you open an account through our links.</span>
        </div>

        {banks.slice(0, 10).map((bank, i) => (
          <div key={bank.id} className="card" style={{ padding: 24, marginBottom: 16, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
              color: i < 3 ? "var(--accent-primary)" : "var(--text-faint)", minWidth: 40, paddingTop: 4 }}>
              #{i + 1}
            </div>
            <BankLogo bank={bank} size={52} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h2 style={{ fontWeight: 600, fontSize: 18 }}>{bank.name}</h2>
                {bank.is_sponsored && <span className="tag-sponsored"><Zap size={10} /> Partner</span>}
              </div>
              <div style={{ marginBottom: 8 }}><StarRating rating={bank.rating} /></div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{bank.description}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {bank.pros.slice(0, 3).map((p, j) => (
                  <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
                    color: "#4ADE80", background: "rgba(74,222,128,0.08)", padding: "3px 10px", borderRadius: 99 }}>
                    <CheckCircle size={11} /> {p}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>APY</div>
                <div className="apy-badge">{bank.apy.toFixed(2)}%</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Fee</div>
                <div style={{ fontFamily: "var(--font-mono)", color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" }}>
                  {bank.monthly_fee === 0 ? "Free" : `$${bank.monthly_fee}`}
                </div>
              </div>
              <div>
                <AffiliateButton bank={bank} />
              </div>
            </div>
          </div>
        ))}

        {/* METHODOLOGY */}
        <div className="card" style={{ padding: 24, marginTop: 40 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <BookOpen size={18} color="var(--accent-primary)" />
            <h3 style={{ fontWeight: 600 }}>Our Methodology</h3>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{cat.methodology}</p>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          {cat.faq.map((faq, i) => (
            <Accordion key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── PAGE: BANK DETAIL ────────────────────────────────────────────────────────

function BankDetailPage({ slug }: { slug: string }) {
  const bank = SEED_BANKS.find(b => b.slug === slug);
  useEffect(() => {
    if (bank) {
      document.title = `${bank.name} Review ${new Date().getFullYear()} — Banktopp`;
      const existing = document.getElementById("jsonld-product");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "jsonld-product";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org", "@type": "Product",
        "name": bank.name, "description": bank.description,
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": bank.rating, "bestRating": 5, "ratingCount": 1247 }
      });
      document.head.appendChild(script);
      return () => { document.getElementById("jsonld-product")?.remove(); };
    }
  }, [bank]);

  if (!bank) return <NotFoundPage />;

  return (
    <main id="main-content" role="main" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

      <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
        <ol style={{ display: "flex", gap: 8, listStyle: "none", fontSize: 13, color: "var(--text-muted)" }}>
          <li><button onClick={() => navigate("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}>Home</button></li>
          <li>/</li>
          <li><button onClick={() => navigate("banks")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}>Banks</button></li>
          <li>/</li>
          <li aria-current="page" style={{ color: "var(--accent-primary)" }}>{bank.name}</li>
        </ol>
      </nav>

      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 24 }}>
          <BankLogo bank={bank} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800 }}>{bank.name}</h1>
              {bank.is_sponsored && <span className="tag-sponsored"><Zap size={10} /> Partner</span>}
            </div>
            <div style={{ marginBottom: 8 }}><StarRating rating={bank.rating} size={16} /></div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{bank.description}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "APY", value: `${bank.apy.toFixed(2)}%`, color: "var(--accent-secondary)" },
            { label: "Monthly Fee", value: bank.monthly_fee === 0 ? "$0" : `$${bank.monthly_fee}`, color: bank.monthly_fee === 0 ? "#4ADE80" : "var(--accent-danger)" },
            { label: "Min Balance", value: bank.min_balance === 0 ? "None" : `$${bank.min_balance.toLocaleString()}`, color: "var(--text-primary)" },
            { label: "FDIC Insured", value: bank.fdic_insured ? "Yes" : "No", color: bank.fdic_insured ? "#4ADE80" : "var(--accent-danger)" },
            ...(bank.signup_bonus ? [{ label: "Signup Bonus", value: `$${bank.signup_bonus}`, color: "var(--accent-primary)" }] : []),
            { label: "Established", value: bank.established ? String(bank.established) : "N/A", color: "var(--text-muted)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "14px 16px",
              border: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, color: s.color, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <AffiliateButton bank={bank} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <CheckCircle size={18} color="#4ADE80" /> Pros
          </h2>
          {bank.pros.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--card-border)" }}>
              <CheckCircle size={14} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14 }}>{p}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <XCircle size={18} color="var(--accent-danger)" /> Cons
          </h2>
          {bank.cons.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--card-border)" }}>
              <XCircle size={14} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 20 }}>Rating Breakdown</h2>
        {Object.entries(bank.ratings).map(([key, val]) => (
          <RatingBar key={key} label={key} value={val} />
        ))}
      </div>

      <div className="disclaimer" style={{ marginBottom: 32 }}>
        <AlertTriangle size={14} style={{ flexShrink: 0, color: "var(--accent-danger)" }} />
        <p>Not investment advice. Rates accurate as of publication but may change. Verify current rates at {bank.name}'s official website before opening an account.</p>
      </div>
    </main>
  );
}

// ─── PAGE: COMPARE ────────────────────────────────────────────────────────────

function ComparePage() {
  useEffect(() => { document.title = "Compare Banks Side-by-Side — Banktopp"; }, []);
  const [selected, setSelected] = useState<string[]>(["marcus-goldman", "sofi-bank"]);

  const addBank = (slug: string) => { if (!selected.includes(slug) && selected.length < 4) setSelected(s => [...s, slug]); };
  const removeBank = (slug: string) => setSelected(s => s.filter(x => x !== slug));

  const banks = selected.map(s => SEED_BANKS.find(b => b.slug === s)).filter(Boolean) as Bank[];

  const COMPARE_ROWS: { label: string; key: keyof Bank; format?: (v: unknown) => string }[] = [
    { label: "APY", key: "apy", format: v => `${Number(v).toFixed(2)}%` },
    { label: "Rating", key: "rating", format: v => `${Number(v).toFixed(1)} / 5` },
    { label: "Monthly Fee", key: "monthly_fee", format: v => Number(v) === 0 ? "Free" : `$${Number(v)}/mo` },
    { label: "Min Balance", key: "min_balance", format: v => Number(v) === 0 ? "None" : `$${Number(v).toLocaleString()}` },
    { label: "FDIC Insured", key: "fdic_insured", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "ATM Fee Rebate", key: "atm_fee", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Mobile Only", key: "mobile_only", format: v => v ? "📱 Yes" : "🌐 No" },
    { label: "Signup Bonus", key: "signup_bonus", format: v => v ? `$${v}` : "None" },
    { label: "Established", key: "established", format: v => v ? String(v) : "N/A" },
    { label: "Account Type", key: "type", format: v => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
  ];

  return (
    <main id="main-content" role="main" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, marginBottom: 8 }}>
        Compare Banks
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Select up to 4 banks to compare side-by-side.</p>

      <div className="card" style={{ padding: 20, marginBottom: 32 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
          Add banks to compare ({selected.length}/4):
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SEED_BANKS.filter(b => !selected.includes(b.slug)).slice(0, 20).map(bank => (
            <button key={bank.id} onClick={() => addBank(bank.slug)} disabled={selected.length >= 4}
              className="btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }}>
              + {bank.name}
            </button>
          ))}
        </div>
      </div>

      {banks.length < 2 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <BarChart2 size={40} color="var(--text-faint)" style={{ marginBottom: 16 }} />
          <p style={{ color: "var(--text-muted)" }}>Select at least 2 banks above to start comparing.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table aria-label="Bank side-by-side comparison" style={{ minWidth: banks.length * 200 + 200 }}>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {banks.map(bank => (
                  <th key={bank.id} scope="col">
                    <div style={{ textAlign: "center" }}>
                      <BankLogo bank={bank} size={36} />
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>{bank.name}</div>
                      <button onClick={() => removeBank(bank.slug)} style={{ background: "none", border: "none",
                        cursor: "pointer", color: "var(--accent-danger)", fontSize: 11, marginTop: 4 }}
                        aria-label={`Remove ${bank.name} from comparison`}>
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(row => {
                const vals = banks.map(b => row.format ? row.format(b[row.key]) : String(b[row.key]));
                const best = row.key === "apy" || row.key === "rating" ? Math.max(...banks.map(b => Number(b[row.key]))) : null;
                return (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: 14 }}>{row.label}</td>
                    {banks.map((bank, i) => (
                      <td key={bank.id} style={{ textAlign: "center",
                        background: best !== null && Number(bank[row.key]) === best ? "rgba(245,200,66,0.05)" : undefined }}>
                        <span style={{
                          fontFamily: ["apy","monthly_fee","min_balance","rating"].includes(row.key) ? "var(--font-mono)" : "var(--font-body)",
                          color: best !== null && Number(bank[row.key]) === best ? "var(--accent-primary)" : "var(--text-primary)",
                          fontWeight: best !== null && Number(bank[row.key]) === best ? 600 : 400,
                          fontSize: 14,
                        }}>
                          {vals[i]}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td></td>
                {banks.map(bank => (
                  <td key={bank.id} style={{ textAlign: "center", padding: "16px" }}>
                    <AffiliateButton bank={bank} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

// ─── PAGE: QUIZ ───────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    q: "What's your primary banking goal?",
    key: "goal",
    options: [
      { label: "Maximize interest earnings", value: "apy" },
      { label: "Avoid all fees", value: "nofee" },
      { label: "Easy mobile banking", value: "mobile" },
      { label: "Build credit or financial habits", value: "credit" },
      { label: "Business or freelance banking", value: "business" },
    ],
  },
  {
    q: "How much are you planning to deposit?",
    key: "amount",
    options: [
      { label: "Under $1,000", value: "small" },
      { label: "$1,000 – $10,000", value: "medium" },
      { label: "$10,000 – $50,000", value: "large" },
      { label: "Over $50,000", value: "xlarge" },
    ],
  },
  {
    q: "How important is ATM access?",
    key: "atm",
    options: [
      { label: "Very important — I use cash often", value: "high" },
      { label: "Somewhat — occasionally", value: "medium" },
      { label: "Not important — I'm mostly digital", value: "low" },
    ],
  },
  {
    q: "Do you need a physical branch?",
    key: "branch",
    options: [
      { label: "Yes, I want a local branch", value: "yes" },
      { label: "Not really — app is fine", value: "no" },
      { label: "Nice to have but not required", value: "optional" },
    ],
  },
  {
    q: "What's most important to you in customer service?",
    key: "support",
    options: [
      { label: "24/7 availability", value: "availability" },
      { label: "Phone support", value: "phone" },
      { label: "Live chat in app", value: "chat" },
      { label: "In-branch help", value: "branch" },
    ],
  },
];

function QuizPage() {
  useEffect(() => { document.title = "Find Your Perfect Bank — Banktopp Quiz"; }, []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Bank[] | null>(null);

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Score banks
      const scored = SEED_BANKS.map(bank => {
        let score = bank.rating * 2;
        if (newAnswers.goal === "apy") score += bank.apy * 2;
        if (newAnswers.goal === "nofee" && bank.monthly_fee === 0) score += 4;
        if (newAnswers.goal === "mobile" && bank.mobile_only) score += 3;
        if (newAnswers.goal === "business" && bank.type === "business") score += 5;
        if (newAnswers.goal === "credit" && bank.type === "student") score += 4;
        if (newAnswers.amount === "small" && bank.min_balance === 0) score += 2;
        if (newAnswers.atm === "high" && bank.atm_fee) score += 2;
        if (newAnswers.branch === "yes" && bank.type === "traditional") score += 3;
        if (newAnswers.branch === "no" && (bank.type === "neobank" || bank.type === "savings")) score += 2;
        return { bank, score };
      }).sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.bank);
      setResult(scored);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  if (result) {
    return (
      <main id="main-content" role="main" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 12 }}>
            Your perfect match
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Based on your answers, here are your top 3 recommendations.</p>
        </div>
        {result.map((bank, i) => (
          <div key={bank.id} className="card" style={{ padding: 24, marginBottom: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--accent-primary)", minWidth: 36 }}>#{i + 1}</div>
            <BankLogo bank={bank} size={48} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 600, marginBottom: 4 }}>{bank.name}</h2>
              <StarRating rating={bank.rating} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{bank.description}</p>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>APY</div>
                <div className="apy-badge">{bank.apy.toFixed(2)}%</div>
              </div>
              <div>
                <AffiliateButton bank={bank} />
              </div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Retake Quiz</button>
        </div>
      </main>
    );
  }

  const current = QUIZ_QUESTIONS[step];
  const progress = (step / QUIZ_QUESTIONS.length) * 100;

  return (
    <main id="main-content" role="main" style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Question {step + 1} of {QUIZ_QUESTIONS.length}</p>
        <div className="progress-bar" style={{ marginBottom: 32 }}>
          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700 }}>
          {current.q}
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {current.options.map(opt => (
          <motion.button key={opt.value} onClick={() => handleAnswer(current.key, opt.value)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: "16px 20px", background: "var(--card-bg)", border: "1px solid var(--card-border)",
              borderRadius: 10, cursor: "pointer", textAlign: "left", fontSize: 16,
              color: "var(--text-primary)", fontFamily: "var(--font-body)", transition: "border-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--card-border)")}>
            {opt.label}
          </motion.button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ marginTop: 20 }}>
          <ChevronLeft size={14} /> Back
        </button>
      )}
    </main>
  );
}

// ─── PAGE: ABOUT ──────────────────────────────────────────────────────────────

function AboutPage() {
  useEffect(() => {
    document.title = "About Banktopp — NorwegianSpark SA";
    const existing = document.getElementById("jsonld-org");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "jsonld-org";
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org", "@type": "Organization",
      "name": "NorwegianSpark SA", "url": "https://banktopp.com",
      "email": "norwegianspark@gmail.com", "telephone": "+4799737467",
      "address": { "@type": "PostalAddress", "addressCountry": "NO" }
    });
    document.head.appendChild(script);
    return () => { document.getElementById("jsonld-org")?.remove(); };
  }, []);
  return (
    <main id="main-content" role="main" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, marginBottom: 16 }}>
        About Banktopp
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.7, marginBottom: 32 }}>
        Banktopp is a Norwegian financial comparison site built on one principle: every person deserves to earn the best possible return on their savings.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {[
          { title: "Our Mission", content: "We track 60+ savings accounts, neobanks, and traditional banks to help Norwegians and global users find the best rates — without having to navigate dozens of confusing bank websites." },
          { title: "Our Editorial Standards", content: "Sponsored listings are clearly labeled with ⚡ Partner. Organic rankings are never influenced by commercial relationships. Our team of certified financial analysts reviews every institution before listing." },
          { title: "How We Make Money", content: "Banktopp earns affiliate commissions when users open accounts through our links. We also offer sponsored listing packages for banks that want premium placement. These relationships never affect organic rankings." },
          { title: "Accuracy & Verification", content: "We verify all rates, features, and FDIC status against official bank sources and the FDIC BankFind database. Rates are updated daily. If you spot an error, please contact us — we fix verified corrections within 24 hours." },
        ].map((section, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{section.content}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 32, marginTop: 32, background: "linear-gradient(135deg, rgba(245,200,66,0.05), rgba(45,212,191,0.05))" }}>
        <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}>Contact Us</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: <Building2 size={16} />, label: "NorwegianSpark SA · Org no. 834 984 172" },
            { icon: <Mail size={16} />, label: "norwegianspark@gmail.com" },
            { icon: <Phone size={16} />, label: "+47 99 73 74 67" },
            { icon: <MapPin size={16} />, label: "Norway" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--text-muted)", fontSize: 15 }}>
              <span style={{ color: "var(--accent-primary)" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── PAGE: ADVERTISE ──────────────────────────────────────────────────────────

const advertiseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name required"),
  email: z.string().email("Valid email required"),
  tier: z.enum(["standard", "featured"]),
  message: z.string().optional(),
});

function AdvertisePage() {
  useEffect(() => { document.title = "Advertise on Banktopp — Sponsored Listings"; }, []);
  const [form, setForm] = useState({ name: "", company: "", email: "", tier: "standard" as "standard" | "featured", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const result = advertiseSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    toast.success("Application submitted! We'll be in touch within 1 business day.");
  };

  return (
    <main id="main-content" role="main" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, marginBottom: 8 }}>
        Advertise on Banktopp
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.7, marginBottom: 40 }}>
        Reach thousands of active savings seekers every month. Sponsored listings are clearly labeled and placed alongside organic results.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 48 }}>
        {[
          { tier: "Standard", price: "$299/mo", features: ["Sponsored badge", "Listed in relevant categories", "Priority email support", "Monthly performance report"] },
          { tier: "Featured", price: "$599/mo", features: ["Everything in Standard", "Top placement in categories", "Homepage featured slot", "Dedicated account manager", "Custom CTA copy"] },
        ].map(t => (
          <div key={t.tier} className="card" style={{ padding: 28, border: t.tier === "Featured" ? "1px solid rgba(245,200,66,0.4)" : undefined }}>
            {t.tier === "Featured" && (
              <div style={{ color: "var(--accent-primary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                marginBottom: 12, textTransform: "uppercase" }}>⚡ Most Popular</div>
            )}
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{t.tier}</h2>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, color: "var(--accent-primary)", fontWeight: 500, marginBottom: 20 }}>{t.price}</div>
            {t.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: 14 }}>
                <CheckCircle size={14} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "var(--text-muted)" }}>{f}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Application received!</h2>
          <p style={{ color: "var(--text-muted)" }}>We'll contact you at {form.email} within 1 business day.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 24 }}>Apply for a Sponsored Listing</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { id: "ad-name", label: "Your Name", key: "name" as const, type: "text" },
              { id: "ad-company", label: "Company / Bank Name", key: "company" as const, type: "text" },
              { id: "ad-email", label: "Business Email", key: "email" as const, type: "email" },
            ].map(field => (
              <div key={field.key}>
                <label htmlFor={field.id} style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{field.label}</label>
                <input id={field.id} type={field.type} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label htmlFor="ad-tier" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Package</label>
              <select id="ad-tier" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as "standard" | "featured" }))}>
                <option value="standard">Standard — $299/mo</option>
                <option value="featured">Featured — $599/mo</option>
              </select>
            </div>
            <div>
              <label htmlFor="ad-message" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Additional notes (optional)</label>
              <textarea id="ad-message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ minHeight: 80, resize: "vertical" }} />
            </div>
            <p className="affiliate-disclosure">
              By submitting, you agree to our editorial guidelines. Sponsored listings are always clearly labeled. We do not alter organic rankings for advertisers.
            </p>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ alignSelf: "flex-start" }}>
              {loading ? "Submitting…" : <><Send size={14} /> Submit Application</>}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── PAGE: PRIVACY ────────────────────────────────────────────────────────────

function PrivacyPage() {
  useEffect(() => { document.title = "Privacy Policy — Banktopp · NorwegianSpark SA"; }, []);
  return (
    <main id="main-content" role="main" style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · NorwegianSpark SA · Org no. 834 984 172
      </p>
      {[
        {
          title: "1. Information We Collect",
          content: "We collect information you provide directly (email for newsletters, contact form submissions), information collected automatically (IP address, browser type, pages visited, referring URLs via Google Analytics 4 and Plausible), and cookies (for session management and consent tracking).",
        },
        {
          title: "2. How We Use Your Information",
          content: "We use collected information to: provide and improve our comparison service; send rate alert newsletters (with your explicit consent); display relevant advertising (only after cookie consent); analyze site usage to improve user experience; fulfill legal obligations under GDPR and Norwegian law.",
        },
        {
          title: "3. GDPR Compliance",
          content: "Under GDPR (EU Regulation 2016/679), you have the right to: access your personal data; rectify inaccurate data; erasure ('right to be forgotten'); data portability; object to processing; withdraw consent at any time. To exercise any right, email norwegianspark@gmail.com. We will respond within 30 days.",
        },
        {
          title: "4. Cookies",
          content: "We use strictly necessary cookies (session, consent) without consent. Analytics cookies (GA4) and advertising cookies (AdSense) are only loaded after explicit consent via our cookie banner. You may withdraw consent at any time by clearing cookies or clicking 'Decline' in the cookie banner.",
        },
        {
          title: "5. Affiliate Links",
          content: "Banktopp participates in affiliate programs. When you click a link to a bank and open an account, we may receive a commission. This does not affect our rankings or editorial content. Affiliate relationships are always disclosed above CTA buttons.",
        },
        {
          title: "6. Data Retention",
          content: "Newsletter emails are retained until unsubscription. Analytics data is retained for 14 months (GA4 default). Contact form submissions are deleted after 90 days unless ongoing correspondence requires longer retention.",
        },
        {
          title: "7. Third-Party Services",
          content: "We use: Google Analytics 4 (analytics), Google AdSense (advertising, consent-gated), Supabase (database, GDPR-compliant), Stripe (payment processing for sponsored listings). Each processor has signed Data Processing Agreements where required under GDPR.",
        },
        {
          title: "8. Contact",
          content: "Data controller: NorwegianSpark SA · Org no. 834 984 172 · norwegianspark@gmail.com · +47 99 73 74 67 · Norway",
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "var(--text-primary)" }}>{section.title}</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15 }}>{section.content}</p>
        </div>
      ))}
    </main>
  );
}

// ─── PAGE: TERMS ──────────────────────────────────────────────────────────────

function TermsPage() {
  useEffect(() => { document.title = "Terms of Service — Banktopp · NorwegianSpark SA"; }, []);
  return (
    <main id="main-content" role="main" style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, marginBottom: 8 }}>
        Terms of Service
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · NorwegianSpark SA · Org no. 834 984 172
      </p>
      {[
        { title: "1. Acceptance", content: "By accessing Banktopp, you agree to these Terms. If you disagree, do not use this site." },
        { title: "2. Not Financial Advice", content: "Banktopp is an informational comparison service. Nothing on this site constitutes financial, investment, or legal advice. Always consult a qualified financial advisor before making banking or investment decisions." },
        { title: "3. Affiliate Disclosure", content: "We earn commissions when you open accounts through our affiliate links. This does not affect our editorial integrity or rankings. Sponsored listings are always clearly labeled ⚡ Partner." },
        { title: "4. Sponsored Content Policy", content: "Banks may purchase sponsored listings (Standard: $299/mo; Featured: $599/mo). Sponsored placement does not guarantee positive review content. Our editors may include negative information in any listing, sponsored or otherwise." },
        { title: "5. Accuracy of Information", content: "We strive to maintain accurate, up-to-date rates and features. Rates change frequently. Always verify current rates at the bank's official website before opening an account. NorwegianSpark SA is not liable for losses resulting from reliance on outdated information." },
        { title: "6. Intellectual Property", content: "All content on Banktopp is owned by NorwegianSpark SA or licensed to us. You may not reproduce, republish, or redistribute content without written permission." },
        { title: "7. Limitation of Liability", content: "To the maximum extent permitted by Norwegian and EU law, NorwegianSpark SA is not liable for any indirect, incidental, or consequential damages arising from use of this site." },
        { title: "8. Governing Law", content: "These Terms are governed by the laws of Norway. Disputes shall be resolved in Norwegian courts." },
        { title: "9. Contact", content: "NorwegianSpark SA · Org no. 834 984 172 · norwegianspark@gmail.com · +47 99 73 74 67" },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>{s.title}</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15 }}>{s.content}</p>
        </div>
      ))}
    </main>
  );
}

// ─── PAGE: 404 ────────────────────────────────────────────────────────────────

function NotFoundPage() {
  useEffect(() => { document.title = "Page Not Found — Banktopp"; }, []);
  return (
    <main id="main-content" role="main" style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 80, color: "var(--accent-primary)", marginBottom: 16 }}>404</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>The page you're looking for doesn't exist or has moved.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => navigate("")} className="btn-primary">Go Home</button>
        <button onClick={() => navigate("banks")} className="btn-ghost">View All Banks</button>
      </div>
      <div style={{ marginTop: 48 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>Browse categories:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => navigate(`category/${cat.slug}`)} className="btn-ghost"
              style={{ fontSize: 13, padding: "6px 14px" }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);

  const renderPage = () => {
    switch (route.page) {
      case "home": return <HomePage />;
      case "banks": return <BanksPage />;
      case "category": return <CategoryPage slug={route.slug} />;
      case "bank-detail": return <BankDetailPage slug={route.slug} />;
      case "compare": return <ComparePage />;
      case "quiz": return <QuizPage />;
      case "about": return <AboutPage />;
      case "advertise": return <AdvertisePage />;
      case "privacy": return <PrivacyPage />;
      case "terms": return <TermsPage />;
      default: return <NotFoundPage />;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Toaster richColors position="top-right" />
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <TickerBar />
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.div key={JSON.stringify(route)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <CookieBanner />
    </>
  );
}
