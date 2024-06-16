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
  localStorage.setItem("data", JSON.stringify(data));
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

let initialItems = 12;
let loadItems = 12;

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
  img.src = `${image.medium}`;
  headingInCard.innerText = `${name}`;
  para1.innerText = genres.join("|");
  para2.innerText = rating.average;
  return parent.append(card);
}

//////////for loading the initial items(the first items)
function loadInitailItems() {
  let shows = JSON.parse(localStorage.getItem("data"));
  let counter = 0;
  for (const { name, genres, rating, image, id } of shows) {
    if (counter < initialItems) {
      create(name, genres, rating, image, id);
    }
    counter += 1;
  }
}

loadInitailItems();

/////////loading function to load data when load button got clicked
async function loadData() {
  let shows = JSON.parse(localStorage.getItem("data"));
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

/////////search live
const searchInput = selectedElement("#search-form");
searchInput.addEventListener("keyup", search);
function search(e) {
  let inputValue = e.target.value.toLowerCase().trim();
  let names = document.querySelectorAll("h5.name");
  names.forEach((name) => {
    if (name.textContent.toLowerCase().includes(inputValue)) {
      name.parentElement.parentElement.style.display = "block";
    } else {
      name.parentNode.parentNode.style.display = "none";
    }
  });
}

/////////////////set id
const cards = document.querySelectorAll(".parent-col");
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

nextPage(cards);
