
/* Import dependencies */
/* const express = require("express");
const mysql = require("mysql2/promise"); */
import express from "express";
import mysql from "mysql2/promise";

/* Create express instance */
const app = express();
const port = 3000;

// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));

/* Setup database connection */
const db = await mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});

// Sample API route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Landing route
app.get("/", async (req, res) => {
  try{
    const sumPopulation = await db.execute("SELECT SUM(Population) FROM city ");
    console.log(sumPopulation)
    return res.render("index" , {sumPopulation});
  } catch(err) {
    console.error(err);
  }
  

});

// Gallery route
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

// About route
app.get("/about", (req, res) => {
  res.render("about", { title: "Boring about page" });
});

app.get("/cities", async (req, res) => {
  try {
    // Fetch cities from database
    const [rows, fields] = await db.execute("SELECT * FROM `city`");
    /* Render cities.pug with data passed as plain object */
    return res.render("cities", { rows, fields });
  } catch (err) {
    console.error(err);
  }
});

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT * FROM `city`");
  return res.send(rows);
});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
