const gallery = document.querySelector(".gallery");
let currentFilter = null;
let works = [];
import { apiURL } from "./apiURL.js";

// Récupération works API
async function getWorks() {
  let rep = await fetch("http://localhost:5678/api/works");
  works = await rep.json();
  return works;
}

//Affichage des travaux sur la page d'accueil
async function displayWorksHomePage(filter) {
  works = await getWorks();
  const filteredWorks =
    currentFilter && currentFilter.id !== "Tout"
      ? works.filter((work) => work.categoryId === currentFilter.id)
      : works;
  gallery.innerHTML = "";
  for (let i = 0; i < filteredWorks.length; i++) {
    const postWork = document.createElement("figure");
    const postImg = document.createElement("img");
    postImg.src = filteredWorks[i].imageUrl;
    const postTitle = document.createElement("figcaption");
    postTitle.innerHTML = filteredWorks[i].title;

    // rattachement aux div parents pour afficher les éléments sur la page
    gallery.appendChild(postWork);
    postWork.appendChild(postImg);
    postWork.appendChild(postTitle);

    postWork.setAttribute("categoryId", filteredWorks[i].categoryId);
  }
  // Extraction des catgeroies depuis works
  const categories = extractCategoriesFromWorks(works);
  displayFilters(categories, filter);
}

function extractCategoriesFromWorks(works) {
  const categories = [
    {
      id: "Tout",
      name: "Tout",
    },
  ];
  for (let work of works) {
    const workCategory = work.category;
    if (workCategory && workCategory.id && workCategory.name) {
      const categoryId = workCategory.id;
      const categoryName = workCategory.name;
      const category = { id: categoryId, name: categoryName };
      if (!categories.some((c) => c.id === categoryId)) {
        categories.push(category);
      }
    }
  }
  return categories;
}
// Affichage des filtres avec les différentes catégories
async function displayFilters(categories, filter) {
  const filtersContainer = document.getElementById("Filters");
  filtersContainer.innerHTML = ""; // Supprime les anciens filtres
  filtersContainer.classList.add("filter-position");

  for (let category of categories) {
    const btnFilter = document.createElement("button");
    btnFilter.innerHTML = category.name;
    btnFilter.classList.add("filter-button");
    if (filter === category.name) {
      btnFilter.classList.add("active-filter");
    }
    filtersContainer.appendChild(btnFilter);

    btnFilter.addEventListener("click", () => {
      ActiveFilter(btnFilter);
      currentFilter = category;
      displayWorksHomePage(category.name);
    });
  }
}

function ActiveFilter(btnFilter) {
  const isActive = btnFilter.classList.contains("active-filter");

  if (isActive) {
    btnFilter.classList.remove("active-filter");
  } else {
    btnFilter.classList.add("active-filter");
  }
}

async function init() {
  await getWorks();
  const categories = extractCategoriesFromWorks(works);
  displayFilters(categories);
  displayWorksHomePage();
}

init();

// récupération du token dans le local Storage
const userToken = localStorage.getItem("token");

if (userToken) {
  // changement du login en logout
  const loginButton = document.querySelector("#loginButton");
  loginButton.innerHTML = "<a href='javascript:void(0)'>logout</a>";

  // décalage des éléments de navigation pour afficher la barre de modification
  const h1Header = document.querySelector("header h1");
  h1Header.style.marginTop = "38px";
  const nav = document.querySelector("nav");
  nav.style.marginTop = "38px";

  //affichage de la barre de modification
  const modeEditionBandeau = document.querySelector(".mode-edition");
  modeEditionBandeau.style.display = "flex";

  // écouteur d'évènement pour retirer le token du localStorage au logout
  loginButton.addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ajout des boutons modifier et positionnement "Mes Projets"
  document.querySelector("#introduction i").style.display = "block";
  document.querySelector("#portfolio i").style.display = "block";
  document.querySelector("#Filters").style.display = "none";
  document.querySelector(".portfolio-title").style.marginLeft = "115px";

  //MODALE

  const modal = document.getElementById("myModal");
  const modalContent = document.querySelector(".modalContent");
  const openModalButton = document.getElementById("openModalButton");
  const closeModalButton = document.querySelectorAll(".closeModalButton");
  const mediaListing = document.getElementById("mediaListing");
  const addPhoto = document.getElementById("addPhoto");
  const modalGallery = document.querySelector(".modalGallery");

  //écouteur d'évènement pour ouvrir la modale
  openModalButton.addEventListener("click", function () {
    openModal();
    modalContent.setAttribute("tabindex", 3);
  });

  // déclaration d'une varaible pour savoir si les images sont importées ou non dans la modale
  let imagesImported = false;

  // création de la gallery dans la modale
  function createModalGallery() {
    for (let i = 0; i < works.length; i++) {
      const newWork = document.createElement("figure");
      newWork.setAttribute("data-id", works[i].id);
      const newWorkImg = document.createElement("img");
      newWorkImg.src = works[i].imageUrl;
      const newWorkText = document.createElement("figcaption");
      newWorkText.innerHTML = "editer";
      const newDustBin = document.createElement("div");
      newDustBin.classList = "dustbin";
      newDustBin.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
      newWork.setAttribute("tabindex", 3);
      const modalGalleryBar = document.querySelector(".modalGalleryBar");
      modalGalleryBar.setAttribute("tabindex", 3);
      const boutonAjoutPhoto = document.getElementById("ajoutPhoto");
      boutonAjoutPhoto.setAttribute("tabindex", 3);
      const boutonSupprModal = document.getElementById("boutonSupprModal");
      boutonSupprModal.setAttribute("tabindex", 3);

      modalGallery.appendChild(newWork);
      newWork.appendChild(newWorkImg);
      newWork.appendChild(newWorkText);
      newWork.appendChild(newDustBin);

      imagesImported = true;

      // écouteur d'évènement sur les icones poubelles pour supprimer une image
      newDustBin.addEventListener("click", function () {
        const workId = newWork.getAttribute("data-id");
        deleteWork(workId, newWork);
      });
    }
  }

  // fonction pour afficher la modale
  const openModal = async function () {
    modal.style.display = "flex";
    if (!imagesImported) {
      createModalGallery();

      // écouteur d'évènement pour changer le contenu de la modale au clique sur le bouton ajout Photo (page 2 de la modale)
      document
        .getElementById("ajoutPhoto")
        .addEventListener("click", function () {
          mediaListing.style.display = "none";
          addPhoto.style.display = "flex";
        });
    }
  };

  // fonction pour fermer la modale
  const closeModal = function () {
    modal.style.display = "none";
    mediaListing.style.display = "flex";
    addPhoto.style.display = "none";
  };

  //écouteur d'évènement pour fermer la modale au click sur la croix
  Array.from(closeModalButton).forEach((element) => {
    element.addEventListener("click", function (e) {
      closeModal();
    });
  });

  // //écouteur d'évènement pour fermer la modale au clique en dehors de celle-ci
  modal.addEventListener("click", function (e) {
    if (e.target !== modal) {
      return;
    } else if (e.target !== modalContent) {
      closeModal();
    }
  });

  // écouteur d'évènement pour fermer la modale si on appuie sur le bouton Echap
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
      closeModal(e);
    }
  });

  // fonction pour supprimer les travaux
  async function deleteWork(workId, worksElements) {
    const response = await fetch(`${apiURL}works/${workId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "DELETE",
    });
    if (response.ok) {
      worksElements.remove();
      const modalWorkElement = document.querySelector(
        `figure[data-id="${workId}"]`
      );
      if (modalWorkElement) {
        modalWorkElement.remove();
      }
    }
  }

  // écouteur d'évènement pour retourner sur la gallery dans la modale (page 1 de la modale)
  document
    .getElementById("returnToMediaListing")
    .addEventListener("click", function () {
      mediaListing.style.display = "flex";
      addPhoto.style.display = "none";
      document.getElementById("postNewPhotoForm").reset();
      retirerPrevisualisation();
    });

  // fonction pour afficher la prévisualisation de l'image dans le formulaire
  function afficherImage() {
    let file = document.getElementById("plusAjoutPhoto").files;
    let imgToShow = document.getElementById("imgToShow");
    const image = document.getElementById("plusAjoutPhoto");
    const iconeLandscape = document.getElementById("iconeLandscape");
    const legendAjoutPhoto = document.getElementById("legendAjoutPhoto");
    const tailleFichier = document.getElementById("tailleFichier");
    if (file.length > 0) {
      let fileReader = new FileReader();
      fileReader.onload = function (event) {
        imgToShow.setAttribute("src", event.target.result);
        imgToShow.style.width = "129px";
        imgToShow.style.height = "169px";
        image.style.display = "none";
        iconeLandscape.style.display = "none";
        legendAjoutPhoto.style.display = "none";
        tailleFichier.style.display = "none";
      };
      fileReader.readAsDataURL(file[0]);
    }
  }

  document
    .getElementById("plusAjoutPhoto")
    .addEventListener("change", function () {
      afficherImage();
    });

  let image = document.getElementById("plusAjoutPhoto");
  let titre = document.getElementById("titreAjoutPhoto");
  let categorie = document.getElementById("categorieAjoutPhoto");
  const validAjoutPhoto = document.getElementById("validAjoutPhoto");

  // fonction qui passe le bouton Valider en vert si tous les champs sont remplis
  function checkFormInputs() {
    image = document.getElementById("plusAjoutPhoto");
    titre = document.getElementById("titreAjoutPhoto");
    categorie = document.getElementById("categorieAjoutPhoto");
    if (
      image.value.length > 0 &&
      titre.value.length > 0 &&
      categorie.value.length > 0
    ) {
      validAjoutPhoto.style.backgroundColor = "#1D6154";
    } else {
      validAjoutPhoto.style.backgroundColor = "#A7A7A7";
    }
  }

  // écouteur d'évènement pour checker les inputs de mon formulaire
  Array.from(document.querySelector(".inputForm")).forEach(function (element) {
    element.addEventListener("change", function () {
      checkFormInputs();
    });
  });

  // fonction pour envoyer une nouvelle photo
  async function sendNewPhoto() {
    const formData = new FormData(document.getElementById("postNewPhotoForm"));
    const newPhotoPosted = await fetch(`${apiURL}works`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
      method: "POST",
    });
    const result = await newPhotoPosted.json();

    if (result) {
      // creation du nouveau travail et affichage dynamique

      // dans la Gallery
      const newWork = document.createElement("figure");
      newWork.dataset.id = result.id;
      const newWorkImg = document.createElement("img");
      newWorkImg.src = result.imageUrl;
      const newWorkText = document.createElement("figcaption");
      newWorkText.innerHTML = result.title;
      newWork.setAttribute("categoryId", result.categoryId);

      gallery.appendChild(newWork);
      newWork.appendChild(newWorkImg);
      newWork.appendChild(newWorkText);

      // dans la modale
      const newWorkModal = document.createElement("figure");
      newWorkModal.setAttribute("data-id", result.id);
      const newWorkImgModal = document.createElement("img");
      newWorkImgModal.src = result.imageUrl;
      const newWorkTextModal = document.createElement("figcaption");
      newWorkTextModal.innerHTML = "editer";
      const newDustBin = document.createElement("div");
      newDustBin.classList = "dustbin";
      newDustBin.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
      newWorkModal.setAttribute("tabindex", 3);

      modalGallery.appendChild(newWorkModal);
      newWorkModal.appendChild(newWorkImgModal);
      newWorkModal.appendChild(newWorkTextModal);
      newWorkModal.appendChild(newDustBin);

      newDustBin.addEventListener("click", function () {
        const workId = newWork.getAttribute("data-id");
        deleteWork(workId, newWork);
      });
    }
  }

  // ecouteur d'évènement à l'envoie du formulaire
  document
    .getElementById("postNewPhotoForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // si les champs ne sont pas remplis, envoyer un message d'alerte
      if (!image.value || !titre.value || !categorie.value) {
        alert("Veuillez remplir tous les champs requis");
      } else {
        // envoyer les données remplies dans le formulaire
        const image = document.getElementById("plusAjoutPhoto").value;
        const titre = document.getElementById("titreAjoutPhoto").value;
        const categorie = document.getElementById("categorieAjoutPhoto").value;

        // appel de la fonction pour envoyer le nouveau travail
        sendNewPhoto(image, titre, categorie);
        retirerPrevisualisation();
        document.getElementById("postNewPhotoForm").reset();
      }
    });

  // fonction qui réinitialise la prévisualisation de l'image dans le formulaire
  function retirerPrevisualisation() {
    imgToShow.removeAttribute("src");
    imgToShow.style.width = "0";
    imgToShow.style.height = "0";
    image.style.display = "flex";
    iconeLandscape.style.display = "flex";
    legendAjoutPhoto.style.display = "flex";
    tailleFichier.style.display = "flex";
  }
}
