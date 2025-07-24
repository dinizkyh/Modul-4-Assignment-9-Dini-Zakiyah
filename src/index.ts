import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import listsRouter from './api/lists';
import tasksRouter from './api/tasks';
import authRouter from './api/auth';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Fix __dirname for ESM/Vite SSR
// Serve Swagger UI (Vite-compatible)
const openApiSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'docs/openapi.json'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/lists', listsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running.' });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app };
