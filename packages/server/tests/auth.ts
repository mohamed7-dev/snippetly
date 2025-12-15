import { SignupRequestDtoType } from "@snippetly/common/dto";
import supertest from "supertest";

export async function createAndLoginUser(
  agent: supertest.SuperAgentTest,
  overrides?: Partial<{
    email: string;
    password: string;
    name: string;
  }>
) {
  const user = {
    email: overrides?.email ?? "test@example.com",
    password: overrides?.password ?? "StrongPass123!",
    name: overrides?.name ?? "test_user",
    acceptedPolicies: true,
  } satisfies SignupRequestDtoType;

  const signupRes = await agent
    .post("/api/v1/auth/signup")
    .send(user)
    .expect(201);

  return {
    token: signupRes.body.data.accessToken,
    user: signupRes.body.data.user,
  };
}
