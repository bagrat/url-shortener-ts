import { initApp } from './api';

const PORT = 5678;

async function startApp() {
  const app = await initApp();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startApp();
