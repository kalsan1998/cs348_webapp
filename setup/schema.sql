CREATE TABLE venue(
  venue_id SERIAL,
  venue_name VARCHAR(64) NOT NULL,
  description VARCHAR(256),
  max_capacity INTEGER NOT NULL CHECK(max_capacity >= 0),
  venue_address VARCHAR(24) UNIQUE NOT NULL,
  cost_per_hour DECIMAL(6,2) NOT NULL,
  PRIMARY KEY (venue_id)
);

CREATE TABLE supplier(
  supplier_id SERIAL,
  company_name VARCHAR(24) NOT NULL,
  company_phone CHAR(10) NOT NULL,
  company_email VARCHAR(24),
  company_address VARCHAR(24),
  PRIMARY KEY (supplier_id)
);

CREATE TABLE supply(
  supplier_id SERIAL,
  supply_name VARCHAR(24),
  description VARCHAR(256),
  price_per_quantity DECIMAL(6,2) NOT NULL,
  min_quantity INTEGER CHECK(min_quantity >= 0),
  max_quantity INTEGER CHECK(max_quantity >= 0),
  PRIMARY KEY (supplier_id, supply_name),
  FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id) ON DELETE CASCADE ON UPDATE CASCADE
);
 
CREATE TABLE decoration(
  supplier_id SERIAL,
  supply_name VARCHAR(24),
  type VARCHAR(24),
  PRIMARY KEY (supplier_id, supply_name),
  FOREIGN KEY (supplier_id, supply_name) REFERENCES supply (supplier_id, supply_name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE entertainment(
  supplier_id SERIAL,
  supply_name VARCHAR(24),
  duration TIME NOT NULL,
  PRIMARY KEY (supplier_id, supply_name),
  FOREIGN KEY (supplier_id, supply_name) REFERENCES supply (supplier_id, supply_name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE food_item(
  supplier_id SERIAL,
  supply_name VARCHAR(24),
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  is_gluten_free BOOLEAN,
  is_halal BOOLEAN,
  servings_per_quantity INTEGER NOT NULL CHECK(servings_per_quantity >= 0),
  PRIMARY KEY (supplier_id, supply_name),
  FOREIGN KEY (supplier_id, supply_name) REFERENCES supply (supplier_id, supply_name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE app_user(
  email VARCHAR(24),
  password VARCHAR(24) NOT NULL,
  first_name VARCHAR(12) NOT NULL,
  last_name VARCHAR(12) NOT NULL,
  PRIMARY KEY (email)
);

CREATE TABLE employee(
  email VARCHAR(24),
  sin CHAR(10),
  salary DECIMAL(8,2),
  PRIMARY KEY(email),
  FOREIGN KEY (email) REFERENCES app_user (email) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE client(
  email VARCHAR(24),
  home_address VARCHAR(24),
  phone_number CHAR(10),
  PRIMARY KEY(email),
  FOREIGN KEY (email) REFERENCES app_user (email) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE billing_information(
  billing_id SERIAL,
  card_number CHAR(16) NOT NULL,
  expiration_date CHAR(4) NOT NULL,
  cardholder_name VARCHAR(30) NOT NULL,
  cvv CHAR(3) NOT NULL,
  billing_address VARCHAR(24) NOT NULL,
  client_email VARCHAR(24) NOT NULL,
  date_added DATE NOT NULL,
  PRIMARY KEY (billing_id),
  FOREIGN KEY (client_email) REFERENCES client (email) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE event(
  billed_to SERIAL,
  venue_id SERIAL,
  event_datetime TIMESTAMP,
  event_duration TIME NOT NULL,
  attendees INTEGER NOT NULL,
  manager VARCHAR(24) NOT NULL,
  total_cost DECIMAL(7,2) NOT NULL,
  booking_date DATE NOT NULL,
  PRIMARY KEY (billed_to, venue_id, event_datetime),
  FOREIGN KEY (billed_to) REFERENCES billing_information (billing_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venue (venue_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (manager) REFERENCES employee (email) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE supply_order(
  billed_to SERIAL,
  venue_id SERIAL,
  event_datetime TIMESTAMP,
  supplier_id SERIAL,
  supply_name VARCHAR(24),
  supply_quantity INTEGER NOT NULL,
  supply_cost DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (billed_to, venue_id, event_datetime, supplier_id, supply_name),
  FOREIGN KEY (billed_to, venue_id, event_datetime) REFERENCES event (billed_to, venue_id, event_datetime) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (supplier_id, supply_name) REFERENCES supply (supplier_id, supply_name) ON DELETE CASCADE ON UPDATE CASCADE
);
