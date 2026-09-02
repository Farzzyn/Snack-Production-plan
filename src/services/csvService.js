/**
 * Universal CSV Parser, Validator, and Importer for Master Data
 */

export const CSV_SCHEMAS = {
  sku: {
    name: 'SKU Master',
    required: ['sku_id', 'sku_name', 'base_product', 'pack_size_g', 'packet_per_box'],
    types: { pack_size_g: 'number', packet_per_box: 'number' },
    sample: "sku_id,sku_name,base_product,pack_size_g,packet_per_box\nPERI75,Peri Peri Potato Crisps 75g,Potato Crisps,75,24\nMASALA50,Spicy Masala Sticks 50g,Masala Sticks,50,30"
  },
  recipe_bom: {
    name: 'Recipe BOM',
    required: ['base_product', 'raw_material', 'quantity', 'uom'],
    types: { quantity: 'number', unit_cost: 'number', wastage_percentage: 'number' },
    sample: "base_product,raw_material,quantity,uom,unit_cost,wastage_percentage\nPotato Crisps,Fresh Potatoes,200,KG,0.80,5.0\nPotato Crisps,Cooking Oil,25,LTR,2.10,2.0\nPotato Crisps,Peri Peri Seasoning,4,KG,9.50,1.0"
  },
  packaging_bom: {
    name: 'Packaging BOM',
    required: ['sku_id', 'packaging_material', 'quantity', 'uom'],
    types: { quantity: 'number', unit_cost: 'number', wastage_percentage: 'number' },
    sample: "sku_id,packaging_material,quantity,uom,unit_cost,wastage_percentage\nPERI75,Nitrogen Barrier Foil Pouch 75g,1.0,PCS,0.12,3.0\nPERI75,Corrugated Shipper Carton 24ct,0.0417,PCS,0.80,1.0"
  },
  capacity: {
    name: 'Capacity Master',
    required: ['base_product', 'max_capacity_per_day', 'batch_count', 'operating_hours', 'count_of_chef'],
    types: { max_capacity_per_day: 'number', batch_count: 'number', operating_hours: 'number', count_of_chef: 'number', count_of_staff: 'number' },
    sample: "base_product,max_capacity_per_day,uom,batch_count,operating_hours,count_of_chef,count_of_staff\nPotato Crisps,800,KG,4,8,2,4\nMasala Sticks,600,KG,6,8,2,3"
  },
  staff: {
    name: 'Staff Summary',
    required: ['staff_name', 'role'],
    types: { salary: 'number', wage_per_day: 'number' },
    sample: "staff_name,role,salary,wage_per_day\nRohan Joshi,Head Chef,4000,135\nDeepak Verma,Packaging Tech,2600,90"
  },
  countries: {
    name: 'Countries',
    required: ['country_code', 'country_name'],
    types: {},
    sample: "country_code,country_name\nSGP,Singapore\nMYS,Malaysia\nEGY,Egypt"
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
