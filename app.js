const API_URL = "https://api.discogs.com/database/search";
const TOKEN = "QEqaJTibcnypJXeltJbqHnpWZFEkfFBLMCbyXEtM"; // vlož svůj token z Discogs

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");

const collectionDiv = document.getElementById("collection");
const emptyMsgCol = document.getElementById("emptyMsgCol");

const wishlistDiv = document.getElementById("wishlist");
const emptyMsgWish = document.getElementById("emptyMsgWish");

let collection = JSON.parse(localStorage.getItem("vinylCollection") || "[]");
let wishlist = JSON.parse(localStorage.getItem("vinylWishlist") || "[]");

// --- ukládání
function saveCollection() {
  localStorage.setItem("vinylCollection", JSON.stringify(collection));
  renderCollection();
}
function saveWishlist() {
  localStorage.setItem("vinylWishlist", JSON.stringify(wishlist));
  renderWishlist();
}

// --- vyhledávání
async function search() {
  const query = searchInput.value.trim();
  if (!query) {
    resultsDiv.innerHTML = "";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading…</p>";

  try {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&format=Vinyl&token=${TOKEN}`);
    const data = await res.json();

    resultsDiv.innerHTML = "";
    (data.results || []).forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = item.id;

      const img = document.createElement("img");
      img.src = item.cover_image || "";
      img.alt = item.title;
      card.appendChild(img);

      const title = document.createElement("h3");
      title.textContent = item.title;
      card.appendChild(title);

      const year = document.createElement("p");
      year.textContent = item.year || "";
      card.appendChild(year);

      const btnRow = document.createElement("div");
      btnRow.className = "btn-row";

      // kolekce
const btnAddCol = document.createElement("button");
if (collection.find(x => x.id === item.id)) {
  btnAddCol.textContent = "✔ In the collection";
  btnAddCol.classList.add("added");
} else {
  btnAddCol.textContent = "➕ Collection";
  btnAddCol.onclick = () => {
    addToCollection(item);
    btnAddCol.textContent = "✔ V kolekci";
    btnAddCol.classList.add("added");
    btnAddCol.onclick = null; // už nelze znovu kliknout
  };
}

// wishlist
const btnWish = document.createElement("button");
if (wishlist.find(x => x.id === item.id)) {
  btnWish.textContent = "✔ In the wishlist";
  btnWish.classList.add("added");
} else {
  btnWish.textContent = "⭐ Wishlist";
  btnWish.onclick = () => {
    addToWishlist(item);
    btnWish.textContent = "✔ Ve wishlistu";
    btnWish.classList.add("added");
    btnWish.onclick = null;
  };
}

      btnRow.appendChild(btnAddCol);
      btnRow.appendChild(btnWish);
      card.appendChild(btnRow);

      resultsDiv.appendChild(card);
    });

  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// --- kolekce
function addToCollection(item) {
  if (collection.find(x => x.id === item.id)) return;
  collection.push({
    id: item.id,
    title: item.title,
    year: item.year,
    cover: item.cover_image
  });
  saveCollection();
}

function removeFromCollection(id) {
  collection = collection.filter(x => x.id !== id);
  saveCollection();
  updateSearchResultsButtons();
}

function renderCollection() {
  collectionDiv.innerHTML = "";
  if (!collection.length) {
    emptyMsgCol.style.display = "block";
    return;
  }
  emptyMsgCol.style.display = "none";

  collection.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.cover || "";
    card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = item.title;
    card.appendChild(title);

    const year = document.createElement("p");
    year.textContent = item.year || "";
    card.appendChild(year);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "🗑️ Remove";
    btnRemove.onclick = () => removeFromCollection(item.id);

    btnRow.appendChild(btnRemove);
    card.appendChild(btnRow);

    collectionDiv.appendChild(card);
  });
}

// --- wishlist
function addToWishlist(item) {
  if (wishlist.find(x => x.id === item.id)) return;
  wishlist.push({
    id: item.id,
    title: item.title,
    year: item.year,
    cover: item.cover_image
  });
  saveWishlist();
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(x => x.id !== id);
  saveWishlist();
  updateSearchResultsButtons();
}

function renderWishlist() {
  wishlistDiv.innerHTML = "";
  if (!wishlist.length) {
    emptyMsgWish.style.display = "block";
    return;
  }
  emptyMsgWish.style.display = "none";

  wishlist.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.cover || "";
    card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = item.title;
    card.appendChild(title);

    const year = document.createElement("p");
    year.textContent = item.year || "";
    card.appendChild(year);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "🗑️ Remove";
    btnRemove.onclick = () => removeFromWishlist(item.id);

    btnRow.appendChild(btnRemove);
    card.appendChild(btnRow);

    wishlistDiv.appendChild(card);
  });
}

// --- aktualizace tlačítek ve vyhledávání
function updateSearchResultsButtons() {
  const cards = resultsDiv.querySelectorAll(".card");
  cards.forEach(card => {
    const id = parseInt(card.dataset.id);
    const btns = card.querySelectorAll("button");

    btns.forEach(btn => {
      // kolekce
      if (btn.textContent.includes("V kolekci") || btn.textContent.includes("Do kolekce")) {
        const inCol = collection.find(x => x.id === id);
        if (inCol) {
          btn.textContent = "✔ V kolekci";
          btn.classList.add("added");
          btn.onclick = null;
        } else {
          btn.textContent = "➕ Do kolekce";
          btn.classList.remove("added");
          btn.onclick = () => {
            const item = getItemDataFromCard(card);
            addToCollection(item);
            updateSearchResultsButtons();
          };
        }
      }

      // wishlist
      if (btn.textContent.includes("Ve wishlistu") || btn.textContent.includes("Do wishlistu")) {
        const inWish = wishlist.find(x => x.id === id);
        if (inWish) {
          btn.textContent = "✔ Ve wishlistu";
          btn.classList.add("added");
          btn.onclick = null;
        } else {
          btn.textContent = "⭐ Do wishlistu";
          btn.classList.remove("added");
          btn.onclick = () => {
            const item = getItemDataFromCard(card);
            addToWishlist(item);
            updateSearchResultsButtons();
          };
        }
      }
    });
  });
}

function getItemDataFromCard(card) {
  return {
    id: parseInt(card.dataset.id),
    title: card.querySelector("h3").textContent,
    year: card.querySelector("p").textContent,
    cover_image: card.querySelector("img").src
  };
}

// --- taby
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.target).classList.add("active");
  });
});

// --- eventy
searchBtn.addEventListener("click", search);

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

searchInput.addEventListener("input", () => {
  if (searchInput.value.trim() === "") {
    resultsDiv.innerHTML = "";
  }
});

// --- inicializace
renderCollection();
renderWishlist();
