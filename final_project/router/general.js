const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios"); 
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password){
    return res.status(400).json({ message: "Username and password are required" });
  }

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await Promise.resolve(books);
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    const findBook = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });

    findBook
        .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch((err) => res.status(404).json({ message: err }));
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author;
    try {
        const authorBooks = await Promise.resolve(
            Object.values(books).filter(b => b.author === author)
        );
        
        if (authorBooks.length > 0) {
            res.status(200).send(JSON.stringify(authorBooks, null, 4));
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const findByTitle = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const filtered = keys
            .filter(k => books[k].title === title)
            .map(k => ({ isbn: k, ...books[k] }));

        if (filtered.length > 0) resolve(filtered);
        else reject("No books found with this title");
    });

    findByTitle
        .then(result => res.status(200).send(JSON.stringify(result, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.send(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
