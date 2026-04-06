/**
 * Product configurations seeded for every new trial tenant.
 * Same data used by packages/db/src/seed.ts for the dev environment.
 */
export const TRIAL_PRODUCT_CONFIGS: Record<string, { name: string; sailType: string; basePrice: string; fields: { key: string; label: string; options: string[] }[] }> = {
  '3':  { name: 'Mayor Clásica Horizontal', sailType: 'gvstd', basePrice: '85', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '5':  { name: 'Mayor Clásica Triradial', sailType: 'gvstd', basePrice: '110', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '4':  { name: 'Mayor Full Batten Horizontal', sailType: 'gvfull', basePrice: '95', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '9':  { name: 'Mayor Full Batten Triradial', sailType: 'gvfull', basePrice: '120', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '10': { name: 'Mayor Enrollable Horizontal', sailType: 'gve', basePrice: '100', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'vertical_battens', label: 'Opción sables verticales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '11': { name: 'Mayor Enrollable Triradial', sailType: 'gve', basePrice: '130', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'vertical_battens', label: 'Opción sables verticales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '2':  { name: 'Génova Enrollable Horizontal', sailType: 'gse', basePrice: '75', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '8':  { name: 'Génova Enrollable Triradial', sailType: 'gse', basePrice: '100', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '1':  { name: 'Génova Mosquetones Horizontal', sailType: 'gn', basePrice: '70', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'horizontal_battens', label: 'Opción sables horizontales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '7':  { name: 'Génova Mosquetones Triradial', sailType: 'gn', basePrice: '95', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'horizontal_battens', label: 'Opción sables horizontales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '14': { name: 'Spinnaker Asimétrico', sailType: 'spiasy', basePrice: '55', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Monocolor','Color a elegir (maximo 3)'] },
  ]},
  '6':  { name: 'Spinnaker Simétrico', sailType: 'spisym', basePrice: '50', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Monocolor','Color a elegir (maximo 3)'] },
  ]},
  '17': { name: 'Code S', sailType: 'furling', basePrice: '65', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Blanco','Color a elegir (maximo 3)'] },
  ]},
  '15': { name: 'Gennaker / Code 0', sailType: 'gen', basePrice: '60', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Maxilite / Stormlite blanco','Maxilite / Stormlite Color (max 3)','Laminado CZ PES (un solo color)'] },
  ]},
};
