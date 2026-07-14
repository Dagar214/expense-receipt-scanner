import { CATEGORY_COLORS } from "../utils/categories";

export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS["Others"];
  return (
    <span
      className="badge"
      style={{
        color,
        background: `${color}1a`,
        borderColor: `${color}40`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {category}
    </span>
  );
}
