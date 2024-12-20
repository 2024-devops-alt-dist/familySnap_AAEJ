console.log("hello from create-event");

import { firestore } from "./firebase-config.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const createEventButton = document.getElementById("createEventButton");

async function createEvent() {
  event.preventDefault();
  const eventName = document.getElementById("event-title").value.trim();
  const eventDescription = document.getElementById("event-desc").value.trim();
  const eventDate = document.getElementById("event-date").value.trim();
  if (!eventName) {
    alert("what is the name of your event ?");
    return;
  } else if (!eventDescription) {
    alert("what is the description of your event ?");
    return;
  } else if (!eventDate) {
    alert("what is the date of your event ?");
    return;
  }
  try {
    const eventRef = await addDoc(collection(firestore, "events"), {
      name: eventName,
      description: eventDescription,
      date: eventDate,

      timestamp: new Date(),
    });
    console.log(`Document with ID: ${eventRef.id} added.`);
    alert("Event created successfully!");

    const qrContainer = document.getElementById("event-qr-code");
    const codeContainer = document.getElementById("event-code");

    qrContainer.innerHTML = "";
    codeContainer.innerHTML = "";

    const eventLink = document.createElement("a");
    eventLink.href = `./my-event.html?id=${eventRef.id}`;
    eventLink.target = "_blank";
    eventLink.textContent = `Your event : ${eventName}`;
    document.body.appendChild(eventLink);
    new QRCode(document.getElementById("event-qr-code"), {
      text: `/my-event.html?id=${eventRef.id}`,
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } catch (error) {
    console.error("Error adding event: ", error);
    alert("Error creating event!");
  }
}

createEventButton.addEventListener("click", createEvent);
