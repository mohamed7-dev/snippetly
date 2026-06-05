import { beforeAll, describe, expect, it } from "vitest";
import { createUserAgent } from "../../../tests/users";

describe("Friendship flow", () => {
  let userA: Awaited<ReturnType<typeof createUserAgent>>;
  let userB: Awaited<ReturnType<typeof createUserAgent>>;
  beforeAll(async () => {
    userA = await createUserAgent({ name: "alice" });
    userB = await createUserAgent({ name: "bob" });
    // A sends friend request to B
    await userA.agent
      .put(`/api/v1/users/add-friend/${userB.user.name}`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);
    // B sees inbox
    const inbox = await userB.agent
      .get(`/api/v1/users/current/inbox`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(200);
    expect(inbox.body.data.items[0].name).toBe("alice");
  });

  it("user A sends request, user B accepts", async () => {
    // B accepts request
    await userB.agent
      .put(`/api/v1/users/accept-friend/${userA.user.name}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(200);

    // A now sees B in friends list
    const friends = await userA.agent
      .get(`/api/v1/users/current/friends`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(friends.body.data.items.some((f: any) => f.name === "bob")).toBe(
      true
    );
  });

  it("user A sends request, user B rejects", async () => {
    // B rejects request
    await userB.agent
      .put(`/api/v1/users/reject-friend/${userA.user.name}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(200);

    // A now doesn't see B in friends list
    const friends = await userA.agent
      .get(`/api/v1/users/current/friends`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(friends.body.data.items.some((f: any) => f.name === "bob")).toBe(
      false
    );
  });

  it("user A sends request, user A cancels", async () => {
    // A cancels request
    await userA.agent
      .put(`/api/v1/users/cancel-friend/${userB.user.name}`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    // A now doesn't see B in friends list
    const friends = await userA.agent
      .get(`/api/v1/users/current/friends`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(friends.body.data.items.some((f: any) => f.name === "bob")).toBe(
      false
    );
  });
});
