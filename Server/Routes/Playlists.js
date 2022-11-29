const express = require("express");
const router = express.Router();
const { db } = require("../../util/admin");

const {playlists} = require('../handler/playlists');

//get all the current playlists from firebase
router.get('/', playlists);

//get the songs on a playlist
router.get('/getsongs/:id',(req,res)=>{
    const playlist = req.params.id;
    getPlaySongs(playlist).then((data)=>{
        res.send(data)
    })
    .catch((err)=>{
        res.send(err)
    })
})

//add tracks to a playlist
router.post('/add/:id', (req,res)=>{
    const playlistID= req.params.id;
    const tracks = req.body.tracks;

    addSongs(playlistID, tracks)
    res.send("added songs ")
    
})

//get specific playlist
router.get("/:id", (req,res)=>{
    const playlist =req.params.id;
    getPlaylist(playlist).then((data)=>{
        res.send(data)
    })
})

//create a new playlist
router.post('/create', (req,res)=>{
    const name= req.body.name;
    const email= req.body.email;
    const user=req.body.user;
    addPlaylist(name, email, user)
    res.send()
})

//add description
router.post('/description/:id', (req,res)=>{
    const playlistID= req.params.id;
    const description = req.body.description;

    addDescription(playlistID, description)
    res.send()
})

//add rating to a playlist 
router.post('/rating/:id', (req,res)=>{
    const playlistID= req.params.id;
    const rating = req.body.rating;
    const user=req.body.user;
    addRating(playlistID, rating, user)
    res.send()
})

//add reviews to playlist
router.post('/review/:id', (req,res)=>{
    const playlistID= req.params.id;
    const review = req.body.review;
    const user=req.body.user;

    var today = new Date();   //getting current date 
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    addReviews(playlistID, review, user, today)
    res.send()
})

router.delete('/deleteSong/:id/:song',(req,res)=>{
    const playlistId= req.params.id;
    const songID= req.params.song;
    console.log()
    deleteSong(playlistId, Number(songID))
    res.send("done")
})
//delete a playlist
router.delete('/deletePlaylist/:id', (req,res)=>{
    const playlist = req.params.id;
    deletePlaylist(playlist);
    res.send()
})

router.post('/addtime/:id', (req, res)=>{
    const playlist = req.params.id;
    const time = req.body.time;

    addTime(playlist, time);
    res.send()
})

router.get("/changetopublic/:id", (req,res)=>{
    const id =req.params.id;
    changeVisibility(id)
    res.send("changed")
})
router.get("/changetoprivate/:id", (req,res)=>{
    const id =req.params.id;
    changeVisibility2(id)
    res.send("changed")
})

//create new playlist function
async function addPlaylist(name, email, user){
    const res = await db.collection('Playlists').add({
        Name: name,
        UserEmail: email,
        User: user,
        Songs:[],
        visibility: "private",
        Timestamp: FieldValue.serverTimestamp()
      });
      
      console.log('Added document with ID: ', res.id);
      
}
let FieldValue= require('firebase-admin').firestore.FieldValue;
//add songs function
async function addSongs(id, tracks){
   // const FieldValue = require('firebase-admin').firestore.FieldValue;
    for (track in tracks){
        const res = await db.collection('Playlists').doc(id).update({
            Songs: FieldValue.arrayUnion(tracks[track]),
            Timestamp: FieldValue.serverTimestamp()
        })
    }

    console.log("Added tracks: "+tracks+" to: "+id)
}
async function changeVisibility(id){
    const res= await db.collection('Playlists').doc(id).update({
        visibility: "public"
    })
}
async function changeVisibility2(id){
    const res= await db.collection('Playlists').doc(id).update({
        visibility: "private"
    })
}

async function addDescription(id, desc){
    //const FieldValue = require('firebase-admin').firestore.FieldValue;
    const res = await db.collection('Playlists').doc(id).update({
        Description: desc,
        Timestamp: FieldValue.serverTimestamp()
    })
    console.log("Added description to: "+id)
}

//add comments to playlist 
async function addReviews(id, review, user, date){
    const FieldValue = require('firebase-admin').firestore.FieldValue;
    const res = await db.collection('Playlists').doc(id).update({
        Reviews:FieldValue.arrayUnion({comm: review, user: user, date: date})
    })
    console.log("Added review to: "+id)
}

//add ratings to a playlist 
async function addRating(id, rating, user){
    const FieldValue = require('firebase-admin').firestore.FieldValue;
    const res = await db.collection('Playlists').doc(id).update({
        Ratings: FieldValue.arrayUnion({rating: rating, user:user })
    })
    console.log("Added rating to: "+id)
}

async function getPlaySongs(id){
    const play = db.collection('Playlists').doc(id);
    const doc = await play.get();
    if (!doc.exists) {
    console.log('No such document!');
    } else {
    console.log(doc.data().Songs);
    }
    return doc.data()
}

async function getPlaylist(id){
    const play = db.collection("Playlists").doc(id);
    const doc = await play.get();
    console.log(doc.data())
    return doc.data()
}
//delete a playlist
async function deletePlaylist(id){
    const res = await db.collection("Playlists").doc(id).delete()
}

async function addTime(id, time){
    const res = await db.collection('Playlists').doc(id).update({
        Time: time
    })

    console.log("Added time to: "+id)
}

async function deleteSong(play, song){
    const res = await db.collection('Playlists').doc(play).update({
        Songs: FieldValue.arrayRemove(song),
        Timestamp: FieldValue.serverTimestamp()
    })
}
module.exports = router;