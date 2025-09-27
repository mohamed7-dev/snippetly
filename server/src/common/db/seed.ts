import "dotenv/config";
import { Database } from "./index";
import { eq, and, inArray } from "drizzle-orm";
import { Logger } from "../logger/logger";
import { DefaultLogger } from "../logger/default-logger";
import { PasswordHashService } from "../../modules/auth/password-hash.service";

async function main() {
  // Ensure logger is initialized for standalone seed execution
  Logger.useLogger(new DefaultLogger());
  await Database.connect();
  const db = Database.client;
  const schema = await Database.getSchemas();

  const {
    usersTable,
    friendshipsTable,
    collectionsTable,
    snippetsTable,
    tagsTable,
    collectionsTagsTable,
    snippetsTagsTable,
  } = schema;

  const now = new Date();

  // 1) Users (unique on name and email)
  const PasswordService = new PasswordHashService();
  const usersSeed = [
    {
      name: "alice",
      firstName: "Alice",
      lastName: "Anderson",
      email: "alice@example.com",
      password: await PasswordService.hash("Password@12345678"),
      bio: "Frontend engineer who loves React.",
      image: null as string | null,
      imageCustomId: null as string | null,
      imageKey: null as string | null,
      acceptedPolicies: true,
      emailVerifiedAt: now,
      refreshTokens: [],
      oldNames: [],
      rememberMe: false,
      isPrivate: false,
    },
    {
      name: "bob",
      firstName: "Bob",
      lastName: "Brown",
      email: "bob@example.com",
      password: await PasswordService.hash("Password@12345678"),
      bio: "Backend enthusiast and database tinkerer.",
      image: null,
      imageCustomId: null,
      imageKey: null,
      acceptedPolicies: true,
      emailVerifiedAt: now,
      refreshTokens: [],
      oldNames: [],
      rememberMe: false,
      isPrivate: false,
    },
    {
      name: "carol",
      firstName: "Carol",
      lastName: "Clark",
      email: "carol@example.com",
      password: await PasswordService.hash("Password@12345678"),
      bio: "Full-stack dev. Typescript all the way.",
      image: null,
      imageCustomId: null,
      imageKey: null,
      acceptedPolicies: true,
      emailVerifiedAt: now,
      refreshTokens: [],
      oldNames: [],
      rememberMe: false,
      isPrivate: false,
    },
  ];

  // Insert users (ignore if email exists)
  await db
    .insert(usersTable)
    .values(usersSeed)
    .onConflictDoNothing({ target: usersTable.email });

  // Map emails -> user records
  const users = await db
    .select()
    .from(usersTable)
    .where(
      inArray(
        usersTable.email,
        usersSeed.map((u) => u.email)
      )
    );
  const byEmail = new Map(users.map((u) => [u.email, u]));

  const alice = byEmail.get("alice@example.com")!;
  const bob = byEmail.get("bob@example.com")!;
  const carol = byEmail.get("carol@example.com")!;

  // 2) Friendships (unique composite requester/addressee + check no self)
  const friendshipsSeed = [
    {
      requesterId: alice.id,
      addresseeId: bob.id,
      status: "accepted" as const,
      acceptedAt: now,
    },
    {
      requesterId: bob.id,
      addresseeId: carol.id,
      status: "accepted" as const,
      acceptedAt: now,
    },
    {
      requesterId: alice.id,
      addresseeId: carol.id,
      status: "pending" as const,
    },
  ];
  await db
    .insert(friendshipsTable)
    .values(friendshipsSeed)
    .onConflictDoNothing({
      target: [friendshipsTable.requesterId, friendshipsTable.addresseeId],
    });

  // 3) Collections (unique slug)
  const collectionsSeed = [
    {
      title: "React Patterns",
      slug: "react-patterns",
      description: "Common React patterns and tips",
      color: "#2563eb",
      creatorId: alice.id,
      isPrivate: false,
      allowForking: true,
      oldSlugs: [],
    },
    {
      title: "SQL Tricks",
      slug: "sql-tricks",
      description: "Useful SQL snippets",
      color: "#16a34a",
      creatorId: bob.id,
      isPrivate: false,
      allowForking: true,
      oldSlugs: [],
    },
    {
      title: "TS Utilities",
      slug: "ts-utilities",
      description: "Handy TypeScript helpers",
      color: "#7c3aed",
      creatorId: carol.id,
      isPrivate: false,
      allowForking: true,
      oldSlugs: [],
    },
  ];

  await db
    .insert(collectionsTable)
    .values(collectionsSeed)
    .onConflictDoNothing({ target: collectionsTable.slug });

  const collections = await db
    .select()
    .from(collectionsTable)
    .where(
      inArray(
        collectionsTable.slug,
        collectionsSeed.map((c) => c.slug)
      )
    );
  const bySlug = new Map(collections.map((c) => [c.slug, c]));

  const reactPatterns = bySlug.get("react-patterns")!;
  const sqlTricks = bySlug.get("sql-tricks")!;
  const tsUtilities = bySlug.get("ts-utilities")!;

  // Optional fork: Bob forks React Patterns
  const forkedSlug = "react-patterns-fork-by-bob";
  await db
    .insert(collectionsTable)
    .values({
      title: "React Patterns (Fork)",
      slug: forkedSlug,
      description: "A fork of Alice's collection",
      color: "#2563eb",
      creatorId: bob.id,
      isPrivate: false,
      allowForking: true,
      forkedFrom: reactPatterns.id,
      oldSlugs: [],
    })
    .onConflictDoNothing({ target: collectionsTable.slug });

  // 4) Snippets (unique slug)
  const snippetsSeed = [
    {
      title: "UseEffect Cleanup",
      slug: "useeffect-cleanup",
      code: `useEffect(() => {\n  const id = setInterval(() => setTick((t) => t + 1), 1000);\n  return () => clearInterval(id);\n}, []);`,
      language: "tsx",
      description: "Pattern for cleanup in useEffect",
      note: null as string | null,
      isPrivate: false,
      allowForking: true,
      creatorId: alice.id,
      collectionId: reactPatterns.id,
      oldSlugs: [],
    },
    {
      title: "Postgres ILIKE",
      slug: "postgres-ilike",
      code: `SELECT * FROM users WHERE name ILIKE '%john%';`,
      language: "sql",
      description: "Case-insensitive search in Postgres",
      note: null,
      isPrivate: false,
      allowForking: true,
      creatorId: bob.id,
      collectionId: sqlTricks.id,
      oldSlugs: [],
    },
    {
      title: "Partial Type",
      slug: "ts-partial",
      code: `type Partial<T> = { [K in keyof T]?: T[K] }`,
      language: "ts",
      description: "Implementing Partial utility",
      note: null,
      isPrivate: false,
      allowForking: true,
      creatorId: carol.id,
      collectionId: tsUtilities.id,
      oldSlugs: [],
    },
  ];

  await db
    .insert(snippetsTable)
    .values(snippetsSeed)
    .onConflictDoNothing({ target: snippetsTable.slug });

  const snippets = await db
    .select()
    .from(snippetsTable)
    .where(
      inArray(
        snippetsTable.slug,
        snippetsSeed.map((s) => s.slug)
      )
    );
  const snippetBySlug = new Map(snippets.map((s) => [s.slug, s]));

  const useEffectCleanup = snippetBySlug.get("useeffect-cleanup")!;
  const postgresIlike = snippetBySlug.get("postgres-ilike")!;
  const tsPartial = snippetBySlug.get("ts-partial")!;

  // 5) Tags (unique name)
  const tagsSeed = [
    { name: "react", usageCount: 0, addedBy: alice.id },
    { name: "postgres", usageCount: 0, addedBy: bob.id },
    { name: "typescript", usageCount: 0, addedBy: carol.id },
    { name: "hooks", usageCount: 0, addedBy: alice.id },
  ];

  await db
    .insert(tagsTable)
    .values(tagsSeed)
    .onConflictDoNothing({ target: tagsTable.name });

  const tags = await db
    .select()
    .from(tagsTable)
    .where(
      inArray(
        tagsTable.name,
        tagsSeed.map((t) => t.name)
      )
    );
  const tagByName = new Map(tags.map((t) => [t.name, t]));

  // 6) Collection ↔ Tags join (idempotent by pre-check)
  const desiredCollectionTags: Array<{ collectionId: number; tagId: number }> =
    [
      { collectionId: reactPatterns.id, tagId: tagByName.get("react")!.id },
      { collectionId: reactPatterns.id, tagId: tagByName.get("hooks")!.id },
      { collectionId: sqlTricks.id, tagId: tagByName.get("postgres")!.id },
      { collectionId: tsUtilities.id, tagId: tagByName.get("typescript")!.id },
    ];

  // Filter out existing pairs to avoid duplicates (no unique constraint on table)
  for (const ct of desiredCollectionTags) {
    const existing = await db
      .select({ id: collectionsTagsTable.id })
      .from(collectionsTagsTable)
      .where(
        and(
          eq(collectionsTagsTable.collectionId, ct.collectionId),
          eq(collectionsTagsTable.tagId, ct.tagId)
        )
      );
    if (existing.length === 0) {
      await db.insert(collectionsTagsTable).values(ct);
    }
  }

  // 7) Snippet ↔ Tags join (idempotent by pre-check)
  const desiredSnippetTags: Array<{ snippetId: number; tagId: number }> = [
    { snippetId: useEffectCleanup.id, tagId: tagByName.get("react")!.id },
    { snippetId: useEffectCleanup.id, tagId: tagByName.get("hooks")!.id },
    { snippetId: postgresIlike.id, tagId: tagByName.get("postgres")!.id },
    { snippetId: tsPartial.id, tagId: tagByName.get("typescript")!.id },
  ];

  for (const st of desiredSnippetTags) {
    const existing = await db
      .select({ id: snippetsTagsTable.id })
      .from(snippetsTagsTable)
      .where(
        and(
          eq(snippetsTagsTable.snippetId, st.snippetId),
          eq(snippetsTagsTable.tagId, st.tagId)
        )
      );
    if (existing.length === 0) {
      await db.insert(snippetsTagsTable).values(st);
    }
  }

  console.log("Seed completed successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
