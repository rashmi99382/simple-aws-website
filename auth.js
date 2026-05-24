const authMessage = document.querySelector("#auth-message");
const googleLoginButton = document.querySelector("#google-login");
const emailLoginButton = document.querySelector("#email-login");
const forgotPasswordButton = document.querySelector("#forgot-password");

function buildCognitoUrl(path, extraParams = {}) {
  const config = window.awsAuthConfig || {};

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

function goToCognito(path, extraParams) {
  const destination = buildCognitoUrl(path, extraParams);

  if (!destination) {
    authMessage.textContent = "AWS Cognito is not configured yet. Fill aws-config.js after creating your Cognito user pool.";
    return;
  }

  window.location.href = destination;
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
