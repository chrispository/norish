"use client";

import { useTransition } from "react";
import { ChipButton } from "@/components/shared/chip-button";
import { useRecipesFiltersContext } from "@/context/recipes-filters-context";
import { useTagsQuery } from "@/hooks/config";
import { useTranslations } from "next-intl";

/**
 * Every recipe tag as a one-tap filter under the Library's search bar.
 *
 * A tap applies at once rather than waiting on the Filters panel's Apply, and
 * the chips always filter in OR mode: picking "Thai" then "Indian" reads as
 * "show me either", which is what a row of quick picks promises. The Filters
 * panel still owns AND mode for anyone who wants it.
 */
export default function TagFilterChips() {
  const t = useTranslations("common.filters");
  const { filters, setFilters } = useRecipesFiltersContext();
  const { tags: allTags, isLoading } = useTagsQuery();
  const [, startTransition] = useTransition();

  if (isLoading || allTags.length === 0) {
    return null;
  }

  const toggleTag = (tag: string) => {
    const nextTags = filters.searchTags.includes(tag)
      ? filters.searchTags.filter((selected) => selected !== tag)
      : [...filters.searchTags, tag];

    startTransition(() => setFilters({ searchTags: nextTags, filterMode: "OR" }));
  };

  return (
    <div aria-label={t("tags")} className="flex flex-wrap gap-2 px-1" role="group">
      {allTags.map((tag) => {
        const isSelected = filters.searchTags.includes(tag);

        return (
          <ChipButton
            key={tag}
            aria-pressed={isSelected}
            className={`h-8 shrink-0 cursor-pointer rounded-full border px-3 transition-colors select-none ${
              isSelected
                ? "border-accent"
                : "border-accent/60 text-muted hover:border-accent hover:text-foreground"
            }`}
            color={isSelected ? "accent" : "default"}
            data-tag-filter={tag}
            size="md"
            variant={isSelected ? "primary" : "tertiary"}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </ChipButton>
        );
      })}
    </div>
  );
}
