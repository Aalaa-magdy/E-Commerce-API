const {User} = require('../models/user');;
const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/',async (req,res)=>{
  const userList = await User.find().select('-passwordHash');
  if(!userList) return res.status(500).json({success: false, message: 'Server Error'})
  res.status(200).json({success: true , data : userList});
})

router.post('/', async (req,res)=>{
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    passwordHash: bcrypt.hashSync(req.body.password,10),
    phone: req.body.phone, 
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country
  })
  user = await user.save()
  if (!user) return res.status(404).send("can't insert user")

    res.status(201).send(user)
})

router.post('/login',async(req,res)=>{
   const user= await User.findOne({email : req.body.email})
   const secret=process.env.secret;
   if(!user) return res.status(404).json({message : 'User not found'})
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash) ){
      const token =jwt.sign({
        userId: user.id,  
        isAdmin: user.isAdmin
      },
      secret,{
        expiresIn :'1d'
      }
    )
      
      res.status(200).send({user : user.email, token : token});
    }

    else res.status(400).send('Password is wrong!')
})



router.delete('/:id',(req,res)=>{
  User.findByIdAndDelete(req.params.id).then(user=>{
    if(user){
      return res.status(201).json({
        success:true,
        message: 'The user is deleted'
      })
    }
    else{
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
  }).catch(err=>{
    return res.status(400)
    .json({success: false ,error:err})
  })
})






router.get('/get/count', async(req,res)=>{
  try {
    // Count the number of documents in the Product collection
    const userCount = await User.countDocuments();
    
    // Send the count in the response
    return res.status(200).json({
      userCount: userCount
    });
  } catch (err) {
    // Handle errors properly
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
})




module.exports = router; 