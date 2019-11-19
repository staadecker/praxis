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
    console.log(experiment_data.join("\n"));
}