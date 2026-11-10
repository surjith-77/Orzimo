// ==============================================================================
// ORZIMO OFFICIAL MARKETPLACE TAXONOMY CATEGORIES
// ==============================================================================
// Core multi-category product catalog taxonomy.
// ==============================================================================

export const CATEGORIES = [
  {
    id: "cakes-bakery",
    name: "Cakes & Bakery",
    shortName: "Cakes & Bakery",
    icon: "Cake",
    description: "Custom celebration cakes, bento cakes, cupcakes, artisan breads & cookies fresh from home ovens.",
    itemCount: "Fresh Bakes",
    gradient: "linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%)",
    bgLight: "#FFF5F5",
    subcategories: ["Birthday Cakes", "Bento Cakes", "Cupcakes & Brownies", "Eggless Specials", "Artisanal Breads", "Tea Time Bakes"]
  },
  {
    id: "candles-fragrances",
    name: "Candles & Fragrances",
    shortName: "Candles & Fragrance",
    icon: "Flame",
    description: "Hand-poured scented soy wax candles, reed diffusers, aroma melts & home fragrances.",
    itemCount: "Home Aromas",
    gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    bgLight: "#FFF7ED",
    subcategories: ["Scented Soy Candles", "Beeswax Candles", "Wax Melts", "Reed Diffusers", "Aroma Essential Oils"]
  },
  {
    id: "handmade-gifts",
    name: "Handmade Gifts",
    shortName: "Handmade Gifts",
    icon: "Gift",
    description: "Curated gift hampers, memory scrapbooks, crochet treasures & handcrafted personalized keepsakes.",
    itemCount: "Custom Gifts",
    gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    bgLight: "#F5F3FF",
    subcategories: ["Gift Hampers", "Memory Albums", "Crochet Items", "Greeting Cards", "Festive Boxes", "Personalized Keepsakes"]
  },
  {
    id: "art-crafts",
    name: "Art & Crafts",
    shortName: "Art & Crafts",
    icon: "Palette",
    description: "Original canvas paintings, Mandala wall plates, Lippan art, pottery & DIY craft starter kits.",
    itemCount: "Original Artwork",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
    bgLight: "#EFF6FF",
    subcategories: ["Lippan Art", "Mandala Wall Plates", "Canvas Paintings", "Resin Clocks", "DIY Craft Kits", "Pottery"]
  },
  {
    id: "clothing-accessories",
    name: "Clothing & Accessories",
    shortName: "Clothing",
    icon: "Scissors",
    description: "Bespoke handloom apparel, hand-block printed kurtas, customized dresses, scarves & accessories.",
    itemCount: "Bespoke Fashion",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bgLight: "#ECFDF5",
    subcategories: ["Custom Stitched Blouses", "Hand-Block Kurtas", "Kids Festive Wear", "Bespoke Dresses", "Dupattas & Scarves"]
  },
  {
    id: "electronics",
    name: "Electronics",
    shortName: "Electronics",
    icon: "Cpu",
    description: "Smart gadgets, audio gear, developer & maker boards, smart home kits, cables & electronic accessories.",
    itemCount: "Smart Tech",
    gradient: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
    bgLight: "#F0F9FF",
    subcategories: ["Audio & Headphones", "Smart Home Devices", "Maker & Sensor Boards", "Chargers & Power Banks", "Tech Accessories"]
  },
  {
    id: "machinery-equipment",
    name: "Machinery & Equipment",
    shortName: "Machinery",
    icon: "Wrench",
    description: "Light industrial tools, kitchen studio machinery, craft power tools, presses & workshop equipment.",
    itemCount: "Industrial & Studio",
    gradient: "linear-gradient(135deg, #475569 0%, #1E293B 100%)",
    bgLight: "#F8FAFC",
    subcategories: ["Studio Mixers & Blenders", "Woodworking Tools", "Heat Presses", "Power Tools", "Machinery Spares"]
  },
  {
    id: "furniture-decor",
    name: "Furniture & Home Decor",
    shortName: "Furniture & Decor",
    icon: "Home",
    description: "Solid wood tables, accent chairs, macrame wall hangings, ceramic vases & handcrafted home accents.",
    itemCount: "Home Living",
    gradient: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
    bgLight: "#FEF3C7",
    subcategories: ["Accent Tables", "Solid Wood Chairs", "Wall Hangings", "Ceramic Vases", "Table Lamps", "Planters"]
  },
  {
    id: "food-beverages",
    name: "Food & Beverages",
    shortName: "Food & Drinks",
    icon: "UtensilsCrossed",
    description: "Artisanal spice blends, organic pickles, roasted granolas, regional snacks, cold brews & teas.",
    itemCount: "Gourmet Foods",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    bgLight: "#FFFBEB",
    subcategories: ["Organic Pickles", "Traditional Sweets", "Namkeen & Snacks", "Specialty Teas & Coffees", "Granolas & Nuts"]
  },
  {
    id: "other-products",
    name: "Other Products",
    shortName: "Other Products",
    icon: "Package",
    description: "Custom artisan inventions, specialty supplies, bespoke craft goods & miscellaneous merchandise.",
    itemCount: "Specialty Items",
    gradient: "linear-gradient(135deg, #64748B 0%, #334155 100%)",
    bgLight: "#F1F5F9",
    subcategories: ["Bespoke Inventions", "Craft Supplies", "Novelty Goods", "General Merchandise"]
  }
];

export const CATEGORY_NAMES = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.name;
  return acc;
}, {
  // Legacy alias fallbacks
  'candles-decor': 'Candles & Fragrances',
  'clothing-tailoring': 'Clothing & Accessories',
  'homemade-foods': 'Food & Beverages',
  'personalized-products': 'Handmade Gifts',
  'party-decorations': 'Handmade Gifts',
  'workshops-classes': 'Other Products'
});
