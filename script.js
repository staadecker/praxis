const binsImage = document.getElementById("bins");

const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";
const NUMBER_OF_ITEMS = 10;

let items_disposed = 0;
let current_image_name = null;
let item_displayed = false;
let experiment_data = []; // delay to dispose garbage; item displayed; category disposed
let displayed_time = null;
let user_uuid = null;

firebase.auth().signInAnonymously().catch(function (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorCode.toString() + " " + errorMessage)
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("Signed in");
        user_uuid = user.uid;
    }
});

// Create a root reference
const storageRef = firebase.storage().ref();

binsImage.addEventListener("load", init);

function init() {
    const binContent = binsImage.contentDocument;

    binContent.getElementById("Coffee_Slot").addEventListener("click", () => onCategoryClick(COFFEE));
    binContent.getElementById("Garbage_Slot").addEventListener("click", () => onCategoryClick(GARBAGE));
    binContent.getElementById("Paper_Slot").addEventListener("click", () => onCategoryClick(PAPER));
    binContent.getElementById("Container_Slot").addEventListener("click", () => onCategoryClick(CONTAINER));

    nextItem()
}

function nextItem() {
    displayItem(COFFEE + ".png")
}

function onCategoryClick(categoryName) {
    if (item_displayed) {
        let current_time = Date.now();
        let item_data = [current_time - displayed_time, current_image_name, categoryName].join(",");
        experiment_data.push(item_data);
        items_disposed++;
        removeItemFromDisplay();

        if (items_disposed === NUMBER_OF_ITEMS) {
            removeItemFromDisplay();
            submitData();
        } else {
            nextItem();
        }
    }
}

function removeItemFromDisplay() {
    item_displayed = false;
    current_image_name = null;
}

function displayItem(filename) {
    item_displayed = true;
    displayed_time = Date.now();
    current_image_name = filename
}

function submitData() {
    const output_string = "Test Sample " + Date.now() + "\n" + experiment_data.join("\n");
    console.log(output_string);
    storageRef.child('/user/'+user_uuid + '/results.csv').putString(output_string).then(function () {
        alert("Thank you! The results have been submitted.")
    })
}