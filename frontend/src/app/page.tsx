"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { VideoUpload } from "@/components/video-upload";
import { TranscriptResult } from "@/components/transcript-result";
import { TranscriptResponse } from "@/lib/api";
import InterviewAnalysis from "@/components/InterviewAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [transcriptResult, setTranscriptResult] =
    useState<TranscriptResponse | null>(null);

  const handleTranscriptResult = (result: TranscriptResponse) => {
    setTranscriptResult(result);
  };

  const handleReset = () => {
    setTranscriptResult(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Interview Analysis Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI-powered interview analysis with skill assessment,
            Q&A grading, and detailed insights. Also supports general video
            transcription and formatting.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="interview-analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="interview-analysis">
                Interview Analysis
              </TabsTrigger>
              <TabsTrigger value="transcript-extraction">
                Transcript Extraction
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interview-analysis">
              <InterviewAnalysis />
            </TabsContent>

            <TabsContent value="transcript-extraction">
              <div className="max-w-4xl mx-auto">
                {transcriptResult ? (
                  <TranscriptResult
                    result={transcriptResult}
                    onReset={handleReset}
                  />
                ) : (
                  <VideoUpload onTranscriptResult={handleTranscriptResult} />
                )}
              </div>

              {/* Features */}
              {!transcriptResult && (
                <div className="max-w-4xl mx-auto mt-12">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    Features
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="font-semibold mb-2">
                        Multiple Input Methods
                      </h3>
                      <p className="text-gray-600">
                        Upload video/audio files directly or provide YouTube,
                        Vimeo, and other video URLs
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="font-semibold mb-2">
                        AI-Powered Processing
                      </h3>
                      <p className="text-gray-600">
                        Choose between OpenAI (Whisper + GPT) or Google Gemini
                        for transcription and formatting
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="font-semibold mb-2">Cloud Storage</h3>
                      <p className="text-gray-600">
                        Secure file upload to Digital Ocean Spaces with
                        automatic processing
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </main>
  );
}
