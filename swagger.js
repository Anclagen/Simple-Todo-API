const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "1.0.0",
    title: "My TODOs",
    description: "A simple TODO app with user authentication, categories and statuses. Using JWT for authentication (Ensure to add 'Bearer ' before the token).",
  },
  // If the app is deployed, update this host to your production URL.
  host: "localhost:3000",
  // Define the security scheme for Bearer token
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  definitions: {
    User: {
      id: 1,
      name: "John Doe",
      email: "example@example.com",
      password: "password",
    },
    UserBodySignUp: {
      name: "John Doe",
      email: "example@example.com",
      password: "password",
    },
    UserBodyLogin: {
      email: "example@example.com",
      password: "password",
    },
    Category: {
      id: 1,
      name: "Work",
      UserId: 1,
    },
    CategoryBody: {
      name: "Free Time",
    },
    Todo: {
      id: 1,
      name: "Buy Groceries",
      description: "Get fruits and vegetables",
      StatusId: 1,
      CategoryId: 1,
      UserId: 1,
    },
    TodoResponse: {
      id: 1,
      name: "Buy Groceries",
      description: "Get fruits and vegetables",
      StatusId: 1,
      CategoryId: 1,
      UserId: 1,
      Category: {
        $ref: "#/definitions/Category",
      },
      Status: {
        $ref: "#/definitions/Status",
      },
    },
    TodoBody: {
      name: "New/Updated Todo",
      description: "New/Updated Description",
      StatusId: 1,
      CategoryId: 1,
    },
    Status: {
      id: 1,
      status: "Not Started",
    },

    // etc...
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./bin/www");
});
