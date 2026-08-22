import { store } from '../db/mock_store';
import { BusinessCategory } from '../db/types';

export interface SuitableSKU {
  name: string;
  sku: string;
  price: number;
  reason: string;
}

export interface OnlineChannelRecommendation {
  channel_id: string;
  channel_name: string;
  channel_type: 'Government Open Network' | 'Hyperlocal Quick Commerce' | 'Direct-to-Consumer (0% Fee)' | 'National Marketplace' | 'B2B Wholesale Network';
  fit_score_pct: number;
  commission_structure: string;
  setup_time: string;
  estimated_monthly_revenue_uplift: string;
  key_advantage: string;
  suitable_skus: SuitableSKU[];
  action_steps: string[];
  is_primary_recommendation: boolean;
}

export function getOnlineChannelRecommendations(businessId: string): {
  business_id: string;
  business_name: string;
  category: BusinessCategory;
  generated_at: string;
  total_potential_monthly_uplift: string;
  channels: OnlineChannelRecommendation[];
} {
  store.ensureInitialized();
  const business = store.businesses.find(b => b.id === businessId) || {
    id: businessId,
    name: "Rukmini's Kirana & General Store",
    category: 'retail' as BusinessCategory,
  };

  const products = store.products.filter(p => p.business_id === businessId && p.active);

  const stapleSKUs: SuitableSKU[] = products
    .filter(p => p.category.includes('Staple') || p.sku.includes('RICE') || p.sku.includes('ATTA') || p.sku.includes('DAL'))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      sku: p.sku,
      price: p.selling_price,
      reason: 'High daily household demand with repeat weekly reordering.',
    }));

  const packagedSKUs: SuitableSKU[] = products
    .filter(p => p.category.includes('Oil') || p.category.includes('Spices') || p.sku.includes('OIL') || p.sku.includes('SPICE'))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      sku: p.sku,
      price: p.selling_price,
      reason: 'Standardized sealed packaging ideal for quick rider delivery without leakage.',
    }));

  const gourmetSKUs: SuitableSKU[] = products
    .filter(p => p.selling_price >= 250 || p.sku.includes('ROYAL') || p.sku.includes('GIFT') || p.sku.includes('TEA'))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      sku: p.sku,
      price: p.selling_price,
      reason: 'High-value ticket item with strong contribution margins justifying national shipping.',
    }));

  let channels: OnlineChannelRecommendation[] = [];

  if (business.category === 'retail') {
    channels = [
      {
        channel_id: 'ondc_network',
        channel_name: 'ONDC (Open Network for Digital Commerce)',
        channel_type: 'Government Open Network',
        fit_score_pct: 96,
        commission_structure: '0% Network Commission (Unbundled protocol)',
        setup_time: '24–48 Hours',
        estimated_monthly_revenue_uplift: '+₹45,000 – ₹80,000 / mo',
        key_advantage: 'Get discovered on buyer apps like Paytm, Magicpin, and Mystore across your 5km radius without paying 20-30% aggregator commissions.',
        suitable_skus: stapleSKUs.length > 0 ? stapleSKUs : packagedSKUs,
        action_steps: [
          'Register on an ONDC Seller Network Participant app (e.g., Mystore Seller or Magicpin Partner)',
          'Link your GSTIN / Udyam and bank account for automated daily settlements',
          'Upload your existing 15 product SKUs with local inventory stock counts',
        ],
        is_primary_recommendation: true,
      },
      {
        channel_id: 'whatsapp_storefront',
        channel_name: 'WhatsApp Business Direct Catalog & UPI',
        channel_type: 'Direct-to-Consumer (0% Fee)',
        fit_score_pct: 94,
        commission_structure: '0% Platform Fee (Direct UPI / QR settlements)',
        setup_time: 'Instant (Under 2 Hours)',
        estimated_monthly_revenue_uplift: '+₹30,000 – ₹55,000 / mo',
        key_advantage: 'Send weekly broadcast catalogs to existing neighborhood customer contacts for automated one-tap UPI reordering.',
        suitable_skus: packagedSKUs.length > 0 ? packagedSKUs : stapleSKUs,
        action_steps: [
          'Enable WhatsApp Business Catalog and upload 10 fastest-moving groceries',
          'Print your WhatsApp QR ordering banner at your store counter',
          'Automate order confirmation and digital billing receipts',
        ],
        is_primary_recommendation: true,
      },
      {
        channel_id: 'quick_commerce',
        channel_name: 'Quick Commerce Local Partner (Blinkit / Zepto / Swiggy Minis)',
        channel_type: 'Hyperlocal Quick Commerce',
        fit_score_pct: 88,
        commission_structure: '8% – 14% per completed order',
        setup_time: '3–5 Business Days',
        estimated_monthly_revenue_uplift: '+₹60,000 – ₹1,10,000 / mo',
        key_advantage: 'Deliver orders within 15–30 minutes through third-party rider networks to modern apartment clusters near your store.',
        suitable_skus: packagedSKUs,
        action_steps: [
          'Apply through Quick Commerce Partner onboarding portals with FSSAI license',
          'Dedicate a shelf area in store for fast rider pickups',
          'Sync daily morning stock updates to avoid order cancellations',
        ],
        is_primary_recommendation: false,
      },
      {
        channel_id: 'amazon_local',
        channel_name: 'Amazon Local Shops & Easy Store',
        channel_type: 'National Marketplace',
        fit_score_pct: 82,
        commission_structure: '5% – 10% category referral fee',
        setup_time: '2–4 Days',
        estimated_monthly_revenue_uplift: '+₹25,000 – ₹50,000 / mo',
        key_advantage: 'Expand beyond your immediate locality to fulfill postal pincode orders with Amazon Easy Ship integration.',
        suitable_skus: gourmetSKUs.length > 0 ? gourmetSKUs : packagedSKUs,
        action_steps: [
          'Enroll in the Amazon Local Shops program with GST registration',
          'Set dispatch radius for same-day and next-day pincode deliveries',
          'Pack items in standard tamper-evident branded bags',
        ],
        is_primary_recommendation: false,
      },
    ];
  } else if (business.category === 'd2c') {
    channels = [
      {
        channel_id: 'shopify_d2c',
        channel_name: 'Shopify D2C Storefront + Shiprocket',
        channel_type: 'Direct-to-Consumer (0% Fee)',
        fit_score_pct: 95,
        commission_structure: '₹1,999/mo + 2% payment gateway fee',
        setup_time: '1–2 Days',
        estimated_monthly_revenue_uplift: '+₹1,20,000 – ₹2,50,000 / mo',
        key_advantage: 'Own 100% of customer data and run targeted Instagram ad funnels with direct checkout.',
        suitable_skus: gourmetSKUs,
        action_steps: [
          'Launch Shopify store with ready-to-use FMCG template',
          'Connect Razorpay / Cashfree UPI gateway and Shiprocket multi-courier logistics',
        ],
        is_primary_recommendation: true,
      },
      {
        channel_id: 'ondc_d2c',
        channel_name: 'ONDC National Brand Catalog',
        channel_type: 'Government Open Network',
        fit_score_pct: 90,
        commission_structure: '0% Network Commission',
        setup_time: '24–48 Hours',
        estimated_monthly_revenue_uplift: '+₹60,000 – ₹1,20,000 / mo',
        key_advantage: 'Direct discovery on all buyer apps without platform lock-in.',
        suitable_skus: packagedSKUs,
        action_steps: ['Connect D2C catalog to ONDC seller bridge'],
        is_primary_recommendation: false,
      },
    ];
  } else {
    channels = [
      {
        channel_id: 'indiamart_b2b',
        channel_name: 'IndiaMART MSME Verified Supplier Portal',
        channel_type: 'B2B Wholesale Network',
        fit_score_pct: 94,
        commission_structure: 'Annual subscription (0% per-transaction fee)',
        setup_time: '24 Hours',
        estimated_monthly_revenue_uplift: '+₹1,50,000 – ₹3,00,000 / mo',
        key_advantage: 'Receive verified bulk purchase RFQs from hotels, caterers, and regional distributors.',
        suitable_skus: stapleSKUs,
        action_steps: [
          'Create verified IndiaMART TrustSeal profile',
          'List bulk wholesale MOQs (e.g. 50kg bags / 20L cartons)',
        ],
        is_primary_recommendation: true,
      },
      {
        channel_id: 'gem_portal',
        channel_name: 'Government e-Marketplace (GeM)',
        channel_type: 'Government Open Network',
        fit_score_pct: 88,
        commission_structure: '0% Commission (Govt Tender Procurement)',
        setup_time: '3–5 Days',
        estimated_monthly_revenue_uplift: '+₹2,00,000 – ₹5,00,000 / mo',
        key_advantage: 'Direct eligibility for public sector and municipal office pantry supplies.',
        suitable_skus: stapleSKUs,
        action_steps: ['Register on GeM using Udyam and PAN credentials'],
        is_primary_recommendation: false,
      },
    ];
  }

  return {
    business_id: businessId,
    business_name: business.name,
    category: business.category,
    generated_at: new Date().toISOString(),
    total_potential_monthly_uplift: '+₹1,60,000 – ₹3,00,000 / month',
    channels,
  };
}
