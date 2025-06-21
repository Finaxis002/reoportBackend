// const express = require('express'); 
// require('dotenv').config();
// const mongoose = require('mongoose');
// const connectDB = require('./config/db');
// app.use(express.json())

// const MONGODB_URI = "gh367fnbmn283u2ifuf8i";
// connectDB()

// //schema for user 
// const userSchema = mongoose.Schema({
//   firstName:{
//     type: String,
//     require: true,
//   },
//   lastName:{
//    type: String,
//    require: true,
//   },
//   age:{
//     type: Number,
//   },
//   emailId:{
//     type: String,
//     require: true,
//     unique : true ,
//   }

// })

// const User = userSchema.model('user', userSchema)

// //add user in user collection
// app.post('/api/user', async(req, res)=>{
//   try{
//     const user = new User(req.body)
//     const savdUser = await user.save()
//      res.status(200).json(savdUser);
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
// })


// //get all user
// app.get('/user', async(req, res)=>{
//   try{
//     const data = await User.find({})
// return res.status(200).json(data) ; 
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
// })

// //GET user on emailId
// app.get('/user', async(req,res)=>{
//   //const emailId = req.body(emailId)// GET method do not have body instead use querry pramas
// const emailId = req.query.emailId ;
// const age = req.query.age ;
//   try{
//          const user = User.find({emailId, age})
//          res.send(user)
//   }catch(err){
//    res.status(400).send("something went wrong")
//   }
// })

// app.get('/user/:emailId', async(req,res)=>{
//   const emailId = req.params.emailId ;

//   try{
// const user = await User.find({emailId})
// res.status(204),json(user)
//   }catch(err){
//     res.status(400).send(err);
//   }
// })

// app.patch('/user', async(req,res, )=>{
//   const userId = req.body.userId ;
//   try{
//     const user = await User.findOneAndUpdate(
//       userId, {
//         firstName:'test1',
//         lastName:"test2"
//       },
//       {new : true} //otherwise it will give before update document 

//     )
//     res.send(user)
//   }catch(err){
//       res.status(400).send("something went wrong")
//   }
// })

// app.patch('/user/:id', async(req,res)=>{
//   const userId = req.params({_id : userId})
//   const updates = req.body ;
//   try{  
//      const user =await User.findOneAndUpdate(userId, { $set : updates} , {new : 'true'})
//      res.status(200).json(user)
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
// })

// app.delete('/user', async(req,res)=>{
//   const userId = req.body.userId
//   try{
//     const user =await User.findOneAndDelete(userId)
//     res.status(200)
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
  
// })

// const PORT = 5000 ;
// app.listen(PORT, ()=>{
//   console.log("server connected successfully")
// })