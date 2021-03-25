const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  password: String,
  email: String,
  username: String,
  createdAt: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Number,
});

module.exports = model('User', userSchema);
