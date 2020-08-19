const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const url = process.env.MONGODB_URL;
const databaseName = process.env.MONGODB_DATABASE;

console.log(url);
console.log(databaseName);

const collectionName = "products";
const settings = {
  useUnifiedTopology: true,
};

let databaseClient;
let productCollection;

const connect = function () {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, settings, (error, client) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }

      databaseClient = client.db(databaseName);
      productCollection = databaseClient.collection(collectionName);
      console.log("SUCCESSFULLY CONNECTED TO DATABASE!");
      resolve();
    });
  });
};

const insertOne = function (product) {
  return new Promise((resolve, reject) => {
    productCollection.insertOne(product, (error, result) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }

      console.log("SUCCESSFULLY INSERTED A NEW DOCUMENT");
      resolve();
    });
  });
};

const findAll = function () {
  const query = {};

  return new Promise((resolve, reject) => {
    productCollection.find(query).toArray((error, documents) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }

      console.log(`SUCCESSFULLY FOUND ${documents.length} DOCUMENTS`);
      resolve(documents);
    });
  });
};

const findOne = function (query) {
  return new Promise((resolve, reject) => {
    productCollection.find(query).toArray((error, documents) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }

      if (documents.length > 0) {
        console.log("SUCCESSFULLY FOUND DOCUMENT!");
        const document = documents[0];
        resolve(document);
      } else {
        reject("No document found!");
      }
    });
  });
};

const updateOne = function (query, newProduct) {
  const newProductQuery = {};

  if (newProduct.name) {
    newProductQuery.name = newProduct.name;
  }

  if (newProduct.price) {
    newProductQuery.price = newProduct.price;
  }

  if (newProduct.category) {
    newProductQuery.category = newProduct.category;
  }

  console.log(query);

  return new Promise((resolve, reject) => {
    productCollection.updateOne(
      query,
      { $set: newProductQuery },
      (error, result) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        } else if (result.modifiedCount === 0) {
          console.log("No Document Found");
          reject("No Document Found");
          return;
        }

        console.log("SUCCESSFULLY UPDATED DOCUMENT!");
        resolve();
      }
    );
  });
};

const deleteOne = function (query) {
  return new Promise((resolve, reject) => {
    productCollection.deleteOne(query, (error, result) => {
      console.log(result);
      if (error) {
        console.log(error);
        reject(error);
        return;
      } else if (result.deletedCount === 0) {
        console.log("No Document Found");
        reject("No Document Found");
        return;
      }

      console.log("SUCCESSFULLY DELETED DOCUMENT");
      resolve();
    });
  });
};

module.exports = { connect, insertOne, findAll, findOne, updateOne, deleteOne };

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

(async () => {
  await connect();

  const newProduct = {
    name: "Jeans",
    price: 19.99,
    category: "pants",
  };
  await insertOne(newProduct);

  const products = await findAll();
  console.log(products);

  const productQuery = {
    _id: new ObjectId("1231"),
    // name: "Jeans",
  };
  const product = await findOne(productQuery);
  console.log(product);

  const productQuery = {
    _id: new ObjectId("1232"),
  };
  const newProduct = {
    // name: "Shorts",
    // price: 14.99,
    category: "pants",
  };
  await updateOne(productQuery, newProduct);

  const productQuery = {
    _id: new ObjectId("1231"),
  };
  await deleteOne(productQuery);

  console.log("END");
  process.exit(0);
})();
