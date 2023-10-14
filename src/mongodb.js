const mongoose=require("mongoose")

mongoose.connect("mongodb://0.0.0.0:27017/LMS")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect");
})


const UserSchema=new mongoose.Schema({
    Fullname:{
        type:String,
        required:true
    },
    Address:{
        type:String,
        required:true
    },
    Age:{
        type:String,
        required:true
    },
    Birthday:{
        type:String,
    },
    Email:{
        type:String,
        required:true
    },
    ContactNumber:{
        type:String,
        required:true
    },
    IDNumber:{
        type:String,
        required:true
    },
    Username:{
        type:String,
        required:true
    },
    Rfid:{
        type:String,
    },
    Password:{
        type:String,
        required:true
    },
    AccountType:{
        type:String,
        required:true
    },
    DateRegistered: {
        type: Date
    },
    ProfilePicture: {
        type: String,
    },
    Status:{
        type: String,
    },
});

const MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const BookSchema = new mongoose.Schema({
    CallNumber: {
        type: String,
    },
    Title: {
        type: String,
    },
    ItemType: {
        type: String,
    },
    AccessLevel:{
        type: String,
    },
    Country:{
        type: String,
    },
    CreationDate:{
        type: String,
    },
    Publisher:{
        type: String,
    },
    Language: {
        type: String,
    },
    CreatorAuthor: {
        type: String,
    },
    Subject:{
        type: String,
    },
    Category:{
        type: String,
    },
    Genre: {
        type: String,
    },
    SeriesNumber:{
        type: String,
    },
    SeriesTitle: {
        type: String,
    },
    Description: {
        type: String,
    },
    IdentifiersType:{
        type: String,
    },
    IdentifiersCode:{
        type: String,
    },
    AgeRestriction:{
        type: String,
    },
    Format:{
        type: String,
    },
    Currency:{
        type: String,
    },
    Price:{
        type: String,
    },
    ItemRFID:{
        type: String,
    },
    EditionNumber:{
        type: String,
    },
    EditionTitle:{
        type: String,
    },
    EditionYear:{
        type: String,
    },
    Pages:{
        type: String,
    },
    CatalogStatus:{
        type: String,
    },
    Addedby:{
        type: String,
    },
    DateCatalog:{
        type: String,
    },
    ItemImage: {
        type: String,
    },

});

const RequestSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCollection',
    },
    BookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IItemCollection',
    },
    Username:{ type:String,},
    IDNumber:{ type:String,},
    Title: { type:String,},
    CreatorAuthor: {type: String,},
    CallNumber: {type: String,},
    DateRequested: {type:Date,},
    RequestStatus: {type:String,},
    Image: {type: String},
});

const RequestModel = mongoose.model("RequestCollection", RequestSchema, "Requests");
const User = mongoose.model("UserCollection", UserSchema, "Members");
const MessageModel = mongoose.model("InquiriesCollection", MessageSchema, "Inquiries");
const Book = mongoose.model("IItemCollection", BookSchema, "Items");

module.exports = {User, MessageModel, Book, RequestModel};