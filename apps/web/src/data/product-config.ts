/**
 * Static configuration forms for each sail product on sailonet.
 * Keyed by id_product. Each product has different config fields.
 */

export type ConfigField = {
    key: string;
    label: string;
    options: string[];
};

export type ProductConfig = {
    fields: ConfigField[];
};

const SURFACE_MAINSAIL = [
    '6.10', '6.70', '7.50', '7.95', '8.55', '9.14', '9.50', '9.75',
    '10.50', '11.60', '12.20', '12.80', '13.70', '14.05', '14.65',
    '15.25', '15.85', '16.45', '17.10', '17.70',
];

const SURFACE_SPI = ['30', '60', '70', '80', '100', '130'];

const FABRIC_HORIZONTAL = ['Dacron NEWPORT / CHALLENGE', 'Dacron AP / DIMENSION POLYANT'];
const FABRIC_TRIRADIAL = ['PalmaTec Ultra', 'DCX (blanco)', 'DCX 2400 (gris)', 'Pro Radial'];

const REEFS = ['2 rizos', '3 rizos'];
const REEF_CHOICE = [
    '1 - Clavel / Oreja de perro',
    '2 - Polea / Orejas de perro',
    '3 - Polea / Polea',
];

const FORESAIL_TYPE = [
    'GENOVA',
    'Vela de Estay (introduzca su superficie)',
    'Solent (introduzca su zona)',
];

const COLOR_SPI = ['Monocolor', 'Color a elegir (maximo 3)'];
const COLOR_CODE_S = ['Blanco', 'Color a elegir (maximo 3)'];

const FABRIC_GENNAKER = [
    'Maxilite / Stormlite blanco',
    'Maxilite / Stormlite Color (max 3)',
    'Laminado CZ PES (un solo color)',
];

export const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
    // ── GVSTD: Mayor clasica ──
    '3': {
        // Horizontal
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'rizos', label: 'Numero de rizos', options: REEFS },
            { key: 'reef_choice', label: 'Eleccion arrecife 1 y 2', options: REEF_CHOICE },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_HORIZONTAL },
        ],
    },
    '5': {
        // Triradial
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['66/L-M'] },
            { key: 'rizos', label: 'Numero de rizos', options: REEFS },
            { key: 'reef_choice', label: 'Eleccion arrecife 1 y 2', options: REEF_CHOICE },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_TRIRADIAL },
        ],
    },

    // ── GVFULL: Mayor full batten ──
    '4': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'rizos', label: 'Numero de rizos', options: REEFS },
            { key: 'reef_choice', label: 'Eleccion arrecife 1 y 2', options: REEF_CHOICE },
            { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_HORIZONTAL },
        ],
    },
    '9': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['66/L-M'] },
            { key: 'rizos', label: 'Numero de rizos', options: REEFS },
            { key: 'reef_choice', label: 'Eleccion arrecife 1 y 2', options: REEF_CHOICE },
            { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_TRIRADIAL },
        ],
    },

    // ── GVE: Mayor enrollable ──
    '10': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'vertical_battens', label: 'Opcion sables verticales', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_HORIZONTAL },
        ],
    },
    '11': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['66/L-M'] },
            { key: 'vertical_battens', label: 'Opcion sables verticales', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_TRIRADIAL },
        ],
    },

    // ── GSE: Genova enrollable ──
    '2': {
        fields: [
            { key: 'foresail', label: 'Eleccion de vela de proa', options: FORESAIL_TYPE },
            { key: 'surface', label: 'LGF Max (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_HORIZONTAL },
        ],
    },
    '8': {
        fields: [
            { key: 'foresail', label: 'Eleccion de vela de proa', options: FORESAIL_TYPE },
            { key: 'surface', label: 'LGF Max (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['66/L-M'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_TRIRADIAL },
        ],
    },

    // ── GN: Genova con mosquetones ──
    '1': {
        fields: [
            { key: 'foresail', label: 'Eleccion de vela de proa', options: FORESAIL_TYPE },
            { key: 'surface', label: 'LGF Max (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'horizontal_battens', label: 'Opcion sables horizontales', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_HORIZONTAL },
        ],
    },
    '7': {
        fields: [
            { key: 'foresail', label: 'Eleccion de vela de proa', options: FORESAIL_TYPE },
            { key: 'surface', label: 'LGF Max (m²)', options: SURFACE_MAINSAIL },
            { key: 'peso', label: 'Estimacion peso', options: ['320 AP / 300 SF'] },
            { key: 'horizontal_battens', label: 'Opcion sables horizontales', options: ['No', 'Si'] },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_TRIRADIAL },
        ],
    },

    // ── SPIASY: Spinnaker asimetrico ──
    '14': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_SPI },
            { key: 'color', label: 'Color', options: COLOR_SPI },
        ],
    },

    // ── SPISYM: Spinnaker simetrico ──
    '6': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_SPI },
            { key: 'color', label: 'Color', options: COLOR_SPI },
        ],
    },

    // ── FURLING: Code S ──
    '17': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_SPI },
            { key: 'color', label: 'Color', options: COLOR_CODE_S },
        ],
    },

    // ── GEN: Gennaker / Code 0 ──
    '15': {
        fields: [
            { key: 'surface', label: 'Superficie (m²)', options: SURFACE_SPI },
            { key: 'fabric', label: 'Eleccion del tejido', options: FABRIC_GENNAKER },
        ],
    },
};
