import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FiSend, FiClock, FiCheckCircle } from "react-icons/fi";
import { evaluateAnswer } from "../../services/aiService";
import { formatTime } from "../../lib/timerUtils";
import TypingIndicator from "../ui/typing-indicator";

const InterviewChat = ({
  questions,
  currentQuestion,
  onAnswerSubmit,
  onNextQuestion,
  timer,
  isTimerRunning,
  onAutoSubmit,
  answers = [],
}) => {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [messages, setMessages] = useState([]);
  const hasAutoSubmittedRef = useRef(false);
  const hasActiveCountdownRef = useRef(false);
  const hasUserSubmittedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Always show only the current question (no history)
  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      const question = questions[currentQuestion];
      setMessages([
        {
          type: "question",
          content: question.text,
          difficulty: question.difficulty,
          timestamp: Date.now(),
        },
      ]);
      setCurrentAnswer("");
      setIsSubmitting(false);
      setIsEvaluating(false);
      hasAutoSubmittedRef.current = false;
      hasActiveCountdownRef.current = false;
      hasUserSubmittedRef.current = false;
    } else {
      setMessages([]);
    }
  }, [questions, currentQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark that countdown started at least once for this question
  useEffect(() => {
    if (isTimerRunning) {
      hasActiveCountdownRef.current = true;
    }
  }, [isTimerRunning]);

  // Auto-submit when timer expires (timer === 0), but only after countdown actually started
  useEffect(() => {
    // If user already submitted manually, skip any auto-submit behavior
    if (
      hasUserSubmittedRef.current ||
      (answers[currentQuestion] && answers[currentQuestion].answer)
    ) {
      return;
    }
    if (
      timer === 0 &&
      !isTimerRunning &&
      hasActiveCountdownRef.current &&
      !hasAutoSubmittedRef.current
    ) {
      hasAutoSubmittedRef.current = true;

      const performAutoSubmit = async () => {
        const question = questions[currentQuestion];
        if (!question) return;

        const trimmed = (currentAnswer || "").trim();

        // If candidate typed something, submit and evaluate just like manual flow
        if (trimmed) {
          setIsSubmitting(true);
          setCurrentAnswer("");

          setMessages((prev) => [
            ...prev,
            { type: "answer", content: trimmed, timestamp: Date.now() },
          ]);

          // Record provisional submit (score 0) immediately
          onAnswerSubmit(currentQuestion, trimmed, 0, question.difficulty);

          setIsEvaluating(true);
          try {
            const evaluation = await evaluateAnswer(
              question.text,
              trimmed,
              question.difficulty
            );

            setIsEvaluating(false);
            setMessages((prev) => [
              ...prev,
              {
                type: "evaluation",
                content: `Score: ${evaluation.score}/10`,
                score: evaluation.score,
                timestamp: Date.now(),
              },
            ]);

            // Update with actual score
            onAnswerSubmit(
              currentQuestion,
              trimmed,
              evaluation.score,
              question.difficulty
            );
            setTimeout(() => {
              onNextQuestion();
              setIsSubmitting(false);
              hasAutoSubmittedRef.current = false;
              hasActiveCountdownRef.current = false;
            }, 2000);
          } catch (error) {
            console.error("Error evaluating answer:", error);
            setIsEvaluating(false);
            toast.error(
              "Failed to evaluate answer. Proceeding to next question."
            );
            setTimeout(() => {
              onNextQuestion();
              setIsSubmitting(false);
              hasAutoSubmittedRef.current = false;
              hasActiveCountdownRef.current = false;
            }, 2000);
          }
        } else {
          // No typed answer
          onAnswerSubmit(
            currentQuestion,
            "No answer provided",
            0,
            question.difficulty
          );

          setMessages((prev) => [
            ...prev,
            {
              type: "evaluation",
              content: "Time's up! Score: 0/10",
              score: 0,
              timestamp: Date.now(),
            },
          ]);

          toast("Time's up!");

          setTimeout(() => {
            onNextQuestion();
            hasAutoSubmittedRef.current = false;
            hasActiveCountdownRef.current = false;
          }, 2000);
        }
      };

      performAutoSubmit();
    }
  }, [
    timer,
    isTimerRunning,
    currentQuestion,
    questions,
    currentAnswer,
    onAnswerSubmit,
    onNextQuestion,
  ]);

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    hasUserSubmittedRef.current = true;
    const answer = currentAnswer.trim();
    setCurrentAnswer("");

    setMessages((prev) => [
      ...prev,
      {
        type: "answer",
        content: answer,
        timestamp: Date.now(),
      },
    ]);

    // Stop timer immediately when answer is submitted
    onAnswerSubmit(
      currentQuestion,
      answer,
      0,
      questions[currentQuestion].difficulty
    );

    // Show typing indicator while AI evaluates
    setIsEvaluating(true);

    try {
      const question = questions[currentQuestion];
      const evaluation = await evaluateAnswer(
        question.text,
        answer,
        question.difficulty
      );

      setIsEvaluating(false);

      setMessages((prev) => [
        ...prev,
        {
          type: "evaluation",
          content: `Score: ${evaluation.score}/10`,
          score: evaluation.score,
          timestamp: Date.now(),
        },
      ]);

      // Update the answer with the actual score
      onAnswerSubmit(
        currentQuestion,
        answer,
        evaluation.score,
        question.difficulty
      );

      // Show success toast
      toast.success(`Answer submitted! Score: ${evaluation.score}/10`);

      setTimeout(() => {
        // onNextQuestion();
        // setIsSubmitting(false);
        if (currentQuestion + 1 >= questions.length) {
          onNextQuestion(true);
        } else {
          onNextQuestion();
        }
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setIsEvaluating(false);
      toast.error("Failed to evaluate answer. Please try again.");
      // Answer was already submitted with score 0, no need to submit again
      setTimeout(() => {
        onNextQuestion();
        setIsSubmitting(false);
      }, 2000);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "hard":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[400px] sm:h-[500px] md:h-[600px] flex flex-col">
      <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 flex-shrink-0 gap-2">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          {(!answers[currentQuestion] ||
            typeof answers[currentQuestion]?.answer === "undefined") && (
            <div className="flex items-center gap-2">
              <FiClock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span
                className={`font-mono text-xs sm:text-sm md:text-base ${
                  timer <= 10 ? "text-red-600" : ""
                }`}
              >
                {formatTime(timer)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4 min-h-0 pr-1 sm:pr-2">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "answer" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                    message.type === "question"
                      ? "bg-primary text-primary-foreground"
                      : message.type === "answer"
                      ? "bg-secondary"
                      : "bg-muted"
                  }`}
                >
                  {message.type === "question" && (
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <span
                        className={`text-xs font-medium ${getDifficultyColor(
                          message.difficulty
                        )}`}
                      >
                        {message.difficulty.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {message.score && (
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <FiCheckCircle className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        Score: {message.score}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isEvaluating && (
              <div className="flex justify-start">
                <TypingIndicator message="AI is evaluating your answer..." />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {currentQuestion < questions.length && (
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] max-h-[150px] sm:max-h-[200px] p-2 sm:p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm md:text-base bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || isSubmitting}
              className="self-end sm:self-end w-full sm:w-auto text-xs sm:text-sm"
            >
              <FiSend className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="sm:hidden">Submit</span>
              <span className="hidden sm:inline">Submit Answer</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewChat;
