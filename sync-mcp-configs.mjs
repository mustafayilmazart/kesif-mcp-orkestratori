#!/usr/bin/env node
/**
 * KEŞİF MCP Config Senkronizasyon Aracı
 * Master registry'den (registry.json) Claude Desktop ve Claude Code configlerini günceller.
 *
 * Kullanım:
 *   node sync-mcp-configs.mjs                 # registry.json'u sync et
 *   node sync-mcp-configs.mjs --dry-run       # değişiklikleri yaz, dosyalara dokunma
 *   node sync-mcp-configs.mjs --registry=path # özel registry yolu
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

// Komut satırı argümanları
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const registryArg = args.find((a) => a.startsWith('--registry='));

// Bu dosyanın bulunduğu dizin (default registry için)
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

// Registry yolu: argüman > env var > script yanındaki registry.json > registry.example.json
const REGISTRY_PATH = resolve(
  registryArg
    ? registryArg.split('=')[1]
    : process.env.KESIF_MCP_REGISTRY ||
      (existsSync(join(SCRIPT_DIR, 'registry.json'))
        ? join(SCRIPT_DIR, 'registry.json')
        : join(SCRIPT_DIR, 'registry.example.json'))
);

// .env varsa yükle (basit parser)
const ENV_FILE = join(SCRIPT_DIR, '.env');
if (existsSync(ENV_FILE)) {
  const lines = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

// Hedef yapılandırma yolları (Windows + Mac/Linux uyumlu)
const TARGETS = [
  // Claude Desktop (Windows Store)
  {
    name: 'claude-desktop-store',
    path: join(homedir(), 'AppData', 'Local', 'Packages', 'Claude_pzs8sxrjxfjjc', 'LocalCache', 'Roaming', 'Claude', 'claude_desktop_config.json'),
    format: 'claude',
    platform: 'win32',
  },
  // Claude Desktop (normal)
  {
    name: 'claude-desktop',
    path: join(homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
    format: 'claude',
    platform: 'win32',
  },
  // Claude Desktop (Mac)
  {
    name: 'claude-desktop-mac',
    path: join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    format: 'claude',
    platform: 'darwin',
  },
  // Claude Code (her platform)
  {
    name: 'claude-code',
    path: join(homedir(), '.claude', 'settings.json'),
    format: 'claude-code',
  },
  // Cursor
  {
    name: 'cursor',
    path: join(homedir(), '.cursor', 'mcp.json'),
    format: 'cursor',
  },
];

// ${VAR_NAME} placeholder'larını process.env'den çözümle
function resolveEnvVars(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_, name) => process.env[name] || `\${${name}}`);
  }
  if (Array.isArray(obj)) return obj.map(resolveEnvVars);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = resolveEnvVars(v);
    return out;
  }
  return obj;
}

// Registry'yi düz mcpServers map'ine çevir
function flattenRegistry(registry) {
  const mcpServers = {};
  for (const [_, cat] of Object.entries(registry.categories || {})) {
    for (const server of cat.servers || []) {
      const { name, ...rest } = server;
      mcpServers[name] = resolveEnvVars(rest);
    }
  }
  return mcpServers;
}

// Hedef formata uygun config üret
function buildConfig(mcpServers, format) {
  switch (format) {
    case 'claude':
    case 'cursor':
      return { mcpServers };
    case 'claude-code': {
      // Claude Code settings.json'da mcpServers alanı vardır
      return { mcpServers };
    }
    default:
      return { mcpServers };
  }
}

// Tek hedefi sync et
function syncTarget(target, mcpServers) {
  // Platform filtresi
  if (target.platform && target.platform !== process.platform) {
    return { name: target.name, status: 'skipped', reason: `platform=${target.platform}` };
  }
  // Var olmayan hedefe yazma
  if (!existsSync(target.path) && !dryRun) {
    return { name: target.name, status: 'skipped', reason: 'target not found' };
  }

  let existing = {};
  if (existsSync(target.path)) {
    try {
      existing = JSON.parse(readFileSync(target.path, 'utf8'));
    } catch {
      existing = {};
    }
  }

  const newConfig = buildConfig(mcpServers, target.format);
  // Mevcut config'in diğer alanlarını koru
  const merged = { ...existing, ...newConfig };
  const json = JSON.stringify(merged, null, 2);

  if (dryRun) {
    console.log(`\n[DRY-RUN] ${target.name} (${target.path}):`);
    console.log(json.slice(0, 500) + (json.length > 500 ? '...' : ''));
    return { name: target.name, status: 'dry-run' };
  }

  // Hedef dizin yoksa oluştur
  mkdirSync(dirname(target.path), { recursive: true });
  writeFileSync(target.path, json, 'utf8');
  return { name: target.name, status: 'synced', server_count: Object.keys(mcpServers).length };
}

// Ana akış
function main() {
  if (!existsSync(REGISTRY_PATH)) {
    console.error(`Registry bulunamadı: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  console.log(`Registry: ${REGISTRY_PATH}`);
  console.log(`Kategori sayısı: ${Object.keys(registry.categories || {}).length}`);

  const mcpServers = flattenRegistry(registry);
  console.log(`Toplam MCP: ${Object.keys(mcpServers).length}`);

  if (dryRun) console.log('\n=== DRY-RUN MODU — dosyalara yazılmayacak ===\n');

  const results = TARGETS.map((t) => syncTarget(t, mcpServers));

  console.log('\n=== Sonuç ===');
  for (const r of results) {
    const icon = r.status === 'synced' ? '✓' : r.status === 'dry-run' ? '~' : '·';
    console.log(`${icon} ${r.name}: ${r.status}${r.reason ? ` (${r.reason})` : ''}${r.server_count ? ` [${r.server_count} server]` : ''}`);
  }
}

main();
