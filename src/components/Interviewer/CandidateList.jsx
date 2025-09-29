import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FiSearch, FiStar, FiCalendar, FiUser } from "react-icons/fi";

const CandidateList = ({
  candidates,
  searchTerm,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortChange,
  onCandidateSelect,
}) => {
  const filteredCandidates = candidates
    .filter(
      (candidate) =>
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "completedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getScoreColor = (score) => {
    if (score >= 45) return "text-green-600";
    if (score >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 45) return "Excellent";
    if (score >= 30) return "Good";
    if (score >= 15) return "Fair";
    return "Needs Improvement";
  };

  const formatSubmittedAt = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString();
    const timeStr = d
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      .replace(":", ".");
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            onSortChange(field, order);
          }}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        >
          <option value="finalScore-desc">Score: High to Low</option>
          <option value="finalScore-asc">Score: Low to High</option>
          <option value="completedAt-desc">Date: Newest First</option>
          <option value="completedAt-asc">Date: Oldest First</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FiUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No candidates found matching your search."
                  : "No candidates yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold">
                        {candidate.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <FiStar className="h-4 w-4 text-yellow-500" />
                        <span
                          className={`font-bold text-sm sm:text-base ${getScoreColor(
                            candidate.finalScore
                          )}`}
                        >
                          {candidate.finalScore}/60
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          ({getScoreLabel(candidate.finalScore)})
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="break-all">{candidate.email}</span>
                      <span className="sm:hidden">{candidate.phone}</span>
                      <span className="hidden sm:inline">
                        {candidate.phone}
                      </span>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="h-3 w-3" />
                        <span>{formatSubmittedAt(candidate.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onCandidateSelect(candidate)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateList;
