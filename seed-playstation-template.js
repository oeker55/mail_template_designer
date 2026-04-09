/**
 * PlayStation Store sipariş template'ini DB'ye kaydeden seed script.
 * Kullanım: node seed-playstation-template.js
 * 
 * Not: Backend API'sinin çalışıyor olması gerekir.
 * Varsayılan API adresi: http://localhost:3000/api
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://80.225.238.243:3000/api';

async function seedTemplate() {
  const templatePath = path.join(__dirname, 'src', 'data', 'playstation-order-template.json');
  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

  console.log('Template yükleniyor...');
  console.log(`  Ad: ${templateData.name}`);
  console.log(`  fcode: ${templateData.fcode}`);
  console.log(`  scode: ${templateData.scode}`);
  console.log(`  subjectId: ${templateData.subjectId}`);
  console.log(`  Element sayısı: ${templateData.elements_json.length}`);

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
    console.log('\nTemplate başarıyla DB\'ye kaydedildi!');
    console.log(`  ID: ${result._id || result.id}`);
    console.log(`  Oluşturulma: ${result.createdAt || result.created_at}`);
  } catch (error) {
    console.error('\nHata:', error.message);
    console.error('Backend API çalışıyor mu kontrol edin:', API_URL);
  }
}

seedTemplate();
