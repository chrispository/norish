"use client";

import { AdjustmentsHorizontalIcon, CheckIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { SEARCH_FIELDS } from "@norish/shared/contracts";

import { useRecipesFiltersContext } from "@/context/recipes-filters-context";

// ═══════════════════════════════════════════════════════════
// CUSTOM COMPONENT (not in upstream)
// Replaces the inline SearchFieldToggles that used to expand
// below the search bar on focus. Moved into a dropdown to
// keep the search area clean and make room for tag buttons.
// ═══════════════════════════════════════════════════════════
export default function SearchFieldDropdown() {
  const t = useTranslations("recipes.dashboard");
  const { filters, toggleSearchField } = useRecipesFiltersContext();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="Search fields"
          className="relative h-12 w-12 bg-default-100 hover:bg-default-200"
          radius="full"
          variant="flat"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Search fields" closeOnSelect={false}>
        {SEARCH_FIELDS.map((field) => {
          const isSelected = filters.searchFields.includes(field);

          return (
            <DropdownItem
              key={field}
              startContent={
                isSelected ? (
                  <CheckIcon className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4" />
                )
              }
              onPress={() => toggleSearchField(field)}
            >
              {t(`searchFields.${field}`)}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
