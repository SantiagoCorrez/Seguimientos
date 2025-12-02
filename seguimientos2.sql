--
-- PostgreSQL database dump
--

\restrict IBZkYSYSf7BRDCRi5SDZdaHlwZ06LdXEaP567c0MjAgbNLUqtpWhU378fcHMYxC

-- Dumped from database version 17.5
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-02 08:04:26

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 32777)
-- Name: reportes_avance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes_avance (
    id integer NOT NULL,
    compromiso_codigo character varying(50) NOT NULL,
    mes_reporte date NOT NULL,
    reporte_avance_fisico numeric(5,2),
    reporte_avance_financiero numeric(5,2),
    observaciones_reporte text,
    imagen_url text,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reportes_avance OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 32776)
-- Name: reportes_avance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_avance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reportes_avance_id_seq OWNER TO postgres;

--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 218
-- Name: reportes_avance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_avance_id_seq OWNED BY public.reportes_avance.id;


--
-- TOC entry 222 (class 1259 OID 41186)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 41185)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 227 (class 1259 OID 60120)
-- Name: secretarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secretarias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.secretarias OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 60119)
-- Name: secretarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secretarias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secretarias_id_seq OWNER TO postgres;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 226
-- Name: secretarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secretarias_id_seq OWNED BY public.secretarias.id;


--
-- TOC entry 225 (class 1259 OID 41204)
-- Name: usuario_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_roles (
    usuario_id integer NOT NULL,
    rol_id integer NOT NULL
);


ALTER TABLE public.usuario_roles OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 41195)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    secretaria_id integer
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 41194)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4760 (class 2604 OID 32780)
-- Name: reportes_avance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_avance ALTER COLUMN id SET DEFAULT nextval('public.reportes_avance_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 41189)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4765 (class 2604 OID 60123)
-- Name: secretarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretarias ALTER COLUMN id SET DEFAULT nextval('public.secretarias_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 41198)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4932 (class 0 OID 32777)
-- Dependencies: 219
-- Data for Name: reportes_avance; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.reportes_avance VALUES (1, 'CGNC130', '2025-07-12', 5.00, 10.00, '', 'uploads\1753912978048.jpg', '2025-07-30 17:02:58.473555-05');


--
-- TOC entry 4934 (class 0 OID 41186)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles VALUES (1, 'Administrador');
INSERT INTO public.roles VALUES (2, 'Editor');
INSERT INTO public.roles VALUES (3, 'Visor');


--
-- TOC entry 4939 (class 0 OID 60120)
-- Dependencies: 227
-- Data for Name: secretarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.secretarias VALUES (1, 'Secretaría General');
INSERT INTO public.secretarias VALUES (2, 'Secretaría de Planeación');
INSERT INTO public.secretarias VALUES (3, 'Secretaría de Hacienda');


--
-- TOC entry 4937 (class 0 OID 41204)
-- Dependencies: 225
-- Data for Name: usuario_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario_roles VALUES (1, 1);
INSERT INTO public.usuario_roles VALUES (2, 1);


--
-- TOC entry 4936 (class 0 OID 41195)
-- Dependencies: 224
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios VALUES (1, 'Santiago Correa', 'santiago.correa@cundinamarca.gov.co', '$2a$12$Fxf4wSai/YhiyIkCfh.hO.5e7qxZo3iwW2EbFdJZDHiMnuZWKPZNC', '2025-09-09 00:00:00-05', NULL);
INSERT INTO public.usuarios VALUES (2, 'Nicolas Aguilar', 'nicolas.aguilar@cundinamarca.gov.co', 'Asdf123.', '2025-09-12 10:01:25.276405-05', NULL);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 218
-- Name: reportes_avance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reportes_avance_id_seq', 33, true);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 226
-- Name: secretarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secretarias_id_seq', 3, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 2, true);


-- Completed on 2025-12-02 08:04:26

--
-- PostgreSQL database dump complete
--

\unrestrict IBZkYSYSf7BRDCRi5SDZdaHlwZ06LdXEaP567c0MjAgbNLUqtpWhU378fcHMYxC

