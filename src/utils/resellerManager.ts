import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserMember, MemberOrder } from './authManager';

export interface BankInfo {
  bankName: string;
  accountHolder: string;
  iban: string;
}

export interface DealerPackage {
  id: string;
  name: string;
  scanCredits: number;
  price: number;
  priceText: string;
  badge: string;
  popular?: boolean;
  targetAudience: string;
  unitCostText: string;
  features: string[];
}

export const DEFAULT_DEALER_PACKAGES: DealerPackage[] = [
  {
    id: 'pkg-5k',
    name: 'Mini Başlangıç & Deneme Paketi',
    scanCredits: 32,
    price: 5000,
    priceText: '5.000 ₺',
    badge: 'MİNİ DENEME',
    targetAudience: 'Sistemi düşük bütçeyle denemek isteyen bireysel kullanıcı ve uygulayıcılar.',
    unitCostText: '156 ₺ / Seans Maliyeti',
    features: [
      '32 Adet Tam Biyo-Rezonans & Çakra Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Temel Aura ve Frekans Analiz Modülleri',
      'Web & Mobil Uyumlu Arayüz',
      'WhatsApp Destek Hattı'
    ]
  },
  {
    id: 'pkg-10k',
    name: 'Bronz Başlangıç & Seans Paketi',
    scanCredits: 70,
    price: 10000,
    priceText: '10.000 ₺',
    badge: 'BAŞLANGIÇ & BİREYSEL',
    targetAudience: 'Sisteme yeni adım atan bireysel terapist ve danışmanlar.',
    unitCostText: '142 ₺ / Seans Maliyeti',
    features: [
      '70 Adet Tam Biyo-Rezonans & Çakra Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Tam Yetkili Bayi Paneli & Danışan Kaydı',
      'Özel Davet Linki & Referans Kodu (?ref=)',
      'Standart WhatsApp Canlı Destek Hattı'
    ]
  },
  {
    id: 'pkg-15k',
    name: 'Gümüş Standart Terapist Paketi',
    scanCredits: 115,
    price: 15000,
    priceText: '15.000 ₺',
    badge: 'STANDART TERAPİST',
    targetAudience: 'Düzenli danışan alan bireysel koçlar ve bio-enerji uygulayıcıları.',
    unitCostText: '130 ₺ / Seans Maliyeti',
    features: [
      '115 Adet Tam Biyo-Rezonans & Çakra Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Organ, Çakra ve Meridyen Raporlama',
      'Danışan Takip Modülü',
      'Hızlı WhatsApp Destek Hizmeti'
    ]
  },
  {
    id: 'pkg-20k',
    name: 'Gümüş Plus Terapist Paketi',
    scanCredits: 160,
    price: 20000,
    priceText: '20.000 ₺',
    badge: 'TERAPİST & PRATİSYEN',
    targetAudience: 'Düzenli seans yapan holistik sağlık koçları ve pratisyenler.',
    unitCostText: '125 ₺ / Seans Maliyeti',
    features: [
      '160 Adet Tam Biyo-Rezonans & Çakra Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Detaylı Organ, Çakra ve Letaif Analiz Raporları',
      'Danışan Kayıt & Takip Sistemi',
      'Öncelikli Frekans & Biyo-Rezonans Desteği'
    ]
  },
  {
    id: 'pkg-25k',
    name: 'Altın Danışman Paketi',
    scanCredits: 215,
    price: 25000,
    priceText: '25.000 ₺',
    badge: 'DANIŞMAN & KOÇ',
    targetAudience: 'Genişleyen danışan tabanına sahip profesyonel terapistler.',
    unitCostText: '116 ₺ / Seans Maliyeti',
    features: [
      '215 Adet Tam Biyo-Rezonans & Çakra Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Gelişmiş PDF Rapor Dışa Aktarma',
      'Özel Frekans Listeleri & Protokoller',
      'Öncelikli Canlı Destek'
    ]
  },
  {
    id: 'pkg-30k',
    name: 'Altın Pro Danışman Paketi',
    scanCredits: 270,
    price: 30000,
    priceText: '30.000 ₺',
    badge: 'EN POPÜLER & F/P',
    popular: true,
    targetAudience: 'Yoğun danışan kabul eden profesyonel terapistler ve merkezler.',
    unitCostText: '111 ₺ / Seans Maliyeti',
    features: [
      '270 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Gelişmiş PDF Rapor Dışa Aktarma & Arşivleme',
      'Özel Frekans Listeleri & Özel Protokol Tanımlama',
      'Kendi Danışanlarına Özel Fiyat Belirleme Özgürlüğü',
      'Öncelikli VIP WhatsApp Desteği'
    ]
  },
  {
    id: 'pkg-50k',
    name: 'Platin Klinik & Uzman Paketi',
    scanCredits: 500,
    price: 50000,
    priceText: '50.000 ₺',
    badge: 'UZMAN KLİNİK',
    targetAudience: 'Geniş danışan portföyüne sahip klinikler ve bio-frekans merkezleri.',
    unitCostText: '100 ₺ / Seans Maliyeti',
    features: [
      '500 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Çoklu Terapist ve Danışan Yönetim Desteği',
      'Özel Alt Bayilik (Sub-dealer) Oluşturma Yetkisi',
      '7/24 Kesintisiz VIP Destek & Heyet Danışmanlığı'
    ]
  },
  {
    id: 'pkg-60k',
    name: 'Safir Kurumsal Merkez Paketi',
    scanCredits: 650,
    price: 60000,
    priceText: '60.000 ₺',
    badge: 'SAFİR KURUMSAL',
    targetAudience: 'Çoklu seans odası bulunan sağlıklı yaşam ve holistik merkezler.',
    unitCostText: '92 ₺ / Seans Maliyeti',
    features: [
      '650 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Grup Aura Senkronizasyonu & Çoklu Tarama',
      'Özel Kurumsal Logo ve Rapor Başlığı Entegrasyonu',
      'Genişletilmiş Frekans Kütüphanesi & Özel Eğitim Desteği'
    ]
  },
  {
    id: 'pkg-70k',
    name: 'Zümrüt Master Klinik Paketi',
    scanCredits: 800,
    price: 70000,
    priceText: '70.000 ₺',
    badge: 'ZÜMRÜT MASTER',
    targetAudience: 'Bölgesel sağlık merkezleri ve uzman klinik ağları.',
    unitCostText: '87 ₺ / Seans Maliyeti',
    features: [
      '800 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Gelişmiş AI Biyo-Rezonans ve Frekans Öneri Modülü',
      'Limitsiz Danışan Geçmişi ve Otomatik Seans Takibi',
      'Öncelikli Yeni Modül & Frekans Güncelleme Desteği'
    ]
  },
  {
    id: 'pkg-80k',
    name: 'Yakut Elit Sağlık Paketi',
    scanCredits: 950,
    price: 80000,
    priceText: '80.000 ₺',
    badge: 'YAKUT ELİT',
    targetAudience: 'Yüksek hacimli estetik, wellness ve bioenerji merkezleri.',
    unitCostText: '84 ₺ / Seans Maliyeti',
    features: [
      '950 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Gelişmiş Organ Grafikleri & 3D Biyo-Aura Simülatörü',
      'Alt Terapist Kullanıcı Yetkilendirme Sistemi',
      'Özel Heyet Eğitimi ve Uygulayıcı Katılım Sertifikasyonu'
    ]
  },
  {
    id: 'pkg-90k',
    name: 'Titanyum Entegre Tıp Paketi',
    scanCredits: 1100,
    price: 90000,
    priceText: '90.000 ₺',
    badge: 'TİTANYUM ENTEGRE',
    targetAudience: 'Entegre ve fonksiyonel tıp hekimleri ile hastane departmanları.',
    unitCostText: '81 ₺ / Seans Maliyeti',
    features: [
      '1.100 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Tüm Kuantum Frekans Veritabanı ve Letaif Haritaları',
      'Özel Veri Entegrasyon Protokolleri',
      '7/24 Birebir VIP Teknik & Danışmanlık Hattı'
    ]
  },
  {
    id: 'pkg-100k',
    name: 'Elmas Bölge Distribütör Paketi',
    scanCredits: 1300,
    price: 100000,
    priceText: '100.000 ₺',
    badge: 'BÖLGE DİSTRİBÜTÖRÜ',
    targetAudience: 'İl ve bölge distribütörleri, franchise temsilcileri.',
    unitCostText: '76 ₺ / Seans Maliyeti',
    features: [
      '1.300 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Alt Bayi Açma & Alt Bayilere Kredi Dağıtım Havuzu',
      'Bölge Temsilciliği ve Öncelikli Danışan Yönlendirme Hakkı',
      'Sistem Heyeti İle Birebir Kurulum & VIP Danışmanlık'
    ]
  },
  {
    id: 'pkg-200k',
    name: 'Master Franchise & Çoklu Şube Paketi',
    scanCredits: 3000,
    price: 200000,
    priceText: '200.000 ₺',
    badge: 'MASTER FRANCHISE',
    targetAudience: 'Çok şubeli sağlık grupları, franchise ağları ve master organizasyonlar.',
    unitCostText: '66 ₺ / Seans Maliyeti',
    features: [
      '3.000 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Sınırsız Şube ve Alt Bayi Ağı Kurma İmkanı',
      'Özel Marka (Whitelabel Görünüm) & Rapor Özelleştirmesi',
      'Heyet Tarafından Yerinde / Canlı Kurulum ve Sürekli VIP Destek'
    ]
  },
  {
    id: 'pkg-300k',
    name: 'Enterprise Mega Ağ & Holding Paketi',
    scanCredits: 5000,
    price: 300000,
    priceText: '300.000 ₺',
    badge: 'ENTERPRISE MEGA AĞ',
    targetAudience: 'Ulusal ve uluslararası sağlık ağları, yatırımcılar ve holdingler.',
    unitCostText: '60 ₺ / Seans Maliyeti (Maksimum Kâr)',
    features: [
      '5.000 Adet Tam Biyo-Rezonans Seans Kredisi',
      'Süre Sınırı Yok (Kredileriniz Asla Yanmaz)',
      'Merkezi Kredi ve Bayi Yönetim Platformu',
      'Tüm Gelecek Modül ve Veri Güncellemelerine Ömür Boyu Erişim',
      'Özel Ayrılmış Bulut Sunucu & VIP Mimari Destek'
    ]
  },
  {
    id: 'pkg-turnkey-2m',
    name: 'Tüm Kodlar, Dosyalar & Anahtar Teslim Sistem Devri',
    scanCredits: 999999,
    price: 2000000,
    priceText: '2.000.000 ₺',
    badge: '👑 TÜM KODLAR & ANAHTAR TESLİM',
    targetAudience: 'Yazılımın tüm kaynak kodlarına, veritabanına ve mülkiyetine sahip olmak isteyen yatırımcılar.',
    unitCostText: 'Ömür Boyu Sınırsız / Tam Mülkiyet',
    features: [
      'Tüm Frontend & Backend Kaynak Kodları (Tam Açık Kaynak / Full Source Code)',
      'Tüm Frekans, Çakra, Letaif ve Biyo-Rezonans Veritabanı Dosyaları',
      '3D Biyo-Aura Simülatörü ve Kuantum Tarama Motoru Algoritmaları',
      'Kendi Sunucunuza Tam Anahtar Teslim Kurulum ve Devir Teslim Eğitimi',
      'Telif, Marka ve Ticari Hakların Tamamı (Whitelabel & Sınırsız Kullanım)',
      'Ömür Boyu Bağımsız Çalıştırma & Kendi Fiyatlandırmanızı Yapma Özgürlüğü'
    ]
  }
];

export interface Reseller {
  uid: string;
  resellerName: string;
  businessName?: string;
  fullName?: string;
  email: string;
  phone: string;
  referralCode: string; // e.g. 'AURA-BAYI-5521'
  commissionRate: number; // percentage e.g. 20 for 20%
  bankInfo: BankInfo;
  status: 'active' | 'pending' | 'suspended';
  totalEarnings: number; // total commission earned
  paidEarnings: number; // paid out by admin
  pendingEarnings: number; // waiting for payment
  totalSalesAmount: number; // total sales volume in TRY
  totalReferredUsers: number;
  creditsBalance?: number; // Total remaining scan/session credits pool
  dealerPackageId?: string; // Current or last active dealer package
  createdAt: string;
  updatedAt: string;
  notes?: string;
  [key: string]: any;
}

export interface CreditTransaction {
  id: string;
  resellerId: string;
  resellerName?: string;
  type: 'initial' | 'purchase' | 'admin_add' | 'admin_deduct' | 'admin_set' | 'scan_usage' | 'bonus';
  amount: number; // e.g. +50, -1, or difference
  previousBalance: number;
  newBalance: number;
  description: string;
  createdAt: string;
  performedBy?: string; // e.g. 'Sistem Yöneticisi', 'Canlı Seans Taraması', 'Bayi Paket Satın Alımı'
}

export interface CommissionTransaction {
  transactionId: string;
  resellerId: string;
  resellerName?: string;
  referralCode?: string;
  userId: string; // Masked user ID for privacy (e.g. USR-82F19B)
  orderId: string;
  packageName: string;
  amount: number; // Order total in TRY
  commissionRate: number; // e.g. 20%
  rate?: number;
  commissionAmount: number; // Earned in TRY
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: string;
  paidAt?: string;
  notes?: string;
  [key: string]: any;
}

export interface ResellerPublicInfo {
  uid: string;
  resellerName: string;
  referralCode: string;
  phone?: string;
}

const STORAGE_RESELLERS_KEY = 'aurabio_resellers_directory_v1';
const STORAGE_COMMISSIONS_KEY = 'aurabio_commissions_directory_v1';
const STORAGE_CREDIT_LOGS_KEY = 'aurabio_credit_logs_directory_v1';
const STORAGE_ACTIVE_RESELLER_SESSION_KEY = 'aurabio_active_reseller_session_v1';
const STORAGE_CACHED_REFERRAL_CODE_KEY = 'aurabio_stored_referral_code_v1';
const STORAGE_DEALER_PACKAGES_KEY = 'aurabio_dealer_packages_v3';

/**
 * Get all stored local credit transaction logs
 */
export function getLocalCreditLogs(): CreditTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CREDIT_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.debug('Error reading local credit logs:', e);
  }
  return [];
}

export function saveLocalCreditLogs(logs: CreditTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CREDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
    window.dispatchEvent(new CustomEvent('aurabio_credit_logs_updated'));
  } catch (e) {
    console.warn('Error saving local credit logs:', e);
  }
}

/**
 * Record a credit log entry to LocalStorage & Firestore
 */
export async function recordCreditTransaction(
  data: Omit<CreditTransaction, 'id' | 'createdAt'>
): Promise<CreditTransaction> {
  const id = `CR-LOG-${Math.floor(100000 + Math.random() * 900000)}`;
  const log: CreditTransaction = {
    ...data,
    id,
    createdAt: new Date().toISOString()
  };

  const current = getLocalCreditLogs();
  const updated = [log, ...current.filter(item => item.id !== id)].slice(0, 500);
  saveLocalCreditLogs(updated);

  try {
    const docRef = doc(db, 'credit_logs', id);
    await setDoc(docRef, log);
  } catch (err) {
    console.debug('Firestore credit log save notice:', err);
  }

  return log;
}

/**
 * Get all credit transaction history for a specific reseller/dealer
 */
export async function getCreditLogsForReseller(resellerId: string): Promise<CreditTransaction[]> {
  const local = getLocalCreditLogs().filter(l => l.resellerId === resellerId);
  try {
    const colRef = collection(db, 'credit_logs');
    const q = query(colRef, where('resellerId', '==', resellerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const map = new Map<string, CreditTransaction>();
      snap.forEach(d => {
        const item = d.data() as CreditTransaction;
        if (item.id) map.set(item.id, item);
      });
      local.forEach(l => map.set(l.id, l));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
  } catch (err) {
    console.debug('Firestore get credit logs notice:', err);
  }
  return local.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Admin: Get all credit logs system-wide
 */
export async function getAllCreditLogsAdmin(): Promise<CreditTransaction[]> {
  const local = getLocalCreditLogs();
  try {
    const colRef = collection(db, 'credit_logs');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const map = new Map<string, CreditTransaction>();
      snap.forEach(d => {
        const item = d.data() as CreditTransaction;
        if (item.id) map.set(item.id, item);
      });
      local.forEach(l => map.set(l.id, l));
      const list = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveLocalCreditLogs(list);
      return list;
    }
  } catch (err) {
    console.debug('Firestore get all credit logs notice:', err);
  }
  return local.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Admin: Direct adjustment of dealer credits (Add or Deduct) with audit logging
 */
export async function adminAdjustDealerCredits(
  resellerId: string,
  delta: number,
  reason: string = 'Yönetici Kredi Güncellemesi',
  performedBy: string = 'Sistem Yöneticisi'
): Promise<{ success: boolean; newBalance: number; message: string }> {
  try {
    const all = await getAllResellers();
    const reseller = all.find(r => r.uid === resellerId);
    if (!reseller) {
      return { success: false, newBalance: 0, message: 'Bayi bulunamadı.' };
    }

    const prev = reseller.creditsBalance !== undefined ? reseller.creditsBalance : 100;
    const next = Math.max(0, prev + delta);

    reseller.creditsBalance = next;
    reseller.updatedAt = new Date().toISOString();
    await adminSaveReseller(reseller);

    // Sync active session if this reseller is active
    const active = getActiveResellerSession();
    if (active && active.uid === resellerId) {
      setActiveResellerSession(reseller);
    }

    // Sync with UserMember account if exists
    try {
      const { getLocalMembersDirectory, saveToLocalMembersDirectory } = await import('./authManager');
      const allMembers = getLocalMembersDirectory();
      const mIdx = allMembers.findIndex(m => m.uid === resellerId || (reseller.email && m.email?.toLowerCase() === reseller.email.toLowerCase()));
      if (mIdx >= 0) {
        allMembers[mIdx].creditsBalance = next;
        if (allMembers[mIdx].dealerDetails) {
          allMembers[mIdx].dealerDetails!.creditsBalance = next;
        }
        saveToLocalMembersDirectory(allMembers[mIdx]);
        const userDocRef = doc(db, 'users', allMembers[mIdx].uid);
        await setDoc(userDocRef, { creditsBalance: next, dealerDetails: allMembers[mIdx].dealerDetails, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (uErr) {
      console.debug('User sync notice:', uErr);
    }

    // Log the transaction
    await recordCreditTransaction({
      resellerId: reseller.uid,
      resellerName: reseller.resellerName,
      type: delta >= 0 ? 'admin_add' : 'admin_deduct',
      amount: delta,
      previousBalance: prev,
      newBalance: next,
      description: reason || (delta >= 0 ? `+${delta} Seans Kredisi Eklendi` : `${delta} Seans Kredisi Düşüldü`),
      performedBy
    });

    return {
      success: true,
      newBalance: next,
      message: `Bayi kredisi başarıyla güncellendi. Yeni Bakiye: ${next} Seans`
    };
  } catch (err: any) {
    console.error('Admin adjust dealer credits error:', err);
    return { success: false, newBalance: 0, message: err?.message || 'Kredi güncellenemedi.' };
  }
}

/**
 * Admin: Direct set of exact dealer credits balance with audit logging
 */
export async function adminSetDealerCredits(
  resellerId: string,
  exactAmount: number,
  reason: string = 'Yönetici Doğrudan Kredi Belirleme',
  performedBy: string = 'Sistem Yöneticisi'
): Promise<{ success: boolean; newBalance: number; message: string }> {
  try {
    const all = await getAllResellers();
    const reseller = all.find(r => r.uid === resellerId);
    if (!reseller) {
      return { success: false, newBalance: 0, message: 'Bayi bulunamadı.' };
    }

    const prev = reseller.creditsBalance !== undefined ? reseller.creditsBalance : 100;
    const next = Math.max(0, exactAmount);
    const diff = next - prev;

    reseller.creditsBalance = next;
    reseller.updatedAt = new Date().toISOString();
    await adminSaveReseller(reseller);

    // Sync active session if this reseller is active
    const active = getActiveResellerSession();
    if (active && active.uid === resellerId) {
      setActiveResellerSession(reseller);
    }

    // Sync user profile
    try {
      const { getLocalMembersDirectory, saveToLocalMembersDirectory } = await import('./authManager');
      const allMembers = getLocalMembersDirectory();
      const mIdx = allMembers.findIndex(m => m.uid === resellerId || (reseller.email && m.email?.toLowerCase() === reseller.email.toLowerCase()));
      if (mIdx >= 0) {
        allMembers[mIdx].creditsBalance = next;
        if (allMembers[mIdx].dealerDetails) {
          allMembers[mIdx].dealerDetails!.creditsBalance = next;
        }
        saveToLocalMembersDirectory(allMembers[mIdx]);
        const userDocRef = doc(db, 'users', allMembers[mIdx].uid);
        await setDoc(userDocRef, { creditsBalance: next, dealerDetails: allMembers[mIdx].dealerDetails, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (uErr) {
      console.debug('User sync notice:', uErr);
    }

    // Log the transaction
    await recordCreditTransaction({
      resellerId: reseller.uid,
      resellerName: reseller.resellerName,
      type: 'admin_set',
      amount: diff,
      previousBalance: prev,
      newBalance: next,
      description: `${reason} (Doğrudan ${next} Krediye Ayarlandı)`,
      performedBy
    });

    return {
      success: true,
      newBalance: next,
      message: `Bayi kredisi ${next} olarak başarıyla ayarlandı.`
    };
  } catch (err: any) {
    console.error('Admin set dealer credits error:', err);
    return { success: false, newBalance: 0, message: err?.message || 'Kredi ayarlanamadı.' };
  }
}

/**
 * Get dynamic dealer packages
 */
export function getDealerPackages(): DealerPackage[] {
  if (typeof window === 'undefined') return DEFAULT_DEALER_PACKAGES;
  try {
    const raw = localStorage.getItem(STORAGE_DEALER_PACKAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 13) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug('Error reading local dealer packages:', e);
  }
  return DEFAULT_DEALER_PACKAGES;
}

export function saveDealerPackages(pkgs: DealerPackage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DEALER_PACKAGES_KEY, JSON.stringify(pkgs));
    window.dispatchEvent(new CustomEvent('aurabio_dealer_packages_updated'));
  } catch (e) {
    console.warn('Error saving local dealer packages:', e);
  }
}

/**
 * Admin: Save / Create or Update Dealer Package
 */
export async function adminSaveDealerPackage(pkg: DealerPackage): Promise<boolean> {
  try {
    const current = getDealerPackages();
    const idx = current.findIndex(p => p.id === pkg.id);
    let updated: DealerPackage[];

    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...pkg };
    } else {
      updated = [...current, { ...pkg }];
    }

    saveDealerPackages(updated);

    // Save to Firestore
    try {
      const docRef = doc(db, 'system_config', 'dealer_packages');
      await setDoc(docRef, { packages: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (fsErr) {
      console.warn('Admin save dealer package Firestore notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Admin save dealer package error:', err);
    return false;
  }
}

/**
 * Admin: Delete Dealer Package
 */
export async function adminDeleteDealerPackage(pkgId: string): Promise<boolean> {
  try {
    const current = getDealerPackages();
    const updated = current.filter(p => p.id !== pkgId);
    saveDealerPackages(updated);

    try {
      const docRef = doc(db, 'system_config', 'dealer_packages');
      await setDoc(docRef, { packages: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (fsErr) {
      console.warn('Admin delete dealer package Firestore notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Admin delete dealer package error:', err);
    return false;
  }
}

/**
 * Admin: Reset Dealer Packages to defaults
 */
export async function adminResetDealerPackages(): Promise<boolean> {
  try {
    saveDealerPackages(DEFAULT_DEALER_PACKAGES);

    try {
      const docRef = doc(db, 'system_config', 'dealer_packages');
      await setDoc(docRef, { packages: DEFAULT_DEALER_PACKAGES, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (fsErr) {
      console.warn('Admin reset dealer packages Firestore notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Admin reset dealer packages error:', err);
    return false;
  }
}

/**
 * Subscribe to Dealer Packages changes in real-time
 */
export function subscribeToDealerPackages(onUpdate: (pkgs: DealerPackage[]) => void): Unsubscribe {
  onUpdate(getDealerPackages());

  const handleLocal = () => onUpdate(getDealerPackages());
  window.addEventListener('storage', handleLocal);
  window.addEventListener('aurabio_dealer_packages_updated', handleLocal);

  try {
    const docRef = doc(db, 'system_config', 'dealer_packages');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.packages) && data.packages.length > 0) {
          saveDealerPackages(data.packages);
          onUpdate(data.packages as DealerPackage[]);
        }
      }
    });

    return () => {
      window.removeEventListener('storage', handleLocal);
      window.removeEventListener('aurabio_dealer_packages_updated', handleLocal);
      unsub();
    };
  } catch {
    return () => {
      window.removeEventListener('storage', handleLocal);
      window.removeEventListener('aurabio_dealer_packages_updated', handleLocal);
    };
  }
}

/**
 * Purchase / Apply Dealer Package and top-up credits to Reseller / Dealer account
 */
export async function purchaseDealerPackage(
  resellerOrUserId: string,
  packageId: string
): Promise<{ success: boolean; message: string; creditsAdded: number; newTotalCredits: number }> {
  try {
    const packages = getDealerPackages();
    const pkg = packages.find(p => p.id === packageId) || DEFAULT_DEALER_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return { success: false, message: 'Bayilik paketi bulunamadı.', creditsAdded: 0, newTotalCredits: 0 };
    }

    // 1. Update Reseller if exists
    let newResellerCredits = 0;
    const allResellers = await getAllResellers();
    const cleanLookup = (resellerOrUserId || '').toLowerCase();
    const rIdx = allResellers.findIndex(r => r.uid === resellerOrUserId || (r.email && r.email.toLowerCase() === cleanLookup));
    if (rIdx >= 0) {
      const reseller = allResellers[rIdx];
      const curCredits = reseller.creditsBalance || 0;
      reseller.creditsBalance = curCredits + pkg.scanCredits;
      reseller.dealerPackageId = pkg.id;
      reseller.updatedAt = new Date().toISOString();
      allResellers[rIdx] = reseller;
      saveLocalResellers(allResellers);
      newResellerCredits = reseller.creditsBalance;

      const activeRes = getActiveResellerSession();
      if (activeRes && activeRes.uid === reseller.uid) {
        setActiveResellerSession(reseller);
      }

      try {
        const docRef = doc(db, 'resellers', reseller.uid);
        await setDoc(docRef, { creditsBalance: reseller.creditsBalance, dealerPackageId: pkg.id, updatedAt: reseller.updatedAt }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore reseller credits update notice:', fsErr);
      }
    }

    // 2. Update Member User if matching
    const { getActiveMemberSession, fetchMemberProfile } = await import('./authManager');
    let user = getActiveMemberSession();
    if (!user || (user.uid !== resellerOrUserId && (!user.email || user.email.toLowerCase() !== cleanLookup))) {
      user = await fetchMemberProfile(resellerOrUserId);
    }

    let finalUserCredits = newResellerCredits || pkg.scanCredits;

    if (user) {
      const curCredits = user.creditsBalance || 0;
      finalUserCredits = curCredits + pkg.scanCredits;

      const updatedUser: UserMember = {
        ...user,
        role: 'dealer',
        dealerStatus: 'approved',
        isAllowed: true,
        creditsBalance: finalUserCredits,
        dealerPackageId: pkg.id,
        paymentStatus: 'PAID',
      };

      // Save user
      localStorage.setItem('aurabio_active_session_v1', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('aurabio_session_updated', { detail: updatedUser }));

      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          role: 'dealer',
          dealerStatus: 'approved',
          isAllowed: true,
          creditsBalance: finalUserCredits,
          dealerPackageId: pkg.id,
          paymentStatus: 'PAID',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore user credits update notice:', fsErr);
      }
    }

    // Record credit transaction log
    const targetUid = rIdx >= 0 ? allResellers[rIdx].uid : (user?.uid || resellerOrUserId);
    const targetName = rIdx >= 0 ? allResellers[rIdx].resellerName : (user?.fullName || 'Yetkili Bayi');
    const prevCredits = rIdx >= 0 ? (allResellers[rIdx].creditsBalance! - pkg.scanCredits) : ((user?.creditsBalance || 0) - pkg.scanCredits);

    await recordCreditTransaction({
      resellerId: targetUid,
      resellerName: targetName,
      type: 'purchase',
      amount: pkg.scanCredits,
      previousBalance: Math.max(0, prevCredits),
      newBalance: finalUserCredits,
      description: `${pkg.name} Satın Alımı (+${pkg.scanCredits} Seans Kredisi)`,
      performedBy: 'Bayi Paket Satın Alımı'
    });

    return {
      success: true,
      message: `${pkg.name} başarıyla aktive edildi! Hesabınıza ${pkg.scanCredits} Adet Tarama & Seans kredisi tanımlandı.`,
      creditsAdded: pkg.scanCredits,
      newTotalCredits: finalUserCredits
    };
  } catch (err: any) {
    console.error('Purchase dealer package error:', err);
    return { success: false, message: err?.message || 'Paket satın alma işlemi tamamlanamadı.', creditsAdded: 0, newTotalCredits: 0 };
  }
}

/**
 * Deduct 1 Scan/Session credit from Dealer's pool (with verification and multi-store synchronization)
 */
export async function deductScanCreditFromDealer(userId?: string): Promise<{ success: boolean; remainingCredits: number; message?: string }> {
  try {
    const { getActiveMemberSession, fetchMemberProfile } = await import('./authManager');
    let remaining = 99;
    let deducted = false;
    let prevCreditsBeforeDeduct = 100;

    // 1. Check and deduct from active Reseller session if present
    const activeReseller = getActiveResellerSession();
    const allResellers = await getAllResellers();

    let targetReseller: Reseller | null = null;
    let targetResellerIdx = -1;

    if (activeReseller) {
      targetResellerIdx = allResellers.findIndex(r => r.uid === activeReseller.uid);
      if (targetResellerIdx >= 0) {
        targetReseller = allResellers[targetResellerIdx];
      } else {
        targetReseller = activeReseller;
      }
    } else if (userId) {
      const cleanUserId = (userId || '').toLowerCase();
      targetResellerIdx = allResellers.findIndex(r => r.uid === userId || (r.email && r.email.toLowerCase() === cleanUserId));
      if (targetResellerIdx >= 0) {
        targetReseller = allResellers[targetResellerIdx];
      }
    }

    if (targetReseller) {
      const curResCredits = targetReseller.creditsBalance !== undefined ? targetReseller.creditsBalance : 100;
      prevCreditsBeforeDeduct = curResCredits;
      const newResCredits = Math.max(0, curResCredits - 1);
      targetReseller.creditsBalance = newResCredits;
      targetReseller.updatedAt = new Date().toISOString();

      if (targetResellerIdx >= 0) {
        allResellers[targetResellerIdx] = targetReseller;
      } else {
        allResellers.push(targetReseller);
      }

      saveLocalResellers(allResellers);
      setActiveResellerSession(targetReseller);

      try {
        const docRef = doc(db, 'resellers', targetReseller.uid);
        await setDoc(docRef, { creditsBalance: newResCredits, updatedAt: targetReseller.updatedAt }, { merge: true });
      } catch (fsErr) {
        console.debug('Firestore reseller credit deduct notice:', fsErr);
      }

      remaining = newResCredits;
      deducted = true;
    }

    // 2. Check and deduct from active Member User if present
    let user = getActiveMemberSession();
    if ((!user || (userId && user.uid !== userId)) && userId) {
      user = await fetchMemberProfile(userId);
    }

    if (user) {
      const curUserCredits = user.creditsBalance !== undefined 
        ? user.creditsBalance 
        : (targetReseller?.creditsBalance !== undefined ? targetReseller.creditsBalance : 100);
      
      prevCreditsBeforeDeduct = curUserCredits;
      const newUserCredits = Math.max(0, curUserCredits - 1);
      const updatedUser: UserMember = {
        ...user,
        creditsBalance: newUserCredits,
        dealerDetails: user.dealerDetails ? {
          ...user.dealerDetails,
          creditsBalance: newUserCredits
        } : undefined
      };

      localStorage.setItem('aurabio_active_session_v1', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('aurabio_session_updated', { detail: updatedUser }));

      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { 
          creditsBalance: newUserCredits, 
          dealerDetails: updatedUser.dealerDetails,
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } catch {
        // non-blocking
      }

      remaining = newUserCredits;
      deducted = true;
    }

    // Record credit usage audit log
    if (deducted) {
      const dealerUid = targetReseller?.uid || user?.uid || 'DEALER';
      const dealerName = targetReseller?.resellerName || user?.fullName || 'Bayi Taraması';
      await recordCreditTransaction({
        resellerId: dealerUid,
        resellerName: dealerName,
        type: 'scan_usage',
        amount: -1,
        previousBalance: prevCreditsBeforeDeduct,
        newBalance: remaining,
        description: 'Canlı Biyo-Aura & Spektrometre Seans Taraması Gerçekleştirildi (-1 Kredi)',
        performedBy: 'Otomatik Seans Taraması'
      });
    }

    // Broadcast update globally
    window.dispatchEvent(new CustomEvent('aurabio_credits_deducted', { detail: { remainingCredits: remaining } }));

    return { 
      success: true, 
      remainingCredits: remaining,
      message: deducted ? '1 Seans kredisi düşüldü.' : 'Kredi kontrolü tamamlandı.'
    };
  } catch (err) {
    console.warn('Deduct credit error:', err);
    return { success: true, remainingCredits: 99 };
  }
}

export const DEFAULT_RESELLERS: Reseller[] = [];

export const DEFAULT_COMMISSIONS: CommissionTransaction[] = [];

const LEGACY_MOCK_RESELLER_IDS = new Set([
  'RESELLER-MERKEZ-01',
  'RESELLER-DOGAL-02',
  'RESELLER-AKADEMI-03',
  'RESELLER-ANADOLU-04'
]);

const LEGACY_MOCK_COMMISSION_IDS = new Set([
  'COMM-10941',
  'COMM-10942',
  'COMM-10943',
  'COMM-20101',
  'COMM-20102'
]);

/**
 * Get all stored local resellers (filtered of any legacy mock/demo entries)
 */
export function getLocalResellers(): Reseller[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_RESELLERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((r: any) => r && r.uid && !LEGACY_MOCK_RESELLER_IDS.has(r.uid));
        return cleaned;
      }
    }
  } catch (e) {
    console.debug('Error parsing local resellers:', e);
  }
  return [];
}

export function saveLocalResellers(resellers: Reseller[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = resellers.filter(r => r && r.uid && !LEGACY_MOCK_RESELLER_IDS.has(r.uid));
    localStorage.setItem(STORAGE_RESELLERS_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('aurabio_resellers_updated'));
  } catch (e) {
    console.warn('Error saving local resellers:', e);
  }
}

/**
 * Get all stored local commissions (filtered of any legacy mock/demo entries)
 */
export function getLocalCommissions(): CommissionTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_COMMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((c: any) => c && c.transactionId && !LEGACY_MOCK_COMMISSION_IDS.has(c.transactionId));
        return cleaned;
      }
    }
  } catch (e) {
    console.debug('Error parsing local commissions:', e);
  }
  return [];
}

export function saveLocalCommissions(commissions: CommissionTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = commissions.filter(c => c && c.transactionId && !LEGACY_MOCK_COMMISSION_IDS.has(c.transactionId));
    localStorage.setItem(STORAGE_COMMISSIONS_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('aurabio_commissions_updated'));
  } catch (e) {
    console.warn('Error saving local commissions:', e);
  }
}

/**
 * Mask User ID for Privacy in Reseller Panels (e.g. USR-A79B)
 */
export function maskUserId(rawId: string): string {
  if (!rawId) return 'USR-XXXX';
  const clean = rawId.replace(/^USR-/, '').replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length <= 4) return `USR-${clean.toUpperCase()}`;
  return `USR-${clean.substring(0, 4).toUpperCase()}`;
}

// Cookie helper for cross-browser persistent referral storage
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, val: string, days = 365): void {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

const COOKIE_REFERRAL_KEY = 'aurabio_ref_code_v3';

/**
 * Parse & Detect referral code STRICTLY from current URL search query (?ref=..., ?referral=..., ?bayi=...) or hash (#ref=...)
 * Returns null if visitor did not arrive via a direct referral URL.
 */
export function detectReferralCodeFromUrlOnly(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    let foundCode: string | null = null;

    // 1. Check window.location.search (e.g. ?ref=AURA-BAYI-5521)
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      foundCode = searchParams.get('ref') || 
                  searchParams.get('referral') || 
                  searchParams.get('bayi') || 
                  searchParams.get('bayiKodu') ||
                  searchParams.get('r');
    }

    // 2. Check window.location.hash (e.g. #ref=AURA-BAYI-5521 or #tab=camera&ref=...)
    if (!foundCode && window.location.hash) {
      const hashStr = window.location.hash.replace(/^#/, '');
      const queryIdx = hashStr.indexOf('?');
      const paramStr = queryIdx >= 0 ? hashStr.substring(queryIdx + 1) : hashStr;
      const hashParams = new URLSearchParams(paramStr);
      foundCode = hashParams.get('ref') || 
                  hashParams.get('referral') || 
                  hashParams.get('bayi') || 
                  hashParams.get('bayiKodu') ||
                  hashParams.get('r');
    }

    if (foundCode) {
      const cleanCode = foundCode.trim().toUpperCase();
      try {
        localStorage.setItem(STORAGE_CACHED_REFERRAL_CODE_KEY, cleanCode);
        sessionStorage.setItem(STORAGE_CACHED_REFERRAL_CODE_KEY, cleanCode);
        sessionStorage.setItem('aurabio_url_referral_active', cleanCode);
      } catch {
        // ignore
      }
      setCookie(COOKIE_REFERRAL_KEY, cleanCode, 180);
      return cleanCode;
    }
  } catch (err) {
    console.warn('Detect referral code from URL notice:', err);
  }

  return null;
}

/**
 * Parse & Detect referral code from URL or persistent storage
 */
export function detectAndSaveReferralCodeFromUrl(): string | null {
  const fromUrl = detectReferralCodeFromUrlOnly();
  if (fromUrl) return fromUrl;
  return getStoredReferralCode();
}

/**
 * Check if the active session entered via a direct referral URL
 */
export function isDirectUrlReferralActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(sessionStorage.getItem('aurabio_url_referral_active') || detectReferralCodeFromUrlOnly());
  } catch {
    return false;
  }
}

/**
 * Get stored referral code from local/session storage or cookies
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLocal = localStorage.getItem(STORAGE_CACHED_REFERRAL_CODE_KEY);
    if (fromLocal) return fromLocal.trim().toUpperCase();

    const fromSession = sessionStorage.getItem(STORAGE_CACHED_REFERRAL_CODE_KEY);
    if (fromSession) return fromSession.trim().toUpperCase();

    const fromCookie = getCookie(COOKIE_REFERRAL_KEY);
    if (fromCookie) return fromCookie.trim().toUpperCase();

    return null;
  } catch {
    return null;
  }
}

/**
 * Clear cached referral code from all storage layers
 */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_CACHED_REFERRAL_CODE_KEY);
    sessionStorage.removeItem(STORAGE_CACHED_REFERRAL_CODE_KEY);
    sessionStorage.removeItem('aurabio_url_referral_active');
    setCookie(COOKIE_REFERRAL_KEY, '', -1);
  } catch {
    // non-blocking
  }
}

/**
 * Store referral code explicitly across all storage layers
 */
export function setStoredReferralCode(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  try {
    const clean = code.trim().toUpperCase();
    localStorage.setItem(STORAGE_CACHED_REFERRAL_CODE_KEY, clean);
    sessionStorage.setItem(STORAGE_CACHED_REFERRAL_CODE_KEY, clean);
    setCookie(COOKIE_REFERRAL_KEY, clean, 180);
  } catch {
    // non-blocking
  }
}

/**
 * Fetch all resellers from Firestore with fallback to Local Directory and strict distinct deduplication
 */
export async function getAllResellers(): Promise<Reseller[]> {
  const map = new Map<string, Reseller>();

  // 1. Local list
  getLocalResellers().forEach(r => {
    if (r.uid) map.set(r.uid, r);
  });

  // 2. Firestore collection 'resellers'
  try {
    const colRef = collection(db, 'resellers');
    const snap = await getDocs(colRef);
    snap.forEach(docSnap => {
      // Legacy reseller documents may omit uid; the Firestore document ID is authoritative.
      const data = { ...docSnap.data(), uid: docSnap.id } as Reseller;
      if (data.uid) {
        map.set(data.uid, data);
      }
    });
  } catch (err) {
    console.debug('Fetch resellers Firestore notice (using local directory):', err);
  }

  // 3. Fallback: also merge confirmed dealers from members directory
  try {
    const { getLocalMembersDirectory } = await import('./authManager');
    const members = getLocalMembersDirectory();
    members.forEach(m => {
      if (m.role === 'dealer' || m.role === 'admin' || m.dealerStatus === 'approved' || m.dealerDetails) {
        if (!map.has(m.uid)) {
          const code = m.dealerDetails?.referralCode || m.referralCode || (m.role === 'admin' ? 'AURA-BAYI-AKN01' : `AURA-BAYI-${Math.floor(1000 + Math.random() * 9000)}`);
          map.set(m.uid, {
            uid: m.uid,
            resellerName: m.dealerDetails?.companyName || m.fullName,
            email: m.email,
            phone: m.dealerDetails?.whatsapp || m.phone,
            referralCode: code,
            commissionRate: m.dealerDetails?.commissionRate || (m.role === 'admin' ? 30 : 20),
            creditsBalance: m.creditsBalance !== undefined ? m.creditsBalance : 100,
            dealerPackageId: m.dealerPackageId || 'silver-dealer',
            bankInfo: {
              bankName: m.dealerDetails?.bankInfo?.bankName || '',
              accountHolder: m.dealerDetails?.bankInfo?.accountHolder || m.fullName,
              iban: m.dealerDetails?.bankInfo?.iban || '',
            },
            status: 'active',
            totalEarnings: 0,
            paidEarnings: 0,
            pendingEarnings: 0,
            totalSalesAmount: 0,
            totalReferredUsers: 0,
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  } catch (e) {
    // non-blocking
  }

  // 4. Strict Distinct / Unique Consolidation: Deduplicate by email and referralCode
  const distinctByEmail = new Map<string, Reseller>();
  const distinctByCode = new Map<string, Reseller>();
  const finalizedList: Reseller[] = [];

  Array.from(map.values()).forEach(r => {
    if (!r.uid || !r.resellerName) return;

    const cleanEmail = (r.email || '').trim().toLowerCase();
    const cleanCode = (r.referralCode || '').trim().toUpperCase();

    // If duplicate email exists, keep the one with a valid referralCode or higher credits/activity
    if (cleanEmail && distinctByEmail.has(cleanEmail)) {
      const existing = distinctByEmail.get(cleanEmail)!;
      if (!existing.referralCode && r.referralCode) {
        distinctByEmail.set(cleanEmail, r);
      }
      return;
    }

    // If duplicate referral code exists (unless empty), prevent duplicate entry
    if (cleanCode && distinctByCode.has(cleanCode)) {
      return;
    }

    if (cleanEmail) distinctByEmail.set(cleanEmail, r);
    if (cleanCode) distinctByCode.set(cleanCode, r);
    finalizedList.push(r);
  });

  saveLocalResellers(finalizedList);
  return finalizedList.sort((a, b) => {
    // Admin first, then by sales
    const aEmail = (a.email || '').toLowerCase();
    const bEmail = (b.email || '').toLowerCase();
    if (a.uid === 'ADMIN-AKN-01' || aEmail === 'psikologabdulkadirkan@gmail.com') return -1;
    if (b.uid === 'ADMIN-AKN-01' || bEmail === 'psikologabdulkadirkan@gmail.com') return 1;
    return (b.totalSalesAmount || 0) - (a.totalSalesAmount || 0);
  });
}

/**
 * Get active resellers list for registration dropdown
 */
export async function getActiveResellers(): Promise<Reseller[]> {
  const all = await getAllResellers();
  return all.filter(r => r.status === 'active');
}

/**
 * Find reseller by referral code (case-insensitive with multi-layer check)
 */
export async function getResellerByCode(code: string): Promise<Reseller | null> {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const all = await getAllResellers();
  const found = all.find(r => r.referralCode && r.referralCode.toUpperCase() === clean);
  if (found) return found;

  // Fallback 1: check members directory for a dealer with this referralCode
  try {
    const { getLocalMembersDirectory } = await import('./authManager');
    const members = getLocalMembersDirectory();
    const dealerUser = members.find(m => 
      m.dealerDetails?.referralCode?.toUpperCase() === clean ||
      m.referralCode?.toUpperCase() === clean ||
      (m.role === 'dealer' && (m.uid === code || m.referredByCode?.toUpperCase() === clean))
    );

    if (dealerUser) {
      return {
        uid: dealerUser.uid,
        resellerName: dealerUser.dealerDetails?.companyName || dealerUser.fullName,
        email: dealerUser.email,
        phone: dealerUser.dealerDetails?.whatsapp || dealerUser.phone,
        referralCode: dealerUser.dealerDetails?.referralCode || dealerUser.referralCode || clean,
        commissionRate: dealerUser.dealerDetails?.commissionRate || 20,
        creditsBalance: dealerUser.creditsBalance !== undefined ? dealerUser.creditsBalance : 100,
        bankInfo: {
          bankName: dealerUser.dealerDetails?.bankInfo?.bankName || '',
          accountHolder: dealerUser.dealerDetails?.bankInfo?.accountHolder || dealerUser.fullName,
          iban: dealerUser.dealerDetails?.bankInfo?.iban || '',
        },
        status: 'active',
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        totalSalesAmount: 0,
        totalReferredUsers: 0,
        createdAt: dealerUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.debug('Dealer fallback lookup notice:', e);
  }

  // Fallback 2: Firestore direct lookup
  try {
    const colRef = collection(db, 'resellers');
    const q = query(colRef, where('referralCode', '==', clean));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = { ...snap.docs[0].data(), uid: snap.docs[0].id } as Reseller;
      if (data) return data;
    }
  } catch (fsErr) {
    console.debug('Firestore direct lookup notice:', fsErr);
  }

  // Fallback 3: Even if unlisted / new dealer referral code in valid format (e.g. AURA-BAYI-1014 or any code from URL), construct a valid active reseller representation so it locks and attributes reliably!
  if (clean.startsWith('AURA-') || clean.startsWith('BAYI-') || clean.length >= 4) {
    const isPsychologyCenter = clean === 'AURA-BAYI-1014' || clean.includes('1014');
    return {
      uid: `BAYI-${clean}`,
      resellerName: isPsychologyCenter ? 'Psikoloji Danışmanlık Merkezi' : `Yetkili Bayi (${clean})`,
      email: '',
      phone: '',
      referralCode: clean,
      commissionRate: 20,
      creditsBalance: 100,
      bankInfo: {
        bankName: '',
        accountHolder: '',
        iban: '',
      },
      status: 'active',
      totalEarnings: 0,
      paidEarnings: 0,
      pendingEarnings: 0,
      totalSalesAmount: 0,
      totalReferredUsers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Find reseller by ID / UID
 */
export async function getResellerById(uid: string): Promise<Reseller | null> {
  const cleanUid = typeof uid === 'string' ? uid.trim() : '';
  if (!cleanUid) return null;

  // Read the canonical reseller document first so refreshes do not depend on local cache timing.
  try {
    const snap = await getDoc(doc(db, 'resellers', cleanUid));
    if (snap.exists()) {
      return { ...snap.data(), uid: snap.id } as Reseller;
    }
  } catch (fsErr) {
    console.debug('Direct reseller profile lookup notice (using cache):', fsErr);
  }

  const all = await getAllResellers();
  const found = all.find(r => r.uid === cleanUid);
  if (found) return found;

  // Fallback: check if member with this uid is a dealer
  try {
    const { getLocalMembersDirectory } = await import('./authManager');
    const members = getLocalMembersDirectory();
    const dealerUser = members.find(m => m.uid === uid && (m.role === 'dealer' || m.dealerStatus === 'approved' || m.dealerDetails));
    if (dealerUser) {
      return {
        uid: dealerUser.uid,
        resellerName: dealerUser.dealerDetails?.companyName || dealerUser.fullName,
        email: dealerUser.email,
        phone: dealerUser.dealerDetails?.whatsapp || dealerUser.phone,
        referralCode: dealerUser.dealerDetails?.referralCode || `AURA-BAYI-${Math.floor(1000 + Math.random() * 9000)}`,
        commissionRate: dealerUser.dealerDetails?.commissionRate || 20,
        creditsBalance: dealerUser.creditsBalance !== undefined ? dealerUser.creditsBalance : 100,
        bankInfo: {
          bankName: dealerUser.dealerDetails?.bankInfo?.bankName || '',
          accountHolder: dealerUser.dealerDetails?.bankInfo?.accountHolder || dealerUser.fullName,
          iban: dealerUser.dealerDetails?.bankInfo?.iban || '',
        },
        status: 'active',
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        totalSalesAmount: 0,
        totalReferredUsers: 0,
        createdAt: dealerUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.debug('Dealer ID fallback lookup notice:', e);
  }

  return null;
}

/**
 * Generate a unique referral code e.g. AURA-BAYI-4819 or AURA-REF-7201 (guaranteed unique system-wide)
 */
export function generateUniqueReferralCode(prefix = 'AURA-BAYI', existingCodes: string[] = []): string {
  const codeSet = new Set(existingCodes.map(c => c.trim().toUpperCase()));
  try {
    const all = getLocalResellers();
    all.forEach(r => {
      if (r.referralCode) codeSet.add(r.referralCode.trim().toUpperCase());
    });
  } catch {
    // ignore
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aurabio_members_directory_v1') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((m: any) => {
          if (m?.referralCode) codeSet.add(m.referralCode.trim().toUpperCase());
          if (m?.dealerDetails?.referralCode) codeSet.add(m.dealerDetails.referralCode.trim().toUpperCase());
          if (m?.referredByCode) codeSet.add(m.referredByCode.trim().toUpperCase());
        });
      }
    }
  } catch {
    // ignore
  }

  for (let i = 0; i < 500; i++) {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-${randNum}`;
    if (!codeSet.has(candidate)) {
      return candidate;
    }
  }

  const randAlpha = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randAlpha}`;
}

/**
 * System-wide Audit & Repair: Guarantees every single dealer and member has a unique, non-colliding referral code.
 * Replaces any duplicate codes (including old shared 'AURA-BAYI-1014') with distinct, dedicated codes.
 */
export async function ensureUniqueReferralCodesForAll(): Promise<{ fixedDealersCount: number; fixedUsersCount: number }> {
  if (typeof window === 'undefined') return { fixedDealersCount: 0, fixedUsersCount: 0 };

  try {
    const localResellers = getLocalResellers();
    const STORAGE_MEMBERS_KEY = 'aurabio_members_directory_v1';
    let localMembers: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_MEMBERS_KEY);
      if (raw) localMembers = JSON.parse(raw) || [];
    } catch {
      localMembers = [];
    }

    const usedCodes = new Map<string, string>(); // upperCaseCode -> ownerUid
    const masterAdminCode = 'AURA-BAYI-AKN01';
    usedCodes.set(masterAdminCode, 'ADMIN-AKN-01');

    let fixedDealersCount = 0;
    let fixedUsersCount = 0;

    const updatedResellers = [...localResellers];
    const updatedMembers = [...localMembers];

    const generateFresh = (prefix: string) => {
      for (let i = 0; i < 1000; i++) {
        const num = Math.floor(1000 + Math.random() * 9000);
        const cand = `${prefix}-${num}`;
        if (!usedCodes.has(cand)) {
          return cand;
        }
      }
      return `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    };

    // 1. Process Resellers
    for (let i = 0; i < updatedResellers.length; i++) {
      const r = updatedResellers[i];
      if (!r || !r.uid) continue;

      const isMasterAdmin = r.uid === 'ADMIN-AKN-01' || r.email?.toLowerCase() === 'psikologabdulkadirkan@gmail.com';
      let code = (r.referralCode || '').trim().toUpperCase();

      if (isMasterAdmin) {
        code = masterAdminCode;
      } else {
        // If code is empty or already claimed by another dealer or is unassigned
        if (!code || (usedCodes.has(code) && usedCodes.get(code) !== r.uid)) {
          code = generateFresh('AURA-BAYI');
          fixedDealersCount++;
        }
      }

      usedCodes.set(code, r.uid);
      updatedResellers[i] = {
        ...r,
        referralCode: code,
      };

      // Sync Firestore
      try {
        const docRef = doc(db, 'resellers', r.uid);
        setDoc(docRef, { referralCode: code, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      } catch {}
    }

    // 2. Process Members & synchronize with Dealers
    for (let i = 0; i < updatedMembers.length; i++) {
      const m = updatedMembers[i];
      if (!m || !m.uid) continue;

      const isMasterAdmin = m.uid === 'ADMIN-AKN-01' || m.email?.toLowerCase() === 'psikologabdulkadirkan@gmail.com';
      const isDealer = m.role === 'dealer' || m.dealerStatus === 'approved' || Boolean(m.dealerDetails);

      if (isMasterAdmin) {
        let code = masterAdminCode;
        usedCodes.set(code, m.uid);
        updatedMembers[i] = {
          ...m,
          role: 'admin',
          isAllowed: true,
          referralCode: code,
          dealerDetails: {
            ...(m.dealerDetails || {
              companyName: 'Psikoloji Danışmanlık & Biyo-Frekans Merkezi (Merkez Bayi)',
              phone: m.phone || '0554 990 07 43',
              whatsapp: m.phone || '0554 990 07 43',
              businessField: 'Psikoloji & Biyo-Rezonans Merkezi'
            }),
            referralCode: code,
          }
        };
        continue;
      }

      if (isDealer) {
        let dealerCode = (m.dealerDetails?.referralCode || m.referralCode || '').trim().toUpperCase();
        if (!dealerCode || dealerCode === masterAdminCode || (usedCodes.has(dealerCode) && usedCodes.get(dealerCode) !== m.uid)) {
          dealerCode = generateFresh('AURA-BAYI');
          fixedDealersCount++;
        }
        usedCodes.set(dealerCode, m.uid);

        updatedMembers[i] = {
          ...m,
          referralCode: dealerCode,
          dealerDetails: {
            ...(m.dealerDetails || {
              companyName: m.fullName,
              phone: m.phone,
              whatsapp: m.phone,
              businessField: 'Biyo-Rezonans & Frekans Kliniği',
            }),
            referralCode: dealerCode,
          }
        };

        // Sync into updatedResellers if missing
        const rIdx = updatedResellers.findIndex(r => r.uid === m.uid);
        if (rIdx >= 0) {
          updatedResellers[rIdx] = {
            ...updatedResellers[rIdx],
            referralCode: dealerCode,
          };
        } else {
          updatedResellers.push({
            uid: m.uid,
            resellerName: m.dealerDetails?.companyName || m.fullName,
            email: m.email,
            phone: m.dealerDetails?.whatsapp || m.phone,
            referralCode: dealerCode,
            commissionRate: m.dealerDetails?.commissionRate || 20,
            creditsBalance: m.creditsBalance !== undefined ? m.creditsBalance : 100,
            dealerPackageId: m.dealerPackageId || 'silver-dealer',
            bankInfo: {
              bankName: m.dealerDetails?.bankInfo?.bankName || '',
              accountHolder: m.dealerDetails?.bankInfo?.accountHolder || m.fullName,
              iban: m.dealerDetails?.bankInfo?.iban || '',
            },
            status: 'active',
            totalEarnings: 0,
            paidEarnings: 0,
            pendingEarnings: 0,
            totalSalesAmount: 0,
            totalReferredUsers: 0,
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // Standard Member
        let memberCode = (m.referralCode || '').trim().toUpperCase();
        if (!memberCode || (usedCodes.has(memberCode) && usedCodes.get(memberCode) !== m.uid)) {
          memberCode = generateFresh('AURA-REF');
          fixedUsersCount++;
        }
        usedCodes.set(memberCode, m.uid);
        updatedMembers[i] = {
          ...m,
          referralCode: memberCode,
        };
      }

      // Sync user in Firestore
      try {
        const userDocRef = doc(db, 'users', m.uid);
        setDoc(userDocRef, {
          referralCode: updatedMembers[i].referralCode,
          dealerDetails: updatedMembers[i].dealerDetails,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch {}
    }

    // Save back to local storage
    saveLocalResellers(updatedResellers);
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updatedMembers));

    // Update active member session if applicable
    try {
      const activeRaw = localStorage.getItem('aurabio_active_session_v1');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active && active.uid) {
          const fresh = updatedMembers.find(m => m.uid === active.uid);
          if (fresh) {
            localStorage.setItem('aurabio_active_session_v1', JSON.stringify(fresh));
            window.dispatchEvent(new CustomEvent('aurabio_session_updated', { detail: fresh }));
          }
        }
      }
    } catch {}

    // Update active reseller session if applicable
    try {
      const activeResRaw = localStorage.getItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY);
      if (activeResRaw) {
        const activeRes = JSON.parse(activeResRaw);
        if (activeRes && activeRes.uid) {
          const freshRes = updatedResellers.find(r => r.uid === activeRes.uid);
          if (freshRes) {
            setActiveResellerSession(freshRes);
          }
        }
      }
    } catch {}

    return { fixedDealersCount, fixedUsersCount };
  } catch (err) {
    console.warn('ensureUniqueReferralCodesForAll notice:', err);
    return { fixedDealersCount: 0, fixedUsersCount: 0 };
  }
}

// Auto-run deduplication audit on module load in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ensureUniqueReferralCodesForAll().catch(() => {});
  }, 1000);
}

/**
 * Guarantee unique, persistent Reseller profile for a given logged-in Dealer user
 */
export async function getOrCreateResellerForUser(user: UserMember): Promise<Reseller> {
  const userUid = typeof user?.uid === 'string' ? user.uid.trim() : '';
  const userEmail = (user.email || '').trim().toLowerCase();
  const fallbackUid = userUid || (userEmail ? `LOCAL-${userEmail.replace(/[^a-z0-9]+/g, '-')}` : '');

  // Hydrate from the local session first so the dashboard does not wait on Firestore.
  const localResellers = getLocalResellers();
  const localFound = localResellers.find(r =>
    (userUid && r.uid === userUid) || (userEmail && r.email && r.email.toLowerCase() === userEmail)
  );
  if (localFound) {
    setActiveResellerSession(localFound);
    return localFound;
  }

  const all = await getAllResellers();
  
  // 1. Try to find existing reseller by UID or Email
  let found = all.find(r => r.uid === userUid || (userEmail && r.email && r.email.toLowerCase() === userEmail));

  if (found) {
    // Ensure referral code is synchronized with dealerDetails if user has one
    if (user.dealerDetails?.referralCode && found.referralCode !== user.dealerDetails.referralCode) {
      found.referralCode = user.dealerDetails.referralCode;
    }
    // Sync credits
    if (user.creditsBalance !== undefined && found.creditsBalance !== user.creditsBalance) {
      found.creditsBalance = user.creditsBalance;
    }
    setActiveResellerSession(found);
    return found;
  }

  // 2. Generate unique referral code for this dealer
  const existingCodes = all.map(r => r.referralCode).filter(Boolean);
  const finalCode = user.dealerDetails?.referralCode?.trim().toUpperCase() 
    || generateUniqueReferralCode('AURA-BAYI', existingCodes);

  const newReseller: Reseller = {
    uid: fallbackUid,
    resellerName: user.dealerDetails?.companyName || user.fullName || 'Yetkili Bayi',
    email: (user.email || '').toLowerCase(),
    phone: user.dealerDetails?.whatsapp || user.phone || '05XX XXX XX XX',
    referralCode: finalCode,
    commissionRate: user.dealerDetails?.commissionRate || 20,
    creditsBalance: user.creditsBalance !== undefined ? user.creditsBalance : 100,
    dealerPackageId: user.dealerPackageId || 'silver-dealer',
    bankInfo: {
      bankName: user.dealerDetails?.bankInfo?.bankName || '',
      accountHolder: user.dealerDetails?.bankInfo?.accountHolder || user.fullName,
      iban: user.dealerDetails?.bankInfo?.iban || '',
    },
    status: 'active',
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    totalSalesAmount: 0,
    totalReferredUsers: 0,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Kullanıcı hesabı üzerinden otomatik oluşturulan bayi profili',
  };

  // Save to local and Firestore
  const updatedList = [newReseller, ...all.filter(r => r.uid !== user.uid)];
  saveLocalResellers(updatedList);
  setActiveResellerSession(newReseller);

  // Update user dealerDetails if code wasn't saved before
  if (!user.dealerDetails?.referralCode) {
    try {
      const { saveToLocalMembersDirectory } = await import('./authManager');
      const updatedUser: UserMember = {
        ...user,
        role: 'dealer',
        dealerStatus: 'approved',
        dealerDetails: {
          ...(user.dealerDetails || {
            companyName: user.fullName,
            phone: user.phone,
            whatsapp: user.phone,
            businessField: 'Biyo-Rezonans',
            taxNumber: 'Belirtilmedi',
            taxOffice: 'Belirtilmedi',
            address: '',
            notes: ''
          }),
          referralCode: finalCode,
          creditsBalance: newReseller.creditsBalance
        }
      };
      saveToLocalMembersDirectory(updatedUser);
      localStorage.setItem('aurabio_active_session_v1', JSON.stringify(updatedUser));
      
      if (userUid) {
        const userDocRef = doc(db, 'users', userUid);
        await setDoc(userDocRef, { dealerDetails: updatedUser.dealerDetails, role: 'dealer', dealerStatus: 'approved' }, { merge: true });
      }
    } catch (err) {
      console.debug('User dealerDetails sync notice:', err);
    }
  }

  try {
    if (!userUid) {
      console.debug('Firestore create reseller skipped: authenticated user UID is unavailable.');
      return newReseller;
    }
    const docRef = doc(db, 'resellers', userUid);
    await setDoc(docRef, newReseller, { merge: true });
  } catch (fsErr) {
    console.warn('Firestore create reseller notice:', fsErr);
  }

  return newReseller;
}

/**
 * Get all registered members/clients referred by a specific reseller
 */
export async function getReferredUsersForReseller(
  resellerId: string, 
  referralCode?: string
): Promise<UserMember[]> {
  const result: UserMember[] = [];
  const seenUids = new Set<string>();

  try {
    const { getLocalMembersDirectory } = await import('./authManager');
    const allMembers = getLocalMembersDirectory();

    const cleanCode = (referralCode || '').trim().toUpperCase();

    // 1. Check local members
    allMembers.forEach(m => {
      if (m.uid === resellerId) return; // exclude the dealer themselves
      const matchByResellerId = m.resellerId && m.resellerId === resellerId;
      const matchByCode = cleanCode && m.referredByCode && m.referredByCode.toUpperCase() === cleanCode;
      
      if (matchByResellerId || matchByCode) {
        if (!seenUids.has(m.uid)) {
          seenUids.add(m.uid);
          result.push(m);
        }
      }
    });

    // 2. Query Firestore users collection
    try {
      const usersCol = collection(db, 'users');
      const q1 = query(usersCol, where('resellerId', '==', resellerId));
      const snap1 = await getDocs(q1);
      snap1.forEach(docSnap => {
        const u = docSnap.data() as UserMember;
        if (u.uid && u.uid !== resellerId && !seenUids.has(u.uid)) {
          seenUids.add(u.uid);
          result.push(u);
        }
      });

      if (cleanCode) {
        const q2 = query(usersCol, where('referredByCode', '==', cleanCode));
        const snap2 = await getDocs(q2);
        snap2.forEach(docSnap => {
          const u = docSnap.data() as UserMember;
          if (u.uid && u.uid !== resellerId && !seenUids.has(u.uid)) {
            seenUids.add(u.uid);
            result.push(u);
          }
        });
      }
    } catch (fsErr) {
      console.debug('Firestore get referred users notice:', fsErr);
    }
  } catch (err) {
    console.error('Error fetching referred users:', err);
  }

  return result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Record a new user referral directly to the reseller's metrics
 */
export async function recordNewUserReferral(
  resellerId?: string,
  referralCode?: string,
  newUser?: UserMember
): Promise<void> {
  try {
    let targetReseller: Reseller | null = null;
    if (resellerId) {
      targetReseller = await getResellerById(resellerId);
    }
    if (!targetReseller && referralCode) {
      targetReseller = await getResellerByCode(referralCode);
    }

    if (!targetReseller) return;

    targetReseller.totalReferredUsers = (targetReseller.totalReferredUsers || 0) + 1;
    targetReseller.updatedAt = new Date().toISOString();

    const allResellers = getLocalResellers();
    const rIdx = allResellers.findIndex(r => r.uid === targetReseller!.uid);
    if (rIdx >= 0) {
      allResellers[rIdx] = targetReseller;
      saveLocalResellers(allResellers);
    }

    try {
      const docRef = doc(db, 'resellers', targetReseller.uid);
      await setDoc(docRef, { totalReferredUsers: targetReseller.totalReferredUsers, updatedAt: targetReseller.updatedAt }, { merge: true });
    } catch (fsErr) {
      console.debug('Firestore record user referral notice:', fsErr);
    }
  } catch (err) {
    console.debug('Record new user referral notice:', err);
  }
}

/**
 * Register / Create a new Reseller
 */
export async function registerNewReseller(data: {
  resellerName: string;
  email: string;
  phone: string;
  customReferralCode?: string;
  commissionRate?: number;
  bankInfo?: Partial<BankInfo>;
  notes?: string;
}): Promise<{ success: boolean; message: string; reseller?: Reseller }> {
  try {
    const cleanName = data.resellerName.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return { success: false, message: 'Lütfen Bayi Adı, E-posta ve Telefon alanlarını eksiksiz doldurunuz.' };
    }

    const all = await getAllResellers();

    // Check duplicate email
    if (all.some(r => r.email && r.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Bu e-posta adresi ile zaten kayıtlı bir bayi bulunmaktadır.' };
    }

    // Referral code determination
    let finalCode = (data.customReferralCode || '').trim().toUpperCase();
    if (!finalCode) {
      finalCode = generateUniqueReferralCode();
    } else {
      if (!finalCode.startsWith('AURA-') && !finalCode.startsWith('BAYI-')) {
        finalCode = `AURA-${finalCode}`;
      }
    }

    // Check duplicate code
    if (all.some(r => r.referralCode && r.referralCode.toUpperCase() === finalCode)) {
      finalCode = generateUniqueReferralCode();
    }

    const uid = 'RESELLER-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newReseller: Reseller = {
      uid,
      resellerName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      referralCode: finalCode,
      commissionRate: data.commissionRate !== undefined ? data.commissionRate : 20, // default 20%
      bankInfo: {
        bankName: data.bankInfo?.bankName || '',
        accountHolder: data.bankInfo?.accountHolder || cleanName,
        iban: data.bankInfo?.iban || '',
      },
      status: 'active',
      totalEarnings: 0,
      paidEarnings: 0,
      pendingEarnings: 0,
      totalSalesAmount: 0,
      totalReferredUsers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes || 'Sistem üzerinden yeni bayi başvurusu',
    };

    // Save locally
    const updatedList = [newReseller, ...all];
    saveLocalResellers(updatedList);
    setActiveResellerSession(newReseller);

    // Save to Firestore
    try {
      const docRef = doc(db, 'resellers', uid);
      await setDoc(docRef, newReseller);
    } catch (fsErr) {
      console.warn('Firestore reseller save notice:', fsErr);
    }

    return {
      success: true,
      message: `Bayilik kaydınız başarıyla oluşturuldu! Özel Davet Kodunuz: ${finalCode}`,
      reseller: newReseller
    };
  } catch (err: any) {
    console.error('Register reseller error:', err);
    return { success: false, message: err?.message || 'Bayi kaydı sırasında bir hata oluştu.' };
  }
}

/**
 * Update Reseller Bank Information (IBAN, Bank Name, Account Holder)
 */
export async function updateResellerBankInfo(
  resellerId: string,
  bankInfo: BankInfo
): Promise<{ success: boolean; message: string; reseller?: Reseller }> {
  try {
    const all = await getAllResellers();
    const idx = all.findIndex(r => r.uid === resellerId);
    if (idx === -1) {
      return { success: false, message: 'Bayi kaydı bulunamadı.' };
    }

    const updatedReseller: Reseller = {
      ...all[idx],
      bankInfo: {
        bankName: (bankInfo.bankName || '').trim(),
        accountHolder: (bankInfo.accountHolder || '').trim(),
        iban: (bankInfo.iban || '').trim(),
      },
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updatedReseller;
    saveLocalResellers(all);

    const activeSession = getActiveResellerSession();
    if (activeSession && activeSession.uid === resellerId) {
      setActiveResellerSession(updatedReseller);
    }

    // Save to Firestore
    try {
      const docRef = doc(db, 'resellers', resellerId);
      await setDoc(docRef, { bankInfo: updatedReseller.bankInfo, updatedAt: updatedReseller.updatedAt }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore update bank info notice:', fsErr);
    }

    return {
      success: true,
      message: 'Banka ve IBAN hesap bilgileriniz başarıyla güncellendi.',
      reseller: updatedReseller
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Banka bilgileri güncellenirken hata oluştu.' };
  }
}

/**
 * Admin: Save or update full reseller settings (Commission rate, status, etc.)
 */
export async function adminSaveReseller(reseller: Reseller): Promise<boolean> {
  try {
    const resellerUid = typeof reseller?.uid === 'string' ? reseller.uid.trim() : '';
    if (!resellerUid) {
      console.warn('Admin save reseller skipped: reseller UID is unavailable.');
      return false;
    }
    const all = await getAllResellers();
    const idx = all.findIndex(r => r.uid === reseller.uid);
    let updatedList: Reseller[];

    const dataToSave: Reseller = {
      ...reseller,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      updatedList = [...all];
      updatedList[idx] = dataToSave;
    } else {
      updatedList = [dataToSave, ...all];
    }

    saveLocalResellers(updatedList);

    try {
      const docRef = doc(db, 'resellers', resellerUid);
      await setDoc(docRef, dataToSave, { merge: true });
    } catch (fsErr) {
      console.warn('Admin save reseller Firestore notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Admin save reseller error:', err);
    return false;
  }
}

/**
 * Admin: Delete Reseller
 */
export async function adminDeleteReseller(resellerId: string): Promise<boolean> {
  try {
    const all = await getAllResellers();
    const updated = all.filter(r => r.uid !== resellerId);
    saveLocalResellers(updated);

    try {
      const docRef = doc(db, 'resellers', resellerId);
      await deleteDoc(docRef);
    } catch (fsErr) {
      console.warn('Admin delete reseller Firestore notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Admin delete reseller error:', err);
    return false;
  }
}

/**
 * Generate Shareable Referral Link URL
 */
export function generateReferralLink(referralCode: string): string {
  if (typeof window === 'undefined') {
    return `https://akngroupfrekans.web.app/?ref=${encodeURIComponent(referralCode)}`;
  }
  const origin = window.location.origin;
  return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * 1. Generate Business Presentation Link
 * Opens the interactive presentation catalog with this dealer's code locked
 */
export function generateBusinessPresentationLink(referralCode: string): string {
  if (typeof window === 'undefined') {
    return `https://akngroupfrekans.web.app/?view=presentation&ref=${encodeURIComponent(referralCode)}`;
  }
  const origin = window.location.origin;
  return `${origin}/?view=presentation&ref=${encodeURIComponent(referralCode)}`;
}

/**
 * 2. Generate Technical Report & Scientific Documentation Link
 * Opens the technical biophysical whitepaper and specification report
 */
export function generateTechnicalReportLink(referralCode: string): string {
  if (typeof window === 'undefined') {
    return `https://akngroupfrekans.web.app/?view=technical&ref=${encodeURIComponent(referralCode)}`;
  }
  const origin = window.location.origin;
  return `${origin}/?view=technical&ref=${encodeURIComponent(referralCode)}`;
}

/**
 * 3. Generate Direct Registration Link with Locked Dealer
 * Opens AuthModal directly in registration mode with dealer locked
 */
export function generateRegisterLink(referralCode: string): string {
  if (typeof window === 'undefined') {
    return `https://akngroupfrekans.web.app/?view=register&ref=${encodeURIComponent(referralCode)}`;
  }
  const origin = window.location.origin;
  return `${origin}/?view=register&ref=${encodeURIComponent(referralCode)}`;
}

/**
 * 4. Generate Digital Business Card & QR Code Page Link
 * Opens the personalized digital business card for this dealer
 */
export function generateBusinessCardLink(referralCode: string): string {
  if (typeof window === 'undefined') {
    return `https://akngroupfrekans.web.app/?view=card&ref=${encodeURIComponent(referralCode)}`;
  }
  const origin = window.location.origin;
  return `${origin}/?view=card&ref=${encodeURIComponent(referralCode)}`;
}

/**
 * Generate Comprehensive Bulk Share Text containing all marketing links
 */
export function generateBulkMarketingMessage(
  referralCode: string, 
  resellerName = 'AuraBio Yetkili Bayisi',
  phone = ''
): string {
  const cardLink = generateBusinessCardLink(referralCode);
  const regLink = generateRegisterLink(referralCode);
  const presLink = generateBusinessPresentationLink(referralCode);
  const techLink = generateTechnicalReportLink(referralCode);

  return `🌟 *AuraBio Frekans & Biyo-Rezonans Teknolojileri*
━━━━━━━━━━━━━━━━━━━━
🏢 *Yetkili Bayi / Temsilci:* ${resellerName}
🔑 *Özel Bayi Referans Kodu:* ${referralCode}${phone ? `\n📞 *İletişim / WhatsApp:* ${phone}` : ''}
━━━━━━━━━━━━━━━━━━━━

Aşağıdaki resmi bağlantılar üzerinden canlı frekans sistemini inceleyebilir, demo başlatabilir veya bayiliğimize doğrudan kayıt olabilirsiniz:

🪪 *Dijital Kartvizitim & Karekodum:*
🔗 ${cardLink}

📝 *Doğrudan Üye & Bayi Kayıt Ekranı:*
🔗 ${regLink}

📊 *İş & Ürün Sunum Raporu (Katalog):*
🔗 ${presLink}

🔬 *Teknik Rapor & Frekans Dökümantasyonu:*
🔗 ${techLink}

✨ *30 Dakikalık Ücretsiz Canlı Demoyu Hemen Deneyimleyin!*`;
}

/**
 * Generate WhatsApp Ready Share Link for generic or custom text
 */
export function generateWhatsAppShareUrl(referralCode: string, resellerName = 'AuraBio Bayisi'): string {
  const link = generateReferralLink(referralCode);
  const text = encodeURIComponent(
    `🌟 Merhaba! AuraBio Frekans, Canlı Aura Spektrometresi ve Biyo-Rezonans sistemini benim özel referans bağlantımla hemen deneyimleyin:\n\n🔗 Bağlantı: ${link}\n\n🎁 Özel Davet Kodum: ${referralCode}\n\nSisteme kayıt olarak 30 dakikalık canlı demo veya avantajlı frekans paketlerinden hemen yararlanabilirsiniz.`
  );
  return `https://wa.me/?text=${text}`;
}

/**
 * Generate WhatsApp URL with pre-encoded message
 */
export function generateWhatsAppUrlForMessage(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate Telegram Ready Share Link
 */
export function generateTelegramShareUrl(referralCode: string): string {
  const link = generateReferralLink(referralCode);
  const text = encodeURIComponent(`AuraBio Frekans ve Biyo-Rezonans Sistemi Özel Davet Bağlantısı (${referralCode})`);
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
}

/**
 * Generate Telegram URL with pre-encoded message
 */
export function generateTelegramUrlForMessage(message: string, url?: string): string {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.origin : '');
  return `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(message)}`;
}

/**
 * Record a Commission when an order is completed by a member
 */
export async function recordCommissionForOrder(
  order: MemberOrder,
  user: UserMember
): Promise<CommissionTransaction | null> {
  try {
    if (!order || order.amount <= 0 || order.paymentStatus === 'DEMO') {
      return null;
    }

    // Determine resellerId from user document or stored referral code
    let targetReseller: Reseller | null = null;
    if (user.resellerId) {
      targetReseller = await getResellerById(user.resellerId);
    }
    if (!targetReseller && user.referredByCode) {
      targetReseller = await getResellerByCode(user.referredByCode);
    }
    if (!targetReseller) {
      const cachedCode = getStoredReferralCode();
      if (cachedCode) {
        targetReseller = await getResellerByCode(cachedCode);
      }
    }

    // If no reseller found, do not record any fictitious commission
    if (!targetReseller) {
      return null;
    }

    const rate = targetReseller.commissionRate || 20;
    const commissionAmount = Math.round((order.amount * rate) / 100);

    const transactionId = `COMM-${Math.floor(10000 + Math.random() * 90000)}`;
    const maskedUser = maskUserId(user.uid);

    const newCommission: CommissionTransaction = {
      transactionId,
      resellerId: targetReseller.uid,
      userId: maskedUser, // Masked for privacy
      orderId: order.id,
      packageName: order.packageName || 'AuraBio Lisans Paketi',
      amount: order.amount,
      commissionRate: rate,
      commissionAmount,
      status: order.paymentStatus === 'PAID' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      notes: `${order.userName ? 'Üye' : 'Kullanıcı'} siparişi üzerinden %${rate} komisyon`,
    };

    // Save commission
    const allComms = getLocalCommissions();
    saveLocalCommissions([newCommission, ...allComms]);

    // Update reseller balance & stats
    targetReseller.totalSalesAmount = (targetReseller.totalSalesAmount || 0) + order.amount;
    targetReseller.totalEarnings = (targetReseller.totalEarnings || 0) + commissionAmount;
    if (newCommission.status === 'approved') {
      targetReseller.pendingEarnings = (targetReseller.pendingEarnings || 0) + commissionAmount;
    }
    targetReseller.totalReferredUsers = (targetReseller.totalReferredUsers || 0) + 1;
    targetReseller.updatedAt = new Date().toISOString();

    const allResellers = getLocalResellers();
    const rIdx = allResellers.findIndex(r => r.uid === targetReseller!.uid);
    if (rIdx >= 0) {
      allResellers[rIdx] = targetReseller;
      saveLocalResellers(allResellers);
    }

    // Save to Firestore
    try {
      const commDoc = doc(db, 'commissions', transactionId);
      await setDoc(commDoc, newCommission);

      const resDoc = doc(db, 'resellers', targetReseller.uid);
      await setDoc(resDoc, targetReseller, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore commission record notice:', fsErr);
    }

    return newCommission;
  } catch (err) {
    console.error('Record commission error:', err);
    return null;
  }
}

/**
 * Get commissions for a specific reseller (with strict user privacy)
 */
export async function getCommissionsForReseller(resellerId: string): Promise<CommissionTransaction[]> {
  const localList = getLocalCommissions().filter(c => c.resellerId === resellerId);

  try {
    const colRef = collection(db, 'commissions');
    const q = query(colRef, where('resellerId', '==', resellerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const map = new Map<string, CommissionTransaction>();
      snap.forEach(d => {
        const item = d.data() as CommissionTransaction;
        if (item.transactionId) map.set(item.transactionId, item);
      });
      localList.forEach(c => map.set(c.transactionId, c));
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  } catch (err) {
    console.debug('Firestore get commissions notice:', err);
  }

  return localList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Admin: Get all commissions across all resellers
 */
export async function getAllCommissionsAdmin(): Promise<CommissionTransaction[]> {
  const map = new Map<string, CommissionTransaction>();
  getLocalCommissions().forEach(c => map.set(c.transactionId, c));

  try {
    const colRef = collection(db, 'commissions');
    const snap = await getDocs(colRef);
    snap.forEach(d => {
      const item = d.data() as CommissionTransaction;
      if (item.transactionId) map.set(item.transactionId, item);
    });
  } catch (err) {
    console.debug('Admin get all commissions notice:', err);
  }

  const list = Array.from(map.values());
  saveLocalCommissions(list);
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Admin: Update commission status (e.g. approve, mark as paid, reject)
 */
export async function adminUpdateCommissionStatus(
  transactionId: string,
  newStatus: 'pending' | 'approved' | 'paid' | 'rejected',
  notes?: string
): Promise<boolean> {
  try {
    const all = await getAllCommissionsAdmin();
    const idx = all.findIndex(c => c.transactionId === transactionId);
    if (idx === -1) return false;

    const comm = all[idx];
    const prevStatus = comm.status;
    comm.status = newStatus;
    if (notes) comm.notes = notes;
    if (newStatus === 'paid') {
      comm.paidAt = new Date().toISOString();
    }

    all[idx] = comm;
    saveLocalCommissions(all);

    // Update reseller balances
    const reseller = await getResellerById(comm.resellerId);
    if (reseller) {
      if (newStatus === 'paid' && prevStatus !== 'paid') {
        reseller.paidEarnings = (reseller.paidEarnings || 0) + comm.commissionAmount;
        reseller.pendingEarnings = Math.max(0, (reseller.pendingEarnings || 0) - comm.commissionAmount);
      } else if (newStatus === 'approved' && prevStatus === 'pending') {
        reseller.pendingEarnings = (reseller.pendingEarnings || 0) + comm.commissionAmount;
      } else if (newStatus === 'rejected' && prevStatus === 'approved') {
        reseller.pendingEarnings = Math.max(0, (reseller.pendingEarnings || 0) - comm.commissionAmount);
      }
      await adminSaveReseller(reseller);
    }

    try {
      const docRef = doc(db, 'commissions', transactionId);
      await setDoc(docRef, comm, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore update commission status notice:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Update commission status error:', err);
    return false;
  }
}

/**
 * Active Reseller Session helpers
 */
export function getActiveResellerSession(): Reseller | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY);
    if (!raw) return null;
    const res = JSON.parse(raw) as Partial<Reseller>;
    const uid = typeof res.uid === 'string' ? res.uid.trim() : '';
    const email = typeof res.email === 'string' ? res.email.trim().toLowerCase() : '';
    if (!uid && !email) {
      localStorage.removeItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY);
      return null;
    }

    // Keep valid sessions across reloads; legacy IDs are allowed until the canonical
    // Firestore profile has been hydrated instead of forcing an automatic logout.
    const normalized = { ...res, uid: uid || `LOCAL-${email.replace(/[^a-z0-9]+/g, '-')}`, email } as Reseller;
    localStorage.setItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function setActiveResellerSession(reseller: Reseller | null): void {
  if (typeof window === 'undefined') return;
  try {
    const prevRaw = localStorage.getItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY);
    const nextRaw = reseller ? JSON.stringify(reseller) : null;
    
    // Skip redundant updates to prevent infinite event loops
    if (prevRaw === nextRaw) {
      return;
    }

    if (!reseller) {
      localStorage.removeItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_ACTIVE_RESELLER_SESSION_KEY, nextRaw!);
    }

    // Safely dispatch asynchronously so listener exceptions don't throw uncaught errors
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent('aurabio_reseller_session_updated', { detail: reseller }));
      } catch (evtErr) {
        console.debug('aurabio_reseller_session_updated event dispatch notice:', evtErr);
      }
    }, 0);
  } catch (err) {
    console.debug('setActiveResellerSession notice:', err);
  }
}

/**
 * Login as Reseller via Referral Code or Email
 */
export async function loginAsReseller(credential: string): Promise<{ success: boolean; message: string; reseller?: Reseller }> {
  try {
    const clean = credential.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Lütfen Bayi Kodunuzu veya E-posta adresinizi giriniz.' };
    }

    const all = await getAllResellers();
    const cleanLower = credential.trim().toLowerCase();
    const found = all.find(r => 
      (r.referralCode && r.referralCode.toUpperCase() === clean) || 
      (r.email && r.email.toLowerCase() === cleanLower)
    );

    if (!found) {
      return { success: false, message: 'Girilen kod veya e-posta ile eşleşen bir bayi bulunamadı.' };
    }

    if (found.status === 'suspended') {
      return { success: false, message: 'Bu bayi hesabı yönetici tarafından askıya alınmıştır. Lütfen destek ile iletişime geçin.' };
    }

    setActiveResellerSession(found);
    return { success: true, message: `Hoş geldiniz, ${found.resellerName}!`, reseller: found };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Giriş yapılamadı.' };
  }
}

/**
 * Real-time Subscription to Reseller's Profile and Statistics
 */
export function subscribeToReseller(
  resellerId: string,
  onUpdate: (reseller: Reseller | null) => void
): Unsubscribe {
  const loadAndEmit = async () => {
    const r = await getResellerById(resellerId);
    onUpdate(r);
  };

  loadAndEmit();

  const handleLocal = () => loadAndEmit();
  window.addEventListener('aurabio_resellers_updated', handleLocal);

  try {
    const docRef = doc(db, 'resellers', resellerId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = { ...snap.data(), uid: snap.id } as Reseller;
        setActiveResellerSession(data);
        onUpdate(data);
      }
    });

    return () => {
      window.removeEventListener('aurabio_resellers_updated', handleLocal);
      unsub();
    };
  } catch {
    return () => {
      window.removeEventListener('aurabio_resellers_updated', handleLocal);
    };
  }
}
