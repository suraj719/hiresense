import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FiPlay, FiRotateCcw, FiClock, FiUser } from "react-icons/fi";
import { formatTime } from "../../lib/timerUtils";

const WelcomeBackModal = ({
  isOpen,
  onResume,
  onRestart,
  candidateInfo,
  currentQuestion,
  totalQuestions,
  timeRemaining,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FiUser className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <p className="text-muted-foreground">
            Hi {candidateInfo?.name || "there"}, you have an interview in
            progress.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {totalQuestions || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? ((currentQuestion + 1) / totalQuestions) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiClock className="h-4 w-4" />
                <span>Time remaining: {formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={onResume} className="w-full">
              <FiPlay className="h-4 w-4 mr-2" />
              Resume Interview
            </Button>
            <Button onClick={onRestart} variant="outline" className="w-full">
              <FiRotateCcw className="h-4 w-4 mr-2" />
              Start Fresh
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your progress has been automatically saved
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeBackModal;
