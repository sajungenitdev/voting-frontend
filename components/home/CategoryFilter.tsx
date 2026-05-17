"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCategories } from "@/store/slices/categorySlice";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
}

function CategoryFilterComponent({
  selectedCategory,
  onSelect,
  categoryCounts = {},
}: CategoryFilterProps) {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error } = useAppSelector(
    (state) => state.categories,
  );
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Fetch categories on mount
  useEffect(() => {
    if (isInitialMount.current) {
      dispatch(fetchCategories());
      isInitialMount.current = false;
    }
  }, [dispatch]);

  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
        setTimeout(checkScrollPosition, 300);
      }
    },
    [checkScrollPosition],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && categories.length > 0) {
      checkScrollPosition();
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [categories, checkScrollPosition]);

  // Debug logging
  useEffect(() => {
    console.log("=== CategoryFilter Debug ===");
    console.log("Selected Category ID:", selectedCategory);
    console.log(
      "Categories from API:",
      categories.map((c) => ({ id: c._id, name: c.displayName })),
    );
    console.log("Category Counts:", categoryCounts);
  }, [selectedCategory, categories, categoryCounts]);

  if (isLoading) {
    return (
      <div className="w-full py-4">
        <div className="flex gap-3 px-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-4 text-center">
        <p className="mb-2 text-sm text-red-500">{error}</p>
        <button
          onClick={() => dispatch(fetchCategories())}
          className="text-sm font-medium text-red-500 hover:text-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const allCategories = [
    { _id: "", displayName: "All", name: "all", icon: "🍕", order: -1 },
    ...categories,
  ];

  const handleCategorySelect = (categoryId: string) => {
    console.log("=== Category Selected ===");
    console.log("Category ID being sent:", categoryId);
    console.log("Category ID type:", typeof categoryId);
    console.log("Is All?", categoryId === "");

    // Call the onSelect prop with the category ID
    onSelect(categoryId);
  };

  return (
    <div className="relative w-full py-4 group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-20 flex items-center justify-center transition-all duration-200 -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-lg w-9 h-9 dark:bg-gray-800 dark:border-gray-700 top-1/2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110"
          style={{ left: "-12px" }}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-20 flex items-center justify-center transition-all duration-200 -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-lg w-9 h-9 dark:bg-gray-800 dark:border-gray-700 top-1/2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110"
          style={{ right: "-12px" }}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Gradient Fades */}
      {showLeftArrow && (
        <div className="absolute top-0 bottom-0 left-0 z-10 w-12 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
      )}
      {showRightArrow && (
        <div className="absolute top-0 bottom-0 right-0 z-10 w-12 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 px-4 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allCategories.map((category) => {
          const isActive =
            selectedCategory === category._id ||
            (category._id === "" && !selectedCategory);
          const count = categoryCounts[category._id] || 0;

          return (
            <button
              key={category._id || "all"}
              onClick={() => handleCategorySelect(category._id)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
              }`}
            >
              <span className="text-base">{category.icon || "📋"}</span>
              <span>{category.displayName}</span>
              {count > 0 && (
                <span
                  className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CategoryFilterComponent);
