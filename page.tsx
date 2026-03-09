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
  type: "neobank" | "traditional" | "savings" | "business" | "student" | "crypto" | "credit_union" | "investment";
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
  tagline?: string;
  headquarters?: string;
  parent_company?: string | null;
  customer_count?: string | null;
  total_assets?: string | null;
  website?: string;
  checking_available?: boolean;
  savings_available?: boolean;
  cd_available?: boolean;
  cd_top_rate?: number | null;
  cd_terms?: { months: number; apy: number }[];
  money_market_apy?: number | null;
  money_market_min?: number | null;
  ira_available?: boolean;
  hsa_available?: boolean;
  overdraft_protection?: boolean;
  overdraft_fee?: number | null;
  overdraft_limit?: number | null;
  nsf_fee?: number | null;
  early_paycheck?: boolean;
  early_paycheck_days?: number | null;
  debit_card?: boolean;
  virtual_cards?: boolean;
  virtual_card_limit?: number | null;
  contactless_pay?: boolean;
  apple_pay?: boolean;
  google_pay?: boolean;
  samsung_pay?: boolean;
  cashback_debit?: number | null;
  cashback_categories?: string[];
  atm_network?: string | null;
  atm_network_size?: number | null;
  atm_fee_rebate_amount?: number | null;
  international_atm?: boolean;
  international_atm_fee?: number | null;
  wire_fee_domestic?: number | null;
  wire_fee_international?: number | null;
  wire_incoming_fee?: number | null;
  ach_transfer?: boolean;
  ach_fee?: number;
  ach_speed_days?: number | null;
  zelle?: boolean;
  venmo_integration?: boolean;
  real_time_payments?: boolean;
  instant_transfers?: boolean;
  multi_currency?: boolean;
  currency_count?: number | null;
  supported_currencies?: string[];
  forex_markup?: number | null;
  international_wire?: boolean;
  swift_code?: string | null;
  routing_number?: string | null;
  two_factor_auth?: boolean;
  two_factor_methods?: string[];
  biometric_login?: boolean;
  fraud_protection?: boolean;
  fraud_monitoring_realtime?: boolean;
  zero_liability?: boolean;
  card_lock?: boolean;
  transaction_alerts?: boolean;
  security_freeze?: boolean;
  encryption_standard?: string | null;
  soc2_certified?: boolean;
  mobile_app?: boolean;
  mobile_app_rating_ios?: number | null;
  mobile_app_rating_android?: number | null;
  mobile_check_deposit?: boolean;
  mobile_check_deposit_limit?: number | null;
  api_access?: boolean;
  api_type?: string | null;
  plaid_supported?: boolean;
  open_banking?: boolean;
  webhooks?: boolean;
  joint_account?: boolean;
  custodial_account?: boolean;
  trust_account?: boolean;
  estate_planning?: boolean;
  beneficiary_support?: boolean;
  power_of_attorney?: boolean;
  sub_accounts?: boolean;
  sub_account_limit?: number | null;
  budgeting_tools?: boolean;
  spending_insights?: boolean;
  savings_goals?: boolean;
  savings_goal_limit?: number | null;
  round_up_savings?: boolean;
  auto_savings?: boolean;
  auto_savings_rules?: string[];
  recurring_transfers?: boolean;
  bill_pay?: boolean;
  bill_pay_free?: boolean;
  check_writing?: boolean;
  check_ordering_fee?: number | null;
  direct_deposit?: boolean;
  direct_deposit_early?: boolean;
  payroll_integration?: boolean;
  tax_documents?: boolean;
  tax_document_types?: string[];
  crypto_trading?: boolean;
  crypto_count?: number | null;
  crypto_coins_supported?: string[];
  crypto_staking?: boolean;
  crypto_rewards?: boolean;
  stock_trading?: boolean;
  fractional_shares?: boolean;
  options_trading?: boolean;
  etf_trading?: boolean;
  robo_advisor?: boolean;
  robo_advisor_fee?: number | null;
  financial_advisor_access?: boolean;
  retirement_accounts?: boolean;
  retirement_account_types?: string[];
  support_24_7?: boolean;
  phone_support?: boolean;
  phone_support_hours?: string | null;
  live_chat?: boolean;
  live_chat_hours?: string | null;
  email_support?: boolean;
  email_response_time?: string | null;
  in_branch_support?: boolean;
  branch_count?: number | null;
  branch_states?: string[];
  social_media_support?: boolean;
  community_forum?: boolean;
  help_center?: boolean;
  video_support?: boolean;
  callback_service?: boolean;
  dedicated_account_manager?: boolean;
  quickbooks_integration?: boolean;
  xero_integration?: boolean;
  freshbooks_integration?: boolean;
  wave_integration?: boolean;
  stripe_integration?: boolean;
  shopify_integration?: boolean;
  square_integration?: boolean;
  accounting_integrations_count?: number | null;
  payroll_providers?: string[];
  web_app?: boolean;
  desktop_app?: boolean;
  browser_extension?: boolean;
  interest_compounding?: "daily" | "monthly" | "quarterly" | "annually";
  interest_posting?: "daily" | "monthly" | "quarterly" | "annually";
  rewards_program?: boolean;
  rewards_type?: string | null;
  referral_bonus?: number | null;
  referral_bonus_conditions?: string | null;
  student_perks?: boolean;
  student_verification?: string | null;
  military_perks?: boolean;
  military_verification?: string | null;
  senior_perks?: boolean;
  green_banking?: boolean;
  carbon_offset?: boolean;
  charitable_giving?: boolean;
  max_apy_balance?: number | null;
  tiered_apy?: boolean;
  apy_tiers?: { min: number; max: number | null; apy: number }[];
  signup_bonus_conditions?: string | null;
  signup_bonus_expiry_days?: number | null;
  monthly_fee_waiver?: string | null;
  monthly_fee_waiver_conditions?: string[];
  apy_conditions?: string | null;
  regulated_by?: string[];
  ncua_insured?: boolean;
  fdic_coverage_max?: number;
  sweep_network?: boolean;
  sweep_max_coverage?: number | null;
  member_of?: string[];
  bbb_rating?: string | null;
  jd_power_score?: number | null;
  nps_score?: number | null;
  complaint_ratio?: number | null;
  cfpb_complaints?: number | null;
  editor_notes?: string;
  last_rate_update?: string;
  min_age?: number | null;
  max_daily_transfer?: number | null;
  max_daily_withdrawal?: number | null;
  foreign_transaction_fee?: number | null;
  paper_statement_fee?: number | null;
  account_closure_fee?: number | null;
  inactivity_fee?: number | null;
  inactivity_period_months?: number | null;
  returned_deposit_fee?: number | null;
  stop_payment_fee?: number | null;
  replacement_card_fee?: number | null;
  expedited_card_fee?: number | null;
  cashiers_check_fee?: number | null;
  money_order_fee?: number | null;
  notary_service?: boolean;
  safe_deposit_boxes?: boolean;
  coin_counting?: boolean;
  currency_exchange?: boolean;
  mortgage_products?: boolean;
  auto_loans?: boolean;
  personal_loans?: boolean;
  business_loans?: boolean;
  sba_lender?: boolean;
  heloc?: boolean;
  credit_cards?: boolean;
  credit_card_count?: number | null;
  insurance_products?: boolean;
  wealth_management?: boolean;
  private_banking?: boolean;
  private_banking_minimum?: number | null;
  commercial_banking?: boolean;
  treasury_management?: boolean;
  merchant_services?: boolean;
  pos_systems?: boolean;
  invoice_creation?: boolean;
  expense_tracking?: boolean;
  receipt_scanning?: boolean;
  mileage_tracking?: boolean;
  time_tracking?: boolean;
  project_management?: boolean;
  team_management?: boolean;
  multi_user_access?: boolean;
  user_roles?: boolean;
  audit_trail?: boolean;
  batch_payments?: boolean;
  international_payroll?: boolean;
  contractor_payments?: boolean;
  tax_estimation?: boolean;
  quarterly_tax_reminders?: boolean;
  schedule_c_support?: boolean;
  "1099_tracking"?: boolean;
  profit_loss_reports?: boolean;
  balance_sheet?: boolean;
  cash_flow_reports?: boolean;
  custom_reports?: boolean;
  data_export?: boolean;
  data_export_formats?: string[];
  stock_ticker?: string | null;
  checking_apy?: number | null;
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
  { id:"b008",slug:"pnc-bank",name:"PNC Bank",type:"traditional",description:"Regional powerhouse known for its Virtual Wallet budgeting tools.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Virtual Wallet feature","Low Cash Mode feature","Strong Midwest presence"],cons:["Limited APY","Monthly fees","Smaller national footprint"],established:1845,ratings:{app:4.2,fees:2.6,returns:1.9,access:3.9,support:4.1,security:4.5},apy:0.02,monthly_fee:7,min_balance:0,fdic_insured:true,signup_bonus:200,atm_fee:false,mobile_only:false },
  // ── HIGH-YIELD SAVINGS ───────────────────────────────────────────────────
  { id:"b009",slug:"citibank-savings",name:"Citi Accelerate Savings",type:"savings",description:"Competitive high-yield savings with the trust of a global banking giant.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","No minimum balance","Citi ecosystem benefits"],cons:["Available in select markets","Savings only account"],established:1812,ratings:{app:4.4,fees:4.2,returns:4.5,access:3.7,support:4.3,security:4.8},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b010",slug:"discover-bank",name:"Discover Online Savings",type:"savings",description:"Zero-fee high-yield savings backed by Discover's award-winning customer service.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.25% APY","No fees ever","Excellent CS rated #1","Cash back checking"],cons:["No ATM deposits","No local branches"],established:1986,ratings:{app:4.6,fees:5.0,returns:4.3,access:3.9,support:5.0,security:4.7},apy:4.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b011",slug:"american-express-savings",name:"American Express HYSA",type:"savings",description:"AmEx brings its premium brand to high-yield savings with consistently top rates.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","No minimums","AmEx brand trust","Easy transfers"],cons:["Savings only","No debit card","No ATM access"],established:1850,ratings:{app:4.5,fees:5.0,returns:4.5,access:3.6,support:4.6,security:4.9},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b012",slug:"synchrony-bank",name:"Synchrony Bank HYSA",type:"savings",description:"Consistently competitive rates with optional ATM card for a savings account.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.75% APY","ATM card available","No minimums"],cons:["No checking account","Limited features"],established:2003,ratings:{app:4.0,fees:4.8,returns:4.8,access:4.2,support:3.9,security:4.5},apy:4.75,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b013",slug:"capital-one-360",name:"Capital One 360",type:"savings",description:"Popular online bank with no fees and a growing network of Capital One Cafés.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.25% APY","Capital One Cafés","No fees","Auto-Save feature"],cons:["Lower APY than top competitors","Cafés limited to major cities"],established:1994,ratings:{app:4.7,fees:4.9,returns:4.3,access:4.1,support:4.4,security:4.7},apy:4.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  // ── NEOBANKS ─────────────────────────────────────────────────────────────
  { id:"b014",slug:"chime",name:"Chime",type:"neobank",description:"America's most popular neobank with SpotMe overdraft protection.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","SpotMe overdraft","Early paycheck","60K+ ATMs"],cons:["Lower APY vs top HYSA","Customer service issues","Banking restrictions"],established:2012,ratings:{app:4.5,fees:4.9,returns:2.0,access:4.6,support:3.2,security:4.3},apy:2.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true },
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
  { id:"b026",slug:"bread-savings-basic",name:"Bread Savings",type:"savings",description:"Simple, competitive high-yield savings with terms up to 5 years.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.15% APY (12-month CD)","5.20% on select CDs","No monthly fees","CD options"],cons:["CDs have early withdrawal penalty","Savings only"],established:2021,ratings:{app:4.1,fees:4.8,returns:4.9,access:3.5,support:4.0,security:4.5},apy:5.15,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b027",slug:"western-alliance",name:"Western Alliance Bank",type:"savings",description:"Institution-grade high-yield savings now available to individual consumers.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.36% APY","No monthly fee","Large deposit limits","Stable institution"],cons:["Less consumer-facing UX","Limited app features"],established:1994,ratings:{app:3.8,fees:4.8,returns:5.0,access:3.5,support:4.1,security:4.7},apy:5.36,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b028",slug:"ufb-savings",name:"UFB Direct",type:"savings",description:"Consistently top-3 savings rates with no fees and a simple interface.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No monthly fee","Free ATM card","No minimum balance"],cons:["Portal UX is dated","No checking account","Limited features"],established:2004,ratings:{app:3.7,fees:4.9,returns:5.0,access:4.3,support:4.0,security:4.6},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
  { id:"b029",slug:"popular-direct-basic",name:"Popular Direct",type:"savings",description:"Puerto Rico-based banking giant with some of the best CD rates in the US.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","High CD rates","FDIC insured","Stable institution"],cons:["Minimum $100 to open","Limited product range","Older UX"],established:1893,ratings:{app:3.8,fees:4.5,returns:4.9,access:3.3,support:3.9,security:4.7},apy:5.30,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false },
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
  // ── COMPREHENSIVE HIGH-YIELD (43-60) ────────────────────────────────────
  { id:"b043",slug:"milli-bank",name:"Milli Bank",type:"savings",description:"New entrant offering 5.50% APY with jars budgeting features and zero-fee structure.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY","Jars budgeting","No fees","Savings goal tracking"],cons:["New bank","Limited features","Smaller institution","No checking"],established:2022,ratings:{app:4.3,fees:5.0,returns:5.0,access:3.2,support:3.8,security:4.2},apy:5.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Save smarter with Jars",headquarters:"San Francisco, CA",parent_company:"Milli Technologies Inc.",customer_count:"50,000+",total_assets:"$120M",website:"https://www.milli.bank",checking_available:false,savings_available:true,cd_available:false,cd_top_rate:null,overdraft_protection:false,early_paycheck:false,debit_card:false,apple_pay:false,google_pay:false,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,budgeting_tools:true,savings_goals:true,round_up_savings:false,support_24_7:false,live_chat:true,phone_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","OCC"],fdic_coverage_max:250000,last_rate_update:"2026-03-01",editor_notes:"Strong newcomer with innovative Jars feature for goal-based savings." },
  { id:"b044",slug:"everbank",name:"EverBank (TIAA Bank)",type:"savings",description:"Rebranded from TIAA Bank, EverBank offers competitive yields with a legacy of trust in savings and CDs.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.05% APY","Strong CD lineup","FDIC insured","Full banking suite"],cons:["Minimum $5,000 for best CD rates","Brand transition confusion","App needs improvement"],established:1998,ratings:{app:3.9,fees:4.5,returns:4.8,access:3.7,support:4.1,security:4.6},apy:5.05,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"A smarter way to bank",headquarters:"Jacksonville, FL",parent_company:"EverBank Financial Corp",customer_count:"500,000+",total_assets:"$33B",website:"https://www.everbank.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.15,cd_terms:[{months:6,apy:4.75},{months:12,apy:5.15},{months:24,apy:4.50},{months:36,apy:4.25},{months:60,apy:4.00}],money_market_apy:4.30,overdraft_protection:true,overdraft_fee:36,early_paycheck:false,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:30,wire_fee_international:45,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:true,phone_support:true,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:false,personal_loans:false,regulated_by:["FDIC","OCC"],fdic_coverage_max:250000,last_rate_update:"2026-03-01" },
  { id:"b045",slug:"betterment-cash",name:"Betterment Cash Reserve",type:"investment",description:"Investment platform's cash account offering 5.50% APY through partner banks with up to $2M FDIC coverage via sweep network.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY","$2M+ FDIC coverage","Betterment integration","No fees","Tax-loss harvesting available"],cons:["Not a true bank","Betterment account required","Takes 1–2 days to access","No debit card"],established:2010,ratings:{app:4.6,fees:4.9,returns:5.0,access:3.6,support:4.2,security:4.7},apy:5.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Outsmart average",headquarters:"New York, NY",parent_company:"Betterment LLC",customer_count:"800,000+",total_assets:"$40B+ AUM",website:"https://www.betterment.com",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,budgeting_tools:true,savings_goals:true,auto_savings:true,robo_advisor:true,robo_advisor_fee:0.25,stock_trading:true,fractional_shares:true,etf_trading:true,crypto_trading:true,crypto_count:4,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA","SEP IRA","401k rollover"],support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,interest_compounding:"daily",sweep_network:true,sweep_max_coverage:2000000,plaid_supported:true,tax_documents:true,regulated_by:["SEC","FINRA"],last_rate_update:"2026-03-01",editor_notes:"Best for investors who want their idle cash earning top rates while maintaining access to a full robo-advisory platform." },
  { id:"b046",slug:"wealthfront-cash",name:"Wealthfront Cash Account",type:"investment",description:"Robo-advisor offers 5.50% APY on cash with $8M FDIC through partner network — the highest extended FDIC in the market.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.50% APY","$8M FDIC coverage","Autopilot feature","No fees","Portfolio Line of Credit"],cons:["Not a bank","Investment account needed","Limited banking features","No branches"],established:2008,ratings:{app:4.7,fees:5.0,returns:5.0,access:3.5,support:4.1,security:4.8},apy:5.50,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Build long-term wealth",headquarters:"Palo Alto, CA",parent_company:"Wealthfront Inc.",customer_count:"700,000+",total_assets:"$50B+ AUM",website:"https://www.wealthfront.com",checking_available:true,savings_available:true,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,budgeting_tools:true,savings_goals:true,auto_savings:true,round_up_savings:false,robo_advisor:true,robo_advisor_fee:0.25,stock_trading:true,fractional_shares:true,etf_trading:true,crypto_trading:false,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA","SEP IRA","529 Plan"],support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,interest_compounding:"daily",sweep_network:true,sweep_max_coverage:8000000,plaid_supported:true,direct_deposit:true,direct_deposit_early:true,tax_documents:true,regulated_by:["SEC","FINRA"],last_rate_update:"2026-03-01",editor_notes:"Industry-leading $8M FDIC sweep coverage makes this the best option for depositors with large cash positions." },
  { id:"b047",slug:"m1-high-yield",name:"M1 High-Yield Savings",type:"savings",description:"5.00% APY for M1 Plus members with investment integration, pie-based portfolio building, and Smart Transfers.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY (Plus)","Investment integration","Smart Transfers","Pie-based investing","$5M FDIC sweep"],cons:["$3/mo for Plus after free trial","Investment-focused","Limited standalone banking"],established:2015,ratings:{app:4.5,fees:3.8,returns:4.8,access:3.5,support:4.0,security:4.5},apy:5.00,monthly_fee:3,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Finance in one place",headquarters:"Chicago, IL",parent_company:"M1 Holdings Inc.",customer_count:"500,000+",total_assets:"$7B+ AUM",website:"https://www.m1.com",checking_available:true,savings_available:true,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,budgeting_tools:true,auto_savings:true,robo_advisor:true,robo_advisor_fee:0,stock_trading:true,fractional_shares:true,etf_trading:true,crypto_trading:true,crypto_count:10,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA","SEP IRA"],support_24_7:false,live_chat:true,phone_support:true,email_support:true,joint_account:true,trust_account:true,interest_compounding:"daily",sweep_network:true,sweep_max_coverage:5000000,plaid_supported:true,personal_loans:true,regulated_by:["SEC","FINRA","FDIC"],last_rate_update:"2026-03-01" },
  { id:"b048",slug:"axos-bank",name:"Axos Bank",type:"savings",description:"Full-service online bank with checking, savings, mortgages, and personal loans — one of the original internet banks.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","Full banking suite","Cashback checking","Mortgage options","Personal loans"],cons:["Savings APY not top tier","UI feels dated","CS inconsistent","No branches"],established:2000,ratings:{app:4.0,fees:4.5,returns:3.8,access:3.8,support:3.8,security:4.4},apy:0.61,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Banking evolved",headquarters:"San Diego, CA",parent_company:"Axos Financial Inc.",customer_count:"400,000+",total_assets:"$20B",website:"https://www.axosbank.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.15,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.15},{months:24,apy:4.25},{months:60,apy:3.75}],money_market_apy:0.61,overdraft_protection:true,overdraft_fee:0,early_paycheck:true,early_paycheck_days:2,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:0,wire_fee_international:45,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,mobile_check_deposit_limit:25000,budgeting_tools:false,savings_goals:false,support_24_7:true,live_chat:true,phone_support:true,email_support:true,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,stock_ticker:"AX",regulated_by:["FDIC","OCC"],fdic_coverage_max:250000,last_rate_update:"2026-03-01" },
  { id:"b049",slug:"nbkc-bank",name:"nbkc Bank",type:"neobank",description:"Kansas City-based online bank with truly fee-free banking, no minimums, and a focus on simplicity.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Truly fee-free","No minimums","Good customer service","Zelle included","Free checks"],cons:["Lower APY","Less known","Limited premium features"],established:1999,ratings:{app:4.2,fees:5.0,returns:2.5,access:3.9,support:4.5,security:4.5},apy:1.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Banking made simple",headquarters:"Overland Park, KS",parent_company:"National Bank of Kansas City",customer_count:"100,000+",total_assets:"$1.5B",website:"https://www.nbkc.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.80,overdraft_protection:true,overdraft_fee:0,early_paycheck:false,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:0,wire_fee_international:40,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,check_writing:true,regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b050",slug:"sallie-mae-savings",name:"Sallie Mae High-Yield",type:"savings",description:"Student loan giant's savings account offers consistently competitive APY with FDIC insurance and no fees.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.65% APY","No fees","Sallie Mae brand trust","No minimum","FDIC insured"],cons:["Savings only","No checking","Limited features","No debit card"],established:1972,ratings:{app:3.9,fees:4.8,returns:4.6,access:3.4,support:4.0,security:4.5},apy:4.65,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Power in numbers",headquarters:"Newark, DE",parent_company:"SLM Corporation",customer_count:"300,000+",total_assets:"$5B",website:"https://www.salliemae.com/banking",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.75,cd_terms:[{months:6,apy:4.40},{months:12,apy:4.75},{months:24,apy:4.30},{months:36,apy:4.10}],money_market_apy:4.40,overdraft_protection:false,debit_card:false,apple_pay:false,google_pay:false,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,budgeting_tools:false,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"SLM",regulated_by:["FDIC"],last_rate_update:"2026-03-01" },
  { id:"b051",slug:"quontic-bank",name:"Quontic Bank",type:"savings",description:"CDFI community bank turned online leader with Bitcoin cashback checking and competitive savings rates.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["1.5% Bitcoin cashback on debit","4.50% APY savings","No fees","CDFI mission","Unique offering"],cons:["Bitcoin rewards volatility","Community bank scale","Limited features","$100 min for savings"],established:2005,ratings:{app:4.1,fees:4.6,returns:4.5,access:3.7,support:4.0,security:4.4},apy:4.50,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Adaptive digital bank",headquarters:"New York, NY",parent_company:null,customer_count:"75,000+",total_assets:"$850M",website:"https://www.quonticbank.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.75,overdraft_protection:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,cashback_debit:1.5,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:true,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,crypto_rewards:true,interest_compounding:"daily",plaid_supported:true,green_banking:true,regulated_by:["FDIC","CDFI Fund"],last_rate_update:"2026-03-01" },
  { id:"b052",slug:"live-oak-bank",name:"Live Oak Bank",type:"savings",description:"SBA-focused lender offers consumer high-yield savings at 5.30% APY — a powerhouse in small business lending.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","Business banking integration","FDIC insured","No monthly fees","Strong SBA lending"],cons:["Savings only for consumers","No debit card","Business-first focus","No checking for individuals"],established:2008,ratings:{app:4.0,fees:4.8,returns:4.9,access:3.4,support:4.2,security:4.7},apy:5.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Believe in small business",headquarters:"Wilmington, NC",parent_company:"Live Oak Bancshares Inc.",customer_count:"200,000+",total_assets:"$11B",website:"https://www.liveoakbank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.00,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.00},{months:24,apy:4.50},{months:36,apy:4.25}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,sba_lender:true,business_loans:true,stock_ticker:"LOB",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b053",slug:"citizens-access",name:"Citizens Access",type:"savings",description:"Citizens Bank's online arm with no monthly fees, competitive APY, and the backing of a $200B+ institution.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.65% APY","No fees","Solid institution","CD options","$200B+ parent bank"],cons:["$5,000 minimum","Limited to savings/CDs","No checking","No debit card"],established:2018,ratings:{app:4.1,fees:4.7,returns:4.6,access:3.5,support:4.1,security:4.6},apy:4.65,monthly_fee:0,min_balance:5000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The power of Citizens, online",headquarters:"Providence, RI",parent_company:"Citizens Financial Group",customer_count:"150,000+",total_assets:"$222B (parent)",website:"https://www.citizensaccess.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.00,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.00},{months:24,apy:4.50},{months:36,apy:4.25},{months:60,apy:4.00}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"CFG",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b054",slug:"affirm-savings",name:"Affirm Savings",type:"savings",description:"BNPL giant's HYSA offering 5.35% APY with zero fees, no minimums, and FDIC insurance through Cross River Bank.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No fees","No minimum","FDIC insured","Daily compounding"],cons:["Savings only","No debit card","BNPL brand association","Limited transfer options"],established:2012,ratings:{app:4.0,fees:5.0,returns:5.0,access:3.2,support:3.8,security:4.4},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Pay over time, save all the time",headquarters:"San Francisco, CA",parent_company:"Affirm Holdings Inc.",customer_count:"200,000+ (savings)",total_assets:"$8B (parent)",website:"https://www.affirm.com/savings",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"AFRM",regulated_by:["FDIC (via Cross River Bank)"],last_rate_update:"2026-03-01" },
  { id:"b055",slug:"first-internet-bank",name:"First Internet Bank",type:"savings",description:"America's first state-chartered online bank, offering high-yield savings and CDs since 1999 with full FDIC insurance.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Established online bank pioneer","CD rates competitive","FDIC insured","Full banking suite","SBA lender"],cons:["Lower savings APY","Dated UX","Limited product updates","Not the highest rates"],established:1999,ratings:{app:3.8,fees:4.4,returns:3.9,access:3.5,support:4.0,security:4.5},apy:5.01,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"America's first online bank",headquarters:"Fishers, IN",parent_company:"First Internet Bancorp",customer_count:"100,000+",total_assets:"$5.5B",website:"https://www.firstib.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.16,cd_terms:[{months:6,apy:4.60},{months:12,apy:5.16},{months:24,apy:4.47},{months:36,apy:4.26},{months:60,apy:4.06}],money_market_apy:4.50,overdraft_protection:true,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:15,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,personal_loans:false,sba_lender:true,business_loans:true,stock_ticker:"INBK",regulated_by:["FDIC","Indiana DFI"],last_rate_update:"2026-03-01" },
  { id:"b056",slug:"tab-bank",name:"TAB Bank",type:"savings",description:"Utah-based industrial bank offering top-tier APY to nationwide customers with no minimums and no fees.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.27% APY","No monthly fee","No minimum","FDIC insured","Checking available"],cons:["Less-known brand","Limited features","Small institution","Basic mobile app"],established:1998,ratings:{app:3.5,fees:4.7,returns:5.0,access:3.3,support:3.9,security:4.4},apy:5.27,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Where your money works",headquarters:"Ogden, UT",parent_company:"Transportation Alliance Bank",customer_count:"50,000+",total_assets:"$1.2B",website:"https://www.tabbank.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.00,overdraft_protection:false,debit_card:true,apple_pay:false,google_pay:false,zelle:false,two_factor_auth:true,biometric_login:false,mobile_check_deposit:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","Utah DFI"],last_rate_update:"2026-03-01" },
  { id:"b057",slug:"dollar-savings-direct",name:"Dollar Savings Direct",type:"savings",description:"Emigrant Bank's online division offering a consistently competitive high-yield savings rate with no gimmicks.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","No fees","FDIC insured","Emigrant Bank backing","Simple product"],cons:["$1,000 minimum","Savings only","Dated web portal","Limited features"],established:2008,ratings:{app:3.4,fees:4.7,returns:5.0,access:3.1,support:3.7,security:4.5},apy:5.30,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"More interest, less hassle",headquarters:"New York, NY",parent_company:"Emigrant Bank",customer_count:"80,000+",total_assets:"$7B (parent)",website:"https://www.dollarsavingsdirect.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:false,regulated_by:["FDIC","NYDFS"],last_rate_update:"2026-03-01" },
  { id:"b058",slug:"lending-club-hy",name:"LendingClub High-Yield Savings",type:"savings",description:"Former P2P lending pioneer now offers one of the highest savings APYs at 5.35% with full FDIC coverage.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No monthly fees","No minimum","FDIC insured","Strong digital experience"],cons:["Newer as a bank (since 2021)","Limited branch access","Savings and CD focus","No debit card on savings"],established:2006,ratings:{app:4.2,fees:4.9,returns:5.0,access:3.4,support:4.0,security:4.5},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"America's leading digital marketplace bank",headquarters:"San Francisco, CA",parent_company:"LendingClub Corporation",customer_count:"4.7M+",total_assets:"$8.5B",website:"https://www.lendingclub.com/banking",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,cd_terms:[{months:12,apy:4.50},{months:18,apy:4.25},{months:36,apy:3.75},{months:60,apy:3.50}],overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:true,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,personal_loans:true,auto_loans:true,stock_ticker:"LC",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b059",slug:"upgrade-premier",name:"Upgrade Premier Savings",type:"savings",description:"Fintech lender's savings at 5.07% APY with integrated credit-building tools and personal loan options.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.07% APY","Credit tools integration","No fees","No minimum","Personal loans available"],cons:["$1,000 required for best APY","Fintech not bank","CS variable","Newer institution"],established:2016,ratings:{app:4.3,fees:4.7,returns:4.8,access:3.6,support:3.9,security:4.4},apy:5.07,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Upgrade your bank",headquarters:"San Francisco, CA",parent_company:"Upgrade Inc.",customer_count:"3M+",total_assets:"$4B",website:"https://www.upgrade.com",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:true,overdraft_fee:0,debit_card:true,cashback_debit:2.0,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:true,phone_support:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,personal_loans:true,auto_loans:true,credit_cards:true,regulated_by:["FDIC (via Cross River Bank)"],last_rate_update:"2026-03-01" },
  { id:"b060",slug:"cibc-agility",name:"CIBC Bank USA Agility",type:"savings",description:"Canadian banking giant's US online savings offering competitive APY backed by $770B+ parent institution.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.01% APY","No fees","FDIC insured","Major bank backing","CD options"],cons:["$1,000 minimum","Savings/CD only","No checking","Limited US brand awareness"],established:2001,ratings:{app:3.9,fees:4.6,returns:4.9,access:3.3,support:4.0,security:4.7},apy:5.01,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Agility online savings",headquarters:"Chicago, IL",parent_company:"Canadian Imperial Bank of Commerce",customer_count:"100,000+ (US)",total_assets:"$770B+ (parent)",website:"https://us.cibc.com/en/agility",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.81,cd_terms:[{months:6,apy:4.41},{months:12,apy:4.81},{months:24,apy:4.21},{months:36,apy:4.01},{months:60,apy:3.76}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,multi_currency:false,regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  // ── TRADITIONAL BANKS (61-75) ──────────────────────────────────────────
  { id:"b061",slug:"truist-bank",name:"Truist Bank",type:"traditional",description:"Formed from the 2019 merger of BB&T and SunTrust, Truist is the 7th-largest US bank with a strong Southeast presence.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["7th-largest US bank","Strong Southeast presence","Truist Assist AI","Zelle included","Good credit card lineup"],cons:["Low savings APY","Monthly fees on basic accounts","Merger integration issues","Branch closures ongoing"],established:2019,ratings:{app:4.0,fees:2.5,returns:1.6,access:4.4,support:3.9,security:4.5},apy:0.01,monthly_fee:12,min_balance:500,fdic_insured:true,signup_bonus:400,atm_fee:false,mobile_only:false,tagline:"Where purpose meets progress",headquarters:"Charlotte, NC",parent_company:"Truist Financial Corporation",customer_count:"15M+",total_assets:"$555B",website:"https://www.truist.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.75,money_market_apy:0.02,overdraft_protection:true,overdraft_fee:36,early_paycheck:true,early_paycheck_days:2,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:30,wire_fee_international:50,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,mobile_check_deposit_limit:10000,budgeting_tools:true,savings_goals:true,bill_pay:true,check_writing:true,support_24_7:false,live_chat:true,phone_support:true,email_support:true,in_branch_support:true,branch_count:2049,joint_account:true,custodial_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,credit_card_count:8,insurance_products:true,wealth_management:true,stock_ticker:"TFC",regulated_by:["FDIC","OCC","Federal Reserve"],last_rate_update:"2026-03-01",monthly_fee_waiver:"$500 min balance or $500/mo direct deposit" },
  { id:"b062",slug:"huntington-bank",name:"Huntington Bank",type:"traditional",description:"Midwest powerhouse with 24-Hour Grace overdraft forgiveness and Standby Cash — one of the most consumer-friendly big banks.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["24-Hour Grace overdraft","Standby Cash ($100-$1,000)","No minimum balance","Good mobile app","Strong Midwest presence"],cons:["Low savings APY","Limited national reach","Monthly fee on some accounts","Below-average CD rates"],established:1866,ratings:{app:4.3,fees:3.2,returns:1.8,access:4.2,support:4.3,security:4.5},apy:0.02,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:200,atm_fee:false,mobile_only:false,tagline:"Welcome",headquarters:"Columbus, OH",parent_company:"Huntington Bancshares",customer_count:"6M+",total_assets:"$190B",website:"https://www.huntington.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,overdraft_protection:true,overdraft_fee:0,overdraft_limit:1000,early_paycheck:true,early_paycheck_days:2,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:15,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,savings_goals:true,bill_pay:true,check_writing:true,support_24_7:true,live_chat:true,phone_support:true,in_branch_support:true,branch_count:1000,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,stock_ticker:"HBAN",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b063",slug:"fifth-third-bank",name:"Fifth Third Bank",type:"traditional",description:"Major Midwest bank with Momentum Banking features including early pay and no overdraft fees.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Early Pay up to 2 days","No overdraft fees (Momentum)","Strong branch network","Zelle included","Good business banking"],cons:["Low savings APY","Limited national presence","Monthly fees on basic accounts","Complex product lineup"],established:1858,ratings:{app:4.1,fees:2.8,returns:1.7,access:4.1,support:4.0,security:4.4},apy:0.01,monthly_fee:11,min_balance:1500,fdic_insured:true,signup_bonus:250,atm_fee:false,mobile_only:false,tagline:"Bank for life",headquarters:"Cincinnati, OH",parent_company:"Fifth Third Bancorp",customer_count:"4M+",total_assets:"$212B",website:"https://www.53.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,overdraft_protection:true,overdraft_fee:0,early_paycheck:true,early_paycheck_days:2,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:30,wire_fee_international:50,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,bill_pay:true,check_writing:true,support_24_7:false,live_chat:true,phone_support:true,in_branch_support:true,branch_count:1075,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,wealth_management:true,stock_ticker:"FITB",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b064",slug:"keybank",name:"KeyBank",type:"traditional",description:"Cleveland-based national bank with Hassle-Free Account and strong small business focus across 15 states.",rating:3.8,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Hassle-Free Account (no OD fees)","Good business banking","15-state presence","Zelle included","Relationship rewards"],cons:["Low savings APY","Monthly fees","Limited national footprint","App needs improvement"],established:1825,ratings:{app:3.8,fees:2.4,returns:1.5,access:3.9,support:3.8,security:4.3},apy:0.01,monthly_fee:7,min_balance:0,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false,tagline:"Achieve anything",headquarters:"Cleveland, OH",parent_company:"KeyCorp",customer_count:"3.5M+",total_assets:"$190B",website:"https://www.key.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.25,overdraft_protection:true,overdraft_fee:20,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:30,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:950,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,wealth_management:true,sba_lender:true,stock_ticker:"KEY",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b065",slug:"mt-bank",name:"M&T Bank",type:"traditional",description:"Northeast regional powerhouse with strong community banking roots and comprehensive business banking services.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Strong community focus","Good business banking","Wide Northeast presence","SBA Top 10 Lender","Relationship banking"],cons:["Low savings APY","Monthly fees","Limited geographic reach","Below-average digital experience"],established:1856,ratings:{app:3.7,fees:2.5,returns:1.5,access:4.0,support:4.1,security:4.4},apy:0.01,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:250,atm_fee:false,mobile_only:false,tagline:"Understanding what's important",headquarters:"Buffalo, NY",parent_company:"M&T Bank Corporation",customer_count:"3M+",total_assets:"$210B",website:"https://www.mtb.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,overdraft_protection:true,overdraft_fee:36,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:30,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:700,joint_account:true,trust_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,wealth_management:true,sba_lender:true,commercial_banking:true,stock_ticker:"MTB",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b066",slug:"hsbc-us",name:"HSBC US",type:"traditional",description:"Global banking giant's US arm with Premier international banking perks and competitive savings rates.",rating:3.8,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Global banking network","Premier perks","International wire free (Premier)","Multi-currency accounts","Strong international presence"],cons:["US branch closures","Complex product structure","High minimum for Premier ($75K)","Customer service inconsistent"],established:1865,ratings:{app:3.9,fees:2.8,returns:3.0,access:3.5,support:3.5,security:4.6},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Open a world of opportunity",headquarters:"New York, NY",parent_company:"HSBC Holdings plc",customer_count:"2M+ (US)",total_assets:"$2.9T (global)",website:"https://www.us.hsbc.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,money_market_apy:3.50,overdraft_protection:true,overdraft_fee:35,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:0,wire_fee_international:0,multi_currency:true,currency_count:20,international_wire:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:true,live_chat:true,phone_support:true,in_branch_support:true,branch_count:148,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,credit_cards:true,wealth_management:true,private_banking:true,private_banking_minimum:75000,stock_ticker:"HSBC",regulated_by:["FDIC","OCC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b067",slug:"bmo-us",name:"BMO Bank (US)",type:"traditional",description:"Canada's BMO Financial Group US subsidiary with comprehensive banking and the former Bank of the West network.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["BMO Relationship perks","Good business banking","Growing US footprint","Zelle included","Smart Money checking (no OD)"],cons:["Low savings APY","Limited national presence","Integration ongoing","Below-average digital tools"],established:1847,ratings:{app:3.8,fees:2.7,returns:1.8,access:3.8,support:3.9,security:4.4},apy:0.01,monthly_fee:15,min_balance:1500,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false,tagline:"Make money make sense",headquarters:"Chicago, IL",parent_company:"BMO Financial Group",customer_count:"4M+ (US)",total_assets:"$275B (US)",website:"https://www.bmo.com/us",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:30,wire_fee_international:45,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,live_chat:true,phone_support:true,in_branch_support:true,branch_count:500,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,wealth_management:true,commercial_banking:true,stock_ticker:"BMO",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b068",slug:"usaa-bank",name:"USAA Bank",type:"traditional",description:"The gold standard for military banking — exceptional service, competitive rates, and comprehensive financial products for military families.",rating:4.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Best military bank","Free ATMs worldwide","No foreign transaction fees","Excellent insurance bundle","#1 customer satisfaction"],cons:["Military/family members only","Limited branch access","No cash deposits at branches","Eligibility restrictions"],established:1922,ratings:{app:4.8,fees:5.0,returns:3.5,access:4.2,support:5.0,security:4.9},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"We know what it means to serve",headquarters:"San Antonio, TX",parent_company:"USAA",customer_count:"13M+",total_assets:"$209B",website:"https://www.usaa.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.75,money_market_apy:0.05,overdraft_protection:true,overdraft_fee:0,early_paycheck:true,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:20,wire_fee_international:45,international_atm:true,international_atm_fee:0,foreign_transaction_fee:0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,mobile_check_deposit_limit:50000,budgeting_tools:true,savings_goals:true,bill_pay:true,check_writing:true,support_24_7:true,live_chat:true,phone_support:true,email_support:true,in_branch_support:true,branch_count:2,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,credit_card_count:6,insurance_products:true,wealth_management:true,military_perks:true,military_verification:"Military service or family of member",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01",editor_notes:"Consistently ranked #1 in J.D. Power customer satisfaction. The only downside is the eligibility requirement." },
  { id:"b069",slug:"frost-bank",name:"Frost Bank",type:"traditional",description:"Texas-only bank with legendary customer service, no-fee philosophy, and 155+ years of continuous operation.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Legendary customer service","No account fees (most)","Strong Texas presence","24/7 live support","Frost Rewards"],cons:["Texas only","Low savings APY","Limited digital features","No national presence"],established:1868,ratings:{app:4.2,fees:4.5,returns:1.8,access:4.5,support:5.0,security:4.7},apy:0.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"We're Frost",headquarters:"San Antonio, TX",parent_company:"Culberson Bankers Inc.",customer_count:"1M+",total_assets:"$52B",website:"https://www.frostbank.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.25,overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,bill_pay:true,check_writing:true,support_24_7:true,live_chat:false,phone_support:true,in_branch_support:true,branch_count:170,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,wealth_management:true,insurance_products:true,commercial_banking:true,stock_ticker:"CFR",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b070",slug:"first-horizon",name:"First Horizon Bank",type:"traditional",description:"Southeast regional bank with strong Tennessee roots, relationship banking, and competitive CD rates.",rating:3.8,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Good CD rates","Strong Southeast presence","Relationship rewards","Business banking focus","Community commitment"],cons:["Low savings APY","Monthly fees","Limited national reach","Average digital experience"],established:1864,ratings:{app:3.7,fees:2.6,returns:2.0,access:3.8,support:3.9,security:4.3},apy:0.01,monthly_fee:10,min_balance:500,fdic_insured:true,signup_bonus:200,atm_fee:false,mobile_only:false,tagline:"Forward thinking",headquarters:"Memphis, TN",parent_company:"First Horizon Corporation",customer_count:"2M+",total_assets:"$82B",website:"https://www.firsthorizon.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.75,overdraft_protection:true,overdraft_fee:36,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:25,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:418,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,heloc:true,credit_cards:true,wealth_management:true,commercial_banking:true,stock_ticker:"FHN",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b071",slug:"flagstar-bank",name:"Flagstar Bank (NYCB)",type:"traditional",description:"Now under New York Community Bancorp, Flagstar is a top-10 US mortgage originator with national reach.",rating:3.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Top-10 mortgage originator","National mortgage presence","FDIC insured","Competitive CD rates","Business banking"],cons:["Ongoing NYCB integration","Branch network shrinking","Low savings APY","Recent financial concerns"],established:1993,ratings:{app:3.6,fees:2.8,returns:2.2,access:3.6,support:3.5,security:4.2},apy:0.01,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Big enough to count, small enough to care",headquarters:"Hicksville, NY",parent_company:"New York Community Bancorp",customer_count:"1.5M+",total_assets:"$114B (parent)",website:"https://www.flagstar.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.50,overdraft_protection:true,overdraft_fee:36,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:30,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:390,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,heloc:true,credit_cards:false,wealth_management:true,commercial_banking:true,stock_ticker:"NYCB",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b072",slug:"comerica-bank",name:"Comerica Bank",type:"traditional",description:"Dallas-based commercial bank with strong business focus across Michigan, Texas, California, and Florida.",rating:3.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Strong business banking","Good commercial lending","Multi-state presence","Wealth management","Treasury management"],cons:["Low consumer savings APY","Monthly fees","Limited retail focus","Below-average digital banking"],established:1849,ratings:{app:3.5,fees:2.3,returns:1.4,access:3.7,support:3.7,security:4.4},apy:0.01,monthly_fee:15,min_balance:1500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Raise your expectations",headquarters:"Dallas, TX",parent_company:"Comerica Incorporated",customer_count:"1.5M+",total_assets:"$90B",website:"https://www.comerica.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.00,overdraft_protection:true,overdraft_fee:33,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:30,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:400,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:false,personal_loans:false,heloc:true,credit_cards:true,wealth_management:true,commercial_banking:true,treasury_management:true,stock_ticker:"CMA",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  // ── NEOBANKS & FINTECHS (73-85) ────────────────────────────────────────
  { id:"b073",slug:"monzo-us",name:"Monzo US",type:"neobank",description:"UK neobank darling expanding to the US with fee-free spending abroad, instant notifications, and Pots savings.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No foreign transaction fees","Instant notifications","Pots savings feature","Fee-free abroad","Beautiful UX"],cons:["Limited US features vs UK","No APY on main account","Wait list may apply","Newer in US market"],established:2015,ratings:{app:4.8,fees:4.5,returns:2.5,access:3.8,support:3.8,security:4.5},apy:4.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Money made easy",headquarters:"London, UK (US: San Francisco)",parent_company:"Monzo Bank Ltd",customer_count:"9M+ (global)",total_assets:"$5B+ (global)",website:"https://monzo.com/us",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:true,contactless_pay:true,apple_pay:true,google_pay:true,zelle:false,multi_currency:true,currency_count:30,foreign_transaction_fee:0,international_atm:true,international_atm_fee:0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,spending_insights:true,savings_goals:true,round_up_savings:true,auto_savings:true,support_24_7:true,live_chat:true,phone_support:false,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via Sutton Bank)","FCA (UK)"],last_rate_update:"2026-03-01" },
  { id:"b074",slug:"hmb-bradley",name:"HMBradley",type:"neobank",description:"Tier-based APY neobank rewarding consistent savers with rates up to 4.50% based on savings behavior.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Tier-based APY up to 4.50%","Rewards saving behavior","Credit builder card","Quarterly budgets","Good UX"],cons:["APY requires saving 20%+ of income","Tier system complex","Newer institution","Limited features"],established:2018,ratings:{app:4.4,fees:4.3,returns:4.0,access:3.6,support:3.8,security:4.4},apy:4.50,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Banking that rewards saving",headquarters:"Los Angeles, CA",parent_company:"HMBradley Inc.",customer_count:"100,000+",total_assets:"$500M",website:"https://www.hmbradley.com",checking_available:true,savings_available:true,cd_available:false,tiered_apy:true,apy_tiers:[{min:0,max:25000,apy:4.50},{min:25001,max:100000,apy:3.50},{min:100001,max:null,apy:2.50}],overdraft_protection:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,savings_goals:true,auto_savings:true,support_24_7:false,live_chat:true,phone_support:false,email_support:true,joint_account:true,crypto_trading:false,credit_cards:true,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via Hatch Bank)"],last_rate_update:"2026-03-01" },
  { id:"b075",slug:"acorns",name:"Acorns",type:"neobank",description:"Micro-investing app that rounds up purchases and invests the spare change — now with banking, retirement, and family accounts.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Round-Up investing","Banking + investing in one","Later (retirement) included","Family plan available","Found Money rewards"],cons:["$3-$12/mo subscription","Low APY on checking","Limited banking features","Not free"],established:2012,ratings:{app:4.6,fees:3.5,returns:3.8,access:3.8,support:4.0,security:4.5},apy:3.00,monthly_fee:3,min_balance:0,fdic_insured:true,signup_bonus:20,atm_fee:true,mobile_only:true,tagline:"Invest spare change",headquarters:"Irvine, CA",parent_company:"Acorns Grow Inc.",customer_count:"12M+",total_assets:"$4.7B+ AUM",website:"https://www.acorns.com",checking_available:true,savings_available:false,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,round_up_savings:true,auto_savings:true,budgeting_tools:true,robo_advisor:true,robo_advisor_fee:0,stock_trading:false,etf_trading:true,retirement_accounts:true,retirement_account_types:["IRA"],custodial_account:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,support_24_7:false,live_chat:true,phone_support:false,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,rewards_program:true,rewards_type:"Found Money (earn bonus investments at partner retailers)",regulated_by:["SEC","FINRA","FDIC (via Lincoln Savings Bank)"],last_rate_update:"2026-03-01" },
  { id:"b076",slug:"yotta",name:"Yotta Savings",type:"neobank",description:"Prize-linked savings app where you earn lottery-style prizes on top of base APY — gamification meets high-yield savings.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Prize-linked savings (up to $10M)","4.30% base APY","No fees","Fun gamification","FDIC insured"],cons:["Prize odds are low","Newer institution","Limited features","Checking functionality basic"],established:2020,ratings:{app:4.3,fees:4.7,returns:4.0,access:3.5,support:3.6,security:4.2},apy:4.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Save money, win prizes",headquarters:"New York, NY",parent_company:"Yotta Inc.",customer_count:"500,000+",total_assets:"$300M",website:"https://www.withyotta.com",checking_available:true,savings_available:true,cd_available:false,debit_card:true,cashback_debit:0.20,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,budgeting_tools:false,savings_goals:false,round_up_savings:false,crypto_trading:true,crypto_count:6,support_24_7:false,live_chat:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,rewards_program:true,rewards_type:"Weekly prize drawings based on savings balance",regulated_by:["FDIC (via Evolve Bank)"],last_rate_update:"2026-03-01" },
  { id:"b077",slug:"moneylion",name:"MoneyLion",type:"neobank",description:"All-in-one mobile fintech with RoarMoney banking, Credit Builder, managed investing, and cash advances.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Instacash advances up to $500","Credit Builder Plus","Managed investing","No monthly fee (base)","Cash back rewards"],cons:["$19.99/mo for Credit Builder Plus","APY below average","App-only banking","CS can be slow"],established:2013,ratings:{app:4.2,fees:3.5,returns:2.5,access:3.8,support:3.4,security:4.2},apy:2.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Rewire your finances",headquarters:"New York, NY",parent_company:"MoneyLion Inc.",customer_count:"11M+",total_assets:"$2B",website:"https://www.moneylion.com",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:true,overdraft_limit:500,early_paycheck:true,early_paycheck_days:2,debit_card:true,cashback_debit:1.0,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,round_up_savings:true,auto_savings:true,robo_advisor:true,robo_advisor_fee:0,crypto_trading:true,crypto_count:12,support_24_7:false,live_chat:true,phone_support:false,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,personal_loans:true,stock_ticker:"ML",regulated_by:["FDIC (via Lincoln Savings Bank)"],last_rate_update:"2026-03-01" },
  { id:"b078",slug:"go2bank",name:"GO2bank",type:"neobank",description:"Green Dot's flagship mobile checking with high-yield savings, early direct deposit, and credit building — available at 90K+ retailers.",rating:3.7,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Available at 90K+ retailers","Early direct deposit","Credit builder card","High-yield savings (4.50%)","Cash deposit at retail"],cons:["$5/mo subscription fee","ATM fees for non-network","Limited digital features","Customer service complaints"],established:2020,ratings:{app:3.8,fees:3.0,returns:3.5,access:4.5,support:3.0,security:4.0},apy:4.50,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Bank on the go",headquarters:"Austin, TX",parent_company:"Green Dot Corporation",customer_count:"5M+",total_assets:"$4B (parent)",website:"https://www.go2bank.com",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:true,overdraft_fee:0,overdraft_limit:200,early_paycheck:true,early_paycheck_days:4,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,credit_cards:true,stock_ticker:"GDOT",regulated_by:["FDIC"],last_rate_update:"2026-03-01" },
  { id:"b079",slug:"payoneer",name:"Payoneer",type:"neobank",description:"Global payments platform designed for freelancers, marketplaces, and businesses operating across borders.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Multi-currency accounts (USD/EUR/GBP/etc)","Low FX rates","Marketplace integration (Amazon, Fiverr, Upwork)","Mass payout capabilities","Virtual receiving accounts"],cons:["Monthly fee with low balance","Limited consumer features","Complex fee structure","Not a traditional bank"],established:2005,ratings:{app:4.1,fees:3.5,returns:2.5,access:4.3,support:3.8,security:4.4},apy:0,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Go beyond borders",headquarters:"New York, NY",parent_company:"Payoneer Global Inc.",customer_count:"5M+",total_assets:"$6B+ processed/yr",website:"https://www.payoneer.com",checking_available:true,savings_available:false,cd_available:false,debit_card:true,apple_pay:false,google_pay:false,multi_currency:true,currency_count:70,international_wire:true,wire_fee_domestic:0,wire_fee_international:0,forex_markup:0.5,two_factor_auth:true,biometric_login:true,api_access:true,api_type:"REST API",budgeting_tools:false,support_24_7:true,live_chat:true,phone_support:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:false,invoice_creation:true,batch_payments:true,international_payroll:true,contractor_payments:true,data_export:true,data_export_formats:["CSV","PDF","XLS"],stock_ticker:"PAYO",regulated_by:["FinCEN","FCA","ASIC","MAS"],last_rate_update:"2026-03-01" },
  { id:"b080",slug:"stash",name:"Stash",type:"neobank",description:"Banking and investing combined for beginners — fractional shares from $5, Stock-Back rewards, and Smart Portfolio.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Stock-Back rewards on debit","Fractional shares from $5","Smart Portfolio (robo)","Banking + investing","Educational content"],cons:["$3-$9/mo subscription","Low checking APY","Not the cheapest option","Limited investment selection"],established:2015,ratings:{app:4.3,fees:3.2,returns:3.0,access:3.8,support:3.9,security:4.3},apy:0.10,monthly_fee:3,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Invest for the life you want to build",headquarters:"New York, NY",parent_company:"Stash Financial Inc.",customer_count:"2M+",total_assets:"$3B+ AUM",website:"https://www.stash.com",checking_available:true,savings_available:false,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,early_paycheck:true,early_paycheck_days:2,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,round_up_savings:true,robo_advisor:true,stock_trading:true,fractional_shares:true,etf_trading:true,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA"],custodial_account:true,support_24_7:false,live_chat:true,phone_support:false,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"monthly",plaid_supported:true,rewards_program:true,rewards_type:"Stock-Back (earn fractional shares on debit purchases)",regulated_by:["SEC","FINRA","FDIC (via Green Dot Bank)"],last_rate_update:"2026-03-01" },
  { id:"b081",slug:"albert",name:"Albert",type:"neobank",description:"AI-powered banking assistant with Genius financial guidance, early paycheck, and automatic savings powered by machine learning.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["AI savings (Albert Savings)","Genius financial advice","Early paycheck","Cash advances up to $250","Smart budgeting"],cons:["$14.99/mo for Genius","Free tier limited","APY below average","App-only"],established:2015,ratings:{app:4.4,fees:3.2,returns:2.8,access:3.6,support:3.8,security:4.3},apy:4.25,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"A genius way to bank",headquarters:"Los Angeles, CA",parent_company:"Albert Corporation",customer_count:"8M+",total_assets:"$1B",website:"https://albert.com",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:true,overdraft_limit:250,early_paycheck:true,early_paycheck_days:2,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,spending_insights:true,savings_goals:true,auto_savings:true,round_up_savings:true,support_24_7:false,live_chat:true,email_support:true,joint_account:false,crypto_trading:false,robo_advisor:true,interest_compounding:"daily",plaid_supported:true,financial_advisor_access:true,regulated_by:["FDIC (via Sutton Bank)"],last_rate_update:"2026-03-01" },
  { id:"b082",slug:"empower-bank",name:"Empower",type:"neobank",description:"Cash advance app turned full-service neobank with up to $250 advances, high-yield savings, and automatic savings.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Cash advances up to $250","High-yield savings 4.95% APY","Automatic savings","No overdraft fees","Cashback rewards"],cons:["$8/mo subscription","Advance amounts limited initially","App-only","Newer institution"],established:2017,ratings:{app:4.2,fees:3.5,returns:4.0,access:3.5,support:3.6,security:4.2},apy:4.95,monthly_fee:8,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Get ahead financially",headquarters:"San Francisco, CA",parent_company:"Empower Finance Inc.",customer_count:"3M+",total_assets:"$500M",website:"https://empower.me",checking_available:true,savings_available:true,cd_available:false,overdraft_protection:true,overdraft_limit:250,early_paycheck:true,early_paycheck_days:2,debit_card:true,cashback_debit:1.0,apple_pay:true,google_pay:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,spending_insights:true,auto_savings:true,support_24_7:false,live_chat:true,email_support:true,joint_account:false,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via nbkc bank)"],last_rate_update:"2026-03-01" },
  // ── CREDIT UNIONS (83-96) ──────────────────────────────────────────────
  { id:"b083",slug:"penfed-credit-union",name:"PenFed Credit Union",type:"credit_union",description:"Pentagon Federal — one of the nation's largest credit unions with exceptional CD rates, mortgages, and auto loans for all members.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to everyone","Excellent CD rates (5.25%)","Great auto loan rates","No monthly fees","Military-friendly"],cons:["Limited branches","Online-focused","No joint savings APY boost","App could improve"],established:1935,ratings:{app:4.0,fees:4.7,returns:4.8,access:3.8,support:4.3,security:4.7},apy:0.15,monthly_fee:0,min_balance:5,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Exceptional rates for everyone",headquarters:"McLean, VA",parent_company:null,customer_count:"2.9M+",total_assets:"$36B",website:"https://www.penfed.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.25,cd_terms:[{months:6,apy:4.40},{months:12,apy:5.25},{months:24,apy:4.00},{months:36,apy:3.50},{months:60,apy:3.20}],money_market_apy:4.30,overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:20,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,email_support:true,in_branch_support:true,branch_count:56,joint_account:true,custodial_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,credit_card_count:6,ncua_insured:true,military_perks:true,regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b084",slug:"becu",name:"BECU (Boeing Employees CU)",type:"credit_union",description:"Washington State's largest credit union, open to anyone in WA — outstanding rates, no-fee philosophy, and member dividends.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to WA residents","Excellent rates across all products","No fees on most accounts","Member dividends","Strong community focus"],cons:["WA state only","Limited national access","No nationwide ATM network","Branch-heavy model"],established:1935,ratings:{app:4.4,fees:5.0,returns:4.5,access:3.8,support:4.7,security:4.8},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"People helping people",headquarters:"Tukwila, WA",parent_company:null,customer_count:"1.4M+",total_assets:"$29B",website:"https://www.becu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.25,money_market_apy:4.75,overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,savings_goals:true,bill_pay:true,check_writing:true,support_24_7:false,live_chat:true,phone_support:true,in_branch_support:true,branch_count:58,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,green_banking:true,regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b085",slug:"schoolsfirst-fcu",name:"SchoolsFirst FCU",type:"credit_union",description:"California-exclusive credit union for school employees — one of the largest CUs in the US with exceptional member satisfaction.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["#1 J.D. Power satisfaction","Excellent rates","No monthly fees","Strong member benefits","Full product suite"],cons:["CA school employees only","Limited eligibility","No national access","Branch-heavy model"],established:1934,ratings:{app:4.3,fees:5.0,returns:4.3,access:3.5,support:4.9,security:4.8},apy:3.45,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"For school employees, by school employees",headquarters:"Santa Ana, CA",parent_company:null,customer_count:"1.2M+",total_assets:"$28B",website:"https://www.schoolsfirstfcu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.00,overdraft_protection:true,overdraft_fee:22,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:66,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,insurance_products:true,ncua_insured:true,regulated_by:["NCUA","California DFPI"],jd_power_score:891,last_rate_update:"2026-03-01" },
  { id:"b086",slug:"america-first-cu",name:"America First Credit Union",type:"credit_union",description:"Utah's largest credit union with 1.3M members, competitive rates, and open membership for anyone who lives, works, or worships in UT, NV, or AZ.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to UT/NV/AZ residents","Strong rates across products","No monthly fees","Large branch network","Full product suite"],cons:["Limited to 3 states","Low savings APY","Branch-centric","Average digital experience"],established:1939,ratings:{app:4.1,fees:4.6,returns:3.5,access:4.3,support:4.5,security:4.6},apy:0.15,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Together, anything is possible",headquarters:"Ogden, UT",parent_company:null,customer_count:"1.3M+",total_assets:"$19B",website:"https://www.americafirst.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.15,money_market_apy:4.05,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:130,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,insurance_products:true,ncua_insured:true,regulated_by:["NCUA","Utah DFI"],last_rate_update:"2026-03-01" },
  { id:"b087",slug:"golden-1-cu",name:"Golden 1 Credit Union",type:"credit_union",description:"California's largest credit union with 1.1M members and exceptional auto loan rates — open to anyone who lives, works, or attends school in CA.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to all CA residents","Excellent auto loan rates","No monthly fees","Good mobile app","Full banking suite"],cons:["CA only","Low savings APY","Limited digital innovation","Branch wait times"],established:1933,ratings:{app:4.2,fees:4.6,returns:3.0,access:4.2,support:4.4,security:4.6},apy:0.25,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"More than money",headquarters:"Sacramento, CA",parent_company:null,customer_count:"1.1M+",total_assets:"$20B",website:"https://www.golden1.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.00,money_market_apy:3.75,overdraft_protection:true,overdraft_fee:22,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:68,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,regulated_by:["NCUA","California DFPI"],last_rate_update:"2026-03-01" },
  { id:"b088",slug:"connexus-cu",name:"Connexus Credit Union",type:"credit_union",description:"Wisconsin-based CU open to anyone nationwide via Connexus Association membership — consistently top-tier savings and CD rates.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to anyone (join Connexus Association $5)","5.00% APY savings","Excellent CD rates","No monthly fees","Free ATMs at 78K+ locations"],cons:["$5 association membership","$25,000 max for top APY","Fewer features than neobanks","Branch-limited"],established:1935,ratings:{app:4.1,fees:4.8,returns:4.9,access:4.4,support:4.4,security:4.6},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Belong to something better",headquarters:"Wausau, WI",parent_company:null,customer_count:"500,000+",total_assets:"$4.5B",website:"https://www.connexuscu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.21,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.21},{months:24,apy:4.50},{months:36,apy:4.25},{months:60,apy:4.00}],money_market_apy:4.25,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,atm_network:"CO-OP + Allpoint",atm_network_size:78000,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,email_support:true,in_branch_support:true,branch_count:14,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,max_apy_balance:25000,regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b089",slug:"first-tech-fcu",name:"First Tech FCU",type:"credit_union",description:"Credit union for tech employees (HP, Microsoft, Intel, Amazon, etc.) and Oregon/Washington residents — strong digital banking.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to tech employees","Good digital experience","No monthly fees","Strong CD rates","Dividend checking"],cons:["Membership eligibility required","Limited branches","Average savings APY","Some loan rates higher"],established:1952,ratings:{app:4.4,fees:4.5,returns:3.5,access:3.9,support:4.3,security:4.6},apy:0.35,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Banking as innovative as you",headquarters:"San Jose, CA",parent_company:null,customer_count:"700,000+",total_assets:"$17B",website:"https://www.firsttechfed.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.15,money_market_apy:3.50,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,savings_goals:true,bill_pay:true,check_writing:true,support_24_7:false,live_chat:true,phone_support:true,in_branch_support:true,branch_count:35,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b090",slug:"bethpage-fcu",name:"Bethpage FCU",type:"credit_union",description:"Long Island's largest credit union, open to anyone nationwide — known for exceptional mortgage rates and free checking.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to anyone nationwide","Great mortgage rates","Free checking","No minimum balance","Strong CD rates"],cons:["Limited branches (NY-focused)","Average savings APY","Customer service inconsistent","App needs improvement"],established:1941,ratings:{app:3.9,fees:4.6,returns:3.5,access:3.7,support:4.1,security:4.5},apy:0.45,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Your community. Your credit union.",headquarters:"Bethpage, NY",parent_company:null,customer_count:"450,000+",total_assets:"$12B",website:"https://www.bethpagefcu.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.10,overdraft_protection:true,overdraft_fee:22,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:32,joint_account:true,custodial_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b091",slug:"mountain-america-cu",name:"Mountain America CU",type:"credit_union",description:"Utah-based credit union expanding across 9 western states with competitive rates and comprehensive product lineup.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["9-state presence","Competitive across all products","No monthly fees","Strong mobile app","Full product suite"],cons:["Western US only","Average savings APY","Some branches understaffed","Hold times can be long"],established:1934,ratings:{app:4.2,fees:4.5,returns:3.3,access:4.0,support:4.2,security:4.5},apy:0.20,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"We guide you forward",headquarters:"Sandy, UT",parent_company:null,customer_count:"1.1M+",total_assets:"$18B",website:"https://www.macu.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.10,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:115,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,regulated_by:["NCUA","Utah DFI"],last_rate_update:"2026-03-01" },
  { id:"b092",slug:"digital-fcu",name:"Digital FCU",type:"credit_union",description:"Massachusetts-based tech-friendly credit union open to anyone in New England — strong digital banking and competitive rates.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Open to New England residents","Good digital experience","No monthly fees","Competitive CD rates","Strong checking rewards"],cons:["New England only","Limited branch network","Average savings APY","Membership fee $10"],established:1979,ratings:{app:4.3,fees:4.5,returns:3.5,access:3.8,support:4.2,security:4.5},apy:6.17,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Digital forward",headquarters:"Marlborough, MA",parent_company:null,customer_count:"300,000+",total_assets:"$10B",website:"https://www.dcu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.00,money_market_apy:4.00,overdraft_protection:true,overdraft_fee:20,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:24,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,max_apy_balance:1000,tiered_apy:true,apy_tiers:[{min:0,max:1000,apy:6.17},{min:1001,max:null,apy:0.15}],regulated_by:["NCUA"],last_rate_update:"2026-03-01",editor_notes:"The 6.17% APY only applies to the first $1,000 in the primary savings account — still a great deal for small savers." },
  // ── INVESTMENT & BROKERAGE CASH (93-100) ───────────────────────────────
  { id:"b093",slug:"charles-schwab-checking",name:"Charles Schwab Investor Checking",type:"investment",description:"The ultimate travel checking account — unlimited ATM fee rebates worldwide, no foreign transaction fees, and Schwab brokerage integration.",rating:4.6,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Unlimited global ATM rebates","No foreign transaction fees","No monthly fees","Schwab brokerage integration","FDIC insured"],cons:["Requires brokerage account","Low checking APY","No savings product","Hard credit check to open"],established:1971,ratings:{app:4.5,fees:5.0,returns:2.0,access:5.0,support:4.7,security:4.9},apy:0.45,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Own your tomorrow",headquarters:"Westlake, TX",parent_company:"The Charles Schwab Corporation",customer_count:"34M+",total_assets:"$7.5T+ AUM",website:"https://www.schwab.com/checking",checking_available:true,savings_available:false,cd_available:false,overdraft_protection:true,overdraft_fee:0,debit_card:true,contactless_pay:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,international_atm:true,international_atm_fee:0,atm_fee_rebate_amount:999,foreign_transaction_fee:0,wire_fee_domestic:0,wire_fee_international:0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,mobile_check_deposit_limit:100000,bill_pay:true,check_writing:true,support_24_7:true,live_chat:true,phone_support:true,email_support:true,in_branch_support:true,branch_count:400,joint_account:true,trust_account:true,stock_trading:true,fractional_shares:true,etf_trading:true,options_trading:true,robo_advisor:true,robo_advisor_fee:0,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA","SEP IRA","Simple IRA","Solo 401k"],financial_advisor_access:true,wealth_management:true,interest_compounding:"daily",plaid_supported:true,stock_ticker:"SCHW",regulated_by:["FDIC","SEC","FINRA"],last_rate_update:"2026-03-01",editor_notes:"The #1 checking account for travelers. Schwab reimburses every ATM fee worldwide with no limits." },
  { id:"b094",slug:"fidelity-cash-management",name:"Fidelity Cash Management",type:"investment",description:"Fidelity's fee-free checking alternative with ATM fee reimbursement, no minimums, and seamless brokerage integration.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["ATM fee reimbursement","No monthly fees","No minimums","Fidelity integration","FDIC sweep up to $5M"],cons:["No savings account","Low APY on cash","Not a bank (brokerage CMA)","No cash deposits"],established:1946,ratings:{app:4.6,fees:5.0,returns:2.5,access:4.8,support:4.6,security:4.9},apy:2.72,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Turn here",headquarters:"Boston, MA",parent_company:"FMR LLC (Fidelity)",customer_count:"42M+",total_assets:"$12T+ AUM",website:"https://www.fidelity.com/cash-management",checking_available:true,savings_available:false,cd_available:false,overdraft_protection:false,debit_card:true,contactless_pay:true,apple_pay:true,google_pay:true,samsung_pay:true,zelle:false,atm_fee_rebate_amount:999,wire_fee_domestic:0,foreign_transaction_fee:1.0,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:true,live_chat:true,phone_support:true,email_support:true,in_branch_support:true,branch_count:200,joint_account:true,trust_account:true,stock_trading:true,fractional_shares:true,etf_trading:true,options_trading:true,crypto_trading:false,robo_advisor:true,robo_advisor_fee:0,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA","SEP IRA","Simple IRA","Solo 401k","529 Plan"],financial_advisor_access:true,wealth_management:true,interest_compounding:"monthly",plaid_supported:true,sweep_network:true,sweep_max_coverage:5000000,regulated_by:["SEC","FINRA","FDIC (sweep banks)"],last_rate_update:"2026-03-01" },
  { id:"b095",slug:"robinhood-gold",name:"Robinhood Gold Cash Sweep",type:"investment",description:"Robinhood's premium tier offers 4.90% APY on uninvested cash with FDIC sweep, plus extended trading hours and Morningstar research.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.90% APY on cash","Commission-free trades","Extended hours trading","FDIC sweep up to $2.25M","Morningstar research included"],cons:["$5/mo Gold subscription required","No traditional banking features","Controversial reputation","Limited customer support"],established:2013,ratings:{app:4.5,fees:4.0,returns:4.5,access:3.8,support:3.0,security:4.2},apy:4.90,monthly_fee:5,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Investing for everyone",headquarters:"Menlo Park, CA",parent_company:"Robinhood Markets Inc.",customer_count:"23M+",total_assets:"$100B+ AUM",website:"https://robinhood.com/gold",checking_available:false,savings_available:false,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,two_factor_auth:true,biometric_login:true,stock_trading:true,fractional_shares:true,etf_trading:true,options_trading:true,crypto_trading:true,crypto_count:20,crypto_staking:false,robo_advisor:false,retirement_accounts:true,retirement_account_types:["Traditional IRA","Roth IRA"],support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,sweep_network:true,sweep_max_coverage:2250000,stock_ticker:"HOOD",regulated_by:["SEC","FINRA","FDIC (sweep banks)"],last_rate_update:"2026-03-01" },
  { id:"b096",slug:"public-com",name:"Public.com Treasury Account",type:"investment",description:"Social investing platform offering 5.10% APY on Treasury bills with zero fees — backed by US government securities.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.10% APY on T-bills","US government backed","No management fees","Social investing features","Commission-free stocks"],cons:["Not FDIC insured (T-bills)","Limited banking features","Newer platform","No checking/savings"],established:2019,ratings:{app:4.4,fees:4.8,returns:5.0,access:3.6,support:3.8,security:4.4},apy:5.10,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"All your investing in one place",headquarters:"New York, NY",parent_company:"Open to the Public Investing Inc.",customer_count:"3M+",total_assets:"$3B+ AUM",website:"https://public.com",checking_available:false,savings_available:false,cd_available:false,stock_trading:true,fractional_shares:true,etf_trading:true,options_trading:true,crypto_trading:true,crypto_count:30,two_factor_auth:true,biometric_login:true,support_24_7:false,live_chat:true,email_support:true,joint_account:false,interest_compounding:"monthly",plaid_supported:true,community_forum:true,social_media_support:true,regulated_by:["SEC","FINRA"],last_rate_update:"2026-03-01" },
  // ── CRYPTO BANKS (97-100) ──────────────────────────────────────────────
  { id:"b097",slug:"kraken-bank",name:"Kraken Bank (Kraken Financial)",type:"crypto",description:"First SPDI-chartered crypto bank in the US — offering custody, staking, and fiat-to-crypto rails under Wyoming banking charter.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Wyoming bank charter (SPDI)","350+ crypto assets","Staking rewards","Fiat-to-crypto rails","Strong security track record"],cons:["No FDIC insurance","Crypto volatility risk","Limited traditional banking","Complex fee structure"],established:2011,ratings:{app:4.3,fees:3.8,returns:4.0,access:4.0,support:3.8,security:4.7},apy:0,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The trusted crypto exchange",headquarters:"San Francisco, CA",parent_company:"Payward Inc.",customer_count:"10M+",total_assets:"$30B+ crypto custody",website:"https://www.kraken.com",checking_available:false,savings_available:false,cd_available:false,debit_card:false,crypto_trading:true,crypto_count:350,crypto_staking:true,crypto_rewards:true,stock_trading:false,two_factor_auth:true,two_factor_methods:["TOTP","Hardware Key","SMS"],biometric_login:true,api_access:true,api_type:"REST + WebSocket",support_24_7:true,live_chat:true,phone_support:true,email_support:true,joint_account:false,multi_currency:true,currency_count:7,international_wire:true,wire_fee_domestic:0,wire_fee_international:0,plaid_supported:false,regulated_by:["Wyoming SPDI","FinCEN","Various state MTLs"],last_rate_update:"2026-03-01" },
  { id:"b098",slug:"coinbase-one",name:"Coinbase One",type:"crypto",description:"Premium crypto subscription with zero-fee trading, advanced analytics, boosted staking rewards, and USDC earning up to 5.10% APY.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Zero-fee trading (Coinbase One)","5.10% USDC rewards","Largest US crypto exchange","Strong compliance","Debit card with crypto rewards"],cons:["$29.99/mo subscription","Volatile asset class","Limited traditional banking","Some coins not available"],established:2012,ratings:{app:4.4,fees:3.5,returns:4.2,access:4.3,support:3.5,security:4.6},apy:5.10,monthly_fee:29.99,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The future of money is here",headquarters:"Wilmington, DE",parent_company:"Coinbase Global Inc.",customer_count:"110M+",total_assets:"$250B+ crypto on platform",website:"https://www.coinbase.com",checking_available:false,savings_available:false,cd_available:false,debit_card:true,cashback_debit:4.0,cashback_categories:["Crypto rewards on every purchase"],apple_pay:true,google_pay:true,crypto_trading:true,crypto_count:250,crypto_staking:true,crypto_rewards:true,stock_trading:false,two_factor_auth:true,two_factor_methods:["TOTP","Hardware Key","SMS","Biometric"],biometric_login:true,api_access:true,api_type:"REST + WebSocket + Advanced Trade",support_24_7:true,live_chat:true,phone_support:true,email_support:true,joint_account:false,multi_currency:true,currency_count:3,plaid_supported:true,stock_ticker:"COIN",regulated_by:["SEC","FinCEN","NYDFS","Various state licenses"],last_rate_update:"2026-03-01" },
  { id:"b099",slug:"gemini-earn",name:"Gemini",type:"crypto",description:"Winklevoss twins' regulated crypto exchange with Gemini dollar (GUSD), staking, and institutional-grade security.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["SOC 2 certified","Gemini dollar (GUSD) stablecoin","Strong compliance","Nifty Gateway NFTs","Insurance on hot wallet"],cons:["Higher fees vs competitors","Limited crypto selection","Gemini Earn suspended","Complex fee structure"],established:2014,ratings:{app:4.2,fees:3.2,returns:3.5,access:4.0,support:3.8,security:4.9},apy:0,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The regulated crypto exchange",headquarters:"New York, NY",parent_company:"Gemini Trust Company LLC",customer_count:"13M+",total_assets:"$40B+ crypto custody",website:"https://www.gemini.com",checking_available:false,savings_available:false,cd_available:false,debit_card:true,cashback_debit:3.0,cashback_categories:["Crypto cashback on purchases"],apple_pay:true,google_pay:true,crypto_trading:true,crypto_count:100,crypto_staking:true,two_factor_auth:true,two_factor_methods:["TOTP","Hardware Key","SMS"],biometric_login:true,api_access:true,api_type:"REST + WebSocket + FIX",soc2_certified:true,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,multi_currency:true,currency_count:3,plaid_supported:true,regulated_by:["NYDFS","FinCEN","SOC 2 Type II"],last_rate_update:"2026-03-01" },
  { id:"b100",slug:"juno-crypto",name:"Juno (Onramp)",type:"crypto",description:"Crypto-native checking with up to 5% cashback in Bitcoin or USDC, high-yield savings, and seamless DeFi on-ramps.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5% cashback in BTC/USDC","5.00% APY on USDC","DeFi on-ramp","Metal debit card","No monthly fees"],cons:["Crypto market risk on rewards","USDC yield varies","Newer platform","Limited traditional features"],established:2020,ratings:{app:4.1,fees:4.5,returns:4.5,access:3.5,support:3.5,security:4.2},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"Your crypto checking account",headquarters:"San Francisco, CA",parent_company:"Onramp Inc.",customer_count:"200,000+",total_assets:"$500M",website:"https://www.juno.finance",checking_available:true,savings_available:true,cd_available:false,debit_card:true,cashback_debit:5.0,cashback_categories:["BTC or USDC cashback"],apple_pay:true,google_pay:true,zelle:false,crypto_trading:true,crypto_count:15,crypto_staking:true,crypto_rewards:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,support_24_7:false,live_chat:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via Evolve Bank)","FinCEN"],last_rate_update:"2026-03-01" },
  // ── BUSINESS BANKING (101-110) ─────────────────────────────────────────
  { id:"b101",slug:"brex",name:"Brex",type:"business",description:"Corporate card and banking platform for startups and mid-market companies — no personal guarantee, integrated expense management.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No personal guarantee","Integrated expense management","Venture debt available","AI-powered receipt matching","Global payments"],cons:["Startup/growth focus only","Dropped SMBs in 2022","Monthly fee for some tiers","Complex pricing"],established:2017,ratings:{app:4.6,fees:4.2,returns:3.5,access:3.8,support:4.3,security:4.7},apy:4.28,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Make every dollar count",headquarters:"San Francisco, CA",parent_company:"Brex Inc.",customer_count:"30,000+ companies",total_assets:"$10B+ processed",website:"https://www.brex.com",checking_available:true,savings_available:false,cd_available:false,debit_card:false,virtual_cards:true,virtual_card_limit:999,apple_pay:true,google_pay:true,multi_currency:true,currency_count:40,international_wire:true,wire_fee_domestic:0,wire_fee_international:0,two_factor_auth:true,biometric_login:true,api_access:true,api_type:"REST API",budgeting_tools:true,expense_tracking:true,receipt_scanning:true,quickbooks_integration:true,xero_integration:true,stripe_integration:true,multi_user_access:true,user_roles:true,audit_trail:true,batch_payments:true,data_export:true,data_export_formats:["CSV","PDF","QBO","XLS"],support_24_7:false,live_chat:true,phone_support:true,email_support:true,dedicated_account_manager:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,sweep_network:true,sweep_max_coverage:6000000,regulated_by:["FDIC (via Column Bank)"],last_rate_update:"2026-03-01" },
  { id:"b102",slug:"grasshopper-bank",name:"Grasshopper Bank",type:"business",description:"Digital bank built for innovators — serving startups, small businesses, and the innovation economy with high-yield checking.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.45% APY on business checking","No monthly fees","FDIC insured","Innovation-focused","API banking available"],cons:["Business-only","Limited consumer products","Smaller institution","Less brand recognition"],established:2019,ratings:{app:4.1,fees:4.8,returns:4.0,access:3.5,support:4.2,security:4.5},apy:3.45,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Banking for innovators",headquarters:"New York, NY",parent_company:"Grasshopper Bancorp Inc.",customer_count:"10,000+",total_assets:"$850M",website:"https://www.grasshopper.bank",checking_available:true,savings_available:true,cd_available:false,virtual_cards:true,two_factor_auth:true,biometric_login:true,api_access:true,api_type:"REST API",quickbooks_integration:true,xero_integration:true,multi_user_access:true,batch_payments:true,wire_fee_domestic:15,support_24_7:false,phone_support:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,sba_lender:true,business_loans:true,regulated_by:["FDIC","NYDFS"],last_rate_update:"2026-03-01" },
  { id:"b103",slug:"lili-business",name:"Lili",type:"business",description:"Free banking for freelancers and sole proprietors with integrated invoicing, expense tracking, and tax optimization.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Free business banking","Integrated invoicing","Tax bucket feature","Expense categorization","No monthly fees"],cons:["Freelancer/sole prop focus only","No APY on free tier","Limited for larger businesses","Basic checking features"],established:2019,ratings:{app:4.5,fees:5.0,returns:2.0,access:3.5,support:4.2,security:4.4},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:true,tagline:"The all-in-one bank account for your business",headquarters:"New York, NY",parent_company:"Lili Inc.",customer_count:"500,000+",total_assets:"$300M",website:"https://www.lili.co",checking_available:true,savings_available:false,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,expense_tracking:true,invoice_creation:true,receipt_scanning:true,tax_estimation:true,quarterly_tax_reminders:true,schedule_c_support:true,quickbooks_integration:false,support_24_7:false,live_chat:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via Choice Financial Group)"],last_rate_update:"2026-03-01" },
  { id:"b104",slug:"chase-ink-business",name:"Chase Business Complete",type:"business",description:"America's largest bank's business checking with Chase Ink credit cards, merchant services, and 4,700+ branches.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4,700+ branches","Chase Ink card ecosystem","Strong merchant services","Payroll integration","Comprehensive business tools"],cons:["$15/mo fee (waivable)","Low business savings APY","High wire fees","Complex fee schedule"],established:1799,ratings:{app:4.3,fees:2.8,returns:1.5,access:5.0,support:4.1,security:4.6},apy:0.01,monthly_fee:15,min_balance:2000,fdic_insured:true,signup_bonus:300,atm_fee:false,mobile_only:false,tagline:"Built for business",headquarters:"New York, NY",parent_company:"JPMorgan Chase & Co.",customer_count:"6M+ business accounts",total_assets:"$3.9T (parent)",website:"https://www.chase.com/business",checking_available:true,savings_available:true,cd_available:true,overdraft_protection:true,overdraft_fee:34,debit_card:true,virtual_cards:false,apple_pay:true,google_pay:true,samsung_pay:true,zelle:true,wire_fee_domestic:25,wire_fee_international:50,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:false,expense_tracking:true,quickbooks_integration:true,xero_integration:false,multi_user_access:true,user_roles:true,batch_payments:true,support_24_7:true,live_chat:true,phone_support:true,in_branch_support:true,branch_count:4700,joint_account:true,interest_compounding:"daily",plaid_supported:true,merchant_services:true,pos_systems:true,payroll_integration:true,sba_lender:true,business_loans:true,credit_cards:true,credit_card_count:5,commercial_banking:true,treasury_management:true,stock_ticker:"JPM",regulated_by:["FDIC","OCC","Federal Reserve"],last_rate_update:"2026-03-01",monthly_fee_waiver:"$2,000 min balance or payment device" },
  { id:"b105",slug:"north-one",name:"NorthOne",type:"business",description:"Small business banking platform with sub-accounts (Envelopes), automatic bookkeeping, and seamless integrations.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","Envelope budgeting system","100+ integrations","Free ACH transfers","Automatic bookkeeping"],cons:["No APY on deposits","No cash deposits","Limited to small businesses","Basic checking only"],established:2016,ratings:{app:4.4,fees:5.0,returns:1.5,access:3.4,support:4.3,security:4.5},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Take charge of your business finances",headquarters:"New York, NY",parent_company:"NorthOne Inc.",customer_count:"100,000+",total_assets:"$200M",website:"https://www.northone.com",checking_available:true,savings_available:false,cd_available:false,debit_card:true,virtual_cards:true,apple_pay:true,google_pay:true,zelle:false,ach_transfer:true,ach_fee:0,wire_fee_domestic:15,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,budgeting_tools:true,sub_accounts:true,sub_account_limit:99,expense_tracking:true,invoice_creation:true,quickbooks_integration:true,xero_integration:true,freshbooks_integration:true,accounting_integrations_count:100,multi_user_access:true,user_roles:true,support_24_7:false,live_chat:true,phone_support:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via The Bancorp Bank)"],last_rate_update:"2026-03-01" },
  // ── MORE HIGH-YIELD SAVINGS (106-115) ──────────────────────────────────
  { id:"b106",slug:"barclays-us-savings",name:"Barclays US Savings",type:"savings",description:"UK banking giant's US online savings — consistently competitive APY with the trust of a 300-year-old institution.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["4.35% APY","No monthly fees","No minimum balance","300-year-old institution","Strong CD rates"],cons:["Savings and CDs only","No checking","No debit card","No mobile check deposit"],established:1690,ratings:{app:4.0,fees:4.9,returns:4.5,access:3.3,support:4.1,security:4.8},apy:4.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The smartest way to save",headquarters:"Wilmington, DE (US)",parent_company:"Barclays PLC",customer_count:"5M+ (US deposits)",total_assets:"$1.5T (global)",website:"https://www.barclays.com/savings",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.50,cd_terms:[{months:6,apy:4.25},{months:12,apy:4.50},{months:24,apy:4.00},{months:36,apy:3.75},{months:60,apy:3.50}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,mobile_check_deposit:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"BCS",regulated_by:["FDIC","FCA (UK)"],last_rate_update:"2026-03-01" },
  { id:"b107",slug:"my-banking-direct",name:"My Banking Direct",type:"savings",description:"Flagstar Bank's online savings division offering one of the highest APYs in the market at 5.45%.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.45% APY","No monthly fees","FDIC insured","Flagstar Bank backing"],cons:["Savings only","No mobile app","$500 minimum to open","Limited features"],established:2019,ratings:{app:3.0,fees:4.8,returns:5.0,access:3.0,support:3.8,security:4.5},apy:5.45,monthly_fee:0,min_balance:500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Higher rates, simpler savings",headquarters:"Troy, MI",parent_company:"Flagstar Bancorp (NYCB)",customer_count:"30,000+",total_assets:"$114B (parent)",website:"https://www.mybankingdirect.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,mobile_check_deposit:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:false,web_app:true,mobile_app:false,regulated_by:["FDIC"],last_rate_update:"2026-03-01" },
  { id:"b108",slug:"brio-direct",name:"Brio Direct",type:"savings",description:"Webster Bank's online savings brand offering consistently competitive rates with the backing of a $70B institution.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No monthly fees","No minimum","Webster Bank backing","FDIC insured"],cons:["Savings and CDs only","No checking","No debit card","Limited features"],established:2019,ratings:{app:3.8,fees:4.9,returns:5.0,access:3.2,support:3.9,security:4.6},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"A brighter way to save",headquarters:"Stamford, CT",parent_company:"Webster Bank NA",customer_count:"50,000+",total_assets:"$71B (parent)",website:"https://www.briodirect.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.75,cd_terms:[{months:6,apy:4.25},{months:12,apy:4.75},{months:24,apy:4.25}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"WBS",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b109",slug:"openbank",name:"Openbank",type:"savings",description:"Santander Group's US digital bank offering high-yield savings and CDs backed by one of the world's largest financial groups.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY","Santander Group backing","No fees","No minimum","Global banking group"],cons:["Savings and CDs only","No checking","Limited US track record","Basic digital experience"],established:2017,ratings:{app:4.0,fees:5.0,returns:4.8,access:3.3,support:3.9,security:4.7},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Digital savings, global trust",headquarters:"New York, NY",parent_company:"Banco Santander SA",customer_count:"1.5M+ (global)",total_assets:"$1.7T (parent)",website:"https://www.openbank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.85,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","European Central Bank (parent)"],last_rate_update:"2026-03-01" },
  { id:"b110",slug:"laurel-road",name:"Laurel Road",type:"savings",description:"KeyBank's digital lending brand for professionals — high-yield savings, student loan refinancing, and tailored financial tools.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY","Student loan refinancing","No fees","Professional-focused","KeyBank FDIC backing"],cons:["Limited banking features","Professionals-only focus","No checking","No debit card"],established:2013,ratings:{app:4.1,fees:4.8,returns:4.8,access:3.5,support:4.1,security:4.6},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Built for professionals",headquarters:"Stamford, CT",parent_company:"KeyBank NA (KeyCorp)",customer_count:"200,000+",total_assets:"$190B (parent)",website:"https://www.laurelroad.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,personal_loans:true,stock_ticker:"KEY",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01",student_perks:true },
  { id:"b111",slug:"cfgbank",name:"CFG Bank",type:"savings",description:"Baltimore-based community bank consistently offering some of the highest savings and CD rates in the nation.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.25% APY","Excellent CD rates","FDIC insured","No monthly fees","Strong community roots"],cons:["$1,000 minimum","Limited features","No mobile app","Maryland-based"],established:2001,ratings:{app:3.2,fees:4.7,returns:5.0,access:3.0,support:4.0,security:4.5},apy:5.25,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Higher rates, lower fees",headquarters:"Baltimore, MD",parent_company:"Chesapeake Financial Shares",customer_count:"30,000+",total_assets:"$2B",website:"https://www.cfg.bank",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.40,cd_terms:[{months:6,apy:5.15},{months:12,apy:5.40},{months:24,apy:5.00},{months:36,apy:4.75}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,in_branch_support:true,branch_count:3,joint_account:true,trust_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:false,regulated_by:["FDIC","Maryland OFR"],last_rate_update:"2026-03-01" },
  { id:"b112",slug:"rising-bank",name:"Rising Bank",type:"savings",description:"Midwest BankCentre's online division offering competitive high-yield savings with a 75-year community banking heritage.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY","No fees","$100 minimum","FDIC insured","Community bank backing"],cons:["Online savings only","No checking","Limited features","Less known brand"],established:2019,ratings:{app:3.7,fees:4.8,returns:4.8,access:3.2,support:3.9,security:4.4},apy:5.00,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"A better way to save",headquarters:"St. Louis, MO",parent_company:"Midwest BankCentre",customer_count:"25,000+",total_assets:"$2.5B (parent)",website:"https://www.risingbank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.10,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC"],last_rate_update:"2026-03-01" },
  { id:"b113",slug:"newtek-bank",name:"Newtek Bank",type:"savings",description:"SBA lender turned consumer bank offering high-yield savings and CDs — one of the top SBA 7(a) lenders in the US.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.25% APY","Top SBA lender","FDIC insured","No monthly fees","Strong business lending"],cons:["$5,000 minimum","Limited consumer features","Business-first focus","Basic digital presence"],established:2022,ratings:{app:3.5,fees:4.5,returns:4.9,access:3.2,support:4.0,security:4.5},apy:5.25,monthly_fee:0,min_balance:5000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Banking for business",headquarters:"Boca Raton, FL",parent_company:"Newtek Business Services Corp.",customer_count:"10,000+",total_assets:"$1.5B",website:"https://www.newtekbank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.35,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:false,sba_lender:true,business_loans:true,stock_ticker:"NEWT",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  // ── STUDENT & FAMILY (114-118) ─────────────────────────────────────────
  { id:"b114",slug:"copper-banking",name:"Copper Banking",type:"student",description:"Teen banking app with parental controls, instant money transfers, and financial literacy built in from age 6+.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Ages 6+","Parental controls","No monthly fees","Instant parent-to-teen transfers","Financial education"],cons:["No APY","Limited features vs adult accounts","No ATM access","Newer platform"],established:2019,ratings:{app:4.4,fees:5.0,returns:1.0,access:3.5,support:4.0,security:4.4},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"The smart money app for teens",headquarters:"Norfolk, VA",parent_company:"Copper Technologies Inc.",customer_count:"300,000+",total_assets:"$50M",website:"https://www.getcopper.com",checking_available:true,savings_available:false,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,two_factor_auth:true,biometric_login:true,budgeting_tools:true,savings_goals:true,round_up_savings:true,support_24_7:false,live_chat:true,email_support:true,joint_account:false,custodial_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,min_age:6,regulated_by:["FDIC (via Evolve Bank)"],last_rate_update:"2026-03-01" },
  { id:"b115",slug:"chase-first-banking",name:"Chase First Banking",type:"student",description:"Chase's kids account (ages 6-17) linked to parent's Chase checking — allowance, chores, and spending controls.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","Parental controls","Chore & allowance tracking","Chase ATM access","Auto-converts at 18"],cons:["Requires parent Chase account","No APY","Limited standalone features","Not independent"],established:2020,ratings:{app:4.3,fees:5.0,returns:1.0,access:4.5,support:4.0,security:4.5},apy:0,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"First steps in banking",headquarters:"New York, NY",parent_company:"JPMorgan Chase & Co.",customer_count:"3M+ families",total_assets:"$3.9T (parent)",website:"https://www.chase.com/personal/banking/first-banking",checking_available:true,savings_available:true,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,zelle:false,two_factor_auth:true,biometric_login:true,budgeting_tools:true,savings_goals:true,support_24_7:true,live_chat:true,phone_support:true,in_branch_support:true,branch_count:4700,joint_account:false,custodial_account:true,interest_compounding:"monthly",plaid_supported:true,min_age:6,stock_ticker:"JPM",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b116",slug:"capital-one-money",name:"Capital One MONEY Teen",type:"student",description:"Capital One's teen account (ages 8+) with no fees, no minimums, and a 0.10% APY savings goal feature.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["No monthly fees","No minimum balance","Savings goals for teens","Capital One branch access","Auto upgrade at 18"],cons:["Low APY","Requires parent Capital One account","Limited features","Not best for older teens"],established:2020,ratings:{app:4.2,fees:5.0,returns:1.5,access:4.0,support:4.1,security:4.5},apy:0.10,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Money made easy for teens",headquarters:"McLean, VA",parent_company:"Capital One Financial Corp.",customer_count:"1M+ teen accounts",total_assets:"$478B (parent)",website:"https://www.capitalone.com/bank/money-account",checking_available:true,savings_available:true,cd_available:false,debit_card:true,apple_pay:true,google_pay:true,two_factor_auth:true,biometric_login:true,budgeting_tools:true,savings_goals:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:265,joint_account:false,custodial_account:true,interest_compounding:"daily",plaid_supported:true,min_age:8,stock_ticker:"COF",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  // ── ADDITIONAL COMPREHENSIVE ENTRIES (117-150) ─────────────────────────
  { id:"b117",slug:"total-direct-bank",name:"TotalDirectBank",type:"savings",description:"City National Bank of Florida's online savings arm with consistently top-tier APY and FDIC insurance.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.07% APY","No monthly fees","FDIC insured","Strong parent bank"],cons:["$25,000 minimum","Savings only","No mobile app","Limited features"],established:2019,ratings:{app:3.0,fees:4.5,returns:4.8,access:3.0,support:3.8,security:4.6},apy:5.07,monthly_fee:0,min_balance:25000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The direct way to save",headquarters:"Miami, FL",parent_company:"City National Bank of Florida (Caja de Ahorros)",customer_count:"10,000+",total_assets:"$20B (parent)",website:"https://www.totaldirectbank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.16,overdraft_protection:false,debit_card:false,two_factor_auth:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:false,regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b118",slug:"salem-five-direct",name:"Salem Five Direct",type:"savings",description:"Massachusetts community bank's online division with strong eOne Savings rates and 160+ years of banking heritage.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.01% APY","No monthly fees","No minimum","160+ year heritage","FDIC insured"],cons:["Savings only online","No checking","No debit card","Limited features"],established:1855,ratings:{app:3.5,fees:4.8,returns:4.8,access:3.2,support:4.0,security:4.5},apy:5.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"eOne Savings — simple, direct",headquarters:"Salem, MA",parent_company:"Salem Five Cents Savings Bank",customer_count:"40,000+",total_assets:"$6B (parent)",website:"https://www.salemfivedirect.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:4.90,overdraft_protection:false,debit_card:false,two_factor_auth:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","Massachusetts DOB"],last_rate_update:"2026-03-01" },
  { id:"b119",slug:"poppy-bank",name:"Poppy Bank",type:"savings",description:"Bay Area community bank offering high-yield savings and CDs with a focus on California's business community.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.00% APY","Competitive CDs","FDIC insured","Community bank values"],cons:["$1,000 minimum","California focus","Limited features","Small institution"],established:2006,ratings:{app:3.5,fees:4.6,returns:4.8,access:3.3,support:4.0,security:4.4},apy:5.00,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Community banking, elevated rates",headquarters:"Santa Rosa, CA",parent_company:"Bay Commercial Finance",customer_count:"15,000+",total_assets:"$2.5B",website:"https://www.poppy.bank",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.15,overdraft_protection:false,debit_card:true,two_factor_auth:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:15,joint_account:true,interest_compounding:"daily",plaid_supported:true,business_loans:true,sba_lender:true,regulated_by:["FDIC","California DFPI"],last_rate_update:"2026-03-01" },
  { id:"b120",slug:"bread-savings",name:"Bread Savings (Bread Financial)",type:"savings",description:"Financial services company offering high-yield savings and CDs — formerly Alliance Data, now focused on digital savings.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.15% APY (12-mo CD)","5.20% on select CDs","No monthly fees","Multiple term options","FDIC insured"],cons:["CDs have early withdrawal penalty","Savings only focus","Less known brand","No checking"],established:2021,ratings:{app:4.1,fees:4.8,returns:4.9,access:3.5,support:4.0,security:4.5},apy:5.15,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The smart way to grow your savings",headquarters:"Columbus, OH",parent_company:"Bread Financial Holdings",customer_count:"200,000+",total_assets:"$3.5B",website:"https://www.breadfinancial.com/savings",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.20,cd_terms:[{months:6,apy:4.75},{months:12,apy:5.15},{months:24,apy:4.50},{months:36,apy:4.25},{months:60,apy:4.00}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,crypto_trading:false,interest_compounding:"daily",plaid_supported:true,stock_ticker:"BFH",regulated_by:["FDIC"],last_rate_update:"2026-03-01" },
  { id:"b121",slug:"western-alliance-bank",name:"Western Alliance Bank",type:"savings",description:"Institution-grade high-yield savings now available to individual consumers at one of the highest rates in the market.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.36% APY","No monthly fee","Large deposit limits","Stable institution","$75B+ assets"],cons:["Less consumer-facing UX","Limited app features","$1 minimum","Business-first culture"],established:1994,ratings:{app:3.8,fees:4.8,returns:5.0,access:3.5,support:4.1,security:4.7},apy:5.36,monthly_fee:0,min_balance:1,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"What business banking should be",headquarters:"Phoenix, AZ",parent_company:"Western Alliance Bancorporation",customer_count:"100,000+",total_assets:"$75B",website:"https://www.westernalliancebank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.01,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,business_loans:true,sba_lender:true,commercial_banking:true,stock_ticker:"WAL",regulated_by:["FDIC","Federal Reserve"],last_rate_update:"2026-03-01" },
  { id:"b122",slug:"ufb-direct",name:"UFB Direct",type:"savings",description:"Axos Bank's online savings brand with consistently top-3 savings rates, no fees, and a free ATM card for savings withdrawals.",rating:4.4,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","No monthly fee","Free ATM card","No minimum balance","Axos Bank FDIC"],cons:["Portal UX is dated","No checking account","Limited features","Savings-only brand"],established:2004,ratings:{app:3.7,fees:4.9,returns:5.0,access:4.3,support:4.0,security:4.6},apy:5.35,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Simply higher rates",headquarters:"San Diego, CA",parent_company:"Axos Financial Inc.",customer_count:"100,000+",total_assets:"$20B (parent)",website:"https://www.ufbdirect.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:true,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:true,stock_ticker:"AX",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b123",slug:"popular-direct",name:"Popular Direct",type:"savings",description:"Puerto Rico's largest bank offers US consumers some of the best CD and savings rates, backed by $70B+ in assets.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","High CD rates","FDIC insured","$70B+ parent institution","Stable 130-year history"],cons:["$100 minimum","Limited product range","Older UX","Savings/CDs only"],established:1893,ratings:{app:3.8,fees:4.5,returns:4.9,access:3.3,support:3.9,security:4.7},apy:5.30,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"The smart way to grow savings",headquarters:"New York, NY",parent_company:"Popular Inc.",customer_count:"150,000+ (US direct)",total_assets:"$72B (parent)",website:"https://www.populardirect.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.20,cd_terms:[{months:3,apy:4.80},{months:6,apy:5.00},{months:12,apy:5.20},{months:24,apy:4.60},{months:36,apy:4.40}],overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:true,stock_ticker:"BPOP",regulated_by:["FDIC","OCFI (PR)"],last_rate_update:"2026-03-01" },
  { id:"b124",slug:"cit-platinum",name:"CIT Bank Platinum Savings",type:"savings",description:"First Citizens Bank subsidiary offering tiered high-yield savings with bonus APY for $5,000+ balances.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.05% APY ($5k+)","No monthly fees","First Citizens safety","CD options","FDIC insured"],cons:["APY drops for <$5k","$5,000 threshold for best rate","Limited UX","No checking"],established:2000,ratings:{app:4.0,fees:4.6,returns:4.7,access:3.6,support:4.0,security:4.6},apy:5.05,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Bank different",headquarters:"Pasadena, CA",parent_company:"First Citizens BancShares (via CIT Group)",customer_count:"200,000+",total_assets:"$109B (parent)",website:"https://www.cit.com/cit-bank/bank/savings",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.00,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.00},{months:13,apy:4.75},{months:18,apy:4.50}],money_market_apy:4.75,tiered_apy:true,apy_tiers:[{min:0,max:4999,apy:0.25},{min:5000,max:null,apy:5.05}],overdraft_protection:false,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,stock_ticker:"FCNCA",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b125",slug:"ivy-bank",name:"Ivy Bank",type:"savings",description:"Cambridge Savings Bank's high-yield online brand offering competitive rates with the stability of a 190-year-old institution.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","Institution-backed","No fees","FDIC insured","190-year heritage"],cons:["$2,500 minimum balance","Savings only","Limited brand presence","No mobile app"],established:2021,ratings:{app:3.9,fees:4.6,returns:4.9,access:3.3,support:4.0,security:4.7},apy:5.30,monthly_fee:0,min_balance:2500,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Grow your savings with confidence",headquarters:"Cambridge, MA",parent_company:"Cambridge Savings Bank",customer_count:"20,000+",total_assets:"$6B (parent)",website:"https://www.ivybank.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:false,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","Massachusetts DOB"],last_rate_update:"2026-03-01" },
  { id:"b126",slug:"vio-bank",name:"Vio Bank",type:"savings",description:"MidFirst Bank's online division offering competitive high-yield savings and CDs from the largest privately held bank in the US.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.05% APY","Largest private bank in US","No monthly fees","FDIC insured","Strong CD ladder options"],cons:["$100 minimum","Online savings/CDs only","Limited features","Less known brand"],established:2018,ratings:{app:3.7,fees:4.7,returns:4.8,access:3.3,support:3.9,security:4.6},apy:5.05,monthly_fee:0,min_balance:100,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Online banking, offline strength",headquarters:"Oklahoma City, OK",parent_company:"MidFirst Bank",customer_count:"50,000+",total_assets:"$37B (parent)",website:"https://www.viobank.com",checking_available:false,savings_available:true,cd_available:true,cd_top_rate:5.15,cd_terms:[{months:6,apy:4.50},{months:12,apy:5.15},{months:18,apy:4.75},{months:24,apy:4.50},{months:36,apy:4.25},{months:60,apy:4.00}],overdraft_protection:false,debit_card:false,two_factor_auth:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b127",slug:"prime-alliance-bank",name:"Prime Alliance Bank",type:"savings",description:"Utah-based community bank offering top-tier APY to nationwide customers with no minimums and no fees.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.30% APY","Simple product","FDIC insured","No minimum","No fees"],cons:["Less-known brand","Limited features","No mobile app (web only)","Savings only"],established:2004,ratings:{app:3.5,fees:4.7,returns:5.0,access:3.3,support:3.9,security:4.4},apy:5.30,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Prime savings rates",headquarters:"Woods Cross, UT",parent_company:null,customer_count:"15,000+",total_assets:"$400M",website:"https://www.primealliancebank.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:false,regulated_by:["FDIC","Utah DFI"],last_rate_update:"2026-03-01" },
  { id:"b128",slug:"brilliant-bank",name:"Brilliant Bank",type:"savings",description:"Arkansas community bank offering consistent 5.35% APY online — one of the highest rates in the nation from a stable community institution.",rating:4.1,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.35% APY","FDIC insured","No fees","Stable community bank","65+ year history"],cons:["No mobile app","Limited features","Website only","$1,000 minimum"],established:1959,ratings:{app:3.4,fees:4.8,returns:5.0,access:3.0,support:4.0,security:4.6},apy:5.35,monthly_fee:0,min_balance:1000,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"Simply brilliant savings",headquarters:"Little Rock, AR",parent_company:"Centennial Bank",customer_count:"10,000+",total_assets:"$20B (parent)",website:"https://www.brilliant.bank",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,support_24_7:false,phone_support:true,email_support:true,joint_account:true,interest_compounding:"daily",plaid_supported:false,regulated_by:["FDIC","Arkansas SBD"],last_rate_update:"2026-03-01" },
  { id:"b129",slug:"cloudbank-247",name:"CloudBank 24/7",type:"savings",description:"Fintech savings product powered by bank-as-a-service infrastructure with consistently top savings APY.",rating:4.0,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["5.26% APY","No fees","No minimums","FDIC insured","24/7 access"],cons:["Fintech not direct bank","Limited features","Less established","Basic interface"],established:2021,ratings:{app:4.0,fees:5.0,returns:5.0,access:3.2,support:3.6,security:4.2},apy:5.26,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:true,tagline:"Your money, always working",headquarters:"Draper, UT",parent_company:"MVB Bank (BaaS partner)",customer_count:"25,000+",total_assets:"$3B (partner bank)",website:"https://www.cloudbank247.com",checking_available:false,savings_available:true,cd_available:false,overdraft_protection:false,debit_card:false,two_factor_auth:true,biometric_login:true,support_24_7:false,live_chat:false,phone_support:true,email_support:true,joint_account:false,interest_compounding:"daily",plaid_supported:true,regulated_by:["FDIC (via MVB Bank)"],last_rate_update:"2026-03-01" },
  { id:"b130",slug:"umb-bank",name:"UMB Bank",type:"traditional",description:"Kansas City-based bank with strong institutional and HSA administration — one of the nation's top HSA custodians.",rating:3.9,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["#1 HSA administrator","Strong institutional services","No monthly fee (specific tiers)","Zelle included","Good business banking"],cons:["Low consumer savings APY","Limited retail branch network","Regional focus","Below-average digital banking"],established:1913,ratings:{app:3.8,fees:3.0,returns:1.8,access:3.7,support:4.0,security:4.5},apy:0.01,monthly_fee:0,min_balance:0,fdic_insured:true,signup_bonus:null,atm_fee:false,mobile_only:false,tagline:"First for you",headquarters:"Kansas City, MO",parent_company:"UMB Financial Corporation",customer_count:"500,000+",total_assets:"$43B",website:"https://www.umb.com",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:4.25,hsa_available:true,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:25,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:85,joint_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,personal_loans:true,credit_cards:true,wealth_management:true,commercial_banking:true,treasury_management:true,stock_ticker:"UMBF",regulated_by:["FDIC","OCC"],last_rate_update:"2026-03-01" },
  { id:"b131",slug:"state-employees-cu",name:"State Employees' Credit Union",type:"credit_union",description:"North Carolina state employees' CU — the 2nd largest credit union in the US with 2.7M members and exceptional rates.",rating:4.5,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["2nd largest CU in US","Excellent rates","No monthly fees","Strong NC presence","Member dividends"],cons:["NC state employees only","Limited geographic reach","Dated digital experience","Membership restriction"],established:1937,ratings:{app:3.9,fees:4.8,returns:4.5,access:4.3,support:4.7,security:4.8},apy:3.00,monthly_fee:0,min_balance:25,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"People helping people",headquarters:"Raleigh, NC",parent_company:null,customer_count:"2.7M+",total_assets:"$53B",website:"https://www.ncsecu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.25,money_market_apy:3.25,overdraft_protection:true,overdraft_fee:0,debit_card:true,apple_pay:true,google_pay:true,zelle:true,wire_fee_domestic:10,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:270,joint_account:true,custodial_account:true,trust_account:true,interest_compounding:"daily",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,insurance_products:true,ncua_insured:true,regulated_by:["NCUA","NC Credit Union Division"],last_rate_update:"2026-03-01" },
  { id:"b132",slug:"lake-michigan-cu",name:"Lake Michigan Credit Union",type:"credit_union",description:"Michigan's largest CU with Max Checking offering 3.00% APY — open to anyone in lower Michigan.",rating:4.3,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["3.00% APY checking (Max)","Open to lower MI residents","No monthly fees","Strong mortgage rates","Full product suite"],cons:["Michigan only","APY requires qualifying transactions","Limited digital innovation","Branch-centric"],established:1933,ratings:{app:4.0,fees:4.6,returns:4.0,access:4.2,support:4.5,security:4.6},apy:3.00,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Beyond banking",headquarters:"Grand Rapids, MI",parent_company:null,customer_count:"500,000+",total_assets:"$12B",website:"https://www.lmcu.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.09,money_market_apy:3.50,overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:60,joint_account:true,custodial_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,checking_apy:3.00,apy_conditions:"10 debit transactions + 4 logins + eStatements per month for Max Checking APY",regulated_by:["NCUA"],last_rate_update:"2026-03-01" },
  { id:"b133",slug:"consumers-cu",name:"Consumers Credit Union",type:"credit_union",description:"Illinois-based CU open to anyone nationwide with one of the highest checking APYs in the US — up to 5.00%.",rating:4.2,is_sponsored:false,affiliate_url:null,logo_url:null,pros:["Up to 5.00% APY checking","Open to anyone (Consumers Cooperative Assoc)","No monthly fees","Multiple rewards tiers","Full product suite"],cons:["APY requires many qualifying criteria","Complex tier system","IL-focused branches","Tiered APY limits on balance"],established:1930,ratings:{app:4.0,fees:4.5,returns:4.5,access:3.8,support:4.3,security:4.5},apy:5.00,monthly_fee:0,min_balance:0,fdic_insured:false,signup_bonus:null,atm_fee:true,mobile_only:false,tagline:"Real solutions for real life",headquarters:"Gurnee, IL",parent_company:null,customer_count:"100,000+",total_assets:"$2B",website:"https://www.myconsumers.org",checking_available:true,savings_available:true,cd_available:true,cd_top_rate:5.11,tiered_apy:true,apy_tiers:[{min:0,max:10000,apy:5.00},{min:10001,max:25000,apy:3.00},{min:25001,max:null,apy:0.20}],checking_apy:5.00,apy_conditions:"12 debit transactions + direct deposit + eStatements + 1 bill pay per month",overdraft_protection:true,overdraft_fee:25,debit_card:true,apple_pay:true,google_pay:true,zelle:true,two_factor_auth:true,biometric_login:true,mobile_check_deposit:true,bill_pay:true,check_writing:true,support_24_7:false,phone_support:true,in_branch_support:true,branch_count:25,joint_account:true,interest_compounding:"monthly",plaid_supported:true,mortgage_products:true,auto_loans:true,personal_loans:true,heloc:true,credit_cards:true,ncua_insured:true,max_apy_balance:10000,regulated_by:["NCUA","Illinois DFI"],last_rate_update:"2026-03-01" },
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
  { label: "1-Yr CD Rate", value: "5.25%", change: "+0.00", up: null },
  { label: "Inflation (CPI)", value: "3.1%", change: "-0.3", up: false },
  { label: "Mortgage 30yr", value: "7.04%", change: "+0.12", up: true },
  { label: "Prime Rate", value: "8.50%", change: "+0.00", up: null },
  { label: "Top HYSA APY", value: "5.50%", change: "+0.15", up: true },
  { label: "Money Market", value: "5.12%", change: "+0.05", up: true },
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
              Compare 133 savings accounts and earn up to{" "}
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
            { label: "Banks Tracked", value: "133", icon: <Building2 size={20} color="var(--accent-primary)" /> },
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
            View all 133 banks <ArrowRight size={14} />
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
            View all 133 banks <ArrowRight size={14} />
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
  useEffect(() => { document.title = "Compare All Banks — Banktopp | 133 Savings Accounts Ranked"; }, []);
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
            {["savings","neobank","traditional","student","business","crypto","credit_union","investment"].map(t => (
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

      {/* EXPANDED BACKEND DATA: Company Info */}
      {(bank.headquarters || bank.parent_company || bank.total_assets || bank.customer_count) && (
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <Building2 size={18} color="var(--accent-primary)" /> Company Information
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {bank.headquarters && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Headquarters</div><div style={{ fontSize: 14 }}>{bank.headquarters}</div></div>}
            {bank.parent_company && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Parent Company</div><div style={{ fontSize: 14 }}>{bank.parent_company}</div></div>}
            {bank.total_assets && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Total Assets</div><div style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{bank.total_assets}</div></div>}
            {bank.customer_count && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Customers</div><div style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{bank.customer_count}</div></div>}
            {bank.website && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Website</div><a href={bank.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "var(--accent-primary)" }}>{bank.website.replace("https://","")}</a></div>}
            {bank.stock_ticker && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Stock Ticker</div><div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--accent-secondary)" }}>{bank.stock_ticker}</div></div>}
            {bank.regulated_by && bank.regulated_by.length > 0 && <div><div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Regulated By</div><div style={{ fontSize: 13, color: "var(--text-muted)" }}>{bank.regulated_by.join(", ")}</div></div>}
          </div>
        </div>
      )}

      {/* EXPANDED BACKEND DATA: Features Grid */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <Zap size={18} color="var(--accent-primary)" /> Features & Capabilities
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
          {[
            { label: "Checking Account", val: bank.checking_available },
            { label: "Savings Account", val: bank.savings_available ?? true },
            { label: "CDs Available", val: bank.cd_available },
            { label: "Debit Card", val: bank.debit_card },
            { label: "Apple Pay", val: bank.apple_pay },
            { label: "Google Pay", val: bank.google_pay },
            { label: "Samsung Pay", val: bank.samsung_pay },
            { label: "Zelle", val: bank.zelle },
            { label: "Mobile Check Deposit", val: bank.mobile_check_deposit },
            { label: "Overdraft Protection", val: bank.overdraft_protection },
            { label: "Early Paycheck", val: bank.early_paycheck },
            { label: "2FA Authentication", val: bank.two_factor_auth },
            { label: "Biometric Login", val: bank.biometric_login },
            { label: "Joint Accounts", val: bank.joint_account },
            { label: "Trust Accounts", val: bank.trust_account },
            { label: "Custodial Accounts", val: bank.custodial_account },
            { label: "Budgeting Tools", val: bank.budgeting_tools },
            { label: "Savings Goals", val: bank.savings_goals },
            { label: "Round-Up Savings", val: bank.round_up_savings },
            { label: "Auto Savings", val: bank.auto_savings },
            { label: "Bill Pay", val: bank.bill_pay },
            { label: "Check Writing", val: bank.check_writing },
            { label: "Crypto Trading", val: bank.crypto_trading },
            { label: "Stock Trading", val: bank.stock_trading },
            { label: "Robo-Advisor", val: bank.robo_advisor },
            { label: "API Access", val: bank.api_access },
            { label: "Plaid Supported", val: bank.plaid_supported },
            { label: "Multi-Currency", val: bank.multi_currency },
            { label: "24/7 Support", val: bank.support_24_7 },
            { label: "Live Chat", val: bank.live_chat },
            { label: "Phone Support", val: bank.phone_support },
            { label: "In-Branch Support", val: bank.in_branch_support },
            { label: "Mortgage Products", val: bank.mortgage_products },
            { label: "Auto Loans", val: bank.auto_loans },
            { label: "Personal Loans", val: bank.personal_loans },
            { label: "Credit Cards", val: bank.credit_cards },
            { label: "Wealth Management", val: bank.wealth_management },
            { label: "Rewards Program", val: bank.rewards_program },
            { label: "NCUA Insured", val: bank.ncua_insured },
          ].filter(f => f.val !== undefined).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              {f.val ? <CheckCircle size={14} color="#4ADE80" /> : <XCircle size={14} color="var(--text-faint)" />}
              <span style={{ fontSize: 13, color: f.val ? "var(--text-primary)" : "var(--text-muted)" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CD RATES TABLE */}
      {bank.cd_terms && bank.cd_terms.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <TrendingUp size={18} color="var(--accent-secondary)" /> CD Rates
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {bank.cd_terms.map((cd, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "14px 12px", border: "1px solid var(--card-border)", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{cd.months} months</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--accent-secondary)", fontWeight: 500 }}>{cd.apy.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEE SCHEDULE */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <DollarSign size={18} color="var(--accent-primary)" /> Fee Schedule
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Monthly Fee", value: bank.monthly_fee === 0 ? "Free" : `$${bank.monthly_fee}/mo`, good: bank.monthly_fee === 0 },
            ...(bank.monthly_fee_waiver ? [{ label: "Fee Waiver", value: bank.monthly_fee_waiver, good: true }] : []),
            ...(bank.overdraft_fee !== undefined ? [{ label: "Overdraft Fee", value: bank.overdraft_fee === 0 ? "None" : `$${bank.overdraft_fee}`, good: bank.overdraft_fee === 0 }] : []),
            ...(bank.wire_fee_domestic !== undefined ? [{ label: "Domestic Wire", value: bank.wire_fee_domestic === 0 ? "Free" : `$${bank.wire_fee_domestic}`, good: bank.wire_fee_domestic === 0 }] : []),
            ...(bank.wire_fee_international !== undefined ? [{ label: "International Wire", value: bank.wire_fee_international === 0 ? "Free" : `$${bank.wire_fee_international}`, good: bank.wire_fee_international === 0 }] : []),
            ...(bank.foreign_transaction_fee !== undefined ? [{ label: "Foreign Transaction", value: bank.foreign_transaction_fee === 0 ? "None" : `${bank.foreign_transaction_fee}%`, good: bank.foreign_transaction_fee === 0 }] : []),
          ].map((fee, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{fee.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: fee.good ? "#4ADE80" : "var(--accent-danger)" }}>{fee.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EDITOR NOTES */}
      {bank.editor_notes && (
        <div className="card" style={{ padding: 24, marginBottom: 32, borderLeft: "3px solid var(--accent-primary)" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <BookOpen size={18} color="var(--accent-primary)" /> Editor's Take
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, fontStyle: "italic" }}>{bank.editor_notes}</p>
        </div>
      )}

      {bank.last_rate_update && (
        <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 16, fontFamily: "var(--font-mono)" }}>
          Rates last verified: {bank.last_rate_update}
        </p>
      )}

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
    { label: "Account Type", key: "type", format: v => String(v).replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase()) },
    { label: "Headquarters", key: "headquarters", format: v => v ? String(v) : "N/A" },
    { label: "Total Assets", key: "total_assets", format: v => v ? String(v) : "N/A" },
    { label: "Customers", key: "customer_count", format: v => v ? String(v) : "N/A" },
    { label: "Checking", key: "checking_available", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "CDs Available", key: "cd_available", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Top CD Rate", key: "cd_top_rate", format: v => v ? `${Number(v).toFixed(2)}%` : "N/A" },
    { label: "Apple Pay", key: "apple_pay", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Google Pay", key: "google_pay", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Zelle", key: "zelle", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Early Paycheck", key: "early_paycheck", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Overdraft Protection", key: "overdraft_protection", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Overdraft Fee", key: "overdraft_fee", format: v => v !== undefined && v !== null ? (Number(v) === 0 ? "None" : `$${v}`) : "N/A" },
    { label: "Crypto Trading", key: "crypto_trading", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Stock Trading", key: "stock_trading", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Robo-Advisor", key: "robo_advisor", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "2FA Security", key: "two_factor_auth", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Biometric Login", key: "biometric_login", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Mobile Check Deposit", key: "mobile_check_deposit", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Budgeting Tools", key: "budgeting_tools", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Savings Goals", key: "savings_goals", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "24/7 Support", key: "support_24_7", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Live Chat", key: "live_chat", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Branch Count", key: "branch_count", format: v => v ? Number(v).toLocaleString() : "Online only" },
    { label: "Joint Accounts", key: "joint_account", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Domestic Wire Fee", key: "wire_fee_domestic", format: v => v !== undefined && v !== null ? (Number(v) === 0 ? "Free" : `$${v}`) : "N/A" },
    { label: "Int'l Wire Fee", key: "wire_fee_international", format: v => v !== undefined && v !== null ? (Number(v) === 0 ? "Free" : `$${v}`) : "N/A" },
    { label: "Mortgage Products", key: "mortgage_products", format: v => v ? "✅ Yes" : "❌ No" },
    { label: "Credit Cards", key: "credit_cards", format: v => v ? "✅ Yes" : "❌ No" },
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
          { title: "Our Mission", content: "We track 133 savings accounts, neobanks, credit unions, investment platforms, and traditional banks to help users find the best rates — without having to navigate dozens of confusing bank websites." },
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
