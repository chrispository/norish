"use client";

import type { Selection } from "@heroui/react";
import { useRecipesFiltersContext } from "@/context/recipes-filters-context";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/16/solid";
import { Button, Dropdown, Label } from "@heroui/react";
import { useTranslations } from "next-intl";

import { SEARCH_FIELDS } from "@norish/shared/contracts";

/**
 * "Search in" as a button beside the search bar, so the fields a search looks
 * at are one tap away and write straight through, rather than waiting on the
 * Filters panel's Apply. The panel keeps its own copy of the same control.
 */
export default function SearchFieldDropdown() {
  const t = useTranslations("recipes.dashboard");
  const tFilters = useTranslations("common.filters");
  const { filters, toggleSearchField } = useRecipesFiltersContext();
  const label = tFilters("searchIn");

  // A press toggles exactly one item, so the changed field is whichever one
  // differs between the old and new selection. Routing it through
  // toggleSearchField keeps the rule that a search never covers no fields.
  const handleSelectionChange = (keys: Selection) => {
    const next = keys === "all" ? new Set<unknown>(SEARCH_FIELDS) : new Set<unknown>(keys);
    const toggled = SEARCH_FIELDS.find(
      (field) => next.has(field) !== filters.searchFields.includes(field)
    );

    if (toggled) {
      toggleSearchField(toggled);
    }
  };

  return (
    <Dropdown>
      <Button
        isIconOnly
        aria-label={label}
        className="shadow-field bg-field hover:bg-field-hover dark:bg-default dark:hover:bg-surface-tertiary relative h-12 w-12 border border-transparent"
        data-testid="search-field-dropdown"
        variant="tertiary"
      >
        <AdjustmentsHorizontalIcon className="size-4" />
      </Button>
      <Dropdown.Popover className="bg-overlay" placement="bottom end">
        <Dropdown.Menu
          aria-label={label}
          selectedKeys={new Set(filters.searchFields)}
          selectionMode="multiple"
          onSelectionChange={handleSelectionChange}
        >
          {SEARCH_FIELDS.map((field) => (
            <Dropdown.Item key={field} id={field} textValue={t(`searchFields.${field}`)}>
              <Dropdown.ItemIndicator />
              <Label>{t(`searchFields.${field}`)}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
