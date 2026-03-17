# BugBoard26 - Software Requirements Specification (SRS)

## Struttura Modulare del Documento

Questo documento SRS è organizzato in una struttura modulare per facilitare manutenzione, collaborazione e aggiornamenti incrementali.

### Struttura Directory

BugBoard26-SRS/
├── main.tex # File principale (compilare questo)
├── README.md # Questo file
├── sections/ # Sezioni modulari
│ ├── 00-frontespizio.tex
│ ├── 01-introduzione.tex
│ ├── 02-glossario.tex
│ ├── 03-casi-uso.tex
│ ├── 04-caratterizzazione-utenti.tex
│ ├── 05-requisiti-sistema.tex
│ ├── 06-requisiti-funzionali.tex
│ ├── 07-requisiti-non-funzionali.tex
│ ├── 08-cockburn.tex
│ └── 09-mockup.tex
├── figures/ # Immagini e diagrammi
│ ├── UNINA.png
│ ├── UCD1.png # Diagramma Use Case
│ └── MOCK.png # Mockup UC-05


### Come Compilare

**Metodo 1: pdfLaTeX (raccomandato)**

pdflatex main.tex
pdflatex main.tex # Due volte per riferimenti incrociati


**Metodo 2: Overleaf**
1. Carica tutti i file mantenendo la struttura directory
2. Imposta `main.tex` come file principale
3. Compila (automatico)

**Metodo 3: Docker (isolato)**

docker run --rm -v $(pwd):/data blang/latex:ubuntu pdflatex main.tex


### Convenzioni di Modifica

- **Non modificare `main.tex`** se non per aggiungere/rimuovere sezioni
- Ogni modifica a una sezione va fatta nel file `.tex` corrispondente in `sections/`
- I riferimenti incrociati usano `\label{}` e `\ref{}`
- Le citazioni usano il formato `[web:X]`, `[file:X]`, etc.

### Dipendenze LaTeX

Pacchetti richiesti (già inclusi in TeX Live):
- inputenc, fontenc, babel (italiano)
- graphicx, float, caption
- hyperref
- tcolorbox (per box stilistici)
- booktabs, longtable, tabularx
- fancyhdr (header/footer)
- FiraSans (font)

### Conformità Standard

Il documento è conforme a:
- **IEEE 830-1998** (struttura SRS)
- **UML 2.5** (diagrammi Use Case)
- **Cockburn Template** (descrizione casi d'uso)

### Autori

- Antonio Scafaro (N86005219)
- Alessio Paduano (N86005142)
- Luigi Pio Scalice (N86005197)

**Corso**: Ingegneria del Software A.A. 2025/2026  
**Versione**: 2.0 - 19 Ottobre 2025  
**Committente**: SoftEngUniNA

### Changelog

**v2.0 (19/10/2025)**
- Ristrutturazione completa in formato modulare
- Aggiunta Introduzione conforme IEEE 830-1998 (5 sottosezioni)
- Riscrittura completa Requisiti Non Funzionali con metriche misurabili
- Compilazione Requisiti di Sistema con vincoli architetturali
- Affinamento Requisiti Funzionali con dettagli specifici
- Aggiunta sezione Acronimi e Riferimenti
- Miglioramento descrizioni casi d'uso Cockburn
- Ottimizzazione per manutenibilità e scalabilità

**v1.1 (precedente)**
- Versione originale monolitica
