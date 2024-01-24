const express = require('express');
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken')

const app = express();

// middileware
app.use(cors());
app.use(express.json());



const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5nrqg6c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dbConnect = async () => {
    try {
        await client.connect();
        console.log("dbConnected");
    } catch (error) {
        console.log(error);
    }
}
dbConnect();

const database = client.db("houseHunter");
const userCollection = database.collection("User");

app.get('/', (req, res) => {
    res.send("server is running")
})


// registration 

app.post('/userregistration', async (req, res) => {
    const { username, designation, password, email } = req.body;
    const filter = { email: email };
    const existedUser = await userCollection.findOne(filter);
    if (existedUser) {
        return res.send({ message: "User Already Signed in." })
    } else {
        try {
            const result = await userCollection.insertOne({ username, password, email, designation });
            res.status(200).json({ message: "User register successfully.", userId: result.insertedId })
        } catch (error) {
            console.log("Error registering user: ", error);
            res.status(500).json({ error: "Internal Server Error" })
        }
    }

})



// login

app.post('/userlogin', async (req, res) => {
    const { email, password } = req.body;
    const user = await userCollection.findOne({ email });
    try {
        if (!user) {
            res.json({ error: "Invalid Email Address" });
            return
        } else if (password !== user.password) {
            res.json({ error: "Wrong Password Detected" });
            return
        }
        res.status(200).json({ message: "User logged in successfully.", user });
    } catch (error) {
        console.log("Error logging in: ", error);
    }
})

// jwt
app.post('/jwt', async (req, res) => {
    const userEmail = req.body;
    const token = jwt.sign(userEmail, process.env.SECRET_TOKEN, { expiresIn: "1h" });
    res.send({ token, userEmail })
})



app.listen(port, () => {
    console.log(`server is running ${port}`);
})