const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const dbPath = path.join(__dirname, 'airports.db');
const db = new sqlite3.Database(dbPath);

app.use(express.json());

app.get('/airport/:iata_code', (req, res) => {
  const iataCode = req.params.iata_code;

  const query = `
    SELECT
      a.id AS airport_id,
      a.icao_code,
      a.iata_code,
      a.name AS airport_name,
      a.type AS airport_type,
      a.latitude_deg,
      a.longitude_deg,
      a.elevation_ft,
      c.id AS city_id,
      c.name AS city_name,
      c.country_id AS city_country_id,
      c.is_active AS city_is_active,
      c.lat AS city_lat,
      c.long AS city_long,
      co.id AS country_id,
      co.name AS country_name,
      co.country_code_two,
      co.country_code_three,
      co.mobile_code,
      co.continent_id
    FROM
      Airport a
      LEFT JOIN City c ON a.city_id = c.id
      LEFT JOIN Country co ON a.country_id = co.id
    WHERE
      a.iata_code = ?`;

  db.get(query, [iataCode], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Airport not found' });
      return;
    }

    const response = {
      airport: {
        id: row.airport_id,
        icao_code: row.icao_code,
        iata_code: row.iata_code,
        name: row.airport_name,
        type: row.airport_type,
        latitude_deg: row.latitude_deg,
        longitude_deg: row.longitude_deg,
        elevation_ft: row.elevation_ft,
        address: {
          city: {
            id: row.city_id,
            name: row.city_name,
            country_id: row.city_country_id,
            is_active: row.city_is_active,
            lat: row.city_lat,
            long: row.city_long,
          },
          country: row.country_id
            ? {
                id: row.country_id,
                name: row.country_name,
                country_code_two: row.country_code_two,
                country_code_three: row.country_code_three,
                mobile_code: row.mobile_code,
                continent_id: row.continent_id,
              }
            : null,
        },
      },
    };

    res.json(response);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
