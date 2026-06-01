const fs = require('fs');
let content = fs.readFileSync('src/data/ChemicalRegistry.ts', 'utf-8');

const newChemicals = `    'POTASSIUM': {
        id: 'POTASSIUM',
        name: { EN: 'Potassium Metal', VN: 'Kim loại Kali' },
        formula: 'K',
        color: '#cbd5e1',
        type: 'solid',
        ph: 7.0,
        description: { EN: 'Extremely reactive alkali metal.', VN: 'Kim loại kiềm phản ứng cực mạnh.' },
        isOrganic: false
    },
    'MAGNESIUM': {
        id: 'MAGNESIUM',
        name: { EN: 'Magnesium Ribbon', VN: 'Dây Magie' },
        formula: 'Mg',
        color: '#e2e8f0',
        type: 'solid',
        ph: 7.0,
        description: { EN: 'Alkaline earth metal. Burns with blinding white light.', VN: 'Kim loại kiềm thổ. Cháy với ánh sáng trắng chói lòa.' },
        isOrganic: false
    },
    'H2SO4': {
        id: 'H2SO4',
        name: { EN: 'Sulfuric Acid', VN: 'Axit Sunfuric' },
        formula: 'H₂SO₄',
        color: '#fafafa',
        type: 'liquid',
        ph: 0.5,
        description: { EN: 'Highly corrosive strong mineral acid.', VN: 'Axit vô cơ mạnh, ăn mòn cao.' },
        isOrganic: false
    },
    'HNO3': {
        id: 'HNO3',
        name: { EN: 'Nitric Acid', VN: 'Axit Nitric' },
        formula: 'HNO₃',
        color: '#fef9c3',
        type: 'liquid',
        ph: 1.0,
        description: { EN: 'Strong, highly corrosive oxidizing acid.', VN: 'Axit oxy hóa mạnh, ăn mòn cao.' },
        isOrganic: false
    },`;

content = content.replace(
    "isOrganic: false\n    },",
    "isOrganic: false\n    },\n" + newChemicals
);

const newResultants = `    'DILUTE_ACID': {
        id: 'DILUTE_ACID',
        name: { EN: 'Diluted Acid', VN: 'Axit Loãng' },
        formula: 'H⁺ (aq)',
        color: '#ffffff',
        type: 'liquid',
        ph: 2.0,
        description: { EN: 'An acid that has been diluted with water.', VN: 'Axit đã được pha loãng với nước.' },
        isOrganic: false
    }`;

content = content.replace(
    "isOrganic: false\n    }\n};",
    "isOrganic: false\n    },\n" + newResultants + "\n};"
);

content = content.replace(
    "temperatureSpike?: number;\n}",
    "temperatureSpike?: number;\n    requiresPopup?: boolean;\n    orderMatters?: boolean;\n}"
);

content = content.replace(
    "effect: 'explosion',\n        temperatureSpike: 80\n    },",
    "effect: 'explosion',\n        temperatureSpike: 80,\n        requiresPopup: true\n    },"
);

const newReactions = `    },
    {
        reactants: ['POTASSIUM', 'H2O'],
        product: 'NaOH',
        message: { EN: 'Violent exothermic reaction! Potassium reacts explosively with water, burning with a lilac flame.', VN: 'Phản ứng tỏa nhiệt cực mạnh! Kali phản ứng nổ với nước, cháy với ngọn lửa màu tím hoa cà.' },
        effect: 'explosion',
        temperatureSpike: 100,
        requiresPopup: true
    },
    {
        reactants: ['H2SO4', 'H2O'],
        product: 'DILUTE_ACID',
        message: { EN: 'DANGER: Water added to concentrated acid! This causes rapid, violent flash-boiling and splashing of acid due to extreme heat generation.', VN: 'NGUY HIỂM: Thêm nước vào axit đặc! Gây sôi đột ngột và bắn axit do nhiệt lượng tỏa ra quá lớn.' },
        effect: 'explosion',
        temperatureSpike: 120,
        requiresPopup: true,
        orderMatters: true
    },
    {
        reactants: ['H2O', 'H2SO4'],
        product: 'DILUTE_ACID',
        message: { EN: 'Safe dilution: Acid added to water. The large volume of water safely absorbs the heat generated.', VN: 'Pha loãng an toàn: Thêm axit vào nước. Lượng nước lớn hấp thụ nhiệt tỏa ra an toàn.' },
        effect: 'bubbles',
        temperatureSpike: 20,
        requiresPopup: true,
        orderMatters: true
    },
    {
        reactants: ['MAGNESIUM', 'HCl'],
        product: 'SALT_WATER',
        message: { EN: 'Magnesium reacts rapidly with hydrochloric acid to produce hydrogen gas.', VN: 'Magie phản ứng nhanh với axit clohydric tạo ra khí hydro.' },
        effect: 'bubbles',
        temperatureSpike: 10
    }`;

content = content.replace(
    "effect: 'bubbles'\n    }\n];",
    "effect: 'bubbles'\n" + newReactions + "\n];"
);

fs.writeFileSync('src/data/ChemicalRegistry.ts', content);
