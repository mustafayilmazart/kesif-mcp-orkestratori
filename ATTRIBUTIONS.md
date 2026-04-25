# Atıflar & Yararlanılan Kaynaklar

## Bağımlılıklar

Bu proje **sıfır npm bağımlılığıyla** çalışmaya çalışır. Yalnızca Node.js standart kütüphaneleri:
- `fs` — dosya I/O
- `path` — yol yönetimi
- `os` — home directory

İsteğe bağlı (`--watch` modu için): [`chokidar`](https://github.com/paulmillr/chokidar) (MIT)

## Standart & Spesifikasyon

- **Model Context Protocol (MCP)** — © Anthropic, açık spesifikasyon, [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **JSON Schema** — IETF açık standart

## İlham Alınan Çalışmalar

Master registry pattern'ı şu projelerden ilham aldı:

- [**dotenv-vault**](https://www.dotenv.org/) — Multi-env senkronizasyon yaklaşımı
- [**direnv**](https://direnv.net/) — Environment switching pattern
- [**Mise (rtx)**](https://github.com/jdx/mise) (MIT) — Multi-tool version manager
- [**Smithery**](https://smithery.ai) — MCP marketplace ergonomi referansı

> Hiçbir kod kopyalanmamış, yalnızca yapısal ilham alınmıştır.

## MCP Kataloğu Referansları

Registry örneklerinde aşağıdaki **public MCP sunucularının** referansı yer alır (her biri kendi sahibinin lisansındadır, biz sadece **bağlantı** kuruyoruz):

- `@modelcontextprotocol/server-filesystem` — © Anthropic, MIT
- `@modelcontextprotocol/server-github` — © Anthropic, MIT
- `mcp-server-postgres` — Topluluk, MIT
- `playwright-mcp` — © Microsoft, MIT
- ...ve onlarcası

Her MCP'nin kendi repo'sunda kendi LICENSE dosyası bulunur. Bu orkestratör yalnızca **referans tutar** — kodlarını içermez.

## Markalar

"Claude" Anthropic PBC'ye, "Cursor" Anysphere Inc.'e, "VS Code" Microsoft Corp.'a aittir.
