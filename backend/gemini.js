import axios from "axios"

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    const apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const modelName = "nvidia/llama-3.3-nemotron-super-49b-v1";

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
      model: modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    console.log("=== NVIDIA API Request ===");
    console.log("URL:", apiUrl);
    console.log("Model:", requestPayload.model);
    console.log("API Key:", apiKey ? "PRESENT" : "MISSING");

    const result = await axios.post(apiUrl, requestPayload, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Virtual Assistant"
      }
    });

    console.log("=== NVIDIA API Response ===");
    console.log(JSON.stringify(result.data, null, 2));

    if (
      result.data &&
      result.data.choices &&
      result.data.choices[0] &&
      result.data.choices[0].message &&
      result.data.choices[0].message.content
    ) {
      return result.data.choices[0].message.content;
    } else {
      throw new Error("Invalid response format from NVIDIA API");
    }

  } catch (error) {
    console.error("=== NVIDIA API Error ===");
    if (error.response) {
      console.error("Status Code:", error.response.status);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
      
      const status = error.response.status;
      let friendlyMessage = "Sorry, I am facing a connection issue. Please try again.";
      if (status === 400) {
        friendlyMessage = "I received a bad request. Please check your query format.";
      } else if (status === 401) {
        friendlyMessage = "Authentication error. The API key appears to be invalid.";
      } else if (status === 402) {
        friendlyMessage = "Insufficient credits. Please add credits to your NVIDIA account.";
      } else if (status === 403) {
        friendlyMessage = "Authentication error. The API key appears to be restricted.";
      } else if (status === 404) {
        friendlyMessage = "The API model was not found.";
      } else if (status === 429) {
        friendlyMessage = "Too many requests. Please wait a moment and try again.";
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