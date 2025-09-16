# BuddyAlert App

Minimalistische Sicherheits-App mit Community-Fokus.

## Steuerung & Spielfunktionen

Die Godot-Boardszene unterstützt jetzt eine flexible Vorschau sowie Undo/Redo.

* **Rotation & Flip**: `R` rotiert das aktuelle Shape im Uhrzeigersinn, `F` spiegelt es horizontal.
* **Verschieben**: Mit den Pfeiltasten wird die Ghost-Vorschau pro Feld bewegt. Ungültige Positionen färben sich rot.
* **Platzieren**: `Enter` oder `Leertaste` setzen die Figur, sofern der Platz frei und im Board liegt.
* **UI-Buttons**: Die Buttons „Rotate“, „Flip“, „Undo“ und „Redo“ im BottomBar-Panel rufen die gleichen Funktionen auf.

## Manuelle Testschritte

1. **Platzierungsprüfung**
   1. Wähle einen Shape (`square`, `line`, `l`, `t`) und bewege ihn an den Rand.
   2. Vergewissere dich, dass die Vorschau rot wird, sobald der Shape das Board verlässt oder eine belegte Zelle überlappt.
   3. Bestätige, dass das Setzen (`Enter` oder Button) in diesem Zustand verweigert wird.
2. **Undo/Redo**
   1. Platziere mehrere Shapes.
   2. Betätige „Undo“ (Button oder `Ctrl+Z`) und prüfe, dass der letzte Zug zurückgenommen wird.
   3. Betätige „Redo“ (Button, `Ctrl+Y` oder `Ctrl+Shift+Z`) und kontrolliere, dass der entfernte Shape wieder erscheint.
3. **Ghost-Vorschau**
   1. Rotiere (`R`) und flippe (`F`) das aktuelle Shape; die Vorschau soll die Änderung direkt darstellen.
   2. Verschiebe die Figur mit den Pfeiltasten und beobachte, wie die transparente Vorschau die Zielposition anzeigt.
   3. Bestätige, dass die Vorschau nach jeder Platzierung automatisch auf der aktuellen Shape-Konfiguration bleibt.
