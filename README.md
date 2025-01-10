![](http://143.42.108.232/pvt/Noroff-64.png)

# Noroff

## Back-end Development Year 1

### REST API - Course Assignment 1 <sup>V2</sup>

# Application Installation and Usage Instructions

- Clone the repository
- Run `npm install` to install the dependencies
- Run `npm start` to start the server
- The server will be running on `http://localhost:3000`

# Usage

- Use Postman to test the API endpoints or create a front-end application
- Documentation of endpoints will be available at `http://localhost:3000/doc`

# Testing

- Run `npm run test` to run the tests.
- Tests will run on the existing database if no test environment variables are provided.

# Environment Variables

- Create a `.env` file in the root directory
- Add the following environment variables to the file

```env
HOST = "localhost";
ADMIN_USERNAME = "admin";
ADMIN_PASSWORD = "P@ssw0rd";
DATABASE_NAME = "myTodo";
DIALECT = "mysql";
PORT = "3000";
TOKEN_SECRET = "mysecret";

// Optional for jest testing otherwise tests will use the above values
TEST_DATABASE_NAME;
TEST_ADMIN_USERNAME;
TEST_ADMIN_PASSWORD;
TEST_HOST;
```

# Additional Libraries/Packages

jsonwebtoken - For generating and verifying tokens
jest - For testing
supertest - For testing API endpoints
swagger-jsdoc - For generating swagger documentation
swagger-ui-express - For displaying swagger documentation

# NodeJS Version Used

Node version: `v20.17.0`
