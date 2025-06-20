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
//     const data = await req.body ;
//     const newUser= User.create(data)
//      res.status(200).json(newUser);
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
// })

// //get all user
// app.get('/user', async(req, res)=>{
//   try{
//     const data = User.Find({})
// return res.status(200).send(data) ; 
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
// })

// //GET user on emailId
// app.get('/user', async(req,res)=>{
//   const emailId = req.body(emailId)
//   try{
//          const user = User.Find({emailId})
//          res.send(user)
//   }catch(err){
//    res.status(400).send("something went wrong")
//   }
// })


// app.patch('/user', (req,res)=>{
//   const userId = req.body(userId)
//   try{
//     const user = User.findOneAndUpdate(
//       userId, {
//         firstName:'test1',
//         lastName:"test2"
//       }
//     )
//     res.send(user)
//   }catch(err){
//       res.status(400).send("something went wrong")
//   }
// })

// app.delete('/user', async(req,res)=>{
//   const userId = req.body(userId)
//   try{
//     const user = User.findOneAndDelete(userId)
//     res.status(200)
//   }catch(err){
//     res.status(400).send("something went wrong")
//   }
  
// })

// const PORT = 5000 ;
// app.listen(PORT, ()=>{
//   console.log("server connected successfully")
// })