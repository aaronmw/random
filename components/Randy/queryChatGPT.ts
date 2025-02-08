import invariant from "tiny-invariant"

const endpoint = "https://api.openai.com/v1/chat/completions"

export async function queryChatGPT(prompt: string) {
  try {
    invariant(process.env.OPENAI_API_KEY, "Missing OPENAI_API_KEY")

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You always respond with a JSON object with a single key named 'results' and it contains an array of strings",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
        n: 1,
        response_format: {
          type: "json_object",
        },
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    const { results } = JSON.parse(data.choices[0].message.content.trim())

    return results
  } catch (error) {
    console.error("Error querying ChatGPT:", error)
    return null
  }
}
