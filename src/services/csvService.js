/**
 * Universal CSV Parser, Validator, and Importer for Master Data
 */

export const CSV_SCHEMAS = {
  sku: {
    name: 'SKU & Pack Size Master',
    required: ['sku_id', 'sku_name', 'base_product', 'pack_size_g', 'packet_per_box'],
    types: { pack_size_g: 'number', packet_per_box: 'number', packing_qty_per_hour: 'number', packing_staff_count: 'number' },
    sample: "sku_id,sku_name,base_product,pack_size_g,packet_per_box,packing_qty_per_hour,packing_staff_count\nRGHMIX150,RG HOT MIXTURE 150 GM PKT,RG HOT MIXTURE,150,30,65,2\nRGBNC150,RG BANANA CHIPS 150 GM PKT,RG BANANA CHIPS,150,30,96,3"
  },
  recipe_bom: {
    name: 'Recipe BOM',
    required: ['base_product', 'raw_material', 'quantity', 'uom'],
    types: { quantity: 'number', cost_per_batch: 'number', unit_cost: 'number' },
    sample: "base_product,raw_material,quantity,uom,cost_per_batch\nRG HOT MIXTURE,Kadala mavu,9,KG,89\nRG HOT MIXTURE,Rice powder,4,KG,36"
  },
  packaging_bom: {
    name: 'Packaging BOM',
    required: ['sku_id', 'packaging_material', 'quantity', 'unit_cost'],
    types: { quantity: 'number', unit_cost: 'number' },
    sample: "sku_id,packaging_material,quantity,unit_cost\nRGHMIX150,packet,1,2.50\nRGHMIX300,Bottle,1,18.70"
  },
  capacity: {
    name: 'Capacity Master',
    required: ['base_product', 'max_capacity_per_day', 'batch_count', 'operating_hours', 'count_of_chef'],
    types: { max_capacity_per_day: 'number', batch_count: 'number', operating_hours: 'number', count_of_chef: 'number', count_of_staff: 'number' },
    sample: "base_product,max_capacity_per_day,uom,batch_count,operating_hours,count_of_chef,count_of_staff\nRG HOT MIXTURE,225,KG,9,8.05,1,7\nRG BANANA CHIPS,500,KG,25,8.3,1,11"
  },
  staff: {
    name: 'Staff Summary',
    required: ['staff_name'],
    types: { salary: 'number', wage_per_day: 'number' },
    sample: "staff_name,salary,wage_per_day\nBIJU,,1400\nNASEEMA,10000,\nJYOTHI,,400"
  },
  countries: {
    name: 'Countries',
    required: ['country_code', 'country_name'],
    types: {},
    sample: "country_code,country_name\nUAE,United Arab Emirates\nSAU,Saudi Arabia\nIND,India"
  }
};

export function parseCSV(text) {
  const lines = text.trim().split(/\r\n|\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser handling quotes
    const values = [];
    let inQuotes = false;
    let currentValue = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function validateCSVData(schemaKey, { headers, rows }) {
  const schema = CSV_SCHEMAS[schemaKey];
  if (!schema) throw new Error(`Unknown schema ${schemaKey}`);

  const missingHeaders = schema.required.filter(req => !headers.includes(req));
  if (missingHeaders.length > 0) {
    return {
      isValid: false,
      missingHeaders,
      totalRows: rows.length,
      validRows: 0,
      invalidRows: rows.length,
      duplicateRows: 0,
      errors: [{ row: 0, field: 'header', message: `Missing required column headers: ${missingHeaders.join(', ')}` }],
      previewData: []
    };
  }

  const errors = [];
  const validData = [];
  const seenKeys = new Set();
  let duplicateCount = 0;

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2; // 1-indexed including header
    let hasError = false;

    // Check required fields
    schema.required.forEach(field => {
      const val = row[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push({ row: rowNumber, field, message: `Field "${field}" is required.` });
        hasError = true;
      }
    });

    // Check data types
    const parsedRow = { ...row };
    Object.entries(schema.types || {}).forEach(([field, expectedType]) => {
      if (row[field] !== undefined && row[field] !== '') {
        if (expectedType === 'number') {
          const num = Number(row[field]);
          if (isNaN(num)) {
            errors.push({ row: rowNumber, field, message: `Field "${field}" must be a valid number (got "${row[field]}").` });
            hasError = true;
          } else {
            parsedRow[field] = num;
          }
        }
      } else {
        if (expectedType === 'number') parsedRow[field] = 0;
      }
    });

    // Deduplication check based on primary key field
    const primaryField = schema.required[0];
    const keyVal = String(row[primaryField] || '').toLowerCase();
    if (seenKeys.has(keyVal)) {
      duplicateCount++;
      errors.push({ row: rowNumber, field: primaryField, message: `Duplicate entry for "${row[primaryField]}".` });
      hasError = true;
    } else if (keyVal) {
      seenKeys.add(keyVal);
    }

    if (!hasError) {
      validData.push({ ...parsedRow, _valid: true, _row: rowNumber });
    } else {
      validData.push({ ...parsedRow, _valid: false, _row: rowNumber });
    }
  });

  const validRowCount = validData.filter(r => r._valid).length;

  return {
    isValid: errors.length === 0,
    missingHeaders: [],
    totalRows: rows.length,
    validRows: validRowCount,
    invalidRows: rows.length - validRowCount,
    duplicateRows: duplicateCount,
    errors,
    previewData: validData
  };
}
