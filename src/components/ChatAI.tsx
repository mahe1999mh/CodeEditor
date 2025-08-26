import {BotMessageSquare, X} from "lucide-react";
import {FC, useState, useRef} from "react";

const SideChat: FC<{onClose: () => void}> = ({onClose}) => {
  const [width, setWidth] = useState(320);
  const isResizing = useRef(false);

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
        <h2 className="text-sm font-semibold">AI Chat</h2>
        <X onClick={onClose} className="cursor-pointer hover:text-red-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center gap-5 text-center">
        <BotMessageSquare size={64} className="text-gray-600" />
        <h1 className="text-2xl text-gray-400 font-semibold">
          Ask about your code
        </h1>
        <h5 className="text-sm text-gray-300 font-semibold">
          AI Responses may be inaccurate
        </h5>
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-[#454545] bg-[#2d2d2d]">
        <input
          type="text"
          className="w-full p-2 bg-[#3a3a3a] border border-[#454545] rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default SideChat;
