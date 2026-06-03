"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PreviewPanelProps {
  name: string;
  content: string;
  loading: boolean;
  onClose: () => void;
}

export function PreviewPanel({ name, content, loading, onClose }: PreviewPanelProps) {
  return (
    <div className="w-96 shrink-0 border-l flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm font-medium truncate">{name}</p>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}