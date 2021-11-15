const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// mongodb connection url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.badr9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Database connected");
    // creating database and collection
    const database = client.db("car_market");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const userCollection = database.collection("users");

    // get all products from server
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.json(result);
    });
    // get a single product using id
    app.get("/products/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { _id: ObjectId(productId) };
      const result = await productCollection.findOne(query);
      res.json(result);
    });
    // insert a new product to database
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });
    // delete a single product from database
    app.delete("/products/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { _id: ObjectId(productId) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    // indert a new order to database
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.json(result);
      console.log(result);
    });
    // find all order from database
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });

    // delete a single order using id
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // find order using specific email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: { $eq: email } };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });

    // approve order by admin

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });

    // post a single user review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    // insert a user on database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });
    // set user role [Admin or User]
    app.put("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const role = req.body;
      const setRol = role.role;
      const query = { _id: ObjectId(userId) };
      const options = { upsert: true };
      const updateRole = {
        $set: {
          role: setRol,
        },
      };
      const result = await userCollection.updateOne(query, updateRole, options);
      res.json(result);
    });

    // get an user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: { $eq: email } };
      const result = await userCollection.findOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Car Market");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server running on port", port);
});
