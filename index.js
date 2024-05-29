require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'booklibrary'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.post('/books', (req, res) => {
    const { title, author, published_date, isbn } = req.body;
    const query = 'INSERT INTO books (title, author, published_date, isbn) VALUES (?, ?, ?, ?)';
    db.query(query, [title, author, published_date, isbn], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send(`Book added with ID: ${result.insertId}`);
    });
});

// Read all books
app.get('/books', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).json(results);
    });
});

// Read a specific book
app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).json(results[0]);
    });
});

// Update a book
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, published_date, isbn } = req.body;
    const query = 'UPDATE books SET title = ?, author = ?, published_date = ?, isbn = ? WHERE id = ?';
    db.query(query, [title, author, published_date, isbn, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).send('Book updated successfully');
    });
});

// Delete a book
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).send('Book deleted successfully');
    });
});
if (require.main === module) {
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
} else {
    module.exports = app;
}