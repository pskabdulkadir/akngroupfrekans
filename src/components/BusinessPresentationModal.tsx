import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileText, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Briefcase, 
  Users, 
  Smartphone, 
  ExternalLink, 
  Activity, 
  Zap, 
  Award, 
  ArrowRight, 
  DollarSign, 
  Compass, 
  Brain, 
  Layers, 
  QrCode, 
  Calculator, 
  BookOpen, 
  ChevronRight, 
  Building2,
  Percent,
  Send,
  HelpCircle,
  Lock
} from 'lucide-react';
import { UserMember, BANK_INFO, ADMIN_PHONE } from '../utils/authManager';
import { 
  Reseller, 
  DealerPackage, 
  getDealerPackages, 
  getActiveResellerSession, 
  generateReferralLink, 
  generateWhatsAppShareUrl, 
  generateTelegramShareUrl, 
  getStoredReferralCode,
  setStoredReferralCode,
  getResellerByCode,
  detectAndSaveReferralCodeFromUrl
} from '../utils/resellerManager';
import { downloadTechnicalReportWord, downloadTechnicalReportPDF } from '../utils/technicalReportExport';

interface BusinessPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserMember | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'dealer') => void;
  onOpenResellerModal?: (tab?: 'overview' | 'packages' | 'share') => void;
}

export const BusinessPresentationModal: React.FC<BusinessPresentationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  onOpenResellerModal,
}) => {
  const [activeSection, setActiveSection] = useState<'what_it_is' | 'earnings' | 'how_to_use' | 'simulator' | 'packages' | 'share'>('what_it_is');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeReseller, setActiveReseller] = useState<Reseller | null>(() => getActiveResellerSession());
  const [referredDealerInfo, setReferredDealerInfo] = useState<Reseller | null>(null);
  const [dealerPackages, setDealerPackages] = useState<DealerPackage[]>(() => getDealerPackages());

  // Interactive Earnings Calculator State
  const [calcClientsPerMonth, setCalcClientsPerMonth] = useState<number>(30);
  const [calcPricePerSession, setCalcPricePerSession] = useState<number>(1500);
  const [calcReferredMembers, setCalcReferredMembers] = useState<number>(5);
  const [calcAvgPackagePrice, setCalcAvgPackagePrice] = useState<number>(10000);
  const [calcCommissionRate, setCalcCommissionRate] = useState<number>(20);

  // Active Referral Code Determination
  const activeReferralCode = activeReseller?.referralCode 
    || currentUser?.dealerDetails?.referralCode 
    || currentUser?.referredByCode 
    || detectAndSaveReferralCodeFromUrl()
    || getStoredReferralCode() 
    || '';

  const isUserDealer = currentUser?.role === 'dealer' || currentUser?.dealerStatus === 'approved' || Boolean(activeReseller);

  useEffect(() => {
    if (!isOpen) return;
    const res = getActiveResellerSession();
    if (res) {
      setActiveReseller(res);
      setReferredDealerInfo(res);
    }
    setDealerPackages(getDealerPackages());

    // Resolve referring dealer from URL / storage if not active reseller
    const resolveDealer = async () => {
      const code = activeReferralCode || detectAndSaveReferralCodeFromUrl() || getStoredReferralCode();
      if (code) {
        setStoredReferralCode(code);
        const match = await getResellerByCode(code);
        if (match) {
          setReferredDealerInfo(match);
        }
      }
    };
    resolveDealer();
  }, [isOpen, currentUser, activeReferralCode]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://akngroupfrekans.web.app';
  const fullShareUrl = `${currentOrigin}/?ref=${encodeURIComponent(activeReferralCode)}&view=presentation`;
  const registerShareUrl = `${currentOrigin}/?ref=${encodeURIComponent(activeReferralCode)}#register`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // WhatsApp Share Message
  const waShareText = encodeURIComponent(
    `🌟 AuraBio Kuantum Biyo-Rezonans & Frekans Teknolojisi - Dijital İş Sunum Raporu\n\n` +
    `İnsan enerji alanlarının optik spektrum ile taranması, 7 çakra ve 5 letaif frekans dengelemesi sunan yeni nesil holistik sağlık & bayilik ekosistemi.\n\n` +
    `📊 Dijital Kataloğu & İş Sunumunu İnceleyin:\n${fullShareUrl}\n\n` +
    `🎁 Özel Referans Kodu: ${activeReferralCode}\n\n` +
    `Hemen kayıt olarak kuantum frekans protokollerine ve bayilik avantajlarına anında erişin.`
  );
  const waShareLink = `https://wa.me/?text=${waShareText}`;

  // Telegram Share Link
  const tgShareLink = `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent('AuraBio Frekans Dijital İş Sunumu & Bayilik Raporu')}`;

  // Earnings calculations
  const unitSessionCost = 145; // average cost from silver package
  const monthlySessionRevenue = calcClientsPerMonth * calcPricePerSession;
  const monthlySessionCost = calcClientsPerMonth * unitSessionCost;
  const monthlySessionProfit = monthlySessionRevenue - monthlySessionCost;
  const monthlyReferralCommission = (calcReferredMembers * calcAvgPackagePrice * calcCommissionRate) / 100;
  const totalMonthlyEarnings = monthlySessionProfit + monthlyReferralCommission;
  const yearlyProjectedEarnings = totalMonthlyEarnings * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/70 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 tracking-wider">
                  AuraBio Frekans
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/40">
                  Resmi İş Sunumu & Dijital Katalog
                </span>
                {activeReferralCode && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    Ref: {activeReferralCode}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 mt-0.5">
                Kuantum Biyo-Rezonans & Dijital Gelir Ortaklığı Sunumu
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="Sunum Linkini Kopyala"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800/90 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveSection('what_it_is')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'what_it_is'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>1. Ne İşe Yarar?</span>
          </button>

          <button
            onClick={() => setActiveSection('earnings')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'earnings'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>2. Ne Kazandırır? (Gelir Modeli)</span>
          </button>

          <button
            onClick={() => setActiveSection('how_to_use')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'how_to_use'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>3. Nasıl Kullanılır? (Adım Adım)</span>
          </button>

          <button
            onClick={() => setActiveSection('simulator')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'simulator'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>4. Gelir Simülatörü</span>
          </button>

          <button
            onClick={() => setActiveSection('packages')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'packages'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Coins className="w-4 h-4 text-purple-400" />
            <span>5. Bayi Paketleri</span>
          </button>

          <button
            onClick={() => setActiveSection('share')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'share'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>6. Özel Referanslı Paylaş</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">

          {/* SİZİ DAVET EDEN YETKİLİ BAYİ KARTI (REFERRAL SHOWCASE BANNER) */}
          {referredDealerInfo && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-indigo-950/90 border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/40 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                      Sizi Davet Eden Yetkili Bayimiz
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                      Ref: {referredDealerInfo.referralCode}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2 mt-0.5">
                    <span>{referredDealerInfo.resellerName}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Yetkili AKN Bayisi ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Bu sunum üzerinden açacağınız üyelik veya bayi kaydı doğrudan bu bayiye bağlanacaktır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {referredDealerInfo.phone && (
                  <a
                    href={`https://wa.me/${referredDealerInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Merhaba ${referredDealerInfo.resellerName}, paylaştığınız AuraBio Frekans İş Sunumunu ve Kataloğunu inceliyorum. Sistem ve seanslar hakkında bilgi alabilir miyim?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Bayiye Danış</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setStoredReferralCode(referredDealerInfo.referralCode);
                    onClose();
                    if (onOpenAuthModal) onOpenAuthModal('register');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bu Bayiyle Kaydol</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 1: NE İŞE YARAR? (BİYOREZONANS VE FREKANS TEKNOLOJİSİ) */}
          {activeSection === 'what_it_is' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Hero Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Kuantum Biyo-Rezonans & Canlı Spektrometre Mimarisi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  İnsan Enerji Alanlarını Tarayan, Teşhis Eden ve Dengeleyen Bütüncül Frekans Ekosistemi
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  AuraBio Frekans; optik sensörler, ses frekans analizörleri ve biyometrik nabız sensörleriyle insan bedeninin biyolojik ve enerjetik rezonansını canlı olarak ölçer. 302+ kadim şifa frekansı, 99 Esma-ül Hüsna, kutsal geometri mandalaları ve çakra akort osilatörleri ile zihinsel, ruhsal ve fiziksel zindelik sağlar.
                </p>
              </div>

              {/* 4 Key Pillar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span>1. Canlı Optik Aura & Çakra Taraması</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kamera üzerinden foton ve elektromanyetik renk tayfı analiziyle 7 ana çakra (Kök, Sakral, Solar, Kalp, Boğaz, Alın, Tepe) ve 5 kalp letaifinin enerjetik blokajlarını anlık olarak haritalandırır.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-teal-500/40 transition-all">
                  <div className="flex items-center gap-2.5 text-teal-300 font-bold text-sm">
                    <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/40">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>2. 302+ Kadim Şifa & Biyo-Akustik Rezonans</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sufi makamları, Ayurveda dosha dengeleri, Geleneksel Çin Tıbbı meridyenleri, Solfejyo frekansları (432Hz, 528Hz DNA onarımı, 852Hz sezgi) ve Şifa Ayetleri doğrudan ses dalgaları halinde iletilir.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center gap-2.5 text-indigo-300 font-bold text-sm">
                    <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span>3. Biyo-Ritim & Circadian Senkronizasyon</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    24 saatlik biyolojik organ saati, kortizol/melatonin hormon ritimleri ve güneşin açısal konumuna göre organların en aktif olduğu saatlerde özel frekans yüklemesi gerçekleştirilir.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>4. Kapsamlı Öncesi/Sonrası Raporlama</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Seans öncesi ve seans sonrası çakra uyum oranları, aura hacmi ve organ frekans değişimleri grafiksel olarak karşılaştırılır; tek tıkla resmi PDF ve Word raporu olarak danışana sunulur.
                  </p>
                </div>

              </div>

              {/* Action Funnel */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Sistemi Canlı Olarak Deneyimleyin</h4>
                  <p className="text-xs text-slate-400">Üyelik veya bayilik hesabınızı oluşturarak hemen tarama ve frekans protokollerini başlatabilirsiniz.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAuthModal) onOpenAuthModal('register');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Hemen Kaydol / Sisteme Giriş</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveSection('earnings')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Gelir Modelini Gör
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 2: NE KAZANDIRIR? (GELİR MODELİ & İŞ FIRSATI) */}
          {activeSection === 'earnings' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-orange-950/50 border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>Kazan-Kazan İş Ortaklığı ve Gelir Mimarisi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Terapistlere, Kliniklere ve Girişimcilere Yüksek Marjlı Seans & Komisyon Geliri
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  AuraBio Frekans sistemi hem bireysel kullanıcılara sağlıklı ve zinde bir yaşam sunar, hem de bayilerine 3 farklı koldan yüksek kazançlı, sürdürülebilir bir gelir modeli sağlar.
                </p>
              </div>

              {/* 3 Revenue Streams */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-100">1. Danışan Seans Başı Yüksek Kar</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gümüş veya Altın pakette seans maliyetiniz <strong>116 ₺ - 145 ₺</strong> iken, danışanlarınıza uygulayacağınız Aura & Frekans seanslarını piyasa ortalaması olan <strong>1.500 ₺ - 3.500 ₺</strong> arasında ücretlendirerek %1000'e varan brüt kar elde edersiniz.
                  </p>
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                    Örn: 30 Seans x 1.500 ₺ = 45.000 ₺ Ciro
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <Percent className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-100">2. %20 - %30 Referans Komisyonu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kendi özel referans linkinizle (<span className="font-mono text-emerald-300">?ref=KODUNUZ</span>) sisteme kaydolan üyelerin satın aldığı 1 Aylık, 3 Aylık, 1 Yıllık lisans paketlerinden <strong>anında %20 nakit komisyon</strong> kazanırsınız.
                  </p>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                    Örn: 50.000 ₺ Yıllık Paket Satışı = 10.000 ₺ Net Komisyon
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-100">3. Kredi Havuzu ile Esnek Büyüme</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Süre sınırı olmayan kredi havuzu sistemiyle seans haklarınız asla yanmaz. İhtiyaç duyduğunuzda tek tuşla bayi paketi yükleyerek kredi havuzunuzu anında büyütebilirsiniz.
                  </p>
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] font-bold text-indigo-300">
                    Süre sınırı yok • Kullanıldıkça düşer
                  </div>
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Kazancınızı İnteraktif Olarak Hesaplayın</h4>
                  <p className="text-xs text-slate-400">Danışan sayınız ve seans ücretinize göre aylık tahmini net gelirinizi simüle edin.</p>
                </div>
                <button
                  onClick={() => setActiveSection('simulator')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Kazanç Simülatörünü Aç</span>
                </button>
              </div>

            </div>
          )}

          {/* SECTION 3: NASIL KULLANILIR? (ADIM ADIM REHBER) */}
          {activeSection === 'how_to_use' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950/70 via-slate-900 to-slate-950 border border-teal-500/40 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Uygulama ve Seans Yol Haritası</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Kayıttan Danışan Raporlamasına 5 Kolay Adım
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  AuraBio Frekans sistemini kullanmak ve danışanlarınıza profesyonel seans sunmak son derece yalın ve otomatizedir.
                </p>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-3.5">
                
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/40 shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Referans Kodu İle Kayıt Olun</h4>
                    <p className="text-xs text-slate-400">
                      Sisteme bağlı olduğunuz bayinin referans kodu ile kaydolarak hesabınızı aktive edin.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40 shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Bayi Paketinizi Seçin ve Kredi Yükleyin</h4>
                    <p className="text-xs text-slate-400">
                      Bronz (30 Seans), Gümüş (100 Seans) veya Altın (300 Seans) paketlerinden birini seçip havale referansıyla sipariş oluşturun. Onaylandığı an krediniz havuzunuza yüklenir.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 font-black text-sm flex items-center justify-center border border-teal-500/40 shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Canlı Aura & Biyo-Rezonans Taraması Başlatın</h4>
                    <p className="text-xs text-slate-400">
                      Kamera, mikrofon veya biyometrik sensörleri açarak danışanınızın 7 çakra hizalanmasını ve organ enerji seviyesini ölçün.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center border border-indigo-500/40 shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Frekans Yüklemesini Uygulayın</h4>
                    <p className="text-xs text-slate-400">
                      Belirlenen şifa protokolünü (Esma, Solfejyo, Sufi veya Çakra osiloskop) başlatın. Seans tamamlandığında kredi havuzunuzdan otomatik olarak 1 kredi düşülür.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/40 shrink-0">
                    5
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Raporu Danışana Teslim Edin & Komisyonlarınızı Takip Edin</h4>
                    <p className="text-xs text-slate-400">
                      Öncesi/Sonrası karşılaştırmalı PDF raporunu tek tıkla danışanınıza WhatsApp veya e-posta ile iletin. Bayi panelinizden komisyonlarınızı ve IBAN ödemelerinizi izleyin.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 4: İNTERAKTİF GELİR SİMÜLATÖRÜ */}
          {activeSection === 'simulator' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/40 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  <span>Kişiselleştirilmiş Finansal Hesaplayıcı</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Aylık ve Yıllık Tahmini Bayi Gelir Simülatörü
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Uyguladığınız danışan seans sayısı, seans ücreti ve referans olduğunuz üyelere göre net karınızı canlı olarak hesaplayın.
                </p>
              </div>

              {/* Sliders and Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Aylık Danışan Seansı Sayısı:</span>
                      <span className="text-emerald-400 font-mono text-sm">{calcClientsPerMonth} Seans / Ay</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={calcClientsPerMonth}
                      onChange={(e) => setCalcClientsPerMonth(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5 Seans</span>
                      <span>100 Seans</span>
                      <span>200 Seans</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Seans Başı Danışan Ücreti (₺):</span>
                      <span className="text-amber-300 font-mono text-sm">{calcPricePerSession.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={calcPricePerSession}
                      onChange={(e) => setCalcPricePerSession(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>500 ₺</span>
                      <span>2.500 ₺</span>
                      <span>5.000 ₺</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Referans Olunan Lisanslı Üye Sayısı (Ayda):</span>
                      <span className="text-indigo-300 font-mono text-sm">{calcReferredMembers} Üye</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={calcReferredMembers}
                      onChange={(e) => setCalcReferredMembers(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0 Üye</span>
                      <span>15 Üye</span>
                      <span>30 Üye</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Ortalama Lisans Paketi Bedeli:</span>
                      <span className="text-purple-300 font-mono text-sm">{calcAvgPackagePrice.toLocaleString('tr-TR')} ₺ (%{calcCommissionRate} Komisyon)</span>
                    </div>
                    <select
                      value={calcAvgPackagePrice}
                      onChange={(e) => setCalcAvgPackagePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
                    >
                      <option value={5000}>1 Aylık Lisans (5.000 ₺) • 1.000 ₺ Komisyon</option>
                      <option value={10000}>3 Aylık Lisans (10.000 ₺) • 2.000 ₺ Komisyon</option>
                      <option value={30000}>6 Aylık Lisans (30.000 ₺) • 6.000 ₺ Komisyon</option>
                      <option value={50000}>1 Yıllık Lisans (50.000 ₺) • 10.000 ₺ Komisyon</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/50 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Danışan Seans Cirosu:</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{monthlySessionRevenue.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Kredi Seans Maliyeti (~145 ₺):</span>
                      <span className="text-xs font-mono font-bold text-rose-400">-{monthlySessionCost.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs text-emerald-400 font-bold">Danışan Seans Net Karı:</span>
                      <span className="text-sm font-mono font-black text-emerald-400">+{monthlySessionProfit.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs text-indigo-300 font-bold">Referans Lisans Komisyonu (%20):</span>
                      <span className="text-sm font-mono font-black text-indigo-300">+{monthlyReferralCommission.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 space-y-1 text-center shadow-lg">
                    <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                      Tahmini Toplam Aylık Net Gelir
                    </div>
                    <div className="text-3xl font-black text-white font-mono">
                      {totalMonthlyEarnings.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[11px] text-emerald-300/80 font-mono">
                      Yıllık Projeksiyon: <strong>{yearlyProjectedEarnings.toLocaleString('tr-TR')} ₺ / Yıl</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenResellerModal) onOpenResellerModal('packages');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Bayilik Paketlerini İncele & Başvur</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 5: BAYİ PAKETLERİ (BRONZ, GÜMÜŞ, ALTIN) */}
          {activeSection === 'packages' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Coins className="w-4 h-4" />
                  <span>Kredi Havuzu & Bayi Başlangıç Paketleri</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Esnek Büyüme ve Yüksek Kar Marjlı Bayilik Paketleri
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  İhtiyacınıza uygun seans adedini seçin; kredi havuzunuzdan danışanlarınıza tarama ve frekans seanslarını uygulayın.
                </p>
              </div>

              {/* Dealer Package Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {dealerPackages.map((pkg) => {
                  return (
                    <div
                      key={pkg.id}
                      className={`p-5 rounded-3xl border flex flex-col justify-between transition-all space-y-4 ${
                        pkg.popular
                          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/60 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/90 border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            {pkg.badge}
                          </span>
                          {pkg.popular && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              EN ÇOK TERCİH EDİLEN
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-100">{pkg.name}</h4>
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            {pkg.scanCredits} Adet Tarama & Seans Kredisi
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <div className="text-2xl font-black text-white font-mono">{pkg.priceText}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{pkg.unitCostText}</div>
                        </div>

                        <ul className="space-y-1.5 pt-2 text-xs text-slate-300">
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-[11px]">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenResellerModal) {
                            onOpenResellerModal('packages');
                          } else if (onOpenAuthModal) {
                            onOpenAuthModal('dealer');
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Paketi Satın Al / Kredi Yükle</span>
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* SECTION 6: ÖZEL REFERANSLI PAYLAŞIM VE DİJİTAL KATALOG */}
          {activeSection === 'share' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-500/50 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Share2 className="w-4 h-4" />
                  <span>Kendi Özel Referans Linkinizle Tanıtım & Yayılım</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Tek Tuşla WhatsApp ve Sosyal Medyada Paylaşın
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Bu dijital sunum raporunu danışanlarınıza, terapist meslektaşlarınıza ve sosyal medyanızda paylaştığınızda, ziyaretçiler sizin özel referans kodunuzla kaydedilir ve yaptıkları her işlemden anında komisyon kazanırsınız.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Link and Code Card */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Özel Sunum & Katalog Bağlantınız:</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">Canlı Link</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fullShareUrl}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono outline-none select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">Özel Bayi / Referans Kodunuz:</span>
                      <span className="text-emerald-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">
                        {activeReferralCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCode}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                        <span>{copiedCode ? 'Referans Kodu Kopyalandı' : 'Yalnızca Kodu Kopyala'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">Sosyal Ağlarda Paylaşın:</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={waShareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-colors"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={tgShareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-950 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Telegram</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Official Documents Download Card */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Resmi Kurumsal Belge & İş Teklifi İndir</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kurumlara, kliniklere veya ortaklarınıza fiziki sunum yapabilmeniz için hazırlanmış resmi Word (.doc) ve PDF formatındaki teknik sistem raporunu indirebilirsiniz.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div className="font-bold text-emerald-300">Belge İçeriği:</div>
                      <div>• AKN Global Group Ltd Şirket Heyet Onayı</div>
                      <div>• Biyo-Rezonans Donanım & Sensör Özellikleri</div>
                      <div>• Fiyatlandırma, Lisans ve Yasal Uyumluluk</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => downloadTechnicalReportWord()}
                      className="py-2.5 px-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word (.doc) İndir</span>
                    </button>
                    <button
                      onClick={() => downloadTechnicalReportPDF()}
                      className="py-2.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Olarak İndir</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Bottom Footer Bar with Quick Action CTAs */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AuraBio Frekans • Canlı Firestore & Güvenli Referans Mimarisi</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (activeReferralCode) setStoredReferralCode(activeReferralCode);
                onClose();
                if (onOpenAuthModal) onOpenAuthModal('dealer');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-md shadow-amber-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Bayilik Başvurusu Yap</span>
            </button>

            <button
              onClick={() => {
                if (activeReferralCode) setStoredReferralCode(activeReferralCode);
                onClose();
                if (onOpenAuthModal) onOpenAuthModal('register');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hemen Kayıt Ol</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
