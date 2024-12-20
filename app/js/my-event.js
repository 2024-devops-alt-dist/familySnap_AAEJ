import { firestore } from "./firebase-config.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

console.log("hello from my event");

const queryString_url_id = window.location.search;
console.log("queryString_url_id", queryString_url_id);
const urlParams = new URLSearchParams(queryString_url_id);
console.log("urlParams", urlParams);
const theId = urlParams.get("id");
console.log("theId", theId);

const h1 = document.getElementById("title");
const docRef = doc(firestore, "events", theId);
getDoc(docRef)
  .then((doc) => {
    if (doc.exists) {
      console.log("Document data:", doc.data());
      console.log("name:", doc.data().name);
      h1.textContent = `welcome to your event ` + doc.data().name;
    } else {
      console.log("not find !");
    }
  })
  .catch((error) => {
    console.log("Error getting document:", error);
  });
