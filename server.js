const express = require('express');  // Import Express.js
const app = express(); // Create an Express application
const User = require("./models/User")
require('dotenv').config();
const port = process.env.PORT || 5000 // Define a port number for the server
const mongoose = require('mongoose');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error", err))

//Built In Middleware
app.use(express.json()); //Parses JSON requests
app.use(express.urlencoded({ extended: true })); //Parses URL-encoded data


// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Express API with Swagger",
            version: "1.0.0",
            description: "A simple CRUD API with Swagger documentation",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: ["./server.js"], // File where Swagger documentation is written
};


// Initialize Swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Adds a new user to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request
 */
app.post("/users", async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "Bad Request" });
    }
});


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Fetch all users from the database.
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Internal Server Error
 */
app.get("/users", async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    }catch (error){
        res.status(500).json({ error: "Internal Server Error"})
    }
});




/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Updates an existing user's details by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.put("/users/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
});



/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
app.delete("/users/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send("User deleted");
});

// Start the server
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`)
});
