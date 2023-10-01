const express = require('express')
const mongoose=require("mongoose")
var session = require("express-session");
const app = express()
var path = require("path")
const {User, MessageModel, Book, RequestModel} = require ("./mongodb");
const multer = require("multer");
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024},
});

const tempelatePath=path.join(__dirname,'../Pages')
app.use(express.static('Pages'));
app.use(express.static('imgs'));
app.use(express.static('csss'));
app.use(express.static('font'));
app.use(express.static('jss'));
app.use(express.static('LOGO'));
app.use(express.static('load'));
app.use(express.json({ limit: '20mb' }))
app.set("view engine", "hbs")
app.set("views", tempelatePath)
app.use(session({
    secret: "lsmkey",
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ limit: '20mb', extended:false}))

// TO ACCESS OR OPEN THE PAGES S
app.get("/", (req,res)=>{
    res.render("FRONT")
})
app.get("/signup", (req,res)=>{
    res.render("signup")
})
app.get("/login", (req,res)=>{
    res.render("login")
})
app.get("/home", (req,res)=>{
    res.render("home");
})
app.get("/profile", (req,res)=>{
    const user = req.session.user;
    const formattedRegistrationDate = user.DateRegistered.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    res.render("profile", {user:user, formattedRegistrationDate: formattedRegistrationDate});
});
app.get("/FRONT", (req,res)=>{
    res.render("FRONT")
})
app.get("/toppages", async (req, res) => {
    try {
        const books = await Book.find(); // Retrieve all books from the collection
        console.log("Retrieved books:", books);
        const groupedBooks = groupBooksIntoRows(books, 4);
        res.render("toppages", { groupedBooks }); // Pass the retrieved books to view (bcollection.hbs)
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error occurred while retrieving books");
    }
});

function groupBooksIntoRows(books, count){
    const grouped = [];
    for (let i = 0; i < books.length; i += count) {
        grouped.push(books.slice(i, i + count));
    }
    return grouped;
}

app.get("/logout", (req,res)=>{
    req.session.destroy();
    res.render("FRONT");
})

app.get("/item", async (req, res) => {
    try {
        const bookId = req.query.bookId;
        const book = await Book.findById(bookId); // Retrieve the book by its ID


        if (!book) {
            return res.status(404).send("Book not found");
        }

        const itemsCopiesCollection = mongoose.connection.collection("ItemsCopies");

        const filter = {
            CallNumber: book.CallNumber,
            CirculationStatus: "Available"
        };

        // Use the "ItemsCopies" collection and apply the filter to count the matching documents
        const count = await itemsCopiesCollection.countDocuments(filter);

        res.render("item", {book, user: req.session.user, availableCopiesCount: count}); // Pass the book's information to the item template
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error occurred while retrieving the book");
    }
});

app.get("/bcollection", async (req, res) => {
    try {
        const books = await Book.find(); // Retrieve all books from the collection
        console.log("Retrieved books:", books);
        const groupedBooks = groupBooksIntoRows(books, 4);
        res.render("bcollection", { groupedBooks }); // Pass the retrieved books to view (bcollection.hbs)
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error occurred while retrieving books");
    }
});

function groupBooksIntoRows(books, count){
    const grouped = [];
    for (let i = 0; i < books.length; i += count) {
        grouped.push(books.slice(i, i + count));
    }
    return grouped;
}

app.get("/myreserved", async (req, res) => {
    try {
        const userId = req.session.user._id;
        // Fetch all reservation requests for the current user
        const reservedBooks = await RequestModel.find({
            UserId: userId,
            RequestStatus: "pending" // Assuming "reserved" is the status for reserved books
        });
        console.log("Reserved Books:", reservedBooks);
        // Render the myreserved.hbs template with the reserved books data
        res.render("myreserved", { reservedBooks });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error occurred while fetching reserved books");
    }
});


// TO ACCESS OR OPEN THE PAGES S

// GET DATA FROM REGISTRATION S
app.post("/signup", upload.single("profilePicture"),async (req,res)=>{
try {
    const idNumber = req.body.idnumber;

    const existingUser = await User.findOne({ IDNumber: idNumber });

    if (existingUser) {
        return res.render("signup", {errorMessage: "ID number you enter are already exist. Please try another!"});
    }
    const data={
    Fullname:req.body.fullname,
    Age:req.body.age,
    Birthday:req.body.birthday,
    Username:req.body.username,
    Password:req.body.password,
    ContactNumber:req.body.contact,
    IDNumber:req.body.idnumber,
    Address:req.body.address,
    Email:req.body.email,
    Rfid:req.body.rfid,
    AccountType:req.body.account,
    Status: req.body.status,
};
const formattedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
});
data.DateRegistered = formattedDate;

if (req.file){
    const profilePictureBuffer = await sharp (req.file.buffer)
    .resize({ width: 100, height: 100 }) // Adjust dimensions as needed
    .jpeg({ quality: 50 }) // Adjust quality as needed
    .toBuffer();

    const profilePictureBase64 = profilePictureBuffer.toString("base64");
    data.ProfilePicture = profilePictureBase64;

    const imageSizeInBytes = Buffer.from(profilePictureBase64, 'base64').length;
            
        if (imageSizeInBytes > 5120) {
            return res.render('signup', { errorMessage: 'Image size exceeds 5KB. Please choose a smaller image.' });
        }
}
const newUser = new User(data);
await newUser.save();

res.render("login");
} catch (error) {
    console.error("Error:", error);
    res.send("error occured while saving the message");
}
});

app.post("/submitmessage",async (req,res)=>{
    const messageData={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        message:req.body.message
    };
    try {
    const newMessage = new MessageModel(messageData);
    await newMessage.save();
    res.render("FRONT");
    } catch (error) {
        console.error("Error:", error);
        res.send("error occured while saving the message");
    }
    });

// GET DATA FROM REGISTRATION E

// LOG IN S
app.post("/login",async (req,res)=>{
    try {
        const check = await User.find({Username:req.body.username});
    if(check.length > 0 && check[0].Password === req.body.password) {
        const user = check[0];
        req.session.user = user;
        res.redirect("/home");
    }
    else{
        res.render("login", { errorMessage: "Incorrect Username or Password, Try Again!" });
    }
    }
    catch (error){
        console.error("error during login:", error)
        res.render("login", { errorMessage: "An error occurred. Please try again later." });
    }
    })
// LOG IN E

// Handle the request POST request
app.post("/request", async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { bookId, userName, idNumber, title, author, callNumber, requestStatus, image} = req.body;

        // Create a new request object
        const request = {
            UserId: userId,
            BookId: bookId,
            Username: userName,
            IDNumber: idNumber,
            Title: title,
            CreatorAuthor: author,
            CallNumber: callNumber,
            RequestStatus: requestStatus,
            Image: image,
        };

        const formattedDate = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        request.DateRequested= formattedDate;

        // Debugging: Output request object
        // Save the request to your "Request Collection"
        const newRequest = new RequestModel(request);
        await newRequest.save();

        // Debugging: Output success message
        console.log("Request saved successfully");

        // Respond with a success message or redirect the user to a confirmation page

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error occurred while processing the request");
    }
});

app.listen(3000,()=>{
    console.log("port connected")
})