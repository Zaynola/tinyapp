const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const user_id = req.cookies['user_id'];

    const templateVars = {
        urls: urlDatabase,
        user_id: users[user_id]
    };
    res.render("urls_index", templateVars);
});

// app.get("/urls/new", (req, res) => {
//     const templateVars = {
//         user_id: users[req.cookies['user_id']]
//     }
//     res.render("urls_new", templateVars);

// });
app.get("/urls/new", (req, res) => {
    const user_id = req.cookies['user_id'];

    const templateVars = {
        urls: urlDatabase,  
        user_id: users[user_id]
    };
    res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
    const id = req.params.id;
    const longURL = urlDatabase[id];

    if (longURL) {
        res.redirect(longURL);
    } else {
        res.status(404).send("URL not found");
    }
});

app.get("/register", (req, res) => {
    const user_id = req.cookies ? req.cookies.user_id : undefined;
    const templateVars = {
        user_id: user_id
    };
    res.render("register", templateVars);
});

app.get("/login", (req, res) => {
    if (!req.cookies.user_id) {
        let templateVars = { user_id: "" };
        return res.render("login", templateVars);
    }
    res.redirect("/urls");
});


const getUserByEmail = (email, users) => {
    for (const userId in users) {
        if (users[userId].email === email) {
            return userId;
        }
    }
    return null;
};
// Define a function to generate a random alphanumeric string of a given length
function generateRandomString(length = 6) {
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

app.post("/urls", (req, res) => {
    const longURL = req.body.longURL; // Extract the longURL from the request body
    const shortURL = generateRandomString();
    // Add the shortURL-longURL pair to the urlDatabase
    urlDatabase[shortURL] = longURL;
    // Redirect the user to the newly created URL's details page
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;

    if (urlDatabase[id]) {
        delete urlDatabase[id];
        res.redirect("/urls");
    } else {
        res.status(404).send("URL not found");
    }
});

app.post("/urls/:id", (req, res) => {
    const id = req.params.id;
    const newLongURL = req.body.longURL; // Get the new longURL from the request body

    if (urlDatabase[id]) {
        urlDatabase[id] = newLongURL;
        res.redirect("/urls");
    } else {
        res.status(404).send("URL not found");
    }
});

//add a endpoint to handle a post to /login that set a cookie named username
// app.post("/login", (req, res) => {
//     const { user_id } = req.body;
//     res.cookie("user_id", user_id);
//     res.redirect("/urls");
// });





app.post("/login", (req, res) => {

    const loginEmail = req.body.email;
    const loginPassword = req.body.password;
    const user = getUserByEmail(loginEmail, users);
    const loginUser = users[user]


    if (loginUser) {
        if (loginPassword === loginUser.password) {
            res.cookie("user_id", user.id);
            res.redirect("/urls");
        } else {
            return res.status(403).send('Invalid password');
        }
    } else {
        return res.status(403).send('User not found');
    }

}
);



// Add a route for handling logout
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
});


app.post("/register", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Email and password cannot be empty.");
        return;
    }
    // Check if the email already exists in the users object
    for (const userId in users) {
        if (users[userId].email === email) {
            res.status(400).send("Email already registered.");
            return;
        }
    }
    const userId = generateRandomString();
    users[userId] = {
        id: userId,
        email: email,
        password: password,
    };
    res.cookie("user_id", userId);
    res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});