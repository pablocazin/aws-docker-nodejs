const express = require("express");
const bodyParser = require("body-parser");
const albumRoutes = require("./routes/albums");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use("/api", albumRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
