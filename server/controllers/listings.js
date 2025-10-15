const Listing = require("../models/listing.js");



module.exports.index = async (req, res) => {
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
    if (locationQuery && allListings.length === 0) {
        return res.status(404).json({ message: `No stays found for "${locationQuery}".` });
    }
    res.json({ allListings, locationQuery });
};


module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
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

    res.json({ listing, coords });
};

// Return listings owned by the authenticated owner
module.exports.myListings = async (req, res) => {
    const ownerId = req.user.id;
    const listings = await Listing.find({ owner: ownerId });
    res.json({ listings });
};


module.exports.create = async (req, res, next) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    let url = req.file ? req.file.path : null;
    let filename = req.file ? req.file.filename : null;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user.id;
    newListing.image = {
        url: url,
        filename: filename
    };
    await newListing.save();
    res.status(201).json(newListing);
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }
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
    const updatedListing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedListing);
};


module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }
    res.json(listing);
};

module.exports.deleteroute = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        return res.status(404).json({ message: "Listing not found!" });
    }
    console.log(deletedListing);
    res.json({ message: "Successfully deleted the listing!" });
};