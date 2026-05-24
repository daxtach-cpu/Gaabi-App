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


const baseCitations = [
{ cat: 'tout',          texte: "Chaque jour est une nouvelle chance." },
{ cat: 'courage',       texte: "Le courage n'est pas l'absence de peur." },
{ cat: 'courage',       texte: "Sois plus fort que tes excuses." },
{ cat: 'courage', texte: "Le plus fort n'est pas celui qui terrasse les autres, mais celui qui se maîtrise lors de la colère." },
{ cat: 'courage', texte: "Celui qui croit en Dieu et au Jour dernier, qu'il soit bon envers son voisin." },
{ cat: 'courage', texte: "L'ange Jibril n'a cessé de me recommander le voisin au point que j'ai cru qu'il allait lui donner droit à l'héritage." },
{ cat: 'courage', texte: "N'est pas croyant celui qui mange à sa faim alors que son voisin a faim à ses côtés." },
{ cat: 'courage', texte: "Le meilleur des compagnons auprès de Dieu est le meilleur pour son compagnon, et le meilleur des voisins est le meilleur pour son voisin." },
{ cat: 'courage', texte: "La patience est une lumière éclatante dans l'épreuve." },
{ cat: 'courage', texte: "Sache que la victoire accompagne la patience et que le soulagement accompagne l'affliction." },
{ cat: 'courage', texte: "Ne considérez aucune bonne action comme négligeable, ne serait-ce que de rencontrer votre frère avec un visage radieux." },
{ cat: 'courage', texte: "La patience est à la foi ce que la tête est au corps." },
{ cat: 'courage', texte: "Le plus courageux est celui qui pardonne alors qu'il a la capacité de se venger." },
{ cat: 'courage', texte: "N'est pas fort celui qui terrasse les gens, mais celui qui reste maître de soi." },
{ cat: 'courage', texte: "Une parole de vérité dite à un dirigeant injuste est la plus grande des luttes." },
{ cat: 'courage', texte: "Le croyant fort est meilleur et plus aimé de Dieu que le croyant faible." },
{ cat: 'courage', texte: "Si tu n'as pas de pudeur, fais ce qu'il te plaît." },
{ cat: 'courage', texte: "Le voisinage commence par la bienveillance avant la patience face à leurs torts." },
{ cat: 'courage', texte: "Chaque difficulté est suivie d'une facilité, ne perds jamais espoir." },
{ cat: 'courage', texte: "La main qui donne est supérieure à la main qui reçoit." },
{ cat: 'courage', texte: "Rends service à ton voisin, même si ce n'est qu'avec un sourire sincère." },
{ cat: 'sagesse', texte: "La vie ne fait pas le moine." },
{ cat: 'sagesse', texte: "Connais-toi toi-même." },
{ cat: 'sagesse', texte: "La sagesse n'est pas de ne jamais tomber, mais de se relever toujours plus fort." },
{ cat: 'sagesse', texte: "Le silence est le jardin de la réflexion." },
{ cat: 'sagesse', texte: "On ne voit bien qu'avec le cœur, l'essentiel est invisible pour les yeux." },
{ cat: 'sagesse', texte: "La vraie sagesse commence par le pardon de soi-même." },
{ cat: 'sagesse', texte: "Le temps guérit ce que la raison ne peut toucher." },
{ cat: 'sagesse', texte: "Ne mesure pas ton succès à ce que tu as, mais à ce que tu as donné." },
{ cat: 'sagesse', texte: "La patience est une fleur qui ne pousse pas dans tous les jardins." },
{ cat: 'sagesse', texte: "Un esprit en paix est le plus grand des trésors." },
{ cat: 'sagesse', texte: "Écoute le vent, il murmure les secrets de ceux qui savent attendre." },
{ cat: 'sagesse', texte: "La vie est courte, mais la trace d'un acte noble est éternelle." },
{ cat: 'sagesse', texte: "Le sage ne répond pas à l'offense, il laisse le temps parler pour lui." },
{ cat: 'sagesse', texte: "Le bonheur n'est pas une destination, c'est une façon de voyager." },
{ cat: 'sagesse', texte: "Mieux vaut une bougie allumée qu'un long discours sur l'obscurité." },
{ cat: 'sagesse', texte: "La plus grande victoire est celle que l'on gagne sur son propre ego." },
{ cat: 'sagesse', texte: "Les racines de la sagesse sont amères, mais ses fruits sont doux." },
{ cat: 'sagesse', texte: "Ce que tu nies te soumet, ce que tu acceptes te transforme." },
{ cat: 'sagesse', texte: "La clarté vient de l'action, pas de la seule pensée." },
{ cat: 'sagesse', texte: "Ne juge pas le livre de l'autre sans avoir lu toutes ses pages cachées." },
{ cat: 'sagesse', texte: "La douleur est inévitable, mais la souffrance est un choix." },
{ cat: 'sagesse', texte: "Le vrai sage est celui qui apprend de tout le monde." },
{ cat: 'sagesse', texte: "La gratitude est la mémoire du cœur." },
{ cat: 'sagesse', texte: "Apprends à écrire tes blessures dans le sable et tes joies dans la pierre." },
{ cat: 'sagesse', texte: "Rien n'est permanent dans ce monde, pas même nos problèmes." },
{ cat: 'sagesse', texte: "Le plus beau cadeau que tu puisses offrir est ta présence." },
{ cat: 'sagesse', texte: "L'humilité est la base de toute grandeur véritable." },
{ cat: 'sagesse', texte: "La rivière atteint l'océan parce qu'elle contourne les obstacles." },
{ cat: 'sagesse', texte: "Parler est un besoin, écouter est un art." },
{ cat: 'sagesse', texte: "On possède ce dont on peut se passer." },
{ cat: 'sagesse', texte: "La sagesse, c'est d'avoir des rêves assez grands pour ne pas les perdre de vue." },
{ cat: 'sagesse', texte: "Celui qui plante un arbre sachant qu'il ne s'assoira jamais sous son ombre a commencé à comprendre le sens de la vie." },
{ cat: 'sagesse', texte: "L'âme n'a pas d'âge, elle n'a que des expériences." },
{ cat: 'sagesse', texte: "Sois une voix, pas un écho." },
{ cat: 'sagesse', texte: "La haine est un poids trop lourd à porter pour un cœur qui veut voler." },
{ cat: 'sagesse', texte: "Chaque cicatrice est une leçon gravée sur la peau de l'âme." },
{ cat: 'sagesse', texte: "La simplicité est la sophistication suprême." },
{ cat: 'sagesse', texte: "On ne peut pas diriger le vent, mais on peut ajuster ses voiles." },
{ cat: 'sagesse', texte: "La vérité n'a pas besoin de cris pour être entendue." },
{ cat: 'sagesse', texte: "Le passé est une leçon, pas une prison." },
{ cat: 'sagesse', texte: "Sois bon envers ceux que tu croises, car chacun mène un combat difficile." },
{ cat: 'sagesse', texte: "La vie est un miroir : elle te sourit si tu la regardes avec amour." },
{ cat: 'sagesse', texte: "La fleur qui s'épanouit dans l'adversité est la plus rare et la plus belle de toutes." },
{ cat: 'sagesse', texte: "Le silence est parfois la plus puissante des réponses." },
{ cat: 'sagesse', texte: "Ne laisse pas le bruit des autres étouffer ta propre voix intérieure." },
{ cat: 'sagesse', texte: "Celui qui déplace une montagne commence par enlever les petites pierres." },
{ cat: 'sagesse', texte: "Vivre, c'est naître à chaque instant." },
{ cat: 'sagesse', texte: "La richesse du cœur est la seule qui ne se fane jamais." },
{ cat: 'sagesse', texte: "Chercher le bonheur à l'extérieur de soi, c'est comme attendre le soleil dans une grotte." },
{ cat: 'sagesse', texte: "La vraie générosité envers l'avenir consiste à tout donner au présent." },
{ cat: 'sagesse', texte: "Le plus grand voyage est celui qui nous mène vers nous-mêmes." },
{ cat: 'sagesse', texte: "On ne peut pas empêcher les oiseaux du souci de voler au-dessus de nos têtes, mais on peut les empêcher d'y construire leur nid." },
{ cat: 'sagesse', texte: "Le sage n'accumule pas, il partage." },
{ cat: 'sagesse', texte: "Chaque jour est une vie en miniature." },
{ cat: 'sagesse', texte: "La bonté est le langage qu'un sourd peut entendre et qu'un aveugle peut voir." },
{ cat: 'sagesse', texte: "Celui qui est maître de lui-même est plus puissant que celui qui conquiert des villes." },
{ cat: 'sagesse', texte: "La beauté est dans le regard de celui qui aime." },
{ cat: 'sagesse', texte: "Une petite étincelle de conscience suffit à dissiper une grande forêt d'ignorance." },
{ cat: 'sagesse', texte: "Ne crains pas d'avancer lentement, crains seulement de rester immobile." },
{ cat: 'sagesse', texte: "La gratitude transforme ce que nous avons en assez." },
{ cat: 'sagesse', texte: "Le bonheur est la seule chose qui se double si on la partage." },
{ cat: 'sagesse', texte: "On ne récolte que ce que l'on a semé avec patience." },
{ cat: 'sagesse', texte: "Le pardon est la clé de la liberté intérieure." },
{ cat: 'sagesse', texte: "Un ami est celui qui connaît ta chanson et qui te la chante quand tu l'as oubliée." },
{ cat: 'sagesse', texte: "La paix commence par un sourire." },
{ cat: 'sagesse', texte: "L'expérience est le nom que chacun donne à ses erreurs." },
{ cat: 'sagesse', texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles." },
{ cat: 'sagesse', texte: "Agis comme s'il était impossible d'échouer." },
{ cat: 'sagesse', texte: "Le savoir est une richesse que l'on emporte partout." },
{ cat: 'sagesse', texte: "La sagesse est d'écouter ce que le cœur dit sans que la bouche ne parle." },
{ cat: 'sagesse', texte: "Le véritable orphelin est celui qui n'a reçu aucune éducation." },
{ cat: 'sagesse', texte: "Les paroles s'envolent, mais les actes restent gravés dans les mémoires." },
{ cat: 'sagesse', texte: "La vie est une aventure audacieuse ou elle n'est rien du tout." },
{ cat: 'sagesse', texte: "Celui qui demande est bête cinq minutes, celui qui ne demande pas le reste toute sa vie." },
{ cat: 'sagesse', texte: "La dignité n'est pas de posséder des honneurs, mais de les mériter." },
{ cat: 'sagesse', texte: "On ne peut pas changer le passé, mais on peut gâcher le présent en s'inquiétant de l'avenir." },
{ cat: 'sagesse', texte: "Le plus grand obstacle à la connaissance n'est pas l'ignorance, c'est l'illusion de la connaissance." },
{ cat: 'sagesse', texte: "Un cœur sans espoir est comme un jardin sans fleurs." },
{ cat: 'sagesse', texte: "La sagesse est le peigne que la vie nous donne quand nous n'avons plus de cheveux." },
{ cat: 'sagesse', texte: "La confiance est comme un miroir : une fois brisé, on peut le recoller, mais on verra toujours les fissures." },
{ cat: 'sagesse', texte: "Tout ce qui nous irrite chez les autres peut nous conduire à une meilleure compréhension de nous-mêmes." },
{ cat: 'sagesse', texte: "La vie est trop importante pour être prise au sérieux." },
{ cat: 'sagesse', texte: "Les hommes construisent trop de murs et pas assez de ponts." },
{ cat: 'sagesse', texte: "Rien de grand ne s'est accompli dans le monde sans passion." },
{ cat: 'sagesse', texte: "Le rire est la distance la plus courte entre deux personnes." },
{ cat: 'sagesse', texte: "La vérité est une terre sans chemin." },
{ cat: 'sagesse', texte: "Le courage est le prix que la vie exige pour accorder la paix." },
{ cat: 'sagesse', texte: "On apprend peu par la victoire, mais beaucoup par la défaite." },
{ cat: 'sagesse', texte: "La vie, ce n'est pas d'attendre que l'orage passe, c'est d'apprendre à danser sous la pluie." },
{ cat: 'sagesse', texte: "N'attends pas que les circonstances soient idéales pour agir, l'action rend les circonstances idéales." },
{ cat: 'sagesse', texte: "La sagesse est l'art de vivre en harmonie avec ce que l'on ne peut changer." },
{ cat: 'sagesse', texte: "Si tu veux aller vite, marche seul. Si tu veux aller loin, marche avec les autres." },
{ cat: 'sagesse', texte: "Le bonheur est souvent la seule chose que l'on puisse donner sans l'avoir." },
{ cat: 'sagesse', texte: "Le plus riche n'est pas celui qui a le plus, mais celui qui a besoin du moins." },
{ cat: 'sagesse', texte: "La haine ne finit jamais par la haine, elle finit par l'amour." },
{ cat: 'sagesse', texte: "Celui qui sourit au lieu de s'emporter est toujours le plus fort." },
{ cat: 'sagesse', texte: "Chaque échec est un pas de plus vers la réussite." },
{ cat: 'sagesse', texte: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre." },
{ cat: 'sagesse', texte: "Le secret du changement est de concentrer toute son énergie non pas à lutter contre le passé, mais à construire l'avenir." },
{ cat: 'sagesse', texte: "L'important n'est pas ce qu'on fait de nous, mais ce que nous faisons de ce qu'on a fait de nous." },
{ cat: 'sagesse', texte: "La patience est la clé de toutes les délivrances." },
{ cat: 'sagesse', texte: "Le sage parle parce qu'il a quelque chose à dire, le fou parce qu'il doit dire quelque chose." },
{ cat: 'sagesse', texte: "Le véritable amour ne diminue jamais la liberté de l'autre." },
{ cat: 'sagesse', texte: "La connaissance s'acquiert par l'étude, la sagesse par l'observation." },
{ cat: 'sagesse', texte: "Ne cherche pas le bonheur, crée-le." },
{ cat: 'sagesse', texte: "Tout vient à point à qui sait attendre." },
{ cat: 'sagesse', texte: "Le monde est un livre, et ceux qui ne voyagent pas n'en lisent qu'une page." },
{ cat: 'sagesse', texte: "La bonté est le plus beau des visages." },
{ cat: 'sagesse', texte: "Il faut se concentrer sur ce qu'il nous reste, pas sur ce que l'on a perdu." },
{ cat: 'sagesse', texte: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui." },
{ cat: 'sagesse', texte: "La sagesse est la fille de l'expérience." },
{ cat: 'sagesse', texte: "Les grandes âmes ont de la volonté, les faibles n'ont que des souhaits." },
{ cat: 'sagesse', texte: "Aimer, c'est savoir dire je t'aime sans parler." },
{ cat: 'sagesse', texte: "La persévérance est un trésor." },
{ cat: 'sagesse', texte: "La paix n'est pas l'absence de guerre, c'est une vertu, un état d'esprit." },
{ cat: 'sagesse', texte: "Mieux vaut allumer une petite lanterne que de maudire l'obscurité." },
{ cat: 'sagesse', texte: "Celui qui connaît les autres est instruit, celui qui se connaît lui-même est sage." },
{ cat: 'sagesse', texte: "La vie est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre." },
{ cat: 'sagesse', texte: "La simplicité est le chemin vers la sérénité." },
{ cat: 'sagesse', texte: "La sagesse est de ne pas s'inquiéter de ce qui n'est pas encore arrivé." },
{ cat: 'sagesse', texte: "L'amitié double les joies et réduit de moitié les peines." },
{ cat: 'sagesse', texte: "La beauté de l'âme se reflète sur le visage." },
{ cat: 'sagesse', texte: "Il n'y a pas de chemin vers la paix, la paix est le chemin." },
{ cat: 'sagesse', texte: "Le plus grand secret du bonheur est d'être bien avec soi-même." },
{ cat: 'sagesse', texte: "La foi est de croire en ce que l'on ne voit pas." },
{ cat: 'sagesse', texte: "Rien ne sert de courir, il faut partir à point." },
{ cat: 'sagesse', texte: "La tolérance est la meilleure des religions." },
{ cat: 'sagesse', texte: "L'art de vivre consiste en un mélange de lâcher-prise et de tenir bon." },
{ cat: 'sagesse', texte: "Le présent est un don, c'est pourquoi on l'appelle ainsi." },
{ cat: 'sagesse', texte: "La vraie richesse est celle que l'on peut emporter dans son cœur." },
{ cat: 'sagesse', texte: "Le mensonge est une prison, la vérité est la clé." },
{ cat: 'sagesse', texte: "La sagesse est une lumière qui brille de l'intérieur." },
{ cat: 'sagesse', texte: "Nul ne peut te faire sentir inférieur sans ton consentement." },
{ cat: 'sagesse', texte: "La vie ne nous donne pas ce que nous voulons, mais ce dont nous avons besoin pour grandir." },
{ cat: 'sagesse', texte: "La gratitude est la plus belle fleur qui jaillit de l'âme." },
{ cat: 'sagesse', texte: "Un geste de bonté est une onde qui se propage à l'infini." },
{ cat: 'sagesse', texte: "Le pardon libère l'âme et dissipe la peur." },
{ cat: 'sagesse', texte: "La sagesse est d'apprendre à danser avec le changement." },
{ cat: 'sagesse', texte: "Le cœur a ses raisons que la raison ne connaît point." },
{ cat: 'sagesse', texte: "La perspicacité est de voir ce que les autres ignorent." },
{ cat: 'sagesse', texte: "Le bonheur est un parfum que l'on ne peut répandre sur les autres sans en recevoir quelques gouttes." },
{ cat: 'sagesse', texte: "L'intégrité est de faire ce qui est juste, même quand personne ne regarde." },
{ cat: 'sagesse', texte: "La modération est le trésor du sage." },
{ cat: 'sagesse', texte: "Chaque instant est une porte vers l'éternité." },
{ cat: 'sagesse', texte: "La sagesse suprême est d'avoir des rêves assez grands pour ne pas les perdre de vue quand on les poursuit." },
{ cat: 'sagesse', texte: "Le plus bel âge est celui que l'on a." },
{ cat: 'sagesse', texte: "L'espoir est le pilier du monde." },
{ cat: 'sagesse', texte: "Vivre en paix, c'est accepter que tout arrive pour une raison." },
{ cat: 'sagesse', texte: "La sagesse est la parure de l'esprit." },
{ cat: 'sagesse', texte: "Celui qui a trouvé la paix en lui-même ne la cherchera nulle part ailleurs." },
{ cat: 'sagesse', texte: "La vie est le plus grand des enseignants." },
{ cat: 'sagesse', texte: "L'amour est la seule réponse." },
{ cat: 'sagesse', texte: "La sagesse commence là où la peur de l'inconnu se termine." },
{ cat: 'sagesse', texte: "Connais-toi toi-même et tu connaîtras l'univers." },
{ cat: 'sagesse', texte: "Le sage parle parce qu'il a quelque chose à dire. Le fou parce qu'il doit dire quelque chose." },
{ cat: 'sagesse', texte: "La vie ne fait pas le moine." },
{ cat: 'sagesse', texte: "Ce que tu ne peux pas changer, apprends à l'accepter. Ce que tu peux changer, ne tarde pas à le faire." },
{ cat: 'sagesse', texte: "Le silence est parfois la réponse la plus puissante." },
{ cat: 'sagesse', texte: "Un homme sage apprend plus d'une question stupide qu'un fou d'une réponse sage." },
{ cat: 'sagesse', texte: "La vraie intelligence c'est de savoir ce qu'on ne sait pas." },
{ cat: 'sagesse', texte: "Ne juge pas une journée à sa récolte mais aux graines que tu y as plantées." },
{ cat: 'sagesse', texte: "Avant de parler demande-toi si ce que tu vas dire est vrai utile et bienveillant." },
{ cat: 'sagesse', texte: "L'homme sage ne dit pas tout ce qu'il pense mais pense tout ce qu'il dit." },
{ cat: 'sagesse', texte: "Apprends comme si tu devais vivre éternellement. Vis comme si tu devais mourir demain." },
{ cat: 'sagesse', texte: "La patience est la plus haute forme de sagesse." },
{ cat: 'sagesse', texte: "Ce n'est pas ce qui t'arrive qui compte mais comment tu y réponds." },
{ cat: 'sagesse', texte: "Le vrai voyage de découverte ne consiste pas à chercher de nouveaux paysages mais à avoir de nouveaux yeux." },
{ cat: 'sagesse', texte: "Mieux vaut une vie courte et pleine qu'une vie longue et vide." },
{ cat: 'sagesse', texte: "On ne voit bien qu'avec le coeur. L'essentiel est invisible pour les yeux." },
{ cat: 'sagesse', texte: "Le sage cherche tout en lui-même. L'ignorant cherche tout chez les autres." },
{ cat: 'sagesse', texte: "Là où l'on t'aime pas va rarement. Là où l'on t'aime vas souvent." },
{ cat: 'sagesse', texte: "Chaque être humain est ton miroir. Ce que tu vois chez les autres existe en toi." },
{ cat: 'sagesse', texte: "Ne réponds jamais à la colère par la colère. L'eau éteint le feu pas le feu." },
{ cat: 'sagesse', texte: "La plus grande victoire est celle remportée sur soi-même." },
{ cat: 'sagesse', texte: "Un mot dit avec sagesse vaut mieux que mille dits avec ignorance." },
{ cat: 'sagesse', texte: "L'humilité est la porte d'entrée de toute vraie connaissance." },
{ cat: 'sagesse', texte: "Ce que tu donnes aux autres tu te le donnes à toi-même." },
{ cat: 'sagesse', texte: "Traite les autres comme tu voudrais être traité. C'est la loi universelle." },
{ cat: 'sagesse', texte: "La paix intérieure commence quand tu arrêtes de laisser les autres contrôler tes émotions." },
{ cat: 'sagesse', texte: "Écoute plus que tu ne parles. Tu apprendras toujours plus." },
{ cat: 'sagesse', texte: "Ne cherche pas à avoir raison. Cherche à comprendre." },
{ cat: 'sagesse', texte: "Le temps est la seule chose que tu ne peux jamais récupérer. Dépense-le avec sagesse." },
{ cat: 'sagesse', texte: "Ce que tu résistes persiste. Ce que tu acceptes se transforme." },
{ cat: 'sagesse', texte: "La colère est une lettre que tu envoies sans la relire." },
{ cat: 'sagesse', texte: "Mieux vaut être seul que mal accompagné." },
{ cat: 'sagesse', texte: "Celui qui se connaît lui-même ne craint pas le jugement des autres." },
{ cat: 'sagesse', texte: "Le bonheur n'est pas une destination. C'est une façon de voyager." },
{ cat: 'sagesse', texte: "Une bougie ne perd rien à allumer une autre bougie." },
{ cat: 'sagesse', texte: "Ce que tu penses de toi-même est plus important que ce que les autres pensent de toi." },
{ cat: 'sagesse', texte: "La vraie richesse c'est d'avoir peu de besoins." },
{ cat: 'sagesse', texte: "Il faut souffrir pour comprendre. Il faut tomber pour savoir se relever." },
{ cat: 'sagesse', texte: "Ne parle jamais de ce que tu ne comprends pas. L'ignorance habillée de certitude est dangereuse." },
{ cat: 'sagesse', texte: "Le meilleur moment pour planter un arbre c'était il y a vingt ans. Le deuxième meilleur moment c'est maintenant." },
{ cat: 'sagesse', texte: "Ne fais pas à autrui ce que tu ne voudrais pas qu'on te fasse." },
{ cat: 'sagesse', texte: "Garde tes amis proches et ta paix encore plus proche." },
{ cat: 'sagesse', texte: "L'expérience est le nom que chacun donne à ses erreurs." },
{ cat: 'sagesse', texte: "Choisis tes batailles avec sagesse. Toutes ne méritent pas ton énergie." },
{ cat: 'sagesse', texte: "La vérité n'a pas besoin de beaucoup de mots." },
{ cat: 'sagesse', texte: "Ce que tu acceptes dans ta vie c'est ce que tu mérites." },
{ cat: 'sagesse', texte: "Un esprit calme voit plus clairement qu'un esprit agité." },
{ cat: 'sagesse', texte: "Ne confonds pas l'urgence avec l'importance." },
{ cat: 'sagesse', texte: "La gratitude transforme ce que tu as en suffisance." },
{ cat: 'sagesse', texte: "Les gens qui cherchent le bonheur dehors ne le trouveront jamais." },
{ cat: 'sagesse', texte: "Ce que tu fuis te poursuivra. Ce que tu affrontes se transforme." },
{ cat: 'sagesse', texte: "Parle moins agis plus. Les résultats parlent mieux que les mots." },
{ cat: 'sagesse', texte: "La vie récompense ceux qui avancent et non ceux qui attendent." },
{ cat: 'sagesse', texte: "Ne force pas ce qui n'est pas pour toi. Laisse la vie faire son travail." },
{ cat: 'sagesse', texte: "Celui qui maîtrise sa langue maîtrise sa vie." },
{ cat: 'sagesse', texte: "Sois la personne que tu aurais voulu rencontrer dans tes moments difficiles." },
{ cat: 'sagesse', texte: "L'orgueil est l'ennemi le plus silencieux de la croissance." },
{ cat: 'sagesse', texte: "Ce n'est pas l'âge qui donne la sagesse. C'est l'expérience vécue avec conscience." },
{ cat: 'sagesse', texte: "Pardonne non pas pour les autres mais pour ta propre paix." },
{ cat: 'sagesse', texte: "La différence entre un sage et un fou c'est que le sage sait quand se taire." },
{ cat: 'sagesse', texte: "Ce que tu nourris en toi grandit. Nourris la paix pas la colère." },
{ cat: 'sagesse', texte: "Apprends à dire non. C'est l'un des actes les plus sages qui soit." },
{ cat: 'sagesse', texte: "Les erreurs sont les leçons que la vie t'envoie quand tu n'écoutes pas." },
{ cat: 'sagesse', texte: "La simplicité est la sophistication suprême." },
{ cat: 'sagesse', texte: "Celui qui cherche la perfection perd souvent le bon." },
{ cat: 'sagesse', texte: "La vie est trop courte pour les rancunes et trop longue pour les regrets." },
{ cat: 'sagesse', texte: "Ce que tu penses tu le deviens. Surveille tes pensées." },
{ cat: 'sagesse', texte: "Un coeur en paix voit du bien dans tout." },
{ cat: 'sagesse', texte: "Ne promets pas quand tu es heureux. Ne décide pas quand tu es en colère." },
{ cat: 'sagesse', texte: "L'homme le plus sage est celui qui sait qu'il ne sait pas." },
{ cat: 'sagesse', texte: "Vis chaque jour comme s'il était ton premier regard sur le monde." },
{ cat: 'sagesse', texte: "Ce que tu ignores peut te nuire. Ce que tu apprends peut te sauver." },
{ cat: 'sagesse', texte: "La véritable liberté c'est ne pas avoir besoin de l'approbation des autres." },
{ cat: 'sagesse', texte: "Chaque personne que tu rencontres sait quelque chose que tu ne sais pas." },
{ cat: 'sagesse', texte: "Ne te presse pas. Ce qui est pour toi viendra à toi." },
{ cat: 'sagesse', texte: "La paix n'est pas l'absence de problèmes. C'est la capacité de les traverser avec calme." },
{ cat: 'sagesse', texte: "Comprendre c'est pardonner." },
{ cat: 'sagesse', texte: "La force du sage est dans sa douceur non dans sa violence." },
{ cat: 'sagesse', texte: "Ce que tu ignores te gouverne. Ce que tu comprends tu le maîtrises." },
{ cat: 'sagesse', texte: "Moins tu réagis aux provocations plus tu deviens puissant." },
{ cat: 'sagesse', texte: "Le vrai pouvoir c'est contrôler ses émotions pas les autres." },
{ cat: 'sagesse', texte: "Avant de critiquer marche un kilomètre dans les chaussures de l'autre." },
{ cat: 'sagesse', texte: "Les grandes âmes souffrent en silence." },
{ cat: 'sagesse', texte: "Celui qui connaît les autres est savant. Celui qui se connaît lui-même est éclairé." },
{ cat: 'sagesse', texte: "Le respect s'impose par l'exemple non par la force." },
{ cat: 'sagesse', texte: "Ce que tu ne peux pas dire en peu de mots tu ne le comprends pas encore assez." },
{ cat: 'sagesse', texte: "Garde toujours une place pour le doute. C'est là que grandit la vraie connaissance." },
{ cat: 'sagesse', texte: "La sagesse n'est pas de savoir beaucoup. C'est de savoir ce qui compte vraiment." },
{ cat: 'sagesse', texte: "Chaque moment difficile contient une leçon précieuse." },
{ cat: 'sagesse', texte: "Ne cherche pas à impressionner. Cherche à servir." },
{ cat: 'sagesse', texte: "La vraie maturité c'est savoir quand agir et quand attendre." },
{ cat: 'sagesse', texte: "Ce que tu fais quand personne ne regarde révèle qui tu es vraiment." },
{ cat: 'sagesse', texte: "Un esprit ouvert est plus précieux que toutes les richesses du monde." },
{ cat: 'sagesse', texte: "La sagesse c'est transformer chaque expérience en enseignement." },
{ cat: 'lumiere',       texte: "Là où il y a de la volonté, il y a un chemin." },
{ cat: 'lumiere',       texte: "Sois la lumière que tu veux voir." },
{ cat: 'lumiere', texte: "La lumière ne brille jamais aussi fort que dans l'obscurité." },
{ cat: 'lumiere', texte: "Il y a une fissure en chaque chose, c'est ainsi que la lumière entre." },
{ cat: 'lumiere', texte: "Le plus beau voyage est celui qui nous mène vers notre propre lumière." },
{ cat: 'lumiere', texte: "La connaissance est la lumière qui dissipe les ténèbres de l'ignorance." },
{ cat: 'lumiere', texte: "Allumer une bougie vaut mieux que de maudire l'obscurité." },
{ cat: 'lumiere', texte: "La vérité est une lumière qui n'a pas besoin de soleil pour briller." },
{ cat: 'lumiere', texte: "Un sourire est une lumière qui traverse les fenêtres de l'âme." },
{ cat: 'lumiere', texte: "La gratitude est la lumière qui transforme une épreuve en leçon." },
{ cat: 'lumiere', texte: "Celui qui porte sa propre lumière ne craint pas de marcher seul dans la nuit." },
{ cat: 'lumiere', texte: "Le bonheur se trouve là où l'on choisit de projeter sa lumière." },
{ cat: 'lumiere', texte: "La bienveillance est une lumière qui réchauffe sans brûler." },
{ cat: 'lumiere', texte: "L'espoir est la lumière qui guide nos pas vers demain." },
{ cat: 'lumiere', texte: "La clarté d'esprit commence par le calme du cœur." },
{ cat: 'lumiere', texte: "Le talent est une lumière, l'humilité est son reflet." },
{ cat: 'lumiere', texte: "Ouvrir un livre, c'est allumer une lampe dans son esprit." },
{ cat: 'lumiere', texte: "La paix intérieure est une lumière que personne ne peut éteindre." },
{ cat: 'lumiere', texte: "Chaque lever de soleil est une nouvelle chance d'illuminer le monde." },
{ cat: 'lumiere', texte: "La patience est la lumière qui nous aide à attendre l'aube." },
{ cat: 'lumiere', texte: "Un esprit éclairé ne juge pas, il comprend." },
{ cat: 'lumiere', texte: "La sagesse est la lumière qui vient avec l'expérience." },
{ cat: 'lumiere', texte: "L'amour est la seule lumière qui puisse transformer un ennemi en ami." },
{ cat: 'lumiere', texte: "Cherche la lumière en toi avant de la chercher ailleurs." },
{ cat: 'lumiere', texte: "La créativité est la lumière qui donne des couleurs à la réalité." },
{ cat: 'lumiere', texte: "Une petite étincelle suffit pour incendier de joie un cœur triste." },
{ cat: 'lumiere', texte: "La foi est la lumière qui voit l'invisible et croit l'incroyable." },
{ cat: 'lumiere', texte: "Le pardon est la lumière qui libère l'esprit du passé." },
{ cat: 'lumiere', texte: "Soyez des phares pour ceux qui naviguent dans la tempête." },
{ cat: 'lumiere', texte: "La lucidité est la lumière la plus dure, mais la plus nécessaire." },
{ cat: 'lumiere', texte: "Le rire est la lumière du soleil de la maison." },
{ cat: 'lumiere', texte: "L'intégrité est une lumière qui brille même quand personne ne regarde." },
{ cat: 'lumiere', texte: "Celui qui a la lumière en lui ne se perd jamais en chemin." },
{ cat: 'lumiere', texte: "La générosité est une lumière qui se multiplie en se partageant." },
{ cat: 'lumiere', texte: "L'optimisme est la lumière qui transforme les obstacles en ponts." },
{ cat: 'lumiere', texte: "Le silence est parfois la lumière la plus pure de la réflexion." },
{ cat: 'lumiere', texte: "Apprendre, c'est ajouter de la lumière à sa propre existence." },
{ cat: 'lumiere', texte: "La simplicité est la sophistication suprême de la lumière." },
{ cat: 'lumiere', texte: "Le courage est la lumière qui brille face au danger." },
{ cat: 'lumiere', texte: "Une vie sans passion est une lanterne sans bougie." },
{ cat: 'lumiere', texte: "La sincérité est la lumière qui rend nos paroles crédibles." },
{ cat: 'lumiere', texte: "Les étoiles ne peuvent briller sans obscurité." },
{ cat: 'lumiere', texte: "L'amitié est une lumière qui ne s'éteint jamais." },
{ cat: 'lumiere', texte: "La méditation est la lumière qui éclaire le chemin intérieur." },
{ cat: 'lumiere', texte: "Le respect est la lumière qui maintient l'harmonie entre les hommes." },
{ cat: 'lumiere', texte: "La persévérance est la lumière qui finit par percer le tunnel." },
{ cat: 'lumiere', texte: "Chaque bonne action est une bougie de plus dans le monde." },
{ cat: 'lumiere', texte: "L'art est la lumière qui permet de voir le monde autrement." },
{ cat: 'lumiere', texte: "La curiosité est la lumière qui pousse à explorer l'inconnu." },
{ cat: 'lumiere', texte: "L'empathie est la lumière qui permet de ressentir l'âme de l'autre." },
{ cat: 'lumiere', texte: "La justice est la lumière qui protège les faibles." },
{ cat: 'lumiere', texte: "Ta lumière intérieure est ton plus grand trésor." },
{ cat: 'richesse',      texte: "La vraie richesse est intérieure." },
{ cat: 'richesse', texte: "La vraie richesse est celle de l'âme." },
{ cat: 'richesse', texte: "Le plus riche est celui qui se contente de peu." },
{ cat: 'richesse', texte: "La richesse ne consiste pas à avoir beaucoup de biens, mais à avoir peu de besoins." },
{ cat: 'richesse', texte: "L'éducation est une richesse que l'on emporte partout avec soi." },
{ cat: 'richesse', texte: "La santé est la plus grande des richesses." },
{ cat: 'richesse', texte: "Un livre est un trésor que l'on feuillette." },
{ cat: 'richesse', texte: "La richesse d'un homme se mesure à ce qu'il donne." },
{ cat: 'richesse', texte: "Le temps est la richesse la plus précieuse et la moins renouvelable." },
{ cat: 'richesse', texte: "La vraie richesse est de n'avoir besoin de rien." },
{ cat: 'richesse', texte: "L'amitié est une richesse qui ne s'achète pas." },
{ cat: 'richesse', texte: "La sagesse est une fortune que personne ne peut voler." },
{ cat: 'richesse', texte: "Mieux vaut un cœur riche et une main vide qu'une main pleine et un cœur vide." },
{ cat: 'richesse', texte: "La richesse attire les amis, la pauvreté les trie." },
{ cat: 'richesse', texte: "La reconnaissance est la richesse du cœur." },
{ cat: 'richesse', texte: "On ne devient riche que de ce que l'on donne." },
{ cat: 'richesse', texte: "Le savoir est la seule richesse qui se multiplie quand on la partage." },
{ cat: 'richesse', texte: "L'intégrité est une richesse invisible." },
{ cat: 'richesse', texte: "La paix de l'esprit est le sommet de la richesse." },
{ cat: 'richesse', texte: "Celui qui est maître de soi est plus riche qu'un roi." },
{ cat: 'richesse', texte: "La richesse d'un pays réside dans ses enfants." },
{ cat: 'richesse', texte: "L'expérience est une richesse que l'on acquiert avec le temps." },
{ cat: 'richesse', texte: "La bonté est la monnaie de l'âme." },
{ cat: 'richesse', texte: "La vraie fortune, c'est de vivre sans peur." },
{ cat: 'richesse', texte: "Le bonheur est une richesse intérieure." },
{ cat: 'richesse', texte: "La richesse sans vertu est un jardin sans fleurs." },
{ cat: 'richesse', texte: "On est riche de ses souvenirs." },
{ cat: 'richesse', texte: "L'imagination est la richesse de l'esprit." },
{ cat: 'richesse', texte: "La patience est une richesse pour celui qui sait attendre." },
{ cat: 'richesse', texte: "Le sourire est la richesse des pauvres." },
{ cat: 'richesse', texte: "La liberté est la première des richesses." },
{ cat: 'richesse', texte: "Une bonne réputation vaut mieux que l'or." },
  { cat: 'determination', texte: "La volonté est la clé de toutes les portes." },
  { cat: 'determination', texte: "Celui qui veut, trouve toujours un chemin." },
  { cat: 'determination', texte: "La persévérance est la mère du succès." },
  { cat: 'determination', texte: "Ne crains pas d'avancer lentement, crains seulement de t'arrêter." },
  { cat: 'determination', texte: "L'échec est le fondement de la réussite." },
  { cat: 'determination', texte: "La force ne vient pas du corps, elle vient de la volonté de l'âme." },
  { cat: 'determination', texte: "Chaque champion était autrefois un débutant qui a refusé d'abandonner." },
  { cat: 'determination', texte: "Le succès appartient à ceux qui croient en la beauté de leurs rêves." },
  { cat: 'determination', texte: "Ne juge pas chaque jour par ce que tu récoltes, mais par ce que tu sèmes." },
  { cat: 'determination', texte: "La douleur est temporaire, la gloire est éternelle." },
  { cat: 'determination', texte: "Il n'y a pas de vent favorable pour celui qui ne sait pas où il va." },
  { cat: 'determination', texte: "Commencez par faire ce qui est nécessaire, puis ce qui est possible." },
  { cat: 'determination', texte: "Le courage n'est pas l'absence de peur, c'est la décision que quelque chose est plus important qu'elle." },
  { cat: 'determination', texte: "Nous sommes ce que nous faisons de manière répétée. L'excellence n'est donc pas un acte mais une habitude." },
  { cat: 'determination', texte: "La grandeur ne consiste pas à ne jamais tomber, mais à se relever chaque fois qu'on tombe." },
  { cat: 'determination', texte: "Quand on veut, on peut. Quand on doit, on veut." },
  { cat: 'determination', texte: "Le plus grand ennemi du succès, c'est la peur du succès lui-même." },
  { cat: 'determination', texte: "Rien dans le monde ne peut remplacer la persévérance." },
  { cat: 'determination', texte: "L'homme qui déplace des montagnes commence par déplacer de petites pierres." },
  { cat: 'determination', texte: "Soyez le changement que vous voulez voir dans le monde." },
  { cat: 'determination', texte: "Je n'ai pas échoué. J'ai trouvé 10 000 façons qui ne fonctionnent pas." },
  { cat: 'determination', texte: "La seule façon de faire un excellent travail est d'aimer ce que vous faites." },
  { cat: 'determination', texte: "Celui qui n'a jamais fait d'erreur n'a jamais tenté d'innover." },
  { cat: 'determination', texte: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte." },
  { cat: 'determination', texte: "Vis comme si tu devais mourir demain, apprends comme si tu devais vivre toujours." },
  { cat: 'determination', texte: "Si vous pensez que vous pouvez, ou que vous ne pouvez pas, vous avez raison dans les deux cas." },
  { cat: 'determination', texte: "La vie n'est pas de trouver son chemin, c'est de le créer." },
  { cat: 'determination', texte: "L'obstacle sur le chemin devient le chemin lui-même." },
  { cat: 'determination', texte: "Ce qui ne me tue pas me rend plus fort." },
  { cat: 'determination', texte: "Le futur appartient à ceux qui croient en la beauté de leurs rêves." },
  { cat: 'determination', texte: "Agis comme si ce que tu fais faisait une différence. C'est le cas." },
  { cat: 'determination', texte: "La persévérance est un long travail de patience." },
  { cat: 'determination', texte: "La plus grande gloire n'est pas de ne jamais tomber, mais de se relever après chaque chute." },
  { cat: 'determination', texte: "Concentrez-vous sur les efforts, pas sur les résultats." },
  { cat: 'determination', texte: "Les rêves ne fuient pas. C'est nous qui les abandonnons." },
  { cat: 'determination', texte: "Le vrai courage c'est de vivre quand il faut vivre, et de mourir quand il faut mourir." },
  { cat: 'determination', texte: "La discipline est le pont entre les objectifs et les accomplissements." },
  { cat: 'determination', texte: "Il faut toujours viser la lune, car même en cas d'échec, on atterrit dans les étoiles." },
  { cat: 'determination', texte: "Un homme averti en vaut deux, mais un homme déterminé en vaut mille." },
  { cat: 'determination', texte: "La réussite n'est pas le résultat du hasard, mais d'un travail acharné." },
  { cat: 'determination', texte: "Quand tout semble aller contre toi, souviens-toi que l'avion décolle face au vent." },
  { cat: 'determination', texte: "La force de l'âme se mesure à sa capacité de renoncer aux fausses pensées." },
  { cat: 'determination', texte: "Tu n'as pas à être grand pour commencer, mais tu dois commencer pour être grand." },
  { cat: 'determination', texte: "Celui qui a un pourquoi peut supporter presque tous les comment." },
  { cat: 'determination', texte: "Ne compte pas les jours, fais que les jours comptent." },
  { cat: 'determination', texte: "Le succès est la somme de petits efforts répétés jour après jour." },
  { cat: 'determination', texte: "Les grandes âmes ont des volontés, les faibles n'ont que des souhaits." },
  { cat: 'determination', texte: "Sois dur avec toi-même, la vie le sera moins." },
  { cat: 'determination', texte: "L'ambition est le chemin vers le succès, la persévérance est le véhicule dans lequel vous y arrivez." },
  { cat: 'determination', texte: "Le talent vous donne une longueur d'avance, mais la détermination vous fait gagner la course." },
  { cat: 'determination', texte: "Marche si tu ne peux pas courir, rampe si tu ne peux pas marcher, mais n'arrête jamais." },
  { cat: 'determination', texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas. C'est parce que nous n'osons pas qu'elles sont difficiles." },
  { cat: 'determination', texte: "La vraie mesure d'un homme n'est pas comment il se comporte dans les moments de confort, mais dans les moments de défi." },
  { cat: 'determination', texte: "Nul ne peut te faire sentir inférieur sans ton consentement." },
  { cat: 'determination', texte: "Le plus long voyage commence par un seul pas." },
  { cat: 'determination', texte: "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde." },
  { cat: 'determination', texte: "Si tu veux aller vite, marche seul. Si tu veux aller loin, marchons ensemble." },
  { cat: 'determination', texte: "Deviens qui tu es." },
  { cat: 'determination', texte: "L'inaction engendre le doute et la peur. L'action engendre la confiance et le courage." },
  { cat: 'determination', texte: "Peu importe combien tu vas lentement, tant que tu ne t'arrêtes pas." },
  { cat: 'determination', texte: "La vraie victoire est la victoire sur soi-même." },
  { cat: 'determination', texte: "Les hommes forts créent des temps faciles. Les temps faciles créent des hommes faibles." },
  { cat: 'determination', texte: "Le monde appartient à ceux qui se lèvent tôt et travaillent tard." },
  { cat: 'determination', texte: "Sois tellement occupé à te construire que tu n'as pas le temps de te détruire." },
  { cat: 'determination', texte: "La bataille la plus dure est celle que tu mènes contre toi-même." },
  { cat: 'determination', texte: "Transforme ta douleur en carburant." },
  { cat: 'determination', texte: "Un guerrier n'abandonne pas ce qu'il aime, il trouve l'amour dans ce qu'il fait." },
  { cat: 'determination', texte: "Ce n'est pas la montagne que nous conquérons, mais nous-mêmes." },
  { cat: 'determination', texte: "Les limites existent seulement dans l'âme de ceux qui ne rêvent pas assez loin." },
  { cat: 'determination', texte: "La sueur d'aujourd'hui est la médaille de demain." },
  { cat: 'determination', texte: "Quand vous pensez à abandonner, pensez à la raison pour laquelle vous avez commencé." },
  { cat: 'determination', texte: "L'heure de l'effort est courte, la gloire de son résultat est éternelle." },
  { cat: 'determination', texte: "Ne pleure pas pour ce que tu as perdu, bats-toi pour ce que tu as encore." },
  { cat: 'determination', texte: "Chaque matin est une nouvelle chance de devenir meilleur qu'hier." },
  { cat: 'determination', texte: "Un rêve ne devient réalité que grâce au travail, à la persévérance et à la ténacité." },
  { cat: 'determination', texte: "Le succès c'est d'aller d'échec en échec sans perdre son enthousiasme." },
  { cat: 'determination', texte: "La patience est amère, mais ses fruits sont doux." },
  { cat: 'determination', texte: "Le courage est la première des vertus car il rend les autres vertus possibles." },
  { cat: 'determination', texte: "L'homme ordinaire se préoccupe de passer le temps, l'homme de talent se préoccupe de l'utiliser." },
  { cat: 'determination', texte: "Ne laisse personne te dire que tu ne peux pas faire quelque chose." },
  { cat: 'determination', texte: "Chaque obstacle est une opportunité déguisée." },
  { cat: 'determination', texte: "La volonté d'un homme est plus forte que le fer." },
  { cat: 'determination', texte: "Forger son caractère, c'est forger son destin." },
  { cat: 'determination', texte: "Souffre maintenant et vis le reste de ta vie en champion." },
  { cat: 'determination', texte: "Le doute tue plus de rêves que l'échec ne le fera jamais." },
  { cat: 'determination', texte: "Arrête de rêver ta vie et commence à vivre tes rêves." },
  { cat: 'determination', texte: "On ne naît pas courageux, on le devient en faisant des choses courageuses." },
  { cat: 'determination', texte: "La seule limite est celle que tu t'imposes." },
  { cat: 'determination', texte: "Il vaut mieux essayer et échouer que ne jamais avoir essayé." },
  { cat: 'determination', texte: "L'avenir n'est pas quelque chose qu'on attend, c'est quelque chose qu'on crée." },
  { cat: 'determination', texte: "Le seul endroit où le succès vient avant le travail, c'est dans le dictionnaire." },
  { cat: 'determination', texte: "Chaque grand rêve commence avec un rêveur." },
  { cat: 'determination', texte: "Si tu peux le rêver, tu peux le faire." },
  { cat: 'determination', texte: "La grandeur est dans l'effort, pas dans le résultat." },
  { cat: 'determination', texte: "Vis intensément chaque instant, car le temps ne revient jamais." },
  { cat: 'determination', texte: "La nuit la plus sombre précède toujours l'aube la plus lumineuse." },
  { cat: 'determination', texte: "Celui qui combat peut perdre, mais celui qui ne combat pas a déjà perdu." },
  { cat: 'determination', texte: "Sois le héros de ta propre histoire, non la victime." },
  { cat: 'determination', texte: "La vraie force, c'est de continuer quand tout le monde s'est arrêté." },


{ cat: 'richesse', texte: "La richesse est dans la diversité." },
{ cat: 'richesse', texte: "L'honnêteté est une richesse durable." },
{ cat: 'richesse', texte: "La vraie richesse est d'aimer et d'être aimé." },
{ cat: 'richesse', texte: "Le travail est la source de toute richesse." },
{ cat: 'richesse', texte: "La créativité est une richesse sans limites." },
{ cat: 'richesse', texte: "La nature est notre plus grande richesse commune." },
{ cat: 'richesse', texte: "L'humilité est la parure de la richesse." },
{ cat: 'richesse', texte: "Le courage est la richesse des braves." },
{ cat: 'richesse', texte: "La clarté est la richesse de l'intelligence." },
{ cat: 'richesse', texte: "L'espoir est la richesse de celui qui n'a plus rien." },
{ cat: 'richesse', texte: "La persévérance transforme l'effort en richesse." },
{ cat: 'richesse', texte: "La générosité est l'investissement le plus sûr." },
{ cat: 'richesse', texte: "Le silence est une richesse pour la réflexion." },
{ cat: 'richesse', texte: "La vérité est la richesse de la parole." },
{ cat: 'richesse', texte: "Le pardon est la richesse de la force." },
{ cat: 'richesse', texte: "La simplicité est la richesse de l'élégance." },
{ cat: 'richesse', texte: "L'art est la richesse de la culture." },
{ cat: 'richesse', texte: "La foi est la richesse du croyant." },
{ cat: 'richesse', texte: "Le respect est la richesse des relations." },
{ cat: 'richesse', texte: "La gratitude est la clé de la richesse." },
{ cat: 'richesse', texte: "La curiosité est la richesse de l'apprenant." },
{ cat: 'richesse', texte: "Le rire est la richesse de la santé." },
{ cat: 'richesse', texte: "La discipline est la richesse du succès." },
{ cat: 'richesse', texte: "La vision est la richesse du leader." },
{ cat: 'richesse', texte: "La compassion est la richesse de l'humanité." },
{ cat: 'richesse', texte: "La mémoire est la richesse de l'histoire." },
{ cat: 'richesse', texte: "L'autonomie est la richesse de l'individu." },
{ cat: 'richesse', texte: "La solidarité est la richesse de la société." },
{ cat: 'richesse', texte: "L'équilibre est la richesse de la vie." },
{ cat: 'richesse', texte: "La loyauté est une richesse rare." },
{ cat: 'richesse', texte: "La passion est la richesse de l'action." },
{ cat: 'richesse', texte: "La modération est la richesse de la sagesse." },
{ cat: 'richesse', texte: "La beauté est la richesse du regard." },
{ cat: 'richesse', texte: "La confiance est la richesse de l'échange." },
{ cat: 'richesse', texte: "La résilience est la richesse de l'esprit." },
{ cat: 'richesse', texte: "La courtoisie est la richesse des manières." },
{ cat: 'richesse', texte: "L'enthousiasme est la richesse de l'énergie." },
{ cat: 'richesse', texte: "La lucidité est la richesse du jugement." },
{ cat: 'richesse', texte: "La bienveillance est la richesse du geste." },
{ cat: 'richesse', texte: "Le talent est une richesse à cultiver." },
{ cat: 'richesse', texte: "La dignité est la richesse de l'honneur." },
{ cat: 'richesse', texte: "L'harmonie est la richesse du foyer." },
{ cat: 'richesse', texte: "La franchise est la richesse de l'amitié." },
{ cat: 'richesse', texte: "La tolérance est la richesse de l'esprit ouvert." },
{ cat: 'richesse', texte: "Le contentement est une richesse inépuisable." },
{ cat: 'richesse', texte: "La droiture est la richesse de la conscience." },
{ cat: 'richesse', texte: "L'altruisme est la richesse du partage." },
{ cat: 'richesse', texte: "La perspicacité est la richesse de l'observation." },
{ cat: 'richesse', texte: "La sérénité est la richesse du calme." },
{ cat: 'richesse', texte: "La vertu est la seule richesse impérissable." },
{ cat: 'richesse', texte: "Le mérite est la richesse de l'effort." },
{ cat: 'richesse', texte: "La culture est la richesse de l'esprit." },
{ cat: 'richesse', texte: "La famille est notre première richesse." },
{ cat: 'richesse', texte: "Le rêve est la richesse de l'avenir." },
{ cat: 'richesse', texte: "La parole donnée est une richesse d'honneur." },
{ cat: 'richesse', texte: "La discrétion est la richesse de la prudence." },
{ cat: 'richesse', texte: "Le bon sens est la richesse de la logique." },
{ cat: 'richesse', texte: "L'audace est la richesse de l'opportunité." },
{ cat: 'richesse', texte: "La réflexion est la richesse de la pensée." },
{ cat: 'richesse', texte: "Le partage est la richesse de la communauté." },
{ cat: 'richesse', texte: "La sincérité est la richesse de l'âme." },
{ cat: 'richesse', texte: "L'unité est la richesse de la force." },
{ cat: 'richesse', texte: "La persistance est la richesse de l'ambition." },
{ cat: 'richesse', texte: "La sobriété est la richesse de la liberté." },
{ cat: 'richesse', texte: "La gratitude transforme ce que nous avons en assez." },
{ cat: 'richesse', texte: "Le sourire est un langage de richesse universel." },
{ cat: 'richesse', texte: "La paix est la richesse du monde." },
{ cat: 'richesse', texte: "La connaissance de soi est la plus haute richesse." },
{ cat: 'richesse', texte: "L'humour est la richesse du moral." },
{ cat: 'richesse', texte: "La volonté est la richesse du caractère." },
{ cat: 'richesse', texte: "La clémence est la richesse du puissant." },
{ cat: 'richesse', texte: "L'hospitalité est la richesse de la maison." },
{ cat: 'richesse', texte: "Le don de soi est la richesse de l'amour." },
{ cat: 'richesse', texte: "La rectitude est la richesse du chemin." },
{ cat: 'richesse', texte: "La vigilance est la richesse de la sécurité." },
{ cat: 'richesse', texte: "L'inspiration est la richesse de la création." },
{ cat: 'richesse', texte: "La coopération est la richesse du progrès." },
{ cat: 'richesse', texte: "La ténacité est la richesse de la réussite." },
{ cat: 'richesse', texte: "Le discernement est la richesse de l'esprit." },
{ cat: 'richesse', texte: "La charité est la richesse de la foi." },
{ cat: 'richesse', texte: "L'élégance est la richesse du style." },
{ cat: 'richesse', texte: "La spontanéité est la richesse de la vie." },
{ cat: 'richesse', texte: "La constance est la richesse de la fidélité." },
{ cat: 'richesse', texte: "L'écoute est la richesse de la compréhension." },
{ cat: 'richesse', texte: "La poésie est la richesse du langage." },
{ cat: 'richesse', texte: "La ferveur est la richesse de la prière." },
{ cat: 'richesse', texte: "La méticulosité est la richesse de l'artisan." },
{ cat: 'richesse', texte: "La sagacité est la richesse de l'intelligence." },
{ cat: 'richesse', texte: "Le pragmatisme est la richesse de l'action." },
{ cat: 'richesse', texte: "La tempérance est la richesse de la santé." },
{ cat: 'richesse', texte: "L'originalité est la richesse de l'artiste." },
{ cat: 'richesse', texte: "La loyauté est le socle de la richesse sociale." },
{ cat: 'richesse', texte: "La vivacité est la richesse de l'esprit." },
{ cat: 'richesse', texte: "La noblesse de cœur est la vraie richesse." },
{ cat: 'richesse', texte: "Le labeur est la semence de la richesse." },
{ cat: 'richesse', texte: "La bienfaisance est la richesse du riche." },
{ cat: 'richesse', texte: "Le contentement est le paradis sur terre." },
{ cat: 'richesse', texte: "La richesse est un moyen, pas une fin." },
{ cat: 'richesse', texte: "L'esprit de service est une richesse sociale." },
{ cat: 'richesse', texte: "La polyvalence est la richesse du savoir-faire." },
{ cat: 'richesse', texte: "La douceur est la richesse de la force." },
{ cat: 'richesse', texte: "L'équité est la richesse de la justice." },
{ cat: 'richesse', texte: "La maturité est la richesse de l'âge." },
{ cat: 'richesse', texte: "La transmission est la richesse des générations." },
{ cat: 'richesse', texte: "La gratitude est la mémoire du cœur." },
{ cat: 'richesse', texte: "La sobriété est une richesse volontaire." },
{ cat: 'richesse', texte: "La lucidité est la richesse du regard." },
{ cat: 'richesse', texte: "La bienveillance est un trésor inépuisable." },
{ cat: 'richesse', texte: "Le respect de soi est la base de la richesse." },
{ cat: 'richesse', texte: "La persévérance est le trésor de l'homme." },
{ cat: 'richesse', texte: "L'union fait la richesse des peuples." },
{ cat: 'richesse', texte: "La richesse véritable est l'indépendance." },
{ cat: 'richesse', texte: "Le savoir-vivre est une richesse quotidienne." },
{ cat: 'richesse', texte: "La richesse du monde est dans son unité." },
{ cat: 'richesse', texte: "Chaque jour est une richesse à exploiter." },
{ cat: 'richesse', texte: "La richesse commence par une pensée positive." },
{ cat: 'richesse', texte: "Avoir la paix est la plus grande fortune." },
{ cat: 'richesse',      texte: "Investis en toi-même." },
{ cat: 'bonte',         texte: "La bonté est un langage universel." },
{ cat: 'bonte',         texte: "La bonté est la lumière qui guide les âmes perdues." },
{ cat: 'bonte',         texte: "La bonté est la seule chose qui ne s'use pas quand on la partage." },
{ cat: 'bonte',         texte: "La bonté est une force plus puissante que la violence." },
{ cat: 'bonte',         texte: "La bonté est la clé qui ouvre les cœurs fermés." },
{ cat: 'bonte',         texte: "La bonté est la plus belle des vertus." },
{ cat: 'bonte',         texte: "La bonté est un cadeau que tu peux offrir à tout moment." },
{ cat: 'bonte',         texte: "La bonté est la musique de l'âme." },
{ cat: 'bonte', texte: "La bonté est le seul investissement qui ne faillit jamais." },
{ cat: 'bonte', texte: "Un mot gentil peut réchauffer trois mois d'hiver." },
{ cat: 'bonte', texte: "La bonté est la langue qu'un sourd peut entendre et qu'un aveugle peut voir." },
{ cat: 'bonte', texte: "Aucun acte de bonté, si petit soit-il, n'est jamais perdu." },
{ cat: 'bonte', texte: "La bonté consiste à ne pas juger les autres." },
{ cat: 'bonte', texte: "Un cœur bon est une fontaine de joie." },
{ cat: 'bonte', texte: "La bonté est la plus haute forme de l'intelligence." },
{ cat: 'bonte', texte: "Sois le changement que tu veux voir dans le monde." },
{ cat: 'bonte', texte: "La bonté envers autrui est une charité envers soi-même." },
{ cat: 'bonte', texte: "La vraie bonté est de faire du bien sans témoin." },
{ cat: 'bonte', texte: "La bonté est un vêtement qui ne s'use jamais." },
{ cat: 'bonte', texte: "Un visage souriant est le reflet d'une âme bonne." },
{ cat: 'bonte', texte: "La bonté est le plus beau des visages." },
{ cat: 'bonte', texte: "Semer la bonté, c'est récolter le bonheur." },
{ cat: 'bonte', texte: "La bonté commence là où s'arrête l'égoïsme." },
{ cat: 'bonte', texte: "La bonté est le pont entre deux âmes." },
{ cat: 'bonte', texte: "Un petit geste de bonté vaut mieux qu'une grande intention." },
{ cat: 'bonte', texte: "La bonté est la clé qui ouvre tous les cœurs." },
{ cat: 'bonte', texte: "Être bon est une force, pas une faiblesse." },
{ cat: 'bonte', texte: "La bonté donne de la lumière à la vie." },
{ cat: 'bonte', texte: "La bonté est le parfum des âmes nobles." },
{ cat: 'bonte', texte: "Un mot de bonté peut changer la journée de quelqu'un." },
{ cat: 'bonte', texte: "La bonté est la musique du cœur." },
{ cat: 'bonte', texte: "Il n'y a pas de grandeur là où il n'y a pas de bonté." },
{ cat: 'bonte', texte: "La bonté transforme les ennemis en amis." },
{ cat: 'bonte', texte: "La bonté est un langage universel." },
{ cat: 'bonte', texte: "La bonté ne demande rien en retour." },
{ cat: 'bonte', texte: "La bonté est la beauté intérieure rendue visible." },
{ cat: 'bonte', texte: "Un acte de bonté est une prière en action." },
{ cat: 'bonte', texte: "La bonté est le soleil des jours sombres." },
{ cat: 'bonte', texte: "La bonté est la plus riche des parures." },
{ cat: 'bonte', texte: "Un cœur bon attire les bonnes choses." },
{ cat: 'bonte', texte: "La bonté est une force silencieuse." },
{ cat: 'bonte', texte: "La bonté rend le monde plus supportable." },
{ cat: 'bonte', texte: "La bonté est la fleur de l'humanité." },
{ cat: 'bonte', texte: "Être bon, c'est être en paix avec soi-même." },
{ cat: 'bonte', texte: "La bonté est l'art de donner de l'espoir." },
{ cat: 'bonte', texte: "La bonté est un trésor inépuisable." },
{ cat: 'bonte', texte: "Un mot doux apaise la colère." },
{ cat: 'bonte', texte: "La bonté est le remède à bien des maux." },
{ cat: 'bonte', texte: "La bonté est la noblesse de l'esprit." },
{ cat: 'bonte', texte: "La bonté est un choix quotidien." },
{ cat: 'bonte', texte: "Un geste tendre est une étincelle de bonté." },
{ cat: 'bonte', texte: "La bonté est la fondation de l'amitié." },
{ cat: 'bonte', texte: "La bonté est le langage des sages." },
{ cat: 'bonte', texte: "La bonté est une semence d'éternité." },
{ cat: 'bonte', texte: "Un regard bon peut consoler une âme triste." },
{ cat: 'bonte', texte: "La bonté est le fruit de la patience." },
{ cat: 'bonte', texte: "La bonté est la lumière du monde." },
{ cat: 'bonte', texte: "La bonté est le secret d'une vie réussie." },
{ cat: 'bonte', texte: "La bonté est la clarté de l'âme." },
{ cat: 'bonte', texte: "Un cœur généreux est un cœur bon." },
{ cat: 'bonte', texte: "La bonté est la dignité humaine." },
{ cat: 'bonte', texte: "La bonté est le plus court chemin entre deux personnes." },
{ cat: 'bonte', texte: "La bonté est l'expression de l'amour." },
{ cat: 'bonte', texte: "La bonté est la richesse de ceux qui n'ont rien." },
{ cat: 'bonte', texte: "La bonté est le miel de la vie." },
{ cat: 'bonte', texte: "Un acte bienveillant illumine le passé." },
{ cat: 'bonte', texte: "La bonté est le bouclier contre la haine." },
{ cat: 'bonte', texte: "La bonté est la plus belle des sagesses." },
{ cat: 'bonte', texte: "La bonté est la poésie du geste." },
{ cat: 'bonte', texte: "La bonté est le signe de la maturité." },
{ cat: 'bonte', texte: "La bonté est le souffle de la vie." },
{ cat: 'bonte', texte: "Un cœur aimant est la plus grande bonté." },
{ cat: 'bonte', texte: "La bonté est le miroir de l'âme." },
{ cat: 'bonte', texte: "La bonté est la base de toute justice." },
{ cat: 'bonte', texte: "La bonté est la fleur du pardon." },
{ cat: 'bonte', texte: "La bonté est le calme après la tempête." },
{ cat: 'bonte', texte: "La bonté est l'élégance de l'esprit." },
{ cat: 'bonte', texte: "La bonté est le respect de l'autre." },
{ cat: 'bonte', texte: "La bonté est la force des humbles." },
{ cat: 'bonte', texte: "La bonté est la vérité du cœur." },
{ cat: 'bonte', texte: "La bonté est le guide de nos actions." },
{ cat: 'bonte', texte: "La bonté est la lumière de la conscience." },
{ cat: 'bonte', texte: "Un mot gracieux est une pluie sur la terre sèche." },
{ cat: 'bonte', texte: "La bonté est la saveur de l'existence." },
{ cat: 'bonte', texte: "La bonté est le fruit de la discipline intérieure." },
{ cat: 'bonte', texte: "La bonté est la clémence des forts." },
{ cat: 'bonte', texte: "La bonté est l'harmonie sociale." },
{ cat: 'bonte', texte: "La bonté est le repos de l'esprit." },
{ cat: 'bonte', texte: "La bonté est la boussole de la morale." },
{ cat: 'bonte', texte: "La bonté est le sourire de Dieu." },
{ cat: 'bonte', texte: "La bonté est le lien des cœurs droits." },
{ cat: 'bonte', texte: "La bonté est le rempart contre l'indifférence." },
{ cat: 'bonte', texte: "La bonté est la grandeur des simples." },
{ cat: 'bonte', texte: "La bonté est le courage d'aider." },
{ cat: 'bonte', texte: "La bonté est la sagesse en action." },
{ cat: 'bonte', texte: "La bonté est la perle de la personnalité." },
{ cat: 'bonte', texte: "La bonté est le chemin de la sérénité." },
{ cat: 'bonte', texte: "La bonté est le soleil intérieur." },
{ cat: 'bonte', texte: "La bonté est la monnaie du ciel." },
{ cat: 'bonte', texte: "La bonté est la main tendue." },
{ cat: 'bonte', texte: "La bonté est la loyauté envers l'humanité." },
{ cat: 'bonte', texte: "La bonté est la patience avec les autres." },
{ cat: 'bonte', texte: "La bonté est le refus de la violence." },
{ cat: 'bonte', texte: "La bonté est l'essence de la vertu." },
{ cat: 'bonte', texte: "La bonté est la joie de servir." },
{ cat: 'bonte', texte: "La bonté est la force de l'âme pure." },
{ cat: 'bonte', texte: "La bonté est le rayonnement de l'être." },
{ cat: 'bonte', texte: "La bonté est le sel de la terre." },
{ cat: 'bonte', texte: "La bonté est le respect de la vie." },
{ cat: 'bonte', texte: "La bonté est la tendresse de la parole." },
{ cat: 'bonte', texte: "La bonté est le calme dans le regard." },
{ cat: 'bonte', texte: "La bonté est la droiture de l'intention." },
{ cat: 'bonte', texte: "La bonté est le fruit de l'amour sincère." },
{ cat: 'bonte', texte: "La bonté est la protection des faibles." },
{ cat: 'bonte', texte: "La bonté est le lien fraternel." },
{ cat: 'bonte', texte: "La bonté est la compassion vécue." },
{ cat: 'bonte', texte: "La bonté est le chemin de la vérité." },
{ cat: 'bonte', texte: "La bonté est l'ouverture aux autres." },
{ cat: 'bonte', texte: "La bonté est la source de la paix." },
{ cat: 'bonte', texte: "La bonté est le secret de l'harmonie." },
{ cat: 'bonte', texte: "La bonté est la beauté sans artifice." },
{ cat: 'bonte', texte: "La bonté est le parfum des jours." },
{ cat: 'bonte', texte: "La bonté est la sagesse du cœur aimant." },
{ cat: 'bonte', texte: "La bonté est la fidélité au bien." },
{ cat: 'bonte', texte: "La bonté est le soutien des affligés." },
{ cat: 'bonte', texte: "La bonté est la grâce de l'esprit." },
{ cat: 'bonte', texte: "La bonté est la volonté de bien faire." },
{ cat: 'bonte', texte: "La bonté est la chaleur du foyer." },
{ cat: 'bonte', texte: "La bonté est le partage désintéressé." },
{ cat: 'bonte', texte: "La bonté est la clarté du jugement." },
{ cat: 'bonte', texte: "La bonté est la noblesse du comportement." },
{ cat: 'bonte', texte: "La bonté est le phare dans la nuit." },
{ cat: 'bonte', texte: "La bonté est la joie partagée." },
{ cat: 'bonte', texte: "La bonté est la simplicité de l'être." },
{ cat: 'bonte', texte: "La bonté est le langage de l'âme libre." },
{ cat: 'bonte', texte: "La bonté est le courage d'aimer." },
{ cat: 'bonte', texte: "La bonté est la force de la douceur." },
{ cat: 'bonte', texte: "La bonté est le trésor du sage." },
{ cat: 'bonte', texte: "La bonté est le reflet de la divinité." },
{ cat: 'bonte', texte: "La bonté est le baume des blessures." },
{ cat: 'bonte', texte: "La bonté est la constance dans le bien." },
{ cat: 'bonte', texte: "La bonté est la lumière de la raison." },
{ cat: 'bonte', texte: "La bonté est la victoire sur soi-même." },
{ cat: 'bonte', texte: "La bonté est la richesse de la relation." },
{ cat: 'bonte', texte: "La bonté est le souffle de l'espoir." },
{ cat: 'bonte', texte: "La bonté est la vertu par excellence." },
{ cat: 'bonte', texte: "La bonté est le lien de la perfection." },
{ cat: 'bonte', texte: "La bonté est le fruit de la charité." },
{ cat: 'bonte', texte: "La bonté est le paradis du cœur." },
{ cat: 'bonte', texte: "La bonté est la vérité de l'existence." },
{ cat: 'bonte', texte: "La bonté est le guide du voyageur." },
{ cat: 'bonte', texte: "La bonté est la paix intérieure manifestée." },
{ cat: 'bonte', texte: "La bonté est l'unité de l'esprit humain." },
{ cat: 'bonte', texte: "La bonté est le sceau de la sagesse." },
{ cat: 'bonte', texte: "La bonté est la fleur qui ne fane jamais." },
{ cat: 'bonte', texte: "La bonté est l'aura des saints." },
{ cat: 'bonte', texte: "La bonté est l'héritage des justes." },
{ cat: 'bonte', texte: "La bonté est le mot de la fin." },
{ cat: 'determination', texte: "La volonté est la clé de toutes les portes." },
{ cat: 'determination', texte: "Celui qui veut vraiment n'attend pas les conditions parfaites." },
{ cat: 'determination', texte: "Un homme sans but est comme un navire sans gouvernail." },
{ cat: 'determination', texte: "La persévérance est la mère du succès." },
{ cat: 'determination', texte: "Chaque grand voyage commence par un seul pas." },
{ cat: 'determination', texte: "Le courage n'est pas l'absence de peur, c'est d'agir malgré elle." },
{ cat: 'determination', texte: "Ne juge pas chaque jour par ce que tu récoltes, mais par ce que tu sèmes." },
{ cat: 'determination', texte: "La différence entre possible et impossible réside dans la détermination." },
{ cat: 'determination', texte: "Celui qui déplace une montagne commence par ramasser de petites pierres." },
{ cat: 'determination', texte: "Notre plus grande gloire n'est pas de ne jamais tomber, mais de nous relever chaque fois." },
{ cat: 'determination', texte: "Le succès c'est d'aller d'échec en échec sans perdre son enthousiasme." },
{ cat: 'determination', texte: "Je ne perds jamais. Soit je gagne, soit j'apprends." },
{ cat: 'determination', texte: "L'obstacle sur le chemin devient le chemin lui-même." },
{ cat: 'determination', texte: "Ce n'est pas la montagne qui nous épuise, c'est le caillou dans la chaussure." },
{ cat: 'determination', texte: "La force ne vient pas du corps. Elle vient de la volonté de l'âme." },
{ cat: 'determination', texte: "Sois le changement que tu veux voir dans le monde." },
{ cat: 'determination', texte: "Le monde s'écarte pour laisser passer l'homme qui sait où il va." },
{ cat: 'determination', texte: "Aucun vent n'est favorable pour celui qui ne sait pas où il va." },
{ cat: 'determination', texte: "La douleur est temporaire. La gloire est éternelle." },
{ cat: 'determination', texte: "Un lion ne se soucie pas de l'opinion des moutons." },
{ cat: 'determination', texte: "Deviens qui tu es en apprenant ce que tu es." },
{ cat: 'determination', texte: "Ce que l'esprit peut concevoir et croire, il peut l'accomplir." },
{ cat: 'determination', texte: "Si tu veux être fort, apprends à te battre seul." },
{ cat: 'determination', texte: "Les champions ne sont pas faits dans les salles, ils sont faits de ce qu'ils ont en eux." },
{ cat: 'determination', texte: "La grandeur ne vient pas de la chance, elle vient du travail acharné." },
{ cat: 'determination', texte: "Agis comme si chaque acte pouvait changer le monde, parce qu'il le peut." },
{ cat: 'determination', texte: "Il n'y a pas de raccourcis vers un endroit qui vaut la peine d'aller." },
{ cat: 'determination', texte: "La victoire appartient au plus persévérant." },
{ cat: 'determination', texte: "Sois dur avec toi-même quand c'est facile, et la vie sera facile quand c'est dur." },
{ cat: 'determination', texte: "Le guerrier qui fait confiance à son chemin n'a pas besoin de preuve." },
{ cat: 'determination', texte: "Si tu n'es pas prêt à mourir pour ça, enlève le mot liberté de ton vocabulaire." },
{ cat: 'determination', texte: "La peur tue plus de rêves que l'échec ne le fera jamais." },
{ cat: 'determination', texte: "Chaque matin tu as deux choix : continuer à dormir avec tes rêves ou te lever et les réaliser." },
{ cat: 'determination', texte: "Un homme ordinaire travaille le double pour avoir des résultats extraordinaires." },
{ cat: 'determination', texte: "La sueur d'aujourd'hui est la médaille de demain." },
{ cat: 'determination', texte: "Là où il n'y a pas de lutte, il n'y a pas de force." },
{ cat: 'determination', texte: "Peu importe combien tu vas lentement, du moment que tu ne t'arrêtes pas." },
{ cat: 'determination', texte: "Il vaut mieux viser la perfection et rater que viser la médiocrité et réussir." },
{ cat: 'determination', texte: "L'homme qui n'a jamais échoué n'a jamais rien tenté de grand." },
{ cat: 'determination', texte: "Le doute tue plus de rêves que l'échec ne le fera jamais." },
{ cat: 'determination', texte: "Forge-toi ou reste brisé." },
{ cat: 'determination', texte: "Travaille en silence. Laisse le succès faire le bruit." },
{ cat: 'determination', texte: "Tu n'es pas fatigué, tu es faible. Entraîne-toi encore." },
{ cat: 'determination', texte: "Chaque seconde que tu passes à douter est une seconde volée à ta grandeur." },
{ cat: 'determination', texte: "Vis comme si tu devais mourir demain. Apprends comme si tu devais vivre toujours." },
{ cat: 'determination', texte: "Si ça te fait peur, c'est probablement ce que tu dois faire." },
{ cat: 'determination', texte: "Le génie c'est un pour cent d'inspiration et quatre-vingt-dix-neuf pour cent de transpiration." },
{ cat: 'determination', texte: "On ne choisit pas ce qu'on est, mais on choisit ce qu'on fait de ce qu'on est." },
{ cat: 'determination', texte: "La vraie mesure d'un homme n'est pas là où il se trouve dans les moments de confort, mais dans les défis." },
{ cat: 'determination', texte: "Quand tu traverses l'enfer, continue d'avancer." },
{ cat: 'determination', texte: "Sois obsédé ou sois ordinaire." },
{ cat: 'determination', texte: "Le monde appartient à ceux qui se lèvent tôt et qui ne se rendorment jamais." },
{ cat: 'determination', texte: "Je préfère mourir debout que vivre à genoux." },
{ cat: 'determination', texte: "La grandeur est une série de petites décisions prises chaque jour." },
{ cat: 'determination', texte: "Ne compte pas les heures, fais que les heures comptent." },
{ cat: 'determination', texte: "L'acier se forge dans le feu. Le caractère se forge dans l'adversité." },
{ cat: 'determination', texte: "Ton futur est créé par ce que tu fais aujourd'hui, pas demain." },
{ cat: 'determination', texte: "Un vrai guerrier ne s'incline que devant ses propres valeurs." },
{ cat: 'determination', texte: "Si tu te bats pour quelque chose, bats-toi comme si ta vie en dépendait." },
{ cat: 'determination', texte: "Les hommes forts créent des temps faciles. Les temps faciles créent des hommes faibles." },
{ cat: 'determination', texte: "La discipline est le pont entre les objectifs et les accomplissements." },
{ cat: 'determination', texte: "Personne ne se souvient de celui qui a failli gagner." },
{ cat: 'determination', texte: "Transforme ta douleur en carburant." },
{ cat: 'determination', texte: "Le silence est l'arme des forts quand les faibles parlent trop." },
{ cat: 'determination', texte: "Souffre maintenant et vis le reste de ta vie en champion." },
{ cat: 'determination', texte: "Le plus grand risque dans la vie c'est de ne prendre aucun risque." },
{ cat: 'determination', texte: "Ce n'est pas la taille du chien dans le combat qui compte, c'est la taille du combat dans le chien." },
{ cat: 'determination', texte: "Le vainqueur n'est pas celui qui tombe jamais, c'est celui qui se relève toujours." },
{ cat: 'determination', texte: "Ne rêve pas ta vie, vis tes rêves." },
{ cat: 'determination', texte: "Ton seul concurrent, c'est qui tu étais hier." },
{ cat: 'determination', texte: "Le succès ne se donne pas, il se mérite chaque jour." },
{ cat: 'determination', texte: "Si le plan A échoue, le reste de l'alphabet est là." },
{ cat: 'determination', texte: "Un tigre ne perd pas le sommeil à cause de l'opinion des moutons." },
{ cat: 'determination', texte: "Fais de ta vie un chef-d'œuvre dont tu seras fier." },
{ cat: 'determination', texte: "Même les plus grands arbres ont commencé par une petite graine." },
{ cat: 'determination', texte: "La ténacité est la vertu des grands." },
{ cat: 'determination', texte: "Bats-toi pour ta vie comme si c'était la seule que tu auras jamais." },
{ cat: 'determination', texte: "Ce qui ne te tue pas te rend plus fort." },
{ cat: 'determination', texte: "L'échec est simplement l'opportunité de recommencer plus intelligemment." },
{ cat: 'determination', texte: "Deviens la personne que ton enfant veut que tu sois." },
{ cat: 'determination', texte: "Ne cherche pas à être meilleur que les autres. Sois meilleur que toi-même." },
{ cat: 'determination', texte: "Le succès est la somme de petits efforts répétés jour après jour." },
{ cat: 'determination', texte: "Les rêves sans action ne sont que des illusions." },
{ cat: 'determination', texte: "Si tu abandonnes maintenant, tu recommenceras demain avec la même peur." },
{ cat: 'determination', texte: "Je construis mes muscles avec mes larmes et mon sang." },
{ cat: 'determination', texte: "Peu importe le nombre de fois que tu tombes, relève-toi toujours une fois de plus." },
{ cat: 'determination', texte: "Le temps ne respecte pas ce qui se fait sans lui." },
{ cat: 'determination', texte: "Ton environnement est le reflet de tes décisions." },
{ cat: 'determination', texte: "La patience est la force du faible, l'impatience est la faiblesse du fort." },
{ cat: 'determination', texte: "Chaque jour sans progrès est une défaite contre toi-même." },
{ cat: 'determination', texte: "Sois le héros de ta propre histoire, pas la victime." },
{ cat: 'determination', texte: "Le destin n'est pas une question de chance, c'est une question de choix." },
{ cat: 'determination', texte: "Les grands ne naissent pas déterminés. Ils le deviennent par leurs batailles." },
{ cat: 'determination', texte: "Ceux qui pensent que c'est impossible ne devraient pas déranger ceux qui le font." },
{ cat: 'determination', texte: "Un champion est quelqu'un qui se lève même quand il ne peut pas." },
{ cat: 'determination', texte: "La réussite n'est pas finale, l'échec n'est pas fatal. C'est le courage de continuer qui compte." },
{ cat: 'determination', texte: "Quand la douleur est à son maximum, ta grandeur est à portée de main." },
{ cat: 'determination', texte: "N'attends pas l'occasion idéale. Crée-la." },
{ cat: 'determination', texte: "La discipline que tu t'imposes aujourd'hui est la liberté que tu vivras demain." },
{ cat: 'determination', texte: "Ta seule limite, c'est toi-même." },
{ cat: 'determination', texte: "Tombe sept fois, relève-toi huit." },
{ cat: 'determination', texte: "Impossible est un mot qu'on trouve dans le dictionnaire des lâches." },
{ cat: 'determination', texte: "Je suis le plus grand, je l'ai décidé bien avant de le savoir." },
{ cat: 'determination', texte: "Le champion n'est pas celui qui ne tombe jamais, c'est celui qui se relève toujours." },
{ cat: 'determination', texte: "Si tu rêves de battre quelqu'un, tu n'as pas assez travaillé." },
{ cat: 'determination', texte: "La douleur d'aujourd'hui est la force de demain." },
{ cat: 'determination', texte: "Ne compte pas les jours, fais que les jours comptent." },
{ cat: 'determination', texte: "L'homme qui n'a pas de courage n'a rien du tout." },
{ cat: 'determination', texte: "Je hais chaque minute d'entraînement, mais je me dis : ne abandonne pas maintenant et tu vivras le reste de ta vie comme un champion." },
{ cat: 'determination', texte: "Le secret c'est de continuer quand tout le monde s'arrête." },
{ cat: 'determination', texte: "Ta volonté doit être plus forte que ta douleur." },
{ cat: 'determination', texte: "Chaque matin tu te bats contre toi-même. C'est là que commence la vraie victoire." },
{ cat: 'determination', texte: "Si tu veux changer le monde, commence par ne pas abandonner ce soir." },
{ cat: 'determination', texte: "Le talent ne suffit pas. Le travail bat toujours le talent quand le talent ne travaille pas." },
{ cat: 'determination', texte: "Personne ne peut te définir sauf toi-même." },
{ cat: 'determination', texte: "Quand tu veux abandonner, rappelle-toi pourquoi tu as commencé." },
{ cat: 'determination', texte: "Les grands ne naissent pas grands. Ils deviennent grands par leurs actions." },
{ cat: 'determination', texte: "Sois celui que les autres disent que tu ne peux pas être." },
{ cat: 'determination', texte: "Le succès n'est pas final, l'échec n'est pas fatal. C'est le courage de continuer qui compte." },
{ cat: 'determination', texte: "Ne laisse jamais quelqu'un te dire que tu ne peux pas faire quelque chose." },
{ cat: 'determination', texte: "Transforme chaque obstacle en tremplin." },
{ cat: 'determination', texte: "Les lions ne se retournent pas quand les chiens aboient." },
{ cat: 'determination', texte: "Ce n'est pas la taille du chien dans le combat qui compte, c'est la taille du combat dans le chien." },
{ cat: 'determination', texte: "Un homme ordinaire avec une détermination extraordinaire bat toujours un homme extraordinaire sans détermination." },
{ cat: 'determination', texte: "Travaille en silence. Laisse ton succès faire le bruit." },
{ cat: 'determination', texte: "La sueur d'aujourd'hui est la médaille de demain." },
{ cat: 'determination', texte: "Les rêves ne fonctionnent que si toi tu travailles." },
{ cat: 'determination', texte: "Avant d'être un champion, tu dois d'abord te battre contre toi-même." },
{ cat: 'determination', texte: "La différence entre essayer et réussir c'est la persévérance." },
{ cat: 'determination', texte: "Souffre maintenant et vis le reste de ta vie comme un champion." },
{ cat: 'determination', texte: "Ce que tu penses, tu le deviens. Ce que tu ressens, tu l'attires." },
{ cat: 'determination', texte: "Le monde entier peut douter de toi. Toi ne doute jamais de toi-même." },
{ cat: 'determination', texte: "Chaque sacrifice que tu fais aujourd'hui construit l'homme de demain." },
{ cat: 'determination', texte: "Ne demande pas si tu peux. Demande-toi comment tu vas le faire." },
{ cat: 'determination', texte: "La victoire appartient à ceux qui n'abandonnent jamais." },
{ cat: 'determination', texte: "Ton histoire n'est pas encore terminée. Continue à écrire." },
{ cat: 'determination', texte: "La force ne vient pas du corps. Elle vient de la volonté de l'âme." },
{ cat: 'determination', texte: "Fais de ton mieux aujourd'hui pour que demain soit meilleur." },
{ cat: 'determination', texte: "Personne ne se souvient de celui qui a failli. On se souvient de celui qui a réussi." },
{ cat: 'determination', texte: "La peur est réelle. Le courage c'est agir malgré elle." },
{ cat: 'determination', texte: "Tu n'es pas fatigué. Tu es en train de devenir fort." },
{ cat: 'determination', texte: "Les excuses sont les clous qui construisent la maison de l'échec." },
{ cat: 'determination', texte: "Chaque jour sans progrès est un jour perdu." },
{ cat: 'determination', texte: "Le chemin est dur. C'est pour ça que peu de gens y arrivent." },
{ cat: 'determination', texte: "Ne cherche pas une vie facile. Cherche la force de supporter une vie difficile." },
{ cat: 'determination', texte: "Ton passé ne définit pas ton avenir. Tes actions d'aujourd'hui le font." },
{ cat: 'determination', texte: "Quand les autres dorment, les champions travaillent." },
{ cat: 'determination', texte: "Si tu veux quelque chose que tu n'as jamais eu, fais quelque chose que tu n'as jamais fait." },
{ cat: 'determination', texte: "La discipline c'est faire ce qui doit être fait même quand tu n'en as pas envie." },
{ cat: 'determination', texte: "Chaque goutte de sueur rapproche du but." },
{ cat: 'determination', texte: "Tu peux te reposer mais n'abandonne jamais." },
{ cat: 'determination', texte: "Les gens ordinaires ont de grands rêves. Les gens extraordinaires les réalisent." },
{ cat: 'determination', texte: "Ne regarde jamais en arrière sauf pour voir jusqu'où tu es allé." },
{ cat: 'determination', texte: "La vraie défaite c'est arrêter d'essayer." },
{ cat: 'determination', texte: "Un pas de plus chaque jour. C'est ça la vraie victoire." },
{ cat: 'determination', texte: "Ce n'est pas parce que c'est difficile que tu n'oses pas. C'est parce que tu n'oses pas que c'est difficile." },
{ cat: 'determination', texte: "Le succès appartient à ceux qui se lèvent tôt et restent tard." },
{ cat: 'determination', texte: "Bats-toi pour ce que tu veux ou accepte ce qu'on te donne." },
{ cat: 'determination', texte: "Tu n'échoues pas quand tu tombes. Tu échoues quand tu refuses de te relever." },
{ cat: 'determination', texte: "Chaque limite que tu dépasses te rapproche de ta vraie grandeur." },
{ cat: 'determination', texte: "Si tu peux le rêver tu peux le faire. Si tu peux le faire, fais-le maintenant." },
{ cat: 'determination', texte: "Ne sois pas le meilleur du monde. Sois le meilleur pour le monde." },
{ cat: 'determination', texte: "Les montagnes ne bougent pas. C'est toi qui dois trouver comment les gravir." },
{ cat: 'determination', texte: "La réussite ne se mesure pas à ce que tu as accompli mais à ce que tu as surmonté." },
{ cat: 'determination', texte: "Arrête d'attendre le bon moment. Le bon moment c'est maintenant." },
{ cat: 'determination', texte: "Ce que tu tolères tu l'encourages. Relève tes standards." },
{ cat: 'determination', texte: "Sois obsédé par tes objectifs ou sois médiocre. Pas de milieu." },
{ cat: 'determination', texte: "Le feu qui te brûle peut aussi te réchauffer. Tout dépend de ta position." },
{ cat: 'determination', texte: "Quand la vie te met à genoux tu es dans la meilleure position pour te relever plus fort." },
{ cat: 'determination', texte: "Les doutes dans ta tête sont plus dangereux que les obstacles sur ton chemin." },
{ cat: 'determination', texte: "Construis en silence. Les résultats feront le discours." },
{ cat: 'determination', texte: "Ne compte pas sur la chance. Compte sur le travail." },
{ cat: 'determination', texte: "Ta discipline aujourd'hui c'est ta liberté demain." },
{ cat: 'determination', texte: "Chaque non que tu entends te rapproche du oui que tu mérites." },
{ cat: 'determination', texte: "Sois plus dur avec toi-même que le monde ne l'est avec toi." },
{ cat: 'determination', texte: "Le génie c'est 1% d'inspiration et 99% de transpiration." },
{ cat: 'determination', texte: "Personne ne te donnera ce que tu mérites. Tu dois aller le chercher." },
{ cat: 'determination', texte: "La persévérance est amère mais ses fruits sont doux." },
{ cat: 'determination', texte: "Celui qui ne risque rien ne perd rien mais ne gagne rien non plus." },
{ cat: 'determination', texte: "Les grandes choses ne viennent jamais de zones de confort." },
{ cat: 'determination', texte: "Ne te compare pas aux autres. Compare-toi à celui que tu étais hier." },
{ cat: 'determination', texte: "La victoire la plus difficile c'est la victoire sur soi-même." },
{ cat: 'determination', texte: "Donne tout ce que tu as pour ce que tu veux devenir." },
{ cat: 'determination', texte: "Chaque expert a été un jour un débutant qui n'a pas abandonné." },
{ cat: 'determination', texte: "Tu as survécu à 100% de tes pires jours. Continue." },
{ cat: 'determination', texte: "Ce n'est pas qui tu es qui te retient. C'est qui tu crois ne pas être." },
{ cat: 'determination', texte: "Transforme ta douleur en carburant." },
{ cat: 'determination', texte: "Chaque matin est une nouvelle chance de tout changer." },
{ cat: 'determination', texte: "Le succès c'est tomber sept fois et se relever huit." },
{ cat: 'determination', texte: "Sois la preuve que l'impossible est possible." },
{ cat: 'determination', texte: "Ta valeur ne diminue pas parce que quelqu'un ne voit pas ton prix." },
{ cat: 'determination', texte: "Ne te laisse pas définir par tes échecs. Laisse-toi construire par eux." },
{ cat: 'determination', texte: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves." },
{ cat: 'determination', texte: "Fais de ta vie une légende que les autres voudront raconter." },
{ cat: 'determination', texte: "La seule façon d'échouer vraiment c'est de ne jamais essayer." },
{ cat: 'determination', texte: "Quand tout semble contre toi souviens-toi que l'avion décolle contre le vent." },
{ cat: 'determination', texte: "Ne cherche pas à être parfait. Cherche à être meilleur qu'hier." },
{ cat: 'determination', texte: "Le monde appartient à ceux qui refusent d'accepter les limites qu'on leur impose." },
];





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




// function de la theme du fond d'ecran
const themes = [
  { nom: 'default', bg: 'bg-slate-50', image: '' },
  { nom: 'cyan', bg: 'bg-slate-50', image: 'assets/bacground.jpg' }
];

let themeActuel = parseInt(localStorage.getItem('themeIndex')) || 0;

// Appliquer au chargement
appliquerTheme(themeActuel);

function appliquerTheme(index) {
  const theme = themes[index];
  
  // Changer la couleur
  document.body.className = theme.bg;
  
  // Changer l'image de fond
  if (theme.image) {
    document.body.style.backgroundImage = `url('${theme.image}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = '';
  }
  
  // Sauvegarder
  localStorage.setItem('themeIndex', index);
}

function changerTheme() {
  themeActuel = (themeActuel + 1) % themes.length;
  appliquerTheme(themeActuel);
}



// BOUTON FLOTTANT DRAGGABLE
const btnTheme = document.getElementById('btnTheme');
let isDragging = false;
let offsetX, offsetY;
let startX, startY;

// SOURIS
btnTheme.addEventListener('mousedown', (e) => {
  isDragging = false;
  startX = e.clientX;
  startY = e.clientY;
  offsetX = e.clientX - btnTheme.offsetLeft;
  offsetY = e.clientY - btnTheme.offsetTop;
  btnTheme.style.cursor = 'grabbing';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!btnTheme.matches(':active')) return;
  isDragging = true;
  btnTheme.style.left = (e.clientX - offsetX) + 'px';
  btnTheme.style.top = (e.clientY - offsetY) + 'px';
  btnTheme.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
  btnTheme.style.cursor = 'grab';
  sauvegarderPosition();
});

// TACTILE (mobile)
btnTheme.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  isDragging = false;
  startX = touch.clientX;
  startY = touch.clientY;
  offsetX = touch.clientX - btnTheme.offsetLeft;
  offsetY = touch.clientY - btnTheme.offsetTop;
  e.preventDefault();
}, { passive: false });

btnTheme.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  isDragging = true;
  btnTheme.style.left = (touch.clientX - offsetX) + 'px';
  btnTheme.style.top = (touch.clientY - offsetY) + 'px';
  btnTheme.style.right = 'auto';
  e.preventDefault();
}, { passive: false });

btnTheme.addEventListener('touchend', (e) => {
  if (!isDragging) {
    changerTheme(); // clic simple = changer thème
  }
  sauvegarderPosition();
});

// SAUVEGARDER POSITION
function sauvegarderPosition() {
  localStorage.setItem('btnX', btnTheme.style.left);
  localStorage.setItem('btnY', btnTheme.style.top);
}

// RESTAURER POSITION
const savedX = localStorage.getItem('btnX');
const savedY = localStorage.getItem('btnY');
if (savedX && savedY) {
  btnTheme.style.left = savedX;
  btnTheme.style.top = savedY;
  btnTheme.style.right = 'auto';
}




