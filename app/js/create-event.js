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
    const eventLink = document.createElement("a");
    eventLink.href = `/event/${eventRef.id}`;
    eventLink.target = "_blank";
    eventLink.textContent = "Go to event";
    document.body.appendChild(eventLink);
  } catch (error) {
    console.error("Error adding event: ", error);
    alert("Error creating event!");
  }
}

createEventButton.addEventListener("click", createEvent);
