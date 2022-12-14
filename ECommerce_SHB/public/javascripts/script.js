// function sendData(){
//     let searchResults=document.getElementById('sect')
//     let category=document.getElementById('categoryID').value
//     fetch('search_product',{
//         method:'post',
//         headers:{'Content-Type':'application/json'},
//         body:JSON.stringify({payload:category})
//     }).then(res => res.json()).then(data =>{
//         let payload=data.payload
//         alert(payload,"scripttttttttttttttttt");
//         // payload.forEach(element => {
//         //     searchResults.value+=`<p>${element}</p>`
//         // });
//     })
// }


async function isBlock() {
    await swal("Your account blocked.", "Cnontact customer service", { icon: "danger" })
}

async function otpVerify() {
    if (document.getElementById('otpID').value == "") {
        swal("Please fill the column and move","", "warning")
    } else {
        this.document.getElementById('wrong').innerHTML = "Please Wait..."
        let otp = document.getElementById('otpID').value

        await axios.post('/signUpOtpVerify', { otp: otp })
            .then((e) => {
                if (e.data.status) {
                    location.href = '/'
                } else {
                    document.getElementById('wrong').innerHTML = "!!! You Entered Wrong OTP"
                }
            })
    }
}
async function editPassword(userID) {
    password = document.getElementById('password').value
    newpassword = document.getElementById('newpassword').value
    if (password != "" && newpassword != "") {
        await axios.post('/edit_password/' + userID, {
            password: password,
            newpassword: newpassword
        }).then((e) => {
            swal("ok")
            if (e.data.status) {
                swal({
                    title: "Password changed successfully...",
                    text: "Please login again with your new password.",
                    icon: "success",
                    button: true,
                    dangerMode: false,
                })
                    .then(async (willDelete) => {
                        if (willDelete) {
                            location.href = '/login'
                        }
                    })
            }
            else {
                swal("Does not match password as you entered", "", { icon: "warning" });
            }
        })
    }
    else {
        swal("Hello!", "Fill the columns and try again....", { icon: "warning" });
    }
}

async function getSub() {
    let catID = document.getElementById("cat").value,
        select = document.getElementById("subcat")
    select.innerHTML = ""
    await axios.get('/admin/get_subcategory_onchange/' + catID).then((e) => {
        if (e.data.status) {
            let sub_length = e.data.category.subcategory.length
            for (i = 0; i < sub_length; i++) {
                let option = document.createElement("OPTION"),
                    txt = document.createTextNode(e.data.category.subcategory[i].subname)
                option.appendChild(txt)
                option.setAttribute("value", e.data.category.subcategory[i].sub_id)
                select.insertBefore(option, select.lastChild)
                // document.getElementById("subcat")[i].value=e.data.category.subcategory[i].sub_id
                // document.getElementById("subcat")[i].innerHTML=e.data.category.subcategory[i].subname
            }

        }
    })

    // alert()
    // document.getElementById("subcat")[0].innerHTML= document.getElementById("cat").value
}


async function addToCart(proID) {

    await axios.get('/add-to-cart/' + proID).then((e) => {

        if (e.data.status) {
            swal("Item Added to your cart", "", "success");
            if (isNaN(document.getElementById('cart-count').innerHTML)) { document.getElementById('cart-count').innerHTML = 0 }
            let count = document.getElementById('cart-count').innerHTML
            count = parseInt(count) + 1
            // document.getElementById('cart-count').value=1;
            document.getElementById('cart-count').innerHTML = count
            // alert(document.getElementById('cart-count').innerHTML)
        }

        else if (e.data.cartItems.no_stock) {
            swal("Sorry", "Stock not available", "warning");
        }
        else if (e.data.cartItems.prod_exist_in_cart) {
            swal("Product exist in cart", "", "success");
        } else {
            swal("Please login")
        }

    })
}

async function addToWishlist(proID) {
    await axios.get('/add_to_wishlist/' + proID).then((e) => {
        if (e.data.status) {
            swal("Item Added to your wishlist", "", "success");
        } else if (e.data.user) {
            {
                swal("Item Exist", "", {
                    icon: "warning",
                });
                //location.href('/login')  
            }
        } else {
            location.href = '/login'
        }
    })
}
async function delWishlistItem(wishID) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then(async (willDelete) => {
            if (willDelete) {
                await axios.get('/del-wish-item/' + wishID).then((e) => {
                    if (e.data.status) {

                        swal("Item deleted", "", "success");
                        location.href = '/wishlist'
                    }
                })
            } else {
                swal("Your imaginary file is safe!");
            }
        })
}

async function checkQtyForSingleProduct(proID) {
    await axios.get('/chck_qty_single_prod/' + proID).then((e) => {
        if (e.data.status) {
            swal("Sorry", "Stock not available for this count", "warning");
        } else {
            location.href = '/view_product/' + proID
        }
    })
}

async function changeQty(cartID, proID, count, obj) {

    let quantity = parseInt(document.getElementById(proID).innerHTML)
    count = parseInt(count)

    // alert(count)

    // if(quantity == 1 && count == -1){
    //     swal({
    //         title: "Do you want to remove?",
    //         icon: "warning",
    //         buttons: true,
    //         dangerMode: true,
    //       })
    //       .then(async(willDelete) => {
    //         if (willDelete) {

    //         }
    //     })
    // }
    await axios.post('/set-quantity', {
        cartID: cartID,
        proID: proID,
        count: count,
        quantity: quantity
    }).then((e) => {
        if (e.data.no_stock) {
            swal("Sorry", "Stock not available for this count", "warning");
        }
        else if (e.data.response.removeProduct) {
            let count = document.getElementById('cart-count').innerHTML

            document.getElementById('total-price').innerHTML = e.data.total
            document.getElementById('sub-total').innerHTML = e.data.total
            document.getElementById(proID).innerHTML = quantity + count
            document.getElementById('couponID').value = "0.00"
            document.getElementById('discount').innerHTML = "0.00"

            count = parseInt(count) - 1
            document.getElementById('cart-count').innerHTML = count

            swal("item deleted", "", "success");
            $(obj).closest('tr').remove()

            //location.reload()

        }
        else if (e.data.status) {
            swal("Quantity updated", "", "success");
            document.getElementById('total-price').innerHTML = e.data.total
            document.getElementById('sub-total').innerHTML = e.data.total
            document.getElementById(proID).innerHTML = quantity + count
            document.getElementById('couponID').value = ""
        }

        document.getElementById('discount').innerHTML = ""
    })

}


async function delCartItem(prodID, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    })
        .then(async (willDelete) => {
            if (willDelete) {
                await axios.get('/del-cart-item/' + prodID).then((e) => {
                    if (e.data.status) {

                        swal("Item deleted", "", "success");
                        document.getElementById('total-price').innerHTML = e.data.total
                        document.getElementById('sub-total').innerHTML = e.data.total
                        document.getElementById('couponID').value = ""
                        document.getElementById('discount').innerHTML = ""

                        let count = document.getElementById('cart-count').innerHTML
                        count = parseInt(count) - 1
                        document.getElementById('cart-count').innerHTML = count
                        $(obj).closest('tr').remove()
                    }
                })
            } else {
                swal("Your imaginary file is safe!");
            }
        })
}

function delShippAddress(addressID, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/del-ship-address/' + addressID).then((e) => {
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })
        } else {
            swal("Your imaginary file is safe!");
        }
    })

}

async function statusShipped(orderID, obj) {
    await axios.get('/admin/status_Shipped/' + orderID).then((e) => {
        if (e.data.status) {
            swal({
                title: "Are you sure?",
                icon: "warning",
                buttons: true,
                dangerMode: true
            }).then(async (willDelete) => {
                if (willDelete) {
                    swal("Item shipped", "", "success");
                    location.href = '/admin/view_orders'
                }
            })
            // document.getElementById('status').innerHTML="Shipped"
            // $(obj).getElementById('status').innerHTML="Shipped"
        }
    })
}

async function statusDelivered(orderID, obj) {
    await axios.get('/admin/status_Delivered/' + orderID).then((e) => {
        if (e.data.status) {
            swal({
                title: "Are you sure?",
                icon: "warning",
                buttons: true,
                dangerMode: true
            }).then(async (willDelete) => {
                if (willDelete) {
                    swal("Item Delivered", "", "success");
                    location.href = '/admin/view_orders'
                }
            })
            // document.getElementById('status').innerHTML="Delivered"
            // $(obj).getElementById('status').innerHTML="Delivered"

        }
    })
}
async function getEditBanner(bannerID) {
    await axios.get('/admin/get_edit_banner/' + bannerID).then((e) => {
        if (e.data.status) {
            document.getElementById('editbannername').value = e.data.banner.bannername
            document.getElementById('editheader').value = e.data.banner.header
            document.getElementById('editcontent').value = e.data.banner.content

        }
    })
}


async function getEditCoupen(coupenID) {
    await axios.get('/admin/get_edit_coupen/' + coupenID).then((e) => {
        if (e.data.status) {
            document.getElementById('editcoupenname').value = e.data.coupen.coupenname
            document.getElementById('editcoupentype').value = e.data.coupen.coupentype
            document.getElementById('editcoupencode').value = e.data.coupen.coupencode
            document.getElementById('editcoupendiscount').value = e.data.coupen.coupendiscount
            document.getElementById('editcoupentarget').value = e.data.coupen.coupentarget

        }
    })
}


async function applyCoupon(coupenID) {
    await axios.get('/apply_coupon/' + coupenID).then((e) => {

        if (e.data.inValid) {
            swal("You have allready used this offer", "Get next week...", "warning")
            document.getElementById('couponID').value = ""
        }
        else if (e.data.status) {
            document.getElementById('couponID').value = coupenID
            document.getElementById('total-price').innerHTML = e.data.gt
            document.getElementById('discount').innerHTML = e.data.discount

            swal("You saved Rs." + e.data.discount, "Thank you", "success")
        } else {
            swal("Not available for this amount.", "Purchase again and get coupen...", "warning")
            document.getElementById('couponID').value = ""
        }
    })
}

async function delCategory(catID, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/delete_category/' + catID).then((e) => {
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })
        }
    })

}

async function delProduct(prodID, myImg, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/delete_products/' + prodID + '/' + myImg).then((e) => {
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")

                }
            })
        }
    })

}

async function blockUser(userID) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/block-user/' + userID).then((e) => {
                if (e.data.status) {
                    swal("Blocked", "", "success")
                    location.reload()
                }
            })
        }
    })

}

async function unBlockUser(userID) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/unblock-user/' + userID).then((e) => {
                if (e.data.status) {
                    swal("Blocked", "", "success")
                    location.reload()
                }
            })
        }
    })

}


async function delBanner(bannerID, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/del_banner/' + bannerID).then((e) => {
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })
        } else {
            swal("Your imaginary file is safe!");
        }
    })

}
async function delCoupen(coupenID, obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then(async (willDelete) => {
        if (willDelete) {
            await axios.get('/admin/del_coupen/' + coupenID).then((e) => {
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })
        } else {
            swal("Your imaginary file is safe!");
        }
    })

}

// async function addEditShipAddress(){
//     editAddressID=document.getElementById('tempAddressID').value
//     if(editAddressID==""){
//         await axios.post('/add_shipping_address',{
//             name :document.getElementById('shipname').value,
//             streetaddress:document.getElementById('streetaddress').value,
//             altermobile:document.getElementById('altermobile').value,
//             pincode:document.getElementById('pincode').value,
//             landmark:document.getElementById('landmark').value,
//             city:document.getElementById('city').value,
//             district:document.getElementById('district').value,
//             state:document.getElementById('state').value
//         }).then((e)=>{
//                 if(e.data.status){
//                     location.href='/user_profile'
//                 }
//         })
//     }else {
//         await axios.post('/edit_shipping_address/'+editAddressID,{
//             name :document.getElementById('shipname').value,
//             streetaddress:document.getElementById('streetaddress').value,
//             altermobile:document.getElementById('altermobile').value,
//             pincode:document.getElementById('pincode').value,
//             landmark:document.getElementById('landmark').value,
//             city:document.getElementById('city').value,
//             district:document.getElementById('district').value,
//             state:document.getElementById('state').value
//         }).then((e)=>{
//                 if(e.data.status){
//                     location.href='/user_profile'
//                 }
//         })
//     }
// }

async function editShipAddress(addressId, obj, isPlaceorder) {
    await axios.get('/edit_ship_address/' + addressId).then((e) => {
        if (e.data.status) {
            let add = JSON.stringify(e.data.shipAddress.address[0]);

            $(obj).closest('#shippingaddress').modal('hide')

            document.getElementById('shipname').value = e.data.shipAddress.address[0].name
            document.getElementById('streetaddress').value = e.data.shipAddress.address[0].streetaddress
            document.getElementById('altermobile').value = e.data.shipAddress.address[0].altermobile
            document.getElementById('pincode').value = e.data.shipAddress.address[0].pincode
            document.getElementById('landmark').value = e.data.shipAddress.address[0].landmark
            document.getElementById('city').value = e.data.shipAddress.address[0].city
            document.getElementById('district').value = e.data.shipAddress.address[0].district
            document.getElementById('state').value = e.data.shipAddress.address[0].state
            if (isPlaceorder) {
                document.getElementById('tempAddressID').value = e.data.shipAddress.address[0]._id
                document.getElementById('btnShipAddress').value = e.data.shipAddress.address[0]._id
            }
        }
    })
}

function delOrderItems(prodID, obj) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then(async (willDelete) => {
            if (willDelete) {
                await axios.get('/del-order-item/' + prodID).then((e) => {
                    if (e.data.status) {

                        swal("Order Cancelled", "", "success");
                        $(obj).closest('tr').remove()
                        // document.getElementById('total-price').innerHTML=e.data.total
                    }
                    else {
                        swal("Can't delete Shipped order", "", "success");
                        // location.href='/order'
                    }
                })
            }
        });
}

function delOrderItemsAdmin(prodID, obj) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then(async (willDelete) => {
            if (willDelete) {
                await axios.get('/admin/del-order-item/' + prodID).then((e) => {
                    if (e.data.status) {

                        swal("Order Cancelled", "", "success");
                        $(obj).closest('tr').remove()
                        // document.getElementById('total-price').innerHTML=e.data.total
                    }
                    else {
                        swal("Can't delete Shipped order", "", "success");
                        // location.href='/order'
                    }
                })
            }
        });
}

// .....................Billing.........................
function printInvoice(tagId) {
    let hashId = "#" + tagId;
    let tagname = $(hashId).prop("tagName").toLowerCase();
    let attributes = "";
    let attrs = document.getElementById(tagId).attributes;
    $.each(attrs, function (i, elem) {
        attributes += " " + elem.name + " ='" + elem.value + "' ";
    })
    let divToPrint = $(hashId).html();
    let head = "<html><head>" + $("head").html() + "</head>";
    let allContent = head + "<body  onload='window.print()' >" + "<" + tagname + attributes + ">" + divToPrint + "</" + tagname + ">" + "</body></html>";
    let newWin = window.open('', 'Print-Window');
    newWin.document.open();
    newWin.document.write(allContent);
    newWin.document.close();
    setTimeout(function () { newWin.close(); }, 1000);
}




