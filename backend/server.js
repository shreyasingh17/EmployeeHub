const express = require('express');
const cors = require('cors');
const path = require('path');
const employeeRoutes = require('./routes/employee.routes');
const notFoundRoutes = require('./routes/not-found.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/employees', employeeRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist/employee-crud')));

app.use(notFoundRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});