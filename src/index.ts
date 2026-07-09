import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ergonia API is running...');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
