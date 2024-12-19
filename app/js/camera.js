//firestore
import { storage, firestore } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
//storage
import {
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

console.log("hello from camera.js");

function urlParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get("id");
  console.log("eventId : ", eventId);
  return eventId;
}

const webcamVideo = document.getElementById("webcamVideo");
const takePhotoButton = document.getElementById("takePhotoButton");
const downloadPhotoButton = document.getElementById("downloadPhotoButton");
const photoCanvas = document.getElementById("photoCanvas");
const photoContext = photoCanvas.getContext("2d");

// ACCES A LA CAMERA
// Associer le flux vidéo à l'élément <video>, stream contient le flux de la video src.Object veut dire que le flux est actif et démarrer la lecture du flux avec play()
navigator.mediaDevices
  .getUserMedia({ video: true }) // pas audio (video uniquement)
  .then((stream) => {
    webcamVideo.srcObject = stream;
    webcamVideo.play();
  })
  .catch((error) => {
    console.log("Error: " + error);
  });

//"DESSINER" LA PHOTO ET L'UPLOAD
function takePhoto() {
  if (webcamVideo && webcamVideo.srcObject && webcamVideo.srcObject.active) {
    const resizedWidth = 192; // regle de 3 !
    const resizedHeight = 144;
    photoCanvas.width = resizedWidth;
    photoCanvas.height = resizedHeight;

    // Dessiner l'image dans le canvas :
    // 1 : LA SOURCE : 0 0 la position dans le flux pour commencer la capture en haut à gauche et prendre tout le canvas (=> redimensionner avant ?)
    // 2 : LA DESTINATION : 0 0 la position de départ dans le canvas avec la redimenssion
    photoContext.drawImage(
      webcamVideo,
      0,
      0,
      webcamVideo.videoWidth,
      webcamVideo.videoHeight, //source (dimensions de la vidéo)
      0,
      0,
      resizedWidth,
      resizedHeight
    ); // Destination : dimensions redimensionnées

    console.log("picture in the box !");

    // Convertir le canvas en base 64
    const imageDataUrl = photoCanvas.toDataURL("image/jpeg");

    // const photoName = "photo.jpg"; //marche pas bien car toutes les photos s'appellent photo.jpg
    // const photoRef = ref(storage, `familySnap/${photoName}`);
    const photoName = `photo_${Date.now()}.jpg`; //manière la + simple pour avoir un nom unique
    //ref de l'import et stotage voir firebase-config.js
    const photoRef = ref(storage, `familySnap/${photoName}`);

    const eventId = urlParams();
    console.log("eventId : ", eventId);

    // Upload de l'image et récupération de l'URL
    // uploadString = uploader l image en base64 (data_url est le format de l'image -base64-)
    uploadString(photoRef, imageDataUrl, "data_url")
      .then(() => {
        // Récupérer l'URL après l'upload
        return getDownloadURL(photoRef);
      })
      .then((url) => {
        // Ajouter les datas et surtout l url à Firestore
        return addDoc(collection(firestore, "photoFamilySnap"), {
          name: photoName,
          eventId: eventId,
          url: url,
          timestamp: new Date(),
        });
      })
      .then(() => {
        console.log("Photo metadata saved to Firestore!");
        alert("Photo uploaded and metadata saved!");
        loadGallery(); // refresh la galerie après l'upload
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
      });

    downloadPhotoButton.href = imageDataUrl;
  } else {
    console.log("no camera available");
    alert("No camera available, please check your camera settings");
  }
}
// voir pour retirer la photo de la camera si l'image est bien upload dans firestore
takePhotoButton.addEventListener("click", takePhoto);

function downloadPhoto() {
  const imageURL = photoCanvas.toDataURL("image/jpeg");
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "photo.jpeg";
  a.click();
}
downloadPhotoButton.addEventListener("click", downloadPhoto);

// AFFICHER DANS LA GALERIE
async function loadGallery() {
  const photoGallery = document.getElementById("photoGallery");
  photoGallery.innerHTML = "";
  const eventId = urlParams();

  try {
    // recuperer uniquement les photos associées à l'eventId avec query de firebase  et where
    const photoQuery = query(
      collection(firestore, "photoFamilySnap"),
      where("eventId", "==", eventId)
    );

    const querySnapshot = await getDocs(photoQuery);

    querySnapshot.forEach((doc) => {
      const photoData = doc.data();
      const photoUrl = photoData.url;
      const photoId = doc.id;

      // contener pour pouvoir ajouter le bouton suppr
      const photoContainer = document.createElement("div");
      photoContainer.classList.add("photo-container");

      // Div img pour chq photo
      const imgElement = document.createElement("img");
      imgElement.src = photoUrl;
      imgElement.alt = photoData.name;
      imgElement.classList.add("photo");

      // btn sup
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

// SUPPRIMER UNE PHOTO

async function deletePhoto(photoId, photoName) {
  try {
    //cf firestore
    const photoDocRef = doc(firestore, "photoFamilySnap", photoId);

    // Supprimer le document Firestore
    await deleteDoc(photoDocRef);

    console.log(`Photo ${photoName} deleted!`);
    alert(`Photo ${photoName} deleted!`);
    loadGallery(); // refresh la galerie après la suppression
  } catch (error) {
    console.error("Error deleting photo:", error);
  }
} // voir pour ajouter un bouton de confirmation de suppression
