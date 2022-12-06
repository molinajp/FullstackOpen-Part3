const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())

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
//app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

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
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).send(`There's no person with id ${id}`)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.number || !person.name) {
        response.status(400).json({ 'error': `fields can't be blank` })
    } else if (persons.filter(p => p.name === person.name).length !== 0) {
        response.status(400).json({ 'error': `name must be unique` })
    } else {
        person.id = Math.floor(Math.random() * 100000000)
        persons = persons.concat(person)
        response.json(person)
    }

})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has ${persons.length} entries </p>  ${new Date()}`)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})