import { SignupRequestDtoType } from "@snippetly/common/dto";
import request from "supertest";
import { app } from "../src";

type TestUserOptions = {
  email?: string;
  name?: string;
  password?: string;
};

export async function createUserAgent(opts: TestUserOptions = {}) {
  const agent = request.agent(app.app);

  const user = {
    email: opts.email ?? `user_${crypto.randomUUID()}@test.com`,
    password: opts.password ?? "StrongPass123!",
    name: opts.name ?? `user_${crypto.randomUUID()}`,
    acceptedPolicies: true,
  } satisfies SignupRequestDtoType;

  const signupRes = await agent
    .post("/api/v1/auth/signup")
    .send(user)
    .expect(201);

  return {
    agent,
    user: signupRes.body.data.user,
    accessToken: signupRes.body.data.accessToken,
    response: signupRes,
  };
}
