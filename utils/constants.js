const medications = {
  1: { name: "Metformin", factor: 0.925 },
  2: { name: "Insulin", factor: 0.7 }
};

const jobTypes = {
  1: { name: "Sedentary", factor: 1.2 },
  2: { name: "Light Active", factor: 1.37 },
  3: { name: "Moderate Active", factor: 1.55 },
  4: { name: "Heavy Active", factor: 1.72 }
};

module.exports = { medications, jobTypes };