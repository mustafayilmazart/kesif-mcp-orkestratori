# Keşif MCP Orkestratörü

> **50+ MCP sunucusunu tek bir registry'den yöneten ve Claude Desktop / Code / Cursor arasında otomatik senkronize eden master kontrol katmanı.**
> *Single source of truth for managing 50+ MCP servers across Claude Desktop, Claude Code and Cursor.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%E2%89%A518-green)](https://nodejs.org)

---

## 🤔 Sorun

MCP ekosistemi büyüdükçe, her kullanıcı şunu yaşıyor:

- Claude Desktop'a **bir tane MCP** ekledim → Claude Code'a tekrar eklemem gerekti
- Cursor güncellendi → tüm yapılandırmalar bozuldu
- 50 MCP'm var → hangisi ne yapıyor unuttum, kategorize edilmemiş
- Dev makinem ile ev makinem **senkron değil**
- Bir API key 5 ayrı yerde duruyor, birinde değiştirdim diğerleri eski kaldı

## 💡 Çözüm

**Tek bir `mcp-registry.json`** — tüm MCP'lerin kanonik tanımı:

```json
{
  "categories": {
    "kesif-core": [
      { "name": "kesif-portal", "command": "python", "args": [...] }
    ],
    "research": [
      { "name": "pubmed", ... },
      { "name": "semantic-scholar", ... }
    ]
  }
}
```

Sonra `sync-mcp-configs.mjs` çalıştırınca:
- `~/.claude/claude_desktop_config.json` ✅
- `~/AppData/Roaming/Claude/claude_desktop_config.json` ✅
- `.cursor/mcp.json` ✅
- VS Code Claude Code config ✅

Hepsi **aynı registry'den** otomatik üretiliyor. Bir yerde değişiklik = her yerde değişiklik.

---

## ✨ Özellikler

- 📋 **Master registry** — tek JSON dosyası, kategori bazlı
- 🔄 **Multi-target sync** — Desktop, Code, Cursor, Continue, herhangi bir MCP-uyumlu istemci
- 🏷 **Kategoriler** — research, web-scraping, ai-tools, devops, content vb.
- 🔐 **Secret yönetimi** — `${ENV_VAR}` ile `.env`'den otomatik enjeksiyon
- 📊 **Dashboard** — hangi MCP'ler aktif, hangileri başarısız, son ne zaman çalıştırıldı
- 🚀 **Toplu başlatma** — `start-all-servers.bat` / `.sh`
- 📝 **CLAUDE.md generator** — registry'den otomatik kullanım kılavuzu üretir

---

## 🚀 Kurulum

```bash
git clone https://github.com/mustafayilmazart/kesif-mcp-orkestratori
cd kesif-mcp-orkestratori
npm install
cp .env.example .env  # API key'leri girin
cp registry.example.json registry.json  # kendi MCP listenizi düzenleyin
node sync-mcp-configs.mjs
```

### Hedef Yapılandırma Yolları

`config-targets.json` ile hangi istemcilere sync edileceğini ayarlayın:

```json
{
  "targets": [
    { "name": "claude-desktop", "path": "~/AppData/Roaming/Claude/claude_desktop_config.json" },
    { "name": "claude-code",    "path": "~/.claude/claude_desktop_config.json" },
    { "name": "cursor",         "path": "~/.cursor/mcp.json" }
  ]
}
```

---

## 🧭 Architecture

```
┌─────────────────────────┐
│   mcp-registry.json     │  ← Tek kaynak (canonical)
└──────────┬──────────────┘
           │
           ├──► sync-mcp-configs.mjs (transformer)
           │
   ┌───────┼───────┬────────┐
   ▼       ▼       ▼        ▼
Desktop  Code   Cursor   Custom
config   config config   targets
```

---

## 📖 Kullanım Senaryoları

### 1. Yeni MCP eklemek
`registry.json` → `categories.research` altına ekle → `node sync-mcp-configs.mjs` → Claude Desktop'ı yeniden başlat. Diğer istemciler de güncellendi.

### 2. API anahtarı değiştirmek
`.env` → tek bir yerde değiştir → tekrar sync. Hiçbir yapılandırma dosyasını manuel düzenleme.

### 3. Yeni makine kurulumu
Repo'yu klonla → `.env` doldur → sync. Tüm MCP'ler 5 dakikada hazır.

### 4. Kategorize edilmiş kullanım
> "Bana sadece **research** kategorisindeki MCP'leri aktive et"

`config-active.json` ile profil değiştirme.

---

## 🛡️ Güvenlik Modeli — "Trust Your Registry"

Bu orkestratör **registry'nizdeki her satırı çalıştırma yetkisi olarak okur**. Yani:

> ⚠️ **Registry'nize eklediğiniz her MCP, sizin makinenizde sizin yetkilerinizle çalışır.** Bilmediğiniz veya güvenmediğiniz bir kaynaktan gelen registry girdisini **asla** doğrudan eklemeyin.

**Güvenlik kuralları:**

1. **Trust whitelist** — `registry.json`'daki `command` alanları sadece bilinen, güvenilir paketler olmalı (`npx`, `python`, `uv`, vb.). Random binary path'lerden kaçının.
2. **Registry'yi versiyonlayın** — git ile takip edin; PR'lar ile gelen registry değişikliklerini **insan gözüyle** inceleyin.
3. **Target paths kullanıcının kendisinindir** — `config-targets.json`'a sadece kendi makinenizdeki yol ekleyin; otomatik network path veya symlink kullanmayın.
4. **`.env` izolasyonu** — registry'deki `${VAR_NAME}` placeholder'ları yalnızca o MCP'nin ihtiyacı olan key'leri çağırmalı. Tüm key'leri her MCP'ye geçirmeyin.
5. **GPG signing (roadmap)** — v2.0 ile registry girdilerine GPG imza eklenecek.

**Garanti:** Bu araç, **registry içeriğinin doğruluğu veya güvenliğinden sorumlu değildir**. Üçüncü taraf MCP'lerin davranışı ilgili sahibinin sorumluluğundadır.

## 📚 Atıflar

[ATTRIBUTIONS.md](ATTRIBUTIONS.md)

---

## 📄 Lisans

MIT — bkz. [LICENSE](LICENSE).
