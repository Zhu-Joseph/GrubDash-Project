const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasName(req, res, next) {
    const { data: {name} = {} } = req.body

    if(name) return next()
    
    next({ status: 400, message:"Requires a valid name"})
}

function hasDescription(req, res, next) {
    const { data: {description} = {} } = req.body

    if(description) return next()
    
    next({ status: 400, message:"Please add a description to your dish"})
}

function hasImage(req, res, next) {
    const { data: {image_url} = {} } = req.body

    if(image_url) return next()
    
    next({ status: 400, message:"image_url"})
}

function hasPrice (req, res, next) {
    const { data: {price} = {} } = req.body

    if(price && price > 0 && typeof(price) === "number") return next()
    
    next({ status: 400, message:"price"})
}

function idMatch (req, res, next) {//may not be used
    const {dishId} = req.params
    const {data : {id} = {} } = req.body

    if(id == dishId || !id) return next()

    next({ status: 400, message: `Dish id does not match route id. Order: ${id}, Route: ${dishId}`})
}

function idExist (req, res, next) {
    const {dishId} = req.params
    const foundId = dishes.find((dish) => dish.id == dishId)

    if(foundId) {
        res.locals.id = foundId 
        return next()
    }

    next({
        status: 404,
        message: `${dishId}`
    })
}

//CHECK FUNCTIONS ABOVE, ACTUAL HTTP VERBS BELOW
function list(req, res) {
    res.json({data: dishes})
}

function create(req, res, next) {
    const {data: { name, description, price, image_url } = {} } = req.body
    const newDish = {
        id: ++dishes.length,
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

const read = (req, res, next) => {
    const {dishId} = req.params
    const foundDish = dishes.find((dish) => dish.id == dishId)

    if(foundDish) {
        res.json({ data: foundDish });
        return next()
    }
    next({
        status: 404,
        message: `${dishId} Missing`
    })
}

const update = (req, res, next) => {
    const {dishId} = req.params
    const dish = res.locals
    const originalName = dish.name
    const originalDescription = dish.description
    const originalPrice = dish.price
    const originalImage = dish.image_url
    const originalId = dish.id //may not need
    const {data: { id, name, description, price, image_url } = {} } = req.body
    


    if(originalName !== name ||
    originalDescription !== description ||
    originalPrice !== price ||
    originalImage !== image_url ||
    originalId !== id) {
        dish.name = name,
        dish.description = description,
        dish.price = price,
        dish.image_url = image_url,
        dish.id = id
    }

    res.json({
        data: {"id": dishId, 
            "name": name, 
            "description": description, 
            "price": price,
            "image_url": image_url
     }
    })
}

module.exports ={
    list,
    create: [hasName, hasDescription, hasImage, hasPrice, create],
    read: [read],
    update: [idExist, hasName, hasDescription, hasImage, hasPrice, idMatch, update]
}