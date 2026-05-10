import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.jsonbin.io/v3";

async function readBin() {
  const key = process.env.JSONBIN_MASTER_KEY;
  const bin = process.env.JSONBIN_BIN_ID;
  if (!key || !bin) throw new Error("JSONBin not configured");
  const r = await fetch(`${BASE}/b/${bin}/latest`, {
    headers: { "X-Master-Key": key, "X-Bin-Meta": "false" },
  });
  if (!r.ok) {
    if (r.status === 404) return { collections: {} as Record<string, any[]> };
    throw new Error(`JSONBin read failed (${r.status})`);
  }
  const data = await r.json();
  if (!data || typeof data !== "object" || !data.collections) {
    return { collections: {} as Record<string, any[]> };
  }
  return data as { collections: Record<string, any[]> };
}

async function writeBin(payload: any) {
  const key = process.env.JSONBIN_MASTER_KEY;
  const bin = process.env.JSONBIN_BIN_ID;
  if (!key || !bin) throw new Error("JSONBin not configured");
  const r = await fetch(`${BASE}/b/${bin}`, {
    method: "PUT",
    headers: { "X-Master-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`JSONBin write failed (${r.status})`);
  return r.json();
}

export const appendRecord = createServerFn({ method: "POST" })
  .inputValidator((d: { collection: string; record: Record<string, any> }) =>
    z.object({
      collection: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/i),
      record: z.record(z.string(), z.any()),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const bin = await readBin();
    const list = bin.collections[data.collection] ?? [];
    const entry = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...data.record,
    };
    list.unshift(entry);
    bin.collections[data.collection] = list.slice(0, 1000);
    await writeBin(bin);
    return { ok: true, entry };
  });

export const listRecords = createServerFn({ method: "GET" })
  .inputValidator((d: { collection: string }) =>
    z.object({ collection: z.string().min(1).max(64) }).parse(d)
  )
  .handler(async ({ data }) => {
    const bin = await readBin();
    return { records: bin.collections[data.collection] ?? [] };
  });

export const listAllCollections = createServerFn({ method: "GET" }).handler(async () => {
  const bin = await readBin();
  return {
    summary: Object.entries(bin.collections).map(([name, records]) => ({
      name,
      count: Array.isArray(records) ? records.length : 0,
    })),
  };
});

export const deleteRecord = createServerFn({ method: "POST" })
  .inputValidator((d: { collection: string; id: string }) =>
    z.object({ collection: z.string().min(1).max(64), id: z.string().min(1) }).parse(d)
  )
  .handler(async ({ data }) => {
    const bin = await readBin();
    const list = bin.collections[data.collection] ?? [];
    bin.collections[data.collection] = list.filter((r: any) => r.id !== data.id);
    await writeBin(bin);
    return { ok: true };
  });

export const exportBin = createServerFn({ method: "GET" }).handler(async () => {
  return await readBin();
});
