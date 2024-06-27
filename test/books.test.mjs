import { expect } from 'chai';
import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../index.js';

let db;

before(async () => {
    db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || '3306',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'booklibrary_test'
    });

    await db.query(`
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            author VARCHAR(255),
            published_date DATE,
            isbn VARCHAR(255)
        );
    `);
});

/*
beforeEach(async () => {
    await db.query('DELETE FROM books');
    await db.query(`
        INSERT INTO books (title, author, published_date, isbn)
        VALUES ('Test Book', 'Test Author', '2023-01-01', '1234567890');
    `);
});
*/

after(async () => {
    await db.query('DROP TABLE IF EXISTS books');
    await db.end();
    server.close(); // Close the server after tests
});

describe('Books API', () => {
    it('should GET all books', done => {
        request(app)
            .get('/books')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    /*
    it('should GET a book by ID', done => {
        request(app)
            .get('/books/1')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                done();
            });
    });
    */

    it('should POST a new book', done => {
        request(app)
            .post('/books')
            .send({ title: 'Another Test Book', author: 'Another Test Author', published_date: '2024-01-01', isbn: '0987654321' })
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(201);
                expect(res.text).to.include('Book added with ID:');
                done();
            });
    });

    /*
    it('should UPDATE a book', done => {
        request(app)
            .put('/books/1')
            .send({ title: 'Updated Book', author: 'Updated Author', published_date: '2024-01-01', isbn: '1111111111' })
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('Book updated successfully');
                done();
            });
    });
    */

    /*
    it('should DELETE a book', done => {
        request(app)
            .delete('/books/1')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('Book deleted successfully');
                done();
            });
    });
    */
});
    