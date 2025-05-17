import { instance } from '../server.js';
import { createHmac } from 'crypto';


export const preprocessPayment = async (req, res) => {
    const amount = req.body.amount;
    console.log("amount : ", amount)
    // const amount = 100;
    const options = {
        amount: Number(amount) * 100,
        currency: 'INR',
        receipt: 'receipt_order_id',
    }
    const order = await instance.orders.create(options);
    res.status(200).json({
        message: "Payment processed successfully",
        order
    });
}

export const getKey=async(req,res)=>{
    res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    })
}

export const paymentVerification = async(req,res)=>{
    console.log(req.body);

    const {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature
    } = req.body;

    // const body = orderId + '|' + paymentId;
    // console.log(body);
    // const expectedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex");
    const body = `${orderId}|${paymentId}`;

    const expectedSignature = createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body)
        .digest("hex");
    console.log("Expected Signature : ", expectedSignature);
    console.log("Razorpay Signature : ",signature);

    const isAuthentic = expectedSignature === signature;
    console.log(isAuthentic)
    if(isAuthentic){
        return res.redirect(`http://localhost:5173/paymentSuccess?referenc=${paymentId}`)

    }
    else{
        res.status(404).json({
            success : false
        })
    }
}