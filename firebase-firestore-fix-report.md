# Firebase / Firestore Reseller Hatası Düzeltme Raporu

## Bulgular

Konsoldaki `TypeError: Cannot read properties of undefined (reading 'indexOf')` hatası, Firestore SDK’ya document path segmenti olarak `undefined` gönderilmesinden kaynaklanıyordu. Hata özellikle `getOrCreateResellerForUser()` içindeki `doc(db, 'resellers', user.uid)` çağrısında görünüyordu.

Kök neden, bayi girişinde Firestore sorgusundan alınan dokümanın yalnızca `userDoc.data()` ile kullanıcı nesnesine dönüştürülmesiydi. Eski veya `uid` alanı eksik kullanıcı dokümanlarında gerçek kimlik olan `userDoc.id` nesneye eklenmediği için sonraki reseller senkronizasyonu `undefined` kimlikle çalışıyordu. Aynı veri kaybı tekil kullanıcı profili okumalarında ve reseller koleksiyonunun okunmasında da bulunuyordu.

> Firestore’daki kullanıcı ve reseller dokümanlarının kimliği artık dokümanın kendi `doc.id` değeriyle normalize ediliyor; Firestore’a yazma işlemleri geçerli kimlik yoksa güvenli biçimde atlanıyor.

## Uygulanan düzeltmeler

| Dosya | Düzeltme |
|---|---|
| `src/utils/authManager.ts` | Giriş sorgusundaki `userDoc.data()` sonucu `{ ...data, uid: userDoc.id }` olarak normalize edildi. |
| `src/utils/authManager.ts` | `fetchMemberProfile()` ve gerçek zamanlı kullanıcı aboneliğinde `snap.id` tekrar `uid` olarak eklendi. |
| `src/utils/resellerManager.ts` | `getAllResellers()` içinde `docSnap.id`, eksik/eski `uid` alanı için güvenilir yedek kimlik olarak kullanıldı. |
| `src/utils/resellerManager.ts` | `getOrCreateResellerForUser()` geçerli kullanıcı UID’sini normalize ediyor; UID yoksa Firestore `users` ve `resellers` yazmaları yapılmıyor. |
| `src/utils/resellerManager.ts` | Geçersiz reseller UID’siyle `adminSaveReseller()` çağrısı güvenli biçimde durduruluyor. |

## Doğrulama

`npm run lint` ve `npm run build` başarıyla tamamlandı. Üretim derlemesi `firebase.json` içindeki `dist` Hosting klasörünü oluşturdu. Derleme sırasında görülen uyarılar, dinamik ve statik importların aynı modülleri paylaşması ile büyük JavaScript bundle boyutuna ilişkin performans uyarılarıdır; Firebase/Firestore path hatası değildir.

## Yeniden deploy

Proje klasöründe aşağıdaki komutları çalıştırın:

```bash
npm install
npm run build
firebase deploy --only hosting
```

Firestore kuralları veya indeksler de değiştirilecekse Hosting deploy’una ek olarak şu komut kullanılabilir:

```bash
firebase deploy --only hosting,firestore
```

Deploy sonrasında bayi girişini tekrar deneyin. Eski kullanıcı dokümanlarında `uid` alanı bulunmasa bile uygulama artık document ID’yi kullanacaktır. Firestore Rules tarafında ilgili kullanıcı ve reseller dokümanlarına yazma yetkisi yoksa bu ayrı bir `permission-denied` hatası olarak görünür; mevcut `undefined.indexOf` hatası bu düzeltmeyle oluşmamalıdır.

## Referanslar

[1]: https://firebase.google.com/docs/firestore/manage-data/add-data Firebase Firestore — Add data
[2]: https://firebase.google.com/docs/hosting/full-config Firebase Hosting — Full configuration


## Auth ve Yenileme Düzeltmeleri

Firebase Auth tarafında `ensureFirebaseAuthUser()` artık `signInAnonymously()` çağırmıyor. Uygulamanın özel bayi/üye kimlik sistemiyle eşleşmeyen anonim hesap oluşturma isteği kaldırıldı; bu nedenle `accounts:signUp` 400 isteği tetiklenmeyecek. Firebase Auth için `browserLocalPersistence` ayarlandı ve mevcut Auth oturumu varsa korunuyor.

Uygulamanın kendi local member oturumu yenilemede normalize ediliyor. App artık `aurabio_session_updated` olaylarını dinleyerek kullanıcı state’ini anında güncelliyor. Reseller paneli önce local session’dan görüntüleniyor, ardından canonical Firestore reseller dokümanı ile arka planda güncelleniyor. `doc.id` her reseller ve kullanıcı hydrate işleminde UID olarak kullanılıyor.

`npm run lint` ve `npm run build` başarıyla tamamlandı. Düzeltilmiş build tarayıcıda yeniden render edildi; başlangıç ekranı ve bayi giriş modalı açıldı. Sandbox tarayıcısında fiziksel kamera bulunmaması, kamera uyarısı dışında uygulama kaynaklı bir hata oluşturmadı.


## Yenileme Testi

Düzeltilmiş build’de sayfa yenileme işlemi uygulama arayüzünü bozmadı; bayi giriş modalı ve ana ekran yeniden render edildi. Bu test sırasında konsolda Identity Toolkit `accounts:signUp` çağrısı görülmedi. Gerçek bir bayi hesabıyla test edildiğinde local member session ve reseller session, Firestore sorgusunu beklemeden yerel cache’den yüklenmeli; canonical Firestore profil güncellemesi sonradan uygulanmalıdır.


## Stabilite ve Yenileme Doğrulaması

Firestore kalıcı yerel cache ve çoklu sekme koordinasyonu etkinleştirildi. Bayi panelindeki fatura ve sipariş canlı dinleyicileri bayi UID’sine göre hedeflendi; global koleksiyon dinlemesi yönetici görünümüne bırakıldı. Bu yaklaşım, her bayi tarayıcısının tüm fatura ve sipariş koleksiyonlarını indirmesini önleyerek eşzamanlı kullanımda gereksiz veri trafiğini azaltır.

`npm run lint` ve `npm run build` başarıyla tamamlandı. Yenilenen ön izleme uygulaması yeniden render edildi; ana ekran ve bayi giriş modalı görünür durumda kaldı. Sandbox ortamında fiziksel kamera bulunmadığı için yalnızca kamera erişim uyarısı görüldü; bu, kaynak kodu veya Firebase bağlantı hatası değildir.
