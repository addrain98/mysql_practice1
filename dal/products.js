const res = require('express/lib/response.js');
const dbtool = require('../dbtool.js')

const getAllProducts = async() => {
    let [products] = await dbtool.pool.execute(`
        SELECT * from products
            JOIN categories ON products.category_id = categories.category_id
            JOIN uoms ON products.uom_id = uoms.uom_id;
    `);

    products.forEach(product => {
        product.exp = new Date(product.exp).toDateString(); // Converts date to a more readable format without time
    });
    return products
}

const createOneProduct = async(data) => {
    let { name, price, description, exp, uom_id, category_id } = data;

            try {
                // Convert any undefined values to null explicitly

                if (exp) {
                    const expDate = new Date(exp);
                    const year = expDate.getFullYear();
                    const month = ('0' + (expDate.getMonth() + 1)).slice(-2); // getMonth() is zero-based; add 1 to compensate and pad with leading 0
                    const day = ('0' + expDate.getDate()).slice(-2); // pad with leading 0
                    exp = `${year}-${month}-${day}`; // reassign exp in yyyy/mm/dd format
                }

                // Check if UOM exists
                const [uoms] = await dbtool.pool.execute('SELECT * FROM uoms WHERE uom_id = ?', [uom_id]);
                if (uoms.length === 0) {
                    return res.status(400).json({
                        'error': 'Invalid UOM ID'
                    });
                }

                // Check if Category exists
                const [categories] = await dbtool.pool.execute('SELECT * FROM categories WHERE category_id = ?', [category_id]);
                if (categories.length === 0) {
                    return res.status(400).json({
                        'error': 'Invalid Category ID'
                    });
                }

                // If all checks pass, insert the product
                const query = 'INSERT INTO products (name, price, description, exp, uom_id, category_id) VALUES (?, ?, ?, ?, ?, ?)';
                console.log({ name, price, description, exp, uom_id, category_id });
                const [results] = await dbtool.pool.execute(query, [name, price, description, exp, uom_id, category_id]);
                return results

            } catch (error) {
                console.error('Error inserting product:', error);
                return
            }
}

const updateOneProduct = async(product_id, updatedProduct) => {
    let { name, price, description, exp, uom_id, category_id } = updatedProduct;
    if (exp) {
        const expDate = new Date(exp);
        const year = expDate.getFullYear();
        const month = ('0' + (expDate.getMonth() + 1)).slice(-2); // getMonth() is zero-based; add 1 to compensate and pad with leading 0
        const day = ('0' + expDate.getDate()).slice(-2); // pad with leading 0
        exp = `${year}-${month}-${day}`; // reassign exp in yyyy/mm/dd format
    }
            const query = `UPDATE products SET name=?,
                                                price =?,
                                                description =?,
                                                exp =?,
                                                uom_id=?,
                                                category_id=?
                                            WHERE product_id = ?
            `;
            const bindings = [name, price, description, exp, uom_id, category_id, product_id];
            const [result] = await dbtool.pool.execute(query, bindings);
            return result;
}

const deleteOneProduct = async(product_id) => {
    const query = "DELETE FROM products WHERE product_id = ?";
    const [result] = await dbtool.pool.execute(query, [product_id]);
    return result;
}

module.exports = {getAllProducts,
                  createOneProduct,
                  updateOneProduct,
                  deleteOneProduct
                 }