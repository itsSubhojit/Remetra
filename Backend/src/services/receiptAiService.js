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
            text: `You are Remetra's AI receipt and bill analysis assistant.
Remetra supports three payment categories: Recharge (mobile/DTH), Electricity (utility power bills), and Subscription (digital services/streaming).

Analyze this image or PDF document and determine if it is a valid bill or payment receipt and matching one of these categories.

Output a valid JSON object with the following fields:
1. isValidReceipt (boolean):
   - Set to true if the document is a genuine bill, utility bill, mobile/DTH recharge confirmation/receipt, or subscription invoice/payment receipt.
   - Set to false if the uploaded document is NOT a payment receipt/bill (for example: source code, programming screenshot, meme, selfie or random photo, blank image, general UI screenshot, or document unrelated to a payment/bill).
   - IMPORTANT: A genuine bill or receipt where some fields cannot be detected or are missing is STILL valid (isValidReceipt: true). Only set false if the document is genuinely not a bill or payment receipt.

2. If isValidReceipt is false, set all other fields to null.

3. If isValidReceipt is true, extract the following:
   - personName: Account holder or billed person's name (string or null).
   - title: Concise descriptive title (e.g. "WBSEDCL Electricity Bill", "Airtel Recharge", "Netflix Subscription") (string or null).
   - category: Must be exactly one of: Recharge, Electricity, Subscription (string or null).
   - provider: Operator, utility board, or merchant name (e.g. WBSEDCL, CESC, Airtel, Jio, Netflix, Spotify) (string or null).
   - amount: Total payable or paid amount as a number without currency symbols (number or null).
   - dueDate: Due date or expiry date in YYYY-MM-DD or DD/MM/YYYY format (string or null).
   - frequency: Must be exactly one of: Weekly, Monthly, Yearly (string or null).

If any individual field cannot be confidently determined from a valid bill, set its value to null.

Respond with ONLY a valid JSON object. Do not include any explanation, markdown, code blocks, or extra text.`
        }
    ]

    const callGemini = async (attemptsLeft = 2) => {
        try {
            return await genAi.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: contents
            })
        } catch (err) {
            if (attemptsLeft > 0 && (err.status === 503 || err.status === 429)) {
                await new Promise((resolve) => setTimeout(resolve, 2000))
                return callGemini(attemptsLeft - 1)
            }
            throw err
        }
    }

    try {
        const aiResponse = await callGemini()

        const responseText = aiResponse.text?.trim() || ""
        // Defensively strip markdown code fences if model wrapped response in ```json ... ```
        const cleaned = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
        const extractedData = JSON.parse(cleaned)

        // Ensure isValidReceipt is an explicit boolean
        if (typeof extractedData.isValidReceipt !== "boolean") {
            extractedData.isValidReceipt = Boolean(
                extractedData.amount != null ||
                (extractedData.provider && extractedData.provider !== "null") ||
                (extractedData.title && extractedData.title !== "null")
            )
        }

        return extractedData

    } catch (error) {
        // Safe error logging: log only sanitized metadata (status/code, error type), never raw error string or request payload
        const errorStatus = error?.status || error?.code || "Unknown";
        const errorType = error?.name || "ApiError";
        console.error(`[Receipt AI Service] Generation failed. Status: ${errorStatus}, Type: ${errorType}`);
        throw error;
    }

}
