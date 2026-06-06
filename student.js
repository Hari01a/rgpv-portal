// BLOCK MULTIPLE SUBMISSIONS + AUTO-FILL
window.onload = function () {

    let loggedEnroll = localStorage.getItem("loggedStudent");

    if (loggedEnroll) {
        document.getElementById("enrollment").value = loggedEnroll;
        document.getElementById("enrollment").readOnly = true;
    }
    const studentInfo =
JSON.parse(
localStorage.getItem(
"studentInfo"
));

if(studentInfo){

    document.getElementById("name").value =
    studentInfo.fullName;

    document.getElementById("email").value =
    studentInfo.email;

    document.getElementById("mobile").value =
    studentInfo.mobile;

    document.getElementById("enrollment").value =
    studentInfo.enrollment;

    document.getElementById("name").readOnly = true;
    document.getElementById("email").readOnly = true;
    document.getElementById("mobile").readOnly = true;
    document.getElementById("enrollment").readOnly = true;

}

    let submitted = localStorage.getItem("submitted_" + loggedEnroll);

    if (submitted === "true") {
        document.querySelector(".container").innerHTML = `
            <h2 style="text-align:center; color:red;">
                You have already submitted this form!
            </h2>

            <br>

            <button
                onclick="window.location.href='student-status.html'"
                style="
                padding:10px 20px;
                background:#004aad;
                color:white;
                border:none;
                border-radius:6px;
                cursor:pointer;">
                Check Your Status
            </button>
        `;
    }
};


// LIVE SLIP PREVIEW
document.getElementById("slip").addEventListener("change", function () {

    let file = this.files[0];
    let previewBox = document.getElementById("previewBox");

    if (!file) {
        previewBox.innerHTML = "<p>No Slip Uploaded</p>";
        return;
    }

    let reader = new FileReader();

    reader.onload = function () {

        previewBox.innerHTML =
            `<img src="${reader.result}"
            alt="Slip Preview"
            style="width:90px;border-radius:6px;">`;

    };

    reader.readAsDataURL(file);
});


// SUBMIT PAYMENT FORM
document.getElementById("studentForm").addEventListener("submit", function (e) {

    e.preventDefault();

    let course = document.getElementById("course");
    let name = document.getElementById("name");
    let enrollment = document.getElementById("enrollment");
    let branch = document.getElementById("branch");
    let semester = document.getElementById("semester");
    let email = document.getElementById("email");
    let mobile = document.getElementById("mobile");
    let transactionId = document.getElementById("transactionId");
    let amount = document.getElementById("amount");
    let remarks = document.getElementById("remarks");
    let slipFile = document.getElementById("slip").files[0];

    let reader = new FileReader();

    reader.onload = async function () {

        let student = {

            course: course.value,
            name: name.value,
            enrollment: enrollment.value,
            branch: branch.value,
            semester: semester.value,

            email: email.value,
            mobile: mobile.value,

            transactionId: transactionId.value,
            amount: amount.value,

            remarks: remarks.value,

            transactionSlip: reader.result,

            status: "pending",
            adminResponse: "",

            addedAt: new Date().toISOString()
        };

        try {

            const response = await fetch(
                "http://localhost:5000/api/payment",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }
            );

            const result = await response.json();

            alert(result.message);

            if (response.ok) {

                localStorage.setItem(
                    "submitted_" + enrollment.value,
                    "true"
                );

                localStorage.setItem(
                    "newSubmission",
                    "true"
                );

                window.location.href = "success.html";
            }

        } catch (error) {

            console.error(error);

            alert(
                "Server Error! Check Backend."
            );
        }
    };

    if (slipFile) {
        reader.readAsDataURL(slipFile);
    } else {
        reader.onload();
    }

});


// LOGOUT FUNCTION
function logout() {

    localStorage.removeItem(
        "loggedStudent"
    );

    window.location.href =
        "student login.html";
}


// BLOCK MINUS (-) FOR MOBILE & AMOUNT
document
.querySelectorAll("#mobile, #amount")
.forEach(input => {

    input.addEventListener(
        "keydown",
        function (e) {

            if (
                e.key === "-" ||
                e.key === "Subtract"
            ) {
                e.preventDefault();
            }

        }
    );

    input.addEventListener(
        "input",
        function () {

            this.value =
                this.value.replace(
                    /-/g,
                    ""
                );

        }
    );

});