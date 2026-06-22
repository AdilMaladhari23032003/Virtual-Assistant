import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function ResetPassword() {
  const { token } = useParams()
  const { serverUrl } = useContext(userDataContext)
  const navigate = useNavigate()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState("")

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErr("")
    setSuccess("")

    if (password !== confirmPassword) {
      setErr("Passwords do not match!")
      return
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters long!")
      return
    }

    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/reset-password/${token}`, { password })
      setSuccess(result.data.message)
      setLoading(false)
      // Redirect to sign in after 3 seconds, or let them click the button
      setTimeout(() => {
        navigate("/signin")
      }, 3000)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "Failed to reset password. Token might be invalid or expired.")
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}} >
      <form className='w-[90%] min-h-[500px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px] py-[40px]' onSubmit={handleResetPassword}>
        <h1 className='text-white text-[30px] font-semibold text-center mb-[10px]'>Reset Password</h1>
        <p className='text-gray-300 text-[16px] text-center mb-[20px] px-[10px]'>
          Enter your new secure password below.
        </p>

        {!success ? (
          <>
            {/* New Password Input */}
            <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder='New Password' 
                className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' 
                required 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
              />
              {!showPassword && <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowPassword(true)}/>}
              {showPassword && <IoEyeOff className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowPassword(false)}/>}
            </div>

            {/* Confirm New Password Input */}
            <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder='Confirm New Password' 
                className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' 
                required 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                value={confirmPassword}
              />
              {!showConfirmPassword && <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowConfirmPassword(true)}/>}
              {showConfirmPassword && <IoEyeOff className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowConfirmPassword(false)}/>}
            </div>

            {err.length > 0 && (
              <p className='text-red-500 text-[17px] text-center'>
                *{err}
              </p>
            )}

            <button 
              className='min-w-[180px] h-[60px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px]' 
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        ) : (
          <div className='flex flex-col items-center gap-[20px] w-full'>
            <p className='text-green-400 text-[18px] text-center font-medium'>
              {success}
            </p>
            <p className='text-gray-300 text-center text-[15px]'>
              Redirecting you to the Sign In page in a few seconds...
            </p>
            <button 
              type="button"
              className='min-w-[150px] h-[50px] mt-[10px] text-black font-semibold bg-white rounded-full text-[18px]'
              onClick={() => navigate("/signin")}
            >
              Go to Sign In
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default ResetPassword
