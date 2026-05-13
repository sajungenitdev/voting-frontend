"use client";

import {
  Squares2X2Icon,
  CpuChipIcon,
  TrophyIcon,
  BanknotesIcon,
  AcademicCapIcon,
  BeakerIcon,
  EllipsisHorizontalIcon,
  FilmIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { TbDeviceGamepad } from "react-icons/tb";

// Updated Category interface to use Icons instead of emojis
interface Category {
  id: string;
  name: string;
  icon: any;
}

const categories: Category[] = [
  { id: "all", name: "All", icon: Squares2X2Icon },
  { id: "technology", name: "Tech", icon: CpuChipIcon },
  { id: "politics", name: "Politics", icon: GlobeAltIcon },
  { id: "sports", name: "Sports", icon: TrophyIcon },
  { id: "entertainment", name: "Media", icon: FilmIcon },
  { id: "business", name: "Market", icon: BanknotesIcon },
  { id: "education", name: "Edu", icon: AcademicCapIcon },
  { id: "health", name: "Health", icon: BeakerIcon },
  { id: "gaming", name: "Gaming", icon: TbDeviceGamepad },
  { id: "other", name: "Misc", icon: EllipsisHorizontalIcon },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export default function CategoryFilter({
  selectedCategory,
  onSelect,
  categoryCounts = {},
}: CategoryFilterProps) {
  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-start gap-3 px-4 md:justify-center min-w-max">
        {categories.map((category) => {
          const isActive =
            selectedCategory === category.id ||
            (category.id === "all" && !selectedCategory);
          const count = categoryCounts[category.id] || 0;
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id === "all" ? "" : category.id)}
              className={`
                group relative flex items-center gap-2.5 px-5 py-2 rounded-xl text-sm font-semibold 
                transition-all duration-300 ease-out whitespace-nowrap
                ${
                  isActive
                    ? "text-white scale-105"
                    : "text-gray-500 hover:text-gray-300 bg-white/[0.02] border border-white/5 hover:border-white/10"
                }
              `}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-red-600 rounded-xl blur-[8px] opacity-40 animate-pulse" />
              )}

              {/* Button Body */}
              <div
                className={`
                relative z-10 flex items-center gap-2 px-1
                ${isActive ? "bg-red-600 px-4 py-2 -mx-5 -my-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]" : ""}
              `}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500 group-hover:text-red-500"} transition-colors`}
                />
                <span>{category.name}</span>

                {count > 0 && (
                  <span
                    className={`
                    ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-bold
                    ${isActive ? "bg-black/20 text-white" : "bg-white/5 text-gray-600"}
                  `}
                  >
                    {count}
                  </span>
                )}
              </div>

              {/* Bottom Border Accent for Non-Active */}
              {!isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500 transition-all duration-300 group-hover:w-1/2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
