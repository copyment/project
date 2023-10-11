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

app.get("/home", async (req,res) => {
    try {
        const latestBooks = await Book.find()
        .sort({ DateCatalog: -1 })
        .limit(4);
        const randomBooks = await Book.aggregate([
            {$sample: { size: 4 }}
        ]);

        res.render("home", {latestBooks, randomBooks});
    } catch (error){
        console.error("Error:", error);
        res.status(500).send("Error occured.")
    }
});
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
    const contact = req.body.contact;
    const email = req.body.email;
    const rfid = req.body.rfid;
    const usern = req.body.username;

    const existingID = await User.findOne({ IDNumber: idNumber });
    const existingContact = await User.findOne({ ContactNumber: contact });
    const existingEmail = await User.findOne({ Email: email });
    const existingRfid = await User.findOne({ Rfid: rfid });
    const existingUsern = await User.findOne({ Username: usern });

    if (existingID) {
        return res.render("signup", {errorMessage: "ID number already exist, Please try another!"});
    }
    if (existingContact) {
        return res.render("signup", {errorMessage: "Contact Number already exist. Please try another!"});
    }
    if (existingEmail) {
        return res.render("signup", {errorMessage: "Email already exist. Please try another!"});
    }
    if (existingRfid) {
        return res.render("signup", {errorMessage: "RFID already exist. Please try another!"});
    }
    if (existingUsern) {
        return res.render("signup", {errorMessage: "Username already exist. Please try another!"});
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
        const userId = req.body.userId;
        const bookId = req.body.bookId;
        const userName = req.body.userName;
        const idNumber = req.body.idNumber;
        const title = req.body.title;
        const author = req.body.author;
        const callNumber = req.body.callNumber;
        const requestStatus = req.body.requestStatus;
        const image = req.body.image;
        const dateRequested = req.body.dateRequested;

        // Save the request to your database
        // Example using your RequestModel
        const newRequest = new RequestModel({
            UserId: userId,
            BookId: bookId,
            Username: userName,
            IDNumber: idNumber,
            Title: title,
            CreatorAuthor: author,
            CallNumber: callNumber,
            DateRequested: dateRequested,
            RequestStatus: requestStatus,
            Image: image,
        });
        await newRequest.save();

        // Respond with a success message
        res.status(200).json({ message: "Request saved successfully" });
        console.log("request saved successfully");
    } catch (error) {
        console.error("Error:", error);
        // Handle errors here
        res.status(500).json({ error: "Error occurred while processing the request" });
    }
});


app.listen(3000,()=>{
    console.log("port connected")
})