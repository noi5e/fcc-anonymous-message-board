const mongoose = require('mongoose')

const ThreadSchema = mongoose.Schema({
  board: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    required: true
  },
  bumped_on: {
    type: Date,
    required: true
  },
  reported: {
    type: Boolean,
    required: true
  },
  replies: {
    type: Array,
    required: true
  }
})

const Thread = module.exports = mongoose.model('Thread', ThreadSchema)