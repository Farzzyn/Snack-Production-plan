import React, { useState } from 'react';
import { 
  FileUp, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Check, 
  X, 
  Layers, 
  FileSpreadsheet 
} from 'lucide-react';
import { CSV_SCHEMAS, parseCSV, validateCSVData } from '../services/csvService';

export default function ImportDataPage({ 
  onBulkImport, 
  onNavigate 
}) {
  const [selectedType, setSelectedType] = useState('sku');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState(null);

  const activeSchema = CSV_SCHEMAS[selectedType];

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCsvText('');
    setFileName('');
    setValidationResult(null);
    setImportSuccessMessage(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setCsvText(content);
      runValidation(content, selectedType);
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (text) => {
    setCsvText(text);
    if (text.trim()) {
      runValidation(text, selectedType);
    } else {
      setValidationResult(null);
    }
  };

  const runValidation = (text, type) => {
    try {
      const parsed = parseCSV(text);
      const result = validateCSVData(type, parsed);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({
        isValid: false,
        missingHeaders: [],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        duplicateRows: 0,
        errors: [{ row: 0, field: 'general', message: err.message }],
        previewData: []
      });
    }
  };

  const handleDownloadSample = () => {
    const element = document.createElement('a');
    const file = new Blob([activeSchema.sample], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `sample_${selectedType}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validRows === 0) return;

    setIsImporting(true);
    try {
      const validItems = validationResult.previewData.filter(r => r._valid);
      await onBulkImport(selectedType, validItems);
      setImportSuccessMessage(`Successfully imported ${validItems.length} records into ${activeSchema.name}!`);
      setValidationResult(null);
      setCsvText('');
      setFileName('');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-900)' }}>
          CSV Master Data Importer
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '13px' }}>
          Bulk upload product masters, BOM formulas, plant capacities, and personnel records via validated CSV.
        </p>
      </div>

      {importSuccessMessage && (
        <div className="alert alert-info" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--success-600)" />
            <strong style={{ color: 'var(--navy-900)' }}>{importSuccessMessage}</strong>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setImportSuccessMessage(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Type Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.entries(CSV_SCHEMAS).map(([key, schema]) => (
          <button
            key={key}
            type="button"
            className={`btn ${selectedType === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTypeChange(key)}
          >
            <FileSpreadsheet size={15} />
            {schema.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Upload Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileUp size={18} color="var(--brand-500)" />
              Upload CSV File for {activeSchema.name}
            </h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleDownloadSample}
              title="Download formatted sample CSV file"
            >
              <Download size={13} />
              Download Sample CSV
            </button>
          </div>

          {/* Drag & Drop / File Input Box */}
          <div 
            style={{
              border: '2px dashed var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <FileUp size={32} color="var(--brand-500)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
              {fileName ? fileName : 'Click to browse or drag and drop your CSV here'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              UTF-8 encoded .csv files with headers
            </div>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {/* Or Paste Raw Text */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Or paste raw CSV text directly:</span>
              <span 
                style={{ color: 'var(--brand-500)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                onClick={() => handleTextareaChange(activeSchema.sample)}
              >
                Load Sample Data
              </span>
            </label>
            <textarea
              className="textarea num-tabular"
              rows="5"
              placeholder={activeSchema.sample}
              value={csvText}
              onChange={e => handleTextareaChange(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Schema Information & Validation Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} color="var(--brand-500)" />
              Schema Requirements & Validation
            </h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Required Column Headers:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {activeSchema.required.map(field => (
                <span key={field} className="badge badge-planned" style={{ fontSize: '11px' }}>
                  {field}
                </span>
              ))}
            </div>
          </div>

          {validationResult && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', padding: '8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                  <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{validationResult.totalRows}</div>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', padding: '8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#86efac', textTransform: 'uppercase' }}>Valid</div>
                  <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>{validationResult.validRows}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#fca5a5', textTransform: 'uppercase' }}>Invalid</div>
                  <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: '#f87171' }}>{validationResult.invalidRows}</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#fcd34d', textTransform: 'uppercase' }}>Duplicates</div>
                  <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24' }}>{validationResult.duplicateRows}</div>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div style={{ maxHeight: '140px', overflowY: 'auto', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#fca5a5', marginBottom: '4px' }}>
                    Validation Issues ({validationResult.errors.length}):
                  </div>
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#fecaca', marginBottom: '2px' }}>
                      • Row {err.row}: {err.message}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isImporting || validationResult.validRows === 0}
                onClick={handleConfirmImport}
              >
                <Check size={16} />
                {isImporting ? 'Importing Data...' : `Confirm Import of ${validationResult.validRows} Records`}
              </button>
            </div>
          )}

          {!validationResult && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              Upload or paste a CSV file to inspect validation results.
            </div>
          )}
        </div>
      </div>

      {/* Data Preview Table */}
      {validationResult && validationResult.previewData.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Data Ingestion Preview ({validationResult.previewData.length} records analyzed)
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Rows marked with <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span> will be committed to the database.
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '60px' }}>Row</th>
                  {activeSchema.required.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validationResult.previewData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: row._valid ? 'transparent' : 'rgba(239, 68, 68, 0.12)' }}>
                    <td style={{ textAlign: 'center' }}>
                      {row._valid ? (
                        <CheckCircle2 size={16} color="#4ade80" />
                      ) : (
                        <AlertCircle size={16} color="#f87171" />
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{row._row}</td>
                    {activeSchema.required.map(col => (
                      <td key={col} style={{ fontWeight: col === activeSchema.required[0] ? 600 : 400 }}>
                        {String(row[col] !== undefined ? row[col] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
