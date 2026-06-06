document
.getElementById("registerForm")
.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    let fullName =
    document.getElementById("fullName")
    .value
    .trim();

    let enrollment =
    document.getElementById("enrollment")
    .value
    .trim();

    let email =
    document.getElementById("email")
    .value
    .trim();

    let mobile =
    document.getElementById("mobile")
    .value
    .trim();

    let password =
    document.getElementById("password")
    .value
    .trim();

    let confirmPassword =
    document.getElementById("confirmPassword")
    .value
    .trim();

    if(password !== confirmPassword){

        alert(
        "Passwords do not match"
        );

        return;
    }

    try{

        const response =
        await fetch(
        "http://localhost:5000/api/register",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                fullName,
                enrollment,
                email,
                mobile,
                password

            })
        });

        const result =
        await response.json();

        alert(result.message);

        if(response.ok){

            window.location.href =
            "student login.html";

        }

    }

    catch(error){

        console.error(error);

        alert(
        "Server Error"
        );

    }

});