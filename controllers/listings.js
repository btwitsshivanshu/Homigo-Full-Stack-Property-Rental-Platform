const Listing = require("../models/listing.js");



module.exports.index=async(req,res)=>{
    let allListings;
    const locationQuery = req.query.location;
    if (locationQuery && locationQuery.trim() !== "") {
        // Case-insensitive, partial match in location or country
        allListings = await Listing.find({
            $or: [
                { location: { $regex: locationQuery, $options: "i" } },
                { country: { $regex: locationQuery, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    let notFoundMsg = null;
    if (locationQuery && allListings.length === 0) {
        notFoundMsg = `No stays found for "${locationQuery}".`;
    }
    res.render("./listings/index.ejs", { allListings, locationQuery, notFoundMsg });
}


module.exports.show=async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Forward geocoding using Nominatim
    const axios = require('axios');
    let coords = { lat: 28.6139, lon: 77.2090 }; // Default: New Delhi
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.location)}`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'HomigoApp/1.0' } });
        if (response.data && response.data.length > 0) {
            coords.lat = response.data[0].lat;
            coords.lon = response.data[0].lon;
        }
    } catch (err) {
        console.log('Nominatim geocoding error:', err.message);
    }

    res.render("./listings/show.ejs", { listing, coords });

}


module.exports.create = async (req, res, next) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    let url = req.file ? req.file.path : null;
    let filename = req.file ? req.file.filename : null;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: url,
        filename: filename
    };
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}

module.exports.update=async(req,res)=>{
    const {id}=req.params;
    let listing = await Listing.findById(id);
    let updatedData = req.body.listing;
    // If a new image file is uploaded, update image object
    if (req.file) {
        updatedData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    } else {
        // If no new file, keep the old image
        updatedData.image = listing.image;
    }
    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success","Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}


module.exports.edit=async(req,res)=>{
    let {id}=req.params; 
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    req.flash("success","Successfully edited the listing!");
    res.render("./listings/edit.ejs",{listing});

}

module.exports.deleteroute=async(req,res)=>{
    let {id}=req.params; 
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
}