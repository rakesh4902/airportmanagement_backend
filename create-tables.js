const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, 'airports.db');
const db = new sqlite3.Database(dbPath);

// Function to initialize the database
function initializeDatabase() {
  db.serialize(() => {
    // Create Airport table
    db.run(`CREATE TABLE IF NOT EXISTS Airport (
      id INTEGER PRIMARY KEY,
      icao_code TEXT,
      iata_code TEXT,
      name TEXT,
      type TEXT,
      city_id INTEGER,
      country_id INTEGER,
      continent_id INTEGER,
      latitude_deg REAL,
      longitude_deg REAL,
      elevation_ft REAL
    )`);

    // Create City table
    db.run(`CREATE TABLE IF NOT EXISTS City (
      id INTEGER PRIMARY KEY,
      name TEXT,
      country_id INTEGER,
      is_active BOOLEAN,
      lat REAL,
      long REAL
    )`);

    // Create Country table
    db.run(`CREATE TABLE IF NOT EXISTS Country (
      id INTEGER PRIMARY KEY,
      name TEXT,
      country_code_two TEXT,
      country_code_three TEXT,
      mobile_code INTEGER,
      continent_id INTEGER
    )`);
  });
}

// Function to insert data from CSV files into the tables
function insertData() {
  // Insert data into Airport table
  fs.createReadStream('Database - airport.csv')
    .pipe(csv())
    .on('data', (row) => {
      db.run(
        `INSERT INTO Airport (id, icao_code, iata_code, name, type, city_id, country_id, continent_id, latitude_deg, longitude_deg, elevation_ft)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.icao_code,
          row.iata_code,
          row.name,
          row.type,
          row.city_id,
          row.country_id,
          row.continent_id,
          row.latitude_deg,
          row.longitude_deg,
          row.elevation_ft
        ]
      );
    })
    .on('end', () => {
      console.log('Airport data inserted successfully!');
    });

  // Insert data into City table
  fs.createReadStream('Database - city.csv')
    .pipe(csv())
    .on('data', (row) => {
      db.run(
        `INSERT INTO City (id, name, country_id, is_active, lat, long)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.name,
          row.country_id,
          row.is_active,
          row.lat,
          row.long
        ]
      );
    })
    .on('end', () => {
      console.log('City data inserted successfully!');
    });

  // Insert data into Country table
  fs.createReadStream('Database - country.csv')
    .pipe(csv())
    .on('data', (row) => {
      db.run(
        `INSERT INTO Country (id, name, country_code_two, country_code_three, mobile_code, continent_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.name,
          row.country_code_two,
          row.country_code_three,
          row.mobile_code,
          row.continent_id
        ]
      );
    })
    .on('end', () => {
      console.log('Country data inserted successfully!');
    });
}

// Initialize the database and insert data
initializeDatabase();
insertData();
