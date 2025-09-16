# SumZero (Godot 4.4) – Milestone 1

SumZero ist ein rundenbasiertes Puzzle-Strategiespiel, das in Godot 4.4 mit GDScript umgesetzt wird. Dieses Repository enthält den Projektbaum ab Milestone 1.

## Projektstand
- [x] **Milestone 1:** Grundgerüst mit Szenenstruktur, Grid-Rendering und Testkachel-Platzierung.
- [ ] Milestone 2 – Legale Platzierung, Undo/Redo, Rotation/Flip.
- [ ] Milestone 3 – Spielfluss und Siegbedingungen.
- [ ] Milestone 4 – Figurenverwaltung.
- [ ] Milestone 5 – KI Level 0–2.
- [ ] Milestone 6 – Draft-Modus.
- [ ] Milestone 7 – Fog-of-War.
- [ ] Milestone 8 – Speed-Modus.
- [ ] Milestone 9 – Missionen.
- [ ] Milestone 10 – Settings und Save/Load.
- [ ] Milestone 11 – Polishing.
- [ ] Milestone 12 – Export-Profile.

## Ausführung
1. Godot 4.4.x starten.
2. Den Projektordner `sumzero/` öffnen ("Import" → Ordner auswählen).
3. Szene `scenes/Main.tscn` ausführen.

## Steuerelemente (Milestone 1)
- **Linksklick** auf das Grid: Toggle einer Testkachel.

## Dateien & Struktur
```
sumzero/
├── project.godot
├── scenes/
│   ├── Main.tscn
│   ├── board/Board.tscn
│   └── ui/UIRoot.tscn
├── scripts/
│   ├── Board.gd
│   ├── Game.gd
│   └── Shapes.gd
├── settings/default_settings.json
├── example_save.json
├── README.md
└── LICENSE
```

## Settings (Default)
| Key | Wert |
| --- | --- |
| `board_width` / `board_height` | `14` |
| `mode` | `basis` |
| `ai_level` | `2` |
| `contact_rule_corner_only` | `false` |
| `speed_turn_seconds` | `15` |
| `fog_radius` | `3` |
| `draft_budget` | `70` |

## Annahmen
- Standardbrettgröße 14×14 wird für das UI-Layout angenommen.
- Grid-Zellen sind 32px groß; spätere Milestones können eine dynamische Skalierung einführen.
- Farben sind placeholder und bereits kontrastreich gestaltet.

## Manuelle Tests (Milestone 1)
1. Projekt öffnen und `Main.tscn` starten.
2. Auf verschiedene Zellen klicken → Zellen wechseln zwischen leer und gefüllt.
3. Fenstergröße verändern → Board bleibt sichtbar im vorgesehenen Bereich.

