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
    const connection = await mysql12.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB.PASSWORD
    });

    app.get('/products', async function(req, res) {
        const [customers] = await connection.execute(`
            SELECT * from products
                JOIN categories ON products.category_id = categories.category_id
                JOIN uom ON products.uom_id = uom.uom_id;
        `);
        res.render('products/index', {
            products
        })
    })


    /*app.get('customers/create', async function (req,res) {
        const []
    })*/
}


