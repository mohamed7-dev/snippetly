import { beforeAll, describe, expect, it } from "vitest";
import { createUserAgent } from "../../../tests/users";

describe("User API", () => {
  let userA: Awaited<ReturnType<typeof createUserAgent>>;
  let userB: Awaited<ReturnType<typeof createUserAgent>>;
  beforeAll(async () => {
    userA = await createUserAgent();
    userB = await createUserAgent();
  });
  it("updates user account", async () => {
    const res = await userA.agent
      .patch(`/api/v1/users`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({
        firstName: "updated first name",
        bio: "Updated bio",
      })
      .expect(200);

    expect(res.body.data.bio).toBe("Updated bio");
  });

  it("discover users", async () => {
    const res = await userA.agent
      .get(`/api/v1/users/discover`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it("gets current user info", async () => {
    const res = await userA.agent
      .get(`/api/v1/users/current`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(res.body.data.profile).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("stats");
  });

  it("gets current user dashboard", async () => {
    const res = await userA.agent
      .get(`/api/v1/users/current/dashboard`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.data.user).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("stats");
    expect(res.body.data).toHaveProperty("collections");
  });

  it("gets user profile by name", async () => {
    const res = await userA.agent
      .get(`/api/v1/users/${userB.user.name}`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.data.profile).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("stats");
    expect(res.body.data).toHaveProperty("friendshipInfo");
  });

  it("deletes current user account", async () => {
    const res = await userA.agent
      .delete(`/api/v1/users`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(res.body.data).toBeNull();
  });
});
