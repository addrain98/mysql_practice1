const {getAllProducts, createOneProduct, deleteOneProduct, updateOneProduct} = require('../dal/products');

async function getProducts() {
    return await getAllProducts();
}

async function createProduct(data) {
    return await createOneProduct(data);
}

async function deleteProduct(product_id) {
    return await deleteOneProduct(product_id);
}

async function updateProduct(product_id, data) {
    return await updateOneProduct(product_id, data)
}

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct
}