CREATE TABLE products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    price INT NOT NULL,
    description VARCHAR(300) NOT NULL,
    exp DATE
) ENGINE = innodb;

CREATE TABLE uoms (
    uom_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uom VARCHAR(45) NOT NULL,
    description VARCHAR(200) NOT NULL
) ENGINE = innodb;

CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(45) NOT NULL
) ENGINE = innodb;

CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(45) NOT NULL,
    password VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    role VARCHAR(30) NOT NULL
) ENGINE = innodb;

CREATE TABLE access (
    access_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    access_date DATE
) ENGINE = innodb;

alter table products add column uom_id int unsigned;
alter table products add constraint fk_products_uoms
foreign key (uom_id) references uoms(uom_id);

alter table products add column category_id int unsigned;
alter table products add constraint fk_products_categories
foreign key (category_id) references categories(category_id);

alter table access add column user_id int unsigned;
alter table access add constraint fk_access_users
foreign key (user_id) references users(user_id);

alter table access add column product_id int unsigned;
alter table access add constraint fk_access_products
foreign key (product_id) references products(product_id);


INSERT INTO categories (category) VALUES ("nutrient");
INSERT INTO uoms (uom, description) VALUES ("set", "5kg A & 5kg B");

INSERT INTO products (name, price, description, exp, uom_id, category_id) VALUES ("CGA-Lettuce Nutrient", 10, "solid nutrients",'2025-01-05', 1, 1)
INSERT INTO users (user_name, password, email, role) VALUES ("XL", "password", "xl@gemail.com",'assistant farm manager')
INSERT INTO access (access_date, user_id, product_id) VALUES ('2025-01-05',1,1);

ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;

