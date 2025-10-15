if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const cors = require('cors');

const ExpressError=require("./utils/ExpressError.js");
const User = require("./models/user.js");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const bookingRouter=require("./routes/booking.js");
const kycRouter=require("./routes/kyc.js");
const paymentRouter=require("./routes/payment.js");


const dburl = process.env.ATLASDB_URL;
const dbName = process.env.DB_NAME; // optional
async function main() {
    const options = {};
    if (dbName) options.dbName = dbName;
    await mongoose.connect(dburl, options);
}

main()
    .then(() => {
        console.log(`MongoDB connected${dbName ? ` to db: ${dbName}` : ''}`);
        app.listen(8080, () => {
            console.log("server is listening to port 8080");
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err?.message || err);
        console.error('Hint: Check Atlas IP whitelist and credentials in ATLASDB_URL, or set DB_NAME.');
        process.exit(1);
    });

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({extended:true}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS for React dev server
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({ origin: 'http://localhost:3000' }));
}


app.get("/",(req,res)=>{
    res.send("API is working!");
});


// No session/passport with JWT

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/user", userRouter);
app.use("/customer/bookings", bookingRouter);
app.use("/kyc", kycRouter);
app.use("/payments", paymentRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    // Ensure a JSON error response is sent
    res.status(statusCode).json({ error: message });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
