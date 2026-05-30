export type ChemicalType = 'liquid' | 'solid' | 'gas';
export type LocalizedString = { EN: string; VN: string };

export interface Chemical {
    id: string;
    name: LocalizedString;
    formula: string;
    color: string; // Hex color for the liquid/solid
    type: ChemicalType;
    ph: number;
    description: LocalizedString;
    isOrganic: boolean;
}

export const CHEMICAL_REGISTRY: Record<string, Chemical> = {
    // === INORGANIC BASE ===
    'H2O': {
        id: 'H2O',
        name: { EN: 'Distilled Water', VN: 'Nước Cất' },
        formula: 'H₂O',
        color: '#a5f3fc', // Very light blue/cyan for water clarity
        type: 'liquid',
        ph: 7.0,
        description: { EN: 'Pure distilled water.', VN: 'Nước tinh khiết.' },
        isOrganic: false
    },
    'HCl': {
        id: 'HCl',
        name: { EN: 'Hydrochloric Acid', VN: 'Axit Clohydric' },
        formula: 'HCl',
        color: '#f8fafc',
        type: 'liquid',
        ph: 1.0,
        description: { EN: 'Strong mineral acid.', VN: 'Axit vô cơ mạnh.' },
        isOrganic: false
    },
    'NaOH': {
        id: 'NaOH',
        name: { EN: 'Sodium Hydroxide', VN: 'Natri Hydroxit' },
        formula: 'NaOH',
        color: '#ffffff',
        type: 'liquid',
        ph: 14.0,
        description: { EN: 'Strong base, caustic soda.', VN: 'Bazơ mạnh, xút ăn da.' },
        isOrganic: false
    },
    'COPPER_SULFATE': {
        id: 'COPPER_SULFATE',
        name: { EN: 'Copper(II) Sulfate', VN: 'Đồng(II) Sunfat' },
        formula: 'CuSO₄',
        color: '#3b82f6', // Vivid blue
        type: 'liquid',
        ph: 4.0,
        description: { EN: 'Blue inorganic solution.', VN: 'Dung dịch vô cơ màu xanh lam.' },
        isOrganic: false
    },

    // === ORGANIC COMPOUNDS ===
    'ETHANOL': {
        id: 'ETHANOL',
        name: { EN: 'Ethanol', VN: 'Etanol' },
        formula: 'C₂H₅OH',
        color: '#f1f5f9', // Clear, slightly viscous look
        type: 'liquid',
        ph: 7.3,
        description: { EN: 'Primary alcohol, volatile and flammable.', VN: 'Cồn chính, dễ bay hơi và dễ cháy.' },
        isOrganic: true
    },
    'GLUCOSE_SOL': {
        id: 'GLUCOSE_SOL',
        name: { EN: 'Glucose Solution', VN: 'Dung dịch Glucozơ' },
        formula: 'C₆H₁₂O₆ (aq)',
        color: '#fef3c7', // Very faint yellow/clear
        type: 'liquid',
        ph: 7.0,
        description: { EN: 'Simple sugar dissolved in water.', VN: 'Đường đơn hòa tan trong nước.' },
        isOrganic: true
    },
    'ACETIC_ACID': {
        id: 'ACETIC_ACID',
        name: { EN: 'Acetic Acid (Vinegar)', VN: 'Axit Axetic (Giấm)' },
        formula: 'CH₃COOH',
        color: '#fafafa',
        type: 'liquid',
        ph: 2.4,
        description: { EN: 'Weak organic acid found in vinegar.', VN: 'Axit hữu cơ yếu có trong giấm.' },
        isOrganic: true
    },
    'PHENOLPHTHALEIN': {
        id: 'PHENOLPHTHALEIN',
        name: { EN: 'Phenolphthalein', VN: 'Phenolphtalein' },
        formula: 'C₂₀H₁₄O₄',
        color: '#ffffff', // Clear until activated
        type: 'liquid',
        ph: 7.0,
        description: { EN: 'Acid-base indicator. Turns pink in base.', VN: 'Chất chỉ thị axit-bazơ. Hóa hồng trong môi trường bazơ.' },
        isOrganic: true
    },
    'HEXANE': {
        id: 'HEXANE',
        name: { EN: 'Hexane', VN: 'Hexan' },
        formula: 'C₆H₁₄',
        color: '#f8fafc',
        type: 'liquid',
        ph: 7.0,
        description: { EN: 'Non-polar hydrocarbon solvent.', VN: 'Dung môi hydrocacbon không phân cực.' },
        isOrganic: true
    },
    // Adding some solids for variety
    'SODIUM': {
        id: 'SODIUM',
        name: { EN: 'Sodium Metal', VN: 'Kim loại Natri' },
        formula: 'Na',
        color: '#94a3b8',
        type: 'solid',
        ph: 7.0,
        description: { EN: 'Highly reactive alkali metal.', VN: 'Kim loại kiềm phản ứng mạnh.' },
        isOrganic: false
    },

    // Resultants
    'SALT_WATER': {
        id: 'SALT_WATER',
        name: { EN: 'Salt Water', VN: 'Nước Muối' },
        formula: 'NaCl (aq)',
        color: '#e0f2fe',
        type: 'liquid',
        ph: 7.0,
        description: { EN: 'Sodium chloride dissolved in water.', VN: 'Natri clorua hòa tan trong nước.' },
        isOrganic: false
    },
    'PINK_BASE': {
        id: 'PINK_BASE',
        name: { EN: 'Basic Solution (Indicator)', VN: 'Dung dịch Kiềm (Chỉ thị)' },
        formula: 'OH⁻ + Ind',
        color: '#f472b6', // Pink
        type: 'liquid',
        ph: 10.0,
        description: { EN: 'Alkaline solution showing pink phenolphthalein.', VN: 'Dung dịch kiềm có màu hồng của phenolphtalein.' },
        isOrganic: false
    }
};

export interface ReactionRule {
    reactants: [string, string];
    product: string;
    productColor?: string; // Override color if needed
    message: LocalizedString;
    effect?: 'bubbles' | 'smoke' | 'fire' | 'explosion';
    temperatureSpike?: number;
}

export const REACTION_RULES: ReactionRule[] = [
    {
        reactants: ['HCl', 'NaOH'],
        product: 'SALT_WATER',
        message: { EN: 'Neutralization reaction: Acid + Base yields Salt + Water.', VN: 'Phản ứng trung hòa: Axit + Bazơ tạo ra Muối + Nước.' },
        temperatureSpike: 15
    },
    {
        reactants: ['SODIUM', 'H2O'],
        product: 'NaOH',
        message: { EN: 'Violent exothermic reaction! Sodium reacts with water to form Hydrogen gas and Sodium Hydroxide.', VN: 'Phản ứng tỏa nhiệt mạnh! Natri phản ứng với nước tạo khí Hydro và Natri Hydroxit.' },
        effect: 'explosion',
        temperatureSpike: 80
    },
    {
        reactants: ['PHENOLPHTHALEIN', 'NaOH'],
        product: 'PINK_BASE',
        message: { EN: 'Indicator activation. Phenolphthalein turns bright pink in an alkaline (basic) solution.', VN: 'Kích hoạt chất chỉ thị. Phenolphtalein chuyển sang màu hồng rực rỡ trong dung dịch kiềm (bazơ).' }
    },
    // Just a placeholder organic reaction for now
    {
        reactants: ['ETHANOL', 'ACETIC_ACID'],
        product: 'H2O', // Simplified esterification requires acid catalyst and heat, but we map to water for now as placeholder
        message: { EN: 'Esterification reaction (simplified). Forms Ethyl Acetate and Water (requires H2SO4 catalyst in reality).', VN: 'Phản ứng este hóa (đơn giản hóa). Tạo ra Etyl Axetat và Nước (thực tế cần xúc tác H2SO4).' },
        effect: 'bubbles'
    }
];
