// Note. I am aware this is ugly code mainly because of a lack of separation between the logic and the UI.
// The reason for this is because it had to been written is only a couple days (similar to a hackathon).

const ORDERED_IMAGES = ['apple.png', 'coffee cup.png', 'coffee lid.jpg',
    'coffee paper cup.jpeg', 'eggshells.jpg', 'elastic bands.jpg', 'milk.png',
    "paper.png", 'pizza box.jpg', 'snickers.png', 'tea bag.jpg'];

class Helper {
    static shuffle(array) {
        // From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        // Which was taken from: https://github.com/Daplie/knuth-shuffle
        // Randomly elements in an array.
        var currentIndex = array.length, temporaryValue, randomIndex;

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
}

class Firebase {
    constructor() {
        this._user_uuid = null;
    }

    // Create a root reference
    async sign_in() {
        var userCredentials;
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
        console.log("Submitting data as: " + this._user_uuid);

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

                $("#end_dialog").modal('hide');
                $("#thank_you").modal('show');
            }
        )
    }
}

class Game {
    constructor() {
        this._items_disposed = 0;
        this.current_image_name = null;
        this._experiment_data = []; // item format: delay to dispose garbage, item displayed, category disposed
        this._displayed_timestamp = null;
        this._add_delay = false;
        this._bin_filename = null;
        this.DELAY = 2000;
    }

    load_bin_picture() {
        switch (case_choice) {
            case "control":
            case "delay":
                this._bin_filename = "myhal_bin.svg";
                break;
            case "labels_good":
                this._bin_filename = "good_bin.svg";
                break;
        }

        html_bin_image.setAttribute("data", "res/" + this._bin_filename);
    }

    prepare() {
        const binContent = html_bin_image.contentDocument;

        html_item_image.src = IMAGES_DIRECTORY + IMAGES[IMAGES.length - 1]; // Prepare first image. Hidden

        // Ids are defined in the svg bin image.
        binContent.getElementById("Coffee_Slot").addEventListener("click", () => this.onCategoryClick(COFFEE));
        binContent.getElementById("Garbage_Slot").addEventListener("click", () => this.onCategoryClick(GARBAGE));
        binContent.getElementById("Paper_Slot").addEventListener("click", () => this.onCategoryClick(PAPER));
        binContent.getElementById("Container_Slot").addEventListener("click", () => this.onCategoryClick(CONTAINER));

        if (case_choice === "delay") {
            this._add_delay = true;
        }
    }

    start() {
        this.displayNextItem();
    }

    displayNextItem() {
        const filename = IMAGES.pop();
        html_item_image.src = IMAGES_DIRECTORY + filename;
        html_item_image.style.visibility = 'visible';
        this._displayed_timestamp = Date.now();

        if (this._add_delay) {
            html_delay_progress.MaterialProgress.setProgress(0);
            html_overlay.style.display = 'block';
            const start_timestamp = Date.now();

            const interval_timer = setInterval(function () {
                const elapsed = Date.now() - start_timestamp;
                if (elapsed < game.DELAY) {
                    html_delay_progress.MaterialProgress.setProgress((elapsed / game.DELAY) * 100)
                } else {
                    clearTimeout(interval_timer);
                    html_overlay.style.display = 'none';
                    game.current_image_name = filename;
                }
            }, 100)
        } else {
            this.current_image_name = filename;
        }
    }

    onCategoryClick(categoryName) {
        if (this.current_image_name) {
            const current_time = Date.now();

            //Item data is a string (formatted as a csv file row)
            const item_data = [current_time - this._displayed_timestamp, this.current_image_name, categoryName].join(",");
            this._experiment_data.push(item_data);

            this.removeItemFromDisplay();
            this._items_disposed++;

            if (this._items_disposed !== NUMBER_OF_ITEMS) {
                this.displayNextItem();
            } else {
                $("#end_dialog").modal('show');

                // Add header row
                this._experiment_data.unshift([Date.now(), this._bin_filename, this._add_delay, this.DELAY].join(","));
                const output_string = this._experiment_data.join("\n");
                firebase_connection.submitData(output_string);
            }
        }
    }

    removeItemFromDisplay() {
        this.current_image_name = null;
        html_item_image.style.visibility = 'hidden';
    }
}


const IMAGES = Helper.shuffle(ORDERED_IMAGES); // TODO: Scan res/items instead of hard coding file names
const NUMBER_OF_ITEMS = IMAGES.length;

const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";
const IMAGES_DIRECTORY = "res/items/";
const SIGN_OUT = true; //Whether the anonymous user should be signed out of firebase

var case_choice;

const firebase_connection = new Firebase();
const game = new Game();

const html_start_button = document.getElementById('start_button');
const html_case_dropdown = document.getElementById("case_dropdown");
const html_item_image = document.getElementById("item");
const html_bin_image = document.getElementById("bins");
const html_overlay = document.getElementById("overlay");
const html_delay_progress = document.getElementById("delay_progress");

function init() {
    // Access welcome dialog
    $('#start_dialog').modal('show');

    html_case_dropdown.addEventListener('change', () => dropdown_changed());

    html_bin_image.addEventListener("load", () => {
        game.prepare();
        $('#start_dialog').modal('hide');
        game.start();
    });

    // Define on click of start
    html_start_button.onclick = async function () {
        // Disable button and show that it's loading;
        $('#start_button').prop('disabled', true);
        case_choice = html_case_dropdown.options[html_case_dropdown.selectedIndex].value;

        await firebase_connection.sign_in();

        game.load_bin_picture();
    };
}

function dropdown_changed() {
    if (html_case_dropdown.options[html_case_dropdown.selectedIndex].value === "none") {
        $('#start_button').prop('disabled', true);
    } else {
        $('#start_button').prop('disabled', false);
    }
}

init();