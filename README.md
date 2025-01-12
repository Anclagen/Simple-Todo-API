![](http://143.42.108.232/pvt/Noroff-64.png)

# Noroff

## Back-end Development Year 1

### REST API - Course Assignment 1 <sup>V2</sup>

# Application Installation and Usage Instructions

- Clone the repository

```bash
git clone https://github.com/noroff-backend-1/mar24ft-api-ca-1-Anclagen.git
```

- Install the dependencies

```bash
npm install
```

- Ensure you have a MySQL database running, and create a database for the application.
- Create a `.env` file in the root directory from the `.env_example` file and add your environment variables.
- Start the server

```bash
npm run start
```

- The server will be running on `http://localhost:3000`, or the port specified in the `.env` file.
- Documentation of endpoints will be available at `http://localhost:3000/doc` or the port specified in the `.env` file.

# Usage

- Use Postman or any other API testing tool to test the API endpoints or create a front-end application

# Testing

- ensure you have a mysql database running with your environment variables set in the `.env` file.
- Run the tests using the following command

```bash
npm run test
```

- Tests will run on the existing database and should clean up after themselves.

# Environment Variables

- Create a `.env` file in the root directory
- An example is provided below and in the env_example file.
- Add the following environment variables to the file and replace the values with your own.

```env
HOST = "localhost";
ADMIN_USERNAME = "admin";
ADMIN_PASSWORD = "P@ssw0rd";
DATABASE_NAME = "myTodo";
DIALECT = "mysql";
PORT = "3000";
TOKEN_SECRET = "mysecret";
```

# Additional Libraries/Packages

jsonwebtoken - For generating and verifying tokens
jest - For testing
supertest - For testing API endpoints
swagger-jsdoc - For generating swagger documentation
swagger-ui-express - For displaying swagger documentation

# NodeJS Version Used

Node version: `v20.17.0`
