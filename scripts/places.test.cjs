const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'xmum-data.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(root, 'app.js'), 'utf8').replace(/^init\(\);\s*$/m, '');

function storage() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
}

function app(fetcher) {
  const nodes = new Map();
  const context = vm.createContext({
    TOMTOM_KEY: 'test-key', URLSearchParams, AbortSignal, AbortController, setTimeout, clearTimeout, console,
    localStorage: storage(), sessionStorage: storage(),
    fetch: fetcher || (() => { throw new Error('Unexpected fetch'); }),
    document: { querySelector: key => {
      if (!nodes.has(key)) nodes.set(key, { textContent: '', disabled: false });
      return nodes.get(key);
    } },
  });
  vm.runInContext(source + `
    renderAll = () => {};
    renderNearby = () => {};
    updatePoolInfo = () => {};
    globalThis.api = {
      searchTomTom, loadTomTom, tomtomCentre, loadGooglePlaces, loadXmumLive, loadNearby, allXmum, setLive, buildPool,
      nearby: () => nearby,
      live: () => xmumLive,
      location: value => { state.settings.location = value; },
    };
  `, context);
  return { ...context.api, context, nodes };
}

const ok = data => ({ ok: true, json: async () => data });
const poi = (id, name = `Place ${id}`) => ({ id, poi: { name }, position: { lat: 2.82, lon: 101.7 }, address: { freeformAddress: 'Kota Warisan, Sepang' } });
const params = url => new URL(url).searchParams;

test('off-campus chain branches survive and results stay scoped to their area', async () => {
  const a = app(async () => ok({ results: [poi('zus', 'ZUS Coffee (Kota Warisan)'), poi('chinese', '小食堂')] }));
  const result = await a.searchTomTom({ lat: 2.82, lon: 101.7 }, 2500, 'warisan');
  assert.equal(result.places.length, 2);
  a.setLive({ sunsuria: [], warisan: result.places }, 'tomtom');
  const places = a.allXmum();
  assert(places.some(p => p.area === 'campus' && p.name === 'ZUS Coffee (campus)'));
  assert(places.some(p => p.id === 'tt:zus'));
  assert(!places.some(p => p.area === 'warisan' && p.unverified));
  assert(places.some(p => p.area === 'sunsuria' && p.unverified));
});

test('pagination fetches beyond 300 and works without a total count', async () => {
  const offsets = [];
  const a = app(async url => {
    const offset = Number(params(url).get('ofs'));
    offsets.push(offset);
    return ok({ results: Array.from({ length: offset < 400 ? 100 : 3 }, (_, i) => poi(offset + i)) });
  });
  const result = await a.searchTomTom({ lat: 2.82, lon: 101.7 }, 2500, 'warisan');
  assert.equal(result.places.length, 403);
  assert.deepEqual(offsets, [0, 100, 200, 300, 400]);
});

test('overlapping areas show their own results without weighting a restaurant twice', () => {
  const a = app();
  a.setLive({ sunsuria: [{ id: 'tt:shared', name: 'Shared restaurant', area: 'sunsuria' }], warisan: [{ id: 'tt:shared', name: 'Shared restaurant', area: 'warisan' }] }, 'tomtom');
  vm.runInContext("state.settings.xmum = true; state.settings.xmumAreas = ['sunsuria', 'warisan'];", a.context);
  assert.equal(a.allXmum().filter(p => p.id === 'tt:shared').length, 2);
  assert.equal(a.buildPool().pool.filter(p => p.id === 'tt:shared').length, 1);
});

test('a late page failure retains already fetched places with a warning', async () => {
  const a = app(async url => {
    if (Number(params(url).get('ofs'))) return { ok: false, status: 429 };
    return ok({ results: Array.from({ length: 100 }, (_, i) => poi(i)), summary: { totalResults: 150 } });
  });
  const result = await a.searchTomTom({ lat: 2.82, lon: 101.7 }, 2500, 'warisan');
  assert.equal(result.places.length, 100);
  assert.match(result.warning, /part/);
});

test('an area failure does not discard the other area or cache an incomplete list', async () => {
  const a = app(async url => {
    if (url.includes('/geocode/')) {
      const sunsuria = decodeURIComponent(url).includes('Sunsuria');
      return ok({ results: [{ address: { freeformAddress: sunsuria ? 'Sunsuria City, Sepang' : 'Kota Warisan, Sepang' }, position: { lat: sunsuria ? 2.83 : 2.81, lon: 101.7 } }] });
    }
    if (Number(params(url).get('lat')) === 2.81) return { ok: false, status: 403 };
    return ok({ results: [poi('bell')] });
  });
  assert.equal(await a.loadTomTom(true), true);
  assert.equal(a.live().sunsuria.length, 1);
  assert.equal(a.live().warisan.length, 0);
  assert.match(a.nodes.get('#xmumStatus').textContent, /Kota Warisan.*API key refused/);
  assert.equal(a.context.sessionStorage.getItem('w2e.tomtom.v2'), null);
  assert.equal(a.nodes.get('#xmumRefresh').disabled, false);
});

test('centre caches expire and Refresh bypasses even a fresh centre', async () => {
  let calls = 0;
  const a = app(async () => { calls++; return ok({ results: [{ address: { freeformAddress: 'Sunsuria City, Sepang' }, position: { lat: 2.83, lon: 101.7 } }] }); });
  const key = 'w2e.centre.v2.sunsuria';
  a.context.localStorage.setItem(key, JSON.stringify({ lat: 1, lon: 1, at: Date.now() - 8 * 864e5 }));
  assert.equal((await a.tomtomCentre('sunsuria')).lat, 2.83);
  await a.tomtomCentre('sunsuria');
  assert.equal(calls, 1);
  await a.tomtomCentre('sunsuria', true);
  assert.equal(calls, 2);
});

test('result cache expires after 30 minutes', async () => {
  const a = app(async () => { throw new Error('offline'); });
  const key = 'w2e.tomtom.v2';
  const areas = { sunsuria: [poi('old')], warisan: [] };
  a.context.sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), areas }));
  assert.equal(await a.loadTomTom(false), true);
  a.context.sessionStorage.setItem(key, JSON.stringify({ at: Date.now() - 31 * 60000, areas }));
  assert.equal(await a.loadTomTom(false), false);
});

test('unrelated geocodes are rejected rather than cached as a search centre', async () => {
  const a = app(async () => ok({ results: [{ address: { freeformAddress: 'Salak Tinggi, Sepang' }, position: { lat: 2.81, lon: 101.74 } }] }));
  assert.equal(await a.tomtomCentre('sunsuria', true), null);
  assert.equal(a.context.localStorage.getItem('w2e.centre.v2.sunsuria'), null);
});

test('Nearby uses TomTom and falls back to OpenStreetMap if TomTom fails', async () => {
  let failTomTom = false;
  const a = app(async url => {
    if (url.includes('tomtom.com')) {
      if (failTomTom) return { ok: false, status: 403 };
      return ok({ results: [poi('nearby')] });
    }
    return ok({ elements: [{ type: 'node', id: 1, lat: 2.82, lon: 101.7, tags: { name: 'Local stall', amenity: 'restaurant' } }] });
  });
  a.location({ lat: 2.82, lon: 101.7 });
  await a.loadNearby(true);
  assert.equal(a.nearby()[0].source, 'tomtom');
  failTomTom = true;
  await a.loadNearby(true);
  assert.equal(a.nearby()[0].source, 'osm');
  assert.match(a.nodes.get('#nearbyStatus').textContent, /TomTom is unavailable/);
});

test('Google rejects stale snapshots and keeps off-campus branches in fresh ones', async () => {
  let generatedAt = new Date(Date.now() - 15 * 864e5).toISOString();
  const a = app(async () => ok({ generatedAt, areas: { warisan: { places: [{ id: 'g:zus', name: 'ZUS Coffee (Kota Warisan)' }] } } }));
  assert.equal(await a.loadGooglePlaces(), false);
  generatedAt = new Date().toISOString();
  assert.equal(await a.loadGooglePlaces(), true);
  assert.equal(a.live().warisan[0].id, 'g:zus');
  assert(a.allXmum().some(p => p.area === 'sunsuria' && p.unverified));
});
