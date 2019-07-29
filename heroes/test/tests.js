const chai = require('chai')
const chaiHttp = require('chai-http')
const db = require('../../heroes/heroes.js')
let should = chai.should()
let expect = chai.expect
const username = 'pradeep2326@celestialsys.com'
const password = 'Cel@123'
let ServerAddr = 'http://localhost:3005'
const registerRequest = {};
registerRequest.body = {
    name: "Pradeep",
    email: username,
    password: password,
    address: "Kolar"
}
chai.use(chaiHttp);
describe('Unit testing the application', function () {
    it('Register the user', (done) => {
        chai.request(ServerAddr)
            .post('/register')
            .send({
                'name': "Pradeep",
                'email': username,
                'password': password,
                'address': "Kolar"
            })
            .end((err, res) => {
            if (err) {
                throw err
            } else {
                expect(res.body.message).to.equal('User registered succesfully');
                done()
            }
            })
    })

    it('Login user', (done) => {
        chai.request(ServerAddr)
            .post('/login')
            .send({
                "email": "pradeepNewvirat7@example.com",
                "password": "pradeep12345"
            })
            .end((err, res) => {
            if (err) {
                throw err
            } else { 
                expect(res.body.message).to.equal('Successfully logged in');
                done()
            }
            })
    })

    it('Update user', (done) => {
        chai.request(ServerAddr)
            .post('/updateUser/48')
            .send({
                "name": "PradeepNew",
                "email": "pradeepNewvirat7@example.com",
                "password": "pradeep12345",
                "address":"kotraguli",
                "browserName": "chrome"
            })
            .end((err, res) => {
            if (err) {
                throw err
            } else { 
                expect(res.body.message).to.equal('User updated successfully');
                done()
            }
            })
    })

    it('Logout user', (done) => {
        chai.request(ServerAddr)
            .post('/login')
            .send({
                "email": "pradeepNewvirat7@example.com",
                "password": "pradeep12345"
            })
            .end((err, res) => {
            if (err) {
                throw err
            } else { 
                // expect(res.body.message).to.equal('Successfully logged in');
                // done()
                chai.request(ServerAddr)
                .post('/logout')
                .send({
                    "token": res.body.token
                })
                .end((err, res) => {
                if (err) {
                    throw err
                } else { 
                    expect(res.body.message).to.equal('Successfully logged out');
                    done()
                }
                })
            }
            })
    })
})

// const chai = require('chai')
// var assert = chai.assert;

// describe('Array', function() {
//   it('should start empty', function() {
//     var arr = [];

//     assert.equal(arr.length, 0);
//   });
// });