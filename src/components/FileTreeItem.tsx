import { ChevronDown, Edit2, File, FilePlus, Folder, FolderPlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ContextMenu } from "./ContextMenu";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: React.ReactNode;
  content?: string;
  children?: FileItem[];
};
export function FileTreeItem({
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
