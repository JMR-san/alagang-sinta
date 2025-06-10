const userModel = require('../models/userModel');

exports.addUser = (req, res) => {
  const { name, email, message } = req.body;
  userModel.insertUser(name, email, message, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('User added successfully!');
  });
};

exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) return res.status(500).send(err);
    res.json(users);
  });
};
