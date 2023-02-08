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
    }
});

const List = mongoose.model("List", ListSchema);
module.exports = List;