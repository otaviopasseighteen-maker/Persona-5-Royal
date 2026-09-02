/* =====================================================
   PERSONA 5 ROYAL
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   LOADING SCREEN
===================================================== */

document.body.classList.add("loading");

const loadingScreen = document.getElementById("loading-screen");
const loadingProgress = document.getElementById("loading-progress");
const loadingText = document.getElementById("loading-text");

let progress = 0;

const loadingMessages = [
    "INITIALIZING METAVERSE...",
    "LOADING PHANTOM THIEVES...",
    "ACCESSING PALACES...",
    "SYNCHRONIZING PERSONAS...",
    "PREPARING TOKYO...",
    "WELCOME, PHANTOM THIEF."
];

const loadingInterval = setInterval(() => {

    progress += Math.floor(Math.random() * 8) + 3;

    if (progress >= 100) {

        progress = 100;

        clearInterval(loadingInterval);

        loadingProgress.style.width = "100%";

        loadingText.textContent =
            loadingMessages[loadingMessages.length - 1];

        setTimeout(() => {

            loadingScreen.classList.add("loaded");

            document.body.classList.remove("loading");

            startTrailer();

        }, 700);

    } else {

        loadingProgress.style.width = `${progress}%`;

        const messageIndex =
            Math.floor(
                (progress / 100) *
                (loadingMessages.length - 1)
            );

        loadingText.textContent =
            loadingMessages[messageIndex];

    }

}, 180);


/* =====================================================
   TRAILER
===================================================== */

const trailerScreen =
    document.getElementById("trailer-screen");

const mainSite =
    document.getElementById("main-site");

const skipTrailer =
    document.getElementById("skip-trailer");


function startTrailer() {

    trailerScreen.style.display = "flex";

}


function closeTrailer() {

    trailerScreen.style.opacity = "0";

    trailerScreen.style.pointerEvents = "none";

    setTimeout(() => {

        trailerScreen.style.display = "none";

        mainSite.classList.add("visible");

    }, 700);

}


skipTrailer.addEventListener(
    "click",
    closeTrailer
);


/* =====================================================
   CHARACTERS
===================================================== */

const characters =
    document.querySelectorAll(".character");

const characterButtons =
    document.querySelectorAll(
        ".character-navigation button"
    );


function showCharacter(characterName) {

    characters.forEach(character => {

        character.classList.remove("active");

    });


    characterButtons.forEach(button => {

        button.classList.remove("active");

    });


    const selectedCharacter =
        document.querySelector(
            `.character[data-character="${characterName}"]`
        );


    const selectedButton =
        document.querySelector(
            `.character-navigation button[data-target="${characterName}"]`
        );


    if (selectedCharacter) {

        selectedCharacter.classList.add("active");

    }


    if (selectedButton) {

        selectedButton.classList.add("active");

    }

}


characterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target =
            button.dataset.target;

        showCharacter(target);

    });

});


showCharacter("joker");


/* =====================================================
   MOBILE MENU
===================================================== */

const menuButton =
    document.getElementById("menu-button");

const navigation =
    document.querySelector(".navbar nav");


menuButton.addEventListener(
    "click",
    () => {

        navigation.classList.toggle("open");

    }
);


/* =====================================================
   CLOSE MOBILE MENU AFTER CLICK
===================================================== */

const navLinks =
    document.querySelectorAll(".navbar nav a");


navLinks.forEach(link => {

    link.addEventListener(
        "click",
        () => {

            navigation.classList.remove("open");

        }
    );

});


/* =====================================================
   KEYBOARD CHARACTER CONTROL
===================================================== */

const characterNames = [
    "joker",
    "ryuji",
    "ann",
    "morgana",
    "yusuke",
    "makoto",
    "futaba",
    "haru",
    "akechi",
    "kasumi"
];


let currentCharacter = 0;


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "ArrowRight" &&
            event.key !== "ArrowLeft"
        ) {

            return;

        }


        if (event.key === "ArrowRight") {

            currentCharacter++;

            if (
                currentCharacter >=
                characterNames.length
            ) {

                currentCharacter = 0;

            }

        }


        if (event.key === "ArrowLeft") {

            currentCharacter--;

            if (currentCharacter < 0) {

                currentCharacter =
                    characterNames.length - 1;

            }

        }


        showCharacter(
            characterNames[currentCharacter]
        );

    }
);