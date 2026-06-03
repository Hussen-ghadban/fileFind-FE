"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  listFiles,
  listFolders,
  deleteFile,
  deleteFolder,
  createFolder,
  downloadFile,
  searchFiles,
  uploadFile,
  listFolderFiles,
  previewFile as fetchPreview,
} from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Upload,
  FolderPlus,
  Folder,
  File,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Home,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hook/use-toast";
import { PreviewPanel } from "@/components/preview-panel";

interface FileItem {
  file_id: string;
  name: string;
  file_type: string;
  file_size: number;
  folder_id?: string;
  created_at: string;
  relevance_score?: number;
  matched_chunk?: string;
}

interface FolderItem {
  folder_id: string;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const searchRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("recent_searches") || "[]");
  });
  const [showRecent, setShowRecent] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        listFolders(),
        currentFolder ? listFolderFiles(currentFolder.folder_id) : listFiles(),
      ]);
      setFolders(foldersRes.data);
      setFiles(filesRes.data);
    } catch {
      toast("Failed to load files", "error");
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    try {
      await uploadFile(file, currentFolder?.folder_id);
      toast("File uploaded and indexed!", "success");
      fetchData();
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searching) return;
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    setSearching(true);
    try {
      const res = await searchFiles(searchQuery);
      setSearchResults(res.data.results);
    } catch {
      toast("Search failed", "error");
    } finally {
      setSearching(false);
      setShowRecent(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await downloadFile(fileId);
      window.open(res.data.download_url, "_blank");
    } catch {
      toast("Download failed", "error");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (deletingFileId) return;
    setDeletingFileId(fileId);
    try {
      await deleteFile(fileId);
      toast("File deleted", "success");
      fetchData();
      if (searchResults) {
        setSearchResults(searchResults.filter((f) => f.file_id !== fileId));
      }
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDeletingFileId(null);
      setFileToDelete(null);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (deletingFolderId) return;
    setDeletingFolderId(folderId);
    try {
      await deleteFolder(folderId);
      toast("Folder deleted", "success");
      fetchData();
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDeletingFolderId(null);
      setFolderToDelete(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      await createFolder(newFolderName);
      toast("Folder created", "success");
      setNewFolderName("");
      setShowNewFolderDialog(false);
      fetchData();
    } catch {
      toast("Failed to create folder", "error");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handlePreview = async (fileId: string, fileName: string) => {
    setPreviewLoading(true);
    setPreviewFile({ name: fileName, content: "" });
    try {
      const res = await fetchPreview(fileId);
      setPreviewFile({ name: fileName, content: res.data.preview });
    } catch {
      toast("Preview failed", "error");
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const exampleSearches = [
    "invoices from last month",
    "project proposal",
    "meeting notes",
    "contracts 2024",
    "budget report",
  ];

  const displayedFiles = searchResults ?? files;
  const isSearching = searchResults !== null;

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type?.includes("pdf")) return "PDF";
    if (type?.includes("word")) return "DOC";
    if (type?.includes("sheet")) return "XLS";
    if (type?.includes("presentation")) return "PPT";
    return "TXT";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">FileFind</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">

          {/* Search Bar */}
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Input
                ref={searchRef}
                placeholder="Search files by describing what they're about..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setSearchResults(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => setShowRecent(true)}
                onBlur={() => setTimeout(() => setShowRecent(false), 150)}
                className="w-full"
              />
              {!searchQuery && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  ⌘K
                </span>
              )}
              {showRecent && recentSearches.length > 0 && !searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-md z-50 overflow-hidden">
                  <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Recent searches</p>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => {
                        setSearchQuery(s);
                        setShowRecent(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {s}
                    </button>
                  ))}
                  <button
                    onMouseDown={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("recent_searches");
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground px-3 py-2 text-left border-t"
                  >
                    Clear recent searches
                  </button>
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              {searching ? "Searching..." : "Search"}
            </Button>
            {isSearching && (
              <Button variant="outline" onClick={() => { setSearchResults(null); setSearchQuery(""); }}>
                Clear
              </Button>
            )}
          </div>

          {/* Toolbar */}
          {!isSearching && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <button onClick={() => setCurrentFolder(null)} className="flex items-center gap-1 hover:text-foreground">
                  <Home className="w-4 h-4" />
                  Root
                </button>
                {currentFolder && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground">{currentFolder.name}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewFolderDialog(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                <label>
                  <Button size="sm" disabled={uploading} asChild>
                    <span>
                      {uploading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                        : <><Upload className="w-4 h-4 mr-2" />Upload File</>
                      }
                    </span>
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Search Results Label */}
          {isSearching && (
            <p className="text-sm text-muted-foreground">
              {displayedFiles.length} result{displayedFiles.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </p>
          )}

          {/* Folders */}
          {!isSearching && !currentFolder && folders.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Folders</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {folders.map((folder) => (
                  <div
                    key={folder.folder_id}
                    className="border rounded-lg p-4 flex flex-col gap-2 hover:bg-accent cursor-pointer group relative"
                    onClick={() => setCurrentFolder(folder)}
                  >
                    {deletingFolderId === folder.folder_id && (
                      <div className="absolute inset-0 bg-background/70 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <Folder className="w-8 h-8 text-blue-500" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        disabled={!!deletingFolderId}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium truncate">{folder.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            {!isSearching && (
              <p className="text-sm font-medium text-muted-foreground mb-3">Files</p>
            )}
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : displayedFiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-3 opacity-30" />
                {isSearching ? (
                  <>
                    <p className="mb-4">No files matched your search</p>
                    <p className="text-xs mb-3">Try one of these instead:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {exampleSearches.map((q) => (
                        <button
                          key={q}
                          onClick={() => { setSearchQuery(q); handleSearch(); }}
                          className="text-xs px-3 py-1.5 rounded-full border hover:bg-accent transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No files yet — upload one to get started</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {displayedFiles.map((file) => (
                  <div
                    key={file.file_id}
                    className="border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-accent group relative"
                  >
                    {deletingFileId === file.file_id && (
                      <div className="absolute inset-0 bg-background/70 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getFileIcon(file.file_type)}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(file.file_size)}
                          {file.relevance_score && (
                            <span className="ml-2 text-green-600">
                              {Math.round(file.relevance_score * 100)}% match
                            </span>
                          )}
                        </p>
                        {file.matched_chunk && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xl">
                            {file.matched_chunk}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(file.file_id, file.name)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(file.file_id)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFileToDelete(file)}
                        disabled={!!deletingFileId}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel — sits beside main content */}
        {previewFile && (
          <PreviewPanel
            name={previewFile.name}
            content={previewFile.content}
            loading={previewLoading}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={(open) => { if (!creatingFolder) { setShowNewFolderDialog(open); setNewFolderName(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewFolderDialog(false); setNewFolderName(""); }} disabled={creatingFolder}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}>
              {creatingFolder ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Delete Confirm Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => { if (!deletingFileId) setFileToDelete(open ? fileToDelete : null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{fileToDelete?.name}</span> will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingFileId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (fileToDelete) handleDeleteFile(fileToDelete.file_id); }}
              disabled={!!deletingFileId}
            >
              {deletingFileId ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Folder Delete Confirm Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => { if (!deletingFolderId) setFolderToDelete(open ? folderToDelete : null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{folderToDelete?.name}</span> will be permanently deleted. Files inside will not be deleted but will be moved to root.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingFolderId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (folderToDelete) handleDeleteFolder(folderToDelete.folder_id); }}
              disabled={!!deletingFolderId}
            >
              {deletingFolderId ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}