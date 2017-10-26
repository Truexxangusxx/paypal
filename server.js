const express = require("express")
const ejs = require("ejs")
const paypal = require("paypal-rest-sdk")
var path = require('path');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdSzXRVJnLVzKE2ayOu_J-tmNV3xEzUeTCOJb79L_dxal115ljZp9QNtBfupUtA3wqcRzJ6PHDQVMlPd',
    'client_secret': 'EDL3y9JcQ0A-Xf3zDBS3rquepV-2e091Xk2qU2n1HeZwRIIfebIt8mYZeYFqVreM4nDxXsSG9u-Hl0_I'
});









const app = express();

app.set("view engine", "ejs");


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "silla de madera",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "esta es una descripcion del pago."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (var i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });


});


app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };


    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.sendFile(path.join(__dirname + '/success.html'));
        }
    });


});


app.get('/cancel', (req, res)=>res.send('cancelado'));


app.listen(3000, () => console.log("servidor iniciado"));