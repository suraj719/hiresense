import { createSlice } from "@reduxjs/toolkit";
import {
  saveCurrentInterview,
  clearCurrentInterview,
} from "../../services/localStorage";

const initialState = {
  currentCandidate: null,
  isInterviewActive: false,
  currentQuestion: 0,
  questions: [],
  answers: [],
  questionStartTime: null,
  answerSubmitTime: null,
  timeLimit: 0,
  isTimerRunning: false,
  interviewComplete: false,
  finalScore: 0,
  summary: "",
  missingFields: [],
  isCollectingInfo: false,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    setCandidate: (state, action) => {
      state.currentCandidate = action.payload;
    },
    setMissingFields: (state, action) => {
      state.missingFields = action.payload;
      state.isCollectingInfo = action.payload.length > 0;
    },
    updateCandidateInfo: (state, action) => {
      if (state.currentCandidate) {
        state.currentCandidate = {
          ...state.currentCandidate,
          ...action.payload,
        };
      }
    },
    startInterview: (state) => {
      state.isInterviewActive = true;
      state.isCollectingInfo = false;
      state.currentQuestion = 0;
      state.answers = [];
      state.interviewComplete = false;
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setAnswer: (state, action) => {
      const { questionIndex, answer, score, difficulty } = action.payload;
      state.answers[questionIndex] = {
        answer,
        score,
        difficulty,
        timestamp: Date.now(),
      };
      state.answerSubmitTime = Date.now();
    },
    nextQuestion: (state) => {
      state.currentQuestion += 1;
      if (state.currentQuestion >= state.questions.length) {
        state.interviewComplete = true;
        state.isInterviewActive = false;
      }
    },
    setTimeLimit: (state, action) => {
      state.timeLimit = action.payload;
    },
    startQuestionTimer: (state) => {
      state.questionStartTime = Date.now();
      state.answerSubmitTime = null;
      state.isTimerRunning = true;
    },
    stopTimer: (state) => {
      state.isTimerRunning = false;
    },
    resetQuestionTimer: (state) => {
      state.questionStartTime = null;
      state.answerSubmitTime = null;
      state.isTimerRunning = false;
    },
    resumeQuestionTimer: (state) => {
      // Resume timer without resetting the start time
      state.isTimerRunning = true;
    },
    completeInterview: (state, action) => {
      state.interviewComplete = true;
      state.isInterviewActive = false;
      state.finalScore = action.payload.score;
      state.summary = action.payload.summary;
    },
    resetInterview: (state) => {
      return { ...initialState };
    },
  },
});

export const {
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
} = interviewSlice.actions;

// Middleware to auto-save interview state to localStorage
const interviewMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only save if it's an interview action and interview is active
  if (
    action.type.startsWith("interview/") &&
    store.getState().interview.isInterviewActive
  ) {
    const interviewState = store.getState().interview;
    saveCurrentInterview(interviewState);
  }

  // Clear localStorage when interview is reset
  if (action.type === "interview/resetInterview") {
    clearCurrentInterview();
  }

  return result;
};

export { interviewMiddleware };
export default interviewSlice.reducer;
