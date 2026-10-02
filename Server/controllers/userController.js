import userModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import razorpay from 'razorpay'
import transactionModel from "../Models/transactionModel.js";
import { SchemaTypeOptions } from "mongoose";
const registerUser= async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name|| !email||!password){
            return res.json({sucess:false,message:"Missing Details"})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)
        const userData={
            name,
            email,
            password:hashedPassword
        }
        const newUser=new userModel(userData);
        const user=await newUser.save()

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({sucess:true,token,user:{name:user.name}})
    }
    catch(error){
        console.log(error);
        res.json({sucess:false,message:error.message})
        
    }
}

const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await userModel.findOne({email})

        if(!user){
            return res.json({sucess:false,message:"User does not exist"})
        }

        const isMatch=await bcrypt.compare(password,user.password)

        if(isMatch){
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({sucess:true,token,user:{name:user.name}})
        }
        else{
             return res.json({sucess:false,message:"Invalid Credentials"})
        }
    }
    catch(error){
        console.log(error);
        res.json({sucess:false,message:error.message})
    }
}

const userCredits = async (req, res) => {
    try{
        const {userId}=req.body

        const user=await userModel.findById(userId)
        res.json({sucess:true,credits:user.creditBalance,user:{name:user.name}})
    }
    catch(error){
        console.log(error);
        res.json({sucess:false,message:error.message})
    }
}

const razorpayInstance=new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
})

const paymentRazorpay=async(req,res)=>{
    try {
        const {userId,planID}=req.body
        const userData=await userModel.findById(userId)
        if(!userId ||!planID){
            return  res.json({sucess:false,message:'Missing Details'})
        }
        let credits,plan,amount,date

        switch (planID) {
            case 'Basic':
                plan='Basic'
                credits=100
                amount=10
                break;

            case 'Advanced':
                plan='Advanced'
                credits=500
                amount=50
                break;

            case 'Business':
                plan='Business'
                credits=500
                amount=50
                break;
                
        
            default:
                return res.json({sucess:false,message:'Plan not found'});
        }
        date=Date.now();

        const transactionData={
            userId,plan,amount,credits,date
        }
        const newTransaction=await transactionModel.create(transactionData)

        const options={
            amount:amount*100,
            currency:process.env.CURRENCY,
            receipt:newTransaction._id,
        }

        await razorpayInstance.orders.create(options,(error,order)=>{
            if(error){
                console.log(error);
                return res.json({sucess:false,message:error})
            }
            res.json({sucess:true,order})
        })

    } catch (error) {
        console.log(error);
        res.json({sucess:false,message:error.message})
        
    }
}
const verifyRazorPay=async (req,res) => {
    try {
        const{razorpay_order_id}=req.body;

        const orderInfo=await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status==='paid') {
            const transactionData=await transactionModel.findById(orderInfo.receipt)
            if (transactionData.payment) {
                return res.json({sucess:false,message:'Payment Failed'})
            }
            const userData=await userModel.findById(transactionData.userId)
            const creditBalance=userData.creditBalance+transactionData.credits
            await userModel.findByIdAndUpdate(userData._id,{creditBalance})
            await transactionModel.findByIdAndUpdate(transactionData._id,{payment:true})
            res.json({sucess:true,message:'Credits Added'})
        }
        else{
            res.json({sucess:false,message:'Payments Failed'})
            
        }
    } catch (error) {
         console.log(error);
        res.json({sucess:false,message:error.message})
    }
}
export {registerUser,loginUser,userCredits,paymentRazorpay,verifyRazorPay}