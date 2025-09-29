import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FiUpload, FiFileText, FiX, FiCheckCircle } from "react-icons/fi";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractCandidateInfo,
  getMissingFields,
} from "../../services/resumeParser";

const ResumeUpload = ({
  onResumeProcessed,
  onMissingFields,
  missingFields = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const processFile = async (file) => {
    setIsProcessing(true);
    const loadingToast = toast.loading("Processing your resume with AI...");

    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file type");
      }

      // If text extraction failed or returned empty, create a fallback
      if (!text || text.trim().length === 0) {
        console.log("Text extraction failed, using fallback");
        toast.error(
          "Could not extract text from resume. Please enter your information manually.",
          { id: loadingToast }
        );
        const fallbackInfo = {
          name: "",
          email: "",
          phone: "",
        };
        setUploadedFile(file);
        onResumeProcessed(fallbackInfo);
        onMissingFields(["name", "email", "phone"]);
        return;
      }

      const candidateInfo = await extractCandidateInfo(text);
      const missingFields = getMissingFields(candidateInfo);

      console.log("Missing fields:", missingFields);

      setUploadedFile(file);
      onResumeProcessed(candidateInfo);
      onMissingFields(missingFields);
    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error(
        "Failed to process resume. Please try again or enter information manually.",
        { id: loadingToast }
      );
      // Even if parsing fails, allow user to continue with manual input
      const fallbackInfo = {
        name: "",
        email: "",
        phone: "",
      };
      setUploadedFile(file);
      onResumeProcessed(fallbackInfo);
      onMissingFields(["name", "email", "phone"]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (
      file &&
      (file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    onResumeProcessed(null);
    onMissingFields([]);
    toast.success("Resume removed");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <FiUpload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF and DOCX files
            </p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <Button asChild disabled={isProcessing} aria-disabled={isProcessing}>
              <label htmlFor="resume-upload" className={`cursor-pointer ${isProcessing ? "pointer-events-none opacity-60" : ""}`}>
                {isProcessing ? "Processing..." : "Choose File"}
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <FiFileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <FiX className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing ? (
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Processing your resume...
                </p>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    Resume uploaded successfully!
                  </p>
                </div>
                {missingFields.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      AI extracted all information!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Preparing your personalized interview...
                    </p>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Please complete missing information below
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
