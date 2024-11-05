const express = require("express");
const axios = require("axios");
const basicAuth = require("basic-auth");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");

require("dotenv").config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(cors());
// parse application/x-www-foimport rm-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Basic Authentication Middleware
const authenticate = (req, res, next) => {
  const user = basicAuth(req);

  // Check if the user is valid
  if (
    !user ||
    user.name !== process.env.USERNAME || // Set your username in .env file
    user.pass !== process.env.PASSWORD // Set your password in .env file
  ) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send("Authentication required.");
  }

  next();
};

// Create a Redis client
const redisClient = redis.createClient();

// Ensure the Redis client connects properly
redisClient.connect().catch(console.error);

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Login Route
app.post("/login", authenticate, (req, res) => {
  // If authentication is successful, send a success message
  res.json({ message: "Login successful" });
});

// Movie Route
app.get("/movies", authenticate, async (req, res) => {
  /*  const { query, type, year, page } = req.query;
  const cacheKey = `${query}-${type}-${year}`; */

  const { query, type, year, page = 1 } = req.query; // Default to page 1 if not provided
  const cacheKey = `${query}-${type}-${year}-${page}`;
  const apiKey = process.env.OMDb_API_KEY;

  console.log("Received request:", req.query); // Log the incoming request

  try {
    // 1. First, check if data is in Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // Cache hit: return cached data
      console.log("Cache hit:", cacheKey);
      return res.json(JSON.parse(cachedData)); // Return cached data
    } else {
      // Cache miss: make the API call to OMDB
      console.log("Cache miss:", cacheKey);

      const response = await fetch(
        `http://www.omdbapi.com/?s=${query}&type=${type}&y=${year}&page=${page}&apikey=${apiKey}`
      );
      const data = await response.json();

      if (!response.ok) {
        console.error("OMDb API returned an error:", data);
        return res.status(response.status).json(data); // Handle specific OMDB error
      }

      // Cache the API response data in Redis for 1 hour (3600 seconds)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

      console.log("Data cached with key:", cacheKey);

      // Send the OMDb API response to the frontend
      res.json(data);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
