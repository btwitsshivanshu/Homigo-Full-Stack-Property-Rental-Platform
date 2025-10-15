const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js");
const { requireRole, requireKycVerifiedOwner } = require('../middleware/auth');
const {index,show,create,update,edit,deleteroute,myListings} = require("../controllers/listings.js");
const multer = require("multer");

const {storage} =require("../cloudConfig.js");
const upload = multer({storage});

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
};

// Enable image upload for listing creation
router.post(
    "/",
    isLoggedIn,
    requireRole('owner'),
    requireKycVerifiedOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(create)
);

//Index Route
router.get("/",wrapAsync(index))

// new route
router.get("/new", isLoggedIn, (req, res) => {
    res.json({ message: "Please provide new listing details." });
});

// Owner's listings (place before param routes)
router.get("/owner/listings", isLoggedIn, requireRole('owner'), wrapAsync(myListings));

//show route
router.get("/:id",wrapAsync(show));

//create route
router.put("/:id",
    isLoggedIn,
    requireRole('owner'),
    requireKycVerifiedOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(update)
);

//edit route
router.get("/:id/edit",isLoggedIn, requireRole('owner'), requireKycVerifiedOwner, wrapAsync(edit))

//Delete route 
router.delete("/:id",isLoggedIn, requireRole('owner'), requireKycVerifiedOwner, wrapAsync(deleteroute));

module.exports=router;