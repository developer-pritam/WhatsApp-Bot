import { Configuration, OpenAIApi } from "openai";
import config from "../config";
const apiKey = config.OPEN_AI_KEY;
const configuration = new Configuration({
    apiKey,
});
const openai = new OpenAIApi(configuration);

async function getResponseFromOpenAi(prompt, query) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.7,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.data.choices[0].text;
}

export default getResponseFromOpenAi;