var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers');
const { response } = require('../app');

const verifyLogin=(req, res, next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  //console.log(user)
  let cartCount=null;
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }

  productHelper.getAllProducts().then((products)=>{
    res.render('user/view-products', {title: 'Shopping Cart', products, user, cartCount})
  })
});

router.get('/login', function(req, res, next) {
  if(req.session.user){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr": req.session.userLoginErr, title: 'Shopping Cart'})
  req.session.userLoginErr=false;
  }
});

router.get('/signup', function(req, res, next) {
  res.render('user/signup', {title: 'Shopping Cart'})
});

router.post('/signup', function(req, res, next) {
  userHelpers.doSignup(req.body).then((response)=>{
    //console.log(response);
    //console.log(req.body);
    req.session.user=response
    req.session.userLoggedIn=true
    res.redirect('/')
  })
});

router.post('/login', function(req, res, next){
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid Email ID or Password";
      res.redirect('/login')
    }
  })
})
router.get('/logout', function(req, res, next){
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async function(req, res, next){
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0
  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/cart', {title: 'Shopping Cart',totalValue, products, 'userId':req.session.user._id, user:req.session.user})
  }
  else{
    res.render('user/empty-cart', {title: 'Shopping Cart', 'userId':req.session.user._id, user:req.session.user})
  }
  
  
  
  //console.log(products)
  
  
})
router.get('/add-to-cart/:id',verifyLogin, function(req, res){
  //console.log(req.params.id)
  //console.log(req.session.user._id)
  console.log("API Call")
  userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>{
    console.log('added to cart')
    res.json({status:true})
  })
  //res.render('user/cart', {title: 'Shopping Cart'})
})

router.post('/change-product-quantity',(req, res, next)=>{
  //console.log(req.body)

  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
     response.total=await userHelpers.getTotalAmount(req.body.user)
      console.log(response)
      res.json(response)
    
    
  })
})

router.post('/remove-cart-product',(req,res,next)=>{
  console.log(req.body)
  userHelpers.removeCartProduct(req.body).then((response)=>{
    //console.log(response)
    res.json(response)
  })
})

router.get('/place-order', verifyLogin,async(req,res,next)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id).then((total)=>{
    res.render('user/place-order', {title:'Shopping Cart',total, user:req.session.user})
  })
})
router.post('/place-order',async(req, res, next)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorPay(orderId, totalPrice).then((response)=>{
        res.json(response)
      })
    }
    
    //console.log(response)
  })
  console.log(req.body)
})
router.get('/order-placed-success',async(req,res,next)=>{
  res.render('user/order-placed-success', {title: 'Shopping Cart',user:req.session.user})
})
router.get('/orders',verifyLogin, async(req,res,next)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  if(orders.length>0){
    res.render('user/orders', {title: 'Shopping Cart',user:req.session.user,orders})
  }else{
    res.render('user/empty-order', {title: 'Shopping Cart',user:req.session.user,orders})
  }
  
})
router.get('/view-order-products/:id', async(req,res,next)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{title: 'Shopping Cart',user:req.session.user, products})
})

router.post('/verify-payment',(req, res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment Successfull')
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err)
    res.json({status:false, errMsg:''})
  })
})

module.exports = router;
