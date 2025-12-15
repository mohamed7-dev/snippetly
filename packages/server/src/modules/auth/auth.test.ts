import { REFRESH_TOKEN_COOKIE_KEY } from "@snippetly/common";
import { beforeAll, describe, expect, it } from "vitest";
import { createUserAgent } from "../../../tests/users";

describe("Auth API", () => {
  let accessToken: string;
  const payload = {
    name: "test_user",
    password: "Password@12345678",
  };
  let user: Awaited<ReturnType<typeof createUserAgent>>;
  beforeAll(async () => {
    user = await createUserAgent(payload);
  });
  it("registers a new user, and authenticate them", async () => {
    accessToken = user.accessToken;
    const cookies = user.response.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(user.user.name).toEqual("test_user");
    expect(user.accessToken).toBeDefined();

    // refresh token must be set
    expect(cookies).toBeDefined();
    expect(
      cookies?.some((c: string) => c.includes(REFRESH_TOKEN_COOKIE_KEY))
    ).toBe(true);
  });

  it("authenticates user", async () => {
    const res = await user.agent
      .put("/api/v1/auth/login")
      .send({
        name: payload.name,
        password: payload.password,
      })
      .expect(200);

    expect(res.body.type).toBe("success");
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;

    // refresh cookie again
    const cookies = res.headers["set-cookie"] as unknown as string[];
    // refresh token must be set
    expect(cookies).toBeDefined();
    expect(
      cookies.some((c: string) => c.includes(REFRESH_TOKEN_COOKIE_KEY))
    ).toBe(true);
  });

  it("refreshes token using http-only cookie", async () => {
    const res = await user.agent.put("/api/v1/auth/refresh").expect(200);

    expect(res.body.type).toBe("success");
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
  });

  it("authorizes user to access protected route", async () => {
    const res = await user.agent
      .get("/api/v1/users/current")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.profile.email).toBe(user.user.email);
  });

  it("logs user out and clears refresh cookie", async () => {
    const res = await user.agent
      .put("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const cookies = res.headers["set-cookie"] as unknown as string[];

    expect(cookies.includes("refreshToken")).toBe(false);
  });

  it("fails refresh after logout", async () => {
    await user.agent.put("/api/v1/auth/refresh").expect(401);
  });
});
