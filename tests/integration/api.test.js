"use strict";

require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");

process.env.NODE_ENV = "test";

const app = require("../../src/app");
const User = require("../../src/models/User");
const Product = require("../../src/models/Product");

const API = "/api/v1";

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPass1!",
  confirmPassword: "TestPass1!",
};
const testProduct = {
  name: "Test Headphones",
  price: 149.99,
  category: "electronics",
  stock: 50,
};

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI_TEST ||
      "mongodb://localhost:27017/rest_api_framework_test",
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
});

describe("POST /auth/register", () => {
  it("creates account and returns tokens", async () => {
    const res = await request(app).post(`${API}/auth/register`).send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post(`${API}/auth/register`).send(testUser);
    const res = await request(app).post(`${API}/auth/register`).send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it("rejects weak password", async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...testUser, password: "weak", confirmPassword: "weak" });
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app).post(`${API}/auth/register`).send(testUser);
  });

  it("returns tokens on valid credentials", async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: testUser.email, password: "Wrong1!" });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /auth/me", () => {
  it("returns profile when authenticated", async () => {
    const reg = await request(app).post(`${API}/auth/register`).send(testUser);
    const res = await request(app)
      .get(`${API}/auth/me`)
      .set("Authorization", `Bearer ${reg.body.data.tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.statusCode).toBe(401);
  });
});

describe("Products", () => {
  let token;
  beforeEach(async () => {
    const res = await request(app).post(`${API}/auth/register`).send(testUser);
    token = res.body.data.tokens.accessToken;
  });

  it("creates a product when authenticated", async () => {
    const res = await request(app)
      .post(`${API}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send(testProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.product.name).toBe(testProduct.name);
  });

  it("blocks unauthenticated product creation", async () => {
    const res = await request(app).post(`${API}/products`).send(testProduct);
    expect(res.statusCode).toBe(401);
  });

  it("returns 404 for non-existent product", async () => {
    const res = await request(app).get(
      `${API}/products/64f1a2b3c4d5e6f7a8b9c0d9`,
    );
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /health", () => {
  it("returns healthy status", async () => {
    const res = await request(app).get(`${API}/health`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("healthy");
  });
});
