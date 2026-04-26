# Security Policy

## Reporting / Bildirim

**bilgi@mustafayilmaz.art** — public issue açmayın / do not open public issues.

72 saat yanıt, 14 gün düzeltme hedefi.

## Trust Model — KRİTİK

> ⚠️ **Bu orkestratör registry'nizdeki her satırı çalıştırma yetkisi olarak okur.**

Registry'ye eklenen her MCP tanımı, sync çalıştığında kullanıcının makinesinde **kullanıcının yetkisiyle** çalıştırılabilir hale gelir.

### Registry'ye Asla Eklenmemesi Gerekenler

- Doğruluğunu kontrol etmediğiniz `command` alanları
- Random GitHub gist URL'leri ile çalışan komutlar (`curl ... | bash` gibi)
- Network mount edilmiş path'lerden okunan binary'ler
- `${VAR}` placeholder'ları içinde shell metakarakterleri olan değerler

### Önerilen Pratikler

1. **Registry'yi git ile versiyonlayın.** Kişisel veya ekip registry'si olmalı.
2. **PR'lar ile gelen registry değişikliklerini insan gözüyle inceleyin.**
3. **Sync log'larını saklayın** (`.kesif-sync.log`) — beklenmeyen değişiklikleri yakalamak için.
4. **`.env` izolasyonu** — registry placeholder'ları yalnızca o MCP'nin ihtiyacı olan key'leri çağırmalı.
5. **Yeni MCP eklerken `--dry-run`** modunu kullanın (`node sync-mcp-configs.mjs --dry-run`).

## API Key Sızıntısı

`.env` dosyanız asla repo'ya gitmemeli (`.gitignore`'da). Sızdığını fark ederseniz:
1. Tüm key'leri ilgili sağlayıcılardan rotate edin
2. Git history'den temizleyin (`git filter-repo`)
3. `node sync-mcp-configs.mjs` ile yeni key'leri tüm hedeflere yayın

## Supported Versions

Sadece en son major sürüm.
