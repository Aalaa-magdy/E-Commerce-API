const express = require('express');
const router = express.Router();

const {Product} = require('../models/product')
const {Category} = require('../models/category')
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP ={
   'image/png' : 'png',
   'image/jpeg' : 'jpeg',
   'image/jpg' : 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error ('invalid image type');
    if(isValid){
      uploadError = null;
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    // Validate the file 
    const fileName= file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null,`${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

// get the products
router.get(`/`, async(req,res)=>{
  let filter={}
  if(req.query.categories)
  {
     filter={category :req.query.categories.split(',')}
  }
  const productList= await Product.find(filter).populate('category');;
  if(!productList)return res.status( 500 ).json({message:err.message});
  res.send(productList);
})



// get product by id
router.get(`/:id`, async(req,res)=>{
  const product= await Product.findById(req.params.id).populate('category');
  if(!product)return res.status(404 ).json({message:"product not found"});
  res.send(product);
})
// add product
router.post(`/`,uploadOptions.single('image') ,async (req,res)=>{
  const category=await Category.findById(req.body.category);
  if(!category)return res.status(400).json({message:"invalid category"});

  const file = req.file;
  if(!file) return res.status(400).json({message:"No image uploaded"});
  const fileName = req.file.filename; 
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
   let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    countInStock: req.body.countInStock,
    category: req.body.category,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured:req.body.isFeatured
     })
    product =  await product.save()
  if (!product) return res.status(404).send("can't create product")
    res.status(201).send(product)
})




// update product

router.put('/:id',async (req,res)=>{

  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: 'Invalid ID'})
  }
  const product = await Product.findByIdAndUpdate(req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      countInStock: req.body.countInStock,
      category: req.body.category,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured:req.body.isFeatured
    },
    {new: true}
  )
  if(!product) return res.status(404).json({success: false, message: 'product not found'})
  res.status(200).json({success:true, data: product})
})




// delete product
router.delete('/:id',(req,res)=>{
  Product.findByIdAndDelete(req.params.id).then(product=>{
    if(product){
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



// get the count of the products

router.get('/get/count', async(req,res)=>{
  try {
    // Count the number of documents in the Product collection
    const productCount = await Product.countDocuments();
    
    // Send the count in the response
    return res.status(200).json({
      productCount: productCount
    });
  } catch (err) {
    // Handle errors properly
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
})


router.get('/get/featured/:count?',async(req,res)=>{
  console.log(req.params.count);
  const count = req.params.count ? req.params.count :0;
  
  const products = await Product.find({isFeatured: true}).limit(+count)
  if(!products){
    res.status(500).json({success: false});
  }
  res.status(200).json(products)
})


router.put('/gallery-images/:id', uploadOptions.array('images',20) ,async (req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: 'Invalid ID'})
  }
  const files = req.files
  let imagePaths = []
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
  if(files){
    files.map(file =>{
        imagePaths.push(`${basePath}${file.fileName}`);
    })
  }
  const  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      images: imagePaths
    },
    {new: true}
  )
  if(!product)
    return res.status(404).send("can't create images")
    res.status(201).send(product)
})



module.exports = router;