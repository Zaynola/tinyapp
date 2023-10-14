const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
    b2xVn2: {
        longURL: "http://www.lighthouselabs.ca",
        userID: "aJ481W"
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "aJ48lW"
    }
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

const urlsForUser = (id) => {
    const userURLs = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === id) {
            userURLs[shortURL] = urlDatabase[shortURL];
        }
    }
    return userURLs;
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
    if (!user_id) {
        const errorMessage = "You need to log in first";
        const templateVars = {
            errorMessage: errorMessage,
            user_id: null
        };
        return res.render("urls_error", templateVars);
    }
    const userURLs = urlsForUser(user_id);
    const templateVars = {
        urls: userURLs,
        user_id: users[user_id]
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const user_id = req.cookies['user_id'];
    if (!user_id) {
        return res.redirect("/login");
    }
    const templateVars = {
        urls: urlDatabase,
        user_id: users[user_id]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const user_id = req.cookies['user_id'];
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];
    console.log(`shortURL, ${shortURL}`)
    console.log(`user_id, ${user_id}`)
    console.log(url)

    if (!user_id) {
        const errorMessage = "You need to log in to access this URL.";
        const templateVars = {
            errorMessage: errorMessage,
            user_id: null
        };
        return res.render("urls_error", templateVars);
    }

    if (url) {
        if (url.userID === user_id) {
            const templateVars = { shortURL, longURL: url.longURL, user_id: user_id };
            res.render("urls_show", templateVars);
        } else {
            res.status(403).send("You do not have permission to access this URL.");
        }
    } else {
        res.status(404).send("URL not found");
    }
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

// app.get("/urls/:id/edit", (req, res) => {
//     const user_id = req.cookies['user_id'];
//     const shortURL = req.params.id;
//     const url = urlDatabase[shortURL];

//     if (!user_id) {
//         const errorMessage = "You need to log in to edit this URL.";
//         const templateVars = {
//             errorMessage: errorMessage
//         };
//         return res.render("urls_error", templateVars);
//     }

//     if (url) {
//         if (url.userID === user_id) {
//             const templateVars = { shortURL, longURL: url.longURL, user_id: user_id };
//             res.render("urls_edit", templateVars);
//         } else {
//             res.status(403).send("You do not have permission to edit this URL.");
//         }
//     } else {
//         res.status(404).send("URL not found");
//     }
// });

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
    const user_id = req.cookies['user_id'];

    if (!user_id) {
        res.status(403).send("You cannot shorten URLs. Please log in or register.");
    } else {
        const longURL = req.body.longURL;
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = { longURL: longURL, userID: user_id };
        res.redirect(`/urls/${shortURL}`);
    }
});

// app.post("/urls/:id/delete", (req, res) => {
//     const id = req.params.id;

//     if (urlDatabase[id]) {
//         delete urlDatabase[id];
//         res.redirect("/urls");
//     } else {
//         res.status(404).send("URL not found");
//     }
// });
app.post("/urls/:id/delete", (req, res) => {
    const user_id = req.cookies['user_id'];
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];

    if (url) {
        if (url.userID === user_id) {
            delete urlDatabase[shortURL];
            res.redirect("/urls");
        } else {
            res.status(403).send("You do not have permission to delete this URL.");
        }
    } else {
        res.status(404).send("URL not found");
    }
});


app.post("/urls/:id", (req, res) => {
    const user_id = req.cookies['user_id'];
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];

    if (url) {
        if (url.userID === user_id) {
            const newLongURL = req.body.longURL;
            urlDatabase[shortURL].longURL = newLongURL;
            res.redirect("/urls");
        } else {
            res.status(403).send("You do not have permission to edit this URL.");
        }
    } else {
        res.status(404).send("URL not found");
    }
});

app.post("/login", (req, res) => {

    const loginEmail = req.body.email;
    const loginPassword = req.body.password;
    const user = getUserByEmail(loginEmail, users);
    const loginUser = users[user]


    if (user) {
        if (loginPassword === users[user].password) {
            res.cookie("user_id", user);
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

app.post("/urls/:id/delete", (req, res) => {
    const user_id = req.cookies['user_id'];
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];

    if (!user_id) {
        const errorMessage = "You need to log in to delete this URL.";
        const templateVars = {
            errorMessage: errorMessage
        };
        return res.render("urls_error", templateVars);
    }

    if (url) {
        if (url.userID === user_id) {
            delete urlDatabase[shortURL];
            res.redirect("/urls");
        } else {
            res.status(403).send("You do not have permission to delete this URL.");
        }
    } else {
        res.status(404).send("URL not found");
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
