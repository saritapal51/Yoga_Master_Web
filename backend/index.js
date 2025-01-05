const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
var jwt = require('jsonwebtoken');
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


//  route for user
app.post('/api/set-token', async(req,res)=>{
  const user = req.body
  const token = jwt.sign( user,process.env.ACCESS_SECRET, { 
    expiresIn: '24h' });
    console.log('print')
  res.send({token});
})

app.post('/new-user', async(req,res)=>{
  const newUser = req.body
  const result = await userCollections.findOneOne(newUser);
  res.send(result);
})

// get users
app.get('/users', async(req,res)=>{
  const result = await userCollections.find({}).toArray();
  res.send(result);
})

// get users by id
app.get('/users/:id', async(req,res)=>{
  const id = req.params.id
  const query = {_id: ObjectId(id)}
  const result = await userCollections.findOne(query);
  res.send(result);
})

// get users by email

app.get('/user/:email', async(req,res)=>{
  const email = req.params.email
  const query = {email: email}
  const result = await userCollections.findOne(query);
  res.send(result);
})

app.post('/applied-instructors/:email', async(req,res)=>{
  const email = req.params.email
  const result = await appliedCollections.findOneOne({email});
  res.send(result);
})

// delete users by id
app.delete('delete-user/:id', async(req,res)=>{
  const id = req.params.id
  const query = {_id:new ObjectId(id)}
  const result = await userCollections.deleteOne(query);
  res.send(result);
})

// update users by id
app.put('/update-user/:id', async (req, res) => {
  const id = req.params.id;
  const updateUser = req.body;
  console.log(req.body)
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
      $set: {
          name: updateUser.name,
          email: updateUser.email,
          role: updateUser.role,
          address: updateUser.address,
          about: updateUser.about,
          photoUrl: updateUser.photoUrl,
          skills: updateUser.skills ? updateUser.skills : null,
      }
  }
  const result = await classesCollection.updateOne(filter, updateDoc, options);
  res.send(result);
})

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

//http://localhost:5000/add-to-cart
//post cart
app.post('/add-to-cart',async (req,res)=>{
 const newCartItem = req.body;
 const result =  cartCollections.insertOne(newCartItem);
 res.send(result)
});

//http://localhost:5000/cart-item/67780a69fc23d84abbbbea1d
// get cart
app.get('/cart-item/:id', async (req, res) => {
  const id =  req.params.id;
  const email = req.body.email;
  const query = {
    classId:id,
    userMail:email
  }
   const projection = { classId: 1 };
   const result = await cartCollections.findOne(query, {projection: projection});
   res.send(result)
})

// cart info by user email
app.get('/cart/:email', async (req, res) => {
  const email = req.params.email;
  const query = {userMail:email}
  const projection = { classId: 1 };
  const carts = await cartCollections.findOne(query, {projection: projection});
  const classIds = carts.map((cart)=>new ObjectId(cart.classId))
  const query2 = { _id: { $in: classIds } };
  const result = await cartCollections.find(query2).toArray();
  res.send(result)
})

// delete cart items

app.delete('/delete-cart-item/:id',async(req,res)=>{
  const id = req.params.id;
  const query = { classId: id };
  const result = await cartCollections.deleteOne(query);
  res.send(result)
})

// payment Routes
app.post('/create-payment-intent', async (req, res) => {
const { price } = req.body;
const amount = perseInt(price)*100
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, 
  currency: "usd",
  payment_method_types:["card"],
});
res.send({
  clientSecret: paymentIntent.client_secret,  
});
})

// post payment info to db
app.post('/payment-info', async (req, res) => {
  const paymnetInfo = req.body;
  const classesId = paymnetInfo.classesId;
  const userEmail = paymnetInfo.userEmail;
  const singleClassId = req.query.classId;
  let query;
  if (singleClassId) {
    query = {classId:singleClassId, userMail:userEmail};
  } else {
    query = {classId:{$in:classesId}};
  }
const classesQuery = {_id: {$in: classesId.map(id => new ObjectId(id))}};
 const classes = await classesCollection.find(classesQuery).toArray();
 const newEnrolledData = {
  userEmail:userEmail,
  classId :singleClassId.map(id => new ObjectId(id)),
  trasnsactionId :paymnetInfo.trasnsactionId
 }
const updateDoc = {
 $set:{
       totalEnrolled:classes.reduce((total,current)=> total+current.totalEnrolled, 0) + 1|| 0,
       availableSeats:classes.reduce((total,current)=> total+current.availableSeats, 0) - 1|| 0,
     }
}
const updatedResult = await classesCollection.updateMany(classesQuery, updateDoc,{upsert:true});
const enrolledResult = await enrolledCollections.insertOne(newEnrolledData);
const deleteResult = await cartCollections.deleteMany(query);
const paymentResult = await paymentCollections.insertOne(paymnetInfo);
res.send ({paymentResult,deleteResult,enrolledResult,updatedResult});
})

// get payment history
app.get('/payment-history/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {userEmail:email};
  const result = await paymentCollections.find(query).sort({date: -1}).toArray()
  res.send(result);
})

// payment history length
app.get('/payment-history-length/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {userEmail:email};
  const total = await paymentCollections.counDocuments(query)
  res.send({total});
})

// enrolled routes
app.get('/popular_classes', async(req,res)=>{
  const email = req.params.email;
  const result = await classesCollection.find(query).sort({totalEnrolled: -1}).toArray();
  res.send(result);
})

app.get('/popular-instructors', async(req,res)=>{
  const pipeline=[{
    $group: {
      _id : "$instructorEmail",
      totalEnrolled: {$sum: "$totalEnrolled"}
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "email",
      as: "instructor"
    }
  },
  {
    $project: {
      _id: 0,
      instructor: {
        $arrayelemAt: ["$instructor",0]
      },
      $totalEnrolled: -1
    }
  },
  {
    $limit: 6
  }
];
   const result = await classesCollection.aggregate(pipeline).toArray();
   res.send(result);
})

// admin status
app.get('/admin-status', async(req,res)=>{
  const approvedClasses = ((await classesCollection.find({status: 'approved'})).toArray()).length;
  const pendingClasses = ((await classesCollection.find({status: 'pending'})).toArray()).length;
  const instructor = ((await classesCollection.find({role: 'instructor'})).toArray()).length;
  const totalClasses = ((await classesCollection.find()).toArray()).length;
  const totalEnrolled = ((await enrolledCollections.find()).toArray()).length;
  const result = {
    approvedClasses,
    pendingClasses,
    instructor,
    totalClasses,
    totalEnrolled
  }
  res.send(result);
})

// get all instructor

app.get('/instructor', async(req,res)=>{
  const result = await userCollections.find({role: 'instructor'}).toArray().length;
  res.send(result);
})

app.get('/enrolled-classes/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {userEmail:email};
  const pipeline=[{
    $group: {
      match: query,
    }
  },
{
  $lookup: {
    from: "classes",
    localField: "classesId",
    foreignField: "_id",
    as: "classes"
  }
},
{
  $unwind: "$classes"
},{
  $lookup: {
    from: "user",
    localField: "classes.instructorEmail",
    foreignField: "email",
    as: "instructor"
  }
},
{
  $project: {
    _id: 0,
    instructor: {
      $arrayelemAt: ["$instructor",0]
    },
    classes: 1
  }
}]
const result = await enrolledCollections.aggregate(pipeline).toArray();
res.send(result);
});

// applied for instructor
app.post('/ass-instructors/:email', async(req,res)=>{
  const data = req.body
  const result = await appliedCollections.insertOne(data);
  res.send(result);
});

// 
app.post('/applied-instructors/:email', async(req,res)=>{
  const email = req.params.email
  const result = await appliedCollections.findOneOne({email});
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
