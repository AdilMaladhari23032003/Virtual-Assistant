import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"
export const signUp=async (req,res)=>{
try {
    const {name,email,password}=req.body

    const existEmail=await User.findOne({email})
    if(existEmail){
        return res.status(400).json({message:"email already exists !"})
    }
    if(password.length<6){
        return res.status(400).json({message:"password must be at least 6 characters !"})
    }

    const hashedPassword=await bcrypt.hash(password,10)

    const user=await User.create({
        name,password:hashedPassword,email
    })

    const token=await genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
       maxAge:7*24*60*60*1000,
       sameSite:"None",
       secure:true
    })

    return res.status(201).json(user)

} catch (error) {
       return res.status(500).json({message:`sign up error ${error}`})
}
}

export const Login=async (req,res)=>{
try {
    const {email,password}=req.body

    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"email does not exists !"})
    }
   const isMatch=await bcrypt.compare(password,user.password)

   if(!isMatch){
   return res.status(400).json({message:"incorrect password"})
   }

    const token=await genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
       maxAge:7*24*60*60*1000,
       sameSite:"None",
       secure:true
    })

    return res.status(200).json(user)

} catch (error) {
       return res.status(500).json({message:`login error ${error}`})
}
}

export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token")
         return res.status(200).json({message:"log out successfully"})
    } catch (error) {
         return res.status(500).json({message:`logout error ${error}`})
    }
}
const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("=========================================");
    console.log("SMTP NOT CONFIGURED - LOGGING EMAIL INFO");
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT: ${text}`);
    console.log("=========================================");
    return { loggedToConsole: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Virtual Assistant" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist!" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    const subject = "Password Reset Request - Virtual Assistant";
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Virtual Assistant account.</p>
        <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #3b82f6; text-decoration: none; border-radius: 9999px; margin: 15px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <br>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    const emailResult = await sendEmail({ to: email, subject, text, html });

    return res.status(200).json({
      message: emailResult.loggedToConsole
        ? "Password reset link generated and logged to backend console (no SMTP setup)."
        : "Password reset link sent to your email.",
      ...(emailResult.loggedToConsole ? { resetLink } : {})
    });
  } catch (error) {
    return res.status(500).json({ message: `Forgot password error: ${error.message}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: "New password is required!" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (error) {
    return res.status(500).json({ message: `Reset password error: ${error.message}` });
  }
};
