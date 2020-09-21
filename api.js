const Koa = require("koa")
const bodyparser = require("koa-bodyparser")
const server = new Koa()

// Use koa-bodyparser
server.use(bodyparser())

/**
 * STRUCTURE PRODUCT
 *  - id - number or string
 *  - name - string
 *  - amount - number
 *  - price - number
 *  - delete - boolean
 */
const products = [{
    id: 1,
    name: "Camisa Xadrez",
    amount: 10,
    price: 25000,
    weight: null,
    description: "Camisa quadriculada na cor branca e vermelha.",
    delete: false
}]

const orders = [{
    id: 1,
    products: [{
        id: 1,
        name: "Camisa Xadrez",
        amount: 5,
        price: 25000
    }],
    status: "incomplete",
    idClient: 1,
    totalPrice: 25000,
    delete: false
}]

/**
 * ROUTES AND METHODS - PRODUCTS
 * - CREATE NEW PRODUCT - POST - PRODUCTS
 * - GET PRODUCT INFORMATION - GET - PRODUCTS/:ID
 * - GET ALL PRODUCTS - GET - PRODUCTS
 * - UPDATE PRODUCT - PUT - PRODUCTS/:ID
 * - DELETE PRODUCT - DELETE - PRODUCTS/:ID
 */
const getAllProducts = () => {
    return products
}

const getProductById = (id) => {
    return products.find(product => product.id === id && product.delete === false)
}

const getIndexProductById = (id) => {
    return products.findIndex(product => product.id === id && product.delete === false)
}

const createProduct = (product) => {
    if (product == null) return null

    const newProduct = {
        id: products.length + 1,
        name: product.name,
        amount: product.amount,
        price: product.price,
        weigth: (product.weigth !== undefined) ? product.weigth : null,
        description: (product.description !== undefined) ? product.description : null,
        delete: false,
    }

    products.push(newProduct)
    return newProduct
}

const updateProduct = (id, data) => {
    if (id == null || data == null || typeof data !== "object") return null

    const product = getProductById(id)
    const index = getIndexProductById(id)

    const newProduct = {
        id: product.id,
        name: (data.name !== undefined) ? data.name : product.name,
        amount: (data.amount !== undefined) ? data.amount : product.amount,
        price: (data.price !== undefined) ? data.price : product.price,
        weigth: (data.weigth !== undefined) ? data.weigth : product.weight,
        description: (data.description !== undefined) ? data.description : product.description,
        delete: false
    }

    products.splice(index, 1, newProduct)
    return newProduct

}

const removeProduct = (id) => {
    if (id == null) return null

    const product = getProductById(id)
    const index = getIndexProductById(id)

    const deleteProduct = {
        id: product.id,
        name: product.name,
        amount: product.amount,
        price: product.price,
        weigth: product.weight,
        description: product.description,
        delete: true
    }

    products.splice(index, 1, deleteProduct)
    return deleteProduct
}

const decreaseAmountOfAProduct = (id, amount) => {
    const index = getIndexProductById(id)
    products[index].amount = products[index].amount - amount
}

/**
 * FUNCTIONS AUXILIARES
 */
const checkPropertiesProduct = (product = {}, mandatory = true) => {

    const name = (product.name !== undefined) ? typeof product.name === "string" : !mandatory

    const amount = (product.amount !== undefined) ? typeof product.amount === "number" && product.amount >= 0 : !mandatory

    const price = (product.price !== undefined) ? typeof product.price === "number" && product.price >= 0 : !mandatory

    const weigth = (product.weigth !== undefined) ? (typeof product.weigth === "number" || product.weight === null) : true

    const description = (product.description !== undefined) ? (typeof product.description === "string" || product.description === null) : true

    return name && amount && price && weigth && description
}


/**
* ROUTES AND METHODS - ORDERS
* - CREATE NEW ORDER - POST - ORDERS
* - GET ORDER INFORMATION - GET - ORDERS/:ID
* - GET ALL ORDERS - GET - ORDERS
* - UPDATE ORDER - PUT - ORDERS/:ID
* - ADD PRODUCTS TO AN ORDER"S PRODUCT LIST - PUT - ORDERS/:ID
* - DELETE ORDER - DELETE - ORDERS/:ID
 */

/**
* STRUCTURE ORDER
*  - id - number or string
*  - products - array of products
*  - status - string [incomplete, processing, paid, shipped, delivered or canceled]
*  - idClient - string
*  - totalPrice - number
*  - delete - boolean
*/

const getAllOrders = () => {
    return orders.find(order => order.delete === false)
}

const getDeliveredOrders = () => {
    return orders.filter(order => order.status === "delivered" && order.delete === false)
}

const getPaidOrders = () => {
    return orders.filter(order => order.status === "paid" && order.delete === false)
}

const getProcessingOrders = () => {
    return orders.filter(order => order.status === "processing" && order.delete === false)
}

const getCanceledOrders = () => {
    return orders.filter(order => order.status === "canceled" && order.delete === false)
}

const getOrderById = (id) => {
    return orders.find(order => order.id === id && order.delete === false)
}

const getIndexOrderByIdClient = (idClient) => {
    return orders.findIndex(order => order.idClient === idClient && order.delete === false)
}

const getIndexOrderById = (id) => {
    return orders.findIndex(order => order.id === id && order.delete === false)
}

const getIndexProductInOrderById = (index, id) => {
    return orders[index].products.findIndex(product => product.id === id && product.delete === false)
}

/**
* STRUCTURE ORDER
*  - id - number or string
*  - products - array of products
*  - status - string [incomplete, processing, paid, shipped, delivered or canceled]
*  - idClient - string
*  - totalPrice - number
*  - delete - boolean
*/
const addProductToOrder = (idClient, productCart) => {

    let totalPrice = productCart.amount * productCart.price
    decreaseAmountOfAProduct(productCart.id, productCart.amount)

    const index = getIndexOrderByIdClient(idClient)

    let order = []

    if (index === -1) {
        order = {
            id: orders.length + 1,
            products: [
                productCart
            ],
            status: "incomplete",
            idClient: idClient,
            totalPrice: totalPrice,
            delete: false
        }

        orders.push(order)

    } else {
        const orderExist = orders[index]
        let allProducts = orderExist.products

        const productIndexInOrder = allProducts.findIndex((product) => product.id === productCart.id)

        if (productIndexInOrder === -1) {
            allProducts.push(productCart)
            totalPrice = allProducts.reduce((total, item) => {
                return item.amount * item.price + total
            }, 0)
        } else {
            allProducts[productIndexInOrder].amount += productCart.amount
            totalPrice = orderExist.totalPrice + totalPrice
        }

        order = {
            id: orderExist.id,
            products: allProducts,
            status: "incomplete",
            idClient: idClient,
            totalPrice: totalPrice,
            delete: false
        }

        orders.splice(index, 1, order)
    }

    return order

}

const updateAmountProductInOrder = (id, productCart, amount) => {
    const index = getIndexOrderById(id)

    const orderExist = orders[index]
    let allProducts = orderExist.products

    let total = 0

    allProducts.forEach((item, index) => {
        if (item.id !== productCart.id) {
            total = item.amount * item.price + total
        } else {
            indexProduct = index
        }
    }, 0)

    allProducts.splice(indexProduct, 1, productCart)

    allProducts[indexProduct].amount = allProducts[indexProduct].amount - amount

    const totalPrice = total + amount * productCart.price

    const order = {
        id: orderExist.id,
        products: allProducts,
        status: "incomplete",
        idClient: orderExist.idClient,
        totalPrice: totalPrice,
        delete: false
    }
    orders.splice(index, 1, order)
    // decreaseAmountOfAProduct(productCart.id, amount)
    return order
}

const modifyOrderStatus = (id, status) => {
    const index = getIndexOrderById(id)
    const orderExist = orders[index]

    let order = []

    order = {
        id: orderExist.id,
        products: orderExist.products,
        status: status,
        idClient: orderExist.idClient,
        totalPrice: orderExist.totalPrice,
        delete: false
    }

    orders.splice(index, 1, order)

    return order
}


const removeOrder = (id) => {
    const index = getIndexOrderById(id)
    const orderExist = getOrderById(id)

    const deleteOrder = {
        id: orderExist.id,
        products: orderExist.products,
        status: orderExist.status,
        idClient: orderExist.idClient,
        totalPrice: orderExist.totalPrice,
        delete: true
    }

    orders.splice(index, 1, deleteOrder)

    return deleteOrder
}

const removeProductInOrder = (id, productId) => {
    const index = getIndexOrderById(id)
    const orderExist = getOrderById(id)

    const productIndex = orderExist.products.findIndex(item => item.id === productId)
    
    orderExist.products.splice(productIndex, 1)

    const order = {
        id: orderExist.id,
        products: orderExist.products,
        status: orderExist.status,
        idClient: orderExist.idClient,
        totalPrice: orderExist.totalPrice,
        delete: false
    }

    orders.splice(index, 1, order)

    return order
}

/// 

const checkAmountAvailable = (productCart, productData) => {
    if (productData == null || productData == null) return false
    return productData.amount >= productCart.amount && productData.amount > 0
}

const checkAmountAvailableInUpdate = (product, order, amount) => {
    let indexProduct = -1
    order.products.forEach((item, index) => {
        if (item.id === product.id) {
            indexProduct = index
        }
    })
    let total = -1
    total = product.amount + order.products[indexProduct].amount - amount
    return total >= 0
}


/**
 * RESPONSES
 */
const responseError = (message) => {
    return {
        stauts: "error",
        message: message
    }
}
const responseSuccess = (entity) => {
    return {
        status: "success",
        data: entity
    }
}

/**
 * ROUTES 
 * BELOW THE APPLICATION ROUTES
 */

server.use(ctx => {
    const paraments = (ctx.url).split("/").filter(item => item)
    const totalParaments = paraments.length
    
    const primaryParament = (paraments[0] && typeof paraments[0] === "string") ? paraments[0] : null
    const id = (paraments[1] && typeof isNaN(paraments[1])) ? Number(paraments[1]) : null
    const method = ctx.method
    let body = ctx.request.body
    
    const query = ctx.request.query ? ctx.request.query : false

    if (primaryParament.includes("products") && totalParaments === 1) {
        if (method === "GET") {
            const allProducts = getAllProducts()
            ctx.status = 200
            ctx.body = responseSuccess(allProducts)
        } else if (method === "POST") {
            const propertiesProduct = checkPropertiesProduct(body, true)

            if (propertiesProduct) {
                const product = createProduct(body)
                ctx.status = 200
                ctx.body = responseSuccess(product)
            } else if (!propertiesProduct) {
                ctx.status = 400
                ctx.body = responseError("Poorly formatted content")
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found page!")
            }
        }
    } else if (primaryParament.includes("products") && id && totalParaments === 2) {
        if (method === "GET") {
            const product = getProductById(id)

            if (product) {
                ctx.status = 200
                ctx.body = responseSuccess(product)
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found product!")
            }
        } else if (method === "PUT") {
            const product = getProductById(id)
            const propertiesProduct = checkPropertiesProduct(body, false)

            if (product && propertiesProduct) {
                const updatedProduct = updateProduct(id, body)
                ctx.status = 200
                ctx.body = responseSuccess(updatedProduct)
            } else if (!propertiesProduct) {
                ctx.status = 400
                ctx.body = responseError("Poorly formatted content")
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found product!")
            }
        } else if (method === "DELETE") {
            const product = getProductById(id)

            if (product) {
                const isProduct = removeProduct(id)
                ctx.status = 200
                ctx.body = responseSuccess(isProduct)
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found product!")
            }
        }
    } else if (primaryParament.includes("orders") && totalParaments === 1 ) {
        
        if (method === "GET" && query.status === undefined) {

            const allOrders = getAllOrders()
            ctx.status = 200
            ctx.body = responseSuccess(allOrders)

        } else if (method === "GET" && query.status !== undefined) {
            
            const status = query.status
            if(status === "processing") {
                const response = getProcessingOrders()
                ctx.status = 200
                ctx.body = responseSuccess(response)
            } else if (status === "paid") {
                const response = getPaidOrders()
                ctx.status = 200
                ctx.body = responseSuccess(response)
            } else if (status === "delivered") {
                const response = getDeliveredOrders()
                ctx.status = 200
                ctx.body = responseSuccess(response)
            } else if (status === "canceled") {
                const response = getCanceledOrders()
                ctx.status = 200
                ctx.body = responseSuccess(response)
            } else {
                ctx.status = 400
                ctx.body = responseError(`Status not implemented - ${order.status}`)
            }
            
        } else if (method === "POST") {

            const productBodyData = body.products[0] ? body.products[0] : null
            const productData = getProductById(productBodyData.id)
            const sizeProductData = Array(productData).length
            const allPropertiesAreCorrect = checkPropertiesProduct(productBodyData)
            const sizeArrayBody = Array(productBodyData).length
            const productsExist = sizeProductData === sizeArrayBody && sizeArrayBody === 1

            if (productsExist && allPropertiesAreCorrect) {

                const amountAvailable = checkAmountAvailable(productBodyData, productData)

                if (amountAvailable) {
                    const newOrder = addProductToOrder(1, productBodyData)
                    ctx.status = 200
                    ctx.body = newOrder
                } else {
                    ctx.status = 400
                    ctx.body = responseError("Amount of products unavailable")
                }

            } else if (productsExist && !allPropertiesAreCorrect) {
                ctx.status = 400
                ctx.body = responseError("Poorly formatted content")
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found product!")
            }
        }

    } else if (primaryParament.includes("orders") && id && totalParaments === 2) {
        if (method === "GET") {
            const order = getOrderById(id)
            if (order) {
                ctx.status = 200
                ctx.body = responseSuccess(order)
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found order!")
            }
        } else if (method === "POST") {

            const status = body.status ? body.status : false

            const product = body.id ? getProductById(body.id) : false
            const amount = body.amount ? body.amount : false
            const order = getOrderById(id)

            const validationCamps = body.id && body.amount ? typeof body.id === 'number'
                && typeof body.amount === 'number' : false

            if (status) {
                const allowedStates = ["processing", "paid", "shipped", "delivered", "canceled"]
                const order = getOrderById(id)

                const validateStatus = status ?
                    allowedStates.some(item => item === status)
                    && order.status !== "canceled" : false

                if (order && validateStatus) {
                    const order = modifyOrderStatus(id, status)
                    ctx.status = 200
                    ctx.body = responseSuccess(order)
                } else if (!validateStatus) {
                    ctx.status = 400
                    ctx.body = responseError("Poorly formatted content")
                } else {
                    ctx.status = 404
                    ctx.body = responseError("Not found order!")
                }
            } else if (product && amount && order && validationCamps && order.status === "incomplete") {

                const amountAvailable = checkAmountAvailableInUpdate(product, order, amount)

                if (amountAvailable) {
                    const updateAmountProduct = updateAmountProductInOrder(id, product, amount)
                    ctx.status = 200
                    ctx.body = responseSuccess(updateAmountProduct)
                } else if (!amountAvailable) {
                    ctx.status = 400
                    ctx.body = responseError("Amount of products unavailable")
                }

            } else if (order.status !== "incomplete") {
                ctx.status = 400
                ctx.body = responseError(`Forbidden to change an order with the status ${order.status}`)
            } else if (!validationCamps) {
                ctx.status = 400
                ctx.body = responseError("Poorly formatted content")
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found order!")
            }
        } else if (method === "DELETE") {

            const order = getOrderById(id)
            const productId = body.id  && order ? order.products.find((item) => {
                                            return item.id === body.id
                                        }) : false

            if (order && order.status === "incomplete") {
                if(!productId) {
                    const orderRemove = removeOrder(id)
                    ctx.status = 200
                    ctx.body = responseSuccess(orderRemove)
                } else if (productId) {
                    const productRemove = removeProductInOrder(id, body.id)
                    ctx.status = 200
                    ctx.body = responseSuccess(productRemove)
                }
            } else {
                ctx.status = 404
                ctx.body = responseError("Not found order!")
            }

        }

    } else {
        ctx.status = 404
        ctx.body = responseError("Not found page!")
    }

})

// Initiate server Koa
server.listen(8081, () => {
    console.log("Server running on localhost:8081")
})