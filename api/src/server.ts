import express from 'express';

const app = express();
const PORT = 5678;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('This is URL Shortener API');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
