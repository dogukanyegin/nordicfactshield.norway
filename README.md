# Nordic FactShield — GitHub Pages

Mevcut Supabase bağlantısı korunmuş, aranabilir ve filtrelenebilir OSINT arşivi. İçerikler yeniden yazılmaz.

- Tam metin arama, Türkçe/Norveççe/İngilizce/Rusça dil filtresi.
- Alfabetik A–Z/Z–A, tarih ve dil sıralaması; 12 kayıtlık sayfalar.
- Masaüstü/mobil düzen ve okunabilir Markdown analiz görünümü.
- Yerel tasarım dosyaları, CSP, asgari dağıtım yetkileri ve kilitli bağımlılıklar.

Node.js 22.18+: `npm ci`, `npm test`, `npm run build`. Çıktı: `dist`.

Depoda Settings → Pages → Source: **GitHub Actions**. main gönderimi otomatik yayınlar. Dosyaları `.github` dâhil depo köküne koyun. Mevcut özel alan adı ayarlarını koruyun.

**Canlı veritabanı koruması ayrı uygulanır:** `security/public-readonly.sql` ve ardından `security/verify-readonly.sql`. Paketin hazırlanması canlı izinleri değiştirmez.

[Ayrıntılı kurulum, korumalar ve sınırlar](KURULUM-VE-KORUMA.md)
