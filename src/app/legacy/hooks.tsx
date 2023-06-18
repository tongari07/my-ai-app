import React from "react";

export type ChatCompletionMessageType = {
  id?: string;
  role: "system" | "user" | "assistant";
  content: string;
};

export const useChatCompletion = () => {
  const [messages, setMessages] = React.useState<ChatCompletionMessageType[]>(
    [],
  );

  const postChatCompletion = async (text: string) => {
    const newMessages: ChatCompletionMessageType[] = [
      ...messages,
      {
        role: "user",
        content: text,
      },
    ];
    setMessages(newMessages);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        max_tokens: 128,
      }),
    });

    if (res.status !== 200) {
      throw new Error("Failed to fetch");
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return;
    }

    const decoder = new TextDecoder("utf-8");

    const read = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      const decodedValues = decoder.decode(value).trim();
      if (decodedValues.trim()) {
        const lines = decodedValues.split("\n");

        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            return;
          }
          try {
            const parsed = JSON.parse(message);
            const id = parsed.id;
            const data = parsed.choices[0].delta.content;
            if (data) {
              setMessages((current) => {
                const target = current.find((c) => c.id === id);
                return target
                  ? [
                      ...current.filter((c) => c.id !== id),
                      { ...target, content: `${target.content}${data}` },
                    ]
                  : [
                      ...current,
                      {
                        id,
                        role: "assistant",
                        content: data,
                      },
                    ];
              });
            }
          } catch (e) {
            console.error(e);
          }
        }

        // eslint-disable-next-line consistent-return
        return read();
      }
    };
    await read();
  };

  const handleSubmit = (text: string) => {
    postChatCompletion(text);
  };

  return {
    messages,
    handleSubmit,
  };
};
