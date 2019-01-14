/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const mongoose = require('mongoose')
const Thread = require('../models/thread')

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function(req, res) {
      // I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).  
      
      if (req.body.text === undefined || req.body.delete_password === undefined) {
        res.status(400).send('POST request must have text & delete_password.')
      }

      const newThreadData = {
        board: req.params.board,
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date,
        bumped_on: new Date,
        reported: false,
        replies: []
      }
      
      const threadToSave = new Thread(newThreadData)
      
      threadToSave.save((error, newThread) => {
        if (error) { 
          console.log(error)
          res.status(500).send('Error saving new thread.').end()
        }
        
        res.status(200).json(newThread)
      })
    
    })
    .get(function(req, res) {
      // I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
      
      Thread.find({ board: req.params.board }, { replies: { $slice: 3 } }).limit(10).exec((error, threads) => {
        if (error) {
          console.log(error)
          res.status(500).send('Error retrieving all threads.').end()
        }
        
        res.status(200).json(threads)
      })
    
    })
    .put(function(req, res) {
      // I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
      if (req.body.thread_id === undefined) {
        res.status(400).send('PUT request must have _id.')
      } else {
        Thread.findOne({ board: req.params.board, _id: req.body.thread_id }, (error, thread) => {
          if (error) {
            console.log(error)
            res.status(500).send('Error finding thread.')
          } else {
            thread.reported = true

            thread.save((error) => {
              if (error) {
                console.log(error)
                res.status(500).send('Error saving reported thread.')
              }

              res.status(200).send('success')
            })
          }
        })
      }
    })
    .delete(function(req, res) {
      // I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
      if (req.body.thread_id === undefined) {
        res.status(400).send('DELETE request must have _id.')
      } else {
        Thread.findOne({ _id: req.body.thread_id }, (error, thread) => {
          if (error) {
            console.log(error)
            res.status(500).send('Error deleting thread.')
          } else if (thread.delete_password !== req.body.delete_password) {
            res.status(400).send('incorrect password')
          } else {
            Thread.deleteOne({ _id: req.body.thread_id }, (error, thread) => {
              if (error) {
                console.log(error)
                res.status(500).send('Error deleting thread.')
              } else {
                res.status(200).send('success')
              }
            })
          }
        }) 
      }
    })
  
  app.route('/api/replies/:board')
    .post(function(req, res) {
      // I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
      
      if (req.body.text === undefined || req.body.delete_password === undefined || req.body.thread_id === undefined) {
        res.status(400).send('POST request must have text, delete_password, and thread_id')
      }

      Thread.findOne({ board: req.params.board, _id: req.body.thread_id }, (error, thread) => {

        if (error) {
          console.log(error)
          res.status(500).send('error finding thread.')
        }

        thread.bumped_on = new Date

        thread.replies = thread.replies.concat([{
          text: req.body.text,
          created_on: new Date,
          delete_password: req.body.delete_password,
          reported: false,
          _id: mongoose.Types.ObjectId()
        }])

        thread.markModified('replies')

        thread.save((error, newThread) => {
          if (error) {
            res.status(500).send('error saving reply to thread.')
          }

          res.status(200).json(newThread)
        })
      })
    })
    .get(function(req, res) {
      // I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.
    
      Thread.findOne({ board: req.params.board, _id: req.query.thread_id }, (error, thread) => {
        if (error) {
          console.log(error)
          res.status(500).send('error looking up thread.')
        }

        res.status(200).json(thread)
      })
    })
    .put(function(req, res) {
      // I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')

      if (req.body.thread_id === undefined || req.body.reply_id === undefined) {
        res.status(400).send('PUT request must have thread_id and reply_id')
      }

      Thread.findOne({ _id: req.body.thread_id }, (error, thread) => {
        if (error) {
          console.log(error)
          res.status(500).send('Error finding thread.')
        }

        for (let i = 0; i < thread.replies.length; i++) {
          if (thread.replies[i]._id.toString() === req.body.reply_id) {
            console.log('marking reported as true')
            thread.replies[i].reported = true
          }
        }

        thread.markModified('replies')

        thread.save((error) => {
          if (error) { console.log('error saving replies: ', error) }

          res.status(200).send('success')
        })
      })
    })
    .delete(function(req, res) {
      // I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')

      if (req.body.thread_id === undefined || req.body.reply_id === undefined || req.body.delete_password === undefined) {
        res.status(400).send('DELETE request must have thread_id, reply_id, and delete_password')
      }

      Thread.findOne({ _id: req.body.thread_id }, (error, thread) => {
        if (error) {
          console.log(error)
          res.status(500).send('Error deleting thread.')
        }

        for (let i = 0; i < thread.replies.length; i++) {
          if (thread.replies[i]._id.toString() === req.body.reply_id) {
            if (thread.replies[i].delete_password === req.body.delete_password) {
              thread.replies[i].text = '[deleted]'

              thread.markModified('replies')

              thread.save((error) => {
                if (error) {
                  console.log(error)
                  res.status(500).send('Error saving deleted reply.')
                }

                res.status(200).send('success')
              })
            } else {
              res.status(400).send('incorrect password')
            }
          }
        }
      })
    })
};