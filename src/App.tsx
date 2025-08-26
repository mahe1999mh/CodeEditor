import {useState, useCallback} from "react";

import {
  Files,
  File,
  Folder,
  Settings,
  Search,
  GitBranch,
  FileCode,
  MoreVertical,
  FolderPlus,
  FilePlus,
} from "lucide-react";
import {ContextMenu} from "./components/ContextMenu";
import {CodeEditor} from "./components/CodeEditor";
import {FileTreeItem} from "./components/FileTreeItem";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: React.ReactNode;
  content?: string;
  children?: FileItem[];
};

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
