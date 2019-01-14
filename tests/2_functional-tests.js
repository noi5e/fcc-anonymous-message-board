/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const Thread = require('../models/thread')

chai.use(chaiHttp);

let testThreadId = ''
let replyId = ''

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      // I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).  
      
      test('POST valid input', function(done) {
        chai.request(server)
          .post('/api/threads/test')
          .send({ text: 'test', delete_password: 'password' })
          .end(function(err, res) {
            assert.equal(res.status, 200)  
            assert.isObject(res.body)
            assert.property(res.body, '_id')
            assert.property(res.body, 'text')
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.property(res.body, 'reported')
            assert.property(res.body, 'replies')
            assert.isString(res.body.text)
            assert.isBoolean(res.body.reported)
            assert.isArray(res.body.replies)
          
            testThreadId = res.body._id
          
            done()
          })
      })
      
    });
    
    suite('GET', function() {
      
      test('GET all threads', function(done) {
        chai.request(server)
          .get('/api/threads/test')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.isBelow(res.body.length, 11)
            done()
        })
      })
    });
    
//     suite('DELETE', function() {
      
//       test('DELETE incorrect delete password', function(done) {
//         chai.request(server)
//           .delete('/api/threads/test')
//           .send({ board: 'test', thread_id: testThreadId })
//           .end(function(err, res) {          
//             assert.equal(res.error.status, 400)
//             assert.equal(res.error.text, 'incorrect password')
//             done()
//           })
//       })
      
//       test('DELETE correct delete password', function(done) {
//         chai.request(server)
//           .delete('/api/threads/test')
//           .send({ thread_id: testThreadId, delete_password: 'password' })
//           .end(function(err, res) {
//             assert.equal(res.status, 200)
//             done()
//           })
//       })
      
//     });
    
    suite('PUT', function() {
      
      test('PUT valid input', function(done) {
        chai.request(server)
        .put('/api/threads/test')
        .send({ board: 'test', thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          
          Thread.findOne({ _id: testThreadId }, (err, thread) => {
            assert.isTrue(thread.reported)
            done()
          })
        })
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      // I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
      
      test('POST reply with valid input', function(done){
        chai.request(server)
          .post('/api/replies/test')
          .send({ thread_id: testThreadId, text: 'blah', delete_password: 'password' })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isObject(res.body)
            assert.isAbove(res.body.replies.length, 0)
            assert.property(res.body.replies[0], 'text')
            assert.property(res.body.replies[0], 'created_on')
            assert.property(res.body.replies[0], 'delete_password')
            assert.property(res.body.replies[0], 'reported')
            assert.property(res.body.replies[0], '_id')
            
            replyId = res.body.replies[0]._id
          
            done()
          })
      })
      
    });
    
    suite('GET', function() {
      
      test('GET single thread', function(done) {
        chai.request(server)
          .get('/api/replies/test')
          .query({ thread_id: testThreadId })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isObject(res.body)
            assert.equal(res.body.text, 'test')
            assert.equal(res.body.delete_password, 'password')
            done()
          })
      })
      
    });
    
    suite('PUT', function() {
      
      test('PUT - report single reply with valid input', function(done) {
        chai.request(server)
        .put('/api/replies/test')
        .send({ thread_id: testThreadId, reply_id: replyId })
        .end(function(err, res) {          
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          
          Thread.findOne({ _id: testThreadId }, (err, thread) => {
                        
            for (let i = 0; i < thread.replies.length; i++) {
              if (thread.replies[i]._id.toString() === replyId) {
                assert.isTrue(thread.replies[i].reported)
                
                done()
              }
            }
          })
        })
      })
      
    });
    
    suite('DELETE', function() {
      
      test('DELETE single reply with valid input', function(done) {
        chai.request(server)
          .delete('/api/replies/test')
          .send({ thread_id: testThreadId, reply_id: replyId, delete_password: 'password' })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
          
            Thread.findOne({ _id: testThreadId }, (err, thread) => {
              for (let i = 0; i < thread.replies.length; i++) {
                if (thread.replies[i]._id.toString() === replyId) {
                  assert.equal(thread.replies[i].text, '[deleted]')
                  done()
                }
              }
            })            

            done()
          })
      })
      
    });
    
  });

});
