require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', function getBody(req) {
    if (req.body && Object.keys(req.body).length !== 0) {
        return JSON.stringify(req.body)
    }
})

//works the way I expected
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['body'](req, res)
    ].join(' ')
}))

//adds a '-' when body is empty
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.use(cors())

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).send(`There's no person with id ${request.params.id}`).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.number || !person.name) {
        response.status(400).json({ 'error': `fields can't be blank` })
    }/* else if (persons.filter(p => p.name === person.name).length !== 0) {
        response.status(400).json({ 'error': `name must be unique` })
    } else {
        person.id = Math.floor(Math.random() * 100000000)
        persons = persons.concat(person)
        response.json(person)
    }*/
    const personToBeSaved = new Person({
        name: person.name,
        number: person.number
    })
    personToBeSaved.save().then(person => {
        response.status(201).json(person)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    if (!person.number || !person.name) {
        response.status(400).json({ 'error': `fields can't be blank` }).end()
    } else{
        Person
        .findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
    }
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has ${persons.length} entries </p>  ${new Date()}`)
})

const PORT = process.env.PORT || "8080";
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
  }
  
  // this has to be the last loaded middleware.
  app.use(errorHandler)