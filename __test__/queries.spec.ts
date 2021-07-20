import request from 'supertest'
import app from '../src/server'

let TOKEN = 'Bearer '

test('authentication', (done) => {
	request(app)
		.post('/graphql')
		.send({
			query: `{ login(pasword: "test", username: "test") }`,
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function (err, res) {
			if (err) return done(err)

			console.log(res.body)

			expect(res.body).toBeInstanceOf(Object)
			expect(typeof res.body.data.login).toBe('string')

			TOKEN = `${TOKEN}${res.body.data.login}`

			done()
		})
})

test('fetch users', (done) => {
	request(app)
		.post('/graphql')
		.send({
			query: `{ users(params: { skip: 0, take: 20, term: ""} ) { id, username, password, createdAt } }`,
		})
		.set('Accept', 'application/json')
		.set('Authorization', TOKEN)
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function (err, res) {
			if (err) return done(err)
			expect(res.body).toBeInstanceOf(Object)
			expect(res.body.data.users.length).toBeGreaterThan(0)
			done()
		})
})

// var userid = ""

// test("add user", (done) => {
//   request(app)
//     .post("/graphql")
//     .send({
//       query: 'mutation { addUser(username: "random-test-user" , password: "test") { id username password } }',
//     })
//     .set("Accept", "application/json")
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .end(function (err, res) {
//       if (err) return done(err)
//       expect(res.body).toBeInstanceOf(Object)
//       expect(res.body.data.addUser).toBeInstanceOf(Object)
//       expect(typeof res.body.data.addUser.username).toBe('string')

//       userid = res.body.data.addUser.id

//       done()
//     })
// })

// test("find user by id", (done) => {
//   request(app)
//     .post("/graphql")
//     .send({
//       query: `{ userById(id: "${userid}") { id username password } }`,
//     })
//     .set("Accept", "application/json")
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .end(function (err, res) {
//       if (err) return done(err)
//       expect(res.body).toBeInstanceOf(Object)
//       expect(res.body.data.userById).toBeInstanceOf(Object)
//       expect(typeof res.body.data.userById.username).toBe('string')

//       done()
//     })
// })

// test("remove user", (done) => {
//   request(app)
//     .post("/graphql")
//     .send({
//       query: `mutation { removeUser(id: "${userid}") { id username password } }`,
//     })
//     .set("Accept", "application/json")
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .end(function (err, res) {
//       if (err) return done(err)
//       expect(res.body).toBeInstanceOf(Object)
//       expect(res.body.data.removeUser).toBeInstanceOf(Object)
//       expect(typeof res.body.data.removeUser.username).toBe('string')

//       done()
//     })
// })
