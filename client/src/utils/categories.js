export const CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Travel",
  "Shopping",
  "Utilities & Bills",
  "Entertainment",
  "Health",
  "Others",
];

export const CATEGORY_COLORS = {
  "Food & Dining": "#fb923c",
  "Groceries": "#34d399",
  "Travel": "#38bdf8",
  "Shopping": "#a78bfa",
  "Utilities & Bills": "#fbbf24",
  "Entertainment": "#fb7185",
  "Health": "#2dd4bf",
  "Others": "#94a3b8",
};

export const guessCategory = (text = "") => {
  const t = text.toLowerCase();
  const rules = [
    { category: "Food & Dining", keywords: ["restaurant", "cafe", "coffee", "diner", "food", "pizza", "kitchen", "bar", "grill"] },
    { category: "Groceries", keywords: ["mart", "grocery", "supermarket", "bazaar", "provision", "fresh"] },
    { category: "Travel", keywords: ["uber", "ola", "taxi", "airlines", "flight", "fuel", "petrol", "diesel", "railway", "metro", "cab"] },
    { category: "Shopping", keywords: ["mall", "store", "fashion", "apparel", "electronics", "shop", "retail"] },
    { category: "Utilities & Bills", keywords: ["electricity", "water bill", "internet", "broadband", "recharge", "utility", "gas bill"] },
    { category: "Entertainment", keywords: ["cinema", "movie", "multiplex", "theatre", "netflix", "spotify", "game"] },
    { category: "Health", keywords: ["pharmacy", "medical", "hospital", "clinic", "medicine", "drug", "health"] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.category;
  }
  return "Others";
};
