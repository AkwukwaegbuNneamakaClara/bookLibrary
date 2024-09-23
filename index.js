import 'dotenv/config'; // Automatically loads environment variables from a .env file
import express from 'express';
import mysql from 'mysql2/promise'; // Using promise-based API
import bodyParser from 'body-parser';

const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

let db;

const initializeDbConnection = async () => {
    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME,
       /*ssl: {
            rejectUnauthorized: true // This option ensures that the SSL certificate is verified
          }*/
    });

    try {
        console.log('Connected to the MySQL database.');
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
};

// Initialize DB connection
initializeDbConnection();

// Define your routes here
app.post('/books', async (req, res) => {
    const { title, author, published_date, isbn } = req.body;
    const query = 'INSERT INTO books (title, author, published_date, isbn) VALUES (?, ?, ?, ?)';
    try {
        const [result] = await db.execute(query, [title, author, published_date, isbn]);
        res.status(201).send(`Book added with ID: ${result.insertId}`);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read all books
app.get('/books', async (req, res) => {
    try {
        console.log('Received request to fetch all books');
        const [results] = await db.execute('SELECT * FROM books');
        console.log('Books fetched:', results);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).send(err);
    }
});

// Read a specific book
app.get('/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        if (results.length === 0) {
            res.status(404).send('Book not found');
        } else {
            res.status(200).json(results[0]);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update a book
app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, published_date, isbn } = req.body;
    const query = 'UPDATE books SET title = ?, author = ?, published_date = ?, isbn = ? WHERE id = ?';
    try {
        const [result] = await db.execute(query, [title, author, published_date, isbn, id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Book not found');
        } else {
            res.status(200).send('Book updated successfully');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a book
app.delete('/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM books WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Book not found');
        } else {
            res.status(200).send('Book deleted successfully');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
