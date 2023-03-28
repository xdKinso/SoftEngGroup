
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
    const sumPopulation = await db.execute("SELECT SUM(Population) FROM country");
    //console.log(sumPopulation)
    return res.render("index" , { sumPopulation: sumPopulation[0][0] });
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
  res.render("about", { title: "Team" });
});

app.get("/cities", async (req, res) => {
  try {
    // Extract the value parameter from the query string
    const value = req.query.value || "Cities";

    const [countries, _] = await db.execute(`
      SELECT co.Name as CountryName, co.Code as CountryCode
      FROM country co
    `);

    let rows = [];

    for (const country of countries) {
      if (value === "Cities") {
        const [cities, __] = await db.execute(`
          SELECT ci.Name as CityName
          FROM city ci
          WHERE ci.CountryCode = ?
        `, [country.CountryCode]);

        cities.forEach(city => {
          rows.push({
            CountryCode: country.CountryCode,
            CountryName: country.CountryName,
            CityName: city.CityName
          });
        });
      } else if (value === "Country Language") {
        const [languages, __] = await db.execute(`
          SELECT cl.Language
          FROM countrylanguage cl
          WHERE cl.CountryCode = ? AND cl.IsOfficial = 'T'
        `, [country.CountryCode]);

        languages.forEach(language => {
          rows.push({
            CountryCode: country.CountryCode,
            CountryName: country.CountryName,
            Language: language.Language
          });
        });
      } else {
        rows.push({
          CountryCode: country.CountryCode,
          CountryName: country.CountryName
        });
      }
    }

    /* Render cities.pug with data passed as a plain object */
    return res.render("cities", { rows, value });
  } catch (err) {
    console.error("Error in /cities route:", err);
    res.status(500).send("Internal server error: " + err.message);
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

// Update route
app.get("/update", async (req, res) => {
  res.render("update");
});

function onDropdownChange() {
  const dropdown = document.querySelector('select[name="dropdown"]');
  const selectedValue = dropdown.value;

  const table = document.querySelector("table.fade-in");
  table.classList.remove("fade-in");

  setTimeout(() => {
    table.classList.add("fade-in");
    window.location.href = `/cities?value=${selectedValue}`;
  }, 50);
}
