const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const paymentRoutes = require("./paymentRoutes");
const Student = require("./studentModel");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({
  limit: "50mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "50mb"
}));

app.use(express.static(__dirname));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });


// PAYMENT ROUTES
app.use("/api", paymentRoutes);


// HOME ROUTE
app.get("/", (req, res) => {
  res.send("RGPV Portal Backend Running");
});


// STUDENT REGISTRATION
app.post("/api/register", async (req, res) => {
console.log("REGISTER HIT");
console.log(req.body);
  try {

    const {
      fullName,
      enrollment,
      email,
      mobile,
      password
    } = req.body;

    const existingStudent =
      await Student.findOne({
        enrollment
      });

    if (existingStudent) {

      return res.status(400).json({
        message: "Enrollment Already Exists"
      });

    }

    await Student.create({
      fullName,
      enrollment,
      email,
      mobile,
      password
    });

    res.status(201).json({
      message: "Registration Successful"
    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// STUDENT LOGIN
app.post("/api/login", async (req, res) => {

  try {

    const {
      enrollment,
      password
    } = req.body;

    const student =
      await Student.findOne({
        enrollment
      });

    if (!student) {

      return res.status(400).json({
        message: "Student Not Found"
      });

    }

    if (student.password !== password) {

      return res.status(400).json({
        message: "Invalid Password"
      });

    }

    res.json({
      message: "Login Successful",
      student
    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );

});
app.get(
"/api/student/:enrollment",
async (req,res)=>{

    try{

        const student =
        await Student.findOne({
            enrollment:
            req.params.enrollment
        });

        if(!student){

            return res.status(404)
            .json({
                message:
                "Student Not Found"
            });

        }

        res.json(student);

    }

    catch(error){

        res.status(500)
        .json({
            message:
            error.message
        });

    }

});
