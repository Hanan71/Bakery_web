import { Router, type IRouter } from "express";
import { eq, sql, avg, count, desc } from "drizzle-orm";
import { db, menuItemsTable, ratingsTable, categoriesTable } from "@workspace/db";
import {
  ListMenuItemsQueryParams,
  ListMenuItemsResponse,
  GetMenuItemParams,
  GetMenuItemResponse,
  RateMenuItemParams,
  RateMenuItemBody,
  RateMenuItemResponse,
  ListMenuItemRatingsParams,
  ListMenuItemRatingsResponse,
  GetMenuStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Helper: build a menu item with aggregated ratings and category name
async function fetchMenuItemWithStats(id: number) {
  const [item] = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      featured: menuItemsTable.featured,
      available: menuItemsTable.available,
      averageRating: sql<number>`coalesce(avg(${ratingsTable.stars}), 0)`,
      ratingCount: sql<number>`count(${ratingsTable.id})`,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .leftJoin(ratingsTable, eq(menuItemsTable.id, ratingsTable.menuItemId))
    .where(eq(menuItemsTable.id, id))
    .groupBy(menuItemsTable.id, categoriesTable.name);
  return item;
}

router.get("/menu-items", async (req, res): Promise<void> => {
  const params = ListMenuItemsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      featured: menuItemsTable.featured,
      available: menuItemsTable.available,
      averageRating: sql<number>`coalesce(avg(${ratingsTable.stars}), 0)`,
      ratingCount: sql<number>`count(${ratingsTable.id})`,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .leftJoin(ratingsTable, eq(menuItemsTable.id, ratingsTable.menuItemId))
    .groupBy(menuItemsTable.id, categoriesTable.name)
    .orderBy(menuItemsTable.name)
    .$dynamic();

  if (params.data.categoryId != null) {
    query = query.where(eq(menuItemsTable.categoryId, params.data.categoryId));
  }

  if (params.data.featured != null) {
    query = query.where(eq(menuItemsTable.featured, params.data.featured));
  }

  const items = await query;
  res.json(ListMenuItemsResponse.parse(items.map(i => ({
    ...i,
    price: parseFloat(i.price as unknown as string),
    averageRating: parseFloat(String(i.averageRating)),
    ratingCount: parseInt(String(i.ratingCount), 10),
  }))));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const paramsResult = GetMenuItemParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const item = await fetchMenuItemWithStats(paramsResult.data.id);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(GetMenuItemResponse.parse({
    ...item,
    price: parseFloat(item.price as unknown as string),
    averageRating: parseFloat(String(item.averageRating)),
    ratingCount: parseInt(String(item.ratingCount), 10),
  }));
});

router.post("/menu-items/:id/ratings", async (req, res): Promise<void> => {
  const paramsResult = RateMenuItemParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const bodyResult = RateMenuItemBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, paramsResult.data.id));
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const [rating] = await db.insert(ratingsTable).values({
    menuItemId: paramsResult.data.id,
    stars: bodyResult.data.stars,
    reviewerName: bodyResult.data.reviewerName,
    comment: bodyResult.data.comment ?? null,
  }).returning();

  res.status(201).json(RateMenuItemResponse.parse({
    ...rating,
    createdAt: rating.createdAt.toISOString(),
  }));
});

router.get("/menu-items/:id/ratings-list", async (req, res): Promise<void> => {
  const paramsResult = ListMenuItemRatingsParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const ratings = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.menuItemId, paramsResult.data.id))
    .orderBy(desc(ratingsTable.createdAt));

  res.json(ListMenuItemRatingsResponse.parse(ratings.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.get("/menu-stats", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalItems: count(menuItemsTable.id),
      totalCategories: sql<number>`count(distinct ${menuItemsTable.categoryId})`,
      averageRating: sql<number>`coalesce(avg(${ratingsTable.stars}), 0)`,
    })
    .from(menuItemsTable)
    .leftJoin(ratingsTable, eq(menuItemsTable.id, ratingsTable.menuItemId));

  const topRated = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      featured: menuItemsTable.featured,
      available: menuItemsTable.available,
      averageRating: sql<number>`coalesce(avg(${ratingsTable.stars}), 0)`,
      ratingCount: sql<number>`count(${ratingsTable.id})`,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .leftJoin(ratingsTable, eq(menuItemsTable.id, ratingsTable.menuItemId))
    .groupBy(menuItemsTable.id, categoriesTable.name)
    .orderBy(desc(sql`avg(${ratingsTable.stars})`))
    .limit(6);

  res.json(GetMenuStatsResponse.parse({
    totalItems: totals.totalItems,
    totalCategories: parseInt(String(totals.totalCategories), 10),
    averageRating: parseFloat(String(totals.averageRating)),
    topRatedItems: topRated.map(i => ({
      ...i,
      price: parseFloat(i.price as unknown as string),
      averageRating: parseFloat(String(i.averageRating)),
      ratingCount: parseInt(String(i.ratingCount), 10),
    })),
  }));
});

export default router;
