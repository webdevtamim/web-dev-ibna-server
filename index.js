const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());


// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zmtojm.mongodb.net/?retryWrites=true&w=majority`;

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

        // messsage
        const message = client.db("webDevIbna").collection("message");
        app.post('/message', async (req, res) => {
            const newMessage = req.body;
            const result = await message.insertOne(newMessage);
            res.send(result);
        })

        // work
        const work = client.db("webDevIbna").collection("work");
        app.post('/work', async (req, res) => {
            const newWork = req.body;
            const result = await work.insertOne(newWork);
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


// handle file upload
app.post('/work', upload.single('file'), async (req, res) => {
    const newWork = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        skype: req.body.skype,
        details: req.body.details,
        file: req.file.filename, // save the filename in the database
    };

    try {
        const result = await client.db('webDevIbna').collection('work').insertOne(newWork);
        res.send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Ibnas server is running on port ${port}`);
})