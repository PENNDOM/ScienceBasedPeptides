import { config } from "dotenv";
import { nanoid } from "nanoid";
import path from "path";
import bcrypt from "bcryptjs";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/site";
import { prisma } from "@/lib/prisma";

config({ path: path.join(process.cwd(), ".env.local") });

const IMG = JSON.stringify(["/placeholder-peptide.svg"]);

type Var = {
  id: string;
  size: string;
  price: number;
  sku: string;
  stock: number;
  compare_at?: number;
  is_default?: boolean;
  order: number;
};

type P = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  scientific_name?: string;
  category_id: string;
  base_price: number;
  compare_price_at?: number | null;
  sku: string;
  purity?: number | null;
  molecular_formula?: string | null;
  cas_number?: string | null;
  storage_instructions?: string | null;
  cycle_length_days?: number | null;
  is_featured: number;
  is_best_seller: number;
  subscription_eligible: number;
  tags: string[];
  variants: Var[];
};

const categories: Array<{
  id: string;
  name: string;
  slug: string;
  display_order: number;
  description: string;
}> = [
  {
    id: "cat_research_compounds",
    name: "Research Compounds",
    slug: "research-compounds",
    display_order: 1,
    description:
      "Synthetic and recombinant peptides for analytical characterization, method development, and controlled preclinical models.",
  },
  {
    id: "cat_growth_factor_research",
    name: "Growth Factor Research",
    slug: "growth-factor-research",
    display_order: 2,
    description:
      "Peptide ligands used in published secretagogue and receptor-axis studies; for in vitro and animal-model research only.",
  },
  {
    id: "cat_analytical_reference",
    name: "Analytical Reference Materials",
    slug: "analytical-reference-materials",
    display_order: 3,
    description: "Reference-grade peptides and small-molecule cofactors for assay calibration and biochemical characterization.",
  },
  {
    id: "cat_peptide_standards",
    name: "Peptide Standards",
    slug: "peptide-standards",
    display_order: 4,
    description: "Identity and purity reference materials suitable for chromatography, mass spectrometry, and QC workflows.",
  },
  {
    id: "cat_receptor_research",
    name: "Receptor Ligand Research",
    slug: "receptor-ligand-research",
    display_order: 5,
    description: "Ligands for binding, signaling, and pharmacology studies in validated laboratory and preclinical systems.",
  },
  {
    id: "cat_neuropeptide_research",
    name: "Neuropeptide Research",
    slug: "neuropeptide-research",
    display_order: 6,
    description: "Synthetic neuropeptide sequences for neuropharmacology and signaling research in approved model systems.",
  },
  {
    id: "cat_research_accessories",
    name: "Research Accessories",
    slug: "research-accessories",
    display_order: 7,
    description: "Laboratory consumables for solvent preparation, liquid handling, and general bench workflows.",
  },
];

const products: P[] = [
  {
    id: "p_bpc157",
    name: "BPC-157",
    slug: "bpc-157",
    description:
      "Synthetic research peptide supplied as lyophilized powder for laboratory and analytical applications. Documented in preclinical literature for extracellular matrix and signaling pathway studies. Intended for research use only; not for human consumption.",
    short_description: "Synthetic peptide for laboratory research applications.",
    scientific_name: "Body Protection Compound 157",
    category_id: "cat_research_compounds",
    base_price: 34.99,
    sku: "BPC157",
    purity: 99.1,
    molecular_formula: "C62H98N16O22",
    cas_number: "137525-51-0",
    cycle_length_days: 56,
    storage_instructions:
      "Store at -20°C. Stable for 24 months frozen. After preparation of working solutions per laboratory SOP, refrigerate and complete analytical use within 30 days consistent with stability data.",
    is_featured: 1,
    is_best_seller: 1,
    subscription_eligible: 1,
    tags: ["synthetic peptide", "lyophilized", "reference material", "laboratory"],
    variants: [
      { id: "v_bpc_5", size: "5mg", price: 34.99, sku: "BPC157-5MG", stock: 500, is_default: true, order: 0 },
      { id: "v_bpc_10", size: "10mg", price: 59.99, sku: "BPC157-10MG", stock: 300, order: 1 },
      {
        id: "v_bpc_5x5",
        size: "5mg × 5 vials",
        price: 149.99,
        sku: "BPC157-5X5MG",
        stock: 200,
        compare_at: 174.95,
        order: 2,
      },
      {
        id: "v_bpc_10x5",
        size: "5mg × 10 vials",
        price: 274.99,
        sku: "BPC157-10X5MG",
        stock: 150,
        compare_at: 349.9,
        order: 3,
      },
    ],
  },
  {
    id: "p_tb500",
    name: "TB-500 (Thymosin Beta-4)",
    slug: "tb-500",
    description:
      "Thymosin beta-4 fragment reference material for in vitro and preclinical research models examining cytoskeletal organization and cell migration. Supplied for laboratory research only.",
    short_description: "Thymosin beta-4 fragment for laboratory research.",
    scientific_name: "Thymosin Beta-4 Fragment",
    category_id: "cat_research_compounds",
    base_price: 37.99,
    sku: "TB500",
    purity: 99.0,
    molecular_formula: "C212H350N56O78S",
    cas_number: "77591-33-4",
    cycle_length_days: 56,
    is_featured: 0,
    is_best_seller: 1,
    subscription_eligible: 1,
    tags: ["synthetic peptide", "fragment", "reference material", "laboratory"],
    variants: [
      { id: "v_tb_5", size: "5mg", price: 37.99, sku: "TB500-5MG", stock: 400, is_default: true, order: 0 },
      { id: "v_tb_10", size: "10mg", price: 64.99, sku: "TB500-10MG", stock: 250, order: 1 },
      {
        id: "v_tb_5x5",
        size: "5mg × 5 vials",
        price: 164.99,
        sku: "TB500-5X5MG",
        stock: 180,
        compare_at: 189.95,
        order: 2,
      },
    ],
  },
  {
    id: "p_blend_bpc_tb",
    name: "BPC-157 + TB-500 Blend",
    slug: "bpc-157-tb-500-blend",
    description:
      "Blended lyophilized research material containing BPC-157 and TB-500 sequences for comparative analytical and preclinical studies. For laboratory research only.",
    short_description: "Multi-sequence blend for comparative laboratory research.",
    category_id: "cat_research_compounds",
    base_price: 64.99,
    sku: "BLENDBPCTB",
    purity: 99.0,
    cycle_length_days: 56,
    is_featured: 1,
    is_best_seller: 1,
    subscription_eligible: 1,
    tags: ["blend", "lyophilized", "comparative research", "laboratory"],
    variants: [
      {
        id: "v_blend_bt_10",
        size: "10mg (5mg+5mg)",
        price: 64.99,
        sku: "BLEND-BPC-TB-10MG",
        stock: 600,
        is_default: true,
        order: 0,
      },
      { id: "v_blend_bt_20", size: "20mg (10mg+10mg)", price: 114.99, sku: "BLEND-BPC-TB-20MG", stock: 300, order: 1 },
      {
        id: "v_blend_bt_5x10",
        size: "10mg × 5 vials",
        price: 299.99,
        sku: "BLEND-BPC-TB-5X10MG",
        stock: 200,
        compare_at: 324.95,
        order: 2,
      },
    ],
  },
  {
    id: "p_cjc",
    name: "CJC-1295 (No DAC)",
    slug: "cjc-1295-no-dac",
    description:
      "Modified GRF (1-29) analog for laboratory studies of growth hormone secretagogue pathways in validated research models. Supplied as lyophilized research compound.",
    short_description: "GHRH-analog research compound (no DAC).",
    scientific_name: "Modified GRF 1-29",
    category_id: "cat_growth_factor_research",
    base_price: 22.99,
    sku: "CJC",
    purity: 98.9,
    cas_number: "863288-34-0",
    cycle_length_days: 90,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["GHRH analog", "secretagogue research", "lyophilized", "laboratory"],
    variants: [
      { id: "v_cjc_2", size: "2mg", price: 22.99, sku: "CJC-2MG", stock: 400, is_default: true, order: 0 },
      { id: "v_cjc_5", size: "5mg", price: 44.99, sku: "CJC-5MG", stock: 250, order: 1 },
    ],
  },
  {
    id: "p_ipa",
    name: "Ipamorelin",
    slug: "ipamorelin",
    description:
      "Selective GHRP-class peptide ligand characterized in published secretagogue and receptor-interaction models in vitro and in controlled animal studies. For laboratory research only.",
    short_description: "Selective GH secretagogue research peptide.",
    scientific_name: "Ipamorelin (GHRP)",
    category_id: "cat_growth_factor_research",
    base_price: 22.99,
    sku: "IPA",
    purity: 99.2,
    cas_number: "170851-70-4",
    cycle_length_days: 90,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["GHRP", "secretagogue research", "lyophilized", "laboratory"],
    variants: [
      { id: "v_ipa_2", size: "2mg", price: 22.99, sku: "IPA-2MG", stock: 400, is_default: true, order: 0 },
      { id: "v_ipa_5", size: "5mg", price: 44.99, sku: "IPA-5MG", stock: 250, order: 1 },
    ],
  },
  {
    id: "p_cjc_ipa_blend",
    name: "CJC-1295 + Ipamorelin Blend",
    slug: "cjc-1295-ipamorelin-blend",
    description:
      "Combined lyophilized formulation for comparative secretagogue pathway research in validated laboratory models.",
    short_description: "Comparative secretagogue blend for laboratory research.",
    category_id: "cat_growth_factor_research",
    base_price: 39.99,
    sku: "CJCIPA",
    purity: 99.0,
    cycle_length_days: 90,
    is_featured: 1,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["blend", "GHRH", "GHRP", "laboratory"],
    variants: [
      { id: "v_ci_2", size: "2mg+2mg", price: 39.99, sku: "CJC-IPA-2MG", stock: 500, is_default: true, order: 0 },
      { id: "v_ci_5", size: "5mg+5mg", price: 74.99, sku: "CJC-IPA-5MG", stock: 300, order: 1 },
      { id: "v_ci_10", size: "10mg+10mg", price: 134.99, sku: "CJC-IPA-10MG", stock: 200, order: 2 },
    ],
  },
  {
    id: "p_serm",
    name: "Sermorelin",
    slug: "sermorelin",
    description:
      "Sermorelin acetate is used in published models examining pituitary GH-axis signaling dynamics. Supplied as a lyophilized research compound for qualified laboratory use only.",
    short_description: "GHRH analog for laboratory research models.",
    scientific_name: "Sermorelin Acetate",
    category_id: "cat_growth_factor_research",
    base_price: 24.99,
    sku: "SERM",
    purity: 98.8,
    cas_number: "86168-78-7",
    cycle_length_days: 90,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["GHRH analog", "secretagogue research", "lyophilized"],
    variants: [
      { id: "v_serm_2", size: "2mg", price: 24.99, sku: "SERM-2MG", stock: 350, is_default: true, order: 0 },
      { id: "v_serm_5", size: "5mg", price: 48.99, sku: "SERM-5MG", stock: 200, order: 1 },
    ],
  },
  {
    id: "p_ghk",
    name: "GHK-Cu (Copper Peptide)",
    slug: "ghk-cu",
    description:
      "Copper-associated tripeptide reference material for extracellular matrix and collagen-related in vitro assays. Supplied for laboratory and analytical research only.",
    short_description: "Copper peptide reference material for matrix research assays.",
    scientific_name: "Glycyl-L-histidyl-L-lysine copper",
    category_id: "cat_analytical_reference",
    base_price: 34.99,
    sku: "GHKCU",
    purity: 99.3,
    cas_number: "49557-75-7",
    cycle_length_days: 60,
    is_featured: 1,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["copper peptide", "matrix research", "reference material", "extracellular matrix assays"],
    variants: [
      { id: "v_ghk_50", size: "50mg", price: 34.99, sku: "GHKCU-50MG", stock: 400, is_default: true, order: 0 },
      { id: "v_ghk_100", size: "100mg", price: 59.99, sku: "GHKCU-100MG", stock: 250, order: 1 },
      { id: "v_ghk_200", size: "200mg", price: 99.99, sku: "GHKCU-200MG", stock: 150, order: 2 },
    ],
  },
  {
    id: "p_nad",
    name: "NAD+",
    slug: "nad-plus",
    description:
      "Nicotinamide adenine dinucleotide (oxidized form) for biochemical assays, enzyme kinetics, and redox-cofactor studies in controlled laboratory models.",
    short_description: "Redox cofactor for biochemical and mitochondrial research assays.",
    scientific_name: "Nicotinamide Adenine Dinucleotide",
    category_id: "cat_analytical_reference",
    base_price: 69.99,
    sku: "NAD",
    purity: 99.0,
    cas_number: "53-84-9",
    cycle_length_days: 30,
    is_featured: 1,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["NAD+", "redox biochemistry", "enzymatic assay", "cofactor studies"],
    variants: [
      { id: "v_nad_500", size: "500mg", price: 69.99, sku: "NAD-500MG", stock: 300, is_default: true, order: 0 },
      { id: "v_nad_1000", size: "1000mg", price: 119.99, sku: "NAD-1000MG", stock: 200, order: 1 },
    ],
  },
  {
    id: "p_epit",
    name: "Epitalon",
    slug: "epitalon",
    description:
      "Synthetic tetrapeptide reference material documented in circadian and regulatory pathway literature in preclinical models. For laboratory research use only.",
    short_description: "Synthetic tetrapeptide for circadian pathway research models.",
    scientific_name: "Epithalon (Epithalamin)",
    category_id: "cat_neuropeptide_research",
    base_price: 34.99,
    sku: "EPIT",
    purity: 99.1,
    cas_number: "307297-39-8",
    cycle_length_days: 20,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["epitalon", "synthetic peptide", "circadian research", "preclinical"],
    variants: [
      { id: "v_epit_10", size: "10mg", price: 34.99, sku: "EPIT-10MG", stock: 300, is_default: true, order: 0 },
      { id: "v_epit_20", size: "20mg", price: 59.99, sku: "EPIT-20MG", stock: 200, order: 1 },
    ],
  },
  {
    id: "p_mots",
    name: "MOTS-c",
    slug: "mots-c",
    description:
      "Mitochondrial-derived peptide sequence for in vitro and animal metabolic pathway studies in published literature. Supplied as lyophilized research compound only.",
    short_description: "Mitochondrial-derived peptide for metabolic pathway research.",
    scientific_name: "MOTS-c Peptide",
    category_id: "cat_research_compounds",
    base_price: 49.99,
    sku: "MOTSC",
    purity: 98.5,
    cas_number: "1627580-64-6",
    cycle_length_days: 30,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["mitochondrial peptide", "metabolism research", "lyophilized", "preclinical"],
    variants: [
      { id: "v_mots_5", size: "5mg", price: 49.99, sku: "MOTSC-5MG", stock: 200, is_default: true, order: 0 },
      { id: "v_mots_10", size: "10mg", price: 89.99, sku: "MOTSC-10MG", stock: 150, order: 1 },
    ],
  },
  {
    id: "p_ta1",
    name: "Thymosin Alpha-1",
    slug: "thymosin-alpha-1",
    description:
      "Thymosin alpha-1 reference peptide for cytokine and cell-signaling studies in controlled in vitro and preclinical models.",
    short_description: "Thymic peptide for immunological pathway research models.",
    scientific_name: "Thymosin Alpha 1",
    category_id: "cat_receptor_research",
    base_price: 39.99,
    sku: "TA1",
    purity: 99.0,
    cas_number: "62304-98-7",
    cycle_length_days: 30,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["thymosin", "cytokine signaling", "cell signaling", "preclinical models"],
    variants: [
      { id: "v_ta1_15", size: "1.5mg", price: 39.99, sku: "TA1-1.5MG", stock: 250, is_default: true, order: 0 },
      {
        id: "v_ta1_5x",
        size: "1.5mg × 5",
        price: 179.99,
        sku: "TA1-5X1.5MG",
        stock: 150,
        compare_at: 199.95,
        order: 1,
      },
    ],
  },
  {
    id: "p_pt141",
    name: "PT-141 (Bremelanotide)",
    slug: "pt-141",
    description:
      "Bremelanotide is a melanocortin receptor ligand used in receptor binding and in vitro pharmacology research. Supplied for laboratory investigation only.",
    short_description: "Melanocortin receptor ligand for laboratory pharmacology research.",
    scientific_name: "Bremelanotide",
    category_id: "cat_receptor_research",
    base_price: 54.99,
    sku: "PT141",
    purity: 99.1,
    cas_number: "189691-06-3",
    cycle_length_days: 30,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["PT-141", "melanocortin", "receptor research", "bremelanotide"],
    variants: [
      { id: "v_pt_10", size: "10mg", price: 54.99, sku: "PT141-10MG", stock: 300, is_default: true, order: 0 },
      {
        id: "v_pt_3x",
        size: "10mg × 3",
        price: 149.99,
        sku: "PT141-3X10MG",
        stock: 150,
        compare_at: 164.97,
        order: 1,
      },
    ],
  },
  {
    id: "p_selank",
    name: "Selank",
    slug: "selank",
    description:
      "Synthetic heptapeptide for neuropeptide signaling studies in validated animal models described in the primary literature.",
    short_description: "Synthetic heptapeptide for neuropeptide pathway research.",
    scientific_name: "Selank (TP-7)",
    category_id: "cat_neuropeptide_research",
    base_price: 29.99,
    sku: "SELANK",
    purity: 99.0,
    cas_number: "129954-34-3",
    cycle_length_days: 14,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["selank", "neuropeptide", "signaling research", "preclinical"],
    variants: [{ id: "v_sel_5", size: "5mg", price: 29.99, sku: "SELANK-5MG", stock: 250, is_default: true, order: 0 }],
  },
  {
    id: "p_semax",
    name: "Semax",
    slug: "semax",
    description:
      "ACTH-derived synthetic peptide analog for neuropharmacology and neuropeptide pathway research in controlled animal models.",
    short_description: "ACTH-derived peptide analog for neuropharmacology research.",
    scientific_name: "Semax (ACTH 4-7 Pro8-Gly9-Pro10)",
    category_id: "cat_neuropeptide_research",
    base_price: 29.99,
    sku: "SEMAX",
    purity: 99.0,
    cas_number: "80714-61-0",
    cycle_length_days: 14,
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 1,
    tags: ["semax", "ACTH analog", "neuropharmacology", "preclinical"],
    variants: [{ id: "v_sem_5", size: "5mg", price: 29.99, sku: "SEMAX-5MG", stock: 250, is_default: true, order: 0 }],
  },
  {
    id: "p_bac",
    name: "Bacteriostatic Water 30mL",
    slug: "bacteriostatic-water-30ml",
    description:
      "Sterile bacteriostatic water for laboratory solvent preparation and rehydration steps per institutional SOPs. For research use only.",
    short_description: "Reconstitution accessory for laboratory preparation.",
    category_id: "cat_research_accessories",
    base_price: 11.99,
    sku: "BACWATER",
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 0,
    tags: ["accessories", "reconstitution", "bac water"],
    variants: [
      { id: "v_bac_30", size: "30mL", price: 11.99, sku: "BACWATER-30ML", stock: 1000, is_default: true, order: 0 },
      { id: "v_bac_5x", size: "30mL × 5", price: 49.99, sku: "BACWATER-5X30ML", stock: 500, order: 1 },
    ],
  },
  {
    id: "p_syr",
    name: "Precision Syringes 29G (10-pack)",
    slug: "precision-syringes-29g",
    description:
      "Low-volume syringes for liquid transfer in analytical and preparative laboratory workflows. Not labeled for clinical use.",
    short_description: "Laboratory liquid-handling syringe pack.",
    category_id: "cat_research_accessories",
    base_price: 8.99,
    sku: "SYR29G",
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 0,
    tags: ["accessories", "syringes", "laboratory"],
    variants: [
      { id: "v_syr_10", size: "10-pack", price: 8.99, sku: "SYR-29G-10", stock: 2000, is_default: true, order: 0 },
      { id: "v_syr_50", size: "50-pack", price: 34.99, sku: "SYR-29G-50", stock: 1000, order: 1 },
    ],
  },
  {
    id: "p_pad",
    name: "Alcohol Prep Pads (50-pack)",
    slug: "alcohol-prep-pads",
    description: "Sterile prep pads for laboratory surface and equipment preparation workflows.",
    short_description: "Prep pads for lab hygiene workflows.",
    category_id: "cat_research_accessories",
    base_price: 5.99,
    sku: "PREPPAD",
    is_featured: 0,
    is_best_seller: 0,
    subscription_eligible: 0,
    tags: ["accessories", "prep pads", "alcohol wipes"],
    variants: [{ id: "v_pad_50", size: "50-pack", price: 5.99, sku: "PREPPAD-50", stock: 2000, is_default: true, order: 0 }],
  },
];

const bundles: Array<{
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at: number;
  discount_percent: number;
  items: Array<{ variant_id: string; qty: number }>;
}> = [
  {
    id: "b_wolv",
    name: "Multi-Compound Research Set (BPC-157 / TB-500)",
    slug: "multi-compound-research-set-bpc-tb",
    description: "BPC-157 5mg + TB-500 5mg for comparative analytical and preclinical research workflows.",
    price: 64.99,
    compare_at: 72.98,
    discount_percent: 11,
    items: [
      { variant_id: "v_bpc_5", qty: 1 },
      { variant_id: "v_tb_5", qty: 1 },
    ],
  },
  {
    id: "b_growth",
    name: "Comparative Secretagogue Research Set (CJC / Ipamorelin)",
    slug: "comparative-secretagogue-set-cjc-ipa",
    description: "CJC-1295 (2mg) + Ipamorelin (2mg) for comparative secretagogue pathway research.",
    price: 37.99,
    compare_at: 45.98,
    discount_percent: 17,
    items: [
      { variant_id: "v_cjc_2", qty: 1 },
      { variant_id: "v_ipa_2", qty: 1 },
    ],
  },
  {
    id: "b_long",
    name: "Multi-Compound Research Set (NAD+ / GHK-Cu / Epitalon)",
    slug: "multi-compound-research-set-nad-ghk-epit",
    description: "NAD+ 500mg + GHK-Cu 50mg + Epitalon 10mg for multi-analyte laboratory assay panels.",
    price: 124.99,
    compare_at: 139.97,
    discount_percent: 11,
    items: [
      { variant_id: "v_nad_500", qty: 1 },
      { variant_id: "v_ghk_50", qty: 1 },
      { variant_id: "v_epit_10", qty: 1 },
    ],
  },
  {
    id: "b_rec",
    name: "Laboratory Preparation Set (BPC-157 / TB-500 / Accessories)",
    slug: "laboratory-prep-set-bpc-tb-accessories",
    description: "BPC-157 + TB-500 + reconstitution and handling accessories for laboratory preparation workflows.",
    price: 94.99,
    compare_at: 107.95,
    discount_percent: 12,
    items: [
      { variant_id: "v_bpc_5", qty: 1 },
      { variant_id: "v_tb_5", qty: 1 },
      { variant_id: "v_bac_30", qty: 3 },
      { variant_id: "v_syr_10", qty: 1 },
    ],
  },
];

const related: Array<[string, string, string]> = [
  ["p_bpc157", "p_tb500", "research_set"],
  ["p_bpc157", "p_blend_bpc_tb", "frequently_bought"],
  ["p_bpc157", "p_bac", "related"],
  ["p_tb500", "p_bpc157", "research_set"],
  ["p_tb500", "p_blend_bpc_tb", "frequently_bought"],
  ["p_tb500", "p_bac", "related"],
  ["p_cjc", "p_ipa", "research_set"],
  ["p_cjc", "p_cjc_ipa_blend", "frequently_bought"],
  ["p_ipa", "p_cjc", "research_set"],
  ["p_ipa", "p_cjc_ipa_blend", "frequently_bought"],
  ["p_ghk", "p_nad", "related"],
  ["p_ghk", "p_epit", "related"],
  ["p_nad", "p_mots", "related"],
  ["p_nad", "p_ghk", "related"],
  ["p_nad", "p_epit", "related"],
];

const discounts = [
  { code: "WELCOME10", type: "percentage", value: 10, min: null as number | null, max: null as number | null },
  { code: "FREESHIP", type: "free_shipping", value: 0, min: null, max: null },
  { code: "RESEARCH15", type: "percentage", value: 15, min: 150, max: null },
];

async function main() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "related_products",
      "bundle_items",
      "bundles",
      "lab_reports",
      "variants",
      "products",
      "categories",
      "reviews",
      "discount_codes",
      "newsletter_signups",
      "loyalty_transactions",
      "referrals",
      "abandoned_carts",
      "email_sequences",
      "subscription_items",
      "subscriptions",
      "orders",
      "addresses",
      "users"
    RESTART IDENTITY CASCADE
  `);

  await prisma.categories.createMany({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      display_order: c.display_order,
    })),
  });

  for (const p of products) {
    const tags = JSON.stringify(p.tags);
    await prisma.products.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        short_description: p.short_description ?? null,
        scientific_name: p.scientific_name ?? null,
        category_id: p.category_id,
        images: IMG,
        base_price: p.base_price,
        compare_price_at: p.compare_price_at ?? null,
        sku: p.sku,
        purity: p.purity ?? null,
        molecular_formula: p.molecular_formula ?? null,
        cas_number: p.cas_number ?? null,
        storage_instructions: p.storage_instructions ?? null,
        cycle_length_days: p.cycle_length_days ?? null,
        is_active: 1,
        is_featured: p.is_featured,
        is_best_seller: p.is_best_seller,
        subscription_eligible: p.subscription_eligible,
        tags,
        seo_title: `${p.name} · Laboratory research material`,
        seo_description: (p.short_description ?? p.description).slice(0, 160),
      },
    });

    await prisma.variants.createMany({
      data: p.variants.map((v) => ({
        id: v.id,
        product_id: p.id,
        size: v.size,
        price: v.price,
        compare_at: v.compare_at ?? null,
        sku: v.sku,
        stock_qty: v.stock,
        low_stock_threshold: 10,
        is_default: v.is_default ? 1 : 0,
        display_order: v.order,
      })),
    });

    await prisma.lab_reports.create({
      data: {
        id: nanoid(),
        product_id: p.id,
        batch_number: `BATCH-${p.sku}-001`,
        lab_name: "NorthStar Analytics Lab",
        purity: p.purity ?? 99.0,
        report_url: "https://example.com/coa/sample.pdf",
        tested_at: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
        is_current: 1,
      },
    });
  }

  const variantToProduct = new Map<string, string>();
  for (const p of products) {
    for (const v of p.variants) {
      variantToProduct.set(v.id, p.id);
    }
  }

  for (const b of bundles) {
    await prisma.bundles.create({
      data: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        price: b.price,
        compare_at: b.compare_at,
        discount_percent: b.discount_percent,
        image: "/placeholder-peptide.svg",
        is_active: 1,
      },
    });

    for (const it of b.items) {
      const productId = variantToProduct.get(it.variant_id);
      if (!productId) {
        throw new Error(`Unknown variant id in bundle: ${it.variant_id}`);
      }
      await prisma.bundle_items.create({
        data: {
          id: nanoid(),
          bundle_id: b.id,
          product_id: productId,
          variant_id: it.variant_id,
          quantity: it.qty,
        },
      });
    }
  }

  await prisma.related_products.createMany({
    data: related.map(([product_id, related_id, relation_type]) => ({
      product_id,
      related_id,
      relation_type,
    })),
  });

  for (const d of discounts) {
    await prisma.discount_codes.create({
      data: {
        id: nanoid(),
        code: d.code,
        type: d.type,
        value: d.value,
        min_order_value: d.min,
        max_uses: d.max,
        expires_at: null,
        is_active: 1,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD || "changeme123";
  const adminId = nanoid();
  const referral = nanoid(10);
  const hash = bcrypt.hashSync(adminPass, 12);

  await prisma.users.create({
    data: {
      id: adminId,
      email: adminEmail,
      name: "Admin",
      password_hash: hash,
      role: "admin",
      loyalty_points: 0,
      referral_code: referral,
      email_consent: 1,
    },
  });

  await prisma.reviews.createMany({
    data: [
      {
        id: nanoid(),
        product_id: "p_bpc157",
        user_id: adminId,
        rating: 5,
        title: "Clean COA workflow",
        body: "Documentation was clear and the certificate matched the batch labeling in our receiving QC checklist.",
        is_verified: 1,
        is_approved: 1,
      },
      {
        id: nanoid(),
        product_id: "p_ghk",
        user_id: adminId,
        rating: 5,
        title: "Consistent specification records",
        body: "Received materials and records were aligned: lot identifiers, purity summary, and report links were all easy to reconcile.",
        is_verified: 1,
        is_approved: 1,
      },
      {
        id: nanoid(),
        product_id: "p_nad",
        user_id: adminId,
        rating: 4,
        title: "Solid packaging and documentation",
        body: "Packaging integrity was good on arrival and the accompanying documentation was sufficient for internal receiving and inventory checks.",
        is_verified: 1,
        is_approved: 1,
      },
    ],
  });

  console.log("Seed complete. Admin:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
