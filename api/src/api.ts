import express from 'express';
import bodyParser from 'body-parser';
import { UrlStore } from './urlStore';
import { generateSlug, isValidUrl } from './utils';

const app = express();

app.use(bodyParser.json());

const URL_DATA_FILE = './urlData.json';

export async function initApp(): Promise<express.Application> {
  const urlStore = new UrlStore(URL_DATA_FILE);
  await urlStore.load();

  app.set('urlStore', urlStore);

  return app;
}

app.post('/shorten', async (req, res) => {
  const urlStore = app.get('urlStore') as UrlStore;

  const { originalUrl } = req.body;

  if (!originalUrl || !isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  let slug: string;
  do {
    slug = generateSlug();
    // This enusres that the slug is unique.
    // In case of a normal database storage we would use a unique constraint.
    // In case of such a single threaded, single instance application, this is good enough.
  } while (await urlStore.findUrlBySlug(slug));

  await urlStore.saveUrlEntry(slug, originalUrl);

  res.json({ originalUrl, shortUrl: `http://${req.headers.host}/${slug}` });
});

app.get('/:slug', async (req, res) => {
  const urlStore = app.get('urlStore') as UrlStore;

  const { slug } = req.params;
  const urlEntry = await urlStore.findUrlBySlug(slug);

  if (urlEntry) {
    return res.redirect(urlEntry.originalUrl);
  } else {
    return res.status(404).send('Not found');
  }
});
