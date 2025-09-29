import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import IntervieweeTab from "./components/Interviewee/IntervieweeTab";
import InterviewerTab from "./components/Interviewer/InterviewerTab";
import { ToastProvider } from "./components/ui/toast";
import { FiUser, FiUsers, FiSun, FiMoon, FiZap } from "react-icons/fi";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading HireSense...</p>
            </div>
          </div>
        }
        persistor={persistor}
      >
        <div className="min-h-screen bg-background transition-colors duration-300">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/15 dark:via-primary/10 dark:to-transparent mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4">
                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FiZap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2">
                      <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        HireSense
                      </h1>
                      <span className="text-xs sm:text-base text-muted-foreground sm:whitespace-nowrap">
                        AI-Powered Interview Assistant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Theme toggle with compact ribbon background */}
                <div className="relative z-10">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg border border-border bg-background/80 backdrop-blur hover:bg-muted transition-colors relative"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <FiSun className="h-5 w-5" />
                    ) : (
                      <FiMoon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="interviewee" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger
                  value="interviewee"
                  className="flex items-center gap-2"
                >
                  <FiUser className="h-4 w-4" />
                  Interviewee
                </TabsTrigger>
                <TabsTrigger
                  value="interviewer"
                  className="flex items-center gap-2"
                >
                  <FiUsers className="h-4 w-4" />
                  Interviewer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interviewee">
                <IntervieweeTab />
              </TabsContent>

              <TabsContent value="interviewer">
                <InterviewerTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <ToastProvider />
      </PersistGate>
    </Provider>
  );
}

export default App;
