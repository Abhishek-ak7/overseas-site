"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from "lucide-react"

interface TestInterfaceProps {
  test: any
}

export function TestInterface({ test }: TestInterfaceProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60) // Convert to seconds
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())

  // Sample questions - in real app, these would come from API
  const questions = [
    {
      id: "q1",
      section: "listening",
      type: "multiple-choice",
      question: "What is the main topic of the conversation?",
      options: ["Planning a vacation", "Discussing work schedules", "Arranging a meeting", "Talking about weather"],
      audio: "/audio/listening-1.mp3",
    },
    {
      id: "q2",
      section: "reading",
      type: "multiple-choice",
      question: "According to the passage, what is the primary cause of climate change?",
      passage:
        "Climate change is primarily driven by human activities that release greenhouse gases into the atmosphere...",
      options: [
        "Natural weather patterns",
        "Solar radiation changes",
        "Human activities releasing greenhouse gases",
        "Ocean current variations",
      ],
    },
  ]

  const currentQuestionData = questions[currentQuestion] || questions[0]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="flex-1 p-6">
      {/* Test Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">{test.type}</Badge>
              <span className="text-sm text-gray-600">Section: {test.sections[currentSection]?.name}</span>
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5 text-primary" />
              <span className={timeRemaining < 300 ? "text-red-500" : "text-gray-900"}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button variant="outline" size="sm">
              Submit Test
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </div>

      {/* Question Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestionData.id)}
                    className={flaggedQuestions.has(currentQuestionData.id) ? "text-orange-500" : ""}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                  {answers[currentQuestionData.id] && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Player for Listening Questions */}
              {currentQuestionData.audio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={currentQuestionData.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Reading Passage */}
              {currentQuestionData.passage && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Reading Passage:</h3>
                  <p className="text-gray-700 leading-relaxed">{currentQuestionData.passage}</p>
                </div>
              )}

              {/* Question */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">{currentQuestionData.question}</h3>

                {/* Multiple Choice Options */}
                {currentQuestionData.type === "multiple-choice" && (
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option: string, index: number) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={option}
                          checked={answers[currentQuestionData.id] === option}
                          onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestion === index ? "default" : "outline"}
                    size="sm"
                    className={`relative ${answers[questions[index]?.id] ? "bg-green-100 border-green-300" : ""} ${
                      flaggedQuestions.has(questions[index]?.id) ? "bg-orange-100 border-orange-300" : ""
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                    {flaggedQuestions.has(questions[index]?.id) && (
                      <Flag className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Answered:</span>
                <span className="font-semibold">
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Flagged:</span>
                <span className="font-semibold">{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className="font-semibold">{questions.length - Object.keys(answers).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          disabled={currentQuestion === questions.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
