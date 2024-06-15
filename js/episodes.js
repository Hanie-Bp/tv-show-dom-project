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

const parent = selectedElement(".parent");

//////generate season and ep

function generateSeasonAndEp(season, number, name) {
  let seasonNum = season < 10 ? `0${season}` : season;
  let episodeNum = number < 10 ? `0${number}` : number;

  let sAndEp = `S${seasonNum}-E${episodeNum} ${name}`;
  return sAndEp;
}

//////create function
const select = selectedElement("#floatingSelect");

function create(name, season, number, image, summary, url, id) {
  const headingInCard = createElement("h6", [
    "name",
    "card-title",
    "opacity-summary",
  ]);
  const divSummary = createElement("div", ["position-absolute", "summary"]);
  divSummary.innerHTML += summary;
  const img = createElement("img", ["card", "img-ep"]);
  const linkDiv = createElement("a", ["text-white", "icon-container", "mt-4"]);
  linkDiv.innerHTML = `<i class="bi bi-play-circle  p-2 fs-4 icon  text-info"></i>`;
  const boxDiv = createElement(
    "div",
    ["card-body", "text-white", "p-2", "position-relative", "one"],
    [headingInCard, linkDiv, divSummary]
  );
  const card = createElement(
    "div",
    [
      "col-2",
      "position-relative",
      "d-flex",
      "flex-column",
      "p-0",
      "height-card",
      "mx-2",
      "parent-card",
      "bg-color1",
    ],
    [img, boxDiv]
  );
  linkDiv.href = url;
  card.name = `${name}`;
  img.src = `${image.medium}`;
  headingInCard.innerText = generateSeasonAndEp(season, number, name);
  const option = createElement("option", ["op"]);
  option.innerText = generateSeasonAndEp(season, number, name);
  option.id = id;
  option.value = `${name}`;
  select.append(option);
  return parent.append(card);
}

////////display function

const displayEpisodes = async (showId) => {
  try {
    const { data } = await axios.get(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    for (const { name, season, number, image, summary, url, id } of data) {
      create(name, season, number, image, summary, url, id);
    }

    const cards = document.querySelectorAll(".parent-card");
    select.addEventListener("change", function () {
      let selectedValue = this.value;
      cards.forEach((card) => {
        if (selectedValue.toLowerCase() === "all episodes") {
          card.classList.remove("display");
        } else if (!selectedValue.includes(card.name)) {
          card.classList.add("display");
        } else if (selectedValue.includes(card.name)) {
          card.classList.remove("display");
        }
      });
    });
  } catch (error) {
    alert(error);
    displayEpisodes(showId);
  }
};

/////get id
const getData = async () => {
  const showId = localStorage.getItem("showId");
  if (showId) {
    await displayEpisodes(showId);
  }
};

getData();
