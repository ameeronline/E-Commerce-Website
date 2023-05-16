var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');

/* GET users listing. */

const verifyAdminLogin=(req, res, next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.render('admin/login')
  }
}

router.get('/', function (req, res, next) {
  if(req.session.admin){
    productHelper.getAllProducts().then((products) => {
      res.render('admin/view-products', { title: 'Shopping Cart',  admin:req.session.admin, products })
    })
  }else{
    res.render('admin/login')
  }
    


});

router.get('/login', function(req, res, next) {
  if(req.session.admin){
    res.redirect('admin/view-products', { title: 'Shopping Cart'})
  }else{
  res.render('admin/login',{"loginErr": req.session.adminLoginErr, title: 'Shopping Cart'})
  req.session.adminLoginErr=false;
  }
});

router.post('/adminLogin', function(req, res, next){
  console.log(req.body);
  productHelper.adminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.admin
      req.session.adminLoggedIn=true
      productHelper.getAllProducts().then((products) => {
        res.render('admin/view-products', { title: 'Shopping Cart',  'admin':req.session.admin, products })
      })
    }else{
      req.session.adminLoginErr="Invalid Email ID or Password";
      res.redirect('admin/login')
    }
  })
})

router.get('/logout', function(req, res, next){
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.render('/')
})

router.get('/add-products', verifyAdminLogin,  function (req, res, next) {
  res.render('admin/add-products', { title: 'Shopping Cart', 'admin':req.session.admin})
})

router.post('/add-products', (req, res) => {
  //console.log(req.body)
  //console.log(req.files.Image)

  productHelpers.addProduct(req.body, (id) => {
    console.log(id)
    let image = req.files.Image;
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-products', { title: 'Shopping Cart', admin: true })
      }
      else {
        console.log(err);
      }
    })


  });

})

router.get('/rem-products/:id', function (req, res) {
  let proId = req.params.id
  console.log(proId);
  productHelpers.remProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/rem-products', verifyAdminLogin, function (req, res) {
  res.render('admin/rem-products', { title: 'Shopping Cart', 'admin':req.session.admin })
})
router.post('/rem-products', function (req, res) {
  let proId = req.body.id
  console.log(proId);
  productHelpers.remProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-products/:id', async function (req, res) {
  let product = await productHelpers.getProductDetails(req.params.id)
  //console.log(product);
  res.render('admin/edit-products',{ product, title: 'Shopping Cart', 'admin':req.session.admin })
})
router.post('/edit-product/:id', function (req, res) {
  //console.log(req.body);
  let id=req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then((response) => {
    console.log(response);
    res.redirect('/admin');
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv('./public/product-images/' + id + '.jpg')
    }else{
      res.redirect('/admin');
    }
  })

})

module.exports = router;
