const Password_input = document.querySelector(".password--input");
const Password_eye_icon = document.querySelector("#password_hidden");
Password_eye_icon.addEventListener("click", () => {
  if (Password_input.type === "password") {
    Password_input.type = "text";
    Password_eye_icon.setAttribute("name", "eye-outline");
    Password_eye_icon.removeAttribute("name", "eye-off-outline");
  } else {
    Password_input.type = "password";
    Password_eye_icon.setAttribute("name", "eye-off-outline");
    Password_eye_icon.removeAttribute("name", "eye-outline");
  }
});
