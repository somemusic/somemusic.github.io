let tracks = []; // Comment and uncomment below if local
// let tracks = [{"titre":"Chill Mountain 1","fichier":"assets/mp3/CM01.mp3","miniature":"assets/img/ChillMountain.png","description":"Piano piece. Peaceful & relaxing.","date":"May 2023","tags":["chill mountain","piano"]},{"titre":"Chill Mountain 2","fichier":"assets/mp3/CM02.mp3","miniature":"assets/img/ChillMountain.png","description":"Piano piece. Peaceful & relaxing.","date":"May20 23","tags":["chill mountain","piano"]},{"titre":"Chill Mountain 3","fichier":"assets/mp3/CM03.mp3","miniature":"assets/img/ChillMountain.png","description":"Piano piece. Peaceful & relaxing.","date":"May 2023","tags":["chill mountain","piano"]},{"titre":"Tokai Rock","fichier":"assets/mp3/Tokai Rock.mp3","miniature":"assets/img/Handpan_EP.png","description":"Little composition for 1 handpan drum and 2 baguettes.","date":"October 2023","tags":["handpan ep"]},{"titre":"Som Tree","fichier":"assets/mp3/Som Tree.mp3","miniature":"assets/img/Handpan_EP.png","description":"Little composition for 1 handpan drum and 2 baguettes.","date":"October 2023","tags":["handpan ep"]},{"titre":"Iridescence","fichier":"assets/mp3/Iridescence.mp3","miniature":"assets/img/Handpan_EP.png","description":"Little composition for 1 handpan drum and 2 baguettes.","date":"October 2023","tags":["handpan ep"]}]; 
let allTags = []; // Comment and uncomment below if local
// let allTags = [{"label":"chill mountain","couleur":"#007BFF"},{"label":"piano","couleur":"#6C757D"},{"label":"handpan ep","couleur":"#6610f2"}]; 
let allTag = { "label": "ALL", "couleur": "#000000" }

let currentPage = 1;
const pageSize = 5;
let filteredTracks = [];
let filteredTags = [allTag];

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  const tracksRequest = await fetch("../data/tracks.json"); // Comment if local
  const tagsRequest = await fetch("../data/tags.json"); // Comment if local
  tracks = await tracksRequest.json(); // Comment if local
  allTags = await tagsRequest.json(); // Comment if local
  filteredTracks = [...tracks].sort((a, b) => new Date(b.date) - new Date(a.date));
  renderTracks();
  filteredTags.push(...allTags);
  renderCurrentTags();
  renderPagination();
});

document.getElementById("project-list").addEventListener("change", function(event) {
      const valeur = event.target.value;
      filterTracksByTag(valeur);
    });

document.getElementById("audio-player").addEventListener("ended", function(event){
  playNextSong();
});

// RENDERING
function renderTracks() {
  const container = document.getElementById("track-list");
  container.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageTracks = filteredTracks.slice(start, start + pageSize);

  for (const track of pageTracks) {
    const article = document.createElement("article");
    article.innerHTML = `
      <div class="grid">
        <div class="article-item"><img src="${track.miniature}" alt="Miniature" class="miniature"></div>
        <div class="article-item">
          <h3>${track.titre}</h3>
          <p class="song-date">${track.date}</p>
          <div>
            <button class="play-pause-buttons" onclick="playTrack('${track.fichier}', '${track.titre}')"><img class="play-download-button" src="assets/img/play-button.svg"/></button>
            <a target="_blank" href="${track.fichier}" download><button class="play-pause-buttons"><img class="play-download-button" src="assets/img/download-button.svg"/></button></a>
          </div> 
        </div>
        <div class="article-item"><p>${track.description}</p></div>
        <div class="article-item">${track.tags.map(t => getTagByLabel(t)).join(" ")}</div>
      </div>
    `;
    container.appendChild(article);
  }
}

function getTagByLabel(label) {
  const foundTag = allTags.find(t => t.label == label);
  return `<span class="tag" title="Only display songs with this tag" style="background-color: ${foundTag.couleur}; cursor: pointer" onclick="filterTracksByTag('${foundTag.label}')">${foundTag.label}</span>`
}

function renderPagination() {
  const totalPages = Math.ceil(filteredTracks.length / pageSize);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTracks();
    };
    if (i === currentPage) btn.setAttribute("aria-current", "page");
    li.appendChild(btn);
    pagination.appendChild(li);
  }
}

function renderCurrentTags() {
  const currentTags = document.getElementById('current-tags');
  currentTags.innerHTML = filteredTags.map(t => `<span class="tag" title="Only display songs with this tag" style="background-color: ${t.couleur}; cursor: pointer" onclick="filterTracksByTag('${t.label}')">${t.label}</span>`).join(" ");
}

// FUNCTIONS
function filterTracksByTag(label) {
  if (label == 'ALL') {
    filteredTracks = tracks;
    filteredTags = [allTag];
    filteredTags.push(...allTags);
  } else {
    label = label.toLowerCase();
    filteredTracks = tracks.filter(track =>
      track.tags.some(t => t.toLowerCase().includes(label)));
    let tagToFilter = allTags.find(t => t.label == label);
    filteredTags = [allTag];
    filteredTags.push(tagToFilter);
  };

  currentPage = 1;
  renderTracks();
  renderCurrentTags();
  renderPagination();
}

function searchTracks(searchValue){
  if (searchValue && searchValue.length >= 3){
    filteredTracks = tracks.filter(track => 
        track.tags.some(tag => tag.toLowerCase() == searchValue.toLowerCase())
        || track.titre.toLowerCase().includes(searchValue.toLowerCase())
        || track.description.toLowerCase().includes(searchValue.toLowerCase()));
  } else if (!searchValue || searchValue.length == 0){
    filteredTracks = tracks;
  }

  filteredTags = [allTag]
  filteredTags.push(...allTags);
  currentPage = 1;
  renderTracks();
  renderCurrentTags();
  renderPagination();
}

// PLAYER
function playTrack(src, title) {
  const player = document.getElementById("audio-player");
  const label = document.getElementById("player-title");
  player.src = src;
  player.play();
  
  label.textContent = title;
}

function playNextSong(){
  const label = document.getElementById("player-title");
  const currentSong = label.textContent;
  const indexOfSongInTracks = filteredTracks.findIndex(track => track.titre == currentSong);
  console.log(indexOfSongInTracks);
  const nextTrack = filteredTracks[indexOfSongInTracks + 1]; 
  console.log(nextTrack);
  if (nextTrack){
    const player = document.getElementById("audio-player");
    player.src = nextTrack.fichier;
    player.play();
    label.textContent = nextTrack.titre;
  }
}