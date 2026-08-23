import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "../../../../src/auth.ts";

export const runtime = "nodejs";

export const { GET, POST } =
  toNextJsHandler(auth);