const express=require("express")
const app=express()
const path=require("path")
const hbs=require("hbs")
const collection=require("./mongodb")

const tempelatePath=path.join(__dirname,'../Pages')
app.use(express.static('Pages'));
app.use(express.static('imgs'));
app.use(express.static('csss'));
app.use(express.static('font'));
app.use(express.json())
app.set("view engine", "hbs")
app.set("views", tempelatePath)
app.use(express.urlencoded({extended:false}))

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
    res.render("home")
})

app.get("/FRONT", (req,res)=>{
    res.render("FRONT")
})

app.post("/signup",async (req,res)=>{
const data={
    name:req.body.name,
    username:req.body.username,
    address:req.body.address,
    contact:req.body.contact,
    password:req.body.password
}
await collection.insertMany([data])

res.render("login")

})

app.post("/login",async (req,res)=>{

    try {
        const check=await collection.findOne({username:req.body.username})

    if(check.password===req.body.password){
        res.render("home")
    }
    else{
        res.send("wrong Password")
    }

    }
    catch{
        res.send("wrong details")
    }
    })
    
app.listen(3000,()=>{
    console.log("port connected")
})