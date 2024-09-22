const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");

const port = process.env.PORT || 5000;
require("dotenv").config();
var jwt = require("jsonwebtoken");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://auth-master.netlify.app"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o4eqbyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  // console.log('inside = ', req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Forbidden-Access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  // console.log(token)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Forbidden-Access" });
    }
    req.decoded = decoded;
    //console.log("decoded value = ", decoded);

    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const userCollection = client.db("manageUser").collection("users");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log('user info =', user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "8h",
      });
      res.send({ token });
    });

    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const info = req.body;
      const hash = await bcrypt.hash(info.password, 10);
      info.password = hash;
      const user = await userCollection.insertOne(info);
      res.send(user);
    });

    // Fetch all users
    app.get("/all-users", async (req, res) => {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    });

    // Endpoint to block users
    app.post("/blockUsers", async (req, res) => {
      const { userIds } = req.body; // Expecting an array of user IDs

      // Convert userIds to ObjectId
      const objectIdArray = userIds.map((id) => new ObjectId(id));

      try {
        // Update the status of the selected users to 'blocked'
        const result = await userCollection.updateMany(
          { _id: { $in: objectIdArray } },
          { $set: { status: "blocked" } }
        );

        res.send({ message: "Users blocked successfully", result });
      } catch (error) {
      //  console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/unblockUsers", async (req, res) => {
      const { userIds } = req.body; // Expecting an array of user IDs

      // Convert userIds to ObjectId
      const objectIdArray = userIds.map((id) => new ObjectId(id));

      try {
        // Update the status of the selected users to 'blocked'
        const result = await userCollection.updateMany(
          { _id: { $in: objectIdArray } },
          { $set: { status: "active" } }
        );

        res.send({ message: "Users unblocked successfully", result });
      } catch (error) {
      //  console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Endpoint to delete users
    app.post("/delete", async (req, res) => {
      const { userIds } = req.body; // Expecting an array of user IDs

      try {
        const objectIdArray = userIds.map((id) => new ObjectId(id));

        const result = await userCollection.deleteMany({
          _id: { $in: objectIdArray },
        });

        res.send({ message: "Users deleted successfully", result });
      } catch (error) {
        //console.error("Error deleting users:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/userLogin", async (req, res) => {
      const { email, password } = req.query;

      const user = await userCollection.findOne({ email: email });
      if (!user) {
        return res.send({ message: "User not found" });
      }
      if (user.status == "blocked") {
        return res.send({ message: "blocked" });
      }

      const hashPassword = await bcrypt.compare(password, user.password);
      if (!hashPassword) {
        res.send({ message: "Pass not matched" });
      }

      // Update the latest login time
      const lastLoginTime = new Date();
      await userCollection.updateOne(
        { email: email },
        { $set: { lastLogin: lastLoginTime } }
      );
      res.send({ message: "matched" });
    });

    app.get("/user-status/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      if (user) {
        res.send({ message: "blocked" });
      } else {
        res.send({ message: "not blocked" });
      }
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
  res.send("server!");
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
