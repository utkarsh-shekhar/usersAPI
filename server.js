const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
const url = 'mongodb://localhost/usersDB'
const app = express()
const port = Number(process.env.PORT || 8081)

mongoClient.connect(url, function(err, db) {
  if(err) return console.log(err)
  let usersCollection = db.collection('users')

  app.use(bodyParser.urlencoded({extended: true}))

  app.listen(port, function() {
    console.log('Listening on', port);
  })

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })

  app.post('/users/create', (req, res) => {

    let insert = usersCollection.insert(req.body)
    console.log(req.body)
    if(insert)
      res.send('insert successful', insert)
    else
      res.send('insert unsuccessful')
  })

  app.get('/users', (req, res) => {
    usersCollection.find().toArray((err, results) => {
      res.send(results)
    })
  })

  app.get('/users/:id', (req, res) => {
    console.log(req.params.id);
    usersCollection.find({'_id': new mongo.ObjectId(req.params.id)}).toArray((err, results) => {
      res.send(results)
    })
  })

  app.get('/users/remove/:id', (req, res) => {
    console.log(req.params.id);
    usersCollection.remove({'_id': new mongo.ObjectId(req.params.id)}, (err, results) => {
      if(err) return console.log(err)

      res.send(results)
    })
  })
})
