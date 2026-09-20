// ==========================================
// FOOD DELIVERY SYSTEM BACKEND
// NODE.JS + EXPRESS + MONGODB
// ==========================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// DATABASE CONNECTION
// ==========================================
mongoose.connect("mongodb://127.0.0.1:27017/foodDeliveryDB")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });

// ==========================================
// SCHEMAS (Database Structure)
// ==========================================
const orderSchema = new mongoose.Schema({
    items: [
        {
            itemName: String,
            quantity: Number,
            price: Number
        }
    ],
    grandTotal: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Pizza, Burger
    cuisine: { type: String, required: true },
    price: { type: Number, required: true },
    veg: { type: Boolean, required: true }
});
const Menu = mongoose.model("Menu", menuSchema);


// ==========================================
// RESTAURANT APIs
// ==========================================
app.post("/restaurants", async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        res.status(201).json({ message: "Restaurant Added Successfully", restaurant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// MENU APIs
// ==========================================
app.post("/menu", async (req, res) => {
    try {
        const menu = new Menu(req.body);
        await menu.save();
        res.status(201).json({ message: "Menu Item Added", menu });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/menu", async (req, res) => {
    try {
        const menu = await Menu.find();
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Filter API for categories and prices
app.get("/menu/filter", async (req, res) => {
    try {
        const { veg, cuisine, minPrice, maxPrice } = req.query;
        let filter = {};
        
        if (veg !== undefined) {
            filter.veg = veg === "true";
        }
        if (cuisine) {
            filter.cuisine = cuisine;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        const menu = await Menu.find(filter);
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ORDER APIs
// ==========================================
app.post("/orders", async (req, res) => {
    try {
        const { items, grandTotal } = req.body;

        // Ensure the order isn't empty
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order cannot be empty" });
        }

        const newOrder = new Order({ items, grandTotal });
        await newOrder.save();

        res.status(201).json({ message: "Order Placed Successfully", orderId: newOrder._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});