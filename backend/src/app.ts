import express from 'express';
import cors from 'cors';
import linksRouter from './routes/links';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/links', linksRouter);

// Redirect route (hot path)
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  // delegate to linksRouter logic by importing controller would create circular; simple inline logic
  const { default: linkController } = await import('./controllers/linkController');
  return linkController.handleRedirect(req, res);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
