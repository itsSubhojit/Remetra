import {GoogleGenAI} from '@google/genai';


const genAi = new GoogleGenAI(
    {apiKey: process.env.GEMINI_API_KEY}
)

export const analyzeReceipt = async(base64Image, mimeType) =>{
    const contents = [
        {
            inlineData: {
                mimeType: mimeType,
                data: base64Image
            }
        },
        {
            text: `This is an image of a bill or receipt. Now, Extract the following information: 
            personName, title, category, provider, amount, dueDate, frequency.
            
            category must be exactly one of: Recharge, Electricity, Subscription.
            frequency must be exactly one of: Weekly, Monthly, Yearly.
            
            If a field cannot be confidently determined, set its value to null.
            
            Respond with ONLY a valid JSON object. Do not include any explanation, markdown, code blocks, or extra text.`
        }
    ]

    try {
        const aiResponse = await genAi.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents
    })

    const responseText = aiResponse.text
    const extractedData = JSON.parse(responseText)

    return extractedData

    } catch (error) {
        console.log("Failed to Extract Your Receipt!", error)
        throw error
    }

}
