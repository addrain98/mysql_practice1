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

alter table products add column uom_id int unsigned;
alter table products add constraint fk_products_uoms
foreign key (uom_id) references uoms(uom_id);

alter table products add column category_id int unsigned;
alter table products add constraint fk_products_categories
foreign key (category_id) references categories(category_id);

INSERT INTO categories (category) VALUES ("nutrient");
INSERT INTO uoms (uom, description) VALUES ("set", "5kg A & 5kg B");

INSERT INTO products (name, price, description, exp, uom_id, category_id) VALUES ("CGA-Lettuce Nutrient", 10, "solid nutrients",'2025-01-05', 1, 1)


ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;

