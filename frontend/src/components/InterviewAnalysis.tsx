"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle,
  Upload,
  Clock,
  Star,
  TrendingUp,
  Brain,
  MessageSquare,
  Download,
  FileText,
  TableIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateInterviewPDF } from "@/lib/pdf-generator";

export interface SkillAssessment {
  skill: string;
  level:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | "Expert"
    | "Not Demonstrated";
  confidence_score: number;
  evidence: string;
  recommendations: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  grade: "Excellent" | "Good" | "Average" | "Below Average" | "Poor";
  score: number;
  feedback: string;
  key_points_covered: string[];
  areas_for_improvement: string[];
}

export interface InterviewInsights {
  overall_performance_score: number;
  communication_clarity: number;
  technical_depth: number;
  problem_solving_ability: number;
  confidence_level: number;
  strengths: string[];
  weaknesses: string[];
  key_achievements_mentioned: string[];
  red_flags: string[];
  interview_duration_analysis: string;
  speech_patterns: string;
  engagement_level: string;
  cultural_fit_indicators: string[];
  hiring_recommendation: string;
  next_steps: string[];
}

export interface AnalysisResponse {
  filename?: string;
  video_id?: string;
  raw_transcript: string;
  formatted_transcript: string;
  ai_provider: string;
  file_chunks?: number;
  skill_assessments: SkillAssessment[];
  questions_and_answers: QuestionAnswer[];
  interview_insights: InterviewInsights;
  analysis_summary: string;
}

export default function InterviewAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [jobRole, setJobRole] = useState("Software Developer");
  const [companyName, setCompanyName] = useState("Company");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const validateInputs = () => {
    if (!file) {
      setError("Please select a file to upload");
      return false;
    }

    if (!skills.trim()) {
      setError("Please enter at least one skill to assess");
      return false;
    }

    const skillsList = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (skillsList.length > 20) {
      setError("Maximum 20 skills allowed");
      return false;
    }

    return true;
  };

  const analyzeInterview = async () => {
    if (!validateInputs()) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("skills_to_assess", skills);
      formData.append("job_role", jobRole);
      formData.append("company_name", companyName);
      formData.append("ai_provider", "openai");

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 2000);

      const response = await fetch("/api/analyze-interview", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const result: AnalysisResponse = await response.json();
      setAnalysisResult(result);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-500";
      case "Advanced":
        return "bg-blue-500";
      case "Intermediate":
        return "bg-yellow-500";
      case "Beginner":
        return "bg-orange-500";
      case "Not Demonstrated":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Excellent":
        return "text-green-600 bg-green-50";
      case "Good":
        return "text-blue-600 bg-blue-50";
      case "Average":
        return "text-yellow-600 bg-yellow-50";
      case "Below Average":
        return "text-orange-600 bg-orange-50";
      case "Poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const downloadPDF = (includeTranscript: boolean = false) => {
    if (!analysisResult) return;

    try {
      generateInterviewPDF(analysisResult, {
        includeTranscript,
        includeRawData: false,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Interview Analysis</h1>
        <p className="text-gray-600">
          Upload an interview recording and get comprehensive AI-powered
          analysis with skill assessment, Q&A grading, and detailed insights.
        </p>
      </div>

      {!analysisResult ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Interview for Analysis
            </CardTitle>
            <CardDescription>
              Upload an audio or video file and specify the skills you want to
              assess
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="file">Interview File</Label>
              <Input
                id="file"
                type="file"
                accept=".mp3,.wav,.m4a,.mp4,.avi,.mov,.webm,.mkv"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: MP3, WAV, M4A, MP4, AVI, MOV, WebM, MKV
              </p>
            </div>

            <div>
              <Label htmlFor="skills">Skills to Assess</Label>
              <Textarea
                id="skills"
                placeholder="e.g., Python, React, Problem Solving, Communication, Leadership, SQL, Machine Learning"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="mt-1"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter comma-separated skills (maximum 20). Be specific for
                better analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobRole">Job Role</Label>
                <Input
                  id="jobRole"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Software Developer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Tech Corp"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Analyzing interview... This may take several minutes.
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500">
                  {progress < 30 && "Transcribing audio..."}
                  {progress >= 30 && progress < 60 && "Analyzing skills..."}
                  {progress >= 60 &&
                    progress < 90 &&
                    "Extracting Q&A and generating insights..."}
                  {progress >= 90 && "Finalizing analysis..."}
                </p>
              </div>
            )}

            <Button
              onClick={analyzeInterview}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Interview"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">
                  {analysisResult.analysis_summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download Buttons */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Download the analysis in different formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => downloadPDF(false)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF Report
                </Button>
                <Button
                  onClick={() => downloadPDF(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF with Transcript
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="skills-table">Skills Table</TabsTrigger>
              <TabsTrigger value="qa">Q&A Analysis</TabsTrigger>
              <TabsTrigger value="qa-table">Q&A Table</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Summary Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Overall Performance
                          </TableCell>
                          <TableCell>
                            {
                              analysisResult.interview_insights
                                .overall_performance_score
                            }
                            /100
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysisResult.interview_insights
                                  .overall_performance_score >= 80
                                  ? "default"
                                  : analysisResult.interview_insights
                                      .overall_performance_score >= 60
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {analysisResult.interview_insights
                                .overall_performance_score >= 80
                                ? "Excellent"
                                : analysisResult.interview_insights
                                    .overall_performance_score >= 60
                                ? "Good"
                                : "Needs Improvement"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Communication
                          </TableCell>
                          <TableCell>
                            {
                              analysisResult.interview_insights
                                .communication_clarity
                            }
                            /100
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysisResult.interview_insights
                                  .communication_clarity >= 80
                                  ? "default"
                                  : analysisResult.interview_insights
                                      .communication_clarity >= 60
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {analysisResult.interview_insights
                                .communication_clarity >= 80
                                ? "Clear"
                                : analysisResult.interview_insights
                                    .communication_clarity >= 60
                                ? "Adequate"
                                : "Unclear"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Technical Depth
                          </TableCell>
                          <TableCell>
                            {analysisResult.interview_insights.technical_depth}
                            /100
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysisResult.interview_insights
                                  .technical_depth >= 80
                                  ? "default"
                                  : analysisResult.interview_insights
                                      .technical_depth >= 60
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {analysisResult.interview_insights
                                .technical_depth >= 80
                                ? "Deep"
                                : analysisResult.interview_insights
                                    .technical_depth >= 60
                                ? "Adequate"
                                : "Shallow"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Problem Solving
                          </TableCell>
                          <TableCell>
                            {
                              analysisResult.interview_insights
                                .problem_solving_ability
                            }
                            /100
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysisResult.interview_insights
                                  .problem_solving_ability >= 80
                                  ? "default"
                                  : analysisResult.interview_insights
                                      .problem_solving_ability >= 60
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {analysisResult.interview_insights
                                .problem_solving_ability >= 80
                                ? "Strong"
                                : analysisResult.interview_insights
                                    .problem_solving_ability >= 60
                                ? "Adequate"
                                : "Weak"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Confidence Level
                          </TableCell>
                          <TableCell>
                            {analysisResult.interview_insights.confidence_level}
                            /100
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysisResult.interview_insights
                                  .confidence_level >= 80
                                  ? "default"
                                  : analysisResult.interview_insights
                                      .confidence_level >= 60
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {analysisResult.interview_insights
                                .confidence_level >= 80
                                ? "High"
                                : analysisResult.interview_insights
                                    .confidence_level >= 60
                                ? "Moderate"
                                : "Low"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Skills Summary Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Skills Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill Level</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Average Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          "Expert",
                          "Advanced",
                          "Intermediate",
                          "Beginner",
                          "Not Demonstrated",
                        ]
                          .map((level) => {
                            const skillsAtLevel =
                              analysisResult.skill_assessments.filter(
                                (s) => s.level === level
                              );
                            const avgScore =
                              skillsAtLevel.length > 0
                                ? Math.round(
                                    skillsAtLevel.reduce(
                                      (sum, s) => sum + s.confidence_score,
                                      0
                                    ) / skillsAtLevel.length
                                  )
                                : 0;

                            if (skillsAtLevel.length === 0) return null;

                            return (
                              <TableRow key={level}>
                                <TableCell>
                                  <Badge className={getSkillLevelColor(level)}>
                                    {level}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {skillsAtLevel.length}
                                </TableCell>
                                <TableCell>{avgScore}%</TableCell>
                              </TableRow>
                            );
                          })
                          .filter(Boolean)}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Q&A Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Q&A Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["Excellent", "Good", "Average", "Below Average", "Poor"]
                        .map((grade) => {
                          const qaAtGrade =
                            analysisResult.questions_and_answers.filter(
                              (qa) => qa.grade === grade
                            );
                          const avgScore =
                            qaAtGrade.length > 0
                              ? Math.round(
                                  qaAtGrade.reduce(
                                    (sum, qa) => sum + qa.score,
                                    0
                                  ) / qaAtGrade.length
                                )
                              : 0;
                          const percentage = Math.round(
                            (qaAtGrade.length /
                              analysisResult.questions_and_answers.length) *
                              100
                          );

                          if (qaAtGrade.length === 0) return null;

                          return (
                            <TableRow key={grade}>
                              <TableCell>
                                <Badge className={getGradeColor(grade)}>
                                  {grade}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {qaAtGrade.length}
                              </TableCell>
                              <TableCell>{avgScore}/100</TableCell>
                              <TableCell>{percentage}%</TableCell>
                            </TableRow>
                          );
                        })
                        .filter(Boolean)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interview Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        analysisResult.interview_insights
                          .overall_performance_score
                      }
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.interview_insights.communication_clarity}
                    </div>
                    <div className="text-sm text-gray-600">Communication</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.interview_insights.technical_depth}
                    </div>
                    <div className="text-sm text-gray-600">Technical Depth</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        analysisResult.interview_insights
                          .problem_solving_ability
                      }
                    </div>
                    <div className="text-sm text-gray-600">Problem Solving</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {analysisResult.interview_insights.confidence_level}
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.interview_insights.strengths.map(
                        (strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.interview_insights.weaknesses.map(
                        (weakness, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{weakness}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    {analysisResult.interview_insights.hiring_recommendation}
                  </p>
                  <div>
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <ul className="space-y-1">
                      {analysisResult.interview_insights.next_steps.map(
                        (step, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-blue-500">•</span>
                            {step}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Assessment Tab */}
            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.skill_assessments.map((skill, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{skill.skill}</CardTitle>
                        <Badge className={getSkillLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={skill.confidence_score}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {skill.confidence_score}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Evidence:</h4>
                        <p className="text-sm text-gray-600">
                          {skill.evidence}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Recommendations:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {skill.recommendations}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Skills Table Tab */}
            <TabsContent value="skills-table">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Skills Assessment Table
                  </CardTitle>
                  <CardDescription>
                    Tabular view of all assessed skills with scores and
                    recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Confidence Score</TableHead>
                        <TableHead>Evidence</TableHead>
                        <TableHead>Recommendations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisResult.skill_assessments.map((skill, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {skill.skill}
                          </TableCell>
                          <TableCell>
                            <Badge className={getSkillLevelColor(skill.level)}>
                              {skill.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={skill.confidence_score}
                                className="flex-1 w-16"
                              />
                              <span className="text-sm font-medium">
                                {skill.confidence_score}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={skill.evidence}
                            >
                              {skill.evidence.length > 100
                                ? `${skill.evidence.substring(0, 100)}...`
                                : skill.evidence}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={skill.recommendations}
                            >
                              {skill.recommendations.length > 100
                                ? `${skill.recommendations.substring(
                                    0,
                                    100
                                  )}...`
                                : skill.recommendations}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Q&A Analysis Tab */}
            <TabsContent value="qa" className="space-y-4">
              {analysisResult.questions_and_answers.map((qa, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base leading-relaxed">
                        {qa.question}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getGradeColor(qa.grade)}>
                          {qa.grade}
                        </Badge>
                        <span className="text-sm font-medium">
                          {qa.score}/100
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Answer:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {qa.answer}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Feedback:</h4>
                      <p className="text-sm text-gray-600">{qa.feedback}</p>
                    </div>

                    {qa.key_points_covered.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Key Points Covered:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {qa.key_points_covered.map((point, pointIndex) => (
                            <Badge
                              key={pointIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {qa.areas_for_improvement.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Areas for Improvement:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {qa.areas_for_improvement.map((area, areaIndex) => (
                            <Badge
                              key={areaIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Q&A Table Tab */}
            <TabsContent value="qa-table">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Q&A Analysis Table
                  </CardTitle>
                  <CardDescription>
                    Tabular view of all questions and answers with grades and
                    feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Key Points</TableHead>
                        <TableHead>Improvements</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisResult.questions_and_answers.map((qa, index) => (
                        <TableRow key={index}>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm font-medium truncate"
                              title={qa.question}
                            >
                              {qa.question.length > 80
                                ? `${qa.question.substring(0, 80)}...`
                                : qa.question}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={qa.answer}
                            >
                              {qa.answer.length > 100
                                ? `${qa.answer.substring(0, 100)}...`
                                : qa.answer}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(qa.grade)}>
                              {qa.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{qa.score}/100</span>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={qa.feedback}
                            >
                              {qa.feedback.length > 100
                                ? `${qa.feedback.substring(0, 100)}...`
                                : qa.feedback}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {qa.key_points_covered
                                .slice(0, 2)
                                .map((point, pointIndex) => (
                                  <Badge
                                    key={pointIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {point.length > 20
                                      ? `${point.substring(0, 20)}...`
                                      : point}
                                  </Badge>
                                ))}
                              {qa.key_points_covered.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{qa.key_points_covered.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {qa.areas_for_improvement
                                .slice(0, 2)
                                .map((area, areaIndex) => (
                                  <Badge
                                    key={areaIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {area.length > 20
                                      ? `${area.substring(0, 20)}...`
                                      : area}
                                  </Badge>
                                ))}
                              {qa.areas_for_improvement.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{qa.areas_for_improvement.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transcript Tab */}
            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Transcript</CardTitle>
                  <CardDescription>
                    Formatted transcript with {analysisResult.file_chunks} audio
                    chunks processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                      {analysisResult.formatted_transcript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={() => {
              setAnalysisResult(null);
              setFile(null);
              setSkills("");
              setError(null);
              setProgress(0);
            }}
            variant="outline"
            className="w-full"
          >
            Analyze Another Interview
          </Button>
        </div>
      )}
    </div>
  );
}
