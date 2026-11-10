# Nordic FactShield — GitHub Pages + mevcut Supabase

## Yayınlama
1. Node.js 22.18 veya üzeri kullanın. `npm ci`, `npm test`, `npm run build`. Yayın çıktısı `dist` klasörüdür.
2. ZIP içindeki proje klasörünün içeriğini depo köküne yükleyin. Gizli `.github` klasörünü de yükleyin; kaynak klasörünü iç içe eklemeyin.
3. GitHub deposunda Settings → Pages → Source: **GitHub Actions**. `main` dalına gönderim otomatik yayınlar. Actions → Deploy to GitHub Pages → Run workflow ile elle de başlatılabilir.
4. Mevcut özel alan adı ve DNS ayarlarını koruyun. Pages ayarlarında Enforce HTTPS etkin olmalı. Göreli yollar hem özel alan adında hem `kullanici.github.io/depo/` adresinde çalışır.
5. Tam paket kullanın; yalnız `index.tsx` değiştirmek yeterli değildir. Bu sürüm, kaynak CSS ile derlenmiş CSS adlarının çakışmasını giderir. CSS kaynağı `theme.source.css`, üretilen dosya `public/theme.css`.

Yerel geliştirme: önce `npm run styles`, sonra `npm run dev`. Geliştirme sunucusu yalnız 127.0.0.1 üzerinden açılır. Yeni CSS sınıfı eklerken `npm run styles` yeniden çalıştırılmalıdır.

## Arşiv düzeni
Başlık, tam kayıt metni, yazar, kayıt numarası ve dosya adlarıyla arama yapılır. Birden fazla sözcük birlikte aranır. Türkçe büyük/küçük harf, aksanlar ve Norveççe karakterler aramada normalleştirilir; saklanan metin değişmez. Dil filtresi, en yeni/en eski, A–Z/Z–A ve dile göre sıralama birlikte çalışır. Sayfada 12 kayıt gösterilir. Detaydan geri dönünce filtreler ve sayfa korunur.

Dil, başlık ve metinden tahmin edilir; dil sütunu bulunmadığından etiketler kesin çeviri metadata bilgisi değildir. Yeni veya çok dilli kayıtlar belirsiz kategoriye düşebilir. Tekrarlanan kayıtlar silinmez. Tam başlık detayda gösterilir; kart başlıkları yalnız görünümde kısaltılır. Önizlemeler tekrarlanan rapor üst bilgilerini atlayabilir. Kayıt metinlerine, analizlere ve veritabanı içeriğine bu paket tarafından yazılmaz.

Mevcut Supabase okuma bağlantısı korunmuştur. Arşiv artık 500 kayıtlık API sayfalarını birleştirir; API satır sınırı nedeniyle kayıtların sessizce eksik listelenmesi önlenir. Gönderilen 468 kayıtla yapılan arayüz testleri, canlı verinin değiştirilmesi anlamına gelmez. Önceki veri redaksiyonu ayrı bir dosya çalışmasıdır ve otomatik uygulanmaz.

## Uygulanan korumalar
- Yerel CSS/JavaScript; Tailwind CDN ve uzak font çalıştırma yok.
- CSP: yalnız aynı kaynaktan betikler, satır içi olay betikleri kapalı, eval kapalı, eklenti nesneleri/iframe yükleme/form gönderimi kapalı. Veri bağlantısı yalnız aynı kaynak ve mevcut Supabase alan adı. Eski analiz sayfasının görünümünü korumak için satır içi stil öznitelikleri izinlidir; satır içi style blokları yerel CSS dosyalarına taşındı.
- Markdown ham HTML olarak çalıştırılmaz. JavaScript bağlantıları filtrelenir. Uzak görseller otomatik yüklenmez; kaynak bağlantısıyla sunulur. Yeni pencerede açılan bağlantılarda noopener/noreferrer vardır.
- Supabase tarayıcı oturum saklama, otomatik oturum yenileme ve URL oturum algılama kapalı. Arayüzde veritabanına yazan işlem yok. Yanıt yapısı doğrulanır, hata ve yeniden deneme vardır; eski hata boş arşiv gibi sunulmaz.
- Paketler kilit dosyasına bağlı. GitHub Actions sürümleri doğrulanmış tam commit SHA ile sabit. İş akışı asgari token yetkisi, kalıcı checkout kimlik bilgisi olmadan kurulum, süre sınırı, test, derleme ve moderate üzeri bağımlılık denetimi içerir. Dependabot yapılandırması paket ve Actions güncellemeleri için haftalık PR açar.

## Canlı Supabase koruması — uygulandı ve doğrulandı
`security/public-readonly.sql`, FactShield canlı projesine 10 Kasım 2026 tarihinde uygulandı. Migration: `20261110090211_harden_factshield_public_readonly_access`. Aynı dosya yeniden kurulum için pakette korunuyor. Dosya kayıt içeriğini değiştirmez. `public.factshield` tablosunda RLS'yi açar, PUBLIC/anon/authenticated tablo ve sütun yazma yetkilerini kaldırır; yalnız arşivin altı sütununa okuma verir. Ayrıca üç kısıtlayıcı politika tarayıcı rollerinin INSERT/UPDATE/DELETE işlemlerini engeller. Kalıtılmış yazma yetkisi veya RLS atlayan tarayıcı rolü görülürse işlem iptal olur. Güvenilir owner/service_role üzerinden yayınlama erişimi değiştirilmez. service_role anahtarı tarayıcıya veya GitHub deposuna eklenmemelidir; mevcut anon anahtarı herkese açık istemci anahtarıdır.

Canlı doğrulamada RLS açık, iki tarayıcı rolünde tablo/sütun yazma yetkileri ve identity sequence erişimi kapalı bulundu. 468 kayıt rol bazında okunabildi; ekleme/değiştirme/silme denemeleri hiçbir satıra dokunmayan testlerle reddedildi. İşlem öncesi/sonrası kayıt sayısı ve içerik parmak izi eşleşti. Public şemada SECURITY DEFINER fonksiyon ve Edge Function bulunmadı. Public Storage bucket indirme erişimi korundu; tarayıcı yazma politikası bulunmadı. Ayrıntılar `CANLI-KORUMA.json` içinde.

Tekrar kontrol etmek için `security/verify-readonly.sql` çalıştırılabilir: `rls_enabled=true`, yazma yetkisi sütunları `false` beklenir. Okuma erişiminin mevcut politikalarla uyumlu olduğunu kontrol edin. Son sorgu, erişilebilir SECURITY DEFINER fonksiyonlarını listeler; bunlar sahip yetkisiyle işlem yapabileceğinden tek tek incelenmelidir. Bu paket diğer tablolar, Storage, RPC fonksiyonları veya rol üyeliklerinin tam denetimi değildir.

## GitHub ve altyapı sınırları
GitHub Pages `_headers` dosyasını uygulamaz. Bu pakette sahte HTTP başlığı yapılandırması yoktur. Meta CSP gerçek olarak çalışır; fakat frame-ancestors, HSTS, X-Frame-Options ve Permissions-Policy gibi özel HTTP başlıklarının bu paketle etkinleştiği iddia edilmez. `frame-src 'none'`, sitenin kendi içine iframe yüklemesini engeller; başka sitelerin bu siteyi iframe'e almasını engellemez.

GitHub hesabı ve alan adı yönetiminde MFA, main dalında koruma/inceleme şartı, sınırlı yönetici erişimi, Pages dağıtım ortamında koruma ve yedekler kullanın. Bunlar hesap ayarıdır; bu paketi yüklemek tek başına etkinleştirmez. Supabase API'si doğrudan çağrıldığından site önündeki CDN, API'yi tek başına korumaz. DDoS, bot, kota ve maliyet saldırıları için sağlayıcı planı/kota/izleme veya ayrı API gateway gerekir. Mevcut sistemi koruma tercihi gereği yeni sunucu eklenmemiştir.

## Kontroller ve dürüst sınırlar
`DOGRULAMA.json` test sonuçlarını içerir. 468 kayıtla masaüstü/mobil görünüm, arama, beş sıralama, dil filtresi, sayfalama, geri dönüşte filtre koruma, 500 kayıt API sınırı, boş arşiv, hata/yeniden deneme, analiz sayfası etkileşimleri, XSS örneği ve satır içi betiğin CSP ile engellenmesi tarayıcıda kontrol edildi. TypeScript/derleme ve bağımlılık denetimi geçti. SQL PostgreSQL ayrıştırıcısından geçti ve koruma migration'ı canlıda uygulandı. Rol bazında okuma ve yazma reddi doğrulandı; public REST okuması HTTP 200 ile çalışmaya devam ediyor. GitHub Pages kaynak kodunun dağıtımı ve hesap/DNS ayarları bu işlemde değiştirilmedi. Mutlak güvenlik veya DDoS dayanıklılığı garantisi verilmez.

Kaynaklar:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/actions/reference/security/secure-use
- https://supabase.com/docs/guides/database/secure-data
- https://github.com/remarkjs/react-markdown#security
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors


## Kalan Auth uyarısı
Supabase güvenlik danışmanında kalan tek uyarı `auth_leaked_password_protection`: sızdırılmış parola koruması kapalı. Bu eklenti Auth yapılandırmasını güncelleme aracı sunmadığından ayar değiştirilmedi. Supabase Dashboard → Authentication → Sign In / Providers → Email bölümünde planın desteklediği sızdırılmış parola korumasını etkinleştirin. Bu ayar, sitedeki anonim arşiv okumasından ayrıdır. Kaynak: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
