const express = require("express");
const router = express.Router();
const { db } = require("../../util/admin");

const { users } = require("../handler/users");

//Get all users from database
router.get("/", users);

//Add user to database (takes uid in url and email in body, creates document with docid = uid and sets email, isAdmin and disabled)
router.post("/adduser/:id", (req, res) => {
  const uid = req.params.id;
  const email = req.body.email; //needs to be in the req.body
  //const email = "test@gmail.com";
  try {
    addUser(uid, email);
    return res.status(200).send("Added User " + uid);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//Get a specific user given uid
router.get("/getuser/:id", (req, res) => {
  const uid = req.params.id;
  try {
    getUser(uid).then((data) => {
      return res.status(200).send(data);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//Give a specific user admin privliges
router.post("/giveadmin/:id", (req, res) => {
  const uid = req.params.id;
  giveAdmin(uid);
  res.send("Gave " + uid + " Admin Privliges");
});

//Remove a specific users admin privliges
router.post("/removeadmin/:id", (req, res) => {
  const uid = req.params.id;
  removeAdmin(uid);
  res.send("Removed " + uid + " Admin Privliges");
});

//Check if given user (uid) is admin
router.get("/isadmin/:id", (req, res) => {
  const uid = req.params.id;
  isAdmin(uid).then((data) => {
    return res.status(200).send(data);
  });
});

//Set a users account to disabled
router.post("/setdisabled/:id", (req, res) => {
  const uid = req.params.id;
  setDisabled(uid);
  res.send("Account" + uid + "is now disabled");
});

//Undisable a users account
router.post("/removedisabled/:id", (req, res) => {
  const uid = req.params.id;
  removeDisabled(uid);
  res.send("Account" + uid + "is no longer disabled");
});

//Check if given user (uid) is disabled
router.get("/isdisabled/:id", (req, res) => {
  const uid = req.params.id;
  isDisabled(uid).then((data) => {
    return res.status(200).send(data);
  });
});

//fucntions to preform all route actions
async function giveAdmin(uid) {
  const FieldValue = require("firebase-admin").firestore.FieldValue;

  const res = await db.collection("Users").doc(uid).update({
    isAdmin: true,
  });
}

async function removeAdmin(uid) {
  const FieldValue = require("firebase-admin").firestore.FieldValue;

  const res = await db.collection("Users").doc(uid).update({
    isAdmin: false,
  });
}

async function setDisabled(uid) {
  const FieldValue = require("firebase-admin").firestore.FieldValue;

  const res = await db.collection("Users").doc(uid).update({
    disabled: true,
  });
}

async function removeDisabled(uid) {
  const FieldValue = require("firebase-admin").firestore.FieldValue;

  const res = await db.collection("Users").doc(uid).update({
    disabled: false,
  });
}

async function getUser(uid) {
  const document = db.collection("Users").doc(uid);
  let user = await document.get();
  let response = user.data();
  if (!user.exists) {
    console.log("User doesn't exist");
  } else {
    console.log(response);
  }
  return response;
}

async function isAdmin(uid) {
  const document = db.collection("Users").doc(uid);
  let user = await document.get();
  let response = user.data().isAdmin;
  if (!user.exists) {
    console.log("User doesn't exist");
  } else {
    console.log(response);
  }
  return response;
}

async function isDisabled(uid) {
  const document = db.collection("Users").doc(uid);
  let user = await document.get();
  let response = user.data().disabled;
  if (!user.exists) {
    console.log("User doesn't exist");
  } else {
    console.log(response);
  }
  return response;
}

async function addUser(uid, email) {
  await db
    .collection("Users")
    .doc("/" + uid + "/")
    .create({
      email: email,
      isAdmin: false,
      disabled: false,
    });
}
module.exports = router;
