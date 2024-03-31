const res = require('express/lib/response.js');
const dbtool = require('../dbtool.js')

const getAllProducts = async () => {
    let [products] = await dbtool.pool.execute(`
        SELECT * from products;
    `);

    products.forEach(product => {
        product.exp = new Date(product.exp).toDateString(); // Converts date to a more readable format without time
    });
    return products
}

const createOneProduct = async (data) => {
    let { name, price, description, exp, uom, category } = data;

    try {
        // Convert exp to a proper date format or set it to null if not provided
        if (exp) {
            const expDate = new Date(exp);
            const year = expDate.getFullYear();
            const month = ('0' + (expDate.getMonth() + 1)).slice(-2); // Pad with leading zero
            const day = ('0' + expDate.getDate()).slice(-2); // Pad with leading zero
            exp = `${year}-${month}-${day}`; // Format exp in yyyy-mm-dd format
        } else {
            exp = null; // Set exp to null if it's undefined or not provided
        }

        const query = 'INSERT INTO products (name, price, description, exp, uom, category) VALUES (?, ?, ?, ?, ?, ?)';
        const [results] = await dbtool.pool.execute(query, [name, price, description, exp, uom, category]);

        return results;
    } catch (error) {
        console.error('Error inserting product:', error);
        throw error; // It's better to throw the error so that the caller can handle it appropriately
    }
};

const updateOneProduct = async (product_id, updatedProduct) => {
    let { name, price, description, exp, uom, category } = updatedProduct;
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
                                       uom=?,
                                       category=?
                                    WHERE product_id = ?
            `;
    const bindings = [name, price, description, exp, uom, category, product_id];
    const [result] = await dbtool.pool.execute(query, bindings);
    return result;
}

const deleteOneProduct = async (product_id) => {
    const query = "DELETE FROM products WHERE product_id = ?";
    const [result] = await dbtool.pool.execute(query, [product_id]);
    return result;
}

module.exports = {
    getAllProducts,
    createOneProduct,
    updateOneProduct,
    deleteOneProduct
}