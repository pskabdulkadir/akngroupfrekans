import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Building2, 
  User, 
  Crown, 
  Zap,
  ArrowRight,
  MessageSquare,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Play,
  Scale,
  FileText,
  Briefcase,
  Coins
} from 'lucide-react';
import { 
  UserMember, 
  BANK_INFO, 
  DEFAULT_MEMBERSHIP_PACKAGES, 
  MembershipPackage, 
  CartItem,
  getMembershipPackages,
  subscribeToMembershipPackages,
  getWhatsAppCartOrderUrl,
  activateDemoSession,
  updateMemberCart,
  recordMemberOrder
} from '../utils/authManager';
import { DealerPackage, getDealerPackages, subscribeToDealerPackages } from '../utils/resellerManager';
import { DemoProtocolModal } from './DemoProtocolModal';
import { LegalContractsModal, LegalContractTab } from './LegalContractsModal';

interface PaymentModalProps {
  user: UserMember;
  onClose?: () => void;
  onProceedToWaiting: () => void;
  onDemoActivated?: (updatedUser: UserMember) => void;
  allowClose?: boolean;
  isExpiredNotice?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  user,
  onClose,
  onProceedToWaiting,
  onDemoActivated,
  allowClose = false,
  isExpiredNotice = false,
}) => {
  const isDealerUser = Boolean(
    user.isDealerRequested || 
    user.role === 'dealer' || 
    user.dealerStatus === 'pending' || 
    user.dealerStatus === 'approved' || 
    user.dealerDetails
  );

  // Dynamic packages
  const [packages, setPackages] = useState<MembershipPackage[]>(() => getMembershipPackages());
  const [dealerPackages, setDealerPackages] = useState<DealerPackage[]>(() => getDealerPackages());

  // Cart state: map of packageId -> quantity
  const [cart, setCart] = useState<{ [packageId: string]: number }>(() => {
    if (user.cart && user.cart.length > 0) {
      const initial: { [pkgId: string]: number } = {};
      user.cart.forEach(c => { initial[c.packageId] = c.quantity; });
      return initial;
    }
    return { 'pkg-30k': 1 };
  });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoSuccess, setDemoSuccess] = useState<string | null>(null);

  // Demo protocol modal state (Tuz/Su hazırlık protokolü)
  const [isDemoProtocolOpen, setIsDemoProtocolOpen] = useState<boolean>(false);

  // Legal contracts modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [activeLegalTab, setActiveLegalTab] = useState<LegalContractTab>('preInfo');
  const [legalAccepted, setLegalAccepted] = useState<boolean>(false);
  const [legalErrorNotice, setLegalErrorNotice] = useState<boolean>(false);

  useEffect(() => {
    const unsubMember = subscribeToMembershipPackages((newPkgs) => {
      if (newPkgs && newPkgs.length > 0) {
        setPackages(newPkgs);
      }
    });
    const unsubDealer = subscribeToDealerPackages((newDealerPkgs) => {
      if (newDealerPkgs && newDealerPkgs.length > 0) {
        setDealerPackages(newDealerPkgs);
      }
    });
    return () => {
      unsubMember();
      unsubDealer();
    };
  }, []);

  const demoPackage = packages.find(p => p.isDemo);
  const paidPackages = packages.filter(p => !p.isDemo);

  // Combined package lookup array
  const allAvailablePackages = [
    ...packages.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      priceText: p.priceText,
      durationText: p.durationText,
      days: p.days,
      isDemo: Boolean(p.isDemo),
      popular: p.popular,
      badge: p.badge,
      features: p.features,
      isDealer: false,
      scanCredits: p.scanCredits,
      unitCostText: p.unitCostText
    })),
    ...dealerPackages.map(dp => ({
      id: dp.id,
      name: dp.name,
      price: dp.price,
      priceText: dp.priceText,
      durationText: `${dp.scanCredits} Adet Seans Kredisi (${dp.unitCostText})`,
      days: null,
      isDemo: false,
      popular: dp.popular,
      badge: dp.badge,
      features: dp.features,
      isDealer: true,
      scanCredits: dp.scanCredits,
      unitCostText: dp.unitCostText
    }))
  ];

  // Cart operations
  const handleAddToCart = (pkgId: string) => {
    setCart(prev => ({
      ...prev,
      [pkgId]: (prev[pkgId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (pkgId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[pkgId] > 1) {
        updated[pkgId] -= 1;
      } else {
        delete updated[pkgId];
      }
      return updated;
    });
  };

  const handleClearItem = (pkgId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[pkgId];
      return updated;
    });
  };

  // Convert cart object to CartItem array
  const cartItems: CartItem[] = (Object.entries(cart) as [string, number][])
    .filter(([_, qty]) => qty > 0)
    .map(([pkgId, qty]) => ({ packageId: pkgId, quantity: qty }));

  // Auto-sync cart to Firestore
  useEffect(() => {
    if (user.uid && cartItems.length > 0) {
      updateMemberCart(user.uid, cartItems);
    }
  }, [cart, user.uid]);

  // Calculate totals
  const totalCartPrice = cartItems.reduce((sum, item) => {
    const pkg = allAvailablePackages.find(p => p.id === item.packageId);
    return sum + (pkg ? pkg.price * item.quantity : 0);
  }, 0);

  const totalCartDaysText = (() => {
    let hasUnlimited = false;
    let days = 0;
    let credits = 0;

    cartItems.forEach(item => {
      const pkg = allAvailablePackages.find(p => p.id === item.packageId);
      if (pkg) {
        if (pkg.scanCredits) {
          credits += (pkg.scanCredits * item.quantity);
        } else if (pkg.days === null) {
          hasUnlimited = true;
        } else if (pkg.days) {
          days += (pkg.days * item.quantity);
        }
      }
    });

    const parts: string[] = [];
    if (credits > 0) parts.push(`${credits} Seans Kredisi`);
    if (hasUnlimited) parts.push('Ömür Boyu Limitsiz VIP');
    else if (days > 0) parts.push(`${days} Gün Süre`);

    return parts.length > 0 ? parts.join(' + ') : 'Paket seçilmedi';
  })();

  const handleCopyIban = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(BANK_INFO.iban);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Trigger 10-Minute Free Demo (After user confirms Salt/Water Protocol)
  const handleConfirmDemoProtocol = async () => {
    setDemoLoading(true);
    setDemoError(null);
    setDemoSuccess(null);

    try {
      const res = await activateDemoSession(user);
      if (res.success && res.user) {
        // Record demo order
        recordMemberOrder({
          id: 'ORD-DEMO-' + Date.now().toString(36).toUpperCase(),
          userId: user.uid,
          userEmail: user.email,
          userName: user.fullName || 'Değerli Üyemiz',
          userPhone: user.phone,
          packageId: 'demo-30m',
          packageName: '30 Dakikalık Ücretsiz Canlı Demo',
          durationText: '30 Dakika',
          amount: 0,
          paymentStatus: 'DEMO',
          date: new Date().toISOString(),
          paymentMethod: 'Ücretsiz Demo',
          items: [{ packageId: 'demo-30m', name: '30 Dakikalık Ücretsiz Canlı Demo', quantity: 1, price: 0 }]
        });

        setIsDemoProtocolOpen(false);
        setDemoSuccess(res.message);
        setTimeout(() => {
          if (onDemoActivated) {
            onDemoActivated(res.user!);
          }
          if (onClose) onClose();
        }, 1000);
      } else {
        setDemoError(res.message);
      }
    } catch (err: any) {
      setDemoError(err?.message || 'Demo başlatılamadı.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleOpenLegalModal = (tab: LegalContractTab) => {
    setActiveLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleWhatsAppReceiptClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!legalAccepted) {
      e.preventDefault();
      setLegalErrorNotice(true);
      const element = document.getElementById('legal-terms-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Record order transaction
    try {
      const activeItems = cartItems.map(item => {
        const pkg = packages.find(p => p.id === item.packageId);
        return {
          packageId: item.packageId,
          name: pkg?.name || item.packageId,
          quantity: item.quantity,
          price: pkg?.price || 0
        };
      });

      const firstPkg = packages.find(p => p.id === cartItems[0]?.packageId) || packages[1];

      recordMemberOrder({
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000).toString(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.fullName || 'Değerli Üyemiz',
        userPhone: user.phone,
        packageId: firstPkg.id,
        packageName: activeItems.length > 1 ? `${activeItems.length} Adet Paket (Sepet)` : firstPkg.name,
        durationText: totalCartDaysText,
        amount: totalCartPrice,
        paymentStatus: 'PENDING',
        date: new Date().toISOString(),
        paymentMethod: 'Havale / EFT & WhatsApp Bildirimi',
        referenceNumber: 'REF-' + Date.now().toString(36).toUpperCase(),
        items: activeItems
      });
    } catch (recErr) {
      console.debug('Record order notice:', recErr);
    }
  };

  const whatsappUrl = getWhatsAppCartOrderUrl(user, cartItems.length > 0 ? cartItems : [{ packageId: '3-months', quantity: 1 }]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/80 space-y-6 max-h-[94vh] overflow-y-auto">
        
        {allowClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            isDealerUser
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {isDealerUser ? (
              <>
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>AKN Global Bayilik • Kredi Havuzu & Başvuru Onayı</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isExpiredNotice ? 'Süreniz Sona Erdi • Paket Yenileme' : 'Bireysel Üyelik Paketleri & Sepet Paneli'}</span>
              </>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
            {isDealerUser ? 'AKN Bayilik Paketleri & Seans Kredisi' : 'AuraBio Frekans Üyelik & Sepet Sistemi'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {isDealerUser ? (
              <>
                Sayın Danışmanımız/Bayimiz <strong className="text-slate-200">{user?.fullName || user?.dealerDetails?.companyName || user?.email || 'Danışman'}</strong>, kliniğiniz ve danışan seanslarınız için seans kredi havuzu paketinizi seçip havale/EFT referansıyla siparişinizi iletebilirsiniz.
              </>
            ) : (
              <>
                Sayın <strong className="text-slate-200">{user?.fullName || user?.email || 'Danışan'}</strong>, dilediğiniz üyelik paketlerini sepetinize ekleyebilir veya tek kullanımlık 30 dakikalık ücretsiz demoyu başlatabilirsiniz.
              </>
            )}
          </p>
        </div>

        {/* SECTION 1: 30-MINUTE FREE DEMO BANNER (Only for regular members) */}
        {!isDealerUser && demoPackage && (
          <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border-2 border-amber-500/60 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center shrink-0 shadow-lg">
                  <Play className="w-6 h-6 text-amber-400 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-100">
                      30 Dakikalık Ücretsiz Canlı Demo Deneyimi
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                      TEK SEFERLİK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Tüm kamera tarama, çakra, letaif ve frekans modüllerini 30 dakika boyunca anında ücretsiz test edin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoProtocolOpen(true)}
                disabled={demoLoading || user.demoUsed}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 transition-all ${
                  user.demoUsed
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {demoLoading 
                    ? 'Demo Başlatılıyor...' 
                    : user.demoUsed 
                    ? 'Demo Daha Önce Kullanıldı' 
                    : '30 Dakikalık Demoyu Şimdi Başlat'}
                </span>
              </button>
            </div>

            {demoError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{demoError}</span>
              </div>
            )}

            {demoSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{demoSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: PACKAGES GRID (Strictly Dealer Packages for Dealers, Membership Packages for Standard Members) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              {isDealerUser ? (
                <>
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Bayilik Başlangıç Paketleri & Seans Kredi Havuzu</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Bireysel Üyelik Paketleri (İstediğiniz kadar ekleyebilirsiniz)</span>
                </>
              )}
            </h3>
            <span className="text-[11px] text-slate-400">
              {isDealerUser 
                ? 'Seans kredilerinin son kullanma tarihi yoktur; kullandıkça düşer.' 
                : 'Sepete çoklu paket ekleyerek sürenizi birleştirebilirsiniz.'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {isDealerUser ? (
              // DEALER PACKAGES ONLY
              dealerPackages.map((pkg) => {
                const qtyInCart = cart[pkg.id] || 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-5 rounded-2xl transition-all flex flex-col justify-between border ${
                      qtyInCart > 0
                        ? 'bg-gradient-to-b from-amber-950/70 to-slate-900 border-amber-400 shadow-lg shadow-amber-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md' 
                          : 'bg-amber-600 text-white'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-3 mt-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                          <span>{pkg.name}</span>
                          {qtyInCart > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                              {qtyInCart}x Sepette
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{pkg.scanCredits} Seans Kredisi</span>
                        </div>
                      </div>

                      <div className="py-2 border-y border-slate-800/80 flex items-baseline justify-between">
                        <div className="text-2xl font-black tracking-tight text-amber-300 font-mono">
                          {pkg.priceText}
                        </div>
                        <div className="text-xs text-slate-400">
                          {pkg.unitCostText}
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add / Quantity Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-850">
                      {qtyInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(pkg.id)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Sepete Ekle</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(pkg.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs px-3 text-amber-400 font-mono">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(pkg.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleClearItem(pkg.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                            title="Sepetten Çıkar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // MEMBERSHIP PACKAGES ONLY
              paidPackages.map((pkg) => {
                const qtyInCart = cart[pkg.id] || 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-5 rounded-2xl transition-all flex flex-col justify-between border ${
                      qtyInCart > 0
                        ? 'bg-gradient-to-b from-emerald-950/70 to-slate-900 border-emerald-400 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-3 mt-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                          <span>{pkg.name}</span>
                          {qtyInCart > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                              {qtyInCart}x Sepette
                            </span>
                          )}
                        </h4>
                        {pkg.scanCredits ? (
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{pkg.scanCredits} Seans Kredisi</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {pkg.durationText}
                          </div>
                        )}
                      </div>

                      <div className="py-2 border-y border-slate-800/80 flex items-baseline justify-between">
                        <div className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                          {pkg.priceText}
                        </div>
                        {pkg.unitCostText && (
                          <div className="text-xs text-slate-400">
                            {pkg.unitCostText}
                          </div>
                        )}
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add / Quantity Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-850">
                      {qtyInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(pkg.id)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Sepete Ekle</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(pkg.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs px-3 text-emerald-400 font-mono">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(pkg.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleClearItem(pkg.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                            title="Sepetten Çıkar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 3: SHOPPING CART SUMMARY & BANK DETAILS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border border-emerald-500/40 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Sepetiniz ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} Paket)</span>
                  <span className="text-xs text-emerald-400 font-normal">({totalCartDaysText})</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Aşağıdaki IBAN hesabına sepet toplam tutarını transfer ediniz.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block">Toplam Sepet Tutarı:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {totalCartPrice.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>

          {/* Cart Breakdown Pills */}
          {cartItems.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {cartItems.map((item) => {
                const pkg = allAvailablePackages.find(p => p.id === item.packageId);
                if (!pkg) return null;
                return (
                  <span 
                    key={item.packageId}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium"
                  >
                    <strong className="text-emerald-400 font-mono">{item.quantity}x</strong>
                    <span>{pkg.name}</span>
                    <span className="text-slate-500">({(pkg.price * item.quantity).toLocaleString('tr-TR')} ₺)</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Bank IBAN Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Banka Adı</span>
              <div className="font-bold text-slate-200 text-sm">{BANK_INFO.bankName}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hesap Sahibi</span>
              <div className="font-bold text-slate-200 text-sm">{BANK_INFO.accountHolder}</div>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IBAN Numarası</span>
                <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base tracking-wider select-all">
                  {BANK_INFO.iban}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyIban}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-center"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>IBAN Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: E-COMMERCE LEGAL CONTRACTS & MANDATORY CHECKBOX */}
        <div id="legal-terms-section" className="space-y-2.5">
          <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer shadow-md ${
            legalErrorNotice && !legalAccepted
              ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/40 text-rose-200'
              : legalAccepted
              ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-200'
              : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}>
            <input
              type="checkbox"
              id="legal-terms-checkbox"
              checked={legalAccepted}
              onChange={(e) => {
                setLegalAccepted(e.target.checked);
                if (e.target.checked) setLegalErrorNotice(false);
              }}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900 cursor-pointer shrink-0"
            />
            <span className="text-xs leading-relaxed select-none">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenLegalModal('preInfo');
                }}
                className="text-emerald-400 font-bold underline hover:text-emerald-300 mx-0.5 inline-flex items-center gap-0.5"
              >
                <span>[Ön Bilgilendirme Koşullarını]</span>
              </button>
              ,{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenLegalModal('distanceSale');
                }}
                className="text-emerald-400 font-bold underline hover:text-emerald-300 mx-0.5 inline-flex items-center gap-0.5"
              >
                <span>[Mesafeli Satış Sözleşmesini]</span>
              </button>{' '}
              ve{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenLegalModal('terms');
                }}
                className="text-emerald-400 font-bold underline hover:text-emerald-300 mx-0.5 inline-flex items-center gap-0.5"
              >
                <span>[Kullanım Koşullarını]</span>
              </button>{' '}
              okudum, onaylıyorum.{' '}
              <span className="text-amber-300 font-medium">
                (Dijital içeriklerde cayma hakkı bulunmadığını kabul ediyorum.)
              </span>{' '}
              <span className="text-rose-400 font-bold">*</span>
            </span>
          </label>

          {legalErrorNotice && !legalAccepted && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Ödeme ve sipariş dekontu iletimine devam edebilmek için lütfen yukarıdaki yasal sözleşme onay kutucuğunu işaretleyiniz.
              </span>
            </div>
          )}
        </div>

        {/* SECTION 5: ACTIONS & WHATSAPP RECEIPT BUTTON */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{isDealerUser ? 'Bayilik Siparişi & Kredi Aktivasyonu:' : 'Sipariş & Aktivasyon:'}</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
              <li>Yukarıdaki IBAN adresine <strong>{totalCartPrice.toLocaleString('tr-TR')} ₺</strong> transferini yapınız.</li>
              <li>Yukarıdaki yasal sözleşme onay kutucuğunu işaretleyiniz.</li>
              <li>Aşağıdaki butona tıklayarak dekontunuzu WhatsApp ile yöneticimize iletiniz.</li>
              <li>
                {isDealerUser 
                  ? 'Yönetici onayladığı anda seans kredileriniz ve bayi yetkiniz hesabınıza anında tanımlanır.' 
                  : 'Yönetici onayladığı anda sepetinizdeki toplam süre hesabınıza anında tanımlanır.'}
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Primary Action: Send Cart Receipt via WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppReceiptClick}
              className={`w-full sm:flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                legalAccepted
                  ? isDealerUser
                    ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/60 hover:scale-[1.01] active:scale-[0.98]'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 hover:scale-[1.01] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750 hover:text-slate-300 cursor-pointer'
              }`}
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>
                {isDealerUser 
                  ? `Bayilik & Kredi Dekontunu WhatsApp ile Gönder (${totalCartPrice.toLocaleString('tr-TR')} ₺)` 
                  : `Sepet Dekontunu WhatsApp ile Gönder (${totalCartPrice.toLocaleString('tr-TR')} ₺)`}
              </span>
            </a>

            {/* Secondary Action: Proceed to Waiting Screen */}
            <button
              type="button"
              onClick={onProceedToWaiting}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Onay Bekleme Ekranına Geç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-modal: Demo Preparation & Salt/Water Protocol */}
        <DemoProtocolModal
          isOpen={isDemoProtocolOpen}
          onClose={() => setIsDemoProtocolOpen(false)}
          onConfirm={handleConfirmDemoProtocol}
          isLoading={demoLoading}
        />

        {/* Sub-modal: Full-text Legal Contracts Viewer */}
        <LegalContractsModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={activeLegalTab}
        />

      </div>
    </div>
  );
};

