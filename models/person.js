const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

//console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log(result)
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^[0-9]{2,3}-[0-9]{7,8}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

personSchema.on('index', function (err) { // <-- Wait for model's indexes to finish
  // eslint-disable-next-line no-undef
  assert.ifError(err)
})

module.exports = mongoose.model('Person', personSchema)