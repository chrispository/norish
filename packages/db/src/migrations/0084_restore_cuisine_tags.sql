-- Restore the historical recipe Tags that 0037 moved onto Cuisines.
-- The migration audit retained the original recipe and tag name. It did not
-- retain tag ordering, so restored rows are appended alphabetically per recipe.
-- Recipes removed since 0037 are skipped; rerunning this migration is a no-op.
INSERT INTO "tags" ("name")
SELECT DISTINCT migration."tag_name"
FROM "cuisine_tag_migrations" AS migration
INNER JOIN "recipes" AS recipe ON recipe."id" = migration."recipe_id"
WHERE migration."tag_name" <> ''
ON CONFLICT DO NOTHING;--> statement-breakpoint
WITH restored AS (
	SELECT DISTINCT migration."recipe_id", tag."id" AS "tag_id", tag."name"
	FROM "cuisine_tag_migrations" AS migration
	INNER JOIN "recipes" AS recipe ON recipe."id" = migration."recipe_id"
	INNER JOIN "tags" AS tag ON lower(tag."name") = lower(migration."tag_name")
), missing AS (
	SELECT restored."recipe_id", restored."tag_id", restored."name"
	FROM restored
	WHERE NOT EXISTS (
		SELECT 1
		FROM "recipe_tags" AS existing
		WHERE existing."recipe_id" = restored."recipe_id"
			AND existing."tag_id" = restored."tag_id"
	)
)
INSERT INTO "recipe_tags" ("recipe_id", "tag_id", "order")
SELECT
	missing."recipe_id",
	missing."tag_id",
	(
		COALESCE(
			(SELECT MAX(existing."order") + 1 FROM "recipe_tags" AS existing WHERE existing."recipe_id" = missing."recipe_id"),
			0
		) + ROW_NUMBER() OVER (PARTITION BY missing."recipe_id" ORDER BY missing."name") - 1
	)::integer
FROM missing
ON CONFLICT DO NOTHING;
