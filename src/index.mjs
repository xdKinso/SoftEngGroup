import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.use(express.static("static"));
app.use(express.json({ charset: 'utf-8' }));

const db = await mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/", async (req, res) => {
  try {
    const sumPopulation = await db.execute("SELECT SUM(Population) FROM country");
    return res.render("index", { sumPopulation: sumPopulation[0][0] });
  } catch (err) {
    console.error(err);
  }
});

app.get("/gallery", (req, res) => {
  res.render("gallery");
});

app.get("/update", (req, res) => {
  res.render("update");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "Team" });
});

app.get("/cities", async (req, res) => {
  try {
    const value = req.query.value || "Cities";
    const search = req.query.search || "";
    const rowLimit = req.query.rowLimit || "10";
    const letter = req.query.letter || "";
    const sort = req.query.sort || "";

    const [countries, _] = await db.execute("SELECT co.Name as CountryName, co.Code as CountryCode FROM country co");
    let rows = [];

    for (const country of countries) {
      if (value === "Cities") {
        const [cities, __] = await db.execute(`
          SELECT ci.Name as CityName, ci.Population as CityPopulation
          FROM city ci
          WHERE ci.CountryCode = ?
        `, [country.CountryCode]);

        cities.forEach(city => {
          rows.push({
            CountryCode: country.CountryCode,
            CountryName: country.CountryName,
            CityName: city.CityName,
            CityPopulation: city.CityPopulation,
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

    if (search) {
      const searchRegex = new RegExp(search, "i");
      rows = rows.filter(row => searchRegex.test(row.CityName));
    }

    if (letter) {
      rows = rows.filter(row => row.CityName && row.CityName[0].toUpperCase() === letter);
    }

    if (value === "Cities") {
      if (sort === "asc") {
        rows.sort((a, b) => a.CityPopulation - b.CityPopulation);
      } else if (sort === "desc") {
        rows.sort((a, b) => b.CityPopulation - a.CityPopulation);
      }
    }

    rows = rows.slice(0, parseInt(rowLimit));

    return res.render("cities", { rows, value, search, rowLimit, letter, sort });
  } catch (err) {
    console.error("Error in /cities route:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
});
  
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });