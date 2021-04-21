const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());

client.connect(err => {
    const programsCollection = client.db("drivingSchool").collection("programs");

        app.get('/programs',(req, res) => {
            programsCollection.find()
            .toArray((err, items) => {
                res.send(items);
            })
        })
        //For add programs
        app.post('/addPrograms', (req, res) => {
            const newprogram = req.body;
            console.log('adding new event', newprogram);
            programsCollection.insertOne(newprogram)
            .then(result => {
                console.log('inserted count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })
});

client.connect(err => {
    const reviewCollection = client.db("drivingSchool").collection("reviews");

    app.get('/reviews',(req, res) => {
        reviewCollection.find()
        .toArray((err, items) => {
            res.send(items);
        })
    })

     //For add reviews
     app.post('/addReview', (req, res) => {
        const newreview = req.body;
        console.log('adding new event', newreview);
        reviewCollection.insertOne(newreview)
        .then(result => {
            console.log('inserted count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
})
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)
