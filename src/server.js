const app = require("./app");
const initializeDatabase = require("./db/init");

const PORT = process.env.PORT || 5001;

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});