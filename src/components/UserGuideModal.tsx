import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  Radio, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Activity, 
  Compass, 
  Sun, 
  UserCheck, 
  Download,
  Info,
  ChevronRight,
  Zap,
  Flame,
  Award,
  Mic,
  Moon,
  LifeBuoy,
  Smartphone,
  Check,
  Watch,
  Globe,
  Brain,
  Clock,
  Users,
  Repeat,
  Heart,
  Crown
} from 'lucide-react';
import { voiceAssistant } from '../utils/voiceAssistant';
import { TOTAL_HEALING_COUNT } from '../data/healingLibrary';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type GuideTab = 
  | 'steps' 
  | 'wearables' 
  | 'mindspace'
  | 'mandala_ecosystem' 
  | 'encyclopedia' 
  | 'acoustic' 
  | 'schools' 
  | 'reports_comparison'
  | 'mobile_tools' 
  | 'theory' 
  | 'tips' 
  | 'faq';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<GuideTab>('steps');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeechStep, setActiveSpeechStep] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsVoiceMuted(voiceAssistant.isMute());
    const unsubscribe = voiceAssistant.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) {
        setActiveSpeechStep(null);
      }
    });

    return () => {
      unsubscribe();
      voiceAssistant.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    voiceAssistant.stop();
    onClose();
  };

  const toggleVoiceMute = () => {
    const nextMuted = voiceAssistant.toggleMute();
    setIsVoiceMuted(nextMuted);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    voiceAssistant.setRate(rate);
  };

  // Full Narration Script
  const playFullGuide = () => {
    voiceAssistant.unlockMobileSpeech();
    const script = `AuraBio Frekans Kuantum Biyo-Rezonans ve Evrensel Kadim Şifa Sistemi Kapsamlı Kullanım Kılavuzuna hoş geldiniz. 
    Sistemimiz; canlı optik kamera spektrometresiyle insan biyo-alanını, 7 çakrayı, 5 letaif nur merkezini ve aura plazma yoğunluğunu ölçer.
    Ayrıca sistemimize entegre edilen ileri düzey teknolojiler şunlardır:
    Bir: Aura-Sync Akıllı Saat Köprüsü. Web Bluetooth ile canlı nabız ve kalp hız değişkenliği okunarak frekans dinamik optimize edilir.
    İki: MindSpace Stüdyosu. AI Yaşam Koçu Aura-Journal, 24 saatlik Biyo-Ritim Circadian senkronizasyonu, Sesli Niyet Labirenti, AI Rüya Çözümleyicisi ve Grup Aura Çemberi.
    Üç: AI Kutsal Geometri Mandala Üreticisi. Seçtiğiniz çakra ve solfejyo frekansına göre dinamik yaşam çiçeği, torus ve metatron küpü geometrileri üretilir.
    Dört: Yedi Günlük AI Bütünsel Arınma Kampları ve Küresel Frekans Isı Haritası.
    Beş: 50'den fazla biyo-alan dengesi için özel hazırlanmış Şifa Ansiklopedisi ve 10 saniyelik mikrofonlu Biyo-Akustik Ön ve Son Tarama Motoru.
    Altı: 302'den fazla frekans barındıran 6 Kadim Şifa Ekolü, 8 sekmeli entegre raporlama, dönüşüm karşılaştırma motoru, SOS Sakinleştirici ve Derin Uyku Tüneli.
    Taramalarınızı tamamlayıp canlı fotoğraflı PDF ve Word teknik raporlarınızı güvenle alabilirsiniz. Şifalı seanslar dileriz.`;

    setActiveSpeechStep(-1);
    voiceAssistant.speak(script, true);
  };

  const playSection = (stepNum: number, text: string) => {
    voiceAssistant.unlockMobileSpeech();
    setActiveSpeechStep(stepNum);
    voiceAssistant.speak(text, true);
  };

  const stopVoice = () => {
    voiceAssistant.stop();
    setActiveSpeechStep(null);
  };

  const stepTexts = [
    {
      step: 1,
      title: "1. Adım: Cihaz Girişi & Yetkili Hesap Aktivasyonu",
      desc: "Sistemi kullanmak için e-posta ve şifrenizle giriş yapın veya lisanslı üyelik hesabınızı aktive edin. Çevrimdışı mod desteği sayesinde internet kesilse dahi tüm analiz ve 302+ frekans ses sentezi kesintisiz çalışır.",
      voiceText: "Birinci Adım: Cihaz Girişi ve Yetkili Hesap Aktivasyonu. Sisteme kayıtlı kullanıcı bilgilerinizle güvenle giriş yapabilir veya üyelik paketinizi başlatabilirsiniz. Sistemimiz çevrimdışı ortamlarda dahi tam performansla çalışır."
    },
    {
      step: 2,
      title: "2. Adım: Kamerayı Konumlandırma & Akıllı İnsan Tespiti",
      desc: "Kamerayı yüzünüze ve üst bedeninize hizalayın. Sistemdeki akıllı optik güvenlik filtresi, kadrajda insan yoksa veya cansız nesne varsa taramayı kilitler. İnsan algılandığı an yeşil onay simgesi açılır.",
      voiceText: "İkinci Adım: Kamerayı Konumlandırma ve Akıllı İnsan Tespiti. Kamerayı yüzünüze hizalayın. Ortam ışığının dengeli olmasına dikkat edin. Kamera kadrajında insan olmadığı sürece tarama butonları kilitli kalacak ve ekranda Kamerayı İnsana Çevirin uyarısı belirecektir. İnsan yüzü algılandığı anda kilit kalkacaktır."
    },
    {
      step: 3,
      title: "3. Adım: Biyo-Aura Taramasını Başlatma (Optik Spektrometre)",
      desc: "'Biyo-Aura Taramasını Başlat' butonuna basın. Yaklaşık 3 saniye süren canlı spektral analiz esnasında foton matrisi, Kirlian plazma yoğunluğu, 7 çakra ve 5 letaif titreşimleri ölçülür.",
      voiceText: "Üçüncü Adım: Biyo-Aura Taramasını Başlatma. Taramayı Başlat butonuna dokunduğunuzda canlı foton spektrometresi devreye girer. Lütfen tarama süresince sabit durun. Sistem anlık olarak auranızı, baskın renk dalga boyunu ve enerji akışınızı hesaplar."
    },
    {
      step: 4,
      title: "4. Adım: 8 Sekmeli Rapor, Frekans Yükleme & Dönüşüm Karşılaştırması",
      desc: "Tarama tamamlandığında canlı fotoğrafınızın yer aldığı 8 sekmeli detaylı rapor açılır. 302+ kadim frekanstan veya Şifa Ansiklopedisinden seçim yaparak seans başlatabilir, seans bitiminde 'Öncesi vs Sonrası' dönüşüm analizini görüntüleyebilirsiniz.",
      voiceText: "Dördüncü Adım: Sekiz Sekmeli Rapor, Frekans Yükleme ve Dönüşüm Karşılaştırması. Tarama bitiminde detaylı raporunuz ekrana gelir. İsterseniz akıllı saatinizi bağlayarak canlı kalp ritminizi izleyebilir, 302'den fazla kadim frekans arasından uygun olanı seçebilir, doğa sesleri ve binaural vuruşlarla birlikte yükleyebilir, seans sonrası dönüşümü karşılaştırabilir ve PDF raporunuzu indirebilirsiniz."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-100">Kullanım Kılavuzu & Sesli Rehber</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  v5.5 Enterprise Sürüm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AuraBio Frekans, Akıllı Saat Köprüsü, MindSpace Studio, AI Mandala, 7 Günlük Kamp, Küresel Harita ve 50+ Denge Alanı Ansiklopedisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Voice Assistant Control Banner */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
              isSpeaking 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 shadow-md shadow-emerald-500/30 animate-pulse' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Türkçe Sesli Rehber Asistanı</span>
                {isSpeaking && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Seslendiriliyor...
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Tüm kılavuzu veya seçeceğiniz modülü sesli olarak dinleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* Voice Action Controls */}
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <button
                onClick={stopVoice}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Seslendirmeyi Durdur</span>
              </button>
            ) : (
              <button
                onClick={playFullGuide}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all hover:scale-105 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tüm Kılavuzu Dinle</span>
              </button>
            )}

            {/* Voice Speed Selector */}
            <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800">
              {[1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    speechRate === rate 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Mute / Unmute */}
            <button
              onClick={toggleVoiceMute}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isVoiceMuted 
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isVoiceMuted ? 'Sesli Asistanı Aç' : 'Sesli Asistanı Sessize Al'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center px-3 sm:px-6 pt-2.5 bg-slate-950/50 border-b border-slate-800 gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveSection('steps')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'steps'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>4 Adımda Kullanım</span>
          </button>

          <button
            onClick={() => setActiveSection('wearables')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'wearables'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Watch className="w-4 h-4 text-emerald-400" />
            <span>⌚ Akıllı Saat Köprüsü</span>
          </button>

          <button
            onClick={() => setActiveSection('mindspace')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'mindspace'
                ? 'bg-slate-900 text-indigo-400 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>🧠 MindSpace Studio (5 Modül)</span>
          </button>

          <button
            onClick={() => setActiveSection('mandala_ecosystem')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'mandala_ecosystem'
                ? 'bg-slate-900 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>🌌 AI Mandala & Küresel Harita</span>
          </button>

          <button
            onClick={() => setActiveSection('encyclopedia')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'encyclopedia'
                ? 'bg-slate-900 text-teal-400 border-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>🌿 Şifa Ansiklopedisi (50+)</span>
          </button>

          <button
            onClick={() => setActiveSection('acoustic')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'acoustic'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>🎙️ 10s Biyo-Akustik Tarama</span>
          </button>

          <button
            onClick={() => setActiveSection('schools')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'schools'
                ? 'bg-slate-900 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>6 Kadim Ekol ({TOTAL_HEALING_COUNT}+)</span>
          </button>

          <button
            onClick={() => setActiveSection('reports_comparison')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'reports_comparison'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Repeat className="w-4 h-4 text-emerald-400" />
            <span>📊 8 Sekmeli Rapor & Karşılaştırma</span>
          </button>

          <button
            onClick={() => setActiveSection('mobile_tools')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'mobile_tools'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Mobil & Acil Araçlar</span>
          </button>

          <button
            onClick={() => setActiveSection('theory')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'theory'
                ? 'bg-slate-900 text-blue-400 border-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kuantum Teori</span>
          </button>

          <button
            onClick={() => setActiveSection('tips')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'tips'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>İpuçları</span>
          </button>

          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'faq'
                ? 'bg-slate-900 text-indigo-400 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>SSS</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* TAB 1: 4 ADIMDA KULLANIM */}
          {activeSection === 'steps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  AuraBio Frekans sistemini en yüksek hassasiyetle kullanmak için aşağıdaki 4 adımı sırasıyla takip ediniz. Her adımın yanındaki hoparlör simgesine basarak ilgili adımı sesli olarak dinleyebilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stepTexts.map((item) => (
                  <div
                    key={item.step}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                      activeSpeechStep === item.step
                        ? 'bg-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-950/80 ring-2 ring-emerald-400/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm flex items-center justify-center">
                          {item.step}
                        </span>

                        <button
                          onClick={() => playSection(item.step, item.voiceText)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeSpeechStep === item.step
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md animate-pulse'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                          title="Bu Adımı Sesli Dinle"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{activeSpeechStep === item.step ? 'Dinleniyor' : 'Sesli Dinle'}</span>
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>

                    {item.step === 2 && (
                      <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Akıllı Güvenlik:</strong> Cansız nesnelerin taranması engellenmiştir.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AURA-SYNC AKILLI SAAT KÖPRÜSÜ (WEARABLES) */}
          {activeSection === 'wearables' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Watch className="w-5 h-5 text-emerald-400" />
                    Aura-Sync Akıllı Saat & Biyometrik Canlı Köprü (Web BLE)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Standart Bluetooth Kalp Atış Hızı Profili (GATT 0x180D) ile seans sırasında canlı nabız ve HRV takibi
                  </p>
                </div>

                <button
                  onClick={() => playSection(201, `Aura-Sync Akıllı Saat Köprüsü; Web Bluetooth API protokolü üzerinden Apple Watch, Samsung Galaxy Watch, Huawei, Xiaomi, Garmin ve standart nabız bantlarıyla kablosuz eşleşir. Seans esnasında nabzınızı ve kalp hız değişkenliğinizi anlık olarak okur. Nabzınız yükseldiğinde sistem otomatik olarak sakinleştirici 432 Hertz veya 528 Hertz rezonansına geçerek biyo-geribildirim sağlar.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">1</div>
                  <h4 className="text-sm font-bold text-slate-100">Bluetooth Cihazı Eşleştirin</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Üst menüdeki veya kamera ekranındaki <strong>"Akıllı Saat Eşleştir"</strong> butonuna tıklayın. Tarayıcınızın Bluetooth iznini onaylayarak saatinizi seçin.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">2</div>
                  <h4 className="text-sm font-bold text-slate-100">Canlı Biyometrik Telemetri</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nabız (BPM) ve Kalp Hızı Değişkenliği (HRV) verileri her saniye Web BLE GATT bildirimleriyle okunur ve ekrandaki canlı kardiyo grafiğinde akar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">3</div>
                  <h4 className="text-sm font-bold text-slate-100">Dinamik Frekans Adaptasyonu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Stres veya taşikardi algılandığında (nabız aniden yükseldiğinde) ses motoru otomatik olarak 432 Hz veya 528 Hz rahatlatıcı tonlara yumuşak geçiş yapar.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Desteklenen Cihaz Ekosistemi</span>
                  <p className="text-xs text-slate-300">
                    Apple Watch (BLE Companion), Samsung Galaxy Watch 4/5/6/7, Huawei Watch GT serisi, Xiaomi Smart Band, Garmin Forerunner / Fenix, Polar H10 ve standart göğüs bantları.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold whitespace-nowrap">
                  GATT Service: 0x180D
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MINDSPACE STUDIO (5 MODÜL) */}
          {activeSection === 'mindspace' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    MindSpace Studio — AI Zihin & Bilinçaltı Araştırma Laboratuvarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bütüncül biyo-rezonans ve terapötik metodolojiyle geliştirilen 5 entegre yapay zekâ ve biyo-frekans modülü
                  </p>
                </div>

                <button
                  onClick={() => playSection(301, `MindSpace Stüdyosu; beş temel zihinsel ve enerjetik modülden oluşur. Bir: Aura-Journal, yapay zekâ yaşam koçu ve günlük frekans günlüğüdür. İki: Circadian Senkronizatörü, 24 saatlik biyo-ritim organ saatlerini ve hormon fazlarını düzenler. Üç: Sesli Niyet Labirenti, niyetinizi ses spektrumunuzla birleştirip 7.83 Hertz Schumann rezonansıyla mühürler. Dört: AI Rüya Çözümleyicisi, rüyalarınızdaki arketipleri çözüp gece frekans protokolü sunar. Beş: Kurumsal ve Aile Çemberi, çoklu cihazların sesle eşleştiği ortak bir frekans ağı oluşturur.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Brain className="w-4 h-4" />
                    <span>1. Aura-Journal (AI Yaşam Koçu & Günlük)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Duygularınızı yazılı veya mikrofonla sesli olarak kaydedin. Yapay zekâ; duygu spektrumunuzu (huzur, kaygı, coşku, öfke), kadim arketiplerinizi (Esma, Çakra, Element) analiz eder ve size özel 7 günlük dönüşüm frekansı reçetesi hazırlar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>2. Biyo-Ritim & Circadian Synchronizer</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Geleneksel Çin Tıbbı (TCM) 24 saatlik organ enerjisi meridyenlerini (Karaciğer, Kalp, Akciğer vb.), biyolojik kortizol ve melatonin döngülerini canlı takip eder. O anki organ saatine en uygun şifa frekansını otomatik seçer.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Mic className="w-4 h-4" />
                    <span>3. Sesli & Niyetli Frekans Labirenti (Forge)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mikrofona niyetinizi okuyun. Web Audio API çoklu osilatör mimarisi sesinizin harmoniklerini ayrıştırır, 7.83 Hz Schumann yerküre rezonansıyla eşleştirir ve niyetinizi interaktif labirent üzerinde akustik olarak mühürler.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Moon className="w-4 h-4" />
                    <span>4. AI Rüya & Bilinçaltı Çözümleyicisi</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Gördüğünüz rüyayı aktarın. Jungiyen arketipler ve tasavvufi remizler süzgecinde rüyanızın bilinçaltı mesajını, bloke olan çakranızı çözer ve gece uyurken dinlemeniz için özel Delta/Teta frekansı üretir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-200">5. Kurumsal & Aile Çemberi (Group Aura Sync)</h4>
                  <p className="text-xs text-indigo-300/80 leading-relaxed mt-0.5">
                    Birden fazla kullanıcının cihazlarını ses dalgası veya QR kodla eşleyerek aynı frekans rezonansında buluşmasını sağlar. Ortak Kalp Hızı Tutarlılığı (Group Coherence) ve kolektif aura dengesini canlı olarak hesaplar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI MANDALA, 7 GÜNLÜK KAMP & KÜRESEL HARİTA */}
          {activeSection === 'mandala_ecosystem' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    AI Kutsal Geometri Mandala, 7 Günlük Kamp & Küresel Isı Haritası
                  </h3>
                  <p className="text-xs text-slate-400">
                    Görsel ve kolektif frekans sentezi ile global biyo-rezonans ekosistemi
                  </p>
                </div>

                <button
                  onClick={() => playSection(401, `AI Kutsal Geometri Mandala Üreticisi; seçtiğiniz çakra ve solfejyo frekansına göre dinamik Yaşam Çiçeği, Torus ve Metatron Küpü geometrileri çizer. 7 Günlük Kamp; Sabah, Öğle ve Gece adımlarıyla çakralarınızı dengeler. Küresel Harita ise dünya genelindeki canlı frekans seanslarını ve kolektif niyet yayılımını görselleştirir.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-bold text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Kutsal Geometri Mandala</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    HTML5 Canvas ile frekans dalga boyuna göre canlı çizilen Yaşam Çiçeği, Torus, Sri Yantra ve Metatron Küpü. Meditasyon sırasında görsel odaklanma sağlar, yüksek çözünürlüklü PNG ve PDF olarak indirilebilir.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-teal-400 font-bold text-sm flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>7 Günlük AI Bütünsel Kamplar</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kök Çakradan Taç Çakraya 7 gün boyunca Sabah (Uyanış & Enerji), Öğle (Hizalanma & Odak) ve Gece (Hücresel Detoks & Uyku) mikro seanslarıyla yapılandırılmış tam arınma protokolü.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <span>Anonim Küresel Isı Haritası</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dünya genelinde o anda frekans dinleyen kullanıcıların anonim rezonans düğümlerini gösterir. Kolektif niyet yayınına katılarak küresel barış ve şifa alanını güçlendirebilirsiniz.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-2 sm:col-span-2">
                  <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span>Kapsamlı Üye Paneli (Member Dashboard) & Kalan Süre Takibi</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tüm üyelerimiz sağ üstteki profil simgesinden veya menüden <strong>Üye Paneli</strong>'ne ulaşabilir. Panel üzerinden:
                    (1) Aktif paket ve canlı gün/saat/dakika/saniye kalan süre sayacı, (2) Tek tıkla paket yenileme ve süre uzatma mağazası, (3) Güvenli profil, e-posta, telefon ve şifre güncelleme, (4) Geçmiş fatura, sipariş ve dekont bildirimleri, (5) Bulutta saklanan tüm aura tarama ve biyo-akustik seans kayıtları eksiksiz yönetilebilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ŞİFA ANSİKLOPEDİSİ (50+ DENGE ALANI) */}
          {activeSection === 'encyclopedia' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    🌿 Kadim Şifa Ansiklopedisi & 50+ Biyo-Denge Frekans Matrisi
                  </h3>
                  <p className="text-xs text-slate-400">
                    6 ana kategoride 50'den fazla biyo-alan dengesizliği için bilimsel ve kadim temelli frekans protokolleri
                  </p>
                </div>

                <button
                  onClick={() => playSection(501, `Şifa Ansiklopedisi; Nörolojik, Dolaşım, Metabolik, Duygusal-Ruhsal, İskelet-Kas ve Canlılık alanlarında 50'den fazla dengesizlik için frekans protokolünü içerir. Her alanın Solfejyo, Rife ve Kadim makam frekansları, seans süreleri ve 3 aşamalı dengeleme takvimi sistemde mevcuttur.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-300">1. Zihinsel & Nöral Denge (8 Alan)</div>
                  <p className="text-[11px] text-slate-400">Baş Basıncı, Gerilim, Zihinsel Yorgunluk, Uyku Düzensizliği, Huzursuz Bacak Hissi, Denge Kaybı vb.</p>
                  <div className="text-[10px] text-emerald-400 font-mono">174 Hz, 432 Hz, 528 Hz • Rast Makamı</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-teal-300">2. Dolaşım & Kalp Tutarlılığı (7 Alan)</div>
                  <p className="text-[11px] text-slate-400">Damar Esnekliği, Nabız Hızı Dengesi, Ekstremite Isınması, Ritim Uyumu vb.</p>
                  <div className="text-[10px] text-teal-400 font-mono">528 Hz, 432 Hz, 639 Hz • Rehavi Makamı</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-cyan-300">3. Metabolik & Sindirim Arınması (8 Alan)</div>
                  <p className="text-[11px] text-slate-400">Hassas Sindirim, Enerji Metabolizması, Karaciğer Arınması, Mide Rahatlaması vb.</p>
                  <div className="text-[10px] text-cyan-400 font-mono">417 Hz, 528 Hz, 317.8 Hz • Hicaz Makamı</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-purple-300">4. Duygusal & Ruhsal Bütünlük (8 Alan)</div>
                  <p className="text-[11px] text-slate-400">Ani Yoğun Kaygı, Yaygın Gerilim, Düşük Yaşam Sevinci, Kronik Zihinsel Tükenmişlik vb.</p>
                  <div className="text-[10px] text-purple-400 font-mono">528 Hz, 432 Hz, Schumann 7.83 Hz • Uşşak Makamı</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-amber-300">5. Beden & Kas Rahatlaması (8 Alan)</div>
                  <p className="text-[11px] text-slate-400">Kas Tutulması, Sırt & Boyun Gerginliği, Eklem Esnekliği, Dokusal Denge vb.</p>
                  <div className="text-[10px] text-amber-400 font-mono">174 Hz, 285 Hz, 528 Hz • Hüseyni Makamı</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-rose-300">6. Biyo-Kalkan & Canlılık (11 Alan)</div>
                  <p className="text-[11px] text-slate-400">Düşük Canlılık, Mevsimsel Hassasiyet, Negatif Enerji Yükü, Ruhsal Blokaj Arınması vb.</p>
                  <div className="text-[10px] text-rose-400 font-mono">741 Hz, 852 Hz, 963 Hz • Şamanik Teta</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 10S BİYO-AKUSTİK TARAMA */}
          {activeSection === 'acoustic' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-cyan-400" />
                    🎙️ 10 Saniyelik Ön / Son Biyo-Akustik Tarama Motoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vokal spektrometre ve frekans rezonans analizi ile hücresel titreşim ölçümü
                  </p>
                </div>

                <button
                  onClick={() => playSection(601, `On saniyelik biyo-akustik tarama; mikrofonunuz aracılığıyla ses tonunuzdaki harmonikleri, formantları ve temel titreşim frekansınızı analiz eder. Seans öncesinde Pre-Scan kaydı, seans sonrasında Post-Scan kaydı alarak hücresel rezonans gelişimini somut grafiklerle karşılaştırır.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-100">Nasıl Kullanılır?</h4>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li><strong>Mikrofon İzni:</strong> Tarayıcınızın mikrofon erişimine izin verin.</li>
                  <li><strong>Ön Tarama (Pre-Scan):</strong> Seansa başlamadan önce mikrofona 10 saniye boyunca sabit bir sesli harf (örn: "Aaaa" veya "Oooom") çıkarın ya da niyetinizi okuyun.</li>
                  <li><strong>Frekans Seansı:</strong> Önerilen frekansı dinleyin ve meditasyon yapın.</li>
                  <li><strong>Son Tarama (Post-Scan):</strong> Seans bitiminde tekrar 10 saniyelik ses kaydı vererek ses harmoniklerinizin nasıl dengelendiğini ekrandaki karşılaştırma raporundan görün.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 7: 6 KADİM ŞİFA EKOLÜ */}
          {activeSection === 'schools' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Evrensel 6'lı Kadim Şifa Kütüphanesi ({TOTAL_HEALING_COUNT}+ Frekans)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dünya medeniyetlerinin şifa mirası matematiksel frekanslarla tek kütüphanede
                  </p>
                </div>

                <button
                  onClick={() => playSection(701, `Sistemimizde 302'den fazla frekans barındıran altı kadim şifa ekolü bulunmaktadır. Bir: İslami Esma ve Şifa Sureleri. İki: Uzak Doğu Yedi Çakra ve Solfejyo frekansları. Üç: Beş Element ve Schumann Rezonansı. Dört: Anadolu Sufi Mûsikîsi yirmi beş makam terapisi. Beş: Şamanik Davul Teta Transı. Altı: Keltik ve İskandinav Rün akustiği.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-300 text-xs">1. İslami Kadim Şifa (52 Frekans)</div>
                  <p className="text-xs text-slate-400">Ebced hesaplı 99 Esma-ül Hüsna (Ya Şafi 391 Hz, Ya Vedud 432 Hz), Şifa Sureleri, 4-7-8 zikir nefesi.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-teal-300 text-xs">2. Uzak Doğu 7 Çakra & Solfejyo (50 Frekans)</div>
                  <p className="text-xs text-slate-400">174 Hz'den 963 Hz'e Solfejyo oktavları, 7 temel çakra Bija mantraları, Tibet çanakları.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300 text-xs">3. 5 Kadim Element & Doğa (50 Frekans)</div>
                  <p className="text-xs text-slate-400">Toprak (194 Hz), Su (417 Hz), Ateş (528 Hz), Hava (639 Hz), Eter (741 Hz) ve 7.83 Hz Schumann rezonansı.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 text-xs">4. Anadolu Sufi Mûsikîsi (50 Frekans)</div>
                  <p className="text-xs text-slate-400">Selçuklu ve Osmanlı darüşşifalarında uygulanan 25 makam terapisi (Rast, Hicaz, Nihavend, Buselik vb.) ve Ney tınıları.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-rose-300 text-xs">5. Şamanik Davul Transı (50 Frekans)</div>
                  <p className="text-xs text-slate-400">Beyni 4.5 Hz derin Teta bandına çeken 120-135 BPM monoritmik davul vuruşları ve Altay ateş akustiği.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-300 text-xs">6. Kelt & İskandinav Akustiği (50 Frekans)</div>
                  <p className="text-xs text-slate-400">13 Kutsal Kelt ağacı (Ogham), gümüş telli Keltik arp, Tagelharpa yaylısı ve Futhark rün koruması.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: 8 SEKME RAPOR & KARŞILAŞTIRMA */}
          {activeSection === 'reports_comparison' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-emerald-400" />
                    8 Sekmeli Detaylı Rapor & Dönüşüm Karşılaştırma Analizi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kapsamlı biyo-rezonans analiz raporu, yüklenen şifa frekansının doğrulanması ve öncesi/sonrası kıyaslaması
                  </p>
                </div>

                <button
                  onClick={() => playSection(801, `Raporlama motorumuz; sekiz sekmeli zengin bir yapı sunar. İlim Kapı, Genel Bakış, Duygular, Aura Katmanları, Çakralar, Letaifler, Kişisel Reçeteler ve Tüm İnovasyonlar sekmelerinden oluşur. Seansınız bittiğinde yüklediğiniz frekans rapora otomatik işlenir ve Öncesi Sonrası Karşılaştırma raporu ile enerjinizdeki somut artış görselleştirilir.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-100">8 Rapor Sekmesinin İçeriği:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>1. İlim Kapı:</strong> Manevi ve ezoterik kökenler</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>2. Genel Bakış:</strong> Canlılık indeksi, aura gücü ve kuantum yaşı</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>3. Duygular:</strong> 4 temel duygu durumu ve zihinsel berraklık</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>4. Aura Katmanları:</strong> Eterik, Duygusal ve Zihinsel kalkan</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>5. Çakralar:</strong> 7 çakranın enerji yüzdeleri ve blokajları</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>6. Letaifler:</strong> Tasavvufi 5 nur merkezinin nuraniyet analizi</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>7. Kişisel Protokoller:</strong> Önerilen şifa esmaları, mantraları ve beslenme</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"><strong>8. Tüm İnovasyonlar:</strong> Saat köprüsü, mandala, harita ve kamp entegrasyonu</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: MOBİL & ACİL ARAÇLAR */}
          {activeSection === 'mobile_tools' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    Mobil Ergonomi, SOS Sakinleştirici & Uyku Tüneli
                  </h3>
                  <p className="text-xs text-slate-400">
                    Akıllı telefonlar için optimize edilmiş başparmak alt navigasyonu ve acil durum araçları
                  </p>
                </div>

                <button
                  onClick={() => playSection(901, `Mobil ergonomi özellikleri; telefonlarda tek elle rahat kullanım için tasarlanmış başparmak alt navigasyon çubuğu, anlık taşikardi ve panik durumunda altmış saniyede sakinleştiren dört yüz otuz iki Hertz SOS modu ve gece uykusuzluğu için Delta beyin dalgası uyku tünelini içerir.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Bu Bölümü Dinle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Başparmak Alt Navigasyonu</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mobil cihazlarda ekranın alt kısmına sabitlenen hızlı erişim çubuğu ile Kamera, Letaif, Doğu Tıbbı, Şifa Matrisi ve MindSpace arasında tek dokunuşla geçiş yapabilirsiniz.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                    <LifeBuoy className="w-4 h-4" />
                    <span>🚨 SOS Acil Durum (432 Hz)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ani panik, taşikardi veya nefes darlığında tek tıkla 60 saniyelik 432 Hz kalp rezonansı ve ritmik diyafram nefes animasyonu başlatır.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-bold text-sm flex items-center gap-1.5">
                    <Moon className="w-4 h-4" />
                    <span>🌙 Derin Uyku Tüneli (Delta)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gece uykusuzluğu çekenler için 0.5-3.5 Hz Delta beyin dalgası biyo-senkronizasyonu, yağmur ve ney katmanları eşliğinde otomatik kapanma zamanlayıcısı sunar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: KUANTUM TEORİ */}
          {activeSection === 'theory' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-950/30 rounded-2xl border border-blue-900/40">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Optik Foton Spektrometresi ve Biyo-Plazma Fiziği
                </h3>
                <button
                  type="button"
                  onClick={() => playSection(10, `Kuantum Biyo-Plazma Teorisi. Canlı hücreler ultra zayıf biyofoton ışığı yayar. Fritz-Albert Popp ve Kirlian araştırmaları hücrelerin yaydığı ışığın biyo-enerjiyi yansıttığını kanıtlamıştır. AuraBio sistemi RGB ve HSV renk dalga boylarını tarayarak 7 çakra ve 5 letaif nur merkeziyle eşleştirir ve eksik frekansları Solfejyo harmonikleriyle dengeler.`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSpeechStep === 10 && isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeSpeechStep === 10 && isSpeaking ? 'Durdur' : 'Bu Bölümü Seslendir'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                İnsan vücudu biyolojik olarak ultra zayıf foton emisyonu (Biophotons) yayar. Fritz-Albert Popp ve Semyon Kirlian'ın araştırmaları, canlı hücrelerin ışık yaydığını ve bu ışığın organizmanın sağlık ve enerji durumunu yansıttığını kanıtlamıştır.
              </p>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="text-emerald-400 font-bold">AuraBio Matematiksel Modeli:</div>
                <p>1. <strong>RGB / HSV Renk Spektrumu Dönüşümü:</strong> Cilt ve baş çevresindeki mikroskobik renk dalga boyu değişimleri taranır.</p>
                <p>2. <strong>Foton Akı Yoğunluğu:</strong> Işık saçılma katsayıları hesaplanarak 7 çakra ve 5 letaif noktasıyla eşleştirilir.</p>
                <p>3. <strong>Rezonans Harmonikleri:</strong> Eksik dalga boyları tespit edilerek Solfejyo, Esma veya Sufi makam frekanslarıyla tamamlanır.</p>
              </div>
            </div>
          )}

          {/* TAB 11: İPUÇLARI */}
          {activeSection === 'tips' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-950/30 rounded-2xl border border-amber-900/40">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  En Yüksek Doğruluk İçin Uygulama İpuçları
                </h3>
                <button
                  type="button"
                  onClick={() => playSection(11, `En yüksek doğruluk için ipuçları. Bir: Doğal ve dengeli ışık kullanın. İki: Tarama süresince üç saniye sabit kalın ve burnunuzdan derin nefes alın. Üç: Binaural vuruşların beyninizde rezonans oluşturması için stereo kulaklık takın. Dört: Seans öncesinde hücresel iletkenliği artırmak için bir bardak su için.`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSpeechStep === 11 && isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeSpeechStep === 11 && isSpeaking ? 'Durdur' : 'Bu Bölümü Seslendir'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-300 text-xs">☀️ Doğal ve Dengeli Işık</div>
                  <p className="text-xs text-slate-400">Karanlık veya aşırı parlak ortamlar yerine yüzünüzü eşit aydınlatan doğal gün ışığı tercih edin.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-teal-300 text-xs">🧘 Sabit Duruş ve Derin Nefes</div>
                  <p className="text-xs text-slate-400">Tarama boyunca 3 saniye sabit kalın ve burnunuzdan derin nefes alarak rahatlayın.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300 text-xs">🎧 Stereo Kulaklık Kullanımı</div>
                  <p className="text-xs text-slate-400">Binaural vuruşların (iki kulak arasındaki Hertz farkı) beyinde tam rezonans oluşturması için kulaklık önerilir.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-300 text-xs">💧 Seans Öncesi Su Tüketimi</div>
                  <p className="text-xs text-slate-400">Vücut sıvılarının hücresel iletkenliği artırması için frekans seansından önce 1 bardak ılık su için.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SSS */}
          {activeSection === 'faq' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-950/30 rounded-2xl border border-indigo-900/40">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  Sıkça Sorulan Sorular (SSS)
                </h3>
                <button
                  type="button"
                  onClick={() => playSection(12, `Sıkça Sorulan Sorular. Birinci soru: AuraBio tıbbi bir teşhis cihazı mıdır? Cevap: Hayır, AuraBio tıbbi teşhis ve tedavi cihazı olmayıp biyo-rezonans ve zihinsel rahatlama yazılımıdır. İkinci soru: İnternet kesilirse çalışır mı? Cevap: Evet, tüm kamera spektrometresi ve frekans sentezi çevrimdışı çalışır. Üçüncü soru: Akıllı saat zorunlu mu? Cevap: Hayır, akıllı saat opsiyonel biyometrik destektir.`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSpeechStep === 12 && isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{activeSpeechStep === 12 && isSpeaking ? 'Durdur' : 'Bu Bölümü Seslendir'}</span>
                </button>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 text-xs">Soru: AuraBio tıbbi bir teşhis cihazı mıdır?</div>
                <p className="text-xs text-slate-400">Cevap: Hayır, AuraBio tıbbi bir teşhis veya tedavi cihazı değil; biyo-rezonans, zihinsel rahatlama ve manevi denge destek yazılımıdır.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 text-xs">Soru: İnternetim kesilirse sistem çalışır mı?</div>
                <p className="text-xs text-slate-400">Cevap: Evet! AuraBio PWA ve yerel motor mimarisine sahiptir. Tüm kamera analizleri, Web Audio ses sentezi ve PDF üretimi cihazınızda çevrimdışı olarak çalışır.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 text-xs">Soru: Akıllı saat olmadan kullanabilir miyim?</div>
                <p className="text-xs text-slate-400">Cevap: Elbette. Akıllı saat köprüsü opsiyonel bir biyometrik destektir; saat olmadan da kamera ve mikrofonla tam tarama yapabilirsiniz.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AKN GLOBAL GROUP LTD • AuraBio Frekans Kuantum Biyo-Rezonans Sistemi</span>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
