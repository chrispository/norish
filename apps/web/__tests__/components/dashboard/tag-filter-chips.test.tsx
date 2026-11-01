import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@testing-library/jest-dom";

import TagFilterChips from "@/components/dashboard/tag-filter-chips";

const setFilters = vi.fn();
const filtersState = {
  searchTags: [] as string[],
  filterMode: "AND" as "AND" | "OR",
};
const tagsState = {
  tags: ["Asian", "Breakfast", "Thai"],
  isLoading: false,
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/context/recipes-filters-context", () => ({
  useRecipesFiltersContext: () => ({ filters: filtersState, setFilters }),
}));

vi.mock("@/hooks/config", () => ({
  useTagsQuery: () => tagsState,
}));

vi.mock("@/components/shared/chip-button", () => ({
  ChipButton: ({
    children,
    onClick,
    color: _color,
    variant: _variant,
    size: _size,
    ...props
  }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("TagFilterChips", () => {
  beforeEach(() => {
    setFilters.mockClear();
    filtersState.searchTags = [];
    tagsState.tags = ["Asian", "Breakfast", "Thai"];
    tagsState.isLoading = false;
  });

  it("renders every tag as a pressable chip", () => {
    render(<TagFilterChips />);

    for (const tag of ["Asian", "Breakfast", "Thai"]) {
      expect(screen.getByRole("button", { name: tag })).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("adds a tag in OR mode on tap", () => {
    filtersState.searchTags = ["Asian"];
    render(<TagFilterChips />);

    fireEvent.click(screen.getByRole("button", { name: "Thai" }));

    expect(setFilters).toHaveBeenCalledWith({ searchTags: ["Asian", "Thai"], filterMode: "OR" });
  });

  it("removes a selected tag on tap", () => {
    filtersState.searchTags = ["Asian", "Thai"];
    render(<TagFilterChips />);

    expect(screen.getByRole("button", { name: "Asian" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Asian" }));

    expect(setFilters).toHaveBeenCalledWith({ searchTags: ["Thai"], filterMode: "OR" });
  });

  it("renders nothing while loading or when there are no tags", () => {
    tagsState.isLoading = true;
    const { container, rerender } = render(<TagFilterChips />);

    expect(container).toBeEmptyDOMElement();

    tagsState.isLoading = false;
    tagsState.tags = [];
    rerender(<TagFilterChips />);

    expect(container).toBeEmptyDOMElement();
  });
});
