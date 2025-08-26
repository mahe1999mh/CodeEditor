import {BotMessageSquare, Maximize, X} from "lucide-react";
import {FC, useState, useRef} from "react";

const SideChat: FC<{onClose: () => void}> = ({onClose}) => {
  const [width, setWidth] = useState(320);
  const isResizing = useRef(false);

  const [messages, setMessages] = useState<
    {role: "user" | "ai"; text: string}[]
  >([]);
  const [input, setInput] = useState("");

  const API_KEY = "AIzaSyAGSl4vrBRiX_znykHA3JO87VesWS8A3O4";

  // --- Resize Logic ---
  const startResize = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 240 && newWidth < 600) {
      setWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  // --- Gemini API Call ---
  async function callGemini(userInput: string) {
    // add user message to UI
    setMessages((prev) => [...prev, {role: "user", text: userInput}]);

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      `${userInput} — give me JavaScript code in 3 lines. Format it like this:\n\n` +
                      `// Example JavaScript code\n` +
                      `function greet(name) {\n` +
                      `  console.log("Hello, " + name + "!");\n` +
                      `}\n` +
                      `\n` +
                      `greet("World");\n` +
                      `\n` +
                      `// Test different console methods\n` +
                      `console.info("This is an info message");\n` +
                      `console.warn("This is a warning");\n` +
                      `console.error("This is an error");\n` +
                      `\n` +
                      `// Test object logging\n` +
                      `console.log({ name: "John", age: 30 });`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        " No response from AI";

      // add AI reply to UI
      setMessages((prev) => [...prev, {role: "ai", text: aiReply}]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {role: "ai", text: " Error connecting to Gemini API"},
      ]);
    }
  }

  return (
    <div
      className="fixed right-0 top-0 h-full bg-[#2d2d2d] border-l border-[#454545] flex flex-col"
      style={{width: `${width}px`}}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500/30"
      />

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#454545]">
        <h2 className="text-sm font-semibold text-gray-200">AI Chat</h2>
        <div className="flex gap-2">
          <Maximize
            className="cursor-pointer hover:bg-[#454545]/50 rounded p-1 text-gray-300"
            onClick={() =>
              setWidth((prev) =>
                prev === window.innerWidth ? 320 : window.innerWidth
              )
            }
          />
          <X
            onClick={onClose}
            className="cursor-pointer hover:bg-[#454545]/50 rounded p-1 text-gray-300"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3 text-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <BotMessageSquare size={64} className="text-gray-600" />
            <h1 className="text-2xl text-gray-400 font-semibold">
              Ask about your code
            </h1>
            <h5 className="text-sm text-gray-300 font-semibold">
              AI responses may be inaccurate
            </h5>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[80%] ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-gray-700 text-gray-200"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-[#454545] bg-[#2d2d2d]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              callGemini(input);
              setInput("");
            }
          }}
          className="w-full p-2 bg-[#3a3a3a] border border-[#454545] rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default SideChat;
