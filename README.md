# BuddyAlert App

Minimalistische Sicherheits-App mit Community-Fokus.

## Steuerung der Puzzle-Prototyp-Szene

Im Godot-Prototyp lassen sich die aktiven Figuren nun direkt am Board transformieren:

- `R`: Figur um 90° im Uhrzeigersinn drehen.
- `Shift + R`: Figur gegen den Uhrzeigersinn drehen.
- `F`: Figur horizontal spiegeln (Flip).
- `Strg + Z`: Letzte Platzierung rückgängig machen (Undo).
- `Strg + Shift + Z` bzw. `Strg + Y`: Wiederholt die letzte Rücknahme (Redo).

Die gleichen Aktionen können optional über angebundene Buttons ausgelöst werden (`rotate`, `flip`, `undo`, `redo`).

## Manuelle Tests

1. Projekt in Godot öffnen und die Board-Szene starten.
2. Eine beliebige Figur auswählen, die Vorschau (Ghost) sollte als halbtransparente Überlagerung erscheinen.
3. `R` drücken und prüfen, dass sich Vorschau **und** Platzierung im Uhrzeigersinn drehen. Anschließend mit `Shift + R` zurückdrehen.
4. `F` drücken und sicherstellen, dass die Vorschau gespiegelt wird und der Flip auch bei einer Platzierung angewendet wird.
5. Eine Figur auf dem Board platzieren. Mit `Strg + Z` rückgängig machen und kontrollieren, dass das Feld wieder frei ist.
6. Direkt danach `Strg + Shift + Z` oder `Strg + Y` betätigen, um die Platzierung erneut herzustellen.
7. Mehrere Platzierungen hintereinander durchführen, dann mehrfach `Undo` drücken und schließlich `Redo`, um die Stapel-Funktionalität zu verifizieren.
8. Optional die an die Buttons gebundenen Aktionen betätigen und sicherstellen, dass sie dieselbe Logik wie die Hotkeys verwenden.
