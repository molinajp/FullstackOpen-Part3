const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://root:${password}@cluster0.dhkfjkm.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 3) {
    mongoose
        .connect(url)
        .then(result => {
            console.log('connected')
            const name = process.argv[3]
            const number = process.argv[4]
            const person = new Person({
                name: name,
                number: number
            })
            return person.save()
        })
        .then(() => {
            console.log('operation successful!')
            return mongoose.connection.close()
        })
        .catch((err) => console.log(err))
} else if (process.argv.length === 3) {
    mongoose
        .connect(url)
        .then(result => {
            console.log('connected')
            console.log('phonebook:')
            Person.find({}).then(result => {
                result.forEach(person => {
                  console.log(`${person.name} ${person.number}`)
                })
                mongoose.connection.close()
              })
        })
        .catch((err) => console.log(err))
    }