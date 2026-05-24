import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  resetPassword,
  signIn,
  signUp
} from "aws-amplify/auth";
import outputs from "./amplify_outputs.json";

const authMessage = document.querySelector("#auth-message");
const authForm = document.querySelector("#auth-form");
const codeField = document.querySelector("#code-field");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#submit-button");
const backLoginButton = document.querySelector("#back-login");
let mode = "login";

Amplify.configure(outputs);

function setMode(nextMode) {
  mode = nextMode;
  codeField.classList.toggle("hidden", !["confirm", "reset"].includes(mode));
  passwordInput.required = ["login", "signup", "reset"].includes(mode);
  backLoginButton.classList.toggle("hidden", mode === "login");

  const labels = {
    login: "Login",
    signup: "Create account",
    confirm: "Confirm account",
    forgot: "Send reset code",
    reset: "Set new password"
  };

  submitButton.textContent = labels[mode];
  authMessage.textContent = mode === "forgot"
    ? "Enter your email and AWS will send a password reset code."
    : "Login opens your dashboard. New users can create an account and confirm with the email code.";
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const password = passwordInput.value;
  const code = document.querySelector("#code").value.trim();

  try {
    submitButton.disabled = true;

    if (mode === "login") {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        window.location.href = "dashboard.html";
        return;
      }
      authMessage.textContent = "Confirm your account before logging in.";
      setMode("confirm");
      return;
    }

    if (mode === "signup") {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email }
        }
      });
      authMessage.textContent = "Account created. Check your email for the confirmation code.";
      setMode("confirm");
      return;
    }

    if (mode === "confirm") {
      await confirmSignUp({ username: email, confirmationCode: code });
      authMessage.textContent = "Account confirmed. You can login now.";
      setMode("login");
      return;
    }

    if (mode === "forgot") {
      await resetPassword({ username: email });
      authMessage.textContent = "Reset code sent. Enter the code and your new password.";
      setMode("reset");
      return;
    }

    if (mode === "reset") {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword: password });
      authMessage.textContent = "Password changed. You can login now.";
      setMode("login");
      return;
    }
  } catch (error) {
    authMessage.textContent = error.message || "Something went wrong. Try again.";
  } finally {
    submitButton.disabled = false;
  }
});
