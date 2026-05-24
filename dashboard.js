import { Amplify } from "aws-amplify";
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signOut } from "aws-amplify/auth";
import { getUrl, list, uploadData } from "aws-amplify/storage";
import outputs from "./amplify_outputs.json";

Amplify.configure(outputs);

const avatar = document.querySelector("#profile-avatar");
const pictureGrid = document.querySelector("#picture-grid");

async function loadProfile() {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const displayName = attributes.name || attributes.email || user.username || "User";
    const email = attributes.email || "Email not available";

    document.querySelector("#profile-name").textContent = displayName;
    document.querySelector("#profile-email").textContent = email;
    avatar.textContent = displayName.slice(0, 1).toUpperCase();
  } catch (error) {
    window.location.href = "login.html";
  }
}

async function renderPictures() {
  pictureGrid.innerHTML = '<p class="empty-state">Loading pictures...</p>';

  try {
    await getCurrentUser();
    const result = await list({
      path: ({ identityId }) => `profile-pictures/${identityId}/`
    });

    if (!result.items.length) {
      pictureGrid.innerHTML = '<p class="empty-state">No pictures added yet.</p>';
      return;
    }

    const pictures = await Promise.all(result.items.map(async (item) => {
      const url = await getUrl({ path: item.path });
      return { name: item.path.split("/").pop(), url: url.url.toString() };
    }));

    pictureGrid.innerHTML = pictures
      .map((picture) => `<img src="${picture.url}" alt="${picture.name}">`)
      .join("");
  } catch (error) {
    pictureGrid.innerHTML = '<p class="empty-state">Login again before uploading pictures to S3.</p>';
  }
}

document.querySelector("#picture-input")?.addEventListener("change", async (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));

  if (!files.length) {
    return;
  }

  pictureGrid.innerHTML = '<p class="empty-state">Uploading pictures...</p>';

  try {
    await fetchAuthSession();
    await Promise.all(files.map((file) => {
      return uploadData({
        path: ({ identityId }) => `profile-pictures/${identityId}/${Date.now()}-${file.name}`,
        data: file,
        options: {
          contentType: file.type
        }
      }).result;
    }));

    await renderPictures();
    event.target.value = "";
  } catch (error) {
    pictureGrid.innerHTML = '<p class="empty-state">Upload failed. Please sign in again and try another picture.</p>';
  }
});

document.querySelector("#logout-button")?.addEventListener("click", () => {
  signOut().finally(() => {
    window.location.href = "login.html";
  });
});

loadProfile();
renderPictures();
