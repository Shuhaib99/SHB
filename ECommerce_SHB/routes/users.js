let express = require('express');
const { resolve, nodeify } = require('promise');
let router = express.Router();
let userHelper = require('../helpers/user-helpers')
let productHelper = require('../helpers/product-helpers');
let scrpt = require('../public/javascripts/script');
const { response } = require('express');
const { restart } = require('nodemon');
const { redirect } = require('express/lib/response');

/* GET users listing. */
let user
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    user = req.session.user
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', function (req, res, next) {
  // res.render('users/place_order',{user_head:true})

  if (req.session.userLoggedIn) {
    user = req.session.user
  }

  productHelper.getAllProducts().then((products) => {

    res.render('users/home', { title: 'shb', user_head: true, user, products });

  })

});
router.get('/home', (req, res) => {
  res.redirect('/')
})

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('users/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
})

router.get('/signup', (req, res) => {

  res.render('users/signup', { emailErr: "" })
})

router.get('/view_product/:id', (req, res) => {
  productHelper.getSingleProduct(req.params.id).then((product) => {
    res.render('users/view_product', { user_head: true, user, product })
  })

})
router.get('/shop', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('users/shop', { user_head: true, user, products })
  })
})


router.get('/add-to-cart/:id', verifyLogin, (req, res, next) => {
  userHelper.getUserCart(req.params.id, req.session.user._id).then((cartItems) => {
    res.json({ status: true })
  }).catch((err) => {
    next(err)
  })
})
router.get('/wishlist',verifyLogin,(req,res,next)=>{
    userHelper.getWishlist(user._id).then((products)=>{     
      res.render('users/wishlist',{user_head:true,user,products})
        }).catch((err)=>{
      next(err)
    })
   
})

router.get('/add_to_wishlist/:id', verifyLogin, (req, res, next) => {
  userHelper.addToWishlist(req.params.id, req.session.user._id).then((wishItem) => {    
    if(wishItem == -1){
        res.json({ status: true })
    }else{
      res.json({ status: false })
    }
        
  }).catch((err) => {
    next(err)
  })
})


router.get('/cart', verifyLogin, async (req, res, next) => {
  // let user = req.session.user
// let cartCount = 0, totalValue = 0
  
  if (user) {
    await productHelper.getCountCart(req.session.user._id).then(async(cartCount) => {
      await userHelper.getCartProducts(req.session.user._id).then(async(products) => {
        if (products.length) {
          await userHelper.getTotalAmount(req.session.user._id).then((totalValue) => {
           res.render('users/cart', { user_head: true, products, user, cartCount, totalValue })
          }).catch((err)=>{
              next(err)
          })
        }
        else res.redirect('/')
      }).catch((err)=>{
        next(err)
    })
    }).catch((err)=>{
      next(err)
  })
  }

  // console.log(products);


})

router.get('/del-cart-item/:id', verifyLogin, (req, res) => {
  userHelper.deleteCartItem(req.session.user._id, req.params.id).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  })
})

router.get('/del-order-item/:id', verifyLogin, (req, res) => {
  userHelper.deleteOrderItem(req.params.id).then(async (response) => {
    res.json({ status: true, total: response.total })
  })
})


router.get('/place_order', verifyLogin, async (req, res) => {
  await userHelper.getTotalAmount(req.session.user._id).then(async(total)=>{
      await userHelper.getAddressFromOrderList(user._id).then((address)=>{
        res.render('users/place_order', { user_head: true, total, user,address })

      }).catch((err)=>{
          next(err)
      })
       
  }).catch((err)=>{
    next(err)
})
})


router.get('/order', verifyLogin, async (req, res,next) => {
  await userHelper.getOrder(req.session.user._id).then((order)=>{
    res.render('users/order', { user_head: true, user, order })
  }).catch((err)=>{
    next(err)
  })
  //console.log(order)
  
})

router.get('/view_order_products/:id', verifyLogin, async (req, res, next) => {
  await userHelper.getrOrderProducts(req.params.id).then((products) => {
    res.render('users/view_order_products', { user_head: true, user, products })
  }).catch((err) => {
    next(err)
  })


})
// ................................post methods.................................................

router.post('/signup', (req, res, next) => {
  userHelper.doSignUp(req.body).then((response) => {
    req.session.userLoggedIn = true
    res.redirect('/')
  }).catch((err) => {
    next(err)
  })
})

router.post('/login', (req, res, next) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = "!!! You entered invalid Username or Password"
      res.redirect('/login')
    }
  }).catch((err) => {
    next(err)
  })

})


// router.post("/email_Verification", async (req, res) => {

//   userHelper.userCheck(req.body).then((response) => {
//     if (response.exist) {
//       response.status=true
//       res.json({status :true})
//     }
//     else{
//       response.status=
//       res.json({status :false})
//     }
//   })
// })


router.post('/register', (req, res, next) => {
  userHelper.userCheck(req.body).then((response) => {
    if (response.exist) {
      res.render('users/signup', {
        emailErr: "!!!..Entered email allready exist...", name: req.body.name, mobile: req.body.mobile
      })
    }
    else {
      userHelper.sendOtp(req.body.mobile).then((response) => {
        req.session.user = req.body
        res.render('users/signup_otp')
      }).catch((err) => {
        next(err)
      })
    }
  }).catch((err) => {
    next(err)
  })
})

router.post('/signUpOtpVerify', (req, res, next) => {
  let response = {}
  userHelper.verifyOtp(req.body, req.session.user.mobile).then((check) => {
    if (check === 'approved') {
      req.session.user.isBlock = false
      userHelper.doSignUp(req.session.user).then((data) => {
        user = req.session.user
        req.session.userLoggedIn = true
        response.status = true
        res.json({ status: true })
      }).catch((err) => {
        next(err)
      })
    } else {
      response.status = false
      res.json({ status: false })
    }


  }).catch((err) => {
    next(err)
  })
})

router.post('/set-quantity', verifyLogin, (req, res, next) => {
  
  userHelper.setProQuantity(req.session.user._id, req.body).then(async (response) => {

    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  }).catch((err) => {
    next(err)
  })

})

router.post('/checkout', async (req, res, next) => {
  let totalPrice = 0, products = 0
  products = await userHelper.getCartProductList(req.body.userId)
  totalPrice = await userHelper.getTotalAmount(req.body.userId)
  //  console.log(req.body,products,totalPrice, "..........................................................");
  userHelper.placeOrder(req.body, products, totalPrice).then((orderID) => {
    if (req.body['payment-method'] === 'COD') {
      // res.json({ codSuccess: true })
      
      res.redirect('/order')
    }
    // else{

    //   userHelper.generateRazorPay(orderID,totalPrice).then((response)=>{

    //     res.json(response)
    //   })

    // }
  }).catch((err) => {
    next(err)
  })
})


router.get('/logout', (req, res) => {
  req.session.destroy()
  user = null
  res.redirect('/')
})



module.exports = router;
