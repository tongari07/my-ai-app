"use client";
import React from "react";
import { useChatCompletion } from "./hooks";

export default function Legacy() {
  const { messages, handleSubmit } = useChatCompletion();
  const [input, setInput] = React.useState("");

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.map((m, idx) => (
        <div key={idx}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setInput("");
          handleSubmit(input);
        }}
      >
        <label>
          Say something...
          <input
            className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
