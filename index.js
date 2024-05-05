const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8c7bsg.mongodb.net/?retryWrites=true&w=majority`;
console.log('MongDB URI===',uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
// ====================================== Collection of mongDB =============================
    const productCollection = client.db('cureCoDB').collection('products');


    // ================ products and product api ============================
    app.get('/products', async (req, res) => {
        const result = await productCollection.find().toArray();
        res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }

        // const options = {
        //     // Include only the `title` and `imdb` fields in the returned document
        //     projection: { title: 1, price: 1, service_id: 1, img: 1 },
        // };

        const result = await productCollection.findOne(query);
        console.log(result)
        res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
