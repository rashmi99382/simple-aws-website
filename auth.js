import { awsAuthConfig } from "./aws-config.js";

const authMessage = document.querySelector("#auth-message");
const googleLoginButton = document.querySelector("#google-login");
const emailLoginButton = document.querySelector("#email-login");
const forgotPasswordButton = document.querySelector("#forgot-password");

const verifierKey = "simplesite_pkce_verifier";
const tokenKey = "simplesite_auth_tokens";

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  return crypto.subtle.digest("SHA-256", data);
}

function buildCognitoUrl(path, extraParams = {}) {
  const config = awsAuthConfig || {};

  if (!config.cognitoDomain || !config.clientId || !config.redirectUri) {
    return "";
  }

  const url = new URL(`${config.cognitoDomain.replace(/\/$/, "")}${path}`);
  const params = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType || "code",
    scope: config.scope || "openid email profile",
    ...extraParams
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function goToCognito(path, extraParams) {
  const verifier = randomString();
  const challenge = base64UrlEncode(await sha256(verifier));
  sessionStorage.setItem(verifierKey, verifier);

  const destination = buildCognitoUrl(path, extraParams);

  if (!destination) {
    authMessage.textContent = "AWS Cognito is not configured yet. Fill aws-config.js after creating your Cognito user pool.";
    return;
  }

  const url = new URL(destination);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  window.location.href = url.toString();
}

function parseJwt(token) {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decodeURIComponent(escape(json)));
}

async function exchangeCodeForTokens(code) {
  const config = awsAuthConfig || {};
  const verifier = sessionStorage.getItem(verifierKey);

  if (!verifier) {
    authMessage.textContent = "Login session expired. Please try signing in again.";
    return;
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier
  });

  const response = await fetch(`${config.cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    authMessage.textContent = "Could not finish login. Check the Cognito app client callback URL and OAuth settings.";
    return;
  }

  const tokens = await response.json();
  const profile = tokens.id_token ? parseJwt(tokens.id_token) : {};
  localStorage.setItem(tokenKey, JSON.stringify({ ...tokens, profile }));
  sessionStorage.removeItem(verifierKey);
  window.location.href = "dashboard.html";
}

googleLoginButton?.addEventListener("click", () => {
  goToCognito("/oauth2/authorize", { identity_provider: "Google" });
});

emailLoginButton?.addEventListener("click", () => {
  goToCognito("/login");
});

forgotPasswordButton?.addEventListener("click", () => {
  goToCognito("/forgotPassword");
});

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (code) {
  authMessage.textContent = "Finishing login...";
  exchangeCodeForTokens(code);
}
