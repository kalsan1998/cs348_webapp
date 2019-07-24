--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3 (Ubuntu 10.3-1.pgdg16.04+1)
-- Dumped by pg_dump version 10.3 (Ubuntu 10.3-1.pgdg16.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (email, password, first_name, last_name) FROM stdin;
kalsan@uwaterloo.ca	password	Kaan	Alsan
ejoe@example.com	password	Edwin	Joe
jsmith@gmail.com	password	John	Smith
msue@uwaterloo.ca	password	Mary	Sue
will@smith.com	password	Will	Smith
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (email, home_address, phone_number) FROM stdin;
ejoe@example.com	777 Example Street, Waterloo, Ontario	1231238765
jsmith@gmail.com	34 Smith Street, SomeCity, Ontario	2264431283
msue@uwaterloo.ca	23 Street St, Toronto, ON	6091235423
will@smith.com	31 Columbia Street, Waterloo, Ontario	6471231234
\.


--
-- Data for Name: billing_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_information (billing_id, card_number, expiration_date, cardholder_name, billing_address, cvv, client_email, date_added) FROM stdin;
1	1111222233334444	1220	John Smith	123 Billing Street, Waterloo, Ontario	123	jsmith@gmail.com	2019-07-20
2	3333444422223333	0523	Michael Smith	222 Billing Street	223	jsmith@gmail.com	2019-07-20
3	9999888845342345	0725	John Smith	555 Billing Street	543	jsmith@gmail.com	2019-07-20
4	1234512341234456	1231	Will Smith	33 Columbia Street	566	will@smith.com	2019-07-24
5	1234512345123456	0404	Mary Sue	43 Columbia St	678	msue@uwaterloo.ca	2019-07-24
\.


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, company_name, company_phone, company_email, company_address) FROM stdin;
1	Super Supply	2231245543	info@ssupply.com	123 Super Street, Waterloo, Ontario
2	Delicious Catering	6192341253	info@dcatering.com	223 Food Street, Toronto, Ontario
3	UW Food Service	2235523412	food@uw.com	200 University Avenue W
5	Lazeez Catering	6473334444	lazeez@gmail.com	123 Example St, Waterloo, Ontario
6	The Travelling Circus	4169984567	circus@gmail.com	
\.


--
-- Data for Name: supply; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supply (supplier_id, supply_name, description, price_per_quantity, min_quantity, max_quantity) FROM stdin;
2	Pizza	A pizza containing bacon, sausage, mushroom, and mozzarella cheese.	20.00	1	20
2	Baked Salmon	A freshly baked pink salmon.	30.00	3	50
3	Omellete		23.00	2	50
1	Music by Metallica	A music performance by the famous band Metallica.	200.00	1	1
1	Balloon Arrangement	An arrangement of colourful balloon, perfect for any occasion.	30.00	1	20
1	Flower Bouquet	A beautiful flower arrangement suited for any event.	50.00	2	20
5	Lazeez on the Rocks	Classic Lazeez shawarma served on rice.	55.75	1	20
5	Lazeez on the Sticks	Classic Lazeez shawarma served on fries.	70.45	1	20
6	Fire Juggling Act	An exciting act featuring Tim, the fire juggler.	215.99	1	1
6	Acrobatics Show	An amazing show with daring stunts.	345.99	1	1
\.


--
-- Data for Name: decoration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.decoration (supplier_id, supply_name, type) FROM stdin;
1	Balloon Arrangement	Balloon
1	Flower Bouquet	Flower
\.


--
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee (email, sin, salary) FROM stdin;
kalsan@uwaterloo.ca	1234567890	256128.12
\.


--
-- Data for Name: entertainment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entertainment (supplier_id, supply_name, duration) FROM stdin;
1	Music by Metallica	02:30:00
6	Fire Juggling Act	00:45:00
6	Acrobatics Show	01:00:00
\.


--
-- Data for Name: venue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venue (venue_id, venue_name, description, max_capacity, venue_address, cost_per_hour) FROM stdin;
1	University of Waterloo	Book the entire campus for your event!	230	200 University Avenue W	200.00
2	CN Tower	An amazing view located on the top floor of CN tower.	150	301 Front St W, Toronto, ON M5V 2T6	135.00
3	Rogers Centre	Host your event at this amazing place.	1000	1 Blue Jays Way, Toronto, ON M5V 1J1	300.00
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event (billed_to, venue_id, event_datetime, event_duration, attendees, manager, total_cost, booking_date) FROM stdin;
3	3	2019-08-12 14:30:00	02:30:00	200	kalsan@uwaterloo.ca	1100.00	2019-07-20
3	2	2019-12-24 22:00:00	03:00:00	70	kalsan@uwaterloo.ca	1425.00	2019-07-20
2	1	2019-08-12 14:30:00	02:30:00	200	kalsan@uwaterloo.ca	5650.00	2019-07-20
5	1	2019-07-30 15:14:00	06:45:00	100	kalsan@uwaterloo.ca	2125.00	2019-07-24
\.


--
-- Data for Name: food_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.food_item (supplier_id, supply_name, is_vegetarian, is_vegan, is_gluten_free, is_halal, servings_per_quantity) FROM stdin;
2	Pizza	f	f	f	t	5
2	Baked Salmon	f	f	t	t	3
3	Omellete	t	f	t	t	5
5	Lazeez on the Rocks	f	f	f	t	15
5	Lazeez on the Sticks	f	f	f	t	15
\.


--
-- Data for Name: supply_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supply_order (billed_to, venue_id, event_datetime, supplier_id, supply_name, supply_quantity, supply_cost) FROM stdin;
3	3	2019-08-12 14:30:00	2	Baked Salmon	3	90.00
3	3	2019-08-12 14:30:00	2	Pizza	3	60.00
3	3	2019-08-12 14:30:00	1	Flower Bouquet	1	50.00
3	2	2019-12-24 22:00:00	3	Omellete	20	460.00
3	2	2019-12-24 22:00:00	2	Baked Salmon	10	300.00
3	2	2019-12-24 22:00:00	1	Balloon Arrangement	2	60.00
3	2	2019-12-24 22:00:00	1	Music by Metallica	1	200.00
2	1	2019-08-12 14:30:00	3	Omellete	150	3450.00
2	1	2019-08-12 14:30:00	1	Balloon Arrangement	20	600.00
2	1	2019-08-12 14:30:00	1	Flower Bouquet	20	1000.00
5	1	2019-07-30 15:14:00	2	Pizza	5	100.00
5	1	2019-07-30 15:14:00	1	Balloon Arrangement	7	210.00
5	1	2019-07-30 15:14:00	1	Music by Metallica	1	200.00
5	1	2019-07-30 15:14:00	6	Fire Juggling Act	1	215.00
\.


--
-- Name: billing_information_billing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.billing_information_billing_id_seq', 5, true);


--
-- Name: decoration_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.decoration_supplier_id_seq', 1, false);


--
-- Name: entertainment_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entertainment_supplier_id_seq', 1, false);


--
-- Name: event_billed_to_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_billed_to_seq', 1, false);


--
-- Name: event_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_venue_id_seq', 1, false);


--
-- Name: food_item_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.food_item_supplier_id_seq', 1, false);


--
-- Name: supplier_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_supplier_id_seq', 6, true);


--
-- Name: supply_order_billed_to_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supply_order_billed_to_seq', 1, false);


--
-- Name: supply_order_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supply_order_supplier_id_seq', 1, false);


--
-- Name: supply_order_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supply_order_venue_id_seq', 1, false);


--
-- Name: supply_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supply_supplier_id_seq', 1, false);


--
-- Name: venue_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venue_venue_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

