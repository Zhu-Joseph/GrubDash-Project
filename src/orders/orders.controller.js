const { stat } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function hasDeliverTo(req, res, next) {
    const {data: {deliverTo} = {} } = req.body
    
    if(deliverTo) return next()

    next({ status: 400, message:"Requires a deliverTo"})
}

function hasMobileNumber(req, res, next) {
    const {data: {mobileNumber} = {} } = req.body
    
    if(mobileNumber) return next()

    next({ status: 400, message:"mobileNumber"})
}

function hasDishes(req, res, next) {
    const {data: {dishes} = {} } = req.body
    
    if(Array.isArray(dishes) && dishes != "") return next()

    next({ status: 400, message:"dishes"})
}

function hasQuantity(req, res, next) {
    const {data: {dishes} = {} } = req.body
    let dishNum = []

    dishes.map((dish) => {
        if (dish.quantity > 0 && Number.isInteger(dish.quantity)) {            
            dishNum.push(dish)
        } else {
            next({ status: 400, message: `quantity error ${dishes.indexOf(dish)}`})
        }
    })

    if(dishes.length === dishNum.length) return next()
}

function hasStatus(req, res, next) {
    const {data: {status} = {} } = req.body

    if(status && status != "invalid") return next()

    next({ status: 400, message: "status"})
}

function idMatch (req, res, next) {//may not be used
    const {orderId} = req.params
    const {data : {id} = {} } = req.body

    if(id == orderId || !id) return next()

    next({ status: 400, message: `Dish id does not match route id. Order: ${id}, Route: ${orderId}`})
}

function idExist(req, res, next) {
    const {orderId} = req.params
    const foundId = orders.find((order) => order.id == orderId)

    if(foundId) {
        res.locals.id = foundId
        return next()
    }

    next({
        status: 404,
        message: `${orderId}`
    })
}

function isPending(req, res, next) {
    const {orderId} = req.params
    const foundOrder = orders.find((order) => order.id == orderId)

    if(foundOrder.status !== "pending") {return next({ 
        status: 400, 
        message: "An order cannot be deleted unless it is pending"})
    }
    
    return next()
}

//CHECK FUNCTIONS ABOVE, ACTUAL HTTP VERBS BELOW
const list = (req, res, next) => {
    res.json({data: orders})
}

function create(req, res, next) {
    const {data: { deliverTo, mobileNumber, status, dishes } ={} } =req.body
    const newOrder ={
        id: ++orders.length,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

function read (req, res, next) {
    res.json({data: res.locals.id})
}

function update (req, res, next) {
    const {orderId} = req.params
    const order = res.locals
    const originalDeliverTo = order.deliverTo
    const originalMobileNumber = order.mobileNumber
    const originalStatus = order.status
    const originalDishes = order.dishes
    const {data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body

    if(originalDeliverTo !== deliverTo ||
        originalMobileNumber !== mobileNumber ||
        originalStatus !== status ||
        originalDishes !== dishes) {
            order.deliverTo = deliverTo,
            order.mobileNumber = mobileNumber,
            order.status = status,
            order.dishes = dishes
        }
    
    res.json({
        data: {id: orderId,
            "deliverTo": deliverTo,
            "mobileNumber": mobileNumber,
            "status": status,
            "dishes": dishes
        }
    })
}

function destroy(req, res, next) {
    const {orderId} = req.params
    const index = orders.findIndex((order) => order.id == orderId) 

    res.sendStatus(204)
}

module.exports ={
    list,
    create: [hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, create],
    read: [idExist, read],
    update: [idExist, hasStatus, hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, idMatch, update],
    destroy: [idExist, isPending, destroy]
}