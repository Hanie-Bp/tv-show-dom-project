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
const showInfoBox = selectedElement(".show-info");

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
  divSummary.innerHTML += summary || "No summary available.";
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
  const poster = image?.medium || "";
  img.src = poster;
  img.alt = `${name} poster`;
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
    const [episodesRes, showRes, seasonsRes, castRes] = await Promise.all([
      axios.get(`https://api.tvmaze.com/shows/${showId}/episodes`),
      axios.get(`https://api.tvmaze.com/shows/${showId}`),
      axios.get(`https://api.tvmaze.com/shows/${showId}/seasons`),
      axios.get(`https://api.tvmaze.com/shows/${showId}/cast`),
    ]);

    const episodes = episodesRes.data || [];
    const show = showRes.data || {};
    const seasons = seasonsRes.data || [];
    const cast = castRes.data || [];

    for (const { name, season, number, image, summary, url, id } of episodes) {
      create(name, season, number, image, summary, url, id);
    }

    renderShowInfo(show, seasons, cast, episodes);

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

function renderShowInfo(show, seasons, cast, episodes) {
  if (!showInfoBox) return;

  const seasonCount = seasons.length || "N/A";
  const episodesBySeason = episodes.reduce((acc, ep) => {
    acc[ep.season] = (acc[ep.season] || 0) + 1;
    return acc;
  }, {});

  const castList = (cast || []).slice(0, 6).map(({ person, character }) => {
    const actor = person?.name || "Unknown";
    const role = character?.name ? ` as ${character.name}` : "";
    return `${actor}${role}`;
  });

  const rating = show?.rating?.average ?? "N/A";
  const premiered = show?.premiered ?? "N/A";
  const ended = show?.ended ? ` | Ended: ${show.ended}` : "";

  showInfoBox.innerHTML = `
    <h5 class="fw-bold mb-3 text-info">${show?.name || "Show details"}</h5>
    <p class="mb-1"><span class="text-info">Rating:</span> <strong>${rating}</strong></p>
    <p class="mb-1"><span class="text-info">Premiered:</span> ${premiered}${ended}</p>
    <p class="mb-2"><span class="text-info">Seasons:</span> ${seasonCount}</p>
    <div class="mb-2">
      <div class="small fw-bold"><span class="text-info">Episodes per season:</span></div>
      <ul class="list-unstyled mb-2">
        ${
          Object.keys(episodesBySeason).length
            ? Object.entries(episodesBySeason)
                .map(
                  ([season, count]) =>
                    `<li>Season ${season}: ${count} episodes</li>`
                )
                .join("")
            : "<li>No data</li>"
        }
      </ul>
    </div>
    <div>
      <div class="small fw-bold"><span class="text-info">Cast:</span></div>
      <ul class="list-unstyled mb-0">
        ${
          castList.length
            ? castList.map((item) => `<li>${item}</li>`).join("")
            : "<li>No cast info</li>"
        }
      </ul>
    </div>
  `;
}

/////get id
const getData = async () => {
  const showId = localStorage.getItem("showId");
  if (showId) {
    await displayEpisodes(showId);
  }
};

getData();
