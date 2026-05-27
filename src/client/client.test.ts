import { describe, it, expect, vi } from 'vitest';
import { createCommunityClient } from './index';

describe('createCommunityClient', () => {
  it('routes pitches.list to GET /api/community/pitches with filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { pitches: [] } }), { status: 200 }),
    );
    const client = createCommunityClient({ baseUrl: '', fetch: fetchMock });

    await client.pitches.list({ status: 'open', tag: 'climate', limit: 30 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/community/pitches?status=open&tag=climate&limit=30');
    expect(opts.method ?? 'GET').toBe('GET');
    expect(opts.credentials).toBe('include');
  });

  it('uses baseUrl prefix when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { pitches: [] } }), { status: 200 }),
    );
    const client = createCommunityClient({ baseUrl: 'https://thewire.test', fetch: fetchMock });
    await client.pitches.list({});
    expect(fetchMock.mock.calls[0][0]).toBe('https://thewire.test/api/community/pitches');
  });

  it('pitches.create POSTs JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: 'p1' } }), { status: 201 }),
    );
    const client = createCommunityClient({ baseUrl: '', fetch: fetchMock });

    await client.pitches.create({
      title: 'Test', summary: 's', body: 'b',
      tags: [{ slug: 'climate', label: 'Climate' }],
      deadlineAt: null,
    });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/community/pitches');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opts.body).title).toBe('Test');
  });

  it('returns null when getPitch hits 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
    const client = createCommunityClient({ baseUrl: '', fetch: fetchMock });
    const pitch = await client.pitches.get('nope');
    expect(pitch).toBeNull();
  });

  it('throws on success: false response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: { code: 'INVALID_PAYLOAD' } }), { status: 422 }),
    );
    const client = createCommunityClient({ baseUrl: '', fetch: fetchMock });
    await expect(client.pitches.list({})).rejects.toThrow('INVALID_PAYLOAD');
  });
});
