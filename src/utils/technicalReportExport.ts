import jsPDF from 'jspdf';
import { MEMBERSHIP_PACKAGES, BANK_INFO, ADMIN_PHONE, ADMIN_EMAILS } from '../utils/authManager';
import { TOTAL_HEALING_COUNT } from '../data/healingLibrary';

/**
 * Downloads a Word-compatible .doc file (HTML-based Word format with official styling, tables and formatting)
 * Word opens this natively and perfectly preserves tables, colors, headings, bullet points and fonts.
 */
export function downloadTechnicalReportWord(): void {
  const content = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>AuraBio Frekans - Kurumsal ve Teknik Sistem Raporu</title>
    <style>
      body {
        font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #1e293b;
        background-color: #ffffff;
        margin: 20mm;
      }
      h1 {
        font-size: 20pt;
        color: #047857;
        border-bottom: 2pt solid #10b981;
        padding-bottom: 6pt;
        margin-top: 18pt;
        margin-bottom: 10pt;
      }
      h2 {
        font-size: 14pt;
        color: #0f172a;
        border-left: 4pt solid #059669;
        padding-left: 8pt;
        margin-top: 16pt;
        margin-bottom: 8pt;
      }
      h3 {
        font-size: 12pt;
        color: #334155;
        margin-top: 12pt;
        margin-bottom: 6pt;
      }
      p {
        margin-bottom: 8pt;
        text-align: justify;
      }
      ul, ol {
        margin-top: 4pt;
        margin-bottom: 8pt;
        padding-left: 20pt;
      }
      li {
        margin-bottom: 4pt;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10pt;
        margin-bottom: 14pt;
        font-size: 10pt;
      }
      th {
        background-color: #064e3b;
        color: #ffffff;
        font-weight: bold;
        text-align: left;
        padding: 8pt;
        border: 1pt solid #047857;
      }
      td {
        padding: 7pt;
        border: 1pt solid #cbd5e1;
        vertical-align: top;
      }
      tr:nth-child(even) {
        background-color: #f8fafc;
      }
      .badge {
        display: inline-block;
        padding: 2pt 6pt;
        background-color: #ecfdf5;
        color: #047857;
        font-weight: bold;
        border-radius: 4pt;
        border: 1pt solid #a7f3d0;
      }
      .highlight-box {
        background-color: #f0fdf4;
        border-left: 4pt solid #10b981;
        padding: 10pt;
        margin-top: 10pt;
        margin-bottom: 12pt;
        border-radius: 0 6pt 6pt 0;
      }
      .footer-note {
        font-size: 9pt;
        color: #64748b;
        border-top: 1pt solid #e2e8f0;
        padding-top: 8pt;
        margin-top: 24pt;
        text-align: center;
      }
    </style>
  </head>
  <body>

    <div style="text-align: center; margin-bottom: 20pt;">
      <div style="font-size: 16pt; font-weight: bold; color: #047857; letter-spacing: 1.5pt; margin-bottom: 6pt;">AKN GLOBAL GROUP LTD</div>
      <h1 style="border: none; margin-top: 2pt; margin-bottom: 4pt; color: #064e3b;">AURABIO FREKANS BİYO-REZONANS & ŞİFA SİSTEMİ</h1>
      <p style="font-size: 13pt; font-weight: bold; color: #059669; margin-top: 0;">KURUMSAL & BİREYSEL İŞ SUNUMU, TEKNİK MİMARİ VE PROJE TEKLİF RAPORU</p>
      <p style="font-size: 9pt; color: #64748b;">Kurumsal Üretici: AuraBio Kuantum Biyo-Rezonans & Frekans Enstitüsü • Sistem Sürümü: v5.5 Enterprise</p>
    </div>

    <div class="highlight-box">
      <strong>YÖNETİCİ ÖZETİ:</strong> AuraBio Frekans; modern optik foton spektrometresi, yapay zekâ destekli Kirlian biyo-plazma modellemesi, <strong>Aura-Sync Akıllı Saat Biyometrik Canlı Köprüsü (Web BLE)</strong>, <strong>MindSpace Studio (5 Entegre AI ve Zihin Laboratuvarı)</strong>, <strong>AI Kutsal Geometri Mandala Üreticisi</strong>, <strong>7 Günlük AI Bütünsel Arınma Kampları</strong>, <strong>Anonim Küresel Huzur Isı Haritası</strong>, <strong>50+ Kadim Şifa Frekans Ansiklopedisi</strong>, <strong>10s Ön/Son Biyo-Akustik Tarama Motoru</strong>, <strong>8 Sekmeli Entegre Biyo-Rezonans Raporlama</strong> ve Doğu-Batı sentezi <strong>${TOTAL_HEALING_COUNT}+ Kadim Şifa Frekansını</strong> tek bir dijital platformda birleştiren yeni nesil Kuantum Biyo-Rezonans ve Frekans Terapi Sistemidir. Özel elektrot veya pahalı donanıma ihtiyaç duymadan standart kamera üzerinden canlı optik analiz, mikrofon üzerinden vokal spektral analiz, Bluetooth saatlerden canlı nabız takibi ve Web Audio API ile canlı ses sentezi gerçekleştirir.
    </div>

    <h2>1. TEMEL SİSTEM ÖZELLİKLERİ VE YENİLİKÇİ TEKNOLOJİLERİ (v5.5 Enterprise)</h2>
    <ul>
      <li><strong>🧠 MindSpace Studio & AI Yaşam Koçu (Aura-Journal):</strong> Bütüncül terapötik perspektif ve kadim arketipler (Esma, Çakra, Element) süzgecinde sesli veya yazılı günlük analizi, duygu yoğunluk eğrileri, kişiselleştirilmiş içsel rehberlik ve frekans reçeteleri.</li>
      <li><strong>☀️ 24 Saatlik Biyo-Ritim & Circadian Synchronizer:</strong> Geleneksel Çin Tıbbı (TCM) 24 saatlik organ meridyen saatleri, biyolojik kortizol/melatonin hormon fazları ve ışık dalga boyu optimizasyonu.</li>
      <li><strong>🎙️ Sesli & Niyetli Frekans Labirenti (Voice-Intention Forge):</strong> Web Audio API çoklu osilatör mimarisi ile niyetin ses tonu üzerinden spektral analizi, taşıyıcı ve harmonik frekans sentezi, 7.83 Hz Schumann rezonansı eşliğinde interaktif labirent akortlama.</li>
      <li><strong>🌙 AI Rüya & Bilinçaltı Çözümleyicisi (Dream Decoder):</strong> Rüya metni veya ses kaydından Jungiyen/Kadim arketipleri, psiko-spiritüel anlamları ve bloke çakraları saptayıp gece frekansı reçetesi hazırlayan yapay zekâ motoru.</li>
      <li><strong>👥 Kurumsal & Aile Çemberi (Group Aura Sync):</strong> Çoklu cihazların sesle veya QR kodla eşleştiği, ortak HRV ve biyo-alan tutarlılık indeksi (Group Coherence) üreten kolektif frekans çemberi.</li>
      <li><strong>⌚ Aura-Sync Akıllı Saat Köprüsü (Web BLE):</strong> Standart Bluetooth GATT Kalp Hızı Profili (UUID 0x180D) ile anlık nabız ve HRV okuma. Taşikardi veya stres anında otomatik frekans gevşeme adaptasyonu.</li>
      <li><strong>🌌 AI Kutsal Geometri Mandala Üreticisi:</strong> HTML5 Canvas tabanlı Çakra ve Solfejyo frekansına göre dinamik Yaşam Çiçeği, Torus, Sri Yantra ve Metatron Küpü geometrileri. Yüksek çözünürlüklü PNG ve PDF dışa aktarma.</li>
      <li><strong>🧭 7 Günlük AI Bütünsel Arınma Kampları (Holistic Journey):</strong> Kökten Taç çakraya kadar Sabah (Uyanış), Öğle (Hizalanma) ve Gece (Hücresel Detoks) mikro seanslarıyla yapılandırılmış program ve bulut ilerleme sistemi.</li>
      <li><strong>🌍 Anonim Küresel Frekans Haritası (Heatmap):</strong> Dünya genelinde o anda aktif olan biyo-rezonans seanslarını, baskın küresel niyet dalgasını ve kıtasal enerji dağılımını canlı görselleştirme.</li>
      <li><strong>🌿 Şifa Ansiklopedisi & 50+ Hastalık Frekans Matrisi:</strong> Nörolojik, kardiyovasküler, metabolik, psikosomatik, iskelet-kas, bağışıklık ve kadim enerjetik alanlarda 50'den fazla hastalığın Solfejyo, Rife ve Sufi makam frekans reçeteleri, kullanım kılavuzları ve 3 aşamalı iyileşme zaman çizelgeleri.</li>
      <li><strong>🎙️ 10 Saniyelik Ön / Son Biyo-Akustik Tarama Motoru:</strong> Mikrofon üzerinden vokal harmonik ve temel frekans (F0) analizi. Seans öncesi (Pre-Scan) ve seans sonrası (Post-Scan) ses kayıtlarını karşılaştırarak hücrelerdeki biyo-rezonans denge artışını somut grafiklerle raporlama.</li>
      <li><strong>📊 8 Sekmeli Entegre Raporlama & Dönüşüm Karşılaştırması:</strong> İlim Kapı, Genel Bakış, Duygular, Aura Katmanları, Çakralar, Letaifler, Kişisel Reçeteler ve Tüm İnovasyonlar sekmeleri. Yüklenen şifa frekansının otomatik rapora işlenmesi ve PDF/Word dışa aktarımı.</li>
      <li><strong>Evrensel 6'lı Kadim Şifa Kütüphanesi (${TOTAL_HEALING_COUNT}+ Frekans):</strong> İslami Esma & Şifa Sureleri, Uzak Doğu 7 Çakra & Solfejyo Matrisi, 5 Kadim Element & Schumann Rezonansı, Anadolu Sufi Mûsikîsi 25 Makam Terapisi, Şamanik Davul Teta Transı ve Keltik-İskandinav Rün Akustiği.</li>
      <li><strong>🚨 SOS Acil Durum (432 Hz) & 🌙 Derin Uyku Tüneli (Delta Biyo-Senkron):</strong> Anlık stres ve taşikardi durumlarında 60s hızlı sakinleştirici 432 Hz frekansı ve gece uykusuzluğu için 0.5-3.5 Hz Delta beyin dalgası biyo-senkronizasyonu.</li>
      <li><strong>📶 %100 Çevrimdışı (Offline) Güvenilirlik:</strong> İnternet bağlantısı kopsa dahi kamera taraması, ses sentezleme ve PDF üretimi tarayıcınızın kendi işlemci gücüyle yerel olarak kesintisiz çalışır.</li>
    </ul>

    <h2>2. ŞİFA ANSİKLOPEDİSİ & 50+ HASTALIK KATEGORİ DAĞILIMI</h2>
    <table>
      <thead>
        <tr>
          <th>Kategori</th>
          <th>Hastalık Sayısı</th>
          <th>Öne Çıkan Hastalıklar</th>
          <th>Temel Frekanslar & Kadim Ekoller</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Nörolojik Sistem</strong></td>
          <td>8 Hastalık</td>
          <td>Migren, Gerilim Baş Ağrısı, Trigeminal Nevralji, İnsomnia, Huzursuz Bacak Sendromu</td>
          <td>174 Hz, 432 Hz, 528 Hz • Rast & Nihavend Makamı • Ya Selam (131 Hz)</td>
        </tr>
        <tr>
          <td><strong>2. Kardiyovasküler</strong></td>
          <td>7 Hastalık</td>
          <td>Esansiyel Hipertansiyon, Taşikardi, Periferik Dolaşım & Raynaud, Aritmi</td>
          <td>528 Hz, 432 Hz, 639 Hz • Rehavi Makamı • Su Elementi (417 Hz)</td>
        </tr>
        <tr>
          <td><strong>3. Metabolik & Sindirim</strong></td>
          <td>8 Hastalık</td>
          <td>İBS (Hassas Bağırsak), Tip 2 İnsülin Direnci, Karaciğer Detoksu, Gastrit & Reflü</td>
          <td>417 Hz, 528 Hz, 317.8 Hz • Hicaz & Buselik Makamı • Ya Kuddüs (170 Hz)</td>
        </tr>
        <tr>
          <td><strong>4. Psikosomatik & Ruhsal</strong></td>
          <td>8 Hastalık</td>
          <td>Panik Atak, Yaygın Anksiyete, Majör Depresif Mizaç, Kronik Tükenmişlik (Burnout)</td>
          <td>528 Hz, 432 Hz, 639 Hz, Schumann 7.83 Hz • Uşşak Makamı • Ya Vedud (432 Hz)</td>
        </tr>
        <tr>
          <td><strong>5. İskelet & Kas Sistemi</strong></td>
          <td>8 Hastalık</td>
          <td>Fibromiyalji, Bel & Boyun Fıtığı Disk Dejenerasyonu, Romatoid Artrit, Tendinit</td>
          <td>174 Hz, 285 Hz, 528 Hz • Hüseyni Makamı • Toprak Elementi (194 Hz)</td>
        </tr>
        <tr>
          <td><strong>6. Bağışıklık & Kadim</strong></td>
          <td>11 Hastalık</td>
          <td>Kronik Yorgunluk (CFS), Alerjik Rinit, Nazar & Negatif Enerji Yükü, Ruhsal Blokaj</td>
          <td>741 Hz, 852 Hz, 963 Hz • Şamanik Teta Transı • Ya Hayy & Ya Kayyum (852 Hz)</td>
        </tr>
      </tbody>
    </table>

    <h2>3. EVRENSEL 6'LI KADİM ŞİFA EKOLÜ VE FREKANS DAĞILIMI</h2>
    <table>
      <thead>
        <tr>
          <th>Ekol / Kategori</th>
          <th>İçerik</th>
          <th>Frekans Aralığı</th>
          <th>Terapötik Etki & Enstrüman Karakteri</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. İslami Kadim Şifa</strong></td>
          <td>52 Frekans</td>
          <td>111 Hz – 999 Hz</td>
          <td>Ebced tabanlı Esma-i Hüsna titreşimleri (Ya Şafi 391 Hz, Ya Vedud 432 Hz vb.), Kur'an şifa ayetleri, 4-7-8 zikir nefesi ve ney tınıları.</td>
        </tr>
        <tr>
          <td><strong>2. Çakra & Solfejyo</strong></td>
          <td>50 Frekans</td>
          <td>174 Hz – 963 Hz</td>
          <td>7 temel çakra, antik solfejyo oktavları, Prana dolaşımı ve 7 metal alaşımlı Tibet şarkı söyleyen çanakları.</td>
        </tr>
        <tr>
          <td><strong>3. 5 Element & Doğa</strong></td>
          <td>50 Frekans</td>
          <td>194.18 Hz – 852 Hz</td>
          <td>Toprak (194 Hz), Su (417 Hz), Ateş (528 Hz), Hava (639 Hz), Eter (741 Hz) ve Schumann 7.83 Hz yerküre rezonansı.</td>
        </tr>
        <tr>
          <td><strong>4. Anadolu Sufi Mûsikîsi</strong></td>
          <td>50 Frekans</td>
          <td>216 Hz – 528 Hz</td>
          <td>Selçuklu ve Osmanlı darüşşifalarında uygulanan 25 kadim makam terapisi (Rast, Hicaz, Nihavend, Buselik vb.) ve Mevlevi ney taksimleri.</td>
        </tr>
        <tr>
          <td><strong>5. Şamanik Davul Transı</strong></td>
          <td>50 Frekans</td>
          <td>136.1 Hz – 432 Hz</td>
          <td>Beyni 4.5 Hz derin Teta bandına indiren 120-135 BPM monoritmik davul vuruşları, Sibirya/Altay köklenme ritimleri, ateş akustiği.</td>
        </tr>
        <tr>
          <td><strong>6. Kelt & İskandinav</strong></td>
          <td>50 Frekans</td>
          <td>285 Hz – 741 Hz</td>
          <td>13 Kutsal Kelt ağacı (Ogham takvimi), gümüş telli Keltik arp, Tagelharpa yaylısı ve Futhark rün biyo-alan koruması.</td>
        </tr>
      </tbody>
    </table>

    <h2>4. KURUMSAL ENTEGRASYON VE SEKTÖREL KULLANIM ALANLARI</h2>
    <ul>
      <li><strong>Bütüncül Tıp, Klinikler & Tamamlayıcı Sağlık Merkezleri:</strong> Akupunktur, hacamat, fitoterapi, ozon tedavisi ve biyo-rezonans seansları öncesinde ve sonrasında danışanın enerji değişimini ölçümleme ve PDF rapor sunma.</li>
      <li><strong>Spa, Termal Tesisler & Sağlıklı Yaşam (Wellness / Resort) Otelleri:</strong> VIP check-in sırasında 3 dakikalık biyo-alan analizi ve sonuca göre kişiselleştirilmiş 6 ekol masaj & frekans odası yönlendirmesi.</li>
      <li><strong>Kurumsal Şirketler & İK Departmanları:</strong> Çalışan tükenmişliğini (burnout) önleme, zihinsel odaklanma ve stres seviyesini düşürmek için 10 dakikalık MindSpace Alfa seansları ve 7 günlük arınma kampları.</li>
      <li><strong>Psikolojik Danışmanlık & Yaşam Koçluğu:</strong> Danışanın bilinçaltı enerji blokajlarını çakra ve letaif haritası üzerinden tespit ederek seans derinliğini artırma.</li>
      <li><strong>Kişisel Danışan Portalı (Üye Paneli):</strong> Her danışan için canlı kalan süre sayacı, tek tıkla lisans uzatma/yenileme mağazası, profil ve şifre güncelleme, geçmiş faturalar ve tüm aura tarama arşivlerine 7/24 kesintisiz erişim imkanı.</li>
    </ul>

    <h2>5. SİSTEM İÇERİSİNDEKİ RESMİ ÜYELİK VE LİSANS PAKETLERİ</h2>
    <p>Uygulama içerisinde tanımlı olan güncel lisans paketleri ve kurumsal fiyatlandırma tablosu aşağıdadır:</p>

    <table>
      <thead>
        <tr>
          <th>Paket Adı</th>
          <th>Süre / Kapsam</th>
          <th>Fiyat</th>
          <th>Öne Çıkan Özellikler</th>
        </tr>
      </thead>
      <tbody>
        ${MEMBERSHIP_PACKAGES.map(pkg => `
          <tr>
            <td><strong>${pkg.name}</strong> ${pkg.popular ? '<span class="badge">Popüler</span>' : ''}</td>
            <td>${pkg.durationText}</td>
            <td><strong style="color: #047857;">${pkg.priceText}</strong></td>
            <td>${pkg.features.join(' • ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>6. RESMİ ÜRETİCİ & İLETİŞİM BİLGİLERİ</h2>
    <table>
      <tr>
        <td style="width: 30%;"><strong>Kurumsal Yapı:</strong></td>
        <td>AuraBio Kuantum Biyo-Rezonans & Frekans Enstitüsü</td>
      </tr>
      <tr>
        <td><strong>Sistem Heyeti:</strong></td>
        <td>AuraBio Biyo-Rezonans & Frekans Heyeti</td>
      </tr>
      <tr>
        <td><strong>Resmi Banka:</strong></td>
        <td>${BANK_INFO.bankName}</td>
      </tr>
      <tr>
        <td><strong>Hesap Sahibi:</strong></td>
        <td>${BANK_INFO.accountHolder}</td>
      </tr>
      <tr>
        <td><strong>IBAN Numarası:</strong></td>
        <td><strong style="font-family: monospace; color: #047857;">${BANK_INFO.iban}</strong></td>
      </tr>
      <tr>
        <td><strong>İletişim & WhatsApp:</strong></td>
        <td>${ADMIN_PHONE}</td>
      </tr>
      <tr>
        <td><strong>E-Posta:</strong></td>
        <td>${ADMIN_EMAILS.join(', ')}</td>
      </tr>
    </table>

    <div class="footer-note">
      Bu teknik rapor AKN GLOBAL GROUP LTD bünyesindeki AuraBio Frekans Kuantum Biyo-Rezonans ve Kirlian Spektrometresi Sistemi tarafından oluşturulmuştur.<br>
      © ${new Date().getFullYear()} AKN GLOBAL GROUP LTD • AuraBio Frekans. Tüm Hakları Saklıdır.
    </div>

  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AuraBio_Frekans_Teknik_Is_Sunumu_Raporu_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a high-fidelity vector PDF version of the Technical Report using jsPDF
 */
export function downloadTechnicalReportPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  let y = 16;

  // Helper to add clean sanitized text (Turkish char normalization for PDF standard font)
  const clean = (t: string) => {
    if (!t) return '';
    return t
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'i')
      .replace(/Ğ/g, 'G')
      .replace(/ğ/g, 'g')
      .replace(/Ü/g, 'U')
      .replace(/ü/g, 'u')
      .replace(/Ş/g, 'S')
      .replace(/ş/g, 's')
      .replace(/Ö/g, 'O')
      .replace(/ö/g, 'o')
      .replace(/Ç/g, 'C')
      .replace(/ç/g, 'c')
      .replace(/’/g, "'")
      .replace(/‘/g, "'")
      .replace(/“/g, '"')
      .replace(/”/g, '"');
  };

  const checkPage = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = 16;
      // Header on subsequent pages
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(clean('AuraBio Frekans - Kuantum Biyo-Rezonans & Kadim Sifa Teknik Raporu (v5.5)'), margin, 10);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 12, pageWidth - margin, 12);
      y = 18;
    }
  };

  // Header Banner
  doc.setFillColor(6, 78, 59); // Dark emerald
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 24, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(clean('AURABIO FREKANS KUANTUM BIYO-REZONANS SISTEMI'), margin + 5, y + 9);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(clean('Kurumsal & Bireysel Is Sunumu, Teknik Mimari ve Paket Fiyat Listesi Raporu'), margin + 5, y + 16);
  doc.text(clean(`Surum: v5.5 Enterprise • Tarih: ${new Date().toLocaleDateString('tr-TR')}`), pageWidth - margin - 55, y + 16);

  y += 30;

  // Section 1: Executive Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clean('1. SISTEM TANIMI VE YONETICI OZETI'), margin, y);
  y += 5;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 26, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const summaryText = clean(
    `AuraBio Frekans; modern optik foton spektrometresi, Kirlian biyo-plazma modellemesi, Aura-Sync Akilli Saat Canli Biyometrik Koprusu (Web BLE), MindSpace Studio (Aura-Journal, Circadian, Voice Forge, Dream Decoder, Group Sync), AI Kutsal Geometri Mandala Ureticisi, 7 Gunluk AI Arinma Kamplari, Anonim Kuresel Huzur Isi Haritasi, 50+ Hastalik Sifa Ansiklopedisi, 10s On/Son Biyo-Akustik Tarama Motoru ve ${TOTAL_HEALING_COUNT}+ frekans barindiran 6 Kadim Sifa Ekolunu tek bir platformda birlestiren yeni nesil Kuantum Biyo-Rezonans sistemidir.`
  );
  doc.text(doc.splitTextToSize(summaryText, pageWidth - 2 * margin - 8), margin + 4, y + 5);
  y += 30;

  // Section 2: 6 Schools
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clean(`2. EVRENSEL 6'LI KADIM SIFA EKOLU VE ${TOTAL_HEALING_COUNT}+ FREKANS ARSIVI`), margin, y);
  y += 6;

  const schools = [
    { name: '1. Islami Kadim Sifa (52 Frekans)', desc: 'Ebced tabanli Esma-i Husna (Ya Safi 391 Hz, Ya Vedud 432 Hz), Kuran sifa sureleri, 4-7-8 zikir nefesi.' },
    { name: '2. Uzak Dogu 7 Cakra & Solfejyo (50 Frekans)', desc: 'Kokten Taca 7 enerji girdabi, 174 Hz - 963 Hz solfejyo oktavlari, 7 metalli Tibet canaklari.' },
    { name: '3. 5 Kadim Element & Doga (50 Frekans)', desc: 'Toprak (194 Hz), Su (417 Hz), Ates (528 Hz), Hava (639 Hz), Eter (741 Hz) ve Schumann 7.83 Hz yerkure rezonansi.' },
    { name: '4. Anadolu Sufi Musikisi (50 Frekans)', desc: 'Selcuklu ve Osmanli darussifalarinda uygulanan 25 kadim makam terapisi (Rast, Hicaz, Nihavend, Buselik) ve Mevlevi ney taksimleri.' },
    { name: '5. Samanik Davul Teta Transi (50 Frekans)', desc: 'Beyni 4.5 Hz derin Teta bandina kilitleyen 120-135 BPM monoritmik davul vuruslari, Sibirya/Altay koklenme ritimleri.' },
    { name: '6. Kelt & Iskandinav Akustigi (50 Frekans)', desc: '13 Kutsal Kelt agaci (Ogham), gumus telli Keltik arp, Tagelharpa yaylisi ve Futhark run biyo-alan korumasi.' }
  ];

  schools.forEach(s => {
    checkPage(12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 1.5, 1.5, 'FD');
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(clean(s.name), margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.text(clean(s.desc), margin + 3, y + 8);
    y += 12;
  });

  y += 2;
  checkPage(40);

  // Section 3: Pricing Packages
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clean('3. UYGULAMA ICI RESMI LISANS PAKETLERI VE FIYATLANDIRMA'), margin, y);
  y += 6;

  MEMBERSHIP_PACKAGES.forEach(pkg => {
    checkPage(18);
    doc.setFillColor(pkg.isDemo ? 240 : 255, pkg.isDemo ? 253 : 255, pkg.isDemo ? 244 : 255);
    doc.setDrawColor(pkg.popular ? 16 : 203, pkg.popular ? 185 : 213, pkg.popular ? 129 : 225);
    doc.setLineWidth(pkg.popular ? 0.4 : 0.2);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 16, 2, 2, 'FD');

    // Title & Badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(clean(`${pkg.name} (${pkg.durationText})`), margin + 4, y + 5);

    // Price
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87);
    doc.text(clean(pkg.priceText), pageWidth - margin - 35, y + 5);

    // Features
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const featStr = clean(pkg.features.slice(0, 3).join(' • '));
    doc.text(doc.splitTextToSize(featStr, pageWidth - 2 * margin - 8), margin + 4, y + 10);

    y += 18;
  });

  y += 2;
  checkPage(45);

  // Section 4: Corporate ROI & Value
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clean('4. KURUMSAL FAYDALAR VE YATIRIM GETIRISI (ROI)'), margin, y);
  y += 6;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(5, 150, 105);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const roiText = clean(
    `• Saglik & Tamamlayici Tip: Tedavi oncesi ve sonrasi biyo-alan artisini kanitlayan 8 sekmeli resmi PDF ciktisi ve akilli saat nabiz dogrulamasi.\n• Spa & Wellness Otelleri: VIP Check-in esnasinda 3 dakikalik aura analizi ve kisisel frekans odasi seansi.\n• Kurumsal Esenlik (Corporate Wellness): Calisan stresini ve zihinsel yorgunlugu sifirlayan MindSpace seanslari ve 7 Gunluk Kamplar.\n• Amortisman Hesabi: Gunde 5 danisan x 500 TL = 2.500 TL/Gun. 3 Aylik Lisans (10.000 TL) sadece 4 gunde kendini amorti eder!`
  );
  doc.text(doc.splitTextToSize(roiText, pageWidth - 2 * margin - 8), margin + 4, y + 5);
  y += 30;

  // Section 5: Official Contact & Bank Info
  checkPage(30);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(clean(`HESAP SAHIBI: ${BANK_INFO.accountHolder} (Psikolog & Biyo-Rezonans Uzmani)`), margin + 4, y + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(clean(`BANKA: ${BANK_INFO.bankName}  |  IBAN: ${BANK_INFO.iban}`), margin + 4, y + 11);
  doc.text(clean(`ILETISIM: ${ADMIN_PHONE}  |  E-POSTA: ${ADMIN_EMAILS[0]}`), margin + 4, y + 16);

  // Download PDF
  doc.save(`AuraBio_Frekans_Teknik_Is_Sunumu_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
}
