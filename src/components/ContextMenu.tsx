import { Edit2, FilePlus, FolderPlus, Trash2 } from "lucide-react";

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function ContextMenu({
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