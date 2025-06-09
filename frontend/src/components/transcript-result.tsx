"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TranscriptResponse } from "@/lib/api";

interface TranscriptResultProps {
  result: TranscriptResponse;
  onReset: () => void;
}

export function TranscriptResult({ result, onReset }: TranscriptResultProps) {
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transcript Results</h2>
          <p className="text-gray-600">
            Processed with {result.ai_provider.toUpperCase()}
            {result.file_chunks &&
              result.file_chunks > 1 &&
              ` • ${result.file_chunks} chunks`}
          </p>
        </div>
        <Button onClick={onReset} variant="outline">
          Process Another File
        </Button>
      </div>

      {/* Formatted Response */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-500" />
            AI-Formatted Summary
          </CardTitle>
          <CardDescription>
            AI-processed and formatted transcript based on your prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {result.formatted_response}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(
                    result.formatted_response,
                    "Formatted transcript"
                  )
                }
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadText(
                    result.formatted_response,
                    "formatted-transcript.txt"
                  )
                }
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} className="text-gray-500" />
            Raw Transcript
          </CardTitle>
          <CardDescription>
            Original unprocessed transcript from speech-to-text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-sm leading-relaxed text-gray-700">
                {result.raw_transcript}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(result.raw_transcript, "Raw transcript")
                }
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadText(result.raw_transcript, "raw-transcript.txt")
                }
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {(result.video_id || result.filename) && (
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.video_id && (
                <div>
                  <span className="font-medium">Video ID:</span>
                  <p className="text-gray-600">{result.video_id}</p>
                </div>
              )}
              {result.filename && (
                <div>
                  <span className="font-medium">Filename:</span>
                  <p className="text-gray-600">{result.filename}</p>
                </div>
              )}
              <div>
                <span className="font-medium">AI Provider:</span>
                <p className="text-gray-600 capitalize">{result.ai_provider}</p>
              </div>
              {result.file_chunks && (
                <div>
                  <span className="font-medium">File Chunks:</span>
                  <p className="text-gray-600">{result.file_chunks}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
