--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-03-17 13:40:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 888 (class 1247 OID 85064)
-- Name: priorita_issue; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.priorita_issue AS ENUM (
    'ALTA',
    'BASSA',
    'CRITICA',
    'MEDIA',
    'NESSUNA'
);


ALTER TYPE public.priorita_issue OWNER TO postgres;

--
-- TOC entry 891 (class 1247 OID 85078)
-- Name: stato_issue; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.stato_issue AS ENUM (
    'ARCHIVIATA',
    'CHIUSA',
    'IN_LAVORAZIONE',
    'RISOLTA',
    'TODO'
);


ALTER TYPE public.stato_issue OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 85092)
-- Name: tipo_issue; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_issue AS ENUM (
    'BUG',
    'DOCUMENTATION',
    'FEATURE',
    'QUESTION'
);


ALTER TYPE public.tipo_issue OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 85104)
-- Name: tipo_notifica; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_notifica AS ENUM (
    'ASSEGNATA',
    'COMMENTO',
    'CRITICA',
    'MENZIONE',
    'RISOLTA'
);


ALTER TYPE public.tipo_notifica OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 85118)
-- Name: tipo_ruolo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_ruolo AS ENUM (
    'AMMINISTRATORE',
    'UTENTE'
);


ALTER TYPE public.tipo_ruolo OWNER TO postgres;

--
-- TOC entry 4800 (class 2605 OID 85076)
-- Name: CAST (public.priorita_issue AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.priorita_issue AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4801 (class 2605 OID 85090)
-- Name: CAST (public.stato_issue AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.stato_issue AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4802 (class 2605 OID 85102)
-- Name: CAST (public.tipo_issue AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.tipo_issue AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4803 (class 2605 OID 85116)
-- Name: CAST (public.tipo_notifica AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.tipo_notifica AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4804 (class 2605 OID 85124)
-- Name: CAST (public.tipo_ruolo AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.tipo_ruolo AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4716 (class 2605 OID 85075)
-- Name: CAST (character varying AS public.priorita_issue); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.priorita_issue) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4717 (class 2605 OID 85089)
-- Name: CAST (character varying AS public.stato_issue); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.stato_issue) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4718 (class 2605 OID 85101)
-- Name: CAST (character varying AS public.tipo_issue); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.tipo_issue) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4719 (class 2605 OID 85115)
-- Name: CAST (character varying AS public.tipo_notifica); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.tipo_notifica) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4720 (class 2605 OID 85123)
-- Name: CAST (character varying AS public.tipo_ruolo); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.tipo_ruolo) WITH INOUT AS IMPLICIT;


--
-- TOC entry 232 (class 1255 OID 84039)
-- Name: aggiorna_timestamp_modifica(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.aggiorna_timestamp_modifica() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.data_ultimo_aggiornamento = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.aggiorna_timestamp_modifica() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 83963)
-- Name: allegati; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.allegati (
    id integer NOT NULL,
    id_issue integer NOT NULL,
    url_file character varying(1024) NOT NULL,
    nome_file character varying(255),
    tipo_file character varying(50),
    data_caricamento timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.allegati OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 83962)
-- Name: allegati_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.allegati_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.allegati_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 226
-- Name: allegati_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.allegati_id_seq OWNED BY public.allegati.id;


--
-- TOC entry 225 (class 1259 OID 83943)
-- Name: commenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commenti (
    id integer NOT NULL,
    id_issue integer NOT NULL,
    email_autore character varying(255),
    testo character varying(255) NOT NULL,
    data_creazione timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.commenti OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 83942)
-- Name: commenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commenti_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 224
-- Name: commenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commenti_id_seq OWNED BY public.commenti.id;


--
-- TOC entry 221 (class 1259 OID 83900)
-- Name: etichette; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etichette (
    id integer NOT NULL,
    id_progetto integer NOT NULL,
    nome character varying(50) NOT NULL,
    colore character varying(7) DEFAULT '#808080'::character varying NOT NULL
);


ALTER TABLE public.etichette OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 83899)
-- Name: etichette_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etichette_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etichette_id_seq OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 220
-- Name: etichette_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etichette_id_seq OWNED BY public.etichette.id;


--
-- TOC entry 223 (class 1259 OID 83915)
-- Name: issue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue (
    id integer NOT NULL,
    id_progetto integer NOT NULL,
    email_autore character varying(255),
    email_assegnatario character varying(255),
    titolo character varying(255) NOT NULL,
    descrizione character varying(255) NOT NULL,
    data_creazione timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_aggiornamento timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    priorita_issue public.priorita_issue,
    stato_issue public.stato_issue,
    tipo_issue public.tipo_issue
);


ALTER TABLE public.issue OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 84013)
-- Name: issue_etichette; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue_etichette (
    id_issue integer NOT NULL,
    id_etichetta integer NOT NULL
);


ALTER TABLE public.issue_etichette OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 83914)
-- Name: issue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.issue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issue_id_seq OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 222
-- Name: issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.issue_id_seq OWNED BY public.issue.id;


--
-- TOC entry 229 (class 1259 OID 83978)
-- Name: notifiche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifiche (
    id integer NOT NULL,
    email_utente character varying(255) NOT NULL,
    id_issue integer,
    testo character varying(255) NOT NULL,
    letta boolean DEFAULT false NOT NULL,
    data_creazione timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    letto boolean NOT NULL,
    tipo_notifica public.tipo_notifica
);


ALTER TABLE public.notifiche OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 83977)
-- Name: notifiche_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifiche_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifiche_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifiche_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifiche_id_seq OWNED BY public.notifiche.id;


--
-- TOC entry 219 (class 1259 OID 83883)
-- Name: progetti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progetti (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descrizione character varying(255),
    id_creatore character varying(255),
    data_creazione timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.progetti OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 83882)
-- Name: progetti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.progetti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.progetti_id_seq OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 218
-- Name: progetti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.progetti_id_seq OWNED BY public.progetti.id;


--
-- TOC entry 230 (class 1259 OID 83998)
-- Name: progetto_membri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progetto_membri (
    id_progetto integer NOT NULL,
    email_utente character varying(255) NOT NULL
);


ALTER TABLE public.progetto_membri OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 83873)
-- Name: utenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utenti (
    email character varying(255) NOT NULL,
    nome character varying(100) NOT NULL,
    cognome character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    data_creazione timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ruolo public.tipo_ruolo
);


ALTER TABLE public.utenti OWNER TO postgres;

--
-- TOC entry 4815 (class 2604 OID 83966)
-- Name: allegati id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati ALTER COLUMN id SET DEFAULT nextval('public.allegati_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 83946)
-- Name: commenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti ALTER COLUMN id SET DEFAULT nextval('public.commenti_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 83903)
-- Name: etichette id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette ALTER COLUMN id SET DEFAULT nextval('public.etichette_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 83918)
-- Name: issue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue ALTER COLUMN id SET DEFAULT nextval('public.issue_id_seq'::regclass);


--
-- TOC entry 4817 (class 2604 OID 83981)
-- Name: notifiche id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche ALTER COLUMN id SET DEFAULT nextval('public.notifiche_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 83886)
-- Name: progetti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti ALTER COLUMN id SET DEFAULT nextval('public.progetti_id_seq'::regclass);


--
-- TOC entry 5021 (class 0 OID 83963)
-- Dependencies: 227
-- Data for Name: allegati; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.allegati (id, id_issue, url_file, nome_file, tipo_file, data_caricamento) FROM stdin;
\.


--
-- TOC entry 5019 (class 0 OID 83943)
-- Dependencies: 225
-- Data for Name: commenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commenti (id, id_issue, email_autore, testo, data_creazione) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 83900)
-- Dependencies: 221
-- Data for Name: etichette; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etichette (id, id_progetto, nome, colore) FROM stdin;
\.


--
-- TOC entry 5017 (class 0 OID 83915)
-- Dependencies: 223
-- Data for Name: issue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issue (id, id_progetto, email_autore, email_assegnatario, titolo, descrizione, data_creazione, data_ultimo_aggiornamento, priorita_issue, stato_issue, tipo_issue) FROM stdin;
\.


--
-- TOC entry 5025 (class 0 OID 84013)
-- Dependencies: 231
-- Data for Name: issue_etichette; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issue_etichette (id_issue, id_etichetta) FROM stdin;
\.


--
-- TOC entry 5023 (class 0 OID 83978)
-- Dependencies: 229
-- Data for Name: notifiche; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifiche (id, email_utente, id_issue, testo, letta, data_creazione, letto, tipo_notifica) FROM stdin;
\.


--
-- TOC entry 5013 (class 0 OID 83883)
-- Dependencies: 219
-- Data for Name: progetti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progetti (id, nome, descrizione, id_creatore, data_creazione) FROM stdin;
\.


--
-- TOC entry 5024 (class 0 OID 83998)
-- Dependencies: 230
-- Data for Name: progetto_membri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progetto_membri (id_progetto, email_utente) FROM stdin;
\.


--
-- TOC entry 5011 (class 0 OID 83873)
-- Dependencies: 217
-- Data for Name: utenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utenti (email, nome, cognome, password_hash, data_creazione, ruolo) FROM stdin;
\.


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 226
-- Name: allegati_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.allegati_id_seq', 1, false);


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 224
-- Name: commenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commenti_id_seq', 1, false);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 220
-- Name: etichette_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etichette_id_seq', 1, false);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 222
-- Name: issue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.issue_id_seq', 1, false);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifiche_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifiche_id_seq', 1, false);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 218
-- Name: progetti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.progetti_id_seq', 1, false);


--
-- TOC entry 4840 (class 2606 OID 83971)
-- Name: allegati allegati_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT allegati_pkey PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 83951)
-- Name: commenti commenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT commenti_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 83908)
-- Name: etichette etichette_id_progetto_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette
    ADD CONSTRAINT etichette_id_progetto_nome_key UNIQUE (id_progetto, nome);


--
-- TOC entry 4831 (class 2606 OID 83906)
-- Name: etichette etichette_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette
    ADD CONSTRAINT etichette_pkey PRIMARY KEY (id);


--
-- TOC entry 4850 (class 2606 OID 84017)
-- Name: issue_etichette issue_etichette_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT issue_etichette_pkey PRIMARY KEY (id_issue, id_etichetta);


--
-- TOC entry 4835 (class 2606 OID 83926)
-- Name: issue issue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 83987)
-- Name: notifiche notifiche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 83893)
-- Name: progetti progetti_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti
    ADD CONSTRAINT progetti_nome_key UNIQUE (nome);


--
-- TOC entry 4827 (class 2606 OID 83891)
-- Name: progetti progetti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti
    ADD CONSTRAINT progetti_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 84002)
-- Name: progetto_membri progetto_membri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetto_membri
    ADD CONSTRAINT progetto_membri_pkey PRIMARY KEY (id_progetto, email_utente);


--
-- TOC entry 4822 (class 2606 OID 83881)
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (email);


--
-- TOC entry 4841 (class 1259 OID 84036)
-- Name: idx_allegati_issue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_allegati_issue ON public.allegati USING btree (id_issue);


--
-- TOC entry 4838 (class 1259 OID 84035)
-- Name: idx_commenti_issue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_commenti_issue ON public.commenti USING btree (id_issue);


--
-- TOC entry 4832 (class 1259 OID 84032)
-- Name: idx_issue_assegnatario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_issue_assegnatario ON public.issue USING btree (email_assegnatario);


--
-- TOC entry 4833 (class 1259 OID 84031)
-- Name: idx_issue_progetto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_issue_progetto ON public.issue USING btree (id_progetto);


--
-- TOC entry 4842 (class 1259 OID 84038)
-- Name: idx_notifiche_letta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifiche_letta ON public.notifiche USING btree (email_utente, letta);


--
-- TOC entry 4843 (class 1259 OID 84037)
-- Name: idx_notifiche_utente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifiche_utente ON public.notifiche USING btree (email_utente);


--
-- TOC entry 4823 (class 1259 OID 84029)
-- Name: idx_progetti_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progetti_nome ON public.progetti USING btree (nome);


--
-- TOC entry 4846 (class 1259 OID 84030)
-- Name: idx_progetto_membri_utente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progetto_membri_utente ON public.progetto_membri USING btree (email_utente);


--
-- TOC entry 4820 (class 1259 OID 84028)
-- Name: idx_utenti_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_utenti_email ON public.utenti USING btree (email);


--
-- TOC entry 4865 (class 2620 OID 84040)
-- Name: issue trg_issue_before_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_issue_before_update BEFORE UPDATE ON public.issue FOR EACH ROW EXECUTE FUNCTION public.aggiorna_timestamp_modifica();


--
-- TOC entry 4858 (class 2606 OID 83972)
-- Name: allegati allegati_id_issue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT allegati_id_issue_fkey FOREIGN KEY (id_issue) REFERENCES public.issue(id) ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 83957)
-- Name: commenti commenti_email_autore_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT commenti_email_autore_fkey FOREIGN KEY (email_autore) REFERENCES public.utenti(email) ON DELETE SET NULL;


--
-- TOC entry 4857 (class 2606 OID 83952)
-- Name: commenti commenti_id_issue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT commenti_id_issue_fkey FOREIGN KEY (id_issue) REFERENCES public.issue(id) ON DELETE CASCADE;


--
-- TOC entry 4852 (class 2606 OID 83909)
-- Name: etichette etichette_id_progetto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette
    ADD CONSTRAINT etichette_id_progetto_fkey FOREIGN KEY (id_progetto) REFERENCES public.progetti(id) ON DELETE CASCADE;


--
-- TOC entry 4853 (class 2606 OID 83937)
-- Name: issue issue_email_assegnatario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_email_assegnatario_fkey FOREIGN KEY (email_assegnatario) REFERENCES public.utenti(email) ON DELETE SET NULL;


--
-- TOC entry 4854 (class 2606 OID 83932)
-- Name: issue issue_email_autore_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_email_autore_fkey FOREIGN KEY (email_autore) REFERENCES public.utenti(email) ON DELETE SET NULL;


--
-- TOC entry 4863 (class 2606 OID 84023)
-- Name: issue_etichette issue_etichette_id_etichetta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT issue_etichette_id_etichetta_fkey FOREIGN KEY (id_etichetta) REFERENCES public.etichette(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 84018)
-- Name: issue_etichette issue_etichette_id_issue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT issue_etichette_id_issue_fkey FOREIGN KEY (id_issue) REFERENCES public.issue(id) ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 83927)
-- Name: issue issue_id_progetto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_id_progetto_fkey FOREIGN KEY (id_progetto) REFERENCES public.progetti(id) ON DELETE CASCADE;


--
-- TOC entry 4859 (class 2606 OID 83988)
-- Name: notifiche notifiche_email_utente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_email_utente_fkey FOREIGN KEY (email_utente) REFERENCES public.utenti(email) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 83993)
-- Name: notifiche notifiche_id_issue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_id_issue_fkey FOREIGN KEY (id_issue) REFERENCES public.issue(id) ON DELETE CASCADE;


--
-- TOC entry 4851 (class 2606 OID 83894)
-- Name: progetti progetti_id_creatore_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti
    ADD CONSTRAINT progetti_id_creatore_fkey FOREIGN KEY (id_creatore) REFERENCES public.utenti(email) ON DELETE SET NULL;


--
-- TOC entry 4861 (class 2606 OID 84008)
-- Name: progetto_membri progetto_membri_email_utente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetto_membri
    ADD CONSTRAINT progetto_membri_email_utente_fkey FOREIGN KEY (email_utente) REFERENCES public.utenti(email) ON DELETE CASCADE;


--
-- TOC entry 4862 (class 2606 OID 84003)
-- Name: progetto_membri progetto_membri_id_progetto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetto_membri
    ADD CONSTRAINT progetto_membri_id_progetto_fkey FOREIGN KEY (id_progetto) REFERENCES public.progetti(id) ON DELETE CASCADE;


-- Completed on 2026-03-17 13:40:51

--
-- PostgreSQL database dump complete
--

