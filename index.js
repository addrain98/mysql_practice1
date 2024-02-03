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


    app.get('/products/create', async function (req,res) {
        console.log('hello')
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
}

main();

app.listen(3000, () => {
    console.log("server has started");
})
