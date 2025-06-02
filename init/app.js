const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initdata = require("./data.js");

main()
  .then(() => {})
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/traveller");
}

const initDb = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({...obj , owner : "683c7873a2257b7371a38e25"}));
  await Listing.insertMany(initdata.data);
};

initDb();
