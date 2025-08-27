export type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: React.ReactNode;
  content?: string;
  children?: FileItem[];
};
