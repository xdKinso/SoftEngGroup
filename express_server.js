// Import express.js
const express = require("express");
// Create express app
var app = express();
// Create a get for root - /
app.get("/", function(req, res) {
 res.send("Hello world!");
});
// Start server on port 3000
app.listen(3000,function(){
 console.log(`Server running at http://127.0.0.1:3000/`);
});