async function checkStatus() {

  let loggedEnroll = localStorage.getItem("loggedStudent");

  let enteredEnroll =
    document.getElementById("searchEnroll")
    .value
    .trim();

  let resultBox =
    document.getElementById("result");

  if (enteredEnroll === "") {

    resultBox.style.display = "block";

    resultBox.innerHTML =
      "<p style='color:red;'>Please enter your enrollment number!</p>";

    return;
  }

  if (enteredEnroll !== loggedEnroll) {

    resultBox.style.display = "block";

    resultBox.innerHTML =
      "<p style='color:red;'>You can only check your own enrollment number!</p>";

    return;
  }

  try {

    const response = await fetch(
      `http://localhost:5000/api/payment/${enteredEnroll}`
    );

    const student = await response.json();

    if (!response.ok) {

      resultBox.style.display = "block";

      resultBox.innerHTML =
        "<p style='color:red;'>No record found.</p>";

      return;
    }

    resultBox.style.display = "block";

    resultBox.innerHTML = `
      <p><b>Name:</b> ${student.name}</p>
      <p><b>Enrollment:</b> ${student.enrollment}</p>
      <p><b>Branch:</b> ${student.branch}</p>
      <p><b>Semester:</b> ${student.semester}</p>
      <p><b>Transaction ID:</b> ${student.transactionId}</p>
      <p><b>Amount Paid:</b> ₹${student.amount}</p>

      <p>
        <b>Status:</b>
        <span class="status-${student.status}">
          ${student.status.toUpperCase()}
        </span>
      </p>

      <p>
        <b>Admin Response:</b>
        ${student.adminResponse || "No response yet"}
      </p>

      <p>
        <b>Uploaded Slip:</b>
        ${
          student.transactionSlip
            ? `<a href="${student.transactionSlip}" target="_blank">View Slip</a>`
            : "Not Uploaded"
        }
      </p>
    `;

  } catch (error) {

    console.log(error);

    resultBox.style.display = "block";

    resultBox.innerHTML =
      "<p style='color:red;'>Server Error</p>";
  }
}

function logout() {

  localStorage.removeItem("loggedStudent");

  window.location.href =
    "student login.html";
}