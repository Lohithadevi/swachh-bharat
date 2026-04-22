// Default durations in days per issue type
const DURATIONS = {
  garbage: 4,
  streetlight: 3
};

const getDueDate = (issueType) => {
  const days = DURATIONS[issueType] || 3;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Generate unique complaint ID
const generateComplaintId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SB-${ts}-${rand}`;
};

module.exports = { getDueDate, generateComplaintId };
