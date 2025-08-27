import {BotMessageSquare, Maximize, Send, X} from "lucide-react";
import {FC, useState, useRef} from "react";
import {FileItem} from "./types";

const SideChat: FC<{
  onClose: () => void;
  selectedFile: any;
  setSelectedFile: (file: any) => void;
  setFileStructure: any;
}> = ({onClose, selectedFile, setSelectedFile, setFileStructure}) => {
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
    if (!userInput.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, {role: "user", text: userInput}]);

    // Show temporary "Typing..." message
    setMessages((prev) => [...prev, {role: "ai", text: "Typing..."}]);

    try {
      // Prepare the prompt
      const prompt = `
User input: ${userInput}
Selected file content: ${selectedFile?.content || ""}

Give me JavaScript code in 3 lines. Format it like this:

// Example JavaScript code
function greet(name) {
  console.log("Hello, " + name + "!");
}

Return it as a string with \`\\n\` line breaks and string concatenation using backticks. Now, format the following code:
`;

      // Call Gemini API
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY,
          },
          body: JSON.stringify({
            contents: [{parts: [{text: prompt}]}],
          }),
        }
      );

      const data = await res.json();

      // Extract AI response
      const aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      console.log(aiReply, selectedFile, "selectedFile");

      // Update selected file content safely
      setSelectedFile((prev) => (prev ? {...prev, content: aiReply} : null));
      setFileStructure((prev) => {
        const updateFile = (items: FileItem[]): FileItem[] => {
          return items.map((item) => {
            if (item.id === selectedFile?.id) {
              return {...item, content: aiReply};
            }
            if (item.children) {
              return {
                ...item,
                children: updateFile(item.children),
              };
            }
            return item;
          });
        };
        return updateFile(prev);
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.text !== "Typing..."),
        {role: "ai", text: aiReply},
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev.filter((m) => m.text !== "Typing..."),
        {role: "ai", text: "Error connecting to Gemini API"},
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
      <div className="p-4 border-t border-[#454545] bg-[#2d2d2d] flex items-center">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && input.trim()) {
              e.preventDefault();
              callGemini(input);
              setInput("");
            }
          }}
          className="flex-1 max-h-40 overflow-y-auto p-3 rounded-2xl bg-[#3a3a3a] border border-[#454545] 
               text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 
               focus:ring-blue-500 resize-none"
          placeholder="Type a message... (Shift+Enter for new line)"
          style={{width: `calc(${width}px - 4rem)`, minHeight: "44px"}}
        />

        {/* Send button */}
        <button
          onClick={() => {
            if (input.trim()) {
              callGemini(input);
              setInput("");
            }
          }}
          className="ml-2 p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default SideChat;
