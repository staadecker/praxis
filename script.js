class Helper {
    static shuffle(array) {
        // From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        // Which was taken from: https://github.com/Daplie/knuth-shuffle
        // Randomly elements in an array.
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    static display_dialog(dialog_selector) {
        const dialog = document.querySelector(dialog_selector);
        dialogPolyfill.registerDialog(dialog);
        dialog.showModal();

        return dialog
    }
}

class Firebase {
    _user_uuid;

    // Create a root reference
    async sign_in() {
        let userCredentials;
        try {
            userCredentials = await firebase.auth().signInAnonymously();
        } catch (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + ": " + errorMessage);
            alert(errorCode.toString() + " " + errorMessage);
            return;
        }

        this._user_uuid = userCredentials.user.uid;
    }

    submitData(data_string) {
        const file_path = '/user/' + this._user_uuid + '/results.csv';

        const upload_task = firebase.storage().ref().child(file_path).putString(data_string);

        upload_task.on(firebase.storage.TaskEvent.STATE_CHANGED,
            //Progress
            function (snapshot) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.querySelector("#upload_progress").MaterialProgress.setProgress(progress);
            },
            //Error
            function (error) {
                console.log(error.toString())
            },
            //Complete
            function () {
                if (SIGN_OUT) {
                    firebase.auth().signOut();
                }

                current_dialog.close();
                current_dialog = Helper.display_dialog("#thank_you")
            }
        )
    }
}

class Game {
    _items_disposed = 0;
    _current_image_name;
    _experiment_data = []; // item format: delay to dispose garbage, item displayed, category disposed
    _displayed_timestamp;

    prepare() {
        const binContent = document.getElementById("bins").contentDocument;

        html_item_image.src = IMAGES_DIRECTORY + IMAGES[IMAGES.length - 1]; // Prepare first image. Hidden

        // Ids are defined in the svg bin image.
        binContent.getElementById("Coffee_Slot").addEventListener("click", () => this.onCategoryClick(COFFEE));
        binContent.getElementById("Garbage_Slot").addEventListener("click", () => this.onCategoryClick(GARBAGE));
        binContent.getElementById("Paper_Slot").addEventListener("click", () => this.onCategoryClick(PAPER));
        binContent.getElementById("Container_Slot").addEventListener("click", () => this.onCategoryClick(CONTAINER));
    }

    start() {
        this.displayNextItem();
    }

    displayNextItem() {
        const filename = IMAGES.pop();
        html_item_image.src = IMAGES_DIRECTORY + filename;
        html_item_image.style.visibility = 'visible';
        this._displayed_timestamp = Date.now();
        this._current_image_name = filename;
    }

    onCategoryClick(categoryName) {
        if (this._current_image_name) {
            const current_time = Date.now();

            //Item data is a string (formatted as a csv file row)
            const item_data = [current_time - this._displayed_timestamp, this._current_image_name, categoryName].join(",");
            this._experiment_data.push(item_data);

            this.removeItemFromDisplay();
            this._items_disposed++;

            if (this._items_disposed !== NUMBER_OF_ITEMS) {
                this.displayNextItem();
            } else {
                current_dialog = Helper.display_dialog("#end_dialog");

                // Add header row
                const output_string = "Test Sample " + Date.now() + "\n" + this._experiment_data.join("\n");
                firebase_connection.submitData(output_string);
            }
        }
    }

    removeItemFromDisplay() {
        this._current_image_name = null;
        html_item_image.style.visibility = 'hidden';
    }
}

const IMAGES = Helper.shuffle(['apple.png', 'coffee cup.png', 'milk.png', 'paper.png', 'snickers.png']); // TODO: Scan res/items instead of hard coding file names
const NUMBER_OF_ITEMS = IMAGES.length;

const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";
const IMAGES_DIRECTORY = "res/items/";
const SIGN_OUT = true; //Whether the anonymous user should be signed out of firebase

let current_dialog;

const firebase_connection = new Firebase();
const game = new Game();

const start_button = document.querySelector('#start_button');
const case_dropdown = document.getElementById("case_dropdown");
const html_item_image = document.getElementById("item");

function init() {
    // Access welcome dialog
    current_dialog = document.querySelector('#start_dialog');

    dialogPolyfill.registerDialog(current_dialog);

    current_dialog.addEventListener('close', () => game.start());
    case_dropdown.addEventListener('change', () => dropdown_changed());

    // Define on click of start
    start_button.onclick = async function () {
        // Disable button and show that it's loading;
        start_button.classList.add('running', "mdl-button--disabled");

        await firebase_connection.sign_in();

        // Keep checking if 'bins' exists. When it does prepare the game and then close the dialog.
        let interval_timer = setInterval(function () {
            if (document.getElementById("bins")) {
                clearInterval(interval_timer);
                game.prepare();
                current_dialog.close();
            }
        }, 100);
    };

    current_dialog.showModal();


}

function dropdown_changed() {
    if (case_dropdown.options[case_dropdown.selectedIndex].value === "none") {
        start_button.classList.add("mdl-button--disabled")
    } else {
        start_button.classList.remove("mdl-button--disabled")
    }
}

init();