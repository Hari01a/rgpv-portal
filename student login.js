/*LOGIN SECURITY - Attempt Check*/

let attempts = parseInt(localStorage.getItem("loginAttempts")) || 0;

document.addEventListener("DOMContentLoaded", () => {

    if (attempts >= 5) {

        alert("Too many wrong attempts! Try again later.");

        return;
    }

    generateCaptcha();

});


/* STUDENT LOGIN SYSTEM */

document.getElementById("loginForm")?.addEventListener("submit", async function (e) {

    e.preventDefault();

    let username =
        document.getElementById("username")
        .value
        .trim();

    let password =
        document.getElementById("password")
        .value
        .trim();

    let captchaInput =
        document.getElementById("captchaInput")
        .value
        .trim();

    let correctCaptcha =
        localStorage.getItem("currentCaptcha");

    if (username === "" || password === "") {

        alert("Please enter username and password.");

        return;
    }

    if (captchaInput !== correctCaptcha) {

        alert("Captcha incorrect!");

        generateCaptcha();

        attempts++;

        localStorage.setItem(
            "loginAttempts",
            attempts
        );

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    enrollment: username,
                    password: password
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok) {

            alert(result.message);

            return;
        }

        localStorage.setItem(
            "loggedStudent",
            username
        );
        localStorage.setItem(
    "studentInfo",
    JSON.stringify(result.student)
);

        localStorage.setItem(
            "loginAttempts",
            0
        );

        alert(
            "Login Successful"
        );

        window.location.href =
            "student page.html";

    }

    catch (error) {

        console.error(error);

        alert(
            "Server Error"
        );

    }

});


/* CAPTCHA GENERATION */

function generateCaptcha() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let captcha = "";

    for (let i = 0; i < 5; i++) {

        captcha += chars[
            Math.floor(
                Math.random() *
                chars.length
            )
        ];

    }

    let cap =
        document.getElementById(
            "captchaValue"
        );

    if (cap)
        cap.innerText = captcha;

    localStorage.setItem(
        "currentCaptcha",
        captcha
    );

}