const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema } = require("../schema.js");
const { isLogin } = require("../middelware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//new route
router.get("/new", isLogin, (req, res) => {
  res.render("listings/new.ejs");
});

// listing route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    // res.render("listings/index.ejs", {allListings});
    res.render("listings/index.ejs", { allListings });
  })
);

//create route
router.post(
  "/",
  isLogin,
  validateListing,
  upload.single("listing[image]"),
  wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListings = new Listing(req.body.listing);
    newListings.owner = req.user._id;
    newListings.image = { url, filename };
    await newListings.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

//show route
router.get(
  "/:id",
  isLogin,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "Your listing is not accessable");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//edit route
router.get(
  "/:id/edit",
  isLogin,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Your listing is not accessable");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//Update route
router.put(
  "/:id",
  isLogin,
  validateListing,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url , filename};
      await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

//delete route
router.delete(
  "/:id",
  isLogin,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteList = await Listing.findByIdAndDelete(id);
    // console.log(deleteList);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
