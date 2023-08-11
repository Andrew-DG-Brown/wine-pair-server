import { Configuration, OpenAIApi, CreateChatCompletionRequest } from 'openai';
import { config } from 'dotenv';
config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openAi = new OpenAIApi(configuration);

class OpenAi {
    static async dishToWineQuery(dish: string) {
        const prompt = `List 3 wines that go well with ${dish} in an array of JSON objects with "wine" and "description" keys.
        
        [{ "wine": , "description": }, { "wine": , "description": }, { "wine": , "description": }]
        `
        let res
        try {

            res = await openAi.createChatCompletion(this.buildCompletionConfig(prompt))
        } catch (err) {
            debugger
        }

        if (res?.data?.choices[0]?.message?.content) {
            const jsonRes: JSON = JSON.parse(res.data.choices[0].message.content)
            return this.handleRes(jsonRes)
        }
    }

    static async getWineDescription(wine: string) {
        const prompt = `Give me a description of the wine ${wine} in one sentences`

        const res = await openAi.createChatCompletion(this.buildCompletionConfig(prompt))

        return (
            res.data.choices[0].message?.content 
            && res.data.choices[0].message?.content
        )
    }

    private static handleRes(res: JSON) {
        if (Array.isArray(res)) {
            if (res.length > 1) {
                return res
            }
        } else if (typeof res === 'object' && Object.keys(res).length > 1) {
            return Object.entries(res).map(([wine, description]) => {
                return { wine, description }
            })
        } else if (Object.keys(res).length === 1) {
            return Object.values(res)[0]
        }
    }

    private static buildCompletionConfig(prompt: string): CreateChatCompletionRequest {
        return {
            "model": "gpt-3.5-turbo",
            "messages": [{ "role": "user", "content": prompt }]
        }
    }
}

export default OpenAi
