const express=require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const alert=require("alert");
const app=express();

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/studyDB", {useNewUrlParser: true});

const studentSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number
});
    
const Student = new mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number
});
    
const Teacher = new mongoose.model("Teacher", teacherSchema);
    
app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/student",(req,res)=>{
    res.render("student");
});

app.get("/teacher",(req,res)=>{
    res.render("teacher");
});

app.post("/stureg", function(req, res){
    const email=req.body.email;
    Student.findOne({email:email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            if(foundUser){
                alert("User already registered");
                res.redirect("/");
            }else{
                bcrypt.hash(req.body.password, 10, function(e, hash) {
                    if(e){
                        console.log(e);
                    }else{    
                        const newStudent =  new Student({
                            email: req.body.email,
                            name:req.body.name,
                            phone:req.body.phone,
                            password: hash
                        });
                        
                        newStudent.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect("/student");
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post("/teareg", function(req, res){
    const email=req.body.email;
    Teacher.findOne({email:email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            if(foundUser){
                alert("User already registered");
                res.redirect("/");
            }else{
                bcrypt.hash(req.body.password, 10, function(e, hash) {
                    if(e){
                        console.log(e);
                    }else{    
                        const newTeacher =  new Teacher({
                            email: req.body.email,
                            name:req.body.name,
                            phone:req.body.phone,
                            password: hash
                        });
                        
                        newTeacher.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect("/teacher");
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post("/stulog", function(req, res){
    const email=req.body.email;
    const password=req.body.password;
          
    Student.findOne({email: email}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.redirect("/student");
                    }else{
                        alert("Invalid username or password!!");      
                        res.redirect("/");
                    }
                });
            }else{
                alert("Invalid username or password!!");
                res.redirect("/");
            }
        }
    });
});

app.post("/tealog", function(req, res){
    const email=req.body.email;
    const password = req.body.password;

    Teacher.findOne({email: email}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.redirect("/teacher");
                    }else{
                        alert("Invalid username or password!!");
                        res.redirect("/");
                    }
                });
            }else{
                alert("Invalid username or password!!");
                res.redirect("/");
            }
        }
    });
});
  
app.listen(3000,()=>{
    console.log("server is up and running");
});