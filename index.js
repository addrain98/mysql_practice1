const express = require('express');
const dotenv = require('dotenv');
const hbs = require('hbs');
const wax = require('wax-on');
const handlebarHelpers = require('handlebars-helpers')({
    'handlebars': hbs.handlebars
});
const cors = require('cors')
const dbtool = require('./dbtool.js')
const productRoute = require('./routes/products.js')

dotenv.config();

let app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.set('view engine', 'hbs');

wax.on(hbs.handlebars);
wax.setLayoutPath('views/layouts');


async function main() {
    await dbtool.connect();
    //read
    app.use('/products', productRoute)
}





main();

app.listen(3000, () => {
    console.log("server has started");
})
