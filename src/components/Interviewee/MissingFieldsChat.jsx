import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FiSend, FiUser, FiMail, FiPhone } from "react-icons/fi";

const MissingFieldsChat = ({
  missingFields,
  candidateInfo,
  onInfoComplete,
}) => {
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [collectedData, setCollectedData] = useState({
    name: candidateInfo?.name || "",
    email: candidateInfo?.email || "",
    phone: candidateInfo?.phone || "",
  });
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  const fieldConfig = {
    name: {
      label: "full name",
      icon: FiUser,
      placeholder: "Enter your full name",
      validation: (value) => value.trim().length > 0,
      errorMessage: "Please enter your full name",
    },
    email: {
      label: "email address",
      icon: FiMail,
      placeholder: "Enter your email address",
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      errorMessage: "Please enter a valid email address",
    },
    phone: {
      label: "phone number",
      icon: FiPhone,
      placeholder: "Enter your phone number",
      validation: (value) => value.trim().length > 0,
      errorMessage: "Please enter your phone number",
    },
  };

  // Initialize conversation
  useEffect(() => {
    if (missingFields.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;

      const welcomeMessage = {
        type: "bot",
        content: `Hi! I need to collect some additional information before we start your interview.`,
        timestamp: Date.now(),
      };

      setMessages([welcomeMessage]);

      // Start asking for the first missing field after a short delay
      setTimeout(() => {
        askForField(0);
      }, 1500);
    }
  }, [missingFields]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askForField = (fieldIndex) => {
    if (fieldIndex >= missingFields.length) {
      // All fields collected, show completion message
      const completionMessage = {
        type: "bot",
        content:
          "Perfect! I have all the information I need. Let me start preparing your personalized interview questions...",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, completionMessage]);

      // Complete the process after a short delay
      setTimeout(() => {
        onInfoComplete(collectedData);
      }, 2000);
      return;
    }

    // Prevent asking for the same field if we're already waiting for an answer
    if (isWaitingForAnswer && currentFieldIndex === fieldIndex) {
      return;
    }

    const field = missingFields[fieldIndex];
    const config = fieldConfig[field];

    const questionMessage = {
      type: "bot",
      content: `What is your ${config.label}?`,
      field: field,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, questionMessage]);
    setCurrentFieldIndex(fieldIndex);
    setIsWaitingForAnswer(true);
  };

  const handleSubmit = () => {
    if (!currentAnswer.trim() || !isWaitingForAnswer) return;

    const field = missingFields[currentFieldIndex];
    const config = fieldConfig[field];
    const answer = currentAnswer.trim();

    // Add user's answer to messages
    const userMessage = {
      type: "user",
      content: answer,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentAnswer("");

    // Validate the answer
    if (!config.validation(answer)) {
      const errorMessage = {
        type: "bot",
        content: config.errorMessage + ". Please try again:",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Save the answer
    setCollectedData((prev) => ({
      ...prev,
      [field]: answer,
    }));

    // Show confirmation
    const confirmMessage = {
      type: "bot",
      content: `Got it! Your ${config.label} is "${answer}".`,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, confirmMessage]);
    setIsWaitingForAnswer(false);

    // Ask for next field after a short delay
    setTimeout(() => {
      askForField(currentFieldIndex + 1);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFieldIcon = (field) => {
    const IconComponent = fieldConfig[field]?.icon;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[500px] sm:h-[600px] flex flex-col">
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold">Complete Your Profile</h3>
          <div className="text-sm text-muted-foreground">
            {currentFieldIndex + 1} of {missingFields.length} fields
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0 pr-2">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.field && (
                    <div className="flex items-center gap-2 mb-2">
                      {getFieldIcon(message.field)}
                      <span className="text-xs font-medium opacity-75">
                        {fieldConfig[message.field]?.label.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {isWaitingForAnswer && (
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                fieldConfig[missingFields[currentFieldIndex]]?.placeholder ||
                "Type your answer here..."
              }
              className="flex-1 min-h-[80px] sm:min-h-[100px] max-h-[200px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim()}
              className="self-end sm:self-end w-full sm:w-auto"
            >
              <FiSend className="h-4 w-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Send</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingFieldsChat;
