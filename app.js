const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // for serving static files like HTML

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000  // Set timeout for connection
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB Atlas connection error:", err));

// Define a Mongoose schema for students
const studentSchema = new mongoose.Schema({
    roll_no: { type: Number, required: true, unique: true },
    full_name: { type: String, required: true },
    class: { type: String, required: true },
    birth_date: { type: Date, required: true },
    address: { type: String, required: true },
    enrollment_date: { type: Date, required: true }
});

// Create a Mongoose model based on the schema
const Student = mongoose.model('Student', studentSchema);

// Serve the enrollment form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

// Handle form submission
app.post('/submit', async (req, res) => {
    const { roll_no, full_name, class: studentClass, birth_date, address, enrollment_date } = req.body;

    // Create a new student document
    const newStudent = new Student({
        roll_no,
        full_name,
        class: studentClass,
        birth_date,
        address,
        enrollment_date
    });

    try {
        await newStudent.save();  // Save the student document to the MongoDB database
        res.send('Student enrolled successfully!');
    } catch (error) {
        if (error.code === 11000) {
            res.send('Error: Roll number must be unique.');
        } else {
            res.status(500).send('Error enrolling student: ' + error.message);
        }
    }
});

// Start the server
const port = 3000;
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
