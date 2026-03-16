
import { IconName } from '../components/Icon';

export const CATEGORIES_DATA: Record<string, string[]> = {
  'Ready-Mix Concrete': ['Ready-Mix Concrete (RMC)', 'Concrete Batching', 'Concrete Pumps', 'Special Concrete'],
  'Contractors': ['Civil Contractors', 'Turnkey Contractors', 'Labour Contractors', 'Interior Contractors'],
  'Building Materials': ['Cement & Aggregates', 'Bricks & Blocks', 'Steel & TMT', 'Sand & Soil'],
  'Architecture & Design': ['Architects', 'Interior Designers', 'Structural Engineers', 'Vastu Consultants'],
  'Equipment Rental': ['Excavators', 'Cranes', 'Scaffolding', 'Generators'],
};

export const ALL_SUBCATEGORIES = Object.values(CATEGORIES_DATA).flat();

export const SUB_TO_MAIN_CATEGORY_MAP: Record<string, string> = {};
for (const mainCategory in CATEGORIES_DATA) {
  for (const subCategory of CATEGORIES_DATA[mainCategory]) {
    SUB_TO_MAIN_CATEGORY_MAP[subCategory] = mainCategory;
  }
}

export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon"],
    "Goa": ["North Goa", "South Goa", "Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Hamirpur", "Kullu"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belagavi", "Ballari", "Kalaburagi", "Udupi"],
    "Kerala": ["Thiruvananthapuram", "Kollam", "Alappuzha", "Pathanamthitta", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna"],
    "Maharashtra": ["Mumbai", "Pune", "Nashik", "Aurangabad", "Solapur", "Amravati", "Thane", "Kolhapur"],
    "Manipur": ["Imphal", "Churachandpur", "Thoubal"],
    "Meghalaya": ["Shillong", "Tura", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
    "Rajasthan": ["Refine regional rates", "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Noida", "Bareilly", "Aligarh"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur", "Bardhaman", "Malda"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Lakshadweep": ["Kavaratti"],
    "Delhi": ["Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "New Delhi"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Ladakh": ["Leh", "Kargil"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"]
};

export const KERALA_DISTRICTS: string[] = STATE_DISTRICTS_MAP["Kerala"];

export interface MaterialRate {
    name: string;
    unit: string;
    priceRange: string;
    trend: 'up' | 'down' | 'stable';
}

export const MATERIAL_MARKET_DATA: Record<string, MaterialRate[]> = {
    "Default": [
        { name: "OPC 53 Grade Cement", unit: "50kg Bag", priceRange: "₹420 - ₹460", trend: 'up' },
        { name: "TMT Steel (Fe550D)", unit: "MT", priceRange: "₹68,000 - ₹72,000", trend: 'down' },
        { name: "M-Sand (Graded)", unit: "Cu.ft", priceRange: "₹55 - ₹65", trend: 'stable' },
        { name: "P-Sand (Plastering)", unit: "Cu.ft", priceRange: "₹85 - FB95", trend: 'up' },
        { name: "20mm Aggregates", unit: "Cu.ft", priceRange: "₹45 - ₹52", trend: 'stable' },
        { name: "Wire-cut Red Bricks", unit: "1000 Pcs", priceRange: "₹9,500 - ₹11,000", trend: 'up' },
        { name: "Laterite Stones (Standard)", unit: "Pc", priceRange: "₹42 - ₹55", trend: 'stable' },
        { name: "Solid Blocks (12x8x4)", unit: "Pc", priceRange: "₹32 - ₹38", trend: 'down' }
    ],
    "Ernakulam": [
        { name: "OPC 53 Grade Cement", unit: "50kg Bag", priceRange: "₹435 - ₹475", trend: 'up' },
        { name: "TMT Steel (Fe550D)", unit: "MT", priceRange: "₹70,500 - ₹74,000", trend: 'stable' },
        { name: "M-Sand (Graded)", unit: "Cu.ft", priceRange: "₹62 - ₹70", trend: 'up' },
        { name: "P-Sand (Plastering)", unit: "Cu.ft", priceRange: "₹92 - FB105", trend: 'up' },
        { name: "20mm Aggregates", unit: "Cu.ft", priceRange: "₹48 - ₹55", trend: 'stable' }
    ],
    "Bengaluru": [
        { name: "OPC 53 Grade Cement", unit: "50kg Bag", priceRange: "₹380 - ₹420", trend: 'stable' },
        { name: "TMT Steel (Fe550D)", unit: "MT", priceRange: "₹65,000 - ₹69,000", trend: 'down' },
        { name: "River Sand (Washed)", unit: "Load", priceRange: "₹45,000 - ₹55,000", trend: 'up' }
    ]
};

export interface CalculatorTool {
    id: string;
    name: string;
    icon: IconName;
    description?: string;
    instructions?: string[];
    aiPrompt?: string;
}

export interface CalculatorCategory {
    title: string;
    description: string;
    tools: CalculatorTool[];
}

export const CALCULATOR_TOOLS: CalculatorCategory[] = [
  {
    title: 'AI Intelligence',
    description: 'Advanced AI-powered estimation tools',
    tools: [
      { 
        id: 'ai-site-analyzer', 
        name: 'AI Site Analyzer Coming Soon', 
        icon: 'camera',
        description: 'Analyze uploaded site photos or blueprints to extract dimensions, identify potential structural issues, and suggest material optimizations and estimation.',
        aiPrompt: "Analyze this site photo/blueprint. Extract visible dimensions, identify any potential structural issues or hazards, and suggest material optimizations and estimation based on the visual data.",
        instructions: ["Upload site photo or blueprint", "AI extracts dimensions", "AI identifies structural issues", "Review material optimizations and estimation"]
      },
      { 
        id: 'image-editor', 
        name: 'AI Image Editor-Coming Soon', 
        icon: 'camera',
        description: 'Create or edit images using text prompts with Nano Banana 2.',
        aiPrompt: "Generate a futuristic cityscape...",
        instructions: ["Enter a text prompt", "Optionally upload an image to edit", "Generate or edit image"]
      },
      { 
        id: 'design-gen', 
        name: 'AI Design Generator', 
        icon: 'camera',
        description: 'Generate photorealistic 3D architectural visualizations from sketches, images, or PDF plans.',
        aiPrompt: "Generate a photorealistic 3D render for a Kerala Style Villa with 2500 sq.ft built-up area and traditional sloped roof...",
        instructions: ["Specify building type, style, and area", "Select camera view and lighting", "Upload blueprint, sketch, or photo", "Choose resolution and generate 3D render"]
      },
      { 
        id: 'ai-material-discovery', 
        name: 'AI Material Discovery', 
        icon: 'search',
        description: 'Describe specialized construction materials to find suitable technical specs and verified local suppliers.',
        aiPrompt: "Find high-strength concrete for coastal areas with corrosion resistance and suggest local RMC suppliers in Kochi...",
        instructions: ["Describe the material need", "Specify project location", "AI identifies technical grades", "Finds matching local providers"]
      },
      { 
        id: 'ai-service-finder', 
        name: 'Local Service Finder', 
        icon: 'location',
        description: 'Find construction professionals, contractors, and specialized services in Kerala using real-time Google Maps data.',
        aiPrompt: "Find experienced civil contractors and interior designers in Ernakulam...",
        instructions: ["Select the type of service needed", "Specify the district in Kerala", "AI finds verified professionals via Google Maps", "Get contact details and map links"]
      },
      { 
        id: 'ai-takeoff', 
        name: 'AI Quantity Takeoff', 
        icon: 'document-text',
        description: 'Extract material quantities directly from structural drawings, blueprints, and PDF plans using neural vision.',
        aiPrompt: "Perform a structural takeoff from this drawing and list all material quantities in a table...",
        instructions: ["Select takeoff focus area", "Upload PDF drawing or blueprint", "AI analyzes structural elements", "Get itemized BOQ table"]
      },
      { 
        id: 'ai-peb', 
        name: 'AI Steel Structure / PEB', 
        icon: 'crane',
        description: 'Specialized neural analysis for Pre-Engineered Buildings and structural steel frameworks.',
        aiPrompt: "Analyze this PEB drawing and provide a weight breakdown for primary and secondary members...",
        instructions: ["Upload PEB fabrication plan", "Describe focus area", "Analyze structural members", "Get weight report"]
      },
      { 
        id: 'ai-cost', 
        name: 'AI Cost Estimator', 
        icon: 'calculator',
        description: 'Project total project costs using regional rates and material grades.',
        aiPrompt: "Estimate the total construction cost for a 3-storey commercial building in Ernakulam with premium finishes...",
        instructions: ["Enter total built-up area", "Select construction grade", "Specify project location", "View stage-wise cost breakdown"]
      },
      { 
        id: 'ai-carbon', 
        name: 'Embodied Carbon AI', 
        icon: 'leaf',
        description: 'Analyze the environmental impact and CO2 footprint of your material choices.',
        aiPrompt: "Calculate the embodied carbon for 200 cubic meters of M25 concrete vs 15000 fly ash bricks...",
        instructions: ["Input material quantities", "Select material types", "Compare environmental impact", "Get sustainability report"]
      },
      { 
        id: 'ai-helper', 
        name: 'General AI Helper', 
        icon: 'chat',
        description: 'Technical assistant for site queries, IS codes, and administrative construction tasks.',
        aiPrompt: "Explain the curing requirements for reinforced concrete columns as per IS 456-2000...",
        instructions: ["Type technical query", "Attach site photos or PDF reports", "Get standard-based advice", "Draft site emails/reports"]
      },
    ]
  },
  {
    title: 'Structural & Civil',
    description: 'Core structural element calculations',
    tools: [
      { id: 'material-estimation', name: 'Material Estimation', icon: 'calculator', description: 'Generic estimator for lumber, drywall, and custom materials by dimension.', instructions: ["Pick material type", "Enter dimensions (L x W x H)", "Set waste % and unit price", "View total quantity and cost"] },
      { id: 'concrete', name: 'Concrete & Cement', icon: 'building', description: 'Calculate concrete volumes and material bag counts for structural members.', instructions: ["Pick concrete mix grade", "Enter length/width/depth", "Get bag counts for cement/sand/stone"] },
      { id: 'bricks', name: 'Bricks & Blocks', icon: 'squares-plus', description: 'Estimate bricks/blocks for any wall area with wastage adjustments.', instructions: ["Input wall dimensions", "Select brick/block type", "Add door/window deductions", "Get total count with wastage"] },
      { id: 'rebar', name: 'Steel Rebar', icon: 'bolt', description: 'Calculate rebar weights for diameters 6mm to 32mm including wastage.', instructions: ["Select diameter (mm)", "Enter span length and count", "View total weight in KG and Tonnes"] },
      { id: 'steel-weight', name: 'Steel Weight Calculation', icon: 'crane', description: 'Calculate total weight of steel sections like I-beams, Channels, and Angles for structural framing.', instructions: ["Select section type (I-beam, Angle, etc.)", "Input length and unit weight", "Choose steel grade (Fe 250, Fe 350)", "Get total tonnage estimate"] },
      { id: 'plastering', name: 'Plastering', icon: 'refresh', description: 'Calculate cement and sand requirements for wall plastering.', instructions: ["Enter wall area", "Select plaster thickness", "Choose mix ratio (1:4, 1:6)", "Get material breakdown"] },
      { id: 'rakewall', name: 'Rake Walls', icon: 'building', description: 'Specialized area/volume calculator for sloped or gable walls.', instructions: ["Enter base length", "Input start and peak height", "Specify thickness", "Calculate volume/area"] },
      { id: 'staircase', name: 'Stair Calculator', icon: 'chevron-down', description: 'Design stair geometry, including riser/tread counts and concrete volume.', instructions: ["Enter total height", "Set preferred riser height", "Get tread count", "View concrete volume estimate"] },
    ]
  },
  {
    title: 'Foundation',
    description: 'Geotechnical and foundation tools',
    tools: [
      { id: 'excavation-vol', name: 'Excavation Volume', icon: 'tractor', description: 'Calculate earthwork excavation volumes for foundations or pits with unit flexibility.', instructions: ["Enter length and width", "Set depth of excavation", "Choose units (m or ft)", "View total volume"] },
      { id: 'foundation-indep', name: 'Independent Footing', icon: 'cube', description: 'Excavation and concrete volume for isolated column footings.', instructions: ["Enter footing dims", "Set depth of excavation", "Input concrete grade", "Get full material survey"] },
      { id: 'foundation-raft', name: 'Raft Foundation', icon: 'squares-plus', description: 'Detailed material survey for large raft foundations.', instructions: ["Input raft length/width", "Specify depth", "Select rebar mesh details", "Calculate total concrete/steel"] },
      { 
        id: 'foundation-piling', 
        name: 'Piling Works (Vol)', 
        icon: 'tractor', 
        description: 'Advanced estimator for pile concrete volumes, reinforcement, and soil context analysis.', 
        instructions: [
          "Select pile diameter (mm)", 
          "Enter depth & count", 
          "Upload Soil Report or Pile Plan for AI validation", 
          "Calculate concrete and steel breakdown"
        ] 
      },
      { 
        id: 'pile-design', 
        name: 'Pile Capacity Design', 
        icon: 'chart-bar', 
        description: 'Geotechnical pile capacity analysis for ultimate and safe load carrying capacity.', 
        instructions: ["Enter pile diameter & depth", "Input soil cohesion (Cu)", "Set adhesion factor (Alpha)", "Calculate Safe Load Capacity"] 
      },
      { 
        id: 'soil-test', 
        name: 'Soil Test & Sampling', 
        icon: 'leaf', 
        description: 'Expert recommendations for soil sampling frequency, timing, and interpreting lab reports for crop NPK needs.', 
        aiPrompt: "Provide a soil sampling and testing plan for a 5-acre site used for [Crop Type] with last fertilizer application on [Date]...",
        instructions: [
          "Choose sampling timing (late summer/fall)", 
          "Define representative zigzag pattern", 
          "Ensure sampling depth matches crop type", 
          "Interpret lab results for NPK balance"
        ] 
      },
      { 
        id: 'shuttering', 
        name: 'Formwork / Shuttering', 
        icon: 'squares-plus', 
        description: 'Estimate formwork area (sq.m/sq.ft) for columns, beams, and slabs with material thumb rules.', 
        aiPrompt: "Calculate total shuttering area and material requirements (plywood, battens) for a project with [List elements]...",
        instructions: [
          "Select element (Column/Beam/Slab)", 
          "Input dimensions (Perimeter x Height)", 
          "Account for monolithic casting offsets", 
          "Apply material multiplication factors"
        ] 
      },
    ]
  },
  {
    title: 'Interiors & Finishing',
    description: 'Finishing materials and quantities',
    tools: [
      { id: 'tiles', name: 'Flooring & Tiles', icon: 'apps', description: 'Total tile count and adhesive bags required for floors/walls.', instructions: ["Enter room area", "Input tile size", "Set joint thickness", "Get box and adhesive count"] },
      { id: 'paint', name: 'Painting & Putty', icon: 'leaf', description: 'Estimate primer, putty, and paint for multiple coats.', instructions: ["Calculate surface area", "Select surface type", "Set number of coats", "Get total liters needed"] },
      { id: 'kitchen', name: 'Modular Kitchen (AI)', icon: 'cube', description: 'Plan layouts and estimate carcasses/shutters.', instructions: ["Select kitchen shape", "Enter wall lengths", "Pick material types", "Get component estimate"] },
      { id: 'wardrobes', name: 'Wardrobes (AI)', icon: 'squares-plus', description: 'Material and hardware takeoff for customized wardrobes.', instructions: ["Enter wardrobe dimensions", "Select shelf configurations", "Choose shutter material", "Get board/hardware list"] },
      { id: 'ceiling', name: 'False Ceiling (AI)', icon: 'apps', description: 'Framework and board requirements for POP or Gypsum ceilings.', instructions: ["Measure room area", "Choose ceiling pattern", "Select material (Gypsum/PVC)", "Get channel/board count"] },
    ]
  },
  {
    title: 'MEP Services',
    description: 'Mechanical, Electrical & Plumbing',
    tools: [
      { id: 'electrical', name: 'Electrical (AI)', icon: 'bolt', description: 'Predict wiring lengths and conduit counts based on floor area.', instructions: ["Input room counts", "Define building type", "Add heavy loads (AC/WH)", "Get wiring/conduit estimate"] },
      { id: 'plumbing', name: 'Plumbing (AI)', icon: 'refresh', description: 'Fixture and pipe estimation for residential plumbing.', instructions: ["Select bathroom count", "Define supply source", "Enter resident count", "Get fixture/pipe schedule"] },
    ]
  },
  {
    title: 'Tools & Utilities',
    description: 'Everyday utility tools',
    tools: [
      { id: 'material-cost', name: 'Material Database', icon: 'database', description: 'Real-time updated construction material prices.', instructions: ["Select material type", "Choose district/region", "Compare brand rates", "View historical trends"] },
      { id: 'unit-converter', name: 'Unit Converter', icon: 'refresh', description: 'Instant conversion between engineering units (Cent/Ares/SI).', instructions: ["Input numerical value", "Select 'From' unit", "Select 'To' unit", "Get precise conversion"] },
      { id: 'invoice-gen', name: 'Invoice Generator', icon: 'document-text', description: 'Create professional construction invoices and billing sheets.', instructions: ["Enter client details", "Add billable items", "Calculate GST/Taxes", "Download as PDF"] },
    ]
  }
];
