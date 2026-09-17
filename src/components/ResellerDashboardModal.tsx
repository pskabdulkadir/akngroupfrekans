import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Share2, 
  ExternalLink, 
  X, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Award, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  QrCode, 
  Check, 
  ArrowUpRight, 
  Smartphone,
  Lock,
  ChevronRight,
  LogOut,
  Sparkles,
  HelpCircle,
  FileText,
  Percent,
  Package,
  Coins,
  Loader2,
  Zap,
  Plus,
  BookOpen,
  Receipt,
  Home,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { 
  Reseller, 
  CommissionTransaction, 
  BankInfo, 
  DealerPackage,
  DEFAULT_DEALER_PACKAGES,
  getDealerPackages,
  subscribeToDealerPackages,
  purchaseDealerPackage,
  getActiveResellerSession, 
  setActiveResellerSession, 
  loginAsReseller, 
  registerNewReseller, 
  updateResellerBankInfo, 
  getCommissionsForReseller, 
  generateReferralLink, 
  generateBusinessPresentationLink,
  generateTechnicalReportLink,
  generateRegisterLink,
  generateBusinessCardLink,
  generateBulkMarketingMessage,
  generateWhatsAppShareUrl, 
  generateTelegramShareUrl,
  generateWhatsAppUrlForMessage,
  generateTelegramUrlForMessage,
  subscribeToReseller, 
  getLocalResellers,
  getOrCreateResellerForUser,
  getReferredUsersForReseller,
  subscribeToResellersList
} from '../utils/resellerManager';
import { UserMember, BANK_INFO, ADMIN_PHONE } from '../utils/authManager';
import { downloadTechnicalReportWord, downloadTechnicalReportPDF } from '../utils/technicalReportExport';
import { 
  DealerPackageOrder, 
  requestDealerPackagePurchase, 
  subscribeToDealerPackageOrders 
} from '../utils/dealerOrderManager';
import { 
  DigitalInvoice, 
  subscribeToDigitalInvoices, 
  getInvoicesForReseller, 
  generateInvoiceWhatsAppShareUrl,
  createInvoiceForDealerOrder
} from '../utils/invoiceManager';
import { DealerBusinessCardModal } from './DealerBusinessCardModal';
import { DigitalInvoiceModal } from './DigitalInvoiceModal';
import { ScanResult } from '../types';
import { syncUserScansFromFirestore, deleteScanResult, deleteScanRecordsByIds } from '../utils/storage';

interface ResellerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserMember | null;
  onOpenAuthModal?: () => void;
  onOpenBusinessPresentation?: () => void;
  onOpenTechnicalReport?: () => void;
  initialTab?: 'overview' | 'clients' | 'bayilerim' | 'scans' | 'presentation' | 'packages' | 'share' | 'commissions' | 'invoices' | 'bank' | 'apply';
}

export const ResellerDashboardModal: React.FC<ResellerDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  onOpenBusinessPresentation,
  onOpenTechnicalReport,
  initialTab = 'overview'
}) => {
  const [activeReseller, setActiveReseller] = useState<Reseller | null>(() => getActiveResellerSession());
  const [commissions, setCommissions] = useState<CommissionTransaction[]>([]);
  const [referredUsers, setReferredUsers] = useState<UserMember[]>([]);
  const [referredUserSearch, setReferredUserSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'bayilerim' | 'scans' | 'presentation' | 'packages' | 'share' | 'commissions' | 'invoices' | 'bank' | 'apply'>(initialTab);

  // Dealer's own scan history state
  const [dealerScans, setDealerScans] = useState<ScanResult[]>([]);
  const [dealerScansLoading, setDealerScansLoading] = useState<boolean>(false);
  const [dealerScansSearch, setDealerScansSearch] = useState<string>('');
  const [isDeletingScanId, setIsDeletingScanId] = useState<string | null>(null);
  const [isClearingDealerScans, setIsClearingDealerScans] = useState<boolean>(false);
  const [scanActionMsg, setScanActionMsg] = useState<string | null>(null);

  // Bayilerim tab: referred members (danisanlar/uyeler) + their live remaining credits
  const [subResellers, setSubResellers] = useState<Reseller[]>([]);
  const [subResellersLoading, setSubResellersLoading] = useState<boolean>(false);
  const [subResellersSearch, setSubResellersSearch] = useState<string>('');
  const [liveResellers, setLiveResellers] = useState<Reseller[]>([]);

  // Digital Invoices State
  const [invoices, setInvoices] = useState<DigitalInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<DigitalInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | 'sent_whatsapp' | 'issued'>('all');

  // Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);

  // Dealer Packages State
  const [dealerPackages, setDealerPackages] = useState<DealerPackage[]>(() => getDealerPackages());
  const [purchasingPkgId, setPurchasingPkgId] = useState<string | null>(null);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);
  const [selectedPkgForOrder, setSelectedPkgForOrder] = useState<DealerPackage | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [orderPaymentRef, setOrderPaymentRef] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [dealerOrders, setDealerOrders] = useState<DealerPackageOrder[]>([]);

  // Filter & Search in commissions
  const [commFilter, setCommFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const [commSearch, setCommSearch] = useState<string>('');

  // Login form state
  const [loginInput, setLoginInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Application / New Reseller Form
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regCustomCode, setRegCustomCode] = useState<string>('');
  const [regBankName, setRegBankName] = useState<string>('');
  const [regAccountHolder, setRegAccountHolder] = useState<string>('');
  const [regIban, setRegIban] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyMsg, setApplyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bank edit state
  const [bankForm, setBankForm] = useState<BankInfo>({
    bankName: '',
    accountHolder: '',
    iban: '',
  });
  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);
  const [bankMsg, setBankMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Copy state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPresLink, setCopiedPresLink] = useState<boolean>(false);
  const [copiedTechLink, setCopiedTechLink] = useState<boolean>(false);
  const [copiedRegLink, setCopiedRegLink] = useState<boolean>(false);
  const [copiedCardLink, setCopiedCardLink] = useState<boolean>(false);
  const [copiedBulkMessage, setCopiedBulkMessage] = useState<boolean>(false);

  // Sync active reseller session & real-time updates
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    let isSyncing = false;

    const syncSessionData = async () => {
      if (isSyncing || !isSubscribed) return;
      isSyncing = true;

      try {
        const isManualLoggedOut = sessionStorage.getItem('aurabio_reseller_manual_logged_out') === 'true';
        let currentSession = getActiveResellerSession();

        // If user is logged in -> ALWAYS link to this user's unique reseller profile
        if (!isManualLoggedOut && currentUser) {
          try {
            const userReseller = await getOrCreateResellerForUser(currentUser);
            currentSession = userReseller;
          } catch (err) {
            console.debug('Sync dealer profile error:', err);
          }
        }

        if (currentSession && isSubscribed) {
          // NOTE: The active reseller session is the single source of truth for the balance.
          // Do NOT overwrite it from currentUser (cached member session may be stale on reload,
          // which made dealer credits look like they were not decreasing after scans).
          setActiveReseller(currentSession);
          
          // Auto-redirect to packages tab if credits are 0 or negative
          if (currentSession.creditsBalance !== undefined && currentSession.creditsBalance <= 0) {
            setActiveTab('packages');
          }

          setBankForm({
            bankName: currentSession.bankInfo?.bankName || '',
            accountHolder: currentSession.bankInfo?.accountHolder || currentSession.resellerName,
            iban: currentSession.bankInfo?.iban || '',
          });

          getCommissionsForReseller(currentSession.uid)
            .then(data => { if (isSubscribed) setCommissions(data); })
            .catch(() => {});
          getReferredUsersForReseller(currentSession.uid, currentSession.referralCode)
            .then(data => { if (isSubscribed) setReferredUsers(data); })
            .catch(() => {});
          getInvoicesForReseller(currentSession.uid)
            .then(data => { if (isSubscribed) setInvoices(data); })
            .catch(() => {});
        }
      } catch (syncErr) {
        console.debug('syncSessionData caught error:', syncErr);
      } finally {
        isSyncing = false;
      }
    };

    syncSessionData();

    // Listen to local & broadcasted events
    const handleCreditsDeducted = (e: any) => {
      const remaining = e.detail?.remainingCredits;
      if (typeof remaining === 'number') {
        setActiveReseller(prev => prev ? { ...prev, creditsBalance: remaining } : prev);
        if (remaining <= 0) {
          setActiveTab('packages');
        }
      } else {
        syncSessionData();
      }
    };

    const handleSessionUpdated = () => {
      syncSessionData();
    };

    const handleInvoicesUpdated = () => {
      syncSessionData();
    };

    window.addEventListener('aurabio_credits_deducted', handleCreditsDeducted);
    window.addEventListener('aurabio_resellers_updated', handleSessionUpdated);
    window.addEventListener('aurabio_session_updated', handleSessionUpdated);
    window.addEventListener('aurabio_invoices_updated', handleInvoicesUpdated);

    let unsubReseller = () => {};
    const curRes = getActiveResellerSession();
    if (curRes?.uid) {
      unsubReseller = subscribeToReseller(curRes.uid, (updated) => {
        if (updated) {
          setActiveReseller(updated);
        }
      });
    }

    const unsubDp = subscribeToDealerPackages((packages) => {
      setDealerPackages(packages);
    });

    const liveResellerFilter = getActiveResellerSession()?.uid || currentUser?.uid || '';
    const unsubOrders = subscribeToDealerPackageOrders((orders) => {
      setDealerOrders(orders);
    }, liveResellerFilter);

    const unsubInvoices = subscribeToDigitalInvoices((allInvoices) => {
      const cur = getActiveResellerSession();
      if (cur) {
        const curUid = (cur.uid || '').toLowerCase();
        const curCode = (cur.referralCode || '').toLowerCase();
        const curEmail = (cur.email || '').toLowerCase();

        const filtered = allInvoices.filter(inv => {
          const rUid = (inv.recipient.uid || '').toLowerCase();
          const rEmail = (inv.recipient.email || '').toLowerCase();
          const rCode = (inv.recipient.referralCode || '').toLowerCase();

          if (curUid && rUid === curUid) return true;
          if (curCode && rCode === curCode) return true;
          if (curEmail && rEmail === curEmail) return true;
          return false;
        });
        setInvoices(filtered);
      }
    }, liveResellerFilter);

    return () => {
      isSubscribed = false;
      window.removeEventListener('aurabio_credits_deducted', handleCreditsDeducted);
      window.removeEventListener('aurabio_resellers_updated', handleSessionUpdated);
      window.removeEventListener('aurabio_session_updated', handleSessionUpdated);
      window.removeEventListener('aurabio_invoices_updated', handleInvoicesUpdated);
      unsubReseller();
      unsubDp();
      unsubOrders();
      unsubInvoices();
    };
  }, [isOpen, currentUser]);

  const handleOpenOrderModal = (pkg: DealerPackage) => {
    setSelectedPkgForOrder(pkg);
    setOrderPaymentRef('');
    setShowOrderModal(true);
  };

  const handleConfirmOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReseller || !selectedPkgForOrder) return;
    setIsSubmittingOrder(true);
    try {
      const res = await requestDealerPackagePurchase(
        activeReseller.uid,
        activeReseller.resellerName,
        activeReseller.email,
        activeReseller.phone,
        selectedPkgForOrder,
        orderPaymentRef.trim()
      );

      if (res.success) {
        setShowOrderModal(false);
        setPurchaseSuccessMsg(res.message);
        setTimeout(() => {
          setPurchaseSuccessMsg(null);
        }, 8000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err?.message || 'Sipariş oluşturulamadı.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ---- Dealer's own scan history (load + delete + bulk delete) ----
  const loadDealerScans = async (silent = false) => {
    const uid = currentUser?.uid || activeReseller?.uid || '';
    const email = currentUser?.email || activeReseller?.email || '';
    if (!uid) return;
    if (!silent) setDealerScansLoading(true);
    try {
      const list = await syncUserScansFromFirestore(uid, email);
      setDealerScans(list);
    } catch (e) {
      console.debug('Load dealer scans notice:', e);
    } finally {
      if (!silent) setDealerScansLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadDealerScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser?.uid, currentUser?.email]);

  const handleDeleteDealerScan = (id: string) => {
    const uid = currentUser?.uid || activeReseller?.uid;
    setIsDeletingScanId(id);
    try {
      deleteScanResult(id, uid);
      setDealerScans(prev => prev.filter(s => s.id !== id));
      setScanActionMsg('Tarama kaydı kalıcı olarak silindi.');
      setTimeout(() => setScanActionMsg(null), 3000);
    } finally {
      setIsDeletingScanId(null);
    }
  };

  const handleClearAllDealerScans = async () => {
    if (dealerScans.length === 0) return;
    const uid = currentUser?.uid || activeReseller?.uid;
    const ok = window.confirm(`Tüm tarama kayıtlarınız (toplam ${dealerScans.length} adet) kalıcı olarak silinecek. Bu işlem geri alınamaz! Emin misiniz?`);
    if (!ok) return;
    setIsClearingDealerScans(true);
    try {
      await deleteScanRecordsByIds(dealerScans.map(s => s.id), uid);
      setDealerScans([]);
      setScanActionMsg(`Toplam ${dealerScans.length} tarama kaydı başarıyla silindi.`);
      setTimeout(() => setScanActionMsg(null), 4000);
    } catch (e) {
      console.error('Bulk delete dealer scans error:', e);
      alert('Tarama kayıtları silinirken bir hata oluştu.');
    } finally {
      setIsClearingDealerScans(false);
    }
  };

  // ---- Bayilerim tab: referred members (danisanlar/uyeler) + live credit sync ----
  const loadReferredUsersList = async (silent = false) => {
    if (!activeReseller) return;
    if (!silent) setSubResellersLoading(true);
    try {
      const data = await getReferredUsersForReseller(activeReseller.uid, activeReseller.referralCode);
      setReferredUsers(data);
    } catch (e) {
      console.debug('Load referred users notice:', e);
    } finally {
      if (!silent) setSubResellersLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'bayilerim' || !activeReseller) return;
    let cancelled = false;
    loadReferredUsersList();
    const unsub = subscribeToResellersList(list => {
      if (!cancelled) setLiveResellers(list);
    });
    return () => {
      cancelled = true;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, activeReseller?.uid, activeReseller?.referralCode]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'bayilerim') return;
    setSubResellersLoading(true);
    const byUid = new Map<string, Reseller>();
    liveResellers.forEach(r => { if (r.uid) byUid.set(r.uid, r); });
    const merged = referredUsers.map(m => {
      const live = m.uid ? byUid.get(m.uid) : undefined;
      const statusRaw = live?.status || m.dealerStatus || (m.isApproved || m.isAllowed ? 'active' : 'active');
      return {
        uid: m.uid,
        resellerName: m.fullName || live?.resellerName || 'Davet Edilen Üye',
        fullName: m.fullName,
        email: m.email || live?.email || '',
        phone: m.phone || live?.phone || '',
        referralCode: m.referralCode || live?.referralCode || '-',
        commissionRate: live?.commissionRate ?? 20,
        bankInfo: live?.bankInfo || { bankName: '', accountHolder: m.fullName || '', iban: '' },
        status: statusRaw as Reseller['status'],
        totalEarnings: live?.totalEarnings || 0,
        paidEarnings: live?.paidEarnings || 0,
        pendingEarnings: live?.pendingEarnings || 0,
        totalSalesAmount: live?.totalSalesAmount || 0,
        totalReferredUsers: live?.totalReferredUsers || 0,
        creditsBalance: Number.isFinite(live?.creditsBalance) ? live!.creditsBalance! : (m.creditsBalance ?? 100),
        totalScans: live?.totalScans || 0,
        createdAt: m.createdAt || live?.createdAt || '',
        updatedAt: live?.updatedAt || '',
      } as Reseller;
    });
    setSubResellers(merged);
    setSubResellersLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, referredUsers, liveResellers]);

  const creditColor = (c: number | undefined) => {
    if (c === undefined) return 'text-slate-400';
    if (c > 50) return 'text-emerald-300';
    if (c >= 20) return 'text-amber-300';
    return 'text-rose-300';
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      const res = await loginAsReseller(loginInput);
      if (res.success && res.reseller) {
        try {
          sessionStorage.removeItem('aurabio_reseller_manual_logged_out');
        } catch {}
        setActiveReseller(res.reseller);
        setLoginSuccess(res.message);
        setBankForm({
          bankName: res.reseller.bankInfo?.bankName || '',
          accountHolder: res.reseller.bankInfo?.accountHolder || res.reseller.resellerName,
          iban: res.reseller.bankInfo?.iban || '',
        });
        const list = await getCommissionsForReseller(res.reseller.uid);
        setCommissions(list);
        setActiveTab('overview');
      } else {
        setLoginError(res.message);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Giriş yapılamadı.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNewResellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setApplyMsg(null);

    try {
      const res = await registerNewReseller({
        resellerName: regName,
        email: regEmail,
        phone: regPhone,
        customReferralCode: regCustomCode,
        bankInfo: {
          bankName: regBankName,
          accountHolder: regAccountHolder || regName,
          iban: regIban,
        }
      });

      if (res.success && res.reseller) {
        try {
          sessionStorage.removeItem('aurabio_reseller_manual_logged_out');
        } catch {}
        setActiveReseller(res.reseller);
        setApplyMsg({ type: 'success', text: res.message });
        setBankForm(res.reseller.bankInfo);
        const list = await getCommissionsForReseller(res.reseller.uid);
        setCommissions(list);
        setTimeout(() => {
          setActiveTab('share');
        }, 1200);
      } else {
        setApplyMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setApplyMsg({ type: 'error', text: err?.message || 'Başvuru yapılamadı.' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReseller) return;

    setIsSavingBank(true);
    setBankMsg(null);

    try {
      const res = await updateResellerBankInfo(activeReseller.uid, bankForm);
      if (res.success && res.reseller) {
        setActiveReseller(res.reseller);
        setBankMsg({ type: 'success', text: res.message });
      } else {
        setBankMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setBankMsg({ type: 'error', text: err?.message || 'Banka bilgileri kaydedilemedi.' });
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeReseller) return;
    const link = generateReferralLink(activeReseller.referralCode);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!activeReseller) return;
    navigator.clipboard.writeText(activeReseller.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleLogout = () => {
    try {
      sessionStorage.setItem('aurabio_reseller_manual_logged_out', 'true');
    } catch {
      // non-blocking
    }
    setActiveResellerSession(null);
    setActiveReseller(null);
    setCommissions([]);
    setLoginInput('');
    setLoginSuccess(null);
    setLoginError(null);
    setActiveTab('overview');
    onClose();
  };

  // Filter commissions
  const filteredCommissions = commissions.filter(c => {
    if (commFilter !== 'all' && c.status !== commFilter) return false;
    if (commSearch.trim()) {
      const q = commSearch.toLowerCase();
      return (
        (c.transactionId || '').toLowerCase().includes(q) ||
        (c.userId || '').toLowerCase().includes(q) ||
        (c.packageName || '').toLowerCase().includes(q) ||
        (c.referralCode || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const referralLink = activeReseller ? generateReferralLink(activeReseller.referralCode) : '';
  const waUrl = activeReseller ? generateWhatsAppShareUrl(activeReseller.referralCode, activeReseller.resellerName) : '#';
  const tgUrl = activeReseller ? generateTelegramShareUrl(activeReseller.referralCode) : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl shadow-emerald-950/80 space-y-6 max-h-[95vh] overflow-y-auto">
        
        {/* Top Quick Navigation Bar (Geri, Ana Sayfa, Kapat & Aksiyonlar) */}
        <div className="flex items-center justify-between gap-2 pb-1">
          {/* Left: Geri and Ana Sayfa navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab !== 'overview' && activeReseller) {
                  setActiveTab('overview');
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="Önceki ekrana veya ana özete geri dön"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Geri</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-teal-500/50 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="AuraBio Ana Sayfasına Dön"
            >
              <Home className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              <span>Ana Sayfa</span>
            </button>
          </div>

          {/* Right: Quick commission / logout and close */}
          <div className="flex items-center gap-2">
            {activeReseller && (
              <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>%{activeReseller.commissionRate || 20} Komisyon</span>
              </div>
            )}
            {activeReseller && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Bayi Panelinden Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bayi Çıkışı</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Pencereyi Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                  AuraBio Bayi & Komisyon Paneli
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                  AFFILIATE v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeReseller 
                  ? `Aktif Bayi: ${activeReseller.resellerName} • Kod: ${activeReseller.referralCode}`
                  : 'Yetkili bayi ve danışmanlık gelir takip yönetim merkezi'}
              </p>
            </div>
          </div>
        </div>

        {/* If NO Active Reseller Logged In */}
        {!activeReseller ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            
            {/* Quick Reseller Login */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Kayıtlı Bayi Girişi
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Size tanımlanmış yetkili Referans Kodunuz veya kayıtlı e-posta adresiniz ile bayi panelinize güvenle erişin.
                </p>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Bayi Referans Kodu veya E-Posta:
                    </label>
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="Bayi Kodu veya ornek@bayi.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 placeholder:text-slate-600 outline-none uppercase font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? 'Giriş Doğrulanıyor...' : 'Bayi Paneline Giriş Yap'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Become a Reseller Application */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Yeni Bayilik Başvurusu & Ortaklık
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AuraBio Frekans sisteminin resmi bayisi ve çözüm ortağı olun. Üyelerinize frekans sağlarken her lisans yenilemesinden <strong className="text-emerald-400">%20-%25 komisyon</strong> kazanın.
              </p>

              {applyMsg && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  applyMsg.type === 'success' 
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                }`}>
                  {applyMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{applyMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleNewResellerSubmit} className="space-y-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">İşletme / Bayi Adı:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Örn: BioRezonans Frekans Merkezi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">E-Posta:</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="bayi@mail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Telefon / WhatsApp:</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Tercih Edilen Referans Kodu (Opsiyonel):</span>
                    <span className="text-[10px] text-slate-500">Boş bırakılırsa otomatik üretilir</span>
                  </label>
                  <input
                    type="text"
                    value={regCustomCode}
                    onChange={(e) => setRegCustomCode(e.target.value)}
                    placeholder="Örn: AURA-BAYI-4820"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 uppercase font-mono outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplying}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-950/60 transition-all flex items-center justify-center gap-2"
                >
                  {isApplying ? 'Başvuru Kaydediliyor...' : 'Bayilik Hesabını Anında Oluştur'}
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* Logged In Reseller Workspace */
          <div className="space-y-6">

            {/* OUT OF CREDITS NOTIFICATION BANNER */}
            {activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0 && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-slate-950 border border-rose-500/60 shadow-xl shadow-rose-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-rose-200">
                      Kredi Havuzunuz Bitti (0 Seans Hakkı)
                    </h4>
                    <p className="text-xs text-rose-300/80">
                      Danışanlarınıza tarama ve frekans seansı uygulayabilmek için lütfen paket satın alma talebi oluşturun.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('packages')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shrink-0 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Paket Satın Al / Kredi Yükle</span>
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Finansal Özet</span>
              </button>

              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-emerald-200 bg-emerald-950/30 border border-emerald-500/20'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Danışanlarım & Üyelerim</span>
                <span className="px-1.5 py-0.2 bg-emerald-900 text-emerald-200 border border-emerald-500/40 rounded-full text-[10px] font-mono font-bold">
                  {referredUsers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('scans')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'scans'
                    ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-md'
                    : 'text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tarama Geçmişim</span>
                <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-mono font-bold">
                  {dealerScans.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bayilerim')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'bayilerim'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                    : 'text-teal-400 hover:text-teal-200 bg-teal-950/40 border border-teal-500/30'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bayilerim & Kredi</span>
                <span className="px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-500/40 rounded-full text-[10px] font-mono font-bold">
                  {subResellers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('presentation')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'presentation'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md'
                    : 'text-indigo-400 hover:text-indigo-200 bg-indigo-950/40 border border-indigo-500/30'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>İş Sunum Raporu & Katalog</span>
                <span className="px-1.5 py-0.2 bg-indigo-900 text-indigo-200 border border-indigo-500/50 rounded-full text-[10px] font-bold">
                  PDF / Web
                </span>
              </button>

              <button
                onClick={() => setActiveTab('packages')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                    : activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0
                    ? 'text-rose-300 bg-rose-950/60 border border-rose-500/50 animate-pulse'
                    : 'text-teal-400 hover:text-teal-200 bg-teal-950/40 border border-teal-500/30'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Paket Satın Al / Kredi Yükle</span>
                {typeof activeReseller.creditsBalance === 'number' && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeReseller.creditsBalance <= 0 
                      ? 'bg-rose-900 text-rose-200 border border-rose-500/60' 
                      : 'bg-teal-950 text-teal-300 border border-teal-500/50'
                  }`}>
                    {activeReseller.creditsBalance} Seans
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('share')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'share'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Özel Davet Linki & Paylaşım</span>
              </button>

              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'commissions'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Satış & Komisyon Geçmişi</span>
                <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px]">
                  {commissions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-400 hover:text-purple-200 bg-purple-950/40 border border-purple-500/30'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Faturalarım</span>
                <span className="px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-500/40 rounded-full text-[10px] font-mono font-bold">
                  {invoices.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bank')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'bank'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Banka & IBAN Bilgileri</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & FINANCIAL METRICS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* 5 Cards Metrics including Credits Balance */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  
                  {/* Active Scan Credits Pool */}
                  <div className={`p-4 rounded-2xl border space-y-2.5 col-span-2 sm:col-span-1 shadow-lg transition-all ${
                    activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0
                      ? 'bg-gradient-to-br from-rose-950/90 to-slate-950 border-rose-500/60 shadow-rose-950/50 ring-1 ring-rose-500/40'
                      : 'bg-gradient-to-br from-teal-950/80 to-slate-950 border-teal-500/50 shadow-teal-950/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${
                        activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0
                          ? 'text-rose-300'
                          : 'text-teal-300'
                      }`}>
                        Kredi Havuzu
                      </span>
                      <Coins className={`w-4 h-4 ${
                        activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0
                          ? 'text-rose-400 animate-bounce'
                          : 'text-teal-400 animate-pulse'
                      }`} />
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl sm:text-3xl font-black font-mono ${
                        activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0
                          ? 'text-rose-400'
                          : 'text-teal-300'
                      }`}>
                        {activeReseller.creditsBalance !== undefined ? activeReseller.creditsBalance : 100}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Seans</span>
                    </div>

                    <div className="text-[10px] flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className={activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0 ? 'text-rose-400 font-bold' : 'text-teal-400/90'}>
                        {activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0 ? 'Tükendi (0 Hak)' : 'Kalan Seans Hakkı'}
                      </span>
                      <button
                        onClick={() => setActiveTab('packages')}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Paket Satın Al & Kredi Yükle"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Kredi Yükle</span>
                      </button>
                    </div>
                  </div>

                  {/* Total Sales Volume */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Toplam Oluşturulan Ciro</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
                      {(activeReseller.totalSalesAmount || 0).toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Yönlendirilen üye cirosu
                    </div>
                  </div>

                  {/* Total Earned Commission */}
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="text-xs font-bold">Kazanılan Komisyon</span>
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-300 font-mono">
                      {(activeReseller.totalEarnings || 0).toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[10px] text-emerald-400/70 font-medium">
                      %{activeReseller.commissionRate || 20} hak ediş oranı
                    </div>
                  </div>

                  {/* Paid Commission */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-teal-400">
                      <span className="text-xs font-medium">Ödenen Komisyon</span>
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-300 font-mono">
                      {(activeReseller.paidEarnings || 0).toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Hesaba aktarılan tutar
                    </div>
                  </div>

                  {/* Pending / Available Balance */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="text-xs font-medium">Bekleyen Bakiye</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                      {(activeReseller.pendingEarnings || 0).toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[10px] text-amber-400/80">
                      Transfer edilecek
                    </div>
                  </div>
                </div>

                {/* Quick Share Callout Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-950/90 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        ÖZEL DAVET KODUNUZ
                      </span>
                      <strong className="text-sm sm:text-base font-mono text-emerald-200">
                        {activeReseller.referralCode}
                      </strong>
                    </div>
                    <p className="text-xs text-slate-300">
                      Bu bağlantı üzerinden kayıt olan tüm üyelerin lisans yenilemelerinden komisyon otomatik olarak hesabınıza işlenir.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {onOpenBusinessPresentation && (
                      <button
                        onClick={onOpenBusinessPresentation}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer"
                        title="İş Sunum Raporunu ve Dijital Kataloğu Aç"
                      >
                        <BookOpen className="w-4 h-4 text-teal-200" />
                        <span>📊 İş Sunum Raporu & Katalog</span>
                      </button>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Kopyalandı!' : 'Davet Linkini Kopyala'}</span>
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>WhatsApp Paylaş</span>
                    </a>
                  </div>
                </div>

                {/* Privacy & Reseller Rules */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Gizlilik ve KVKK Kuralı:</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    AuraBio Frekans sisteminde üyelerin kişisel verileri KVKK standartları gereği korunmaktadır. Bayi panelinizde davet linkinizle kayıt olan tüm danışanlarınızın seans paketleri, onay durumları ve komisyon getirileri anlık olarak listelenir.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: DANIŞANLARIM & KAYITLI ÜYELERİM (CLIENTS & REFERRED USERS) */}
            {activeTab === 'clients' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/70 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-base font-extrabold text-slate-100">Danışanlarım & Kayıtlı Üyelerim</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
                        {activeReseller.referralCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Sizin özel referans linkiniz (<strong className="text-emerald-300">{activeReseller.referralCode}</strong>) ile kayıt olan tüm danışanlarınız doğrudan bayinize bağlıdır. Bu üyelerin tüm seans ve paket alımları komisyon havuzunuza otomatik aktarılır.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => {
                        const link = generateReferralLink(activeReseller.referralCode);
                        navigator.clipboard.writeText(link);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Davet Linki Kopyalandı!' : 'Davet Linkimi Kopyala'}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Toplam Kayıtlı Danışan</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">
                      {referredUsers.length}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Bayi davetinizle bağlanan kullanıcılar
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="text-xs font-medium">Aktif / Onaylı Danışan</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-300 font-mono">
                      {referredUsers.filter(u => u.isAllowed || u.isApproved).length}
                    </div>
                    <div className="text-[10px] text-emerald-400/80">
                      Sistemi aktif kullanan üyeler
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-1">
                    <div className="flex items-center justify-between text-teal-300">
                      <span className="text-xs font-medium">Komisyon Üreten İşlemler</span>
                      <DollarSign className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-teal-300 font-mono">
                      {commissions.length} İşlem
                    </div>
                    <div className="text-[10px] text-teal-400/80">
                      Üyelerinizin gerçekleştirdiği siparişler
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={referredUserSearch}
                      onChange={(e) => setReferredUserSearch(e.target.value)}
                      placeholder="Danışan Adı, E-Posta veya Paket Ara..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-xs text-slate-400 px-2 font-mono">
                    {referredUsers.filter(u => {
                      if (!referredUserSearch.trim()) return true;
                      const q = referredUserSearch.toLowerCase();
                      return (
                        (u.fullName || '').toLowerCase().includes(q) ||
                        (u.email || '').toLowerCase().includes(q) ||
                        (u.selectedPackage || '').toLowerCase().includes(q)
                      );
                    }).length} Danışan Bulundu
                  </span>
                </div>

                {/* Clients Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Danışan / Üye Adı</th>
                        <th className="py-3 px-4">İletişim & E-Posta</th>
                        <th className="py-3 px-4">Seçilen Paket</th>
                        <th className="py-3 px-4">Kayıt Tarihi</th>
                        <th className="py-3 px-4">Durum</th>
                        <th className="py-3 px-4 text-right">Referans Kodu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {referredUsers
                        .filter(u => {
                          if (!referredUserSearch.trim()) return true;
                          const q = referredUserSearch.toLowerCase();
                          return (
                            (u.fullName || '').toLowerCase().includes(q) ||
                            (u.email || '').toLowerCase().includes(q) ||
                            (u.selectedPackage || '').toLowerCase().includes(q)
                          );
                        })
                        .map(u => (
                          <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-100 flex items-center gap-2">
                                <span>{u.fullName || 'İsimsiz Üye'}</span>
                                {u.demoUsed && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                                    Demo
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                ID: {u.uid.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                              <div>{u.email}</div>
                              {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 font-medium text-[11px] border border-slate-700">
                                {u.selectedPackage || 'Standart Üyelik'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.isAllowed || u.isApproved ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Aktif Üye</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                  <Clock className="w-3 h-3" />
                                  <span>Beklemede</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2 py-1 rounded-md bg-emerald-950/80 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                                {u.referredByCode || activeReseller.referralCode}
                              </span>
                            </td>
                          </tr>
                        ))}

                      {referredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                                <Users className="w-6 h-6" />
                              </div>
                              <div className="space-y-1 max-w-sm">
                                <h4 className="text-sm font-bold text-slate-300">Henüz Kayıtlı Danışanınız Yok</h4>
                                <p className="text-xs text-slate-400">
                                  Size özel davet linkinizi danışanlarınızla paylaşarak kayıt olmalarını sağlayabilir ve komisyon kazanabilirsiniz.
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveTab('share')}
                                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Özel Paylaşım Linkimi Aç</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: İŞ SUNUM RAPORU & DİJİTAL KATALOG */}
            {activeTab === 'bayilerim' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-950 to-emerald-950/70 border border-teal-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-400" />
                      <h3 className="text-base font-extrabold text-slate-100">Bayilerim & Kredi Durumları</h3>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold font-mono">
                        {activeReseller.referralCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Sizin davet kodunuzla (<strong className="text-teal-300">{activeReseller.referralCode}</strong>) kayıt olan tüm danışanlarınız ve üyeleriniz ile onların seans kredi bakiyeleri burada <strong className="text-emerald-300">anlık (canlı)</strong> olarak listelenir. Her tarama anında kredi bakiyesi otomatik güncellenir.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => loadReferredUsersList()}
                      disabled={subResellersLoading}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${subResellersLoading ? 'animate-spin' : ''}`} />
                      <span>Yenile</span>
                    </button>
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CANLI SENKRONİZASYON
                    </span>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Toplam Danışan / Üye</span>
                      <Users className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono">
                      {subResellers.length}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Davet kodunuza bağlı üyeler
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                    <div className="flex items-center justify-between text-teal-300">
                      <span className="text-xs font-medium">Toplam Kalan Kredi</span>
                      <Coins className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-teal-300 font-mono">
                      {subResellers.reduce((t, r) => t + (typeof r.creditsBalance === 'number' ? r.creditsBalance : 0), 0).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-[10px] text-teal-400/80">
                      Tüm danışanlarınızın seans kredi havuzu
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="text-xs font-medium">Düşük / Yetersiz Kredi</span>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-amber-300 font-mono">
                      {subResellers.filter(r => (r.creditsBalance ?? 0) < 20).length}
                    </div>
                    <div className="text-[10px] text-amber-400/80">
                      20 seansın altında kredisi olan üyeler
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={subResellersSearch}
                      onChange={(e) => setSubResellersSearch(e.target.value)}
                      placeholder="Danışan adı, e-posta veya referans kodu ara..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-xs text-slate-400 px-2 font-mono">
                    {subResellers.filter(r => {
                      if (!subResellersSearch.trim()) return true;
                      const q = subResellersSearch.toLowerCase();
                      return (
                        (r.resellerName || r.fullName || '').toLowerCase().includes(q) ||
                        (r.email || '').toLowerCase().includes(q) ||
                        (r.referralCode || '').toLowerCase().includes(q)
                      );
                    }).length} Danışan Bulundu
                  </span>
                </div>

                {/* Sub-dealers Table */}
                {subResellersLoading && subResellers.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 p-10 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Alt bayilerinizi listeliyoruz...</span>
                  </div>
                ) : subResellers.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    Henüz davet kodunuza bağlı bir danışan / üye bulunmuyor. Davet linkinizi paylaştığınız üyeler otomatik olarak burada listelenir.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                          <th className="py-3 px-4">Danışan / Üye</th>
                          <th className="py-3 px-4">Referans Kodu</th>
                          <th className="py-3 px-4">Durum</th>
                          <th className="py-3 px-4 text-right">Kalan Kredi</th>
                          <th className="py-3 px-4 text-right">Toplam Tarama</th>
                          <th className="py-3 px-4">Kayıt Tarihi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {subResellers
                          .filter(r => {
                            if (!subResellersSearch.trim()) return true;
                            const q = subResellersSearch.toLowerCase();
                            return (
                              (r.resellerName || r.fullName || '').toLowerCase().includes(q) ||
                              (r.email || '').toLowerCase().includes(q) ||
                              (r.referralCode || '').toLowerCase().includes(q)
                            );
                          })
                          .map(r => (
                            <tr key={r.uid} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-100 flex items-center gap-2">
                                  <span>{r.resellerName || r.fullName || 'Yetkili Bayi'}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {r.email || '-'}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
                                  {r.referralCode || '-'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  r.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : ['suspended', 'rejected'].includes(String(r.status))
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}>
                                  {r.status === 'pending' ? 'Beklemede' : ['suspended', 'rejected'].includes(String(r.status)) ? 'Askıda' : 'Aktif'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-teal-500" />
                                  <span className={`text-sm font-extrabold font-mono ${creditColor(r.creditsBalance)}`}>
                                    {r.creditsBalance ?? 0}
                                  </span>
                                  <span className="text-[10px] text-slate-500">seans</span>
                                </div>
                                {(r.creditsBalance ?? 0) < 20 && (
                                  <div className="text-[10px] text-rose-400 mt-0.5">Kredi azalıyor - yükleme önerilir</div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                                {r.totalScans ?? 0}
                              </td>
                              <td className="py-3.5 px-4 text-[11px] text-slate-500">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {subResellers.filter(r => {
                      if (!subResellersSearch.trim()) return true;
                      const q = subResellersSearch.toLowerCase();
                      return (
                        (r.resellerName || r.fullName || '').toLowerCase().includes(q) ||
                        (r.email || '').toLowerCase().includes(q) ||
                        (r.referralCode || '').toLowerCase().includes(q)
                      );
                    }).length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-500">Arama sonucu bulunamadı.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scans' && (
              <div className="space-y-4">
                {/* Header + Actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/60">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Tarama Geçmişim</h3>
                      <p className="text-[11px] text-slate-400">
                        Kendi panelinizde yapılan tüm tarama kayıtları. Silme işlemi kalıcıdır ve Firestore veritabanından kaldırır.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => loadDealerScans()}
                      disabled={dealerScansLoading}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${dealerScansLoading ? 'animate-spin' : ''}`} />
                      <span>Yenile</span>
                    </button>
                    <button
                      onClick={handleClearAllDealerScans}
                      disabled={dealerScans.length === 0 || isClearingDealerScans}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        dealerScans.length > 0
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/60'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isClearingDealerScans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>Tüm Geçmişi Sil ({dealerScans.length})</span>
                    </button>
                  </div>
                </div>

                {scanActionMsg && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{scanActionMsg}</span>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={dealerScansSearch}
                    onChange={(e) => setDealerScansSearch(e.target.value)}
                    placeholder="Tarih, tarama tipi veya frekans arayın..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-rose-500 placeholder:text-slate-600"
                  />
                </div>

                {/* Records */}
                {dealerScansLoading && dealerScans.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 p-10 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    <span>Tarama kayıtlarınız yükleniyor...</span>
                  </div>
                ) : dealerScans.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    Henüz hiç tarama kaydınız bulunmuyor. Yaptığınız taramalar burada anlık olarak görünecektir.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="p-3">Tarih / Saat</th>
                          <th className="p-3">Tarama Türü</th>
                          <th className="p-3">Frekans</th>
                          <th className="p-3">Enerji</th>
                          <th className="p-3">Durum</th>
                          <th className="p-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {dealerScans
                          .filter(s => {
                            const q = dealerScansSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              (s.treatmentName || s.targetName || s.targetType || '').toString().toLowerCase().includes(q) ||
                              String(s.frequencyHz || '').includes(q) ||
                              new Date(s.timestamp).toLocaleString('tr-TR').toLowerCase().includes(q)
                            );
                          })
                          .map(s => (
                            <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                                {new Date(s.timestamp).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                  {(s.treatmentName || s.targetName || s.targetType || 'Biyo-Aura Tarama')}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-amber-300">
                                {s.frequencyHz ? `${s.frequencyHz} Hz` : '-'}
                              </td>
                              <td className="p-3 font-mono text-[11px]">
                                <span className="text-emerald-300">{s.bioEnergyLevel}%</span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${s.isAfterTreatment ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30'}`}>
                                  {s.isAfterTreatment ? 'Tedavi Sonrası' : 'Tarama'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteDealerScan(s.id)}
                                  disabled={isDeletingScanId === s.id}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer disabled:opacity-40"
                                  title="Bu tarama kaydını sil"
                                >
                                  {isDeletingScanId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {dealerScans.filter(s => {
                      const q = dealerScansSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (s.treatmentName || s.targetName || s.targetType || '').toString().toLowerCase().includes(q) || String(s.frequencyHz || '').includes(q) || new Date(s.timestamp).toLocaleString('tr-TR').toLowerCase().includes(q);
                    }).length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-500">Arama sonucu bulunamadı.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'presentation' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-950 to-teal-950/80 border border-indigo-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-base font-extrabold text-slate-100">Dijital İş Sunum Raporu & Tanıtım Kataloğu</h3>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                        ÖZEL REFERANSLI
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Danışanlarınıza, hekimlere, kliniklere veya potansiyel alt bayilerinize gönderebileceğiniz interaktif gelir simülatörlü sunum sayfası. Paylaştığınız link üzerinden kayıt olan herkes doğrudan <strong className="text-emerald-300">{activeReseller.resellerName}</strong> bayinize bağlanır.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    {onOpenBusinessPresentation && (
                      <button
                        onClick={onOpenBusinessPresentation}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Tam Ekran Sunumu Başlat</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Share URL & Buttons Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        <Share2 className="w-4 h-4" />
                        <span>Özel Sunum & Kayıt Linkiniz</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ref: {activeReseller.referralCode}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">Tıklanabilir Sunum Bağlantısı:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/?ref=${encodeURIComponent(activeReseller.referralCode)}&view=presentation` : ''}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-mono outline-none select-all"
                        />
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(`${window.location.origin}/?ref=${encodeURIComponent(activeReseller.referralCode)}&view=presentation`);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2500);
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Social Media Sharing */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🌟 AuraBio Kuantum Frekans & Biyo-Rezonans İş Sunum Raporu\n\n` +
                          `Canlı frekans taraması, çakra dengeleme ve bayilik avantajlarını interaktif kataloğumuzdan inceleyin:\n` +
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${encodeURIComponent(activeReseller.referralCode)}&view=presentation\n\n` +
                          `🎁 Bayi Referans Kodu: ${activeReseller.referralCode}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>WhatsApp'ta Paylaş</span>
                      </a>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${encodeURIComponent(activeReseller.referralCode)}&view=presentation`
                        )}&text=${encodeURIComponent('AuraBio Frekans İş Sunum Raporu')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Telegram'da Paylaş</span>
                      </a>
                    </div>
                  </div>

                  {/* Official PDF / DOC Download Card */}
                  <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Kurumsal Rapor ve Teklif Dosyaları</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Fiziki görüşmelerde ve klinik toplantılarında sunmak üzere şirket heyet onaylı teknik biyo-rezonans raporunu indirebilirsiniz.
                      </p>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-0.5">
                        <div className="text-emerald-400 font-semibold">• AKN Global Group Onaylı Resmi Format</div>
                        <div className="text-slate-400">• Biyo-Rezonans Spektrum ve Sensör Protokolleri</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => downloadTechnicalReportWord()}
                        className="py-2.5 px-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word (.doc) İndir</span>
                      </button>
                      <button
                        onClick={() => downloadTechnicalReportPDF()}
                        className="py-2.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF Formatında İndir</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Presentation Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-teal-400" />
                      <span>1. Kuantum Frekans Taraması</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      7 Çakra, 5 Letaif ve organ enerji meridyenlerinin optik analiz mekanizmasını açıklar.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>2. Şeffaf Gelir Modeli</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Seans uygulama gelirleri ve %20 referans komisyonu ile sürdürülebilir kazanç simülasyonu.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>3. Otomatik Bayi Eşleşmesi</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Linke tıklayan kullanıcılar kayıt olduğunda referans kodunuz sisteme kilitlenir ve size bağlanır.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BAYİ PAKETLERİ / KREDİ YÜKLEME (PACKAGES & CREDITS) */}
            {activeTab === 'packages' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-950 to-emerald-950/80 border border-teal-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-teal-400" />
                      <h3 className="text-base font-extrabold text-slate-100">Bayi Lisans & Seans Kredi Havuzu</h3>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Toplu seans paketleri satın alarak birim seans maliyetinizi düşürün, danışanlarınıza dilediğiniz fiyattan frekans seansı ve tarama uygulayın.
                    </p>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-teal-950/90 border border-teal-500/50 text-right shrink-0">
                    <div className="text-[10px] text-teal-400 font-semibold">Mevcut Seans Krediniz:</div>
                    <div className="text-xl font-black font-mono text-emerald-300">
                      {activeReseller.creditsBalance !== undefined ? activeReseller.creditsBalance : 100} <span className="text-xs font-normal">Kredi</span>
                    </div>
                  </div>
                </div>

                {/* Out of credits warning in Packages tab */}
                {activeReseller.creditsBalance !== undefined && activeReseller.creditsBalance <= 0 && (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 flex items-center gap-3 shadow-lg">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <strong className="block text-rose-100 font-bold">Kredi Havuzunuz Boş (0 Kalan Seans)</strong>
                      <span>Danışanlarınıza tarama ve frekans seansı uygulayabilmek için lütfen aşağıdaki paketlerden birini seçerek bakiye yükleme talebi oluşturun. Krediniz onaylandıktan sonra seans hakkınız artacaktır.</span>
                    </div>
                  </div>
                )}

                {purchaseSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-xs text-emerald-300 flex items-center gap-2 shadow-lg shadow-emerald-950/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold">{purchaseSuccessMsg}</span>
                  </div>
                )}

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {dealerPackages.map((dp) => {
                    const isPurchasing = purchasingPkgId === dp.id;
                    const isPopular = Boolean(dp.popular);

                    return (
                      <div
                        key={dp.id}
                        className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 relative overflow-hidden ${
                          isPopular
                            ? 'bg-slate-950/95 border-teal-500/60 shadow-2xl shadow-teal-950/50 ring-2 ring-teal-500/40'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-teal-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl shadow-md">
                            EN ÇOK TERCİH EDİLEN
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                              {dp.badge || 'BAYİ PAKETİ'}
                            </span>
                            <h4 className="text-lg font-black text-slate-100 mt-2">{dp.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{dp.targetAudience}</p>
                          </div>

                          {/* Price & Credit box */}
                          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                                {dp.priceText || `${dp.price} ₺`}
                              </span>
                              <span className="text-xs font-bold text-teal-300 font-mono bg-teal-950 px-2.5 py-1 rounded-xl border border-teal-500/40">
                                +{dp.scanCredits} Seans
                              </span>
                            </div>
                            <div className="text-xs text-amber-300/90 font-semibold flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>{dp.unitCostText || `${Math.round(dp.price / dp.scanCredits)} ₺ / Seans`}</span>
                            </div>
                          </div>

                          {/* Feature List */}
                          <div className="space-y-2 pt-1">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Paket Avantajları:</span>
                            {dp.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Purchase Button */}
                        <button
                          onClick={() => handleOpenOrderModal(dp)}
                          className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                            isPopular
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-950/70'
                              : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-950/50'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span>Paketi Seç & Satın Alma Talebi Oluştur</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Dealer Package Orders History for this Reseller */}
                {dealerOrders.filter(o => o.resellerId === activeReseller.uid || Boolean(o.resellerEmail && activeReseller.email && o.resellerEmail.toLowerCase() === activeReseller.email.toLowerCase())).length > 0 && (
                  <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-slate-100">Son Kredi & Paket Satın Alma Talepleriniz</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {dealerOrders.filter(o => o.resellerId === activeReseller.uid || Boolean(o.resellerEmail && activeReseller.email && o.resellerEmail.toLowerCase() === activeReseller.email.toLowerCase())).length} Sipariş
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dealerOrders
                        .filter(o => o.resellerId === activeReseller.uid || Boolean(o.resellerEmail && activeReseller.email && o.resellerEmail.toLowerCase() === activeReseller.email.toLowerCase()))
                        .map((ord) => (
                          <div key={ord.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-slate-200">{ord.id}</span>
                                <span className="font-semibold text-emerald-400">{ord.packageName} (+{ord.scanCredits} Seans)</span>
                                <span className="font-mono text-slate-300 font-bold">{ord.priceText}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                <span>Tarih: {new Date(ord.createdAt).toLocaleDateString('tr-TR')} {new Date(ord.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                {ord.paymentReference && <span>• Açıklama: <strong className="text-slate-300">{ord.paymentReference}</strong></span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {ord.status === 'pending' && (
                                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Ödeme & Yönetici Onayı Bekleniyor</span>
                                </span>
                              )}
                              {ord.status === 'approved' && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Yönetici Onayladı & Krediler Yüklendi</span>
                                  </span>

                                  <button
                                    onClick={async () => {
                                      let inv = invoices.find(i => i.orderId === ord.id);
                                      if (!inv) {
                                        inv = await createInvoiceForDealerOrder(ord);
                                      }
                                      if (inv) {
                                        setSelectedInvoice(inv);
                                        setShowInvoiceModal(true);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-md"
                                    title="Dijital E-Faturayı Görüntüle / Yazdır"
                                  >
                                    <Receipt className="w-3.5 h-3.5 text-purple-400" />
                                    <span>E-Fatura</span>
                                  </button>
                                </div>
                              )}
                              {ord.status === 'rejected' && (
                                <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Talebiniz Reddedildi</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-amber-300 block font-bold">Güvenli Ödeme & Yönetici Onay Kuralı:</strong>
                    <p className="leading-relaxed text-[11px] text-slate-400">
                      Seçilen seans ve bayilik paketlerinin ücreti şirket banka hesabımıza havale/EFT yapıldıktan sonra sistem yöneticisi tarafından incelenir. Yönetici ödemeyi onayladığı anda seans kredileriniz hesabınıza anında tanımlanır. Ücret ödenmeden veya yönetici onayı alınmadan seans hakkı yüklenmez.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: REFERRAL LINK & SHARE & MARKETING HUB */}
            {activeTab === 'share' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Top Action Header Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-teal-950/70 to-slate-950 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                        RESMİ BAYİ BAĞLANTI MERKEZİ
                      </span>
                      <strong className="text-sm sm:text-base font-mono text-emerald-200">
                        {activeReseller.referralCode}
                      </strong>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      Aşağıdaki özel bağlantılar üzerinden üyelerinize veya potansiyel danışanlarınıza tanıtım yapabilir, tüm linklerinizde bayinizin referans kodunu (<span className="text-emerald-300 font-mono font-bold">{activeReseller.referralCode}</span>) kilitli tutabilirsiniz.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setIsCardModalOpen(true)}
                      className="w-full md:w-auto px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>🪪 Dijital Kartvizit & Karekodu Aç</span>
                    </button>
                  </div>
                </div>

                {/* 4 CORE OFFICIAL MARKETING LINKS GRID */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Özel Bayi Referans Link Listesi (Tıklanabilir ve Kilitli):</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* 1. BUSINESS PRESENTATION LINK */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-teal-500/40 space-y-3 flex flex-col justify-between hover:border-teal-500/70 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                            <BookOpen className="w-4 h-4 text-teal-400" />
                            <span>1. İş Sunum Raporu & Dijital Katalog</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-semibold border border-teal-500/30">
                            Tanıtım & Rapor
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Sistemin optik biyofizik analizini, çakra/letaif haritalamasını ve gelir modelini içeren interaktif sunum linki.
                        </p>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-teal-300 truncate select-all">
                          {generateBusinessPresentationLink(activeReseller.referralCode)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateBusinessPresentationLink(activeReseller.referralCode));
                            setCopiedPresLink(true);
                            setTimeout(() => setCopiedPresLink(false), 2500);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {copiedPresLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPresLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                        </button>
                        
                        {onOpenBusinessPresentation && (
                          <button
                            onClick={onOpenBusinessPresentation}
                            className="py-2 px-2.5 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Sunumu Aç</span>
                          </button>
                        )}

                        <a
                          href={generateWhatsAppUrlForMessage(
                            `📊 *AuraBio Frekans İş Sunumu & Raporu*\n\nMerhaba! Biyo-Rezonans ve Frekans teknolojimizin iş sunum raporunu ve kataloğunu linkten inceleyebilirsiniz:\n🔗 ${generateBusinessPresentationLink(activeReseller.referralCode)}\n\n🎁 Bayi Kodu: ${activeReseller.referralCode}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* 2. TECHNICAL REPORT & DOCUMENTATION LINK */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/40 space-y-3 flex flex-col justify-between hover:border-indigo-500/70 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span>2. Teknik Rapor & Bilimsel Dökümantasyon</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                            Bilimsel Heyet
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Optik spektrometre sensör protokolleri, biyo-rezonans algoritması ve heyet onaylı teknik döküman bağlantısı.
                        </p>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300 truncate select-all">
                          {generateTechnicalReportLink(activeReseller.referralCode)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateTechnicalReportLink(activeReseller.referralCode));
                            setCopiedTechLink(true);
                            setTimeout(() => setCopiedTechLink(false), 2500);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {copiedTechLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTechLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenTechnicalReport) {
                              onOpenTechnicalReport();
                            } else {
                              downloadTechnicalReportPDF();
                            }
                          }}
                          className="py-2 px-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Raporu Gör</span>
                        </button>

                        <a
                          href={generateWhatsAppUrlForMessage(
                            `🔬 *AuraBio Frekans Teknik Dökümantasyon & Bilimsel Rapor*\n\nMerhaba! Biyo-Rezonans ve Spektrometre sistemimizin resmi teknik raporunu aşağıdaki bağlantıdan inceleyebilirsiniz:\n🔗 ${generateTechnicalReportLink(activeReseller.referralCode)}\n\n🎁 Bayi Kodu: ${activeReseller.referralCode}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* 3. DIRECT REGISTRATION LINK WITH LOCKED DEALER */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/40 space-y-3 flex flex-col justify-between hover:border-emerald-500/70 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span>3. Doğrudan Bayi & Üye Kayıt Ekranı Linki</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            🔒 Kilitli Bayi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Kullanıcı bu linke tıkladığında kayıt ekranı açılır ve bağlı olduğu bayi alanı otomatik olarak sizin adınıza kilitlenir.
                        </p>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 truncate select-all">
                          {generateRegisterLink(activeReseller.referralCode)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateRegisterLink(activeReseller.referralCode));
                            setCopiedRegLink(true);
                            setTimeout(() => setCopiedRegLink(false), 2500);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {copiedRegLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRegLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            if (onOpenAuthModal) onOpenAuthModal();
                          }}
                          className="py-2 px-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Kayıt Formu</span>
                        </button>

                        <a
                          href={generateWhatsAppUrlForMessage(
                            `✨ *AuraBio Frekans Özel Üyelik & Demo Kaydı*\n\nMerhaba! Biyo-Rezonans ve Frekans sistemimizi hemen ücretsiz test etmek ve hesabınızı oluşturmak için kayıt linkim:\n🔗 ${generateRegisterLink(activeReseller.referralCode)}\n\n🎁 Davet Kodum: ${activeReseller.referralCode}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* 4. DIGITAL BUSINESS CARD & QR CODE LINK */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-amber-500/40 space-y-3 flex flex-col justify-between hover:border-amber-500/70 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                            <QrCode className="w-4 h-4 text-amber-400" />
                            <span>4. Kişiselleştirilmiş Kartvizit & Karekod Linki</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                            Karekod & Profil
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Bayinizin resmi kimliğini, iletişim bilgilerini ve yüksek çözünürlüklü tarama karekodunu gösteren özel kartvizit web sayfası.
                        </p>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 truncate select-all">
                          {generateBusinessCardLink(activeReseller.referralCode)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateBusinessCardLink(activeReseller.referralCode));
                            setCopiedCardLink(true);
                            setTimeout(() => setCopiedCardLink(false), 2500);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {copiedCardLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCardLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                        </button>

                        <button
                          onClick={() => setIsCardModalOpen(true)}
                          className="py-2 px-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-slate-950 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Kartviziti Aç</span>
                        </button>

                        <a
                          href={generateWhatsAppUrlForMessage(
                            `🪪 *AuraBio Frekans Bayi Dijital Kartvizitim*\n\nMerhaba! Biyo-Rezonans ve Frekans Yetkili Bayi dijital kartvizitimi ve karekodumu aşağıdaki bağlantıdan görüntüleyebilirsiniz:\n🔗 ${generateBusinessCardLink(activeReseller.referralCode)}\n\n🏢 ${activeReseller.resellerName}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                  </div>
                </div>

                {/* BULK MARKETING BROADCAST CENTER (Tüm Bağlantıları İçeren Toplu Paylaşım Metni) */}
                <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Toplu Tanıtım & Yayın Bülteni (Tüm Bağlantılar Tek Metinde)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      WhatsApp Grupları, Telegram Kanalları ve Sosyal Medya Paylaşımı İçin
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line select-all max-h-56 overflow-y-auto">
                    {generateBulkMarketingMessage(activeReseller.referralCode, activeReseller.resellerName, activeReseller.phone)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        const bulkText = generateBulkMarketingMessage(activeReseller.referralCode, activeReseller.resellerName, activeReseller.phone);
                        navigator.clipboard.writeText(bulkText);
                        setCopiedBulkMessage(true);
                        setTimeout(() => setCopiedBulkMessage(false), 2500);
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {copiedBulkMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                      <span>{copiedBulkMessage ? 'Toplu Metin Kopyalandı!' : 'Toplu Tanıtım Metnini Kopyala'}</span>
                    </button>

                    <a
                      href={generateWhatsAppUrlForMessage(
                        generateBulkMarketingMessage(activeReseller.referralCode, activeReseller.resellerName, activeReseller.phone)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>WhatsApp ile Toplu Gönder</span>
                    </a>

                    <a
                      href={generateTelegramUrlForMessage(
                        generateBulkMarketingMessage(activeReseller.referralCode, activeReseller.resellerName, activeReseller.phone),
                        generateBusinessCardLink(activeReseller.referralCode)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-950"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Telegram'da Yayınla</span>
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: COMMISSIONS & TRANSACTIONS TABLE */}
            {activeTab === 'commissions' && (
              <div className="space-y-4 animate-fade-in">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={commSearch}
                      onChange={(e) => setCommSearch(e.target.value)}
                      placeholder="İşlem No, Maskeli Üye ID veya Paket Adı Ara..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {(['all', 'pending', 'approved', 'paid'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setCommFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                          commFilter === st
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st === 'all' && 'Tümü'}
                        {st === 'pending' && 'Bekleyenler'}
                        {st === 'approved' && 'Onaylananlar'}
                        {st === 'paid' && 'Ödenenler'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">İşlem ID</th>
                          <th className="py-3 px-4">Maskeli Üye</th>
                          <th className="py-3 px-4">Satın Alınan Paket</th>
                          <th className="py-3 px-4 text-right">Satış Tutarı</th>
                          <th className="py-3 px-4 text-right">Komisyon Tutarı</th>
                          <th className="py-3 px-4 text-center">Durum</th>
                          <th className="py-3 px-4 text-right">Tarih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {filteredCommissions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                              Henüz kriterlere uygun bir komisyon kaydı bulunmamaktadır.
                            </td>
                          </tr>
                        ) : (
                          filteredCommissions.map((c) => (
                            <tr key={c.transactionId} className="hover:bg-slate-900/50 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                {c.transactionId}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                                  {c.userId}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-200">
                                {c.packageName}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-slate-300">
                                {(c.amount || 0).toLocaleString('tr-TR')} ₺
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                                +{(c.commissionAmount || 0).toLocaleString('tr-TR')} ₺
                              </td>
                              <td className="py-3 px-4 text-center">
                                {c.status === 'paid' && (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                    ✓ Ödendi
                                  </span>
                                )}
                                {c.status === 'approved' && (
                                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                                    ● Onaylandı
                                  </span>
                                )}
                                {c.status === 'pending' && (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                    ⏳ Bekliyor
                                  </span>
                                )}
                                {c.status === 'rejected' && (
                                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                    ✕ Reddedildi
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                                {new Date(c.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RESELLER DİJİTAL E-FATURALAR (MY INVOICES) */}
            {activeTab === 'invoices' && (
              <div className="space-y-5 animate-fade-in">
                
                {/* Summary Header */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-teal-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-purple-400" />
                      <h3 className="text-base font-extrabold text-slate-100">Resmi Dijital E-Faturalarım</h3>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Satın aldığınız tüm bayi lisans paketleri ve seans kredisi yüklemelerinize ait %20 KDV dahil resmi dijital e-arşiv faturalarınızı buradan görüntüleyebilir, PDF olarak yazdırabilir veya WhatsApp ile paylaşabilirsiniz.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-purple-950/90 border border-purple-500/50 text-right shrink-0">
                      <div className="text-[10px] text-purple-300 font-semibold">Toplam Fatura:</div>
                      <div className="text-lg font-black font-mono text-purple-200">
                        {invoices.length} Adet
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-right shrink-0">
                      <div className="text-[10px] text-emerald-400 font-semibold">Toplam Tutar:</div>
                      <div className="text-lg font-black font-mono text-emerald-300">
                        {invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      placeholder="Fatura No (AUR-...), ETTN veya Hizmet Açıklaması ile ara..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 outline-none font-mono focus:border-purple-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={invoiceFilterStatus}
                      onChange={(e) => setInvoiceFilterStatus(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="all">Tüm Faturalar ({invoices.length})</option>
                      <option value="sent_whatsapp">WhatsApp İletilenler</option>
                      <option value="issued">Düzenlenen / E-Arşiv</option>
                    </select>
                  </div>
                </div>

                {/* Invoices List Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                          <th className="py-3 px-4 font-semibold">Fatura No & ETTN</th>
                          <th className="py-3 px-4 font-semibold">Paket & Hizmet Detayı</th>
                          <th className="py-3 px-4 font-semibold text-right">KDV Hariç</th>
                          <th className="py-3 px-4 font-semibold text-right">KDV (%20)</th>
                          <th className="py-3 px-4 font-semibold text-right">Genel Toplam</th>
                          <th className="py-3 px-4 font-semibold text-center">Tarih</th>
                          <th className="py-3 px-4 font-semibold text-center">Durum</th>
                          <th className="py-3 px-4 font-semibold text-center">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {invoices
                          .filter(inv => {
                            if (invoiceFilterStatus === 'sent_whatsapp') return inv.status === 'sent_whatsapp';
                            if (invoiceFilterStatus === 'issued') return inv.status === 'issued' || inv.status === 'sent_whatsapp';
                            return true;
                          })
                          .filter(inv => {
                            if (!invoiceSearch.trim()) return true;
                            const q = invoiceSearch.toLowerCase();
                            return (
                              (inv.invoiceNumber || '').toLowerCase().includes(q) ||
                              (inv.ettn || '').toLowerCase().includes(q) ||
                              Boolean(inv.items?.some(it => it.description && it.description.toLowerCase().includes(q)))
                            );
                          })
                          .map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-purple-300">
                                  {inv.invoiceNumber}
                                </div>
                                <div className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={inv.ettn}>
                                  {inv.ettn}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="font-bold text-slate-100">
                                  {inv.items?.[0]?.description || inv.packageName || 'Yetkili Bayi Lisansı'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {inv.packageName ? `Paket: ${inv.packageName}` : 'Lisans ve Seans Kredisi'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                                {inv.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono text-teal-400">
                                {inv.kdvTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                                {inv.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                                {new Date(inv.issueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>E-Arşiv Düzenlendi</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setShowInvoiceModal(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Faturayı Aç</span>
                                  </button>

                                  <a
                                    href={generateInvoiceWhatsAppShareUrl(inv, activeReseller.phone || '')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs transition-all cursor-pointer"
                                    title="WhatsApp İle İlet / Paylaş"
                                  >
                                    <Smartphone className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {invoices.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-slate-500 text-xs space-y-3">
                              <Receipt className="w-9 h-9 text-slate-600 mx-auto" />
                              <div className="text-slate-400 font-semibold">Henüz adınıza düzenlenmiş bir fatura bulunmamaktadır.</div>
                              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                                "Paket Satın Al / Kredi Yükle" sekmesinden satın aldığınız bayi paketleri yönetici tarafından onaylandığında resmi e-arşiv faturanız burada otomatik olarak listelenecektir.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: BANK & IBAN SETTINGS */}
            {activeTab === 'bank' && (
              <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-3">
                    <CreditCard className="w-5 h-5" />
                    <span>Komisyon Kazanç Transferi Banka Bilgileri</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kazanmış olduğunuz komisyon ödemeleri, periyodik ödeme günlerinde aşağıda belirttiğiniz resmi IBAN hesabına aktarılmaktadır.
                  </p>

                  {bankMsg && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      bankMsg.type === 'success' 
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                        : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    }`}>
                      {bankMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      <span>{bankMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveBankInfo} className="space-y-3.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Banka Adı:</label>
                      <input
                        type="text"
                        required
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        placeholder="Örn: QNB Finansbank, Ziraat Bankası, Garanti BBVA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Hesap Sahibi (Ad Soyad / Şirket Unvanı):</label>
                      <input
                        type="text"
                        required
                        value={bankForm.accountHolder}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                        placeholder="Örn: Ahmet Yılmaz veya BioRezonans Ltd."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">IBAN Numarası (TR ile başlayan 26 karakter):</label>
                      <input
                        type="text"
                        required
                        value={bankForm.iban}
                        onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-slate-100 font-mono uppercase outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingBank ? 'Kaydediliyor...' : 'Banka ve IBAN Bilgilerini Güncelle'}
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* POPUP MODAL: DEALER PACKAGE PURCHASE & BANK TRANSFER DETAILS */}
        {showOrderModal && selectedPkgForOrder && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-teal-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
              <button
                onClick={() => setShowOrderModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                  ÖDEME & YÖNETİCİ ONAY TALEBİ
                </span>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-400" />
                  <span>{selectedPkgForOrder.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Paket ücretini aşağıdaki şirket banka hesabımıza havale/EFT yaptıktan sonra talebinizi onaylayın.
                </p>
              </div>

              {/* Package Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Yüklenecek Kredi:</div>
                  <div className="text-base font-bold text-teal-300 font-mono">+{selectedPkgForOrder.scanCredits} Seans Kredisi</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Ödenecek Tutar:</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">{selectedPkgForOrder.priceText || `${selectedPkgForOrder.price} ₺`}</div>
                </div>
              </div>

              {/* Official Bank Account Information */}
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-2.5">
                <div className="flex items-center justify-between text-teal-300 text-xs font-bold">
                  <span>AuraBio Resmi Banka Hesabı:</span>
                  <span className="text-[10px] bg-teal-900/60 px-2 py-0.5 rounded text-teal-200">{BANK_INFO.bankName}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Alıcı:</span>
                    <strong className="text-slate-200">{BANK_INFO.accountHolder}</strong>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">IBAN:</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(BANK_INFO.iban)}
                        className="text-teal-400 hover:text-teal-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold break-all select-all">
                      {BANK_INFO.iban}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmOrderSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Ödeme Açıklaması / Gönderen Adı veya Dekont No (İsteğe Bağlı):
                  </label>
                  <input
                    type="text"
                    value={orderPaymentRef}
                    onChange={(e) => setOrderPaymentRef(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz Havale / Dekont No: 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    * Havale açıklamasına Bayi Kodunuzu (<strong className="text-emerald-400">{activeReseller?.referralCode}</strong>) yazmanız onay sürecini hızlandırır.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 cursor-pointer"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ödemeyi Yaptım, Onaya Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Dealer Digital Business Card & QR Code Modal */}
        {activeReseller && (
          <DealerBusinessCardModal
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            reseller={activeReseller}
          />
        )}

        {/* Dealer Digital E-Invoice View Modal */}
        {showInvoiceModal && selectedInvoice && (
          <DigitalInvoiceModal
            isOpen={showInvoiceModal}
            invoice={selectedInvoice}
            onClose={() => {
              setShowInvoiceModal(false);
              setSelectedInvoice(null);
            }}
            isAdmin={false}
          />
        )}

      </div>
    </div>
  );
};
