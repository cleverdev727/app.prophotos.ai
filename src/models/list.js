const mongoose = require("mongoose");
const ListSchema = new mongoose.Schema({
    images: {
      type: Array,
      required: true,
    },
    request_id: {
      type: Number
    },
    urls: {
      type: Array
    },
    status: {
      type: Boolean,
      default: false
    },
    prompt: {
      type: Number,
      default: 0
    }
});

const List = mongoose.model("List", ListSchema);
module.exports = List;