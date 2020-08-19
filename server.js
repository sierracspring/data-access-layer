const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const dataAccessLayer = require("./dataAccessLayer");
const { ObjectId, ObjectID } = require("mongodb");

dataAccessLayer.connect();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get("/api/products", async (request, response) => {
  const products = await dataAccessLayer.findAll();

  response.send(products);
});

app.get("/api/products/:id", async (request, response) => {
  const productId = request.params.id;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  let product;

  try {
    product = await dataAccessLayer.findOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }
  response.send(product);
});

app.post("/api/products", async (request, response) => {
  const body = request.body;

  if (!body.name || !body.price || !body.category) {
    response
      .status(400)
      .send(
        "Bad Request. Validation Error. Missing name, price (and greater than 0), or category!"
      );
    return;
  }

  if (typeof body.name !== "string") {
    response.status(400).send("The name parameter must be of type string");
    return;
  }

  if (typeof body.category !== "string") {
    response.status(400).send("The category parameter must be of type string");
    return;
  }

  if (isNaN(Number(body.price))) {
    response.status(400).send("The price parameter must be of type number");
    return;
  }

  await dataAccessLayer.insertOne(body);

  response.status(201).send();
});

app.put("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  const body = request.body;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  if (body.name && typeof body.name !== "string") {
    response.status(400).send("The name parameter must be of type string");
    return;
  }

  if (body.category && typeof body.category !== "string") {
    response.status(400).send("The category parameter must be of type string");
    return;
  }

  if (body.price && isNaN(Number(body.price))) {
    response.status(400).send("The price parameter must be of type number");
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  try {
    await dataAccessLayer.updateOne(productQuery, body);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }

  response.send();
});

app.delete("/api/products/:id", async (request, response) => {
  const productId = request.params.id;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  try {
    await dataAccessLayer.deleteOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }

  response.send();
});

const port = process.env.PORT ? process.env.PORT : 3005;
app.listen(port, () => {
  console.log("Grocery API Server Started!");
});
