import { firestore } from "./firebase-config.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const createEventButton = document.getElementById("createEventButton");

async function createEvent() {
  const eventName = document.getElementById("eventName").value.trim();

  if (!eventName) {
    alert("what is the name of your event ?");
    return;
  }

  try {
    // Ajouter un document dans la collection 'events'
    const eventRef = await addDoc(collection(firestore, "events"), {
      eventName: eventName,
      photoFamilySnapUrl: "www.google.com",
      timestamp: new Date(),
    });

    console.log(
      "eventRef: " + eventRef.id + " eventName: " + eventName + eventRef
    );

    alert(`Event '${eventName}' created successfully.`);
  } catch (error) {
    console.error("Error creating event:", error);
    alert("Failed to create event.");
  }
}

createEventButton.addEventListener("click", createEvent);
