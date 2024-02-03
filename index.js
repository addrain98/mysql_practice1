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
wax.setLayoutPath('.views/layout');

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


    app.get('customers/create', async function (req,res) {
        const [categories] = await connection.execute(`SELECT * from categories`);
        res.render("products/create", {
            categories
        });

        const [uoms] = await connection.execute(`SELECT * from uoms`);
        res.render("products/create", {
            uoms
        });
    })
}

main();

app.listen(3000, () => {
    console.log("server has started");
})
