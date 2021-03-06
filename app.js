require('dotenv').config();
const express=require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require("path");
const app=express();

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASS+"@cluster0.hzq90.mongodb.net/studyDB", {useNewUrlParser: true});

let gfs;
mongoose.connection.once('open',()=>{
  gfs= new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
    bucketName:'fs'
  });
});

const storage = new GridFsStorage({
    url: "mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASS+"@cluster0.hzq90.mongodb.net/studyDB",
    file: (req, file) => {
      return {
        filename: Date.now()+"-"+file.originalname
      };
    }
});

const upload = multer({storage});  

const postSchema = new mongoose.Schema ({
    author:String,
    title:String,
    description:String,
    posttime:String,
    files:[String]
});

const Post =new mongoose.model("Post",postSchema);

const testSchema = new mongoose.Schema ({
    title:String,
    description:String,
    duetime:String,
    maxmarks:Number,
    status:String,
    marks:[{
        name:String,
        id:String,
        mark:Number,
        files:[],
        isSub:Boolean
    }],
    files:[String]
});

const Test =new mongoose.model("Test",testSchema);

const assignmentSchema = new mongoose.Schema ({
    title:String,
    description:String,
    duetime:String,
    maxmarks:Number,
    status:String,
    marks:[{
        name:String,
        id:String,
        mark:Number,
        files:[],
        isSub:Boolean
    }],
    files:[String]
});

const Assignment =new mongoose.model("Assignment",assignmentSchema);

const classSchema = new mongoose.Schema ({
    name:String,
    code:String,
    teacher: String,
    students:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    posts:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    tests:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    assignments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }]
});

const Class = new mongoose.model("Class", classSchema);

const studentSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number,
    classes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    periods:[[String]]
});
    
const Student = new mongoose.model("Student", studentSchema);

const teacherSchema = new mongoose.Schema ({
    name:String,
    email: String,
    password: String,
    phone:Number,
    classes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    periods:[[String]]
});
    
const Teacher = new mongoose.model("Teacher", teacherSchema);
   
function checkdue(){
    Test.find({},(e,foundtests)=>{
        if(e){
            console.log(e);
        }else{
            foundtests.forEach(test=>{
                if(new Date(test.duetime)<new Date()){
                    test.status="ended";
                    test.save();
                }
            });
        } 
    });
    Assignment.find({},(e,foundassignment)=>{
        if(e){
            console.log(e);
        }else{
            foundassignment.forEach(a=>{
                if(new Date(a.duetime)<new Date()){
                    a.status="ended";
                    a.save();
                }
            });
        } 
    });
}

                    // homepage

app.get("/",(req,res)=>{
    res.render("home",{
        regerror:"",
        logerror:""
    });
});

app.get('/:filename', (req, res) => {
    const file = gfs
      .find({
        filename: req.params.filename,
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: 'no files exist',
          });
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

                    //enrollment

app.post("/stureg", function(req, res){
    const email=req.body.email.toLowerCase();
    Student.findOne({email:email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            if(foundUser){
                res.render("home",{
                    regerror:"User already registered!!",
                    logerror:""
                });
            }else{
                bcrypt.hash(req.body.password, 10, function(e, hash) {
                    if(e){
                        console.log(e);
                    }else{    
                        const newStudent =  new Student({
                            email: req.body.email.toLowerCase(),
                            name:req.body.name,
                            phone:req.body.phone,
                            password: hash,
                            periods:[
                                ["Monday","N/A","N/A","N/A","N/A","N/A"],
                                ["Tuesday","N/A","N/A","N/A","N/A","N/A"],
                                ["wednesday","N/A","N/A","N/A","N/A","N/A"],
                                ["Thursday","N/A","N/A","N/A","N/A","N/A"],
                                ["Friday","N/A","N/A","N/A","N/A","N/A"]
                            ]
                        });
                        
                        newStudent.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("student",{
                                    name:req.body.name,
                                    email: req.body.email.toLowerCase(),
                                    classes:[],
                                    error:""
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
    const email=req.body.email.toLowerCase();
    Teacher.findOne({email:email},(e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            if(foundUser){
                res.render("home",{
                    regerror:"User already registered!!",
                    logerror:""
                });
            }else{
                bcrypt.hash(req.body.password, 10, function(e, hash) {
                    if(e){
                        console.log(e);
                    }else{    
                        const newTeacher =  new Teacher({
                            email: req.body.email.toLowerCase(),
                            name:req.body.name,
                            phone:req.body.phone,
                            password: hash,
                            periods:[
                                ["Monday","N/A","N/A","N/A","N/A","N/A"],
                                ["Tuesday","N/A","N/A","N/A","N/A","N/A"],
                                ["wednesday","N/A","N/A","N/A","N/A","N/A"],
                                ["Thursday","N/A","N/A","N/A","N/A","N/A"],
                                ["Friday","N/A","N/A","N/A","N/A","N/A"]
                            ]
                        });
                        
                        newTeacher.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("teacher",{
                                    name:req.body.name,
                                    email: req.body.email.toLowerCase(),
                                    classes:[],
                                    error:""
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
    const email=req.body.email.toLowerCase();
    const password=req.body.password;
            
    Student.findOne({email:email}).populate('classes').exec((e,foundUser)=>{
        if (e) {
            console.log(e);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.render("student",{
                            name:foundUser.name,
                            email:foundUser.email,
                            classes:foundUser.classes,
                            error:""
                        });
                    }else{
                        res.render("home",{
                            regerror:"",
                            logerror:"Invalid username or password!!"
                        });
                    }
                });
            }else{
                res.render("home",{
                    regerror:"",
                    logerror:"Invalid username or password!!"
                });
            }
        }
    });
});

app.post("/tealog", function(req, res){
    const email=req.body.email.toLowerCase();
    const password = req.body.password;

    Teacher.findOne({email:req.body.email}).populate('classes').exec((e,foundUser)=>{
        if (e) {
            console.log(e);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.render("teacher",{
                            name:foundUser.name,
                            email:foundUser.email,
                            classes:foundUser.classes,
                            error:""
                        });
                    }else{
                        res.render("home",{
                            regerror:"",
                            logerror:"Invalid username or password!!"
                        });
                    }
                });
            }else{
                res.render("home",{
                    regerror:"",
                    logerror:"Invalid username or password!!"
                });
            }
        }
    });
});

                    // class and userhomepages

app.post("/home",(req,res)=>{
    Teacher.findOne({email:req.body.email}).populate('classes').exec((e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            res.render("teacher",{
                name:foundUser.name,
                email:foundUser.email,
                classes:foundUser.classes,
                error:""
            });
        }
    });
});

app.post("/shome",(req,res)=>{
    Student.findOne({email:req.body.email}).populate('classes').exec((e,foundUser)=>{
        if(e){
            console.log(e);
        }else{
            res.render("student",{
                name:foundUser.name,
                email:foundUser.email,
                classes:foundUser.classes,
                error:""
            });
        }
    });
});

app.post("/class",(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            checkdue();
            res.render("class",{
                code:foundClass.code,
                name:foundClass.teacher,
                email:req.body.email,
                classname:foundClass.name,
                students:foundClass.students,
                posts:foundClass.posts,
                tests:foundClass.tests,
                assign:foundClass.assignments
            });
        }
    });
});

app.post("/sclass",(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            res.render("sclass",{
                name:foundClass.teacher,
                email:req.body.email,
                classname:foundClass.name,
                students:foundClass.students,
                code:foundClass.code,
                posts:foundClass.posts,
                tests:foundClass.tests,
                assign:foundClass.assignments
            });
        }
    });
});
                    
                    // class create and join

app.post("/createclass",(req,res)=>{
    Class.count({}, function( err, count){
        if(err){
            console.log(err);
        }else{
            Teacher.findOne({email:req.body.email}).populate('classes').exec((e,foundUser)=>{
                if(e){
                    console.log(e);
                }else{
                    if(foundUser.classes.some(e => e.name == req.body.classname)){
                        res.render("teacher",{
                            name:req.body.name,
                            email: req.body.email,
                            classes:foundUser.classes,
                            error:"Classroom exists already!!"
                        });
                    }else{
                        const newClass =  new Class({
                            teacher:req.body.name,
                            name:req.body.classname,
                            code:"SL"+String(count+1).padStart(4,'0')
                        });
                        foundUser.classes.push(newClass);
                        foundUser.save();
                        newClass.save(function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                checkdue();
                                res.render("class",{
                                    code:"SL"+String(count+1).padStart(4,'0'),
                                    name:req.body.name,
                                    classname:req.body.classname,
                                    email:foundUser.email,
                                    students:[],
                                    posts:[],
                                    tests:[],
                                    assign:[]
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
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email}).populate('classes').exec((e,foundUser)=>{
                if(foundClass){
                    if(e){
                        console.log(e);
                    }else{
                        if(foundUser.classes.some(e => e.code == req.body.code)){
                            res.render("sclass",{
                                name:foundClass.teacher,
                                email:req.body.email,
                                classname:foundClass.name,
                                students:foundClass.students,
                                code:foundClass.code,
                                posts:foundClass.posts,
                                tests:foundClass.tests,
                                assign:foundClass.assignments
                            });
                        }else{
                            foundUser.classes.push(foundClass);
                            foundUser.save();
                            foundClass.students.push(foundUser);
                            foundClass.save();
                            let tests=foundClass.tests.map((i)=>{return i._id;});
                            Test.find().where('_id').in(tests).exec((err, records) => {
                                records.forEach(test=>{
                                    let d={
                                        name:foundUser.name,
                                        mark:0,
                                        id:foundUser._id,
                                        isSub:false
                                    };
                                    test.marks.push(d);
                                    test.save();
                                });
                            });
                            let assignments=foundClass.assignments.map((i)=>{return i._id;}); 
                            Assignment.find().where('_id').in(assignments).exec((err, records) => {
                                records.forEach(a=>{
                                    let d={
                                        name:foundUser.name,
                                        mark:0,
                                        id:foundUser._id,
                                        isSub:false
                                    };
                                    a.marks.push(d);
                                    a.save();
                                });
                            });
                            res.render("sclass",{
                                name:foundClass.teacher,
                                email:req.body.email,
                                classname:foundClass.name,
                                students:foundClass.students,
                                code:foundClass.code,
                                posts:foundClass.posts,
                                tests:foundClass.tests,
                                assign:foundClass.assignments
                            });
                        }
                    }
                }else{
                    res.render("student",{
                        name:foundUser.name,
                        email:foundUser.email,
                        classes:foundUser.classes,
                        error:"Class not found!!"
                    });
                }
            });
        }
    });
});

                    // post feature

app.post("/cpost",upload.array('files'),(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            const newPost =  new Post({
                author:req.body.author,
                title:req.body.title,
                description:req.body.desc,
                posttime: new Date().toString().slice(4,24)
            });
            if(req.files){
                newPost.files=req.files.map(a=>a.filename);
            }
            newPost.save((e)=>{
                if(e){
                    console.log(e);
                }else{
                    foundClass.posts.push(newPost);
                    foundClass.save((e)=>{
                        checkdue();
                        res.render("class",{
                            code:foundClass.code,
                            name:foundClass.teacher,
                            email:req.body.email,
                            classname:foundClass.name,
                            students:foundClass.students,
                            posts:foundClass.posts,
                            tests:foundClass.tests,
                            assign:foundClass.assignments
                        });
                    });
                }
            });
        }
    });
});

app.post("/scpost",upload.array('files'),(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email}).populate("classes").exec((e,foundUser)=>{
                if(e){
                    console.log(e);
                }else{
                    const newPost =  new Post({
                        author:foundUser.name,
                        title:req.body.title,
                        description:req.body.desc,
                        posttime: new Date().toString().slice(4,24)
                    });
                    if(req.files){
                        newPost.files=req.files.map(a=>a.filename);
                    }
                    newPost.save((e)=>{
                        if(e){
                            console.log(e);
                        }else{
                            foundClass.posts.push(newPost);
                            foundClass.save((e)=>{
                                res.render("sclass",{
                                    code:foundClass.code,
                                    name:foundClass.teacher,
                                    email:req.body.email,
                                    classname:foundClass.name,
                                    students:foundClass.students,
                                    posts:foundClass.posts,
                                    tests:foundClass.tests,
                                    assign:foundClass.assignments
                                });
                            });
                        }
                    });
                }
            });
        }
    });
});
                    
                    // test feature

app.post("/test",upload.array('files'),(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            const newtest =  new Test({
                title:req.body.title,
                description:req.body.desc,
                duetime: new Date(req.body.due).toLocaleDateString()+" "+new Date(req.body.due).toLocaleTimeString(),   
                maxmarks:req.body.mmark,
                status:"live"
            });
            foundClass.students.forEach(record=>{
                let d={
                    name:record.name,
                    mark:0,
                    id:record._id,
                    isSub:false
                };
                newtest.marks.push(d);
            });
            if(req.files){
                newtest.files=req.files.map(a=>a.filename);
            }
            newtest.save((e)=>{
                if(e){
                    console.log(e);
                }else{
                    foundClass.tests.push(newtest);
                    foundClass.save((e)=>{
                        checkdue();
                        res.render("class",{
                            code:foundClass.code,
                            name:foundClass.teacher,
                            email:req.body.email,
                            classname:foundClass.name,
                            students:foundClass.students,
                            posts:foundClass.posts,
                            tests:foundClass.tests,
                            assign:foundClass.assignments
                        });
                    });
                }
            });   
        }
    });
});

app.post("/testpage",(req,res)=>{
    Test.findOne({_id:req.body._id},function(e,foundTest){
        if(e){
            console.log(e);
        }else{
            res.render("test",{
                code:req.body.code,
                email:req.body.email,
                test:foundTest
            });
        }
    });
});

app.post("/stestpage",(req,res)=>{
    Test.findOne({_id:req.body._id},function(e,foundTest){
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email},function(e,foundStudent){
                var mark=(foundTest.marks.filter(m=>m.id==foundStudent._id))[0];
                var score=mark.mark==0?"pending":mark.mark;
                res.render("stest",{
                    code:req.body.code,
                    email:req.body.email,
                    duetime:foundTest.duetime,
                    maxmarks:foundTest.maxmarks,
                    title:foundTest.title,
                    description:foundTest.description,
                    status:foundTest.status,
                    files:foundTest.files,
                    submitted:mark.isSub,
                    score:score,
                    _id:foundTest._id
                });
            });
        }
    });
});

app.post("/testansupdate",upload.array('files'),(req,res)=>{
    Test.findOne({_id:req.body._id},function(e,foundTest){
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email},function(e,foundStudent){
                for(let i=0;i<foundTest.marks.length;i++){
                    if(foundTest.marks[i].id=foundStudent._id)
                    {
                        foundTest.marks[i].files=req.files.map(a=>a.filename);
                        foundTest.marks[i].isSub=true;
                    }
                }
                foundTest.save((e)=>{
                    if(e){
                        console.log(e);
                    }else{
                        res.render("stest",{
                            code:req.body.code,
                            email:req.body.email,
                            duetime:foundTest.duetime,
                            maxmarks:foundTest.maxmarks,
                            title:foundTest.title,
                            description:foundTest.description,
                            status:foundTest.status,
                            files:foundTest.files,
                            submitted:true,
                            score:"pending",
                            _id:foundTest._id
                        });
                    }
                });
            });
        }
    });     
});

app.post("/endtest",(req,res)=>{
    Test.findOneAndUpdate({_id:req.body._id}, {$set:{status:"ended"}},{new: true},(e, foundTest)=>{
        if(e){
            console.log(e);
        }else{
            res.render("test",{
                code:req.body.code,
                email:req.body.email,
                test:foundTest
            });
        }
    });
});

app.post("/markupdate",(req,res)=>{
    Test.findOne({_id:req.body._id},function(e,foundTest){
        if(e){
            console.log(e);
        }else{
            for(i=0;i<foundTest.marks.length;i++)
            foundTest.marks[i].mark=req.body[i];
            foundTest.save((e)=>{
                res.render("test",{
                    code:req.body.code,
                    email:req.body.email,
                    test:foundTest
                });
            });
        }
    });
});

                    // assignment feature

app.post("/assign",upload.array('files'),(req,res)=>{
    Class.findOne({code:req.body.code})
    .populate('posts').populate('tests').populate('assignments').populate('students').
    exec((e,foundClass)=>{
        if(e){
            console.log(e);
        }else{
            const newassignment =  new Assignment({
                title:req.body.title,
                description:req.body.desc,
                duetime: new Date(req.body.due).toLocaleDateString()+" "+new Date(req.body.due).toLocaleTimeString(),   
                maxmarks:req.body.mmark,
                status:"live"
            });
            foundClass.students.forEach(record=>{
                let d={
                    name:record.name,
                    mark:0,
                    id:record._id,
                    isSub:false
                };
                newassignment.marks.push(d);
            });
            if(req.files){
                newassignment.files=req.files.map(a=>a.filename);
            }
            newassignment.save((e)=>{
                if(e){
                    console.log(e);
                }else{
                    foundClass.assignments.push(newassignment);
                    foundClass.save((e)=>{
                        checkdue();
                        res.render("class",{
                            code:foundClass.code,
                            name:foundClass.teacher,
                            email:req.body.email,
                            classname:foundClass.name,
                            students:foundClass.students,
                            posts:foundClass.posts,
                            tests:foundClass.tests,
                            assign:foundClass.assignments
                        });
                    });
                }
            });
        }
    });
});

app.post("/assignpage",(req,res)=>{
    Assignment.findOne({_id:req.body._id},function(e,founda){
        if(e){
            console.log(e);
        }else{
            res.render("assign",{
                code:req.body.code,
                email:req.body.email,
                assign:founda
            });
        }
    });
});

app.post("/sassignpage",(req,res)=>{
    Assignment.findOne({_id:req.body._id},function(e,founda){
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email},function(e,foundStudent){
                var mark=(founda.marks.filter(m=>m.id==foundStudent._id))[0];
                var score=mark.mark==0?"pending":mark.mark;
                res.render("sassign",{
                    code:req.body.code,
                    email:req.body.email,
                    duetime:founda.duetime,
                    maxmarks:founda.maxmarks,
                    title:founda.title,
                    description:founda.description,
                    status:founda.status,
                    files:founda.files,
                    submitted:mark.isSub,
                    score:score,
                    _id:founda._id
                });
            });
        }
    });
});

app.post("/assignansupdate",upload.array('files'),(req,res)=>{
    Assignment.findOne({_id:req.body._id},function(e,founda){
        if(e){
            console.log(e);
        }else{
            Student.findOne({email:req.body.email},function(e,foundStudent){
                for(let i=0;i<founda.marks.length;i++){
                    if(founda.marks[i].id=foundStudent._id)
                    {
                        founda.marks[i].files=req.files.map(a=>a.filename);
                        founda.marks[i].isSub=true;
                    }
                }
                founda.save((e)=>{
                    if(e){
                        console.log(e);
                    }else{
                        res.render("sassign",{
                            code:req.body.code,
                            email:req.body.email,
                            duetime:founda.duetime,
                            maxmarks:founda.maxmarks,
                            title:founda.title,
                            description:founda.description,
                            status:founda.status,
                            files:founda.files,
                            submitted:true,
                            score:"pending",
                            _id:founda._id
                        });
                    }
                });
            });
        }
    });     
});

app.post("/endassign",(req,res)=>{
    Assignment.findOneAndUpdate({_id:req.body._id}, {$set:{status:"ended"}},{new: true},(e, founda)=>{
        if(e){
            console.log(e);
        }else{
            res.render("assign",{
                code:req.body.code,
                email:req.body.email,
                assign:founda
            });
        }
    });
});

app.post("/assignmarkupdate",(req,res)=>{
    Assignment.findOne({_id:req.body._id},function(e,founda){
        if(e){
            console.log(e);
        }else{
            for(i=0;i<founda.marks.length;i++)
            founda.marks[i].mark=req.body[i];
            founda.save((e)=>{
                res.render("assign",{
                    code:req.body.code,
                    email:req.body.email,
                    assign:founda
                });
            });
        }
    });
});

                    // timetable feature

app.post("/timetable",(req,res)=>{
    const ptype=req.body.type;
    if(ptype=="student"){
        Student.findOne({email:req.body.email},function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                res.render("table",{
                    email:req.body.email,
                    type:ptype,
                    periods:foundUser.periods
                });
            }
        });
    }else{
        Teacher.findOne({email:req.body.email},function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                res.render("table",{
                    email:req.body.email,
                    type:ptype,
                    periods:foundUser.periods
                });
            }
        });
    }
});

app.post("/tableupdate",(req,res)=>{
    const ptype=req.body.type;
    var periods=[["Monday"],["Tuesday"],["Wednesday"],["Thursday"],["Friday"]]
    for(var i=0,k=0;i<5;i++){
        for(var j=0;j<5;j++,k++){
            periods[i].push(req.body[k]);
        }  
    }
    if(ptype=="student"){
        Student.findOne({email:req.body.email},function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                foundUser.periods=periods;
                foundUser.save();
                res.render("table",{
                    email:req.body.email,
                    type:ptype,
                    periods:foundUser.periods
                });
            }
        });
    }else{
        Teacher.findOne({email:req.body.email},function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                foundUser.periods=periods;
                foundUser.save();
                res.render("table",{
                    email:req.body.email,
                    type:ptype,
                    periods:foundUser.periods
                });
            }
        });
    }
});

app.post("/tablehome",(req,res)=>{
    const ptype=req.body.type;
    if(ptype=="student"){
        Student.findOne({email:req.body.email}).populate('classes').exec(function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                res.render("student",{
                    name:foundUser.name,
                    email:foundUser.email,
                    classes:foundUser.classes,
                    error:""
                });        
            }
        });
    }else{
        Teacher.findOne({email:req.body.email}).populate('classes').exec(function(e,foundUser){
            if(e){
                console.log(e);
            }else{
                res.render("teacher",{
                    name:foundUser.name,
                    email:foundUser.email,
                    classes:foundUser.classes,
                    error:""
                });        
            }
        });
    }
});

                    //server start

app.listen(process.env.PORT || 3000,()=>{
    console.log("server is up and running");
});