import express from 'express';
import request from 'supertest';

jest.mock('./utils', () => {
  const original = jest.requireActual('./utils');
  return {
    ...original,
    generateSlug: jest.fn((...params) => {
      return original.generateSlug(...params);
    }),
  };
});

import * as utils from './utils';
import { initApp } from './api';

describe('API', () => {
  let app: express.Application;

  beforeAll(async () => {
    const urlDataFile = './urlData.json';
    const fs = require('fs');
    if (fs.existsSync(urlDataFile)) {
      fs.unlinkSync(urlDataFile);
    }

    app = await initApp();
  });

  it('should validate the URL value and presence', async () => {
    let resp = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'invalid' });
    expect(resp.statusCode).toBe(400);

    resp = await request(app).post('/shorten').send({});
    expect(resp.statusCode).toBe(400);
  });

  it('should create a shortened URL', async () => {
    const resp = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toMatchObject({
      originalUrl: 'http://example.com',
      shortUrl: expect.stringMatching(/^.+\/.{6}$/),
    });
  });

  it('should redirect to the original URL', async () => {
    const resp = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });
    expect(resp.statusCode).toBe(200);

    const shortUrl = resp.body.shortUrl;
    const redirectResp = await request(app).get(
      `/${shortUrl.split('/').pop()}`
    );

    expect(redirectResp.statusCode).toBe(302);
    expect(redirectResp.headers.location).toBe('http://example.com');
  });

  it('should return 404 for non-existing URLs', async () => {
    const resp = await request(app).get('/non-existing');
    expect(resp.statusCode).toBe(404);
  });

  it('should make sure the generated slugs are unique', async () => {
    const generateSlugMock = (utils as jest.Mocked<typeof utils>).generateSlug
      .mockClear()
      .mockReturnValueOnce('sameSlug')
      .mockReturnValueOnce('sameSlug')
      .mockReturnValueOnce('sameSlug')
      .mockReturnValueOnce('sameSlug')
      .mockReturnValueOnce('sameSlug')
      .mockReturnValueOnce('otherSlug');

    let resp = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });
    expect(resp.statusCode).toBe(200);

    const slug1 = resp.body.shortUrl.split('/').pop();
    expect(slug1).toBe('sameSlug');

    resp = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });
    expect(resp.statusCode).toBe(200);

    const slug2 = resp.body.shortUrl.split('/').pop();
    expect(slug1).not.toBe(slug2);
    expect(slug2).toBe('otherSlug');

    generateSlugMock.mockReset();
  });
});
