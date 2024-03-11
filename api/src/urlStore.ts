import { readFile, writeFile } from 'fs/promises';

type Slug = string;

interface UrlEntry {
  originalUrl: string;
  slug: Slug;
}

abstract class FileStore<
  DataType extends Record<string, unknown> | Array<unknown>,
> {
  protected abstract data: DataType;

  constructor(private dataFile: string) {}

  async load(): Promise<void> {
    try {
      const data = await readFile(this.dataFile, { encoding: 'utf8' });
      this.data = JSON.parse(data);
    } catch {
      return;
    }
  }

  async save(): Promise<void> {
    await writeFile(this.dataFile, JSON.stringify(this.data, null, 2), {
      encoding: 'utf8',
    });
  }
}

export class UrlStore extends FileStore<Record<Slug, UrlEntry>> {
  protected data: Record<Slug, UrlEntry> = {};

  async findUrlBySlug(slug: Slug): Promise<UrlEntry | undefined> {
    return this.data[slug];
  }

  async saveUrlEntry(slug: Slug, originalUrl: string): Promise<void> {
    this.data[slug] = { originalUrl, slug };
    await this.save();
  }
}
