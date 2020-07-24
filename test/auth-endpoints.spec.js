const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe.only('Auth Endpoints', function() {
  let db;

  const { testUsers } = helpers.makeArticlesFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    
    const requiredFields =  ['user_name','password']

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      }

      it(`responds with 400 required error when \'${field}\' is missing`, () => {
        delete loginAttemptBody[field]

        return supertest(app)
        .post('/api/auth/login')
        .send(loginAttemptBody)
        .expect(400, {
          error: `Missing '${field} in request body`
        })
      })      
    })

    it(`responds with a 401 required error when invalid user name`, () => {
      const userInvalidUser = {
        user_name: 'InvalidUserName',
        password: 'SomePassword'
      }
      return supertest(app)
      .post('/api/auth/login')
      .send(userInvalidUser)
      .expect(401, {
        error: `Incorrect username or password`
      })
    })

    it(`responds with a 401 required error when invalid password`, () => {
      const userInvalidPassword = {
        user_name: testUser.user_name,
        password: 'SomePassword'
      }
      return supertest(app)
      .post('/api/auth/login')
      .send(userInvalidPassword)
      .expect(401, {
        error: 'Incorrect username or password'
      })
    })

    it(`responds with a 200 and bearer token`, () => {
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.user_name,
        }
      )
      console.log(testUser)
      return supertest(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200, {
          authToken: expectedToken,
        })
    })

  });
});