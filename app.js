import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', './views');

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});
app.get("/reservation", (req, res) => {
  res.render("reservation.ejs");
});

app.get("/admin_login", (req, res) => {
  res.render("admin_login.ejs");
});
app.get("/welcome", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("welcome.ejs", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
app.get("/engineers", (req, res) => {
  res.render("engineers.ejs");
});
app.get("/eng.eyad", (req, res) => {
  res.render("eyad.ejs");
});
app.get("/eng.fawzy", (req, res) => {
  res.render("fawzy.ejs");
});
app.get("/eng.michael", (req, res) => {
  res.render("michael.ejs");
});
app.get("/eng.yasser", (req, res) => {
  res.render("yasser.ejs");
});
app.get("/eng.youssef", (req, res) => {
  res.render("youssef.ejs");
});
app.get("/eng.omar", (req, res) => {
  res.render("omar.ejs");
});
app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("welcome.ejs", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
app.get("/admin", async (req, res) => {
  try {
    const users = await db.query("SELECT id, email, created_at FROM users");
    const reservations = await db.query(`
      SELECT r.*, u.email as contact_mail 
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    const engineers = await db.query("SELECT * FROM engineers ORDER BY name");
    res.render("admin.ejs", {
      users: users.rows,
      reservations: reservations.rows,
      engineers: engineers.rows
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.render("admin.ejs", {
      error: "Failed to load admin data",
      users: [],
      reservations: [],
      engineers: []
    });
  }
});

app.post("/admin_login", async (req, res) => {
  const { username: email, password } = req.body;
  try {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const data = await getAdminData();
      return res.render("admin.ejs", data);
    }
    res.render("admin_login.ejs", { error: "Invalid admin credentials" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.render("admin_login.ejs", { error: "Login failed. Please try again." });
  }
});

async function getAdminData() {
  const users = await db.query("SELECT id, email, created_at FROM users");
  const reservations = await db.query(`
    SELECT r.*, u.email as contact_mail 
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `);
  const engineers = await db.query("SELECT * FROM engineers ORDER BY name");
  return {
    users: users.rows,
    reservations: reservations.rows,
    engineers: engineers.rows
  };
}
app.post("/admin/engineers", async (req, res) => {
  try {
    const { name, specialization, experience_years, email, phone, bio, image_url } = req.body;
    const result = await db.query(
      `INSERT INTO engineers 
       (name, specialization, experience_years, email, phone, bio, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, specialization, parseInt(experience_years), email, phone, bio, image_url]
    );
    res.json({ success: true, engineer: result.rows[0] });
  } catch (error) {
    console.error("Add engineer error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/admin/engineers/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM engineers WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Engineer not found" });
    }
    res.json({ engineer: result.rows[0] });
  } catch (error) {
    console.error("Get engineer error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.put("/admin/engineers/:id", async (req, res) => {
  try {
    const { name, specialization, experience_years, email, phone, bio, image_url } = req.body;
    const result = await db.query(
      `UPDATE engineers SET 
       name = $1, specialization = $2, experience_years = $3, 
       email = $4, phone = $5, bio = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [name, specialization, parseInt(experience_years), email, phone, bio, image_url, req.params.id]
    );
    res.json({ success: true, engineer: result.rows[0] });
  } catch (error) {
    console.error("Update engineer error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/admin/engineers/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM engineers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete engineer error:", error);
    res.status(500).json({ error: error.message });
  }
});
import { body, validationResult} from "express-validator";
import moment from "moment";
const validateReservation = [
  body('projectName').notEmpty().withMessage('Project name is required'),
  body('contactMail').isEmail().withMessage('Valid email is required'),
  body('startDate').isDate().withMessage('Valid start date is required')
    .custom((value, { req }) => {
      if (moment(value).isBefore(moment())) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate').isDate().withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (moment(value).isBefore(moment(req.body.startDate))) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('projectType').notEmpty().withMessage('Project type is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
];
app.post("/reservation", validateReservation,async (req, res) => {
  try {
    const { 
      projectName, 
      contactMail, 
      startDate, 
      endDate, 
      projectType, 
      description, 
      price 
    } = req.body;
    await db.query('BEGIN');
    let user;
    try {
      user = await db.query(
        `SELECT id FROM users 
         WHERE email = $1 OR contact_mail = $1 
         LIMIT 1`,
        [contactMail]
      );

      if (!user.rows.length) {
        user = await db.query(
          `INSERT INTO users (email, contact_mail)
           VALUES ($1, $1)
           RETURNING id`,
          [contactMail]
        );
      }
    } catch (userError) {
      await db.query('ROLLBACK');
      if (userError.code === '23505') { 
        return res.status(400).json({ 
          error: "Email already associated with another account" 
        });
      }
      throw userError;
    }
    const reservation = await db.query(
      `INSERT INTO reservations (
        user_id, project_name, contact_mail,
        start_date, end_date, project_type,
        description, price
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.rows[0].id,
        projectName,
        contactMail,
        startDate,
        endDate,
        projectType,
        description,
        parseFloat(price).toFixed(2)
      ]
    );

    await db.query('COMMIT');
    
    res.status(201).json({ 
      success: true, 
      reservation: reservation.rows[0]
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Reservation error:", error);
    const errorResponse = {
      '23505': { status: 409, message: "Conflict: Duplicate entry detected" },
      '23502': { status: 400, message: "Missing required fields" }
    }[error.code] || { 
      status: 500, 
      message: "Failed to create reservation" 
    };
    res.status(errorResponse.status).json({
      error: errorResponse.message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get("/admin/reservations/:id", async (req, res) => {
  try {
    const reservations = await db.query(`
      SELECT r.*, u.email as contact_mail 
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.render("admin", { 
      user: req.user,
      reservations: reservations.rows 
    });
  } catch (error) {
    console.error("Admin page error:", error);
    res.status(500).send("Server error");
  }
});
app.patch("/admin/reservations/:id/approve", async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE reservations SET status = 'approved' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.json({ success: true });
    
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ error: "Database update failed" });
  }
});

app.delete("/admin/reservations/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM reservations WHERE id = $1", [req.params.id]);
        res.json({ success: true, message: "Reservation deleted" });
    } catch (error) {
        console.error("Delete reservation error:", error);
        res.status(500).json({ error: error.message });
    }
});
app.delete("/admin/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM reservations WHERE user_id = $1", [req.params.id]);
    await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message });
  }
});
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/home",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get(
  "/auth/google/home",
  passport.authenticate("google", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
  })
);
app.post("/login", passport.authenticate("local", {
  successRedirect: "/welcome",
  failureRedirect: "/login",
}));
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/login");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});