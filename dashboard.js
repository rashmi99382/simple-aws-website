import { awsAuthConfig } from "./aws-config.js";

const tokenKey = "simplesite_auth_tokens";
const pictureKey = "simplesite_user_pictures";

const storedSession = localStorage.getItem(tokenKey);

if (!storedSession) {
  window.location.href = "login.html";
}

const session = storedSession ? JSON.parse(storedSession) : {};
const profile = session.profile || {};
const displayName = profile.name || profile.given_name || profile.email || "User";
const email = profile.email || "Email not available";
const avatar = document.querySelector("#profile-avatar");

document.querySelector("#profile-name").textContent = displayName;
document.querySelector("#profile-email").textContent = email;

if (profile.picture) {
  avatar.style.backgroundImage = `url("${profile.picture}")`;
  avatar.textContent = "";
} else {
  avatar.textContent = displayName.slice(0, 1).toUpperCase();
}

function loadPictures() {
  return JSON.parse(localStorage.getItem(pictureKey) || "[]");
}

function savePictures(pictures) {
  localStorage.setItem(pictureKey, JSON.stringify(pictures));
}

function renderPictures() {
  const grid = document.querySelector("#picture-grid");
  const pictures = loadPictures();

  if (!pictures.length) {
    grid.innerHTML = '<p class="empty-state">No pictures added yet.</p>';
    return;
  }

  grid.innerHTML = pictures
    .map((picture) => `<img src="${picture.dataUrl}" alt="${picture.name}">`)
    .join("");
}

document.querySelector("#picture-input")?.addEventListener("change", async (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
  const existing = loadPictures();
  const newPictures = await Promise.all(files.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    });
  }));

  savePictures([...newPictures, ...existing].slice(0, 12));
  renderPictures();
  event.target.value = "";
});

document.querySelector("#logout-button")?.addEventListener("click", () => {
  const config = awsAuthConfig || {};
  localStorage.removeItem(tokenKey);

  if (config.cognitoDomain && config.clientId && config.logoutUri) {
    const logoutUrl = new URL(`${config.cognitoDomain}/logout`);
    logoutUrl.searchParams.set("client_id", config.clientId);
    logoutUrl.searchParams.set("logout_uri", config.logoutUri);
    window.location.href = logoutUrl.toString();
    return;
  }

  window.location.href = "login.html";
});

renderPictures();
