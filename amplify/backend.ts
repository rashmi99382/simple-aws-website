import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.ts";
import { storage } from "./storage/resource.ts";

defineBackend({
  auth,
  storage
});
