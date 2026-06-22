import axios from "axios"

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show"
  ,
  "userInput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to  open a calculator .
- "instagram-open": if user wants to  open instagram .
- "facebook-open": if user wants to open facebook.
-"weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.


now your userInput- ${command}
`;

    const requestPayload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    console.log("=== Gemini API Request Payload ===");
    console.log("URL:", `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey ? "HIDDEN" : "MISSING"}`);
    console.log("Payload:", JSON.stringify(requestPayload, null, 2));

    const result = await axios.post(apiUrl, requestPayload);

    console.log("=== Gemini API Response Data ===");
    console.log(JSON.stringify(result.data, null, 2));

    if (
      result.data &&
      result.data.candidates &&
      result.data.candidates[0] &&
      result.data.candidates[0].content &&
      result.data.candidates[0].content.parts &&
      result.data.candidates[0].content.parts[0]
    ) {
      return result.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }

  } catch (error) {
    console.error("=== Gemini API Error ===");
    if (error.response) {
      console.error("Status Code:", error.response.status);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
      
      const status = error.response.status;
      let friendlyMessage = "Sorry, I am facing a connection issue. Please try again.";
      if (status === 400) {
        friendlyMessage = "I received a bad request. Please check your query format.";
      } else if (status === 403) {
        friendlyMessage = "Authentication error. The Gemini API key appears to be invalid or restricted.";
      } else if (status === 404) {
        friendlyMessage = "The Gemini API service endpoint or model was not found.";
      }
      
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: friendlyMessage
      });
    } else {
      console.error("Error Message:", error.message);
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: "I couldn't connect to the AI model. Please verify your network connection."
      });
    }
  }
}

export default geminiResponse