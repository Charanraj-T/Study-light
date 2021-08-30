const express=require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const alert=require("alert");
const app=express();

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/studyDB", {useNewUrlParser: true});
 
const classSchema = new mongoose.Schema ({
    name:String,
    code:String,
    teacher: String,
    students:[String]
});

const Class = new mongoose.model("Class", classSchema);

const studentSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number,
    classes:[classSchema]
});
    
const Student = new mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number,
    classes:[classSchema]
});
    
const Teacher = new mongoose.model("Teacher", teacherSchema);
   
app.get("/",(req,res)=>{
    res.render("home");
});

app.post("/home",(req,res)=>{
    Teacher.findOne({email:req.body.email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            res.render("teacher",{
                name:foundUser.name,
                email:foundUser.email,
                classes:foundUser.classes
            });
        }
    });
});

app.post("/shome",(req,res)=>{
    Student.findOne({email:req.body.email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            res.render("student",{
                name:foundUser.name,
                email:foundUser.email,
                classes:foundUser.classes
            });
        }
    });
});

app.post("/class",(req,res)=>{
    Class.findOne({code:req.body.code},(e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            res.render("class",{
                code:foundClass.code,
                name:foundClass.teacher,
                email:req.body.email,
                classname:foundClass.name
            });
        }
    });
});

app.post("/sclass",(req,res)=>{
    Class.findOne({code:req.body.code},(e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            res.render("sclass",{
                name:foundClass.teacher,
                email:req.body.email,
                classname:foundClass.name
            });
        }
    });
});

app.post("/createclass",(req,res)=>{
    Class.count({}, function( err, count){
        if(err){
            console.log(err);
        }else{
            Teacher.findOne({email:req.body.email},(e,foundUser)=>{
                if(e){
                    console.log(e);
                }else{
                    if(foundUser.classes.some(e => e.name == req.body.classname)){
                        alert("classroom exists already");
                        res.render("teacher",{
                            name:req.body.name,
                            email: req.body.email,
                            classes:foundUser.classes
                        });
                    }else{
                        const newClass =  new Class({
                            teacher:req.body.name,
                            name:req.body.classname,
                            code:"sl"+String(count+1).padStart(4,'0')
                        });
                        foundUser.classes.push(newClass);
                        foundUser.save();
                        newClass.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("class",{
                                    code:"sl"+String(count+1).padStart(4,'0'),
                                    name:req.body.name,
                                    classname:req.body.classname,
                                    email:foundUser.email
                                });
                            }
                        }); 
                    }
                }
            });
        } 
    });
});

app.post("/joinclass",(req,res)=>{
    Class.findOne({code:req.body.code},(e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email},(e,foundUser)=>{
                if(e){
                    console.log(e);
                }else{
                    if(foundUser.classes.some(e => e.code == req.body.code)){
                        res.render("sclass",{
                            email:foundUser.email,
                            classname:foundClass.name,
                            name:foundClass.teacher
                        });
                    }else{
                        foundUser.classes.push(foundClass);
                        foundUser.save();
                        foundClass.students.push(foundUser._id);
                        foundClass.save();
                        res.render("sclass",{
                            email:foundUser.email,
                            classname:foundClass.name,
                            name:foundClass.teacher
                        });
                    }
                }
            });
        }
    });
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
                                res.render("student",{
                                    name:req.body.name,
                                    email: req.body.email,
                                    classes:[]
                                });
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
                                res.render("teacher",{
                                    name:req.body.name,
                                    email: req.body.email,
                                    classes:[]
                                });
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
                        res.render("student",{
                            name:foundUser.name,
                            email:foundUser.email,
                            classes:foundUser.classes
                        });
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
                        res.render("teacher",{
                            name:foundUser.name,
                            email:foundUser.email,
                            classes:foundUser.classes
                        });
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