# Modernize edilmiş Nordic FactShield

## Çalıştırma
Node.js 22 veya üzeri. `npm ci`, `npm run build`, ardından `npm run preview`.
Geliştirme için önce `npm run styles`, ardından `npm run dev`.
Yayınlanacak klasör: dist. Mevcut GitHub Pages iş akışı korunmuştur.

## Yapılanlar
Ana site ve analiz sayfasında ortak lacivert/turkuaz tema, mobil düzen, klavye odağı ve azaltılmış hareket desteği. Analiz metinleri, kaynaklar, dil panelleri ve kayıt içerikleri korunmuştur. Tailwind CDN betiği ve uzak fontlar kaldırılmış, CSS yerelde üretilmiştir. Analiz sayfasındaki olaylar yerel JavaScript dosyasına taşınmıştır. CSP, dış betikleri ve eval çalıştırılmasını engeller; satır içi stiller mevcut analiz görünümü için izinlidir. React kayıt metinlerini HTML olarak çalıştırmaz. Kayıt yükleme hatası boş arşiv olarak gösterilmez; yeniden deneme bulunur. Supabase oturum saklama kapalıdır. Bağımlılıklar ve kilit dosyası sabitlenmiştir.

## Canlıda uygulanması gerekenler
1. Supabase yedeği ve deneme ortamı üzerinde `security/public-readonly.sql` dosyasını inceleyip çalıştırın. Bu işlem iki istemci rolünün tabloya yazmasını engeller; yayınlama güvenilir sunucu üzerinden yapılmalıdır. Mevcut RLS kurallarını ve RPC fonksiyonlarını ayrıca denetleyin. Bu SQL canlıda çalıştırılmadı. Anon anahtarının tarayıcıda bulunması normaldir; gizli service_role anahtarı kullanmayın.
2. Bu sürüm doğrudan GitHub Pages içindir; `_headers` kullanılmaz. CSP ve referrer kuralları HTML meta etiketleriyle uygulanır. GitHub Pages üzerinden özel HTTP güvenlik başlıkları eklenemez; iframe engellemesi bu pakette etkin değildir. DDoS koruması barındırma sağlayıcısının altyapısına bağlıdır; bu paket WAF veya hız sınırı etkinleştirmez.
3. Alan adı ve GitHub hesaplarında MFA, korumalı ana dal ve gözden geçirilen dağıtım izinleri kullanın. DNS ve CDN yönetim erişimini sınırlayın.
4. CDN üzerinde DDoS koruması, WAF ve gerçek trafiğe göre hız sınırı uygulayın. Statik dosyaları önbelleğe alın; Supabase API trafiği doğrudan servise gittiğinden yalnız site CDN kuralıyla korunmaz. Gerekirse API gateway ve sunucu tarafı kota ekleyin.
5. İçerik yedekleri, geri dönüş sürümleri, erişilebilirlik izlemesi ve olay kayıtları tutun. Güncellemelerde `npm audit` ve üretim derlemesini yeniden çalıştırın.

Bu paket bütün saldırılara veya herhangi bir grubun tüm yöntemlerine karşı garanti vermez. Canlı Supabase izinleri, DNS, barındırma ve DDoS dayanıklılığı bu çalışma sırasında test edilmedi. Tasarım tarayıcıda görsel olarak doğrulanmadı; üretim derlemesi, tip kontrolü ve içerik karşılaştırması doğrulandı.

Kaynaklar: https://supabase.com/docs/guides/database/secure-data ve https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors


## GitHub Pages yayını
Depoda Settings → Pages → Build and deployment → Source: GitHub Actions seçin. ZIP içindeki proje klasörünün içeriğini (gizli `.github` klasörü dâhil) main dalına yükleyin. main push otomatik yayınlar; Actions üzerinden elle de çalıştırılabilir. Kaynak klasörünü iç içe eklemeyin.

Göreli yollar hem `kullanici.github.io/depo/` hem mevcut özel alan adı altında çalışır. Özel alan adı ayarını Settings → Pages içinde koruyun; paket DNS ayarını değiştirmez. `.nojekyll` ve Google doğrulama dosyaları dist içine alınır. Supabase bağlantısı korunur; sunucu veya Gemini anahtarı gerekmez.
