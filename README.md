# 🐛 BugBoard26

**BugBoard26** è un sistema di issue tracking e bug management sviluppato come progetto per il corso di Ingegneria del Software presso l'Università degli Studi di Napoli Federico II (A.A. 2025/2026).

## Panoramica

BugBoard26 è una piattaforma web full-stack per la gestione di bug e issue all'interno di progetti software. Consente ai team di tracciare, organizzare e risolvere i bug in modo collaborativo attraverso un'interfaccia moderna e intuitiva.

### Funzionalità principali

- **Kanban Board**: visualizzazione e gestione delle issue tramite drag & drop con colonne personalizzate per stato
- **Gestione Progetti**: creazione e configurazione di progetti con team dedicati
- **Sistema di Notifiche**: notifiche in tempo reale tramite Server-Sent Events (SSE)
- **Gestione Utenti**: registrazione, autenticazione e gestione dei ruoli (Admin/Developer)
- **Filtri e Ricerca**: sistema di filtraggio avanzato per priorità, tipo, etichette e assegnatario
- **Report e Statistiche**: dashboard con grafici interattivi sull'andamento del progetto
- **Commenti e Allegati**: discussione e condivisione di file all'interno delle issue
- **Etichette personalizzate**: categorizzazione delle issue tramite tag configurabili
- **Responsive Design**: interfaccia ottimizzata per desktop e dispositivi mobile con bottom sheet

## Architettura

Il progetto è strutturato come un'applicazione a microservizi con tre componenti principali:

```
BugBoard26/
├── bugboard26-backend/    # REST API (Spring Boot + Java 17)
├── bugboard26-ui/         # Single Page Application (React + TypeScript)
└── docker-compose.yml     # Orchestrazione dei servizi
```

### Tech Stack

| Componente | Tecnologia |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Spring Boot 3.5, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL 15 |
| **Containerizzazione** | Docker, Docker Compose |
| **Grafici** | Recharts |
| **Notifiche real-time** | Server-Sent Events (SSE) |

## Requisiti

- **Docker** e **Docker Compose** installati
- Oppure per lo sviluppo locale:
  - Java 17+
  - Node.js 18+
  - PostgreSQL 15+

## Avvio rapido con Docker

```bash
# Clona il repository
git clone https://github.com/antonioscafaro/bb26.git
cd bb26

# Avvia tutti i servizi
docker compose up --build
```

L'applicazione sarà disponibile su:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## Sviluppo locale

### Backend

```bash
cd bugboard26-backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd bugboard26-ui
npm install
npm run dev
```

## Struttura del Database

Il database PostgreSQL include le seguenti entità principali:

- **Utenti**: gestione degli utenti con ruoli (Admin, Developer)
- **Progetti**: progetti con relazione molti-a-molti con i membri del team
- **Issue**: bug/task con stato, priorità, tipo e assegnatario
- **Commenti**: commenti associati alle issue
- **Allegati**: file allegati alle issue
- **Etichette**: tag personalizzabili per categorizzare le issue
- **Notifiche**: sistema di notifiche per assegnazioni, menzioni e creazioni

## Autori

- **Antonio Scafaro** - [antonioscafaro](https://github.com/antonioscafaro)
- **Alessio Paduano** - [alewildb](https://github.com/alewildb)
- **Luigi Pio Scalice**

## Licenza

Progetto sviluppato per fini accademici - Corso di Ingegneria del Software, UNINA.
