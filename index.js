const express = require("express");
const app = express();

const PORT = 4000;

require("./api/controller")(app);
app.get("/", (req, res) => {
    res.send("POGCHAMP IT WORKS HUEHUEHUEHUE")
});

app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`)
});