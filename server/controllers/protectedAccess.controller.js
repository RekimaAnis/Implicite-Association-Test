const path = require('path');

exports.getFirstPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/admin.html'));
};
