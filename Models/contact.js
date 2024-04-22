const mongoose = require('mongoose');


const contactSchema = new mongoose.Schema({
  Nom:
   { type: String,
     required: true },

  Prénom: 
  { type: String, 
    required: true },

  Email:
   { type: String, 
    required: true },
  Message: 
  { type: String, 
    required: true }
});


const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
