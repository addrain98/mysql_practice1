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
        const {name, price, description, exp, uom_id, category_id} = req.body;
        await connection.execute(query, bindings);
        res.redirect('products');
    })

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

    app.get('/products/:product_id/update', async function (req, res) {
        const query = "SELECT * FROM products WHERE product_id = ?";
        const [products] = await connection.execute(query, [req.params.product_id]);
        const product = products[0];
    
        const [category] = await connection.execute(`SELECT * from categories`);
        const [uom] = await connection.execute(`SELECT * from uoms`);
    
        res.render('products/update', {
            product, category, uom
        })
    });
    
    app.post('/customers/:customer_id/update', async function (req, res) {
        const { name, price, description, exp, uom_id, category_id } = req.body;
        const query = `UPDATE products SET name=?,
                                            price =?,
                                            description =?,
                                            exp =?,
                                            uom_id=?,
                                            category_id
                                        WHERE product_id = ?
        `;
        const bindings = [name, price, description, exp, uom_id, category_id, req.params.product_id];
        await connection.execute(query, bindings);
        res.redirect('/products');
    })
}




main();

app.listen(3000, () => {
    console.log("server has started");
})
