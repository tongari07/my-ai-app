import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
  });
  const stream = OpenAIStream(response, {
    onStart: async () => {
      console.log("onStart");
    },
    onToken: async (token: string) => {
      console.log(token);
    },
    onCompletion: async (completion: string) => {
      console.log("onCompletion", completion);
    },
  });
  return new StreamingTextResponse(stream);
}
