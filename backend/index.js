const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Certifique-se de definir essas variáveis corretamente
const GOOGLE_API_KEY = 'AIzaSyAuFgnn-kbGNkkXGZipRyyije4YcQEilgw'; // Substitua pela sua chave de API do Google
const GOOGLE_CSE_ID = 'e61fe084a04584ffe'; // Substitua pelo seu ID do mecanismo de pesquisa personalizado


const pool = new Pool({
  user: 'eduardosantossm',
  host: 'localhost',
  database: 'shopping_list',
  password: 'mypassword',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/items', async (req, res) => {
  const { name, quantity, price } = req.body;
  try {
    console.log(`Fetching image for item: ${name}`);
    
    // Verifique a URL de requisição e os parâmetros
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(name)}&cx=${GOOGLE_CSE_ID}&searchType=image&key=${GOOGLE_API_KEY}`;
    console.log(`Search URL: ${searchUrl}`);
    
    // Buscar a foto do produto usando a API do Google Imagens
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('Error from Google API:', data.error);
      return res.status(400).json({ error: data.error.message });
    }

    const photoUrl = data.items && data.items.length > 0 ? data.items[0].link : '';
    console.log(`Found image URL: ${photoUrl}`);
    
    // Inserir o item no banco de dados com a URL da foto
    const result = await pool.query(
      'INSERT INTO items (name, quantity, price, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, quantity, price, photoUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

