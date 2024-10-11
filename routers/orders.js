const {Order} = require('../models/order');
const {OrderItem}=require('../models/order-item')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
router.get('/', async (req, res) => {
  const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});
  if(!orderList) return res.status(404).json({success: false, message: 'Server Error'})
  res.status(200).json({success: true, data: orderList});
})
// get order by id 
router.get('/:id', async (req, res) => {
  const order= await Order.findById(req.params.id)
  .populate('user','name').populate({path:'orderItems'
    ,populate:{path:'product',populate: 'category'}});
  if(!order) return res.status(404).json({success: false, message: 'Server Error'})
  res.status(200).json({success: true, data: order});
})
// POST route to create an order
router.post('/', async (req, res) => {
  try {
    // Save each orderItem and store their IDs
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();
        if(!newOrderItem) return res.status(404).json({success: false,message: 'Server Error'});
        return newOrderItem._id; // Return the saved orderItem ID
      })
    );
    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        
        return totalPrice;
      })
    );

    // Reduce totalPrices to calculate the total price of all order items
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({ 
      orderItems: orderItemsIds, // Use the array of saved OrderItem IDs
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user 
    });

    order = await order.save(); // Save the order to the database

    if (!order) {
      return res.status(404).json({ success: false, message: 'Server Error' });
    }

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});



router.put('/:id',async (req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: 'Invalid ID'})
  }
  const order = await Order.findByIdAndUpdate(req.params.id,
    {
         status: req.body.status
    },
    {new: true}
  )
  if(!order) return res.status(404).json({success: false, message: 'Order not found'})
  res.status(200).json({success:true, data: order})
})
router.delete('/:id', async(req,res)=>{

  try{const order = await  Order.findByIdAndDelete(req.params.id);
  if(order){
     await Promise.all(order.orderItems.map(async(orderItemId) =>{
       await OrderItem.findByIdAndDelete(orderItemId);
    }));
    return res.status(201).json({
      success: true,
      message: 'The order and its items have been deleted',
    });
  }
  else{
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }}
  catch (err) {
    // Handle errors by returning a 400 response with the error message
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
})

// how much of the sales
router.get('/get/totalSales',async (req,res)=>{
  const totalSales =   await Order.aggregate([
    {$group : {_id: null , totalSales :{$sum :`$totalPrice`}}}
  ])
  if(!totalSales){
    return res.status(400).send('The order sales cannot be generated')
  }
  res.status(200).json({ totalSales: totalSales.pop().totalSales})
} )


// get the count of The Orders

router.get('/get/count', async(req,res)=>{
  try {
    // Count the number of documents in the Product collection
    const orderCount = await Order.countDocuments();
    
    // Send the count in the response
    return res.status(200).json({
      orderCount: orderCount
    });
  } catch (err) {
    // Handle errors properly
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
})

router.get('/get/userorders/:userid', async (req, res) => {
  const userOrderList = await Order.find({user : req.params.userid}).populate({path:'orderItems'
    ,populate:{path:'product',populate: 'category'}}).sort({'dateOrdered':-1});
  if(!userOrderList) return res.status(404).json({success: false, message: 'Server Error'})
  res.status(200).json({success: true, data: userOrderList});
})

module.exports = router;