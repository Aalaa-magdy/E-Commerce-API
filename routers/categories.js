const {Category}= require('../models/category');
const express= require('express');
const router=express.Router();
const mongoose = require('mongoose');
router.get('/',async (req,res) => {
const categoryList=await Category.find();
if(!categoryList) return res.status(500).json({success: false})
  res.send(categoryList)
})

router.get('/:id',async (req,res) => {
  const category = await Category.findById(req.params.id);
  if(!category) return res.status(404).json({success: false, message: 'Category not found'})

  res.status(200).json({success:true , data: category});
})

router.post('/',async (req,res) => {
  let category = new Category(
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color
    }
  )
  category = await category.save();
  if(!category)
    return res.status(404).send("category can't be created")

  res.send(category)
})


router.put('/:id',async (req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: 'Invalid ID'})
  }
  const category = await Category.findByIdAndUpdate(req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color
    },
    {new: true}
  )
  if(!category) return res.status(404).json({success: false, message: 'Category not found'})
  res.status(200).json({success:true, data: category})
})




router.delete('/:id',(req,res)=>{
  Category.findByIdAndDelete(req.params.id).then(category=>{
    if(category){
      return res.status(201).json({
        success:true,
        message: 'The category is deleted'
      })
    }
    else{
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }
  }).catch(err=>{
    return res.status(400)
    .json({success: false ,error:err})
  })
})

module.exports = router ;