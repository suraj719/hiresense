import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  FiArrowLeft,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiShare2,
} from "react-icons/fi";

const CandidateDetail = ({ candidate, onBack }) => {
  if (!candidate) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  const handleShare = () => {
    toast.success("Share feature coming soon!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{candidate.name}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {candidate.email} • {candidate.phone}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 sm:flex-none"
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 sm:flex-none"
          >
            <FiShare2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiStar className="h-5 w-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">
                {candidate.finalScore}/60
              </div>
              <Progress
                value={(candidate.finalScore / 60) * 100}
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                {((candidate.finalScore / 60) * 100).toFixed(1)}% Performance
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">AI Summary</h4>
              <p className="text-sm">{candidate.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiClock className="h-5 w-5" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium">
                  {new Date(candidate.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-medium">
                  {candidate.answers?.length || 0}/6
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Question Breakdown</h4>
              <div className="space-y-2">
                {candidate.answers?.map((answer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">Q{index + 1}</span>
                    <span
                      className={`text-sm font-medium ${getScoreColor(
                        answer.score
                      )}`}
                    >
                      {answer.score}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {candidate.answers?.map((answer, index) => {
              const question = candidate.questions?.[index];
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Question {index + 1}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        answer.difficulty || question?.difficulty || "medium"
                      )}`}
                    >
                      {(answer.difficulty || question?.difficulty || "medium")
                        .charAt(0)
                        .toUpperCase() +
                        (
                          answer.difficulty ||
                          question?.difficulty ||
                          "medium"
                        ).slice(1)}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <FiCheckCircle className="h-4 w-4" />
                      <span
                        className={`font-medium ${getScoreColor(answer.score)}`}
                      >
                        {answer.score}/10
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium text-primary mb-1">
                      Question:
                    </p>
                    <p className="text-sm">
                      {question?.text || "Question not available"}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Answer:</p>
                    <p className="text-sm mb-2">{answer.answer}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(answer.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateDetail;
