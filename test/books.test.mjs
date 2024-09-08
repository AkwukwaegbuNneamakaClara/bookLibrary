import { app, server } from '../index.js';
import request from 'supertest';
import { expect } from 'chai';
import mysql from 'mysql2/promise';

let db;
let bookId;

before(async function() {
  this.timeout(20000); // Increase timeout to 15 seconds
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true // This option ensures that the SSL certificate is verified
      }
    });

    console.log('Connected to test database.');

    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        published_date DATE,
        isbn VARCHAR(13) UNIQUE
      )
    `);

    console.log('Books table created.');

    const [rows] = await db.execute('SHOW TABLES LIKE "books"');
    if (rows.length === 0) {
      console.error('Books table does not exist.');
    } else {
      console.log('Books table exists.');
    }

    // Insert a book to use its ID for the GET /books/:id test
    const [result] = await db.execute(`
      INSERT INTO books (title, author, published_date, isbn)
      VALUES ('Test Book', 'Test Author', '2021-01-01', '1234567890')
    `);
    bookId = result.insertId;
    console.log('Inserted test book with ID:', bookId);
  } catch (error) {
    console.error('Error during setup:', error);
    throw error; // Fail the setup if there's an error
  }
});

after(async function() {
  this.timeout(20000); // Increase timeout to 15 seconds
  try {
    if (db) {
     await db.execute('DROP TABLE IF EXISTS books');
     await db.end();
     console.log('Cleaned up test database.');
    } 
    if (server) {
        server.close(() => {
          console.log('Closed server.');
          process.exit(0); // Force exit after server is closed
        });
      } else {
        process.exit(0); // Force exit if server is not running
      }
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1); // Exit with error code if cleanup fails
  }
});

describe('Books API', function() {
  this.timeout(20000); // Increase timeout to 15 seconds for all tests

  after(function(done) {
    server.close(done);
  });

  it('should GET all books - small workload', function(done) {
    request(app)
      .get('/books')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should GET a book by ID - medium workload', function(done) {
    request(app)
      .get(`/books/${bookId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id', bookId);
        done();
      });
  });

  it('should POST a new book - high workload', function(done) {
    const newBook = {
      title: 'New Book',
      author: 'Author Name',
      published_date: '2021-01-01',
      isbn: '1234567891'
    };
    request(app)
      .post('/books')
      .send(newBook)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('Book added with ID:');
        done();
      });
  })

  it('should UPDATE a book', function(done) {
    const updatedBook = {
      title: 'Updated Book',
      author: 'Updated Author',
      published_date: '2021-02-01',
      isbn: '0987654321'
    };
    request(app)
      .put(`/books/${bookId}`)
      .send(updatedBook)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal('Book updated successfully');
        done();
      });
  })

  it('should DELETE a book', function(done) {
    request(app)
      .delete(`/books/${bookId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal('Book deleted successfully');
        done();
      });
  })
});
