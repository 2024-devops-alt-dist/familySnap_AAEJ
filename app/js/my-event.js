import { storage, firestore } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

import {
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

console.log("hello from my event");

// CHOPPER L ID DANS L URL
function urlParams() {
  const queryString_url_id = window.location.search;
  console.log("queryString_url_id", queryString_url_id);
  const urlParams = new URLSearchParams(queryString_url_id);
  const theId = urlParams.get("id");
  console.log("theId", theId);
  return theId;
}

const eventId = urlParams();
const h1 = document.getElementById("title");
const webcamVideo = document.getElementById("webcamVideo");
const takePhotoButton = document.getElementById("takePhotoButton");
const downloadPhotoButton = document.getElementById("downloadPhotoButton");
const photoCanvas = document.getElementById("photoCanvas");
const photoContext = photoCanvas.getContext("2d");
const openModalButton = document.getElementById("openModalButton");
const cameraModal = document.getElementById("cameraModal");
const closeModalButton = document.getElementById("closeModalButton");

if (eventId) {
  const docRef = doc(firestore, "events", eventId);
  getDoc(docRef)
    .then((doc) => {
      if (doc.exists()) {
        console.log("Document data:", doc.data());
        console.log("name:", doc.data().name);
        h1.textContent = `Welcome to your event: ${doc.data().name}`;
      } else {
        console.log("Event not found!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
} else {
  console.log("No event ID found in the URL");
}

//MODALE
openModalButton.addEventListener("click", () => {
  cameraModal.style.display = "flex";
});

closeModalButton.addEventListener("click", () => {
  cameraModal.style.display = "none";
  const webcamVideo = document.getElementById("webcamVideo");
  const stream = webcamVideo.srcObject;
  const tracks = stream?.getTracks();
  tracks?.forEach((track) => track.stop());
});

// ACCÈS À LA CAMÉRA
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    webcamVideo.srcObject = stream;
    webcamVideo.play();
  })
  .catch((error) => {
    console.log("Error accessing camera: " + error);
  });

// CAPTURE + UPLOAD
function takePhoto() {
  if (webcamVideo && webcamVideo.srcObject && webcamVideo.srcObject.active) {
    const resizedWidth = 192;
    const resizedHeight = 144;
    photoCanvas.width = resizedWidth;
    photoCanvas.height = resizedHeight;

    // Dessiner l'image dans le canvas
    photoContext.drawImage(
      webcamVideo,
      0,
      0,
      webcamVideo.videoWidth,
      webcamVideo.videoHeight,
      0,
      0,
      resizedWidth,
      resizedHeight
    );

    console.log("Picture captured!");

    // Convertir le canvas en base64
    const imageDataUrl = photoCanvas.toDataURL("image/jpeg");
    const photoName = `photo_${Date.now()}.jpg`;
    const photoRef = ref(storage, `familySnap/${photoName}`);

    console.log("eventId:", eventId);

    // Upload de l'image dans Firebase Storage
    uploadString(photoRef, imageDataUrl, "data_url")
      .then(() => getDownloadURL(photoRef))
      .then((url) => {
        return addDoc(collection(firestore, "photoFamilySnap"), {
          name: photoName,
          eventId: eventId,
          url: url,
          timestamp: new Date(),
        });
      })
      .then(() => {
        console.log("Photo uploaded and metadata saved!");
        alert("Photo uploaded and metadata saved!");
        loadGallery();
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
      });

    downloadPhotoButton.href = imageDataUrl;
  } else {
    console.log("No camera available");
    alert("No camera available, please check your camera settings");
  }
}

takePhotoButton.addEventListener("click", takePhoto);

function downloadPhoto() {
  const imageURL = photoCanvas.toDataURL("image/jpeg");
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "photo.jpeg";
  a.click();
}
downloadPhotoButton.addEventListener("click", downloadPhoto);

// GALLERY
async function loadGallery() {
  const photoGallery = document.getElementById("photoGallery");
  photoGallery.innerHTML = "";
  try {
    const photoQuery = query(
      collection(firestore, "photoFamilySnap"),
      where("eventId", "==", eventId)
    );

    const querySnapshot = await getDocs(photoQuery);
    querySnapshot.forEach((doc) => {
      const photoData = doc.data();
      const photoUrl = photoData.url;
      const photoId = doc.id;

      // Conteneur pour chaque photo
      const photoContainer = document.createElement("div");
      photoContainer.classList.add("photo-container");

      const imgElement = document.createElement("img");
      imgElement.src = photoUrl;
      imgElement.alt = photoData.name;
      imgElement.classList.add("photo");

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => {
        deletePhoto(photoId, photoData.name);
      });
      photoContainer.appendChild(deleteButton);
      photoContainer.appendChild(imgElement);
      photoGallery.appendChild(photoContainer);
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

loadGallery();

// Supprimer une photo
async function deletePhoto(photoId, photoName) {
  try {
    const photoDocRef = doc(firestore, "photoFamilySnap", photoId);
    await deleteDoc(photoDocRef);

    console.log(`Photo ${photoName} deleted!`);
    alert(`Photo ${photoName} deleted!`);
    loadGallery();
  } catch (error) {
    console.error("Error deleting photo:", error);
  }
}
