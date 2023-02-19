const {
  Schema,
  model
} = require('mongoose');
const boardSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  dateCreation: Date,
  createdBy: String,
  cycleTimeStart: String,
  cycleTimeStartIdList: String,
  cycleTimeEnd: String,
  cycleTimeEndIdList: String,
  users: {
    type: Array,
    default: []
  },
  list: {
    type: Array,
    default: []
  }
});
module.exports = model('Board', boardSchema, 'boards');