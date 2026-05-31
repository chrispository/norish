"use client";

import { Chip } from "@heroui/react";

import { useRecipesFiltersContext } from "@/context/recipes-filters-context";
import { useTagsQuery } from "@/hooks/config";

interface TagFilterButtonsProps {
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// CUSTOM COMPONENT (not in upstream)
// Displays all recipe tags as clickable chips directly below
// the search bar for one-tap filtering. Intentionally kept
// separate from upstream filter panel so merges don't drop it.
// ═══════════════════════════════════════════════════════════
export default function TagFilterButtons({ className = "" }: TagFilterButtonsProps) {
  const { filters, setFilters } = useRecipesFiltersContext();
  const { tags: allTags, isLoading } = useTagsQuery();

  const toggleTag = (tag: string) => {
    const hasTag = filters.searchTags.includes(tag);
    const nextTags = hasTag ? filters.searchTags.filter((t) => t !== tag) : [...filters.searchTags, tag];

    // CUSTOM: tag buttons always use OR mode so multi-select feels intuitive
    setFilters({ searchTags: nextTags, filterMode: "OR" });
  };

  if (isLoading || allTags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allTags.map((tag) => {
        const isSelected = filters.searchTags.includes(tag);

        return (
          <Chip
            key={tag}
            className={`cursor-pointer select-none ${!isSelected ? "border border-primary" : ""}`}
            color={isSelected ? "primary" : "default"}
            radius="full"
            size="md"
            variant={isSelected ? "solid" : "flat"}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Chip>
        );
      })}
    </div>
  );
}
