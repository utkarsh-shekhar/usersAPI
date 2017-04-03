const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
// const url = 'mongodb://localhost/usersDB'
const url = 'mongodb://projectdba:password@ds149820.mlab.com:49820/project'
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
    let newPerson = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      nickname: req.body.nickname,
      gender: req.body.gender,
      children: null,
      parents: null
    }
    if(req.body.related == '') {
      usersCollection.insert(newPerson)
      res.status(200).send('insert successful')
    } else {
      usersCollection.find({'_id' : new mongo.ObjectId(req.body.related)}).toArray((err, results) => {
        let insert = usersCollection.insert(newPerson, function(err, inserted) {

          if(req.body.relationship == 'parent') {
            newPerson.children = [inserted._id]
            if(results.parents)
              results.parents.push(inserted._id)
            else
              results.parents = [inserted._id]

            usersCollection.update({'_id' : newPerson.related, inserted})
            usersCollection.update({'_id' : inserted._id, newPerson})

            res.status(200).send('insert successful')
          }
        })
      })

    }

    res.status(200).send('insert unsuccessful')
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
