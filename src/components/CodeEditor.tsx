import { transform } from "@babel/standalone";
import { Editor } from "@monaco-editor/react";
import { Code2, Play, RefreshCw, Save, Split, Terminal, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";


type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: React.ReactNode;
  content?: string;
  children?: FileItem[];
};
type ConsoleOutput = {
  type: "log" | "error" | "info" | "warn";
  content: string;
  timestamp: number;
};

export function CodeEditor({
  file,
  onSave,
  onDelete,
}: {
  file: FileItem;
  onSave: (content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [content, setContent] = useState(file.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showCompiled, setShowCompiled] = useState(false);
  const [compiledCode, setCompiledCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  console.log(isRunning, "isRunning");

  const compileCode = useCallback(
    (sourceCode: string) => {
      try {
        if (file.name.endsWith(".tsx") || file.name.endsWith(".ts")) {
          const result = transform(sourceCode, {
            filename: file.name,
            presets: ["typescript", "react"],
            retainLines: true,
          });
          setCompiledCode(result.code || "");
          setError(null);
          return result.code;
        } else if (file.name.endsWith(".jsx") || file.name.endsWith(".js")) {
          const result = transform(sourceCode, {
            filename: file.name,
            presets: ["react"],
            retainLines: true,
          });
          setCompiledCode(result.code || "");
          setError(null);
          return result.code;
        }
        return sourceCode;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Compilation error");
        setCompiledCode("");
        return null;
      }
    },
    [file.name]
  );

  const runCode = useCallback(() => {
    setIsRunning(true);
    // setConsoleOutput([]);

    const compiledSource = compileCode(content);
    console.log(compiledSource, content, "compiledSource");
    if (!compiledSource) {
      setIsRunning(false);
      return;
    }

    // Create a custom console object
    const customConsole = {
      log: (...args: any[]) => {
        setConsoleOutput((prev) => [
          ...prev,
          {
            type: "log",
            content: args
              .map((arg) =>
                typeof arg === "object"
                  ? JSON.stringify(arg, null, 2)
                  : String(arg)
              )
              .join(" "),
            timestamp: Date.now(),
          },
        ]);
      },
      error: (...args: any[]) => {
        setConsoleOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: args
              .map((arg) => (arg instanceof Error ? arg.message : String(arg)))
              .join(" "),
            timestamp: Date.now(),
          },
        ]);
      },
      warn: (...args: any[]) => {
        setConsoleOutput((prev) => [
          ...prev,
          {
            type: "warn",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: Date.now(),
          },
        ]);
      },
      info: (...args: any[]) => {
        setConsoleOutput((prev) => [
          ...prev,
          {
            type: "info",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: Date.now(),
          },
        ]);
      },
    };

    try {
      // Create a new Function with the compiled code
      const executeCode = new Function("console", compiledSource);
      executeCode(customConsole);
    } catch (err) {
      customConsole.error(err);
    }

    setIsRunning(false);
  }, [content, compileCode]);

  useEffect(() => {
    if (content) {
      compileCode(content);
    }
  }, [content, compileCode]);

  const handleSave = () => {
    onSave(content);
    setIsEditing(false);
  };

  const getLanguage = () => {
    const ext = file.name.split(".").pop();
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "json":
        return "json";
      case "html":
        return "html";
      case "css":
        return "css";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  const isJsTs =
    file.name.endsWith(".js") ||
    file.name.endsWith(".jsx") ||
    file.name.endsWith(".ts") ||
    file.name.endsWith(".tsx");

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-[#454545]">
        <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-[#454545]">
          {file.icon}
          <span>{file.name}</span>
          <X
            size={16}
            className="text-red-500 cursor-pointer hover:bg-[#454545] rounded"
            onClick={() => onDelete(file.id)}
          />
        </div>
        <div className="flex gap-2">
          {isJsTs && (
            <>
              <button
                className={`p-1 hover:bg-[#454545] rounded flex items-center gap-1 text-sm ${
                  showCompiled ? "bg-[#454545]" : ""
                }`}
                onClick={() => setShowCompiled(!showCompiled)}
              >
                <Split size={16} />
                <span>Show Compiled</span>
              </button>
              <button
                className="p-1 hover:bg-[#454545] rounded flex items-center gap-1 text-sm"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                <span>Run</span>
              </button>
            </>
          )}
          <button
            className="p-1 hover:bg-[#454545] rounded flex items-center gap-1 text-sm"
            onClick={handleSave}
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex">
        <div
          className={`${
            showCompiled ? "w-1/2 border-r border-[#454545]" : "w-full"
          } flex flex-col`}
        >
          <div className="p-2 bg-[#2d2d2d] border-b border-[#454545] flex items-center gap-2">
            <Code2 size={16} />
            <span className="text-sm">Source</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage={getLanguage()}
              value={content}
              onChange={(value) => setContent(value || "")}
              theme="vs-dark"
              options={{
                minimap: {enabled: false},
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
        {showCompiled && (
          <div className="w-1/2 flex flex-col">
            <div className="p-2 bg-[#2d2d2d] border-b border-[#454545] flex items-center gap-2">
              <Play size={16} />
              <span className="text-sm">Compiled Output</span>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={error ? `// Error:\n${error}` : compiledCode}
                theme="vs-dark"
                options={{
                  minimap: {enabled: false},
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        )}
      </div>
      {isJsTs && (
        <div className="h-[200px] border-t border-[#454545]">
          <div className="p-2 bg-[#2d2d2d] border-b border-[#454545] flex items-center gap-2">
            <Terminal size={16} />
            <span className="text-sm">Console Output</span>
            {consoleOutput.length > 0 && (
              <button
                className="ml-auto p-1 hover:bg-[#454545] rounded"
                onClick={() => setConsoleOutput([])}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="h-[calc(200px-37px)] overflow-auto p-2 font-mono text-sm">
            {consoleOutput.map((output, index) => (
              <div
                key={`${output.timestamp}-${index}`}
                className={`mb-1 ${
                  output.type === "error"
                    ? "text-red-400"
                    : output.type === "warn"
                    ? "text-yellow-400"
                    : output.type === "info"
                    ? "text-blue-400"
                    : "text-gray-300"
                }`}
              >
                {output.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
