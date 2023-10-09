const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
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
    const templateVars = {urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
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

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

// Define a function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
    const characters = 'a -z';
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