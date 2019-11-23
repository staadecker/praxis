const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";
const IMAGE_FILE_PATH = "res/items/";
const SIGN_OUT = true;

let current_dialog;

function shuffle(array) {
    // From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
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

const IMAGES = shuffle(['apple.png', 'coffee cup.png', 'milk.png', 'paper.png', 'snickers.png']); // TODO: Scan res/items instead of hard coding file names
const NUMBER_OF_ITEMS = IMAGES.length;


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
        // const output_string = "Test Sample " + Date.now() + "\n" + experiment_data.join("\n");
        const file_path = '/user/' + this._user_uuid + '/results.csv';

        const upload_task = firebase.storage().ref().child(file_path).putString(data_string);

        upload_task.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                update_end_dialog_progress(progress);
                console.log('Upload is ' + progress + '% done');
            },
            function (error) {
                console.log(error.toString())
            },
            function () {
                console.log("Uploaded successfully");
                if (SIGN_OUT) {
                    firebase.auth().signOut();
                    console.log("Signed out")
                }

                display_thank_you();
            }
        )
    }
}

class Game {
    _items_disposed = 0;
    _current_image_name;
    _experiment_data = []; // delay to dispose garbage; item displayed; category disposed
    _displayed_time;
    _html_item_to_dispose;

    start() {
        const binContent = document.getElementById("bins").contentDocument;
        this._html_item_to_dispose = document.getElementById("item");

        binContent.getElementById("Coffee_Slot").addEventListener("click", () => this.onCategoryClick(COFFEE));
        binContent.getElementById("Garbage_Slot").addEventListener("click", () => this.onCategoryClick(GARBAGE));
        binContent.getElementById("Paper_Slot").addEventListener("click", () => this.onCategoryClick(PAPER));
        binContent.getElementById("Container_Slot").addEventListener("click", () => this.onCategoryClick(CONTAINER));

        this.nextItem();
    }

    nextItem() {
        this.displayItem(IMAGES.pop());
    }

    onCategoryClick(categoryName) {
        if (this._current_image_name) {
            let current_time = Date.now();
            let item_data = [current_time - this._displayed_time, this._current_image_name, categoryName].join(",");
            this._experiment_data.push(item_data);
            this.removeItemFromDisplay();
            this._items_disposed++;

            if (this._items_disposed === NUMBER_OF_ITEMS) {
                show_end_dialog();
                const output_string = "Test Sample " + Date.now() + "\n" + this._experiment_data.join("\n");
                firebase_connection.submitData(output_string);
            } else {
                this.nextItem();
            }
        }
    }

    removeItemFromDisplay() {
        //TODO remove item
        this._current_image_name = null;
        this._html_item_to_dispose.style.visibility = 'hidden';
    }

    displayItem(filename) {
        //TODO display item
        this._html_item_to_dispose.src = IMAGE_FILE_PATH + filename;
        this._html_item_to_dispose.style.visibility = 'visible';
        this._displayed_time = Date.now();
        this._current_image_name = filename;
    }
}

const firebase_connection = new Firebase();

const game = new Game();

function init() {
    current_dialog = document.querySelector('#start_dialog');
    dialogPolyfill.registerDialog(current_dialog);

    document.querySelector('#start_button').onclick = function () {
        // const value = document.querySelector('#return_value').value;
        current_dialog.close();
    };

    document.querySelector('#start_dialog').addEventListener('close', async function () {
        await firebase_connection.sign_in();

        let interval_timer = setInterval(function () {
            if (document.getElementById("bins")) {
                clearInterval(interval_timer);
                game.start()
            }
        }, 100);
    });

    current_dialog.showModal();
    prepare_first_image();
}

function prepare_first_image() {
    this._html_item_to_dispose.style.visibility = 'hidden';
    this._html_item_to_dispose.src = IMAGE_FILE_PATH + IMAGES[IMAGES.length - 1];
}

function show_end_dialog() {
    current_dialog = document.querySelector('#end_dialog');
    dialogPolyfill.registerDialog(current_dialog);
    current_dialog.showModal();
}

function update_end_dialog_progress(percent) {
    document.querySelector("#upload_progress").MaterialProgress.setProgress(percent)
}

function display_thank_you() {
    current_dialog.close();

    current_dialog = document.querySelector("#thank_you");
    dialogPolyfill.registerDialog(current_dialog);
    current_dialog.showModal();
}

init();