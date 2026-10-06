import { test } from "node:test";
import assert from "node:assert/strict";
import { requestApi } from "../src/lib/api.ts";

test("a failed API action rejects with the server explanation, never reports success", async () => {
  const fetcher = async () =>
    new Response(
      JSON.stringify({ detail: "Escolha uma data a partir de 20/10/2026." }),
      { status: 400 },
    );
  await assert.rejects(
    () => requestApi("/actions", { method: "POST", body: "{}" }, fetcher),
    /Escolha uma data/,
  );
});

test("a persisted action returns its real event identifier", async () => {
  const fetcher = async () =>
    new Response(
      JSON.stringify({ message: "Plano registrado.", eventId: "event-123" }),
    );
  assert.deepEqual(
    await requestApi("/actions", { method: "POST", body: "{}" }, fetcher),
    { message: "Plano registrado.", eventId: "event-123" },
  );
});

test("an analytics 204 is accepted without parsing an empty JSON body", async () => {
  const fetcher = async () => new Response(null, { status: 204 });
  assert.equal(
    await requestApi("/events", { method: "POST", body: "{}" }, fetcher),
    undefined,
  );
});
