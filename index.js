//getdata
const getData = async () => {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    const datas = await response.json();
    return datas;
  } catch (error) {
    alert(error);
  }
};

getData().then((data) => {
  if (!data) return;
  localStorage.setItem("data", JSON.stringify(data));
  loadInitailItems();
});

//create element function
const createElement = (name, classes, content) => {
  const element = document.createElement(name);
  if (content) {
    element.append(...content);
  }

  element.classList.add(...classes);

  return element;
};

//select element function
const selectedElement = (query) => {
  const element = document.querySelector(query);
  return element;
};

//////////////////////
const parent = selectedElement(".parent");
const loadMoreButton = selectedElement("#load-more");
const trendingLink = selectedElement("#trending-link");

let initialItems = 12;
let loadItems = 12;

const getStoredShows = () => {
  const storedData = localStorage.getItem("data");
  if (!storedData) return [];
  try {
    const parsed = JSON.parse(storedData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored shows", error);
    return [];
  }
};

//////////create function
function create(name, genres, rating, image, id) {
  const headingInCard = createElement("h5", ["name", "card-title"]);
  const para1 = createElement("p", ["genres", "card-text"]);
  const para2 = createElement("p", ["rating", "card-text"]);
  const img = createElement("img", ["card", "card-one"]);
  const boxDiv = createElement(
    "div",
    ["card-box", ",card-body", "position-absolute", "text-white"],
    [headingInCard, para1, para2]
  );
  const card = createElement(
    "div",
    ["col", "position-relative", "parent-col", "margin-card"],
    [img, boxDiv]
  );
  card.id = id;
  const poster = image?.medium || "";
  img.src = poster;
  img.alt = `${name} poster`;
  headingInCard.innerText = `${name}`;
  para1.innerText = genres.join("|");
  para2.innerText = rating?.average ?? "N/A";
  return parent.append(card);
}

//////////for loading the initial items(the first items)
function loadInitailItems() {
  let shows = getStoredShows();
  if (!shows || !shows.length) return;
  parent.innerHTML = "";
  let counter = 0;
  for (const { name, genres, rating, image, id } of shows) {
    if (counter < initialItems) {
      create(name, genres, rating, image, id);
    }
    counter += 1;
  }
  loadMoreButton.style.display = shows.length > initialItems ? "block" : "none";
  nextPage(document.querySelectorAll(".parent-col"));
}

/////////loading function to load data when load button got clicked
async function loadData() {
  let shows = getStoredShows();
  if (!shows.length) return;
  let currentItems = document.querySelectorAll(".card-one").length;
  let counter = 0;

  for (const { name, genres, rating, image, id } of shows) {
    if (counter >= currentItems && counter < loadItems + currentItems) {
      create(name, genres, rating, image, id);
    }
    counter += 1;
  }

  if (document.querySelectorAll(".card-one").length === shows.length) {
    loadMoreButton.style.display = "none";
  }

  const cardss = document.querySelectorAll(".parent-col");
  nextPage(cardss);
}

loadMoreButton.addEventListener("click", loadData);

//////////trending
function showTrending() {
  const shows = getStoredShows();
  if (!shows.length) {
    getData().then((data) => {
      if (data) {
        localStorage.setItem("data", JSON.stringify(data));
        showTrending();
      }
    });
    return;
  }

  const trendingShows = shows
    .filter(({ rating }) => rating && rating.average)
    .sort((a, b) => b.rating.average - a.rating.average)
    .slice(0, initialItems);

  parent.innerHTML = "";
  trendingShows.forEach(({ name, genres, rating, image, id }) => {
    create(name, genres, rating, image, id);
  });
  loadMoreButton.style.display = "none";
  nextPage(document.querySelectorAll(".parent-col"));
}

trendingLink?.addEventListener("click", (event) => {
  event.preventDefault();
  showTrending();
});

/////////search live
const searchInput = selectedElement("#search-form");
searchInput.addEventListener("keyup", search);
function search(e) {
  const inputValue = e.target.value.toLowerCase().trim();
  const shows = getStoredShows();
  if (!shows.length) return;

  if (!inputValue) {
    loadInitailItems();
    return;
  }

  const matches = shows.filter(({ name }) =>
    name.toLowerCase().includes(inputValue)
  );

  parent.innerHTML = "";
  matches.forEach(({ name, genres, rating, image, id }) => {
    create(name, genres, rating, image, id);
  });

  loadMoreButton.style.display = "none";
  nextPage(document.querySelectorAll(".parent-col"));
}

/////////////////set id
function nextPage(cardsParent) {
  return cardsParent.forEach((card) => {
    card.addEventListener("click", () => {
      const showId = card.id;
      localStorage.setItem("showId", showId);
      window.location.href = "./pages/episodes.html";
      // window.location.href= 'http://192.168.166.253:13914/Build%20Wbsite/episodes.html';
    });
  });
}
