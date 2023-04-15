const express = require('express');
const app = express();
const cors = require('cors');

//require('./database');

app.use(cors())
app.use(express.json());
app.use('/api', require('./routes/userRoutes'));

//app.listen(8080);
//console.log("Server on port ", 8080);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });