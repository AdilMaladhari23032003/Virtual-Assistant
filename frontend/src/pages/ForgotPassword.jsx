import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function ForgotPassword() {
  const { serverUrl } = useContext(userDataContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState("")
  const [devResetLink, setDevResetLink] = useState("")

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setErr("")
    setSuccess("")
    setDevResetLink("")
    setLoading(true)

    try {
      let result = await axios.post(`${serverUrl}/api/auth/forgot-password`, { email })
      setSuccess(result.data.message)
      if (result.data.resetLink) {
        setDevResetLink(result.data.resetLink)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "Something went wrong. Please try again.")
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}} >
      <form className='w-[90%] min-h-[500px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px] py-[40px]' onSubmit={handleForgotPassword}>
        <h1 className='text-white text-[30px] font-semibold text-center mb-[10px]'>Forgot Password</h1>
        <p className='text-gray-300 text-[16px] text-center mb-[20px] px-[10px]'>
          Enter your registered email address and we'll send you a password reset link.
        </p>

        {!success ? (
          <>
            <input 
              type="email" 
              placeholder='Email Address' 
              className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
            />

            {err.length > 0 && (
              <p className='text-red-500 text-[17px] text-center'>
                *{err}
              </p>
            )}

            <button 
              className='min-w-[180px] h-[60px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px]' 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        ) : (
          <div className='flex flex-col items-center gap-[20px] w-full'>
            <p className='text-green-400 text-[18px] text-center font-medium'>
              {success}
            </p>

            {devResetLink && (
              <div className='w-full p-[15px] bg-[#ffffff10] rounded-lg border border-green-500/50 text-left text-white break-all'>
                <p className='font-bold text-green-400 mb-[5px] text-[14px]'>Development Mode Link:</p>
                <a href={devResetLink} className='text-blue-300 hover:underline text-[14px]'>{devResetLink}</a>
              </div>
            )}
            
            <button 
              type="button"
              className='min-w-[150px] h-[50px] mt-[10px] text-black font-semibold bg-white rounded-full text-[18px]'
              onClick={() => navigate("/signin")}
            >
              Back to Sign In
            </button>
          </div>
        )}

        {!success && (
          <p className='text-[white] text-[18px] cursor-pointer mt-[20px]' onClick={() => navigate("/signin")}>
            Remembered your password? <span className='text-blue-400'>Sign In</span>
          </p>
        )}
      </form>
    </div>
  )
}

export default ForgotPassword
