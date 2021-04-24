const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());

const serviceAccount = require("./cab-driving-school-firebase-adminsdk-g12f2-860d3a39cb.json");

admin.initializeApp({ 
  credential: admin.credential.cert(serviceAccount)
});


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

    app.get('/programItem/:bookid', (req, res) => {
	    const bookid = ObjectID(req.params.bookid);
        programsCollection.find({_id: bookid})
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.post('/programItemByIds', (req, res) => {
        const programitemIds = req.body;
        programsCollection.find({_id: { $in: programitemIds}})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    }) 

    app.delete('/deleteService/:id', (req, res)=> {
        const id = ObjectID(req.params.id);
        console.log("delete this",id);
        booksCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(documents.deletedCount > 0))
    })
});


//Order collection
client.connect(err => {
    const orderCollection = client.db("drivingSchool").collection("orders");
    const adminCollection = client.db("drivingSchool").collection("admin");
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orderCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newOrder);
    })

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/ordersById', (req, res) => {
        const id = req.body;
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                const filter = { _id: id._id }
                if (admin.length === 0) {
                    filter.email = email;
                }
                orderCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, id._id, admin, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newAdmin);
    })
//Amin Collection 
    app.get('/admins', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })

});


//Review Collection
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
