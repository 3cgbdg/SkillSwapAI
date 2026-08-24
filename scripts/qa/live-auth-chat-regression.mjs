#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const rootRequire = createRequire(resolve("backend/package.json"));
const { Queue } = rootRequire("bullmq");
const { Client } = rootRequire("pg");
const { io } = createRequire(resolve("frontend/package.json"))(
  "socket.io-client"
);

const baseUrl = process.env.QA_API_URL || "http://localhost:5200/api";
const socketUrl = new URL(baseUrl).origin;
const runId = process.env.QA_CLEANUP_PREFIX || `qa-${Date.now()}`;
const password = "ValidPass123";
const users = {
  alice: {
    name: `${runId}-alice`,
    email: `${runId}-alice@example.test`,
  },
  bob: { name: `${runId}-bob`, email: `${runId}-bob@example.test` },
  stranger: {
    name: `${runId}-stranger`,
    email: `${runId}-stranger@example.test`,
  },
};

function assertLocalTarget() {
  const localHosts = ["localhost", "127.0.0.1", "::1"];
  assert.ok(
    localHosts.includes(new URL(baseUrl).hostname),
    "live QA is restricted to a local API target"
  );
  const databaseUrl = new URL(process.env.DATABASE_URL);
  assert.ok(
    localHosts.includes(databaseUrl.hostname),
    "live QA is restricted to a local database"
  );
}

assertLocalTarget();

class CookieSession {
  cookies = new Map();

  cookieHeader() {
    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  async request(path, options = {}) {
    const headers = new Headers(options.headers);
    const cookie = this.cookieHeader();
    if (cookie) headers.set("cookie", cookie);
    if (options.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const setCookies = response.headers.getSetCookie?.() ?? [];
    for (const value of setCookies) {
      const [pair] = value.split(";", 1);
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      const cookieValue = pair.slice(separator + 1);
      if (cookieValue) this.cookies.set(name, cookieValue);
      else this.cookies.delete(name);
    }

    const text = await response.text();
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // Keep non-JSON response text for an actionable assertion failure.
    }
    return { response, body, setCookies };
  }
}

const results = [];
async function check(name, test) {
  try {
    await test();
    results.push({ name, status: "PASS" });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: "FAIL" });
    console.error(`FAIL ${name}: ${error.message}`);
    throw error;
  }
}

function expectStatus(result, status) {
  assert.equal(
    result.response.status,
    status,
    `expected ${status}, got ${result.response.status}: ${JSON.stringify(result.body)}`
  );
}

function signupBody(user) {
  return JSON.stringify({
    ...user,
    password,
    confirmPassword: password,
    knownSkills: ["QA automation"],
    skillsToLearn: ["Accessibility testing"],
  });
}

async function connectSocket(session) {
  return new Promise((resolveConnection, reject) => {
    const socket = io(socketUrl, {
      extraHeaders: { Cookie: session.cookieHeader() },
      forceNew: true,
      reconnection: false,
      timeout: 5_000,
      transports: ["websocket"],
    });
    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("socket connection timed out"));
    }, 6_000);
    socket.once("connect", () => {
      clearTimeout(timeout);
      resolveConnection(socket);
    });
    socket.once("connect_error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function once(socket, event, timeoutMs = 6_000) {
  return new Promise((resolveEvent, reject) => {
    const timeout = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`${event} event timed out`));
    }, timeoutMs);
    const handler = (payload) => {
      clearTimeout(timeout);
      resolveEvent(payload);
    };
    socket.once(event, handler);
  });
}

const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};
const aiQueue = new Queue("ai", { connection: redisConnection });
const createdUserIds = new Set();

async function cleanup() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      'SELECT id FROM "User" WHERE email LIKE $1',
      [`${runId}-%`]
    );
    const ids = rows.map(({ id }) => id);
    ids.forEach((id) => createdUserIds.add(id));
    const jobs = await aiQueue.getJobs([
      "waiting",
      "delayed",
      "failed",
      "completed",
    ]);
    await Promise.all(
      jobs
        .filter((job) => createdUserIds.has(job.data?.userId))
        .map((job) => job.remove())
    );
    if (ids.length > 0) {
      const chatRows = await client.query(
        'SELECT DISTINCT rel."A" AS id FROM "_userChats" rel WHERE rel."B" = ANY($1::text[])',
        [ids]
      );
      await client.query(
        'DELETE FROM "Request" WHERE "fromId" = ANY($1::text[]) OR "toId" = ANY($1::text[])',
        [ids]
      );
      await client.query(
        'DELETE FROM "Message" WHERE "fromId" = ANY($1::text[]) OR "toId" = ANY($1::text[])',
        [ids]
      );
      await client.query(
        'DELETE FROM "Friendship" WHERE "user1Id" = ANY($1::text[]) OR "user2Id" = ANY($1::text[])',
        [ids]
      );
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [
        ids,
      ]);
      const chatIds = chatRows.rows.map(({ id }) => id);
      if (chatIds.length > 0) {
        await client.query('DELETE FROM "Chat" WHERE id = ANY($1::text[])', [
          chatIds,
        ]);
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

let aliceSocket;
let bobSocket;
if (process.env.QA_CLEANUP_PREFIX) {
  await aiQueue.pause();
  try {
    await cleanup();
    console.log(`Cleaned local QA users with prefix ${runId}`);
  } finally {
    await aiQueue.resume();
    await aiQueue.close();
  }
  process.exit(0);
}

try {
  await aiQueue.pause();

  const anonymous = new CookieSession();
  const alice = new CookieSession();
  const bob = new CookieSession();
  const stranger = new CookieSession();

  await check("health live contract", async () => {
    const response = await fetch(`${socketUrl}/health/live`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });

  await check("health readiness contract", async () => {
    const response = await fetch(`${socketUrl}/health/ready`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).details.database.status, "up");
  });

  await check("protected profile rejects anonymous access", async () => {
    expectStatus(await anonymous.request("/auth/profile"), 401);
  });

  await check("signup validates malformed input", async () => {
    expectStatus(
      await anonymous.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email: "invalid" }),
      }),
      400
    );
  });

  await check("signup returns session cookies", async () => {
    const result = await alice.request("/auth/signup", {
      method: "POST",
      body: signupBody(users.alice),
    });
    expectStatus(result, 201);
    assert.equal(result.body.message, "Successfully signed up!");
    assert.ok(alice.cookies.has("access_token"));
    assert.ok(alice.cookies.has("refresh_token"));
    assert.ok(result.setCookies.every((cookie) => /HttpOnly/iu.test(cookie)));
  });

  await check("authenticated profile matches signup identity", async () => {
    const result = await alice.request("/auth/profile");
    expectStatus(result, 200);
    assert.equal(result.body.data.email, users.alice.email);
    createdUserIds.add(result.body.data.id);
  });

  await check("duplicate email is rejected", async () => {
    const duplicate = new CookieSession();
    expectStatus(
      await duplicate.request("/auth/signup", {
        method: "POST",
        body: signupBody({
          name: `${runId}-duplicate`,
          email: users.alice.email,
        }),
      }),
      409
    );
  });

  await check("invalid login credentials are rejected", async () => {
    expectStatus(
      await anonymous.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: users.alice.email,
          password: "WrongPass123",
        }),
      }),
      401
    );
  });

  await check("logout clears authentication", async () => {
    expectStatus(
      await alice.request("/auth/logout", { method: "DELETE" }),
      200
    );
    expectStatus(await alice.request("/auth/profile"), 401);
  });

  await check("login restores authentication", async () => {
    const result = await alice.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: users.alice.email, password }),
    });
    expectStatus(result, 201);
    expectStatus(await alice.request("/auth/profile"), 200);
  });

  await check("refresh rejects a missing refresh cookie", async () => {
    expectStatus(
      await anonymous.request("/auth/refresh", { method: "POST" }),
      401
    );
  });

  await check("refresh recreates access from refresh cookie", async () => {
    const refreshOnly = new CookieSession();
    refreshOnly.cookies.set(
      "refresh_token",
      alice.cookies.get("refresh_token")
    );
    expectStatus(
      await refreshOnly.request("/auth/refresh", { method: "POST" }),
      201
    );
    assert.ok(refreshOnly.cookies.has("access_token"));
    expectStatus(await refreshOnly.request("/auth/profile"), 200);
  });

  await check("protected chats reject anonymous access", async () => {
    expectStatus(await anonymous.request("/chats"), 401);
  });

  for (const [label, session, user] of [
    ["bob", bob, users.bob],
    ["stranger", stranger, users.stranger],
  ]) {
    await check(`${label} signup succeeds`, async () => {
      expectStatus(
        await session.request("/auth/signup", {
          method: "POST",
          body: signupBody(user),
        }),
        201
      );
      const profile = await session.request("/auth/profile");
      expectStatus(profile, 200);
      createdUserIds.add(profile.body.data.id);
    });
  }

  const bobProfile = (await bob.request("/auth/profile")).body.data;
  const strangerProfile = (await stranger.request("/auth/profile")).body.data;
  const aliceProfile = (await alice.request("/auth/profile")).body.data;

  await check("non-friend REST chat creation is forbidden", async () => {
    expectStatus(
      await alice.request("/chats", {
        method: "POST",
        body: JSON.stringify({
          friendId: strangerProfile.id,
          friendName: users.stranger.name,
        }),
      }),
      403
    );
  });

  await check("friend request can be created", async () => {
    const result = await alice.request("/requests", {
      method: "POST",
      body: JSON.stringify({ id: bobProfile.id }),
    });
    expectStatus(result, 201);
    assert.equal(result.body.data.from.id, aliceProfile.id);
    assert.equal(result.body.data.to.id, bobProfile.id);
  });

  await check("recipient can list the friend request", async () => {
    const result = await bob.request("/requests");
    expectStatus(result, 200);
    assert.ok(
      result.body.data.some((request) => request.from.id === aliceProfile.id)
    );
  });

  await check("recipient can accept the friend request", async () => {
    expectStatus(
      await bob.request("/friends", {
        method: "POST",
        body: JSON.stringify({ id: aliceProfile.id }),
      }),
      201
    );
  });

  await check("friendship appears for both users", async () => {
    const [aliceFriends, bobFriends] = await Promise.all([
      alice.request("/friends"),
      bob.request("/friends"),
    ]);
    expectStatus(aliceFriends, 200);
    expectStatus(bobFriends, 200);
    assert.ok(
      aliceFriends.body.data.some((friend) => friend.id === bobProfile.id)
    );
    assert.ok(
      bobFriends.body.data.some((friend) => friend.id === aliceProfile.id)
    );
  });

  let chatId;
  await check("friends can create a chat", async () => {
    const result = await alice.request("/chats", {
      method: "POST",
      body: JSON.stringify({
        friendId: bobProfile.id,
        friendName: users.bob.name,
      }),
    });
    expectStatus(result, 201);
    chatId = result.body.data.chatId;
    assert.ok(chatId);
  });

  await check("chat creation is idempotent", async () => {
    const result = await alice.request("/chats", {
      method: "POST",
      body: JSON.stringify({
        friendId: bobProfile.id,
        friendName: users.bob.name,
      }),
    });
    expectStatus(result, 201);
    assert.equal(result.body.data.chatId, chatId);
  });

  await check("new chat starts with an empty message list", async () => {
    const result = await alice.request(`/chats/messages?with=${bobProfile.id}`);
    expectStatus(result, 200);
    assert.deepEqual(result.body.data, []);
  });

  aliceSocket = await connectSocket(alice);
  await check("socket rejects a non-friend message", async () => {
    const rejected = once(aliceSocket, "messageError");
    aliceSocket.emit("sendMessage", {
      to: strangerProfile.id,
      message: "must be rejected",
    });
    assert.equal((await rejected).message, "You can only message friends");
  });

  await check("rejected socket message creates no stranger chat", async () => {
    const result = await stranger.request("/chats");
    expectStatus(result, 200);
    assert.deepEqual(result.body.data, []);
  });

  bobSocket = await connectSocket(bob);
  await check("friends can send and receive a socket message", async () => {
    const sent = once(aliceSocket, "messageSent");
    const received = once(bobSocket, "receiveMessage");
    aliceSocket.emit("sendMessage", {
      to: bobProfile.id,
      message: "hello friend",
    });
    const [sentPayload, receivedPayload] = await Promise.all([sent, received]);
    assert.equal(receivedPayload.id, sentPayload.id);
    assert.equal(receivedPayload.from, aliceProfile.id);
    assert.equal(receivedPayload.messageContent, "hello friend");
  });

  await check("socket message is persisted in the REST contract", async () => {
    const result = await alice.request(`/chats/messages?with=${bobProfile.id}`);
    expectStatus(result, 200);
    assert.equal(result.body.data.at(-1).content, "hello friend");
    assert.equal(result.body.data.at(-1).fromId, aliceProfile.id);
  });

  console.log(`SUMMARY ${results.length}/${results.length} live checks passed`);
} finally {
  aliceSocket?.disconnect();
  bobSocket?.disconnect();
  try {
    await cleanup();
  } finally {
    await aiQueue.resume();
    await aiQueue.close();
  }
}
