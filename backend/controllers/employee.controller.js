const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '..', 'db.json');

function readEmployees() {
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const parsed = JSON.parse(raw);
  return parsed.employees || [];
}

function saveEmployees(employees) {
  fs.writeFileSync(dbPath, JSON.stringify({ employees }, null, 2));
}

function toLower(value) {
  return String(value || '').toLowerCase();
}

function applyFilters(employees, query) {
  let result = [...employees];

  if (query.q) {
    const q = toLower(query.q);
    result = result.filter((employee) =>
      [employee.fullName, employee.email, employee.role].some((field) => toLower(field).includes(q))
    );
  }

  if (query.status) {
    result = result.filter((employee) => employee.status === query.status);
  }

  if (query.department) {
    result = result.filter((employee) => employee.department === query.department);
  }

  if (query.dateJoined_gte) {
    result = result.filter((employee) => employee.dateJoined >= query.dateJoined_gte);
  }

  if (query.dateJoined_lte) {
    result = result.filter((employee) => employee.dateJoined <= query.dateJoined_lte);
  }

  return result;
}

function applySorting(employees, query) {
  const sortBy = query._sort || 'fullName';
  const sortDirection = query._order === 'desc' ? -1 : 1;

  return [...employees].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * sortDirection;
    }

    return String(aVal || '').localeCompare(String(bVal || '')) * sortDirection;
  });
}

function applyPagination(employees, query) {
  const page = Number(query._page || 1);
  const limit = Number(query._limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: employees.slice(start, end),
    page,
    limit
  };
}

function listEmployees(req, res) {
  console.log(`[API] ${req.method} ${req.originalUrl}`);

  const allEmployees = readEmployees();
  const filtered = applyFilters(allEmployees, req.query);
  const sorted = applySorting(filtered, req.query);
  const paged = applyPagination(sorted, req.query);

  res.setHeader('X-Total-Count', String(filtered.length));
  res.status(200).json(paged.data);
}

function getEmployeeById(req, res) {
  const employees = readEmployees();
  const employee = employees.find((item) => item.id === req.params.id);

  if (!employee) {
    res.status(404).json({ message: 'Employee not found.' });
    return;
  }

  res.status(200).json(employee);
}

function createEmployee(req, res) {
  const employees = readEmployees();
  const payload = req.body || {};

  if (!payload.fullName || !payload.email) {
    res.status(400).json({ message: 'fullName and email are required.' });
    return;
  }

  const newEmployee = {
    ...payload,
    id: randomUUID()
  };

  employees.push(newEmployee);
  saveEmployees(employees);

  res.status(201).json(newEmployee);
}

function updateEmployee(req, res) {
  const employees = readEmployees();
  const payload = req.body || {};
  const index = employees.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: 'Employee not found.' });
    return;
  }

  if (!payload.fullName || !payload.email) {
    res.status(400).json({ message: 'fullName and email are required.' });
    return;
  }

  employees[index] = payload;
  saveEmployees(employees);

  res.status(200).json(payload);
}

function deleteEmployee(req, res) {
  const employees = readEmployees();
  const index = employees.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: 'Employee not found.' });
    return;
  }

  employees.splice(index, 1);
  saveEmployees(employees);

  res.status(204).send();
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
