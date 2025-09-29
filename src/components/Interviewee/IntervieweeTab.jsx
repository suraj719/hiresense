import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  setCandidate,
  setMissingFields,
  updateCandidateInfo,
  startInterview,
  setQuestions,
  setAnswer,
  nextQuestion,
  setTimeLimit,
  startQuestionTimer,
  stopTimer,
  resetQuestionTimer,
  resumeQuestionTimer,
  completeInterview,
  resetInterview,
} from "../../store/slices/interviewSlice";
import { addCandidate } from "../../store/slices/candidateSlice";
import ResumeUpload from "./ResumeUpload";
import MissingFieldsChat from "./MissingFieldsChat";
import InterviewChat from "./InterviewChat";
import WelcomeBackModal from "./WelcomeBackModal";
import { generateQuestions, generateSummary } from "../../services/aiService";
import {
  getRemainingTime,
  getTimeLimitByDifficulty,
} from "../../lib/timerUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { FiCheckCircle, FiAward } from "react-icons/fi";
import { store } from "../../store";
const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const {
    currentCandidate,
    isInterviewActive,
    currentQuestion,
    questions,
    answers,
    questionStartTime,
    answerSubmitTime,
    timeLimit,
    isTimerRunning,
    interviewComplete,
    finalScore,
    summary,
    missingFields,
    isCollectingInfo,
  } = useSelector((state) => state.interview);

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [hasCheckedForResume, setHasCheckedForResume] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);

  // Timer effect - calculate remaining time from timestamps
  useEffect(() => {
    if (isTimerRunning && questionStartTime && timeLimit > 0) {
      const updateTimer = () => {
        const remaining = getRemainingTime(questionStartTime, timeLimit);
        setCurrentTimer(remaining);

        // Check if time has expired
        if (remaining <= 0) {
          dispatch(stopTimer());
        }
      };

      // Update immediately
      updateTimer();

      // Then update every second
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentTimer(0);
    }
  }, [questionStartTime, timeLimit, isTimerRunning, dispatch]);

  const handleAutoSubmit = () => {};

  // Check for saved interview state on mount and restore timer
  useEffect(() => {
    if (!hasCheckedForResume) {
      // Check if we have a saved interview state from Redux persist
      // Only show welcome back modal if interview is active and not completed
      if (isInterviewActive && questions.length > 0 && !interviewComplete) {
        // If we have a saved timer state, check if it's still valid
        if (questionStartTime && timeLimit > 0) {
          const remaining = getRemainingTime(questionStartTime, timeLimit);
          if (remaining > 0) {
            // Timer is still valid, resume it without resetting start time
            setCurrentTimer(remaining);
            dispatch(resumeQuestionTimer());
          } else {
            // Timer has expired, stop it and let the timer effect handle auto-submit
            dispatch(stopTimer());
            // Auto-submit immediately if time has expired
            setTimeout(() => {
              handleAutoSubmit();
            }, 100);
          }
        } else {
          // No timer state, start a new timer for current question
          initializeQuestionTimer();
        }
        setShowWelcomeBack(true);
      }
      setHasCheckedForResume(true);
    }
  }, [
    hasCheckedForResume,
    isInterviewActive,
    questions.length,
    interviewComplete,
    questionStartTime,
    timeLimit,
    dispatch,
    handleAutoSubmit,
  ]);

  // Auto-proceed to interview if all info is available and no missing fields
  useEffect(() => {
    if (
      currentCandidate &&
      missingFields.length === 0 &&
      !isCollectingInfo &&
      !isInterviewActive &&
      !isGeneratingQuestions &&
      hasCheckedForResume &&
      !interviewComplete
    ) {
      // Check if we have all required information
      const hasAllInfo =
        currentCandidate.name &&
        currentCandidate.email &&
        currentCandidate.phone;
      if (hasAllInfo) {
        startInterviewProcess();
      }
    }
  }, [
    currentCandidate,
    missingFields,
    isCollectingInfo,
    isInterviewActive,
    isGeneratingQuestions,
    hasCheckedForResume,
    interviewComplete,
  ]);

  const handleResumeProcessed = (candidateInfo) => {
    dispatch(setCandidate(candidateInfo));
  };

  const handleMissingFields = (fields) => {
    dispatch(setMissingFields(fields));
  };

  const handleInfoComplete = (info) => {
    dispatch(updateCandidateInfo(info));
    dispatch(setMissingFields([]));
    startInterviewProcess();
  };

  const startInterviewProcess = async () => {
    setIsGeneratingQuestions(true);

    try {
      const generatedQuestions = await generateQuestions(currentCandidate);
      dispatch(setQuestions(generatedQuestions));
      dispatch(startInterview());

      // Initialize timer after a short delay to ensure state is updated
      setTimeout(() => {
        initializeQuestionTimer();
      }, 100);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const initializeQuestionTimer = () => {
    // Ensure we have questions and current question index is valid
    if (!questions || questions.length === 0 || !questions[currentQuestion]) {
      return;
    }

    // If this question is already answered, do not (re)start the timer
    const existingAnswer = answers[currentQuestion];
    if (existingAnswer && typeof existingAnswer.answer !== "undefined") {
      return;
    }

    const question = questions[currentQuestion];
    const timeLimit = getTimeLimitByDifficulty(
      question?.difficulty || "medium"
    );

    // Only start a new timer if one isn't already running
    if (!isTimerRunning) {
      dispatch(setTimeLimit(timeLimit));
      dispatch(startQuestionTimer());
    }
  };

  const handleAnswerSubmit = (questionIndex, answer, score, difficulty) => {
    dispatch(setAnswer({ questionIndex, answer, score, difficulty }));
    dispatch(stopTimer());
  };

  const handleNextQuestion = (forceComplete = false) => {
    dispatch(stopTimer());
    dispatch(resetQuestionTimer());
    // If moving past the last question, set loader state before marking complete
    // const isLastQuestion = currentQuestion + 1 >= questions.length;
    // if (isLastQuestion) {
    // setIsGeneratingSummary(true);
    // completeInterviewProcess(); // don’t advance index
    // } else {
    // dispatch(nextQuestion());
    // }
    const isLastQuestion = currentQuestion + 1 >= questions.length;
    if (isLastQuestion || forceComplete) {
      setIsGeneratingSummary(true);
      completeInterviewProcess(); // safe, answer already in Redux
    } else {
      dispatch(nextQuestion());
    }
  };

  // Start timer whenever the current question changes (only for new questions, not restored ones)
  useEffect(() => {
    if (
      isInterviewActive &&
      questions.length > 0 &&
      currentQuestion < questions.length &&
      questions[currentQuestion] && // Ensure the current question exists
      hasCheckedForResume // Only start timer after we've checked for resume
    ) {
      // Only start a new timer if we don't already have one running
      // Also, do not start if the current question already has an answer
      const existingAnswer = answers[currentQuestion];
      const isAnswered =
        existingAnswer && typeof existingAnswer.answer !== "undefined";
      if ((!isTimerRunning || !questionStartTime) && !isAnswered) {
        // Add a small delay to ensure the question is properly set
        setTimeout(() => {
          initializeQuestionTimer();
        }, 100);
      }
    }
  }, [
    currentQuestion,
    isInterviewActive,
    questions.length,
    questions, // Add questions as dependency to ensure we react to question changes
    hasCheckedForResume,
    isTimerRunning,
    questionStartTime,
    answers,
  ]);

  const completeInterviewProcess = async () => {
    setIsGeneratingSummary(true);
    const loadingToast = toast.loading("Generating your interview summary...");

    try {
      // Read latest state from Redux store
      const { answers, questions, currentCandidate } =
        store.getState().interview;

      const normalizedAnswers = questions.map((q, idx) => {
        return (
          answers[idx] || {
            answer: "No answer provided",
            score: 0,
            difficulty: q.difficulty,
            timestamp: Date.now(),
          }
        );
      });

      const summaryData = await generateSummary(
        currentCandidate,
        normalizedAnswers
      );
      const totalScore = normalizedAnswers.reduce(
        (sum, answer) => sum + (answer?.score || 0),
        0
      );

      dispatch(
        completeInterview({
          score: totalScore,
          summary: summaryData.summary,
        })
      );

      const candidateData = {
        id: Date.now().toString(),
        ...currentCandidate,
        questions,
        answers: normalizedAnswers,
        finalScore: totalScore,
        summary: summaryData.summary,
        completedAt: new Date().toISOString(),
      };

      dispatch(addCandidate(candidateData));
      toast.success("Interview completed successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error completing interview:", error);
      toast.error("Failed to generate summary. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleResumeInterview = () => {
    setShowWelcomeBack(false);
    toast.success("Welcome back!!");
  };

  const handleRestartInterview = () => {
    if (
      window.confirm(
        "Are you sure you want to start a new interview? This will clear your current progress."
      )
    ) {
      dispatch(resetInterview());
      setShowWelcomeBack(false);
    }
  };

  const handleStartNewInterview = () => {
    dispatch(resetInterview());
  };

  // Global loading screen when generating summary, regardless of completion view timing
  if (isGeneratingSummary) {
      return (
        <>
          <WelcomeBackModal
            isOpen={showWelcomeBack}
            onResume={handleResumeInterview}
            onRestart={handleRestartInterview}
            candidateInfo={currentCandidate}
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            timeRemaining={currentTimer}
          />

          <div
            className={`max-w-2xl mx-auto space-y-4 px-4 ${
              showWelcomeBack ? "hidden" : ""
            }`}
          >
            <Card>
              <CardContent className="p-4 sm:p-6 text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Generating Your Summary
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    AI is analyzing your responses...
                  </p>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4 mx-auto" />
                  <Skeleton className="h-2 w-1/2 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
  }

  if (interviewComplete) {
    return (
      <>
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onResume={handleResumeInterview}
          onRestart={handleRestartInterview}
          candidateInfo={currentCandidate}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          timeRemaining={currentTimer}
        />

        <div
          className={`max-w-2xl mx-auto space-y-4 px-4 ${
            showWelcomeBack ? "hidden" : ""
          }`}
        >
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <FiAward className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Interview Complete!
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Congratulations on completing your interview
              </p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  {finalScore}/60
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Final Score
                </p>
                <Progress value={(finalScore / 60) * 100} className="h-3" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {((finalScore / 60) * 100).toFixed(1)}% Performance
                </p>
              </div>

              <div className="bg-muted p-4 sm:p-6 rounded-lg border">
                <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  AI Summary
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed">{summary}</p>
              </div>

              <Button
                onClick={handleStartNewInterview}
                className="w-full text-sm sm:text-base"
              >
                Start New Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isCollectingInfo) {
    return (
      <>
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onResume={handleResumeInterview}
          onRestart={handleRestartInterview}
          candidateInfo={currentCandidate}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          timeRemaining={currentTimer}
        />

        <div
          className={`max-w-2xl mx-auto space-y-4 px-4 ${
            showWelcomeBack ? "hidden" : ""
          }`}
        >
          <MissingFieldsChat
            missingFields={missingFields}
            candidateInfo={currentCandidate}
            onInfoComplete={handleInfoComplete}
          />
        </div>
      </>
    );
  }

  if (isInterviewActive && questions.length > 0) {
    return (
      <>
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onResume={handleResumeInterview}
          onRestart={handleRestartInterview}
          candidateInfo={currentCandidate}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          timeRemaining={currentTimer}
        />

        <div
          className={`max-w-4xl mx-auto space-y-4 px-4 ${
            showWelcomeBack ? "hidden" : ""
          }`}
        >
          {/* Progress Bar */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Progress</span>
                  <span>
                    {currentQuestion + 1} of {questions.length} questions
                  </span>
                </div>
                <Progress
                  value={((currentQuestion + 1) / questions.length) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <InterviewChat
            questions={questions}
            currentQuestion={currentQuestion}
            onAnswerSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
            timer={currentTimer}
            isTimerRunning={isTimerRunning}
            onAutoSubmit={handleAutoSubmit}
            answers={answers}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <WelcomeBackModal
        isOpen={showWelcomeBack}
        onResume={handleResumeInterview}
        onRestart={handleRestartInterview}
        candidateInfo={currentCandidate}
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        timeRemaining={currentTimer}
      />

      <div
        className={`max-w-2xl mx-auto space-y-4 px-4 ${
          showWelcomeBack ? "hidden" : ""
        }`}
      >
        {isGeneratingQuestions ? (
          <Card>
            <CardContent className="p-4 sm:p-6 text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  Preparing Your Interview
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  AI is generating personalized questions...
                </p>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4 mx-auto" />
                <Skeleton className="h-2 w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Welcome to Your Interview
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Upload your resume to get started with the AI-powered interview
                process
              </p>
            </div>

            <ResumeUpload
              onResumeProcessed={handleResumeProcessed}
              onMissingFields={handleMissingFields}
              missingFields={missingFields}
            />
          </>
        )}
      </div>
    </>
  );
};

export default IntervieweeTab;
