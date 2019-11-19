const binsImage = document.getElementById("bins");

const COFFEE = "coffee";
const PAPER = "paper";
const CONTAINER = "container";
const GARBAGE = "garbage";

binsImage.addEventListener("load", init);

function init() {
    const binContent = binsImage.contentDocument;

    binContent.getElementById("Coffee_Slot").addEventListener("click", () => onCategoryClick(COFFEE));
    binContent.getElementById("Garbage_Slot").addEventListener("click", () => onCategoryClick(GARBAGE));
    binContent.getElementById("Paper_Slot").addEventListener("click", () => onCategoryClick(PAPER));
    binContent.getElementById("Container_Slot").addEventListener("click", () => onCategoryClick(CONTAINER));
}

function onCategoryClick(categoryName) {
    alert(categoryName)
}