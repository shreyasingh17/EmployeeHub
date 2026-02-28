const express = require('express');
const path = require('path');

const router = express.Router();

router.use((req, res) => {
  if (req.originalUrl.startsWith('/employees')) {
    res.status(404).json({ message: '404 - Resource Not Found' });
    return;
  }

  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

module.exports = router;
