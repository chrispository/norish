"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { Input } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useDebounceValue } from "usehooks-ts";
import { isUrl } from "@norish/shared/lib/helpers";

import Filters from "../shared/filters";

// ═══════════════════════════════════════════════════════════
// CUSTOM: Tag filter buttons (not in upstream)
// Shows all tags as clickable chips under the search bar.
// ═══════════════════════════════════════════════════════════
import TagFilterButtons from "./tag-filter-buttons";

// ═══════════════════════════════════════════════════════════
// CUSTOM: Search field dropdown (not in upstream)
// Replaces the inline SearchFieldToggles that used to expand
// below the search input on focus. Moved to a dropdown so
// tag buttons can sit cleanly under the search bar.
// ═══════════════════════════════════════════════════════════
import SearchFieldDropdown from "./search-field-dropdown";

import { useRecipesFiltersContext } from "@/context/recipes-filters-context";
import { useRecipesContext } from "@/context/recipes-context";

export default function SearchInput() {
  const t = useTranslations("recipes.dashboard");
  const { filters, setFilters } = useRecipesFiltersContext();
  const { importRecipe } = useRecipesContext();
  const [inputValue, setInputValue] = useState(filters.rawInput);
  const [debouncedValue] = useDebounceValue(inputValue, 300);
  const skipNextDebounceRef = useRef(false);

  // Sync debounced value to filters (but skip when external sync happens)
  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;

      return;
    }
    // Don't trigger if it's a URL (handled immediately in handleChange)
    if (!isUrl(debouncedValue.trim())) {
      setFilters({ rawInput: debouncedValue.trim() });
    }
  }, [debouncedValue, setFilters]);

  // Sync external filter changes to input (e.g., from clear button elsewhere)
  useEffect(() => {
    if (filters.rawInput !== inputValue.trim()) {
      skipNextDebounceRef.current = true;
      setInputValue(filters.rawInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.rawInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const trimmedValue = rawValue.trim();

    // Handle URL imports immediately (no debounce)
    if (isUrl(trimmedValue)) {
      setInputValue("");
      setFilters({ rawInput: "" });
      void importRecipe(trimmedValue);
    } else {
      // Regular text - just update input, debounce handles filter sync
      setInputValue(rawValue);
    }
  };

  const hasFilters = filters.rawInput.trim().length > 0 || filters.searchTags.length > 0;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center gap-2">
        <Input
          isClearable
          classNames={{
            inputWrapper: "h-12",
            input: "text-[15px]",
          }}
          id="search-input"
          placeholder={t("searchPlaceholder")}
          radius="full"
          startContent={
            <MagnifyingGlassIcon
              className={`h-5 w-5 ${hasFilters ? "text-primary animate-pulse" : "text-default-400"}`}
            />
          }
          style={{ fontSize: "16px" }}
          value={inputValue}
          variant="flat"
          onChange={handleChange}
          onClear={() => {
            setInputValue("");
            setFilters({ rawInput: "" });
          }}
        />

        {/* CUSTOM: Search field selector dropdown (not in upstream) */}
        <SearchFieldDropdown />

        <Filters isGlass={false} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CUSTOM: Tag filter buttons (not in upstream)
          One-tap recipe tag filtering displayed under search bar.
          Keep this block during upstream merges.
          ═══════════════════════════════════════════════════════════ */}
      <TagFilterButtons />
    </div>
  );
}
