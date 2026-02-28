const {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employee.controller');

function registerEmployeeRoutes(app) {
  app.get('/employees', listEmployees);
  app.get('/employees/:id', getEmployeeById);
  app.post('/employees', createEmployee);
  app.put('/employees/:id', updateEmployee);
  app.delete('/employees/:id', deleteEmployee);
}

module.exports = {
  registerEmployeeRoutes
};
