const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8c7bsg.mongodb.net/?retryWrites=true&w=majority`;
console.log("MongDB URI===", uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // ====================================== Collection of mongDB =============================
    const productCollection = client.db("cureCoDB").collection("products");
    const cartCollection = client.db("cureCoDB").collection("productCarts");
    const reviewCollection = client.db("cureCoDB").collection("reviews");

    // ================ products and product api ============================
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      // const options = {
      //     // Include only the `title` and `imdb` fields in the returned document
      //     projection: { title: 1, price: 1, service_id: 1, img: 1 },
      // };

      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // ========================== product carts related api ===============================

    app.get("/productCarts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/productCarts", async (req, res) => {
      const cartItem = req.body;
      console.log(cartItem);

      /// Check if the item already exists in the cart
      const existingItem = await cartCollection.findOne({
        productId: cartItem.productId,
      });

      if (existingItem) {
        // If the item exists, increment its quantity
        const result = await cartCollection.updateOne(
          { productId: cartItem.productId },
          { $inc: { quantity: 1 } }
        );
      } else {
        // If the item doesn't exist, add it to the cart with a quantity of 1
        const newItem = { ...cartItem, quantity: 1 };
        const result = await cartCollection.insertOne(newItem);
      }

      res.send({ message: "Item added to cart successfully." });
    });

    app.delete("/productCarts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // ==============================review related auth ===========================

    app.post("/reviews", async (req, res) => {
      const reviewDetails = req.body;
      console.log(reviewDetails);
      const result = await reviewCollection.insertOne(reviewDetails);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("CureCo is running");
});

app.listen(port, () => {
  console.log(`CureCo Server is running on port ${port}`);
});
