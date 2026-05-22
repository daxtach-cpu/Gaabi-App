document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ÉLÉMENTS DU DOM ---
   
const audio = new Audio();
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnSearch = document.getElementById('btn-search');
const btnNotif = document.getElementById('btn-notif');
const playIcon = document.getElementById('play-icon');
const motivationBox = document.getElementById('motivation-box');
const motivationText = document.getElementById('motivation-text');
const progressFill = document.getElementById('progress-fill');
const currentTimeText = document.getElementById('current-time');
const durationText = document.getElementById('total-duration');
const badge = btnNotif ? btnNotif.querySelector('.badge') : null;





// Créer la barre de recherche
const searchBar = document.createElement('div');
searchBar.id = 'search-bar';
searchBar.style.cssText = `
    display: none;
    padding: 10px 16px;
    background: white;
    position: sticky;
    top: 56px;
    z-index: 40;
    border-bottom: 1px solid #e2e8f0;
`;
searchBar.innerHTML = `
    <input 
        type="text" 
        id="search-input"
        placeholder="🔍 Rechercher une citation..."
        style="
            width: 100%;
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid #e2e8f0;
            outline: none;
            font-size: 14px;
            background: #f8fafc;
        "
    />
    <div id="search-resultats" style="
        margin-top: 8px;
        display: none;
    "></div>
`;

// Insérer après la navbar
const navbar = document.querySelector('.navbar');
navbar.insertAdjacentElement('afterend', searchBar);

// Ouvrir/fermer
btnSearch.addEventListener('click', () => {
    const visible = searchBar.style.display === 'block';
    searchBar.style.display = visible ? 'none' : 'block';
    if (!visible) {
        document.getElementById('search-input').focus();
    }
});

// Recherche en temps réel
document.getElementById('search-input').addEventListener('input', (e) => {
    const terme = e.target.value.toLowerCase().trim();
    const resultats = document.getElementById('search-resultats');

    if (terme === '') {
        resultats.style.display = 'none';
        resultats.innerHTML = '';
        return;
    }

    const trouves = baseCitations.filter(c =>
        c.texte.toLowerCase().includes(terme)
    );

    if (trouves.length === 0) {
        resultats.style.display = 'block';
        resultats.innerHTML = `
            <p style="
                text-align:center; 
                color:#94a3b8; 
                padding:10px;
                font-size:14px;
            ">Aucune citation trouvée</p>
        `;
        return;
    }

    resultats.style.display = 'block';
    resultats.innerHTML = trouves.map(c => `
        <div class="search-item" 
             data-texte="${c.texte}"
             data-cat="${c.cat}"
             style="
                padding: 10px 14px;
                margin: 4px 0;
                background: #f8fafc;
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                border: 1px solid #e2e8f0;
             ">
            <span style="
                font-size:11px; 
                color:#6366f1; 
                font-weight:bold;
                text-transform:uppercase;
            ">${c.cat}</span>
            <p style="margin-top:4px; color:#334155">
                ${c.texte}
            </p>
        </div>
    `).join('');

    // Clic sur un résultat → affiche la citation
    resultats.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
            motivationText.innerText = item.dataset.texte;
            searchBar.style.display = 'none';
            document.getElementById('search-input').value = '';
            resultats.innerHTML = '';
        });
    });
});

// Fermer avec Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchBar.style.display = 'none';
        document.getElementById('search-input').value = '';
    }
});






// Base de notifications (vide au départ)
let notifications = [];
let citationsLues = 0;

// Ajouter une notification
function ajouterNotif(message, type, data = null) {
    const notif = {
        id: Date.now(),
        message,
        type,   // 'nouvelle_citation' | 'citation_jour' | 'stats'
        data,   // données liées
        lue: false,
        date: new Date().toLocaleTimeString()
    };
    notifications.unshift(notif); // ajoute en haut
    mettreAJourBadge();
}

// Badge rouge sur la cloche
function mettreAJourBadge() {
    const nonLues = notifications.filter(n => !n.lue).length;
    if (nonLues > 0) {
        badge.style.display = 'block';
        badge.textContent = nonLues > 9 ? '9+' : nonLues;
    } else {
        badge.style.display = 'none';
    }
}

// Ouvrir/fermer le panneau
btnNotif.addEventListener('click', () => {
    let panel = document.getElementById('notif-panel');
    if (panel) {
        panel.remove();
        return;
    }
    afficherPanelNotif();
});

function afficherPanelNotif() {
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        width: 300px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 999;
        max-height: 400px;
        overflow-y: auto;
    `;

    if (notifications.length === 0) {
        // Panneau VIDE
        panel.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <div style="font-size:40px">🔔</div>
                <p style="color:#94a3b8; margin-top:8px">
                    Aucune notification
                </p>
            </div>
        `;
    } else {
        // Panneau AVEC notifications
        panel.innerHTML = `
            <div style="padding:16px; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; 
                            justify-content:space-between; 
                            align-items:center;">
                    <strong>🔔 Notifications</strong>
                    <button id="btn-tout-lire" 
                        style="font-size:12px; 
                               color:#6366f1; 
                               cursor:pointer;">
                        Tout marquer lu
                    </button>
                </div>
            </div>
            <div id="notif-liste">
                ${notifications.map(n => `
                    <div class="notif-item" 
                         data-id="${n.id}"
                         style="
                            padding:14px 16px;
                            border-bottom:1px solid #f8fafc;
                            cursor:pointer;
                            background:${n.lue ? 'white' : '#f0f4ff'};
                            display:flex;
                            gap:10px;
                            align-items:flex-start;
                         ">
                        <span style="font-size:22px">
                            ${getIconeNotif(n.type)}
                        </span>
                        <div style="flex:1">
                            <p style="font-size:14px; 
                                      font-weight:${n.lue ? 'normal' : 'bold'}">
                                ${n.message}
                            </p>
                            <p style="font-size:11px; color:#94a3b8">
                                ${n.date}
                            </p>
                        </div>
                        ${n.data ? `
                            <span style="font-size:11px; 
                                         color:#6366f1;">
                                Voir →
                            </span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        // Marquer tout comme lu
        panel.querySelector('#btn-tout-lire')
             .addEventListener('click', () => {
            notifications.forEach(n => n.lue = true);
            mettreAJourBadge();
            panel.remove();
            afficherPanelNotif();
        });

        // Clic sur une notification
        panel.querySelectorAll('.notif-item')
             .forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const notif = notifications.find(n => n.id === id);
                if (notif) {
                    notif.lue = true;
                    mettreAJourBadge();

                    // Action selon le type
                    if (notif.type === 'nouvelle_citation' && notif.data) {
                        // Affiche la citation liée
                        motivationText.innerText = notif.data.texte;
                    }
                    if (notif.type === 'citation_jour' && notif.data) {
                        // Affiche citation du jour
                        motivationText.innerText = notif.data.texte;
                    }
                    panel.remove();
                    afficherPanelNotif();
                }
            });
        });
    }

    document.body.appendChild(panel);

    // Fermer en cliquant ailleurs
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && 
                e.target !== btnNotif) {
                panel.remove();
            }
        }, { once: true });
    }, 100);
}

function getIconeNotif(type) {
    switch(type) {
        case 'nouvelle_citation': return '💡';
        case 'citation_jour':     return '🌟';
        case 'stats':             return '🎯';
        default:                  return '🔔';
    }
}

// --- DÉCLENCHEURS AUTOMATIQUES ---

// 1. Nouvelle citation ajoutée → notif automatique
function ajouterCitation(citation) {
    baseCitations.push(citation);
    ajouterNotif(
        `Nouvelle citation : "${citation.texte.substring(0, 30)}..."`,
        'nouvelle_citation',
        citation
    );
}

// 2. Citation du jour → au chargement
window.addEventListener('load', () => {
    const citationDuJour = baseCitations[
        new Date().getDate() % baseCitations.length
    ];
    ajouterNotif(
        `Citation du jour : "${citationDuJour.texte.substring(0, 30)}..."`,
        'citation_jour',
        citationDuJour
    );
});

// 3. Stats → après 5 citations lues
function compterCitationLue() {
    citationsLues++;
    if (citationsLues === 5) {
        ajouterNotif(
            'Tu as lu 5 citations aujourd\'hui ! 🎉',
            'stats'
        );
    }
}











let categorieActive = 'tout';
let indexActuel = Math.floor(Math.random() * baseCitations.lenth);
let enLecture = false;
let intervalProgress = null;
let tempsDebut = 0;
let dureeEstimee = 0;

// 3. MUSIQUE DE FOND
const sons = [
    'assets/meditation_music.mp3',
    'assets/meditation_music1.mp3'
];
let indexSon = 0;
let ambianceStarted = false;
const audioAmbiance = new Audio(sons[0]);
audioAmbiance.volume = 0.08;
audioAmbiance.addEventListener('ended', () => {
    indexSon = (indexSon + 1) % sons.length;
    audioAmbiance.src = sons[indexSon];
    audioAmbiance.play();
});

function demarrerAmbiance() {
    if (!ambianceStarted) {
        audioAmbiance.play();
        ambianceStarted = true;
    }
}

// 4. UTILITAIRES
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCitationsFiltrees() {
    if (categorieActive === 'tout') return baseCitations;
    return baseCitations.filter(c => c.cat === categorieActive);
}

function afficherCitation(item) {
    if (!item) return;
    motivationText.style.opacity = 0;
    setTimeout(() => {
        motivationText.innerText = item.texte;
        motivationText.style.opacity = 1;
    }, 300);
}

// 5. LECTURE VOIX
function lire(texte) {
    window.speechSynthesis.cancel();
    clearInterval(intervalProgress);

    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR';
    u.rate = 0.85;
    u.pitch = 1.1;
    u.volume = 1.0;

    function parler() {
        const voix = window.speechSynthesis.getVoices();
        const voixFeminine = voix.find(v =>
            v.name.includes('Denise') ||
            v.name.includes('Hortense') ||
            v.lang === 'fr-FR'
        );
        if (voixFeminine) u.voice = voixFeminine;
        window.speechSynthesis.speak(u);
    }

    if (window.speechSynthesis.getVoices().length > 0) {
        parler();
    } else {
        window.speechSynthesis.onvoiceschanged = parler;
    }

    dureeEstimee = texte.length / 13 / 0.85;
    durationText.textContent = formatTime(dureeEstimee);
    progressFill.style.width = '0%';
    currentTimeText.textContent = '0:00';

    u.onstart = () => {
        tempsDebut = Date.now();
        intervalProgress = setInterval(() => {
            const ecoule = (Date.now() - tempsDebut) / 1000;
            const pct = Math.min((ecoule / dureeEstimee) * 100, 100);
            progressFill.style.width = pct + '%';
            currentTimeText.textContent = formatTime(ecoule);
        }, 200);
    };

    u.onend = () => {
        clearInterval(intervalProgress);
        progressFill.style.width = '100%';
        if (enLecture) {
            setTimeout(() => {
               indexActuel = Math.floor(Math.random() * getCitationsFiltrees().length);
                const prochaine = getCitationsFiltrees()[indexActuel];
                afficherCitation(prochaine);
                lire(prochaine.texte);
            }, 1000);
        }
    };
}

// 6. BOUTONS
btnPlay.addEventListener('click', () => {
    if (!enLecture) {
        enLecture = true;
        playIcon.textContent = '⏸';
        demarrerAmbiance();
        lire(motivationText.innerText);
    } else {
        enLecture = false;
        playIcon.textContent = '▶';
        window.speechSynthesis.cancel();
        clearInterval(intervalProgress);
    }
});

btnNext.addEventListener('click', () => {
    const citations = getCitationsFiltrees();
    indexActuel = (indexActuel + 1) % citations.length;
    afficherCitation(citations[indexActuel]);
    if (enLecture) lire(citations[indexActuel].texte);
});

btnPrev.addEventListener('click', () => {
    const citations = getCitationsFiltrees();
    indexActuel = (indexActuel - 1 + citations.length) % citations.length;
    afficherCitation(citations[indexActuel]);
    if (enLecture) lire(citations[indexActuel].texte);
});

// 7. FILTRES CATÉGORIES
window.filtrerCitations = function(cat, btn) {
    categorieActive = cat;
    indexActuel = 0;
    document.querySelectorAll('.category-bar button').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    const citations = getCitationsFiltrees();
    afficherCitation(citations[0]);
    if (enLecture) lire(citations[0].texte);
};

// Afficher première citation
const idxDepart = Math.floor(Math.random() * baseCitations.length);
afficherCitation(baseCitations[idxDepart]);

}); // FIN DOMContentLoaded





function handleShare(btn) {
  btn.classList.add('active-share');
  btn.querySelector('span').textContent = 'Partagé !';
  setTimeout(() => {
    btn.classList.remove('active-share');
    btn.querySelector('span').textContent = 'Partager';
  }, 1800);
}

function handleFav(btn) {
  btn.classList.toggle('active-fav');
  btn.querySelector('span').textContent =
    btn.classList.contains('active-fav') ? 'Favori ✓' : 'Favori';
}

function handleCopy(btn) {
  const textElement = document.getElementById('motivation-text');
  const text = textElement ? textElement.textContent.trim() : '';

  if (text) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  btn.classList.add('active-copy');
  btn.querySelector('span').textContent = 'Copié !';
  setTimeout(() => {
    btn.classList.remove('active-copy');
    btn.querySelector('span').textContent = 'Copier';
  }, 1800);
}