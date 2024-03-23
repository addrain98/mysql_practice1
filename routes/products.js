const express = require('express');
const router = express.Router();

const {getProducts, createProduct, updateProduct, deleteProduct} = require('../services/products')

router.get('/', async function(req, res) {
    const productData = await getProducts()
    res.json(productData)
})

router.post('/', async function(req,res) {
    const data = createProduct(
        req.body 
    );
    res.json(data)
})

router.put('/:product_id', async function(req,res) {
    const data = await updateProduct(req.params.product_id, req.body)
    res.json(data);
})

router.delete('/:product_id', async function(req,res) {
    const data = await deleteProduct(req.params.product_id)
    res.json(data);
})

module.exports = router