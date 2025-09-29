import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCandidate,
  setSearchTerm,
  setSortBy,
  setSortOrder,
} from "../../store/slices/candidateSlice";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";
import { Card, CardContent } from "../ui/card";
import { FiUsers, FiTrendingUp, FiClock, FiBarChart } from "react-icons/fi";

const InterviewerTab = () => {
  const dispatch = useDispatch();
  const { candidates, selectedCandidate, searchTerm, sortBy, sortOrder } =
    useSelector((state) => state.candidates);

  const handleSearchChange = (term) => {
    dispatch(setSearchTerm(term));
  };

  const handleSortChange = (field, order) => {
    dispatch(setSortBy(field));
    dispatch(setSortOrder(order));
  };

  const handleCandidateSelect = (candidate) => {
    dispatch(setSelectedCandidate(candidate));
  };

  const handleBack = () => {
    dispatch(setSelectedCandidate(null));
  };

  const stats = {
    total: candidates.length,
    averageScore:
      candidates.length > 0
        ? (
            candidates.reduce((sum, c) => sum + c.finalScore, 0) /
            candidates.length
          ).toFixed(1)
        : 0,
    completedToday: candidates.filter((c) => {
      const today = new Date().toDateString();
      return new Date(c.completedAt).toDateString() === today;
    }).length,
  };

  if (selectedCandidate) {
    return (
      <CandidateDetail candidate={selectedCandidate} onBack={handleBack} />
    );
  }

  return (
    <div className="space-y-4 px-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FiBarChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Interview Dashboard</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage and review candidate interviews
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FiUsers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Candidates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiTrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.averageScore}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiClock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.completedToday}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CandidateList
        candidates={candidates}
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onCandidateSelect={handleCandidateSelect}
      />
    </div>
  );
};

export default InterviewerTab;
