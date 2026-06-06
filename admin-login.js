/*FIXED ADMIN LOGIN CREDENTIALS*/
const ADMIN_ID = "admin123";
const ADMIN_PASS = "rgpv@2024";

/*GENERATE CAPTCHA*/
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';

  for (let i = 0; i < 5; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }

  document.getElementById('captchaValue').innerText = captcha;
  localStorage.setItem('adminCaptcha', captcha);
}

document.addEventListener('DOMContentLoaded', generateCaptcha);

/*ADMIN LOGIN SYSTEM */

let attempts = parseInt(localStorage.getItem("adminLoginAttempts")) || 0;

// Block login after 5 wrong attempts
if (attempts >= 5) {
  alert("Too many wrong attempts! Try again later.");
  document.getElementById("loginForm").style.display = "none";
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  let captchaInput = document.getElementById("captchaInput").value.trim();
  let correctCaptcha = localStorage.getItem('adminCaptcha');

  if (username === "" || password === "") {
    alert("Please enter username & password!");
    return;
  }

  if (captchaInput !== correctCaptcha) {
    alert("Captcha incorrect!");
    generateCaptcha();

    attempts++;
    localStorage.setItem("adminLoginAttempts", attempts);
    return;
  }

  // Validate admin id + password
  if (username !== ADMIN_ID || password !== ADMIN_PASS) {
    alert("Invalid Admin ID or Password!");
    attempts++;
    localStorage.setItem("adminLoginAttempts", attempts);
    return;
  }

  // Login successful → reset attempts
  localStorage.setItem("adminLoginAttempts", 0);

  // save session
  localStorage.setItem("adminLogged", "true");

  // Redirect to dashboard
  window.location.href = "admin-dashboard.html";
});
