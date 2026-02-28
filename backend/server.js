const express = require('express');
const cors = require('cors');
const { registerEmployeeRoutes } = require('./routes/employee.routes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

registerEmployeeRoutes(app);

app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
