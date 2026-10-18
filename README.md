# Blackjack-Trainer

Blackjack lernen nach österreichischen Casino-Regeln: Bei jedem Zug wird live mit den noch im Schuh verbliebenen Karten gerechnet, und wenn du falsch entscheidest, wird erklärt, warum.

## Installieren

- **iPhone/iPad:** Seite in Safari öffnen → Teilen-Symbol → „Zum Home-Bildschirm“
- **Android:** Seite in Chrome öffnen → Menü ⋮ → „App installieren“
- **PC:** Seite in Chrome oder Edge öffnen → Symbol „Installieren“ rechts in der Adressleiste

Danach läuft der Trainer auch offline. Updates kommen automatisch, sobald das Gerät online ist.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Der komplette Trainer (Rechenkern, Spiel, Oberfläche) – läuft auch per Doppelklick |
| `manifest.webmanifest`, `*.png` | Name und Symbol für die App-Installation |
| `sw.js` | Offline-Speicher (nach Änderungen an Icons/Manifest `VERSION` erhöhen) |
| `test-engine.cjs` | Test der Wahrscheinlichkeitsrechnung: `node test-engine.cjs` |
