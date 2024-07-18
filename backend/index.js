const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'eduardosantossm',
  host: 'localhost',
  database: 'shopping_list',
  password: 'mypassword',
  port: 5432,
});

const UNSPLASH_ACCESS_KEY = 'pj43PI4w7pkvA28-Ge8Aki7c6ypf455B83vzKNLYrs8';

app.use(cors());
app.use(bodyParser.json());

app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/items', async (req, res) => {
  const { name, quantity, price } = req.body;
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${name}&client_id=${UNSPLASH_ACCESS_KEY}`);
    const data = await response.json();
    const photoUrl = data.results.length > 0 ? data.results[0].urls.small : '';

    const result = await pool.query(
      'INSERT INTO items (name, quantity, price, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, quantity, price, photoUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
