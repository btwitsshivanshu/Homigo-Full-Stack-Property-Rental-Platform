const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");  
const Listing=require("../models/listing.js")
const {isLoggedIn} = require("../middleware.js");
const {index,show,create,update,edit,deleteroute} = require("../controllers/listings.js");
const multer = require("multer");

const {storage} =require("../cloudConfig.js");
const upload = multer({storage})

const validateListing=(req,res,next)=>{
    console.log('validateListing middleware called');
    let {error}=listingSchema.validate(req.body);
    if(error){
        console.log('Validation error:', error.details[0].message);
        throw new ExpressError(400, error.details[0].message);
    }
    else{
        console.log('Validation passed');
        next();
    }
}



// Enable image upload for listing creation
router.post(
    "/",
    (req, res, next) => {
        console.log('isLoggedIn middleware called');
        next();
    },
    isLoggedIn,
    (req, res, next) => {
        console.log('multer upload middleware called');
        next();
    },
    (req, res, next) => {
        upload.single('listing[image]')(req, res, function (err) {
            if (err) {
                console.log('Multer error:', err);
                return res.status(400).send('Multer error: ' + err.message);
            }
            next();
        });
    },
    validateListing,
    wrapAsync((req, res, next) => {
        console.log('create controller called');
        return create(req, res, next);
    })
);



//Index Route

router.get("/",wrapAsync(index))

// new route
router.get("/new",isLoggedIn,(req,res)=>{
    
    res.render("./listings/new.ejs");

})

//show route

router.get("/:id",wrapAsync(show));

//create route

// router.post("/",isLoggedIn, validateListing,wrapAsync(create))
router.put("/:id",
    isLoggedIn,
    (req, res, next) => {
        upload.single('listing[image]')(req, res, function (err) {
            if (err) {
                console.log('Multer error:', err);
                return res.status(400).send('Multer error: ' + err.message);
            }
            next();
        });
    },
    validateListing,
    wrapAsync(update)
);
//update route

router.put("/:id",isLoggedIn,validateListing,wrapAsync(update));
//edit route

router.get("/:id/edit",isLoggedIn,wrapAsync(edit))

//Delete route 

router.delete("/:id",isLoggedIn,wrapAsync(deleteroute));


module.exports=router;