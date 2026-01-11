const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passkey: {
    type: String,
    //required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  profilePic : {
    type:String,
    default:"defaultPhoto.webp",
}
});

module.exports = mongoose.model('admin', adminSchema);