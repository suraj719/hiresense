const STORAGE_KEYS = {
  CANDIDATES: "hiresense_candidates",
  CURRENT_INTERVIEW: "hiresense_current_interview",
};

export const saveCandidates = (candidates) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  } catch (error) {
    console.error("Error saving candidates:", error);
  }
};

export const loadCandidates = () => {
  try {
    const candidates = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    return candidates ? JSON.parse(candidates) : [];
  } catch (error) {
    console.error("Error loading candidates:", error);
    return [];
  }
};

export const saveCurrentInterview = (interview) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_INTERVIEW,
      JSON.stringify(interview)
    );
  } catch (error) {
    console.error("Error saving current interview:", error);
  }
};


export const clearCurrentInterview = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INTERVIEW);
  } catch (error) {
    console.error("Error clearing current interview:", error);
  }
};
