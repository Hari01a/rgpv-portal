function formatDate(date) {

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    let month = months[date.getMonth()];
    let day = date.getDate();
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes()
    .toString()
    .padStart(2, "0");

    let ampm =
    hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month} ${day} ${year} ${hours}:${minutes}${ampm}`;
}

document.addEventListener(
"DOMContentLoaded",
function(){

    let now = new Date();

    document.getElementById(
        "loginTime"
    ).innerText =
    formatDate(now);

    const enrollment =
    localStorage.getItem(
        "loggedStudent"
    );

    if(!enrollment){

        window.location.href =
        "student login.html";

        return;
    }

    const studentInfo =
    JSON.parse(
    localStorage.getItem(
        "studentInfo"
    ));

    if(studentInfo){

        document.getElementById(
            "studentName"
        ).innerText =
        studentInfo.fullName;

        document.getElementById(
            "profileName"
        ).innerText =
        studentInfo.fullName;

        document.getElementById(
            "profileEnrollment"
        ).innerText =
        studentInfo.enrollment;

        document.getElementById(
            "profileEmail"
        ).innerText =
        studentInfo.email;

        document.getElementById(
            "profileMobile"
        ).innerText =
        studentInfo.mobile;
    }

});

function logout(){

    localStorage.removeItem(
        "loggedStudent"
    );

    localStorage.removeItem(
        "studentInfo"
    );

    window.location.href =
    "student login.html";
}