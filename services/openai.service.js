const axios = require("axios");

const analyzeMeal = async (imageUrl, userProfile, mealContext) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            response_format: { type: "json_object" },
            content: require("../utils/systemprompt")
          },
          {
            role: "user",
            content: [
              { type: "text", text: `User Profile: ${JSON.stringify(userProfile)}` },
              { type: "text", text: `Meal Context: ${JSON.stringify(mealContext)}` },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const resultText = response.data.choices[0].message.content;

    let cleaned = resultText.trim();

// remove ```json ``` if present
if (cleaned.startsWith("```")) {
  cleaned = cleaned.replace(/```json|```/g, "").trim();
}

return JSON.parse(cleaned); // IMPORTANT: ensure your prompt returns JSON
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    throw new Error("AI processing failed");
  }
};

module.exports = analyzeMeal;