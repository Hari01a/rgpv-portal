document.addEventListener("DOMContentLoaded", async () => {

    const studentTable =
    document.querySelector("#studentTable tbody");

    const searchInput =
    document.getElementById("searchInput");

    let allStudents = [];

    try {

        const response =
        await fetch(
            "http://localhost:5000/api/payments"
        );

        allStudents =
        await response.json();

        loadTable(allStudents);

        updateStats(allStudents);

        searchInput.addEventListener(
            "keyup",
            function(){

                let value =
                this.value
                .toLowerCase();

                let filtered =
                allStudents.filter(
                    student =>
                    student.enrollment
                    .toLowerCase()
                    .includes(value)
                );

                loadTable(filtered);

            }
        );

    }

    catch(error){

        console.log(error);

        alert(
            "Unable To Load Data"
        );

    }

    function updateStats(students){

        document.getElementById(
            "totalStudents"
        ).innerText =
        students.length;

        document.getElementById(
            "pendingStudents"
        ).innerText =
        students.filter(
            s => s.status === "pending"
        ).length;

        document.getElementById(
            "approvedStudents"
        ).innerText =
        students.filter(
            s => s.status === "approved"
        ).length;

        document.getElementById(
            "rejectedStudents"
        ).innerText =
        students.filter(
            s => s.status === "rejected"
        ).length;

    }

    function loadTable(students){

        studentTable.innerHTML = "";

        students.forEach((student) => {

            let row = `
            <tr>

                <td>${student.name}</td>

                <td>${student.enrollment}</td>

                <td>${student.branch}</td>

                <td>${student.semester}</td>

                <td>${student.email}</td>

                <td>${student.mobile}</td>

                <td>${student.transactionId}</td>

                <td>₹${student.amount}</td>

                <td>${student.remarks || "-"}</td>

                <td>

                ${
                    student.transactionSlip

                    ?

                    `<button
                    class="view-btn"
                    onclick="viewSlip('${student.transactionSlip}')">

                    View Slip

                    </button>`

                    :

                    "Not Uploaded"
                }

                </td>

                <td class="${student.status}">
                    ${student.status.toUpperCase()}
                </td>

                <td>

                    <button
                    class="approve-btn"
                    onclick="approvePayment('${student._id}')">

                    Approve

                    </button>

                    <button
                    class="reject-btn"
                    onclick="rejectPayment('${student._id}')">

                    Reject

                    </button>

                </td>

            </tr>
            `;

            studentTable.innerHTML += row;

        });

    }

});


window.approvePayment =
async function(id){

    try{

        await fetch(
            `http://localhost:5000/api/payment/approve/${id}`,
            {
                method:"PUT"
            }
        );

        alert(
            "Payment Approved"
        );

        location.reload();

    }

    catch(error){

        console.log(error);

    }

};


window.rejectPayment =
async function(id){

    try{

        await fetch(
            `http://localhost:5000/api/payment/reject/${id}`,
            {
                method:"PUT"
            }
        );

        alert(
            "Payment Rejected"
        );

        location.reload();

    }

    catch(error){

        console.log(error);

    }

};


window.viewSlip =
function(slip){

    let win =
    window.open(
        "",
        "_blank"
    );

    win.document.write(`

    <html>

    <head>

    <title>
    Transaction Slip
    </title>

    </head>

    <body
    style="
    margin:0;
    text-align:center;
    background:#f4f4f4;
    ">

    <img
    src="${slip}"
    style="
    max-width:100%;
    height:auto;
    ">

    </body>

    </html>

    `);

};


function logout(){

    localStorage.clear();

    window.location.href =
    "admin-login.html";

}