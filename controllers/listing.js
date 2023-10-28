const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}


module.exports.search = async (req, res) => {
    const { data } = req.body;
    if (!data) {
        req.flash("error", "Kindly search with country name !");
        res.redirect("/listings");
    }


    const mydata = await Listing.find({ 'country': { '$regex': '.*'+data+'.*',"$options":"i" } });
    
    if (mydata.length == 0) {
        req.flash("error", "No listings available for "+data+ " !");
        res.redirect("/listings");
    }

    res.render("listings/search.ejs", { mydata });
    
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not exist !");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()

    const result = listingSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(400, result.error);
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const { country } = req.body.listing;
    // console.log(country);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not exist !");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}




module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "send valid data for listing");
    }
    let coordinate = await geocodingClient.forwardGeocode({
        query: `${req.body.listing.location},${req.body.listing.country}`,
        limit: 2
    })
        .send();

    req.body.listing.geometry = coordinate.body.features[0].geometry;

    const newList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });


    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newList.image = { url, filename };
        await newList.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroy = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully !");

    res.redirect("/listings");

}