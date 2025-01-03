const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master-webserver.ab2jt.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master-webserver`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections
let database, userCollections, classesCollection, cartCollections, paymentCollections, enrolledCollections, appliedCollections;

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Create a database and collection references
    database = client.db("yoga");
    userCollections = database.collection("users");
    classesCollection = database.collection("classes");
    cartCollections = database.collection("cart");
    paymentCollections = database.collection("payments");
    enrolledCollections = database.collection("enrolled");
    appliedCollections = database.collection("applied");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error while connecting to MongoDB:', error);
  }
}

// Classes route to add new class
app.post('/new-class', async (req, res) => {
  try {
    const newClass = req.body;
    newClass.availableSeats = parseInt(newClass.availableSeats);  // Make sure availableSeats is an integer
    const result = await classesCollection.insertOne(newClass);
    res.send(result);
  } catch (error) {
    console.error('Error inserting new class:', error);
    res.status(500).send('Error inserting new class');
  }
});

  // GET ALL CLASSES
  app.get('/classes', async (req, res) => {
    const query = { status: 'approved' };
    const result = await classesCollection.find(query).toArray();
    res.send(result);
})

 // GET ALL CLASSES ADDED BY INSTRUCTOR
 app.get('/classes/:email', async (req, res) => {
  const email = req.params.email;
  const query = { instructorEmail: email };
  const result = await classesCollection.find(query).toArray();
  res.send(result);
})

 app.get('/classes-manage', async (req, res) => {
  const result = await classesCollection.find().toArray();
  res.send(result);
})

 // update  status  and reason
 app.put('/change-status/:id', async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  console.log(req.body)
  const reason = req.body.reason;
  const filter = { _id: new ObjectId(id) };
  console.log("🚀 ~ file: index.js:180 ~ app.put ~ reason:", reason)
  const options = { upsert: true };
  const updateDoc = {
      $set: {
          status: status,
          reason: reason
      }
  }
  const result = await classesCollection.updateOne(filter, updateDoc, options);
  res.send(result);
})

app.get('/approved-classes', async (req, res) => {
  const query = { status: 'approved' };
  const result = await classesCollection.find(query).toArray();
  res.send(result);

})

 // get single classe detail
app.get('/class/:id', async (req, res) => {
  const Id = req.params.id;
  const query = {_id: new ObjectId(Id) };
  const result = await classesCollection.find(query).toArray();;
  res.send(result);
});


// Update class detail (all date)
// http://localhost:5000/update-class/676fe7dd8b8ecd3a2b034efd
app.put('/update-class/:id', async (req, res) => {
  const id = req.params.id;
  const updateClass = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
      $set: {
          name: updateClass.name,
          description: updateClass.description,
          price: updateClass.price,
          availableSeats: parseInt(updateClass.availableSeats),
          videoLink: updateClass.videoLink,
          status: 'pending'
      }
  }
  const result = await classesCollection.updateOne(filter, updateDoc, options);
  res.send(result);
})




// Start the server after MongoDB is connected
run().then(() => {
  app.listen(port, () => {
    console.log(`Connection on port ${port}`);
  });
}).catch((err) => {
  console.error('Error during initialization:', err);
});
