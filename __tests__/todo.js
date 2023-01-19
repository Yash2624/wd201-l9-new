/* eslint-disable no-undef */
const request = require("supertest");
let cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
//const todo = require("../models/todo");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application by Yash", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
  try {
    await db.sequelize.close();
    await server.close();
    } catch (error) {
      console.log(error);
    }
  });
  test("Create new todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Time to drink milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); 
  });

  test("Mark todo work as completed (Updating Todo)", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Drink milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const todoID = await agent.get("/todos").then((response) => {
      const parsedResponse = JSON.parse(response.text);
      return parsedResponse[1]["id"];
    });
    const setCompletionResponse = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: true, _csrf: csrfToken });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  const setCompletionResponse2 = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: true, _csrf: csrfToken });
    const parsedUpdateResponse2 = JSON.parse(response.text);
    expect(parsedUpdateResponse2.completed).toBe(false);
  });
  test("Fetches all todos in the database using /todos endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy mac",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    await agent.post("/todos").send({
      title: "Buy mac_m1",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy mac_m1");
  });


  test(" Delete todo using ID", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Go to shopping",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
   
     const todoID = await agent.get("/todos").then((response) => {
      const parsedResponse = JSON.parse(response.text);
      return parsedResponse[4]["id"];
    });
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse.success).toBe(true);
  });
});
