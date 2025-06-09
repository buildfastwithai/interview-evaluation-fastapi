"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Video, Link, FileAudio } from "lucide-react";
import { uploadToSpaces } from "@/lib/spaces-upload";
import {
  extractTranscript,
  uploadAudioForTranscript,
  TranscriptResponse,
} from "@/lib/api";

interface VideoUploadProps {
  onTranscriptResult: (result: TranscriptResponse) => void;
}

export function VideoUpload({ onTranscriptResult }: VideoUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");
  const [formatPrompt, setFormatPrompt] = useState(
    "Please format this transcript into a clear, well-structured summary with key points and main topics."
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type
      const allowedTypes = [
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/wmv",
        "audio/mp3",
        "audio/wav",
        "audio/m4a",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid video or audio file");
        return;
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 100MB");
        return;
      }

      setIsLoading(true);
      setUploadProgress(0);

      try {
        // Step 1: Upload to Digital Ocean Spaces
        toast.info("Uploading file to cloud storage...");
        setUploadProgress(25);

        const uploadedUrl = await uploadToSpaces(file);
        setUploadProgress(50);

        toast.success("File uploaded successfully!");

        // Step 2: Process with FastAPI backend
        toast.info("Processing transcript...");
        setUploadProgress(75);

        let result: TranscriptResponse;

        if (file.type.startsWith("audio/")) {
          // Direct audio file upload to FastAPI
          result = await uploadAudioForTranscript(
            file,
            aiProvider,
            formatPrompt
          );
        } else {
          // Video file - send URL to FastAPI for processing
          result = await extractTranscript({
            video_url: uploadedUrl,
            ai_provider: aiProvider,
            format_prompt: formatPrompt,
          });
        }

        setUploadProgress(100);
        toast.success("Transcript generated successfully!");
        onTranscriptResult(result);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred during upload"
        );
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    },
    [aiProvider, formatPrompt, onTranscriptResult]
  );

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      toast.info("Processing video from URL...");
      setUploadProgress(50);

      const result = await extractTranscript({
        video_url: videoUrl,
        ai_provider: aiProvider,
        format_prompt: formatPrompt,
      });

      setUploadProgress(100);
      toast.success("Transcript generated successfully!");
      onTranscriptResult(result);
      setVideoUrl("");
    } catch (error) {
      console.error("URL processing error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process video URL"
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Choose your AI provider and customize the output format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-provider">AI Provider</Label>
            <select
              id="ai-provider"
              value={aiProvider}
              onChange={(e) =>
                setAiProvider(e.target.value as "openai" | "gemini")
              }
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="openai">OpenAI (Whisper + GPT)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div>
            <Label htmlFor="format-prompt">Format Prompt</Label>
            <textarea
              id="format-prompt"
              value={formatPrompt}
              onChange={(e) => setFormatPrompt(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[80px]"
              placeholder="Describe how you want the transcript to be formatted..."
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Upload Video/Audio File
          </CardTitle>
          <CardDescription>
            Upload a video or audio file (MP4, AVI, MOV, MP3, WAV, M4A - Max
            100MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept="video/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Video size={24} className="text-gray-500" />
                  <FileAudio size={24} className="text-gray-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  Supports video and audio files up to 100MB
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={20} />
            Or Enter Video URL
          </CardTitle>
          <CardDescription>
            Enter a YouTube, Vimeo, or other supported video URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !videoUrl.trim()}>
              {isLoading ? "Processing..." : "Extract Transcript"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
