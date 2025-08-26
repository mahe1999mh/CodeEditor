import React, {useState, useCallback, useRef, useEffect} from "react";
import {transform} from "@babel/standalone";
import Editor from "@monaco-editor/react";
import {
  Files,
  File,
  Folder,
  FolderOpen,
  Settings,
  Search,
  GitBranch,
  Package,
  FileJson,
  FileType,
  FileCode,
  ChevronDown,
  MoreVertical,
  Plus,
  FolderPlus,
  FilePlus,
  Edit2,
  Save,
  X,
  Play,
  Code2,
  Split,
  Terminal,
  Trash2,
  RefreshCw,

} from "lucide-react";

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

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function ContextMenu({
  x,
  y,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: ContextMenuProps) {
  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-[#252526] border border-[#454545] rounded shadow-lg py-1 z-50"
        style={{left: x, top: y}}
      >
        <button
          className="w-full px-4 py-1 text-left hover:bg-[#37373d] flex items-center gap-2"
          onClick={onNewFile}
        >
          <FilePlus size={16} />
          <span>New File</span>
        </button>
        <button
          className="w-full px-4 py-1 text-left hover:bg-[#37373d] flex items-center gap-2"
          onClick={onNewFolder}
        >
          <FolderPlus size={16} />
          <span>New Folder</span>
        </button>
        <div className="border-t border-[#454545] my-1" />
        <button
          className="w-full px-4 py-1 text-left hover:bg-[#37373d] flex items-center gap-2"
          onClick={onRename}
        >
          <Edit2 size={16} />
          <span>Rename</span>
        </button>
        <button
          className="w-full px-4 py-1 text-left hover:bg-[#37373d] flex items-center gap-2 text-red-400"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </>
  );
}

function FileTreeItem({
  item,
  depth = 0,
  onAddFile,
  onAddFolder,
  onRename,
  onDelete,
  onSelect,
  selectedId,
}: {
  item: FileItem;
  depth?: number;
  onAddFile: (parentId: string) => void;
  onAddFolder: (parentId: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onSelect: (item: FileItem) => void;
  selectedId: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({x: e.clientX, y: e.clientY});
  };

  const handleRename = () => {
    if (editName.trim() && editName !== item.name) {
      onRename(item.id, editName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditing(false);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 hover:bg-[#37373d] cursor-pointer rounded group ${
          isSelected ? "bg-[#37373d]" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditing) {
            onSelect(item);
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            }
          }
        }}
        onContextMenu={handleContextMenu}
        style={{paddingLeft: `${depth * 8}px`}}
      >
        {hasChildren && (
          <ChevronDown
            size={16}
            className={`transform transition-transform ${
              !isExpanded ? "-rotate-90" : ""
            } mr-1`}
          />
        )}
        {!hasChildren && <div className="w-4 mr-1" />}
        {item.icon ||
          (item.type === "folder" ? (
            <Folder size={16} className="text-blue-500" />
          ) : (
            <File size={16} className="text-gray-400" />
          ))}

        {isEditing ? (
          <div className="flex-1 ml-2">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="w-full bg-[#3c3c3c] text-sm px-1 rounded border border-[#007fd4] focus:outline-none"
            />
          </div>
        ) : (
          <span className="ml-2 text-sm flex-1">{item.name}</span>
        )}

        {!isEditing && (
          <div className="ml-auto hidden group-hover:flex mr-2">
            {item.type === "folder" && (
              <>
                <button
                  className="p-1 hover:bg-[#454545] rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFile(item.id);
                  }}
                >
                  <FilePlus size={14} />
                </button>
                <button
                  className="p-1 hover:bg-[#454545] rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFolder(item.id);
                  }}
                >
                  <FolderPlus size={14} />
                </button>
              </>
            )}
            <button
              className="p-1 hover:bg-[#454545] rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit2 size={14} />
            </button>
            <button
              className="p-1 hover:bg-[#454545] rounded text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() => {
            onAddFile(item.id);
            setContextMenu(null);
          }}
          onNewFolder={() => {
            onAddFolder(item.id);
            setContextMenu(null);
          }}
          onRename={() => {
            setIsEditing(true);
            setContextMenu(null);
          }}
          onDelete={() => {
            onDelete(item.id);
            setContextMenu(null);
          }}
        />
      )}

      {isExpanded && hasChildren && (
        <div className="ml-2">
          {item.children?.map((child, index) => (
            <FileTreeItem
              key={`${child.name}-${index}`}
              item={child}
              depth={depth + 1}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onRename={onRename}
              onDelete={onDelete}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CodeEditor({
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
    setConsoleOutput([]);

    const compiledSource = compileCode(content);
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

function App() {
  const [fileStructure, setFileStructure] = useState<FileItem[]>([
    {
      id: "1",
      name: "CODE_PROJECTS",
      type: "folder",
      children: [
        {
          id: "2",
          name: "App.js",
          type: "file",
          icon: <FileCode size={16} className="text-yellow-500" />,
          content:
            '// Example JavaScript code\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet("World");\n\n// Test different console methods\nconsole.info("This is an info message");\nconsole.warn("This is a warning");\nconsole.error("This is an error");\n\n// Test object logging\nconsole.log({ name: "John", age: 30 });',
        },
      ],
    },
  ]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(
    fileStructure[0]?.children ? fileStructure[0].children[0] : null
  );

  console.log(selectedFile, "selectedFile");

  const addItem = useCallback((parentId: string, type: "file" | "folder") => {
    const newId = Math.random().toString(36).substr(2, 9);
    const defaultName = type === "file" ? "new-file.txt" : "new-folder";
    const icon =
      type === "file" ? (
        <File size={16} className="text-gray-400" />
      ) : (
        <Folder size={16} className="text-blue-500" />
      );

    const newItem: FileItem = {
      id: newId,
      name: defaultName,
      type,
      icon,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
    };

    const updateStructure = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateStructure(item.children),
          };
        }
        return item;
      });
    };

    setFileStructure((prev) => updateStructure(prev));
  }, []);

  const deleteItem = useCallback(
    async (id: string) => {
      function removeItem(items: FileItem[]): FileItem[] {
        return items
          .map((item) => {
            if (item.id === id) {
              return null;
            }
            if (item.children) {
              return {
                ...item,
                children: removeItem(item.children),
              };
            }
            return item;
          })
          .filter(Boolean) as FileItem[];
      }
      const result = await confirm("Do you really want to delete this file?");
      if (result) {
        setFileStructure((prev) => removeItem(prev));
        if (selectedFile?.id === id) {
          setSelectedFile(null);
        }
      }
    },
    [selectedFile]
  );
  const closeTab = useCallback(() => {
    setSelectedFile(null);
  }, []);
  const renameItem = useCallback((id: string, newName: string) => {
    const updateStructure = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return {...item, name: newName};
        }
        if (item.children) {
          return {
            ...item,
            children: updateStructure(item.children),
          };
        }
        return item;
      });
    };

    setFileStructure((prev) => updateStructure(prev));
  }, []);

  const updateFileContent = useCallback((id: string, newContent: string) => {
    const updateStructure = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return {...item, content: newContent};
        }
        if (item.children) {
          return {
            ...item,
            children: updateStructure(item.children),
          };
        }
        return item;
      });
    };

    setFileStructure((prev) => updateStructure(prev));
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-300 flex">
      {/* Sidebar */}
      <div className="w-[50px] bg-[#333333] flex flex-col items-center py-2 space-y-4">
        <button className="p-2 hover:bg-[#444444] rounded">
          <Files size={24} />
        </button>
        <button className="p-2 hover:bg-[#444444] rounded">
          <Search size={24} />
        </button>
        <button className="p-2 hover:bg-[#444444] rounded relative">
          <GitBranch size={24} />
          <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </button>
        <button className="p-2 hover:bg-[#444444] rounded">
          <Settings size={24} />
        </button>
      </div>

      {/* Explorer Panel */}
      <div className="w-[300px] bg-[#252526]">
        <div className="p-2 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-semibold uppercase">Explorer</span>
          </div>
          <div className="flex gap-1">
            <button
              className="p-1 hover:bg-[#444444] rounded"
              onClick={() => addItem(fileStructure[0].id, "file")}
            >
              <FilePlus size={16} />
            </button>
            <button
              className="p-1 hover:bg-[#444444] rounded"
              onClick={() => addItem(fileStructure[0].id, "folder")}
            >
              <FolderPlus size={16} />
            </button>
            <button className="p-1 hover:bg-[#444444] rounded">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Project Tree */}
        <div className="px-2">
          {fileStructure.map((item, index) => (
            <FileTreeItem
              key={`${item.name}-${index}`}
              item={item}
              onAddFile={(parentId) => addItem(parentId, "file")}
              onAddFolder={(parentId) => addItem(parentId, "folder")}
              onRename={renameItem}
              onDelete={deleteItem}
              onSelect={setSelectedFile}
              selectedId={selectedFile?.id || null}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#1e1e1e]">
        {selectedFile?.type === "file" ? (
          <CodeEditor
            file={selectedFile}
            onSave={(content) => updateFileContent(selectedFile.id, content)}
            onDelete={closeTab}
          />
        ) : (
          <div className="p-4">
            <p className="text-gray-400">Select a file to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
