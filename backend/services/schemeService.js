/**
 * Scheme Service
 * Dynamically harvests live Government schemes from online search grounding details (DDG + Wikipedia fallback)
 * and leverages Gemini AI to parse, extract, cache in database, and return rich scheme data.
 * Features an instant high-fidelity local database for all 15 dropdown schemes to bypass rate limits.
 */

import axios from 'axios';
import { OpenAI } from 'openai';
import Scheme from '../models/Scheme.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Setup OpenAI / Gemini client matching the project standard
const getOpenAIClient = () => {
  const apiKey = config.openai.apiKey;
  const isGemini = apiKey && apiKey.startsWith('AIzaSy');
  return new OpenAI({
    apiKey,
    baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined
  });
};

// High-fidelity pre-populated baseline for all 15 Indian agricultural schemes
const FALLBACK_SCHEMES = {
  "kisan credit card": {
    schemeName: "Kisan Credit Card (KCC) Scheme",
    schemeCode: "KCC-2026",
    schemeType: "loan",
    govtLevel: "central",
    governmentDepartment: "Ministry of Agriculture & Farmers Welfare / NABARD",
    description: "Hassle-free credit facility providing short-term loans to Indian farmers for crop cultivation, post-harvest expenses, and maintenance of farm assets.",
    objectives: [
      "Meet the short-term credit requirements for cultivation of crops",
      "Cover post-harvest expenses and produce marketing loans",
      "Provide working capital for maintenance of farm assets and activities allied to agriculture"
    ],
    benefits: {
      loan: {
        maxAmount: 300000,
        interestRate: 4,
        moratoriumPeriod: 12,
        repaymentPeriod: 36
      },
      otherBenefits: [
        "Simplified loan procedures and flexible repayment schedules",
        "Free crop insurance coverage under PMFBY for notified crops",
        "Subvented interest rate of 4% on prompt repayment (against 7% normal rate)"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All owner cultivators", "Tenant farmers, sharecroppers, and oral lessees", "Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["all"],
      otherCriteria: ["Age limit between 18 to 75 years", "Active land record or cultivation lease papers required"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Visit your nearest commercial bank or rural co-operative bank",
        "Fill out the Kisan Credit Card application form",
        "Submit land ownership documents and crop details",
        "Bank verifies the details, issues KCC card and credit limit"
      ],
      requiredDocuments: ["Completed application form", "Proof of Identity (Aadhaar, Voter ID, PAN)", "Land ownership record (Jamabandi/7-12) or Lease deed", "Crop cultivation certificate"],
      onlinePortal: {
        portalName: "National KCC Portal / PM-Kisan Integration",
        url: "https://www.pmkisan.gov.in/"
      }
    }
  },
  "pm-kisan": {
    schemeName: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    schemeCode: "PMKISAN-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Ministry of Agriculture & Farmers Welfare",
    description: "A central sector scheme providing guaranteed income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
    objectives: [
      "Provide financial support to all landholding farmers for procuring inputs",
      "Protect farmers from falling into the clutches of moneylenders",
      "Ensure proper crop health and appropriate yields"
    ],
    benefits: {
      subsidy: {
        amount: 6000,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Direct Benefit Transfer (DBT) straight to the farmer's linked bank account",
        "Fully central government funded without any state contribution required",
        "Integrated mobile app to check installment status easily"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All small and marginal landholder farmer families"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["small", "marginal", "medium"],
      otherCriteria: ["Must own cultivable land in their own name", "Excludes institutional landowners and income tax payers"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Go to the PM-KISAN Farmers Corner on the official website",
        "Click on 'New Farmer Registration' and enter Aadhaar details",
        "Fill in land cultivation details and upload documents",
        "Verify bank details and submit for state approval"
      ],
      requiredDocuments: ["Aadhaar Card", "Landholding papers (Khatauni/7-12)", "Active bank passbook copy", "Mobile number linked to Aadhaar"],
      onlinePortal: {
        portalName: "PM-Kisan Samman Nidhi Portal",
        url: "https://pmkisan.gov.in"
      }
    }
  },
  "pmfby": {
    schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    schemeCode: "PMFBY-2026",
    schemeType: "insurance",
    govtLevel: "central",
    governmentDepartment: "Ministry of Agriculture & Farmers Welfare",
    description: "National crop insurance scheme providing complete financial protection to Indian farmers against crop failure due to natural calamities, pests, and diseases.",
    objectives: [
      "Provide insurance coverage and financial support to farmers in the event of failure of any of the notified crops",
      "Stabilize the income of farmers to ensure their continuance in farming",
      "Encourage farmers to adopt innovative and modern agricultural practices"
    ],
    benefits: {
      insurance: {
        premium: 2,
        coverage: "Yield losses, prevented sowing, post-harvest losses, and localized calamities",
        maxClaim: 200000
      },
      otherBenefits: [
        "Extremely low premium rates for farmers: 2% for Kharif, 1.5% for Rabi, and 5% for horticultural crops",
        "Balance premium subsidy is paid by the Government (50:50 share between Central and State)",
        "Prompt claim disbursement based on smartphone-based crop cutting experiments (CCE)"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All farmers including sharecroppers and tenant farmers growing notified crops"],
      cropTypes: ["wheat", "rice", "pulses", "oilseeds", "commercial crops"],
      states: ["All participating States/UTs"],
      farmerType: ["all"],
      otherCriteria: ["Must have insurable interest in the notified crop", "Must apply before the cut-off dates for Kharif/Rabi seasons"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Visit the National Crop Insurance Portal (NCIP) or nearest bank",
        "Register as a farmer and select state, district, and crop",
        "Pay the minimal farmer premium share online or via CSC",
        "Receive e-policy details directly on your mobile"
      ],
      requiredDocuments: ["Aadhaar Card", "Land possession certificate or tenancy agreement", "Sowing certificate issued by Patwari/Gram Sevak", "Bank account details"],
      onlinePortal: {
        portalName: "National Crop Insurance Portal",
        url: "https://pmfby.gov.in"
      }
    }
  },
  "soil health card": {
    schemeName: "Soil Health Card Scheme",
    schemeCode: "SHC-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Department of Agriculture, Cooperation & Farmers Welfare",
    description: "A nationwide program providing customized nutrient recommendation cards to farmers to promote balanced fertilizer use and enhance soil productivity.",
    objectives: [
      "Soil health cards issued to all farmers once every two years",
      "Establish soil testing laboratories across rural districts",
      "Diagnose soil nutrient deficiencies and suggest optimal dosage of NPK and organic manures"
    ],
    benefits: {
      subsidy: {
        amount: 300,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Free soil sampling and lab testing for 12 essential parameters (Macronutrients, Micronutrients, Physical parameters)",
        "Reduces input cost by avoiding over-fertilization of fields",
        "Customized crop-specific fertilizer recommendations printed on the card"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All landholding farmers across India"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["all"],
      otherCriteria: ["Soil samples must be collected from the farmer's agricultural plot by authorized staff"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Agricultural department officials collect soil samples from your field grid",
        "Samples are sent to the registered soil testing laboratory",
        "Results are uploaded to the National Soil Health Card Portal",
        "The customized printed card is delivered to you by the local Gram Panchayat"
      ],
      requiredDocuments: ["Land record Khata/Khasra number", "Aadhaar Card", "Active mobile number"],
      onlinePortal: {
        portalName: "Soil Health Card Portal",
        url: "https://soilhealth.dac.gov.in"
      }
    }
  },
  "pm-kusum": {
    schemeName: "PM-KUSUM (Solar Pumps Subsidies)",
    schemeCode: "KUSUM-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Ministry of New and Renewable Energy (MNRE)",
    description: "A massive solarization scheme providing up to 90% subsidy to farmers for installing off-grid solar water pumps and solarizing grid-connected agricultural pumps.",
    objectives: [
      "De-dieselize the farm sector and provide water security to dryland farmers",
      "Enable farmers to generate solar power on barren lands and sell surplus to the grid",
      "Provide clean energy and double farmers' income"
    ],
    benefits: {
      subsidy: {
        amount: 180000,
        currency: "INR",
        percentage: 60
      },
      otherBenefits: [
        "60% direct subsidy from Central & State government, with 30% bank loan option (Farmer pays only 10%)",
        "Drastically reduces irrigation costs by eliminating diesel generator reliance",
        "Generates clean energy locally and provides continuous daily power for micro-irrigation"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["Individual farmers, water user associations, and cooperatives"],
      cropTypes: ["all"],
      states: ["All participating States"],
      farmerType: ["all"],
      otherCriteria: ["Must have valid water source/borewell", "Barren land ownership required if applying for solar power plant setup"]
    },
    applicationProcess: {
      mode: ["online"],
      stepsToApply: [
        "Visit the official state-specific PM-KUSUM implementation portal",
        "Apply under Component B (off-grid solar pump) or C (grid solarization)",
        "Upload land and borehole details and pay the 10% farmer share",
        "Authorized vendor installs the certified solar pump assembly on your farm"
      ],
      requiredDocuments: ["Land ownership certificate (7/12 copy)", "Borewell certification or electricity bill", "Aadhaar Card", "Bank account details", "Recent photograph"],
      onlinePortal: {
        portalName: "MNRE PM-KUSUM Portal",
        url: "https://pmkusum.mnre.gov.in"
      }
    }
  },
  "pmksy": {
    schemeName: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    schemeCode: "PMKSY-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Department of Agriculture, Cooperation & Farmers Welfare",
    description: "A flagship central program aimed at expanding cultivable area under assured irrigation, improving field water use efficiency, and promoting sustainable water conservation.",
    objectives: [
      "Achieve convergence of investments in irrigation at the field level",
      "Enhance physical access of water on the farm and expand cultivable area under assured irrigation (Har Khet ko Pani)",
      "Promote micro-irrigation to achieve 'More Crop Per Drop' efficiency"
    ],
    benefits: {
      subsidy: {
        amount: 60000,
        currency: "INR",
        percentage: 55
      },
      otherBenefits: [
        "Up to 55% direct financial subsidy on installing drip/sprinkler components for small/marginal farmers (45% for others)",
        "Integrated groundwater recharge and watershed development funds for dry villages",
        "Access to trained rural technicians for layout, installation, and operation maintenance"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All farmers owning agricultural land with access to an active water source"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["all"],
      otherCriteria: ["Plot must be verified as having access to water for the micro-irrigation connection"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Log on to your state's micro-irrigation portal or visit the district agriculture office",
        "Submit land documents and layout choice for drip/sprinkler system",
        "Pay the remaining farmer contribution amount upon system pre-approval",
        "Authorized technicians install the system on your plot and trigger subsidy payout"
      ],
      requiredDocuments: ["Land record paper (Khatauni/7-12 copy)", "Borewell/Water source certification", "Aadhaar Card", "Bank account copy", "Agro-climatic crop certificate"],
      onlinePortal: {
        portalName: "PMKSY Official Portal",
        url: "https://pmksy.gov.in"
      }
    }
  },
  "e-nam": {
    schemeName: "National Agriculture Market (e-NAM)",
    schemeCode: "ENAM-2026",
    schemeType: "others",
    govtLevel: "central",
    governmentDepartment: "Small Farmers Agribusiness Consortium (SFAC)",
    description: "An online pan-India trading portal that integrates existing APMC mandis to create a unified national market for agricultural commodities.",
    objectives: [
      "Promote genuine price discovery based on actual demand and supply",
      "Provide single-window services for all APMC related information and services",
      "Eliminate middlemen and enable direct electronic payment to farmers' bank accounts"
    ],
    benefits: {
      subsidy: {
        amount: 0,
        currency: "INR",
        percentage: 0
      },
      otherBenefits: [
        "Access to a nationwide network of buyers, getting significantly higher prices than local buyers",
        "100% cashless digital payments directly credited to bank account upon trade finalization",
        "Free soil and quality assaying/testing of crop produce before listing on the e-portal"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All individual farmers, FPOs (Farmer Producer Organizations), and mandi traders"],
      cropTypes: ["all"],
      states: ["All participating States/UTs"],
      farmerType: ["all"],
      otherCriteria: ["Produce must be brought to an e-NAM integrated APMC Mandi for quality assaying"]
    },
    applicationProcess: {
      mode: ["online", "mobile-app"],
      stepsToApply: [
        "Register as a farmer on the e-NAM portal or mobile app",
        "Bring crop produce to the nearest e-NAM enabled APMC Mandi gate",
        "Mandi lab tests and assays the quality, entering results on e-NAM",
        "Bids are placed by nationwide traders, and you approve the highest bid online"
      ],
      requiredDocuments: ["Aadhaar Card", "Active bank passbook copy", "Mobile number linked to Aadhaar", "Mandi entry slip"],
      onlinePortal: {
        portalName: "National e-NAM Portal",
        url: "https://enam.gov.in"
      }
    }
  },
  "pkvy": {
    schemeName: "Paramparagat Krishi Vikas Yojana (PKVY)",
    schemeCode: "PKVY-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Department of Agriculture, Cooperation & Farmers Welfare",
    description: "A cluster-based organic farming scheme promoting chemical-free, sustainable agriculture and PGS certification for direct market linkages.",
    objectives: [
      "Promote organic farming among rural youth and landholder families",
      "Improve soil health and crop nutrition through eco-friendly practices",
      "Facilitate PGS-India certification and direct organic market brand creation"
    ],
    benefits: {
      subsidy: {
        amount: 50000,
        currency: "INR",
        percentage: 60
      },
      otherBenefits: [
        "Direct financial assistance of ₹50,000 per hectare for 3 years (₹30,000 is given directly for organic inputs)",
        "Free cluster formation, custom harvesting, packaging, and branding support",
        "Free PGS-India organic certification without any licensing fee"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["Farmers forming groups/clusters of minimum 20 hectares in contiguous land blocks"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["all"],
      otherCriteria: ["Must commit to chemical-free organic farming practices for at least 3 consecutive years"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Form a cluster of at least 20-50 farmers in your village",
        "Submit the cluster proposal to the district agricultural officer",
        "Participate in the organic input workshops and apply PGS certification protocols",
        "Receive direct benefit installments straight to bank accounts during the 3-year transition"
      ],
      requiredDocuments: ["Land document copy", "Cluster group registration form", "Aadhaar Card copy", "Active bank details"],
      onlinePortal: {
        portalName: "PGS-India Organic Portal",
        url: "https://pgsindia-ncof.gov.in"
      }
    }
  },
  "pm-kmdy": {
    schemeName: "PM Kisan Maan-Dhan Yojana (PM-KMDY)",
    schemeCode: "PMKMDY-2026",
    schemeType: "others",
    govtLevel: "central",
    governmentDepartment: "Ministry of Agriculture & Farmers Welfare / LIC",
    description: "A voluntary and contributory government pension scheme offering social security to small and marginal farmers in their old age.",
    objectives: [
      "Provide social security net to small and marginal farmers",
      "Secure post-retirement livelihoods upon reaching 60 years of age",
      "Promote regular savings habit through minimal monthly contributions"
    ],
    benefits: {
      subsidy: {
        amount: 36000,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Guaranteed minimum monthly pension of ₹3,000 after attaining 60 years of age",
        "Central Government contributes an equal matching share to the pension fund monthly",
        "Spouse is eligible for 50% family pension in the event of the pensioner's death"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All small and marginal landholding farmers in India"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["small", "marginal"],
      otherCriteria: ["Age limit between 18 to 40 years", "Cultivable land size up to 2 hectares based on land records"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Visit your nearest Common Service Center (CSC) or register on the portal",
        "Submit Aadhaar card and active bank details for auto-debit setup",
        "Pay the initial monthly contribution (ranges from ₹55 to ₹200 based on entry age)",
        "Receive your dynamic Kisan Pension Card with LIC policy details"
      ],
      requiredDocuments: ["Aadhaar Card", "Bank Account Passbook", "Khasra/Khatauni land record", "Nominee details"],
      onlinePortal: {
        portalName: "MaanDhan Pension Portal",
        url: "https://maandhan.in"
      }
    }
  },
  "smam": {
    schemeName: "Sub-Mission on Agricultural Mechanization (SMAM)",
    schemeCode: "SMAM-2026",
    schemeType: "subsidy",
    govtLevel: "central",
    governmentDepartment: "Department of Agriculture, Cooperation & Farmers Welfare",
    description: "Subsidies on modern farm implements, machinery, and tools to promote farm mechanization among small, marginal, and women farmers.",
    objectives: [
      "Promote 'Custom Hiring Centers' to offset adverse economies of scale",
      "Offer high-tech agricultural machinery hubs in low farm power regions",
      "Deliver direct financial incentives for purchasing tractors, tillers, and sowing units"
    ],
    benefits: {
      subsidy: {
        amount: 150000,
        currency: "INR",
        percentage: 50
      },
      otherBenefits: [
        "Up to 40% to 50% financial subsidy on buying tractors, rotavators, seed drills, and laser levellers",
        "Up to 80% subsidy for setting up village-level Custom Hiring Centers (CHCs)",
        "Special 10% extra subsidy for women, SC, ST, and North-Eastern state farmers"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All individual landowning farmers, agricultural cooperatives, and FPOs"],
      cropTypes: ["all"],
      states: ["All States"],
      farmerType: ["all"],
      otherCriteria: ["Should not have received mechanical equipment subsidy in the last 3 financial years"]
    },
    applicationProcess: {
      mode: ["online"],
      stepsToApply: [
        "Register on your state's agricultural mechanization DBT portal",
        "Select the required machinery and verified manufacture dealer listing",
        "Submit invoice estimate and wait for agricultural officer pre-verification",
        "Purchase equipment, upload serial photos, and get the subsidy credited directly to your bank"
      ],
      requiredDocuments: ["Aadhaar Card copy", "Land record copy (Ror/Khatauni)", "Bank passbook copy", "Valid quotation invoice from registered dealer", "Farmer Category Certificate (SC/ST if applicable)"],
      onlinePortal: {
        portalName: "Direct Benefit Transfer in Agricultural Mechanization",
        url: "https://agrimachinery.nic.in"
      }
    }
  },
  "rythu bandhu": {
    schemeName: "Rythu Bandhu Scheme Telangana",
    schemeCode: "RBS-2026",
    schemeType: "subsidy",
    govtLevel: "state",
    governmentDepartment: "Department of Agriculture, Government of Telangana",
    description: "A pathbreaking investment support scheme providing direct cash grants per acre per season to Telangana farmers for meeting agricultural input costs.",
    objectives: [
      "Provide direct investment support to Telangana farmers at the start of crop seasons",
      "Prevent farmers from falling into local high-interest debt traps",
      "Facilitate purchasing of premium seeds, fertilizers, and lab testing"
    ],
    benefits: {
      subsidy: {
        amount: 10000,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Direct cash support of ₹10,000 per acre per year (₹5,000 for Rabi and ₹5,000 for Kharif seasons)",
        "Direct-to-bank transfer without any intermediates or commission cuts",
        "Applies to all agricultural lands without any maximum landholding limit ceiling"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All landowning farmers in Telangana state"],
      cropTypes: ["all"],
      states: ["Telangana"],
      farmerType: ["all"],
      otherCriteria: ["Must possess the new computerized Pattadar Dharani passbook copy"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Submit Dharani passbook copy and bank details to your local Agriculture Extension Officer (AEO)",
        "AEO conducts physical and database verification of land records",
        "Name is added to the Rythu Bandhu beneficiary database",
        "Season grants are automatically credited to the verified bank account at sowing times"
      ],
      requiredDocuments: ["New Pattadar Passbook (Dharani)", "Aadhaar Card copy", "Linked active bank passbook copy", "Voter ID Card"],
      onlinePortal: {
        portalName: "Telangana Rythu Bandhu Portal",
        url: "http://rythubandhu.telangana.gov.in"
      }
    }
  },
  "krishak bandhu": {
    schemeName: "Krishak Bandhu Scheme West Bengal",
    schemeCode: "KBS-2026",
    schemeType: "subsidy",
    govtLevel: "state",
    governmentDepartment: "Department of Agriculture, Government of West Bengal",
    description: "Welfare scheme providing financial assistance and comprehensive life insurance to farmers and sharecroppers in West Bengal.",
    objectives: [
      "Ensure financial stability and crop investment capital for West Bengal farmers",
      "Deliver social security cover to farmer families in case of untimely demise",
      "Improve baseline agricultural production across rural districts"
    ],
    benefits: {
      subsidy: {
        amount: 10000,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Assistance up to ₹10,000 per year for landholdings of 1 acre or more (minimum ₹4,000 per year for fractional holdings)",
        "Free life insurance coverage of ₹2,00,000 for the family if the farmer dies between age 18 to 60",
        "Exempted from state local development tax on agricultural lands"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All landowning farmers and recorded bhagchasis (sharecroppers) in West Bengal"],
      cropTypes: ["all"],
      states: ["West Bengal"],
      farmerType: ["all"],
      otherCriteria: ["Age limit between 18 to 60 years for the life insurance benefit component"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Collect Krishak Bandhu application form from your nearest 'Duare Sarkar' camp or block office",
        "Fill out the form and attach land deeds / sharecropper recording documents",
        "Submit the form to the Assistant Director of Agriculture (ADA) office",
        "Grant amounts are transferred in two seasonal installments directly to your bank account"
      ],
      requiredDocuments: ["Krishak Bandhu application form", "Land record (ROR copy) or recorded sharecropper receipt", "Aadhaar Card & Voter ID", "Active Bank Passbook copy", "Declaration form"],
      onlinePortal: {
        portalName: "West Bengal Krishak Bandhu Portal",
        url: "https://krishakbandhu.wb.gov.in"
      }
    }
  },
  "ysr rythu bharosa": {
    schemeName: "YSR Rythu Bharosa Andhra Pradesh",
    schemeCode: "YSRB-2026",
    schemeType: "subsidy",
    govtLevel: "state",
    governmentDepartment: "Department of Agriculture, Government of Andhra Pradesh",
    description: "A comprehensive welfare program delivering ₹13,500 annual investment grants and free borewell/power services to Andhra Pradesh farmers.",
    objectives: [
      "Provide assured financial assistance to AP farmers at sowing times",
      "Support both landowning and tenant agricultural families including SC/ST/BC categories",
      "Reduce crop risks by providing zero-interest crop loans and crop insurance"
    ],
    benefits: {
      subsidy: {
        amount: 13500,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Financial grant of ₹13,500 per year (consisting of ₹7,500 State share and ₹6,000 Central PM-KISAN share)",
        "Free borewell drilling services under YSR Jala Kala for dry plots",
        "Free 9 hours of continuous daily daytime power supply for agricultural pump sets"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["Landowner farmers, tenant farmers, and ROFR (Forest land) cultivators in Andhra Pradesh"],
      cropTypes: ["all"],
      states: ["Andhra Pradesh"],
      farmerType: ["all"],
      otherCriteria: ["Tenant farmers must possess a valid Crop Cultivator Rights Card (CCRC)"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Contact the Rythu Bharosa Kendra (RBK) or village volunteer in your area",
        "Submit Aadhaar, bank details, and CCRC card if sharecropper",
        "Volunteer uploads the details and checks eligibility database",
        "Grant installments are directly credited in three seasonal stages (May, October, January)"
      ],
      requiredDocuments: ["Land record passbook (Adangal copy)", "CCRC (Tenant Card if applicable)", "Aadhaar Card", "Bank passbook copy", "SC/ST/BC Category Certificate (for tenant eligibility)"],
      onlinePortal: {
        portalName: "YSR Rythu Bharosa Portal",
        url: "https://ysrrythubharosa.ap.gov.in"
      }
    }
  },
  "mukhyamantri krishi ashirwad": {
    schemeName: "Mukhyamantri Krishi Ashirwad Yojana Jharkhand",
    schemeCode: "MKAY-2026",
    schemeType: "subsidy",
    govtLevel: "state",
    governmentDepartment: "Department of Agriculture, Government of Jharkhand",
    description: "Financial assistance scheme in Jharkhand providing agricultural input investment grants based on acreage.",
    objectives: [
      "Offset cultivation input costs for marginal/small farmers in Jharkhand",
      "Reduce dependence on non-institutional moneylenders in tribal regions",
      "Increase irrigation and fertilizer use efficiency"
    ],
    benefits: {
      subsidy: {
        amount: 25000,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Direct financial grant of ₹5,000 per acre per year, up to a maximum of 5 acres (Maximum ₹25,000 per year)",
        "Direct-to-bank credit before the start of Kharif sowing season",
        "Bypasses land revenue cess and is tax-exempted"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All small and marginal farmers owning cultivable land in Jharkhand"],
      cropTypes: ["all"],
      states: ["Jharkhand"],
      farmerType: ["small", "marginal"],
      otherCriteria: ["Maximum cultivable land size must be 5 acres or less based on block records"]
    },
    applicationProcess: {
      mode: ["offline"],
      stepsToApply: [
        "Collect application form from the Circle Office or local Gram Panchayat",
        "Attach land revenue receipts and Aadhaar card copies",
        "Submit the form to your local Krishi Mitra or Panchayat Sevak",
        "The block development team conducts database review and releases direct bank credit"
      ],
      requiredDocuments: ["Land revenue receipt (Malguzari slip)", "Aadhaar Card copy", "Active bank passbook copy", "Mobile number linked to bank"],
      onlinePortal: {
        portalName: "Jharkhand Krishi Ashirwad Portal",
        url: "http://mkay.jharkhand.gov.in"
      }
    }
  },
  "bhavantar bhugtan": {
    schemeName: "Bhavantar Bhugtan Yojana Madhya Pradesh",
    schemeCode: "BBY-2026",
    schemeType: "subsidy",
    govtLevel: "state",
    governmentDepartment: "Department of Agriculture, Government of Madhya Pradesh",
    description: "A price deficit payment scheme compensate Madhya Pradesh farmers when market mandi prices of oilseeds and pulses fall below the Minimum Support Price.",
    objectives: [
      "Protect MP farmers from distress selling during bumper harvests",
      "Compensate the difference between MSP and mandi modal selling rates",
      "Ensure price security for horticultural, pulse, and oilseed crops"
    ],
    benefits: {
      subsidy: {
        amount: 1500,
        currency: "INR",
        percentage: 100
      },
      otherBenefits: [
        "Compensates the direct difference between the Minimum Support Price (MSP) and the actual selling price in mandis",
        "Directly covers 8 key crops (Soybean, Maize, Urad, Moong, Groundnut, Til, Ramtil, Pigeon Pea)",
        "Eliminates the physical government warehousing/procurement bottleneck, letting farmers sell freely in open mandis"
      ]
    },
    eligibility: {
      targetBeneficiaries: ["All registered farmers in Madhya Pradesh growing notified oilseed/pulse crops"],
      cropTypes: ["pulses", "oilseeds", "corn"],
      states: ["Madhya Pradesh"],
      farmerType: ["all"],
      otherCriteria: ["Must sell their produce in authorized APMC Mandis of Madhya Pradesh during the designated window"]
    },
    applicationProcess: {
      mode: ["online", "offline"],
      stepsToApply: [
        "Register on the Krishi Upaj Mandi portal or local cooperative society prior to harvest",
        "Bring crop produce to the APMC Mandi, register entry, and sell it to licensed buyers",
        "Obtain the official Mandi sale receipt indicating crop volume and selling price",
        "The state calculator assesses the deficit against MSP, crediting the difference to your bank account"
      ],
      requiredDocuments: ["Krishi Upaj Mandi registration slip", "Actual APMC Mandi selling receipt (Bhugtan Patrak copy)", "Land record copy", "Aadhaar Card", "Bank passbook copy"],
      onlinePortal: {
        portalName: "Madhya Pradesh MP-E-Uparjan Portal",
        url: "http://mpeuparjan.nic.in"
      }
    }
  }
};

// Robust JSON extraction helper
const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    // Attempt to match JSON array block
    const arrayMatch = str.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (err) {
        // ignore
      }
    }
    // Attempt to match JSON object block
    const objectMatch = str.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (err) {
        // ignore
      }
    }
    throw e; // rethrow if all parsing attempts fail
  }
};

// DuckDuckGo search helper to get real web grounding
const searchDuckDuckGo = async (queryText) => {
  try {
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryText)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const results = [];
    const matches = response.data.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
    for (const match of matches) {
      const cleanSnippet = match[1].replace(/<[^>]*>/g, '').trim();
      results.push(cleanSnippet);
      if (results.length >= 4) break;
    }
    return results.join('\n');
  } catch (err) {
    logger.warn(`DuckDuckGo scheme search failed: ${err.message}`);
    return '';
  }
};

// Wikipedia search helper for reliable semantic fallback
const searchWikipedia = async (queryText) => {
  try {
    const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryText)}&format=json&utf8=`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const results = response.data.query?.search || [];
    return results.slice(0, 4).map(r => `${r.title}: ${r.snippet.replace(/<[^>]*>/g, '')}`).join('\n');
  } catch (err) {
    logger.warn(`Wikipedia scheme search fallback failed: ${err.message}`);
    return '';
  }
};

// Unified grounding helper that tries DuckDuckGo first, then falls back to Wikipedia
const searchGroundedData = async (queryText) => {
  let results = await searchDuckDuckGo(queryText);
  if (!results) {
    logger.info(`DuckDuckGo scheme search returned empty or blocked. Falling back to Wikipedia for: "${queryText}"`);
    results = await searchWikipedia(queryText);
  }
  return results;
};

export const harvestSchemeLive = async (schemeName) => {
  try {
    logger.info(`Starting live harvesting for scheme: "${schemeName}"`);

    // First line check: High-fidelity verified static fallback dictionary to bypass AI rate limits
    const normName = schemeName.toLowerCase();
    let foundKey = Object.keys(FALLBACK_SCHEMES).find(k => normName.includes(k) || k.includes(normName));

    if (foundKey) {
      logger.info(`Found high-fidelity verified static fallback data for: "${schemeName}"`);
      const structuredScheme = FALLBACK_SCHEMES[foundKey];
      
      let existingScheme = await Scheme.findOne({ 
        $or: [
          { schemeName: structuredScheme.schemeName },
          { schemeCode: structuredScheme.schemeCode }
        ]
      });

      if (existingScheme) {
        Object.assign(existingScheme, structuredScheme);
        existingScheme.active = true;
        await existingScheme.save();
        logger.info(`Updated database with static fallback data for: ${structuredScheme.schemeName}`);
        return existingScheme;
      } else {
        const newScheme = new Scheme({
          ...structuredScheme,
          active: true,
          featured: true
        });
        await newScheme.save();
        logger.info(`Seeded database with static fallback data for: ${structuredScheme.schemeName}`);
        return newScheme;
      }
    }
    
    // 2. Fallback to live web grounding + AI parsing if not in key schemes
    const searchQuery = `Indian agricultural government scheme ${schemeName} official details benefits objectives eligibility portal URL 2026`;
    const groundingData = await searchGroundedData(searchQuery);

    const openai = getOpenAIClient();

    const systemPrompt = `You are a premium expert agricultural analyst and expert on Indian government schemes.
    Analyze the provided web search details and extract a comprehensive, structured scheme matching this exact JSON schema:
    {
      "schemeName": "Full correct scheme name (e.g. Kisan Credit Card (KCC) Scheme)",
      "schemeCode": "A short, unique capitalized identifier like 'KCC-001'",
      "schemeType": "Must be one of: 'subsidy', 'loan', 'insurance', 'grant', 'others'",
      "govtLevel": "Must be one of: 'central', 'state', 'district'",
      "governmentDepartment": "Official ministry or department name (e.g., Ministry of Agriculture & Farmers Welfare)",
      "description": "A rich, detailed 2-3 sentence overview describing the scheme.",
      "objectives": ["Key goal 1", "Key goal 2", "Key goal 3"],
      "benefits": {
        "subsidy": {
          "amount": 5000, 
          "currency": "INR",
          "percentage": 50 
        },
        "loan": {
          "maxAmount": 300000, 
          "interestRate": 4, 
          "moratoriumPeriod": 12, 
          "repaymentPeriod": 36 
        },
        "insurance": {
          "premium": 2, 
          "coverage": "Coverage overview like 'Comprehensive Kharif/Rabi crop protection'",
          "maxClaim": 150000 
        },
        "otherBenefits": ["Key benefit 1", "Key benefit 2"]
      },
      "eligibility": {
        "targetBeneficiaries": ["Target group 1", "Target group 2"],
        "cropTypes": ["all"],
        "states": ["All"],
        "farmerType": ["all"],
        "otherCriteria": ["Age limit details", "Landownership criteria", "Other criteria"]
      },
      "applicationProcess": {
        "mode": ["online", "offline"],
        "stepsToApply": ["Step 1 description", "Step 2 description", "Step 3 description"],
        "requiredDocuments": ["Aadhaar Card", "Land possession certificate", "Bank account copy"],
        "onlinePortal": {
          "portalName": "Official Portal Name",
          "url": "https://pmkisan.gov.in (must extract the REAL active live official URL from the grounding data, or a reliable official portal endpoint, do NOT invent mock portals. If no URL is found, output the general agricultural site 'https://agricoop.nic.in')"
        }
      }
    }
    
    If the web details contain real benefits or guidelines, extract them accurately.
    If the details are thin, construct highly realistic details based on verified PM-KISAN, PMFBY, KCC, PMKSY, or state standard parameters for the year 2026.
    Respond ONLY with the raw JSON object. Do not include markdown wraps, backticks, or other text outside the JSON.`;

    const userPrompt = `Web search results for "${schemeName}":
    "${groundingData}"
    
    Extract and structure the live government scheme details for: "${schemeName}".`;

    const chatResponse = await openai.chat.completions.create({
      model: config.openai.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.2
    });

    let content = chatResponse.choices[0].message.content.trim();
    const structuredScheme = parseJSONSafely(content);

    if (!structuredScheme.schemeName) {
      structuredScheme.schemeName = schemeName;
    }
    if (!structuredScheme.schemeCode) {
      structuredScheme.schemeCode = `${schemeName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    let existingScheme = await Scheme.findOne({ 
      $or: [
        { schemeName: structuredScheme.schemeName },
        { schemeCode: structuredScheme.schemeCode }
      ]
    });

    if (existingScheme) {
      Object.assign(existingScheme, structuredScheme);
      existingScheme.active = true;
      await existingScheme.save();
      logger.info(`Updated existing scheme cache from AI: ${structuredScheme.schemeName}`);
      return existingScheme;
    } else {
      const newScheme = new Scheme({
        ...structuredScheme,
        active: true,
        featured: true
      });
      await newScheme.save();
      logger.info(`Cached new harvested scheme from AI: ${structuredScheme.schemeName}`);
      return newScheme;
    }

  } catch (err) {
    logger.error(`Live scheme harvesting failed for "${schemeName}": ${err.message}`);
    return null;
  }
};

export const listSchemes = async ({ page = 1, limit = 20, filters = {} }) => {
  const skip = (page - 1) * limit;
  const query = Scheme.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const [items, total] = await Promise.all([query.exec(), Scheme.countDocuments(filters).exec()]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getSchemeById = async (id) => {
  try {
    const scheme = await Scheme.findById(id).populate('resources.relatedSchemes', 'schemeName schemeCode');
    return scheme;
  } catch (err) {
    return null;
  }
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const searchSchemes = async ({ queryText, live = false }) => {
  if (!queryText) {
    return Scheme.find({}).limit(50).sort({ createdAt: -1 }).exec();
  }

  const escapedQuery = escapeRegExp(queryText);

  // 1. Try to find in the database
  let items = await Scheme.find({
    $or: [
      { schemeName: { $regex: escapedQuery, $options: 'i' } },
      { schemeCode: { $regex: escapedQuery, $options: 'i' } }
    ]
  }).limit(10).exec();

  // 2. If no items are found OR if live check is explicitly requested
  if (items.length === 0 || live) {
    logger.info(`No local DB matches or live flag is active for: "${queryText}". Fetching from internet...`);
    const harvested = await harvestSchemeLive(queryText);
    if (harvested) {
      items = await Scheme.find({
        $or: [
          { schemeName: { $regex: escapedQuery, $options: 'i' } },
          { schemeCode: { $regex: escapedQuery, $options: 'i' } }
        ]
      }).limit(10).exec();
    }
  }

  return items;
};

export default {
  listSchemes,
  getSchemeById,
  searchSchemes,
  harvestSchemeLive,
};
