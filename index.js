const express = require('express');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const hbs = require('hbs');
const wax = require('wax-on');
const handlebarHelpers = require('handlebars-helpers')({
    'handlebars':hbs.handlebars
});

dotenv.config();

let app = express();
app.use(express.urlencoded({ extended: false}));

app.set('view engine', 'hbs');

wax.on(hbs.handlebars);
wax.setLayoutPath('views/layouts');

async function main() {
    const connection = await mysql2.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD
    });
//read
    app.get('/products', async function(req, res) {
        const [products] = await connection.execute(`
            SELECT * from products
                JOIN categories ON products.category_id = categories.category_id
                JOIN uoms ON products.uom_id = uoms.uom_id;
        `);
        products.forEach(product => {
            product.exp = new Date(product.exp).toDateString(); // Converts date to a more readable format without time
        });
        res.render('products/index', {
            products
        })
    })

// create
    app.get('/products/create', async function (req,res) {
        const [categories] = await connection.execute(`SELECT * from categories`);
        const [uoms] = await connection.execute(`SELECT * from uoms`);
        res.render("products/create", {
            categories,
            uoms
        });

    })
    app.post('/products/create', async function(req, res) {
        let { name, price, description, exp, uom_id, category_id } = req.body;
        
        try {
            // Convert any undefined values to null explicitly

            if (exp) {
                const expDate = new Date(exp);
                const year = expDate.getFullYear();
                const month = ('0' + (expDate.getMonth() + 1)).slice(-2); // getMonth() is zero-based; add 1 to compensate and pad with leading 0
                const day = ('0' + expDate.getDate()).slice(-2); // pad with leading 0
                exp = `${year}-${month}-${day}`; // reassign exp in yyyy/mm/dd format
            }

            console.log(exp)

            // Check if UOM exists
            const [uoms] = await connection.execute('SELECT * FROM uoms WHERE uom_id = ?', [uom_id]);
            if (uoms.length === 0) {
                return res.status(400).json({
                    'error': 'Invalid UOM ID'
                });
            }
    
            // Check if Category exists
            const [categories] = await connection.execute('SELECT * FROM categories WHERE category_id = ?', [category_id]);
            if (categories.length === 0) {
                return res.status(400).json({
                    'error': 'Invalid Category ID'
                });
            }
            
            // If all checks pass, insert the product
            const query = 'INSERT INTO products (name, price, description, exp, uom_id, category_id) VALUES (?, ?, ?, ?, ?, ?)';
            console.log({ name, price, description, exp, uom_id, category_id });
            const [results] = await connection.execute(query, [name, price, description, exp, uom_id, category_id]);
            res.redirect('/products');

        } catch (error) {
            console.error('Error inserting product:', error);
            res.status(500).json({
                'error': 'Server error while creating product',
                'details': error.message  
            });
        }
    });
    

    //delete
    app.get('/products/:product_id/delete', async function (req, res) {
        const sql = "select * from products where product_id = ?";
        const [products] = await connection.execute(sql, [req.params.product_id]);
        const product = products[0];
        res.render('products/delete', {
            product,
        })
    });


    app.post('/products/:product_id/delete', async function (req, res) {
        const query = "DELETE FROM products WHERE product_id = ?";
        await connection.execute(query, [req.params.product_id]);
        res.redirect('/products');
    });

//update
    app.get('/products/:product_id/update', async function (req, res) {
        const query = "SELECT * FROM products WHERE product_id = ?";
        const [products] = await connection.execute(query, [req.params.product_id]);
        const product = products[0];
    
        const [categories] = await connection.execute(`SELECT * from categories`);
        const [uoms] = await connection.execute(`SELECT * from uoms`);
    
        res.render('products/update', {
            product, categories, uoms
        })
    });
    
    app.post('/products/:product_id/update', async function (req, res) {
        const { name, price, description, exp, uom_id, category_id } = req.body;
        const query = `UPDATE products SET name=?,
                                            price =?,
                                            description =?,
                                            exp =?,
                                            uom_id=?,
                                            category_id=?
                                        WHERE product_id = ?
        `;
        const bindings = [name, price, description, exp, uom_id, category_id, req.params.product_id];
        await connection.execute(query, bindings);
        res.redirect('/products');
    })

    //search products
    app.get('/products/search', async function (req, res) {
        try {
            let sql = `SELECT products.*, uoms.uom, categories.category
                       FROM products 
                       LEFT JOIN uoms ON products.uom_id = uoms.uom_id
                       LEFT JOIN categories ON products.category_id = categories.category_id
                       WHERE 1`;
    
            const bindings = [];
            if (req.query.searchTerms) {
                sql += ` AND (products.name LIKE ? OR categories.category LIKE ?)`;
                bindings.push(`%${req.query.searchTerms}%`, `%${req.query.searchTerms}%`);
            }
    
            const [products] = await connection.execute(sql, bindings);
            products.forEach(product => {
                product.exp = new Date(product.exp).toDateString();
            });
    
            const [categories] = await connection.execute(`SELECT * FROM categories`);
            const [uoms] = await connection.execute(`SELECT * FROM uoms`);
            
            res.render('products/search', { products, categories, uoms });
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while fetching the products.');
        }
    });
    

    //create new uom
    app.get('/uoms/create', async function (req, res) {
        const [uoms] = await connection.execute(`SELECT * from uoms`);
        const [products] = await connection.execute(`SELECT * FROM products`);
      
        res.render("uoms/create", {
            uoms, products
        });
    });

    // Process the form to create a new uom
    app.post('/uoms/create', async function (req, res) {
        const { uom, description  } = req.body;
        const query = `
        INSERT INTO uoms (uom, description) 
        VALUES (?, ?)
    `;
        const bindings = [uom, description];
        const [results] = await connection.execute(query, bindings);
        
        res.redirect('/uoms');
    });

    app.get('/uoms/:uom_id/delete', async function (req, res) {
        const sql = "select * from uoms where uom_id = ?";
        const [uoms] = await connection.execute(sql, [req.params.uom_id]);
        const uom = uoms[0];
        res.render('uoms/delete', {
            uom,
        })
    });


    app.post('/uoms/:uom_id/delete', async function (req, res) {
        const query = "DELETE FROM uoms WHERE uom_id = ?";
        await connection.execute(query, [req.params.uom_id]);
        res.redirect('/uoms');
    });

    // Route to display a table of UoMs
    app.get('/uoms', async function (req, res) {
        try {
            const [uoms] = await connection.execute(`SELECT * FROM uoms;`);
            res.render('uoms/index', {
                uoms
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/categories/create', async function (req, res) {
        const [categories] = await connection.execute(`SELECT * from categories`);
        const [products] = await connection.execute(`SELECT * FROM products`);
      
        res.render("categories/create", {
            categories, products
        });
    });

    // Process the form to create a new category
    app.post('/categories/create', async function (req, res) {
        const category = req.body.category;
        const query = `
        INSERT INTO categories (category) 
        VALUES (?)
    `;
        const binding = [category];
        const [results] = await connection.execute(query, binding);
        
        res.redirect('/categories');
    });

    app.get('/categories/:category_id/delete', async function (req, res) {
        const sql = "select * from categories where category_id = ?";
        const [categories] = await connection.execute(sql, [req.params.category_id]);
        const category = categories[0];
        res.render('categories/delete', {
            category,
        })
    });


    app.post('/categories/:category_id/delete', async function (req, res) {
        const query = "DELETE FROM categories WHERE category_id = ?";
        await connection.execute(query, [req.params.category_id]);
        res.redirect('/categories');
    });

    // Route to display a table of categories
    app.get('/categories', async function (req, res) {
        try {
            const [categories] = await connection.execute(`SELECT * FROM categories;`);
            res.render('categories/index', {
                categories
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
}




main();

app.listen(3000, () => {
    console.log("server has started");
})
