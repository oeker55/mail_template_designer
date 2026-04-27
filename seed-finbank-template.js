/**
 * Seeds the FinBank welcome template into the configured backend API.
 *
 * Usage:
 *   node seed-finbank-template.js
 *
 * Optional overrides:
 *   API_URL=http://localhost:3000/api
 *   FCODE=LOCAL_FIRMA
 *   SCODE=LOCAL_MAGAZA
 *   SUBJECT_ID=45
 *   TITLE="FinBank Hoş Geldiniz"
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'http://80.225.238.243:3000/api';

async function seedTemplate() {
  const templatePath = path.join(__dirname, 'src', 'data', 'finbank-welcome-template.json');
  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

  templateData.fcode = process.env.FCODE || templateData.fcode;
  templateData.scode = process.env.SCODE || templateData.scode;
  templateData.subjectId = process.env.SUBJECT_ID || templateData.subjectId;
  templateData.title = process.env.TITLE || templateData.title;
  templateData.name = process.env.NAME || templateData.title;

  console.log('Template yukleniyor...');
  console.log(`  Ad: ${templateData.name}`);
  console.log(`  fcode: ${templateData.fcode}`);
  console.log(`  scode: ${templateData.scode}`);
  console.log(`  subjectId: ${templateData.subjectId}`);
  console.log(`  Element sayisi: ${templateData.elements_json.length}`);

  try {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('\nTemplate basariyla DBye kaydedildi.');
    console.log(`  ID: ${result._id || result.id}`);
    console.log(`  Olusturulma: ${result.createdAt || result.created_at || '-'}`);
  } catch (error) {
    console.error('\nHata:', error.message);
    console.error('Backend API calisiyor mu kontrol edin:', API_URL);
    process.exitCode = 1;
  }
}

seedTemplate();
