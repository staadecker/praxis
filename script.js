const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";
const IMAGE_FILE_PATH = "res/items/";
const SIGNOUT = false;

// import {MDCDialog} from '@material/dialog';
// const dialog = new MDCDialog(document.querySelector('.mdc-dialog'));

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
        console.log("Signed in as " + this._user_uuid);
    }

    submitData(data_string) {
        // const output_string = "Test Sample " + Date.now() + "\n" + experiment_data.join("\n");
        const file_path = '/user/' + this._user_uuid + '/results.csv';

        const upload_task = firebase.storage().ref().child(file_path).putString(data_string);

        upload_task.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            function (error) {
                console.log(error.toString())
            },
            function () {
                // Upload completed successfully, now we can get the download URL
                upload_task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    console.log('File available at', downloadURL);
                });

                if (SIGNOUT) {
                    firebase.auth().signOut();
                    console.log("Signed out")
                }
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
        console.log("Displaying: " + filename);
    }
}
const firebase_connection = new Firebase();

const game = new Game();

function init() {
    const dialog = document.querySelector('dialog');
    dialogPolyfill.registerDialog(dialog);
    // Now dialog acts like a native <dialog>.
    dialog.showModal();

    document.querySelector('#start').onclick = function() {
        // const value = document.querySelector('#return_value').value;
        dialog.close();
    };

    document.querySelector('dialog').addEventListener('close', async function() {
        await firebase_connection.sign_in();

        let interval_timer = setInterval(function () {
            if (document.getElementById("bins")) {
                clearInterval(interval_timer);
                game.start()
            }
        }, 100);
    });
}

init();