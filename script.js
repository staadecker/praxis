const binsImage = document.getElementById("bins");

binsImage.addEventListener("load", init);

function init() {
    const binContent = binsImage.contentDocument;
    binContent.getElementById("Coffee_Slot").addEventListener("click", () =>
        onCategoryClick("coffee")
    );

    binContent.getElementById("Garbage_Slot").addEventListener("click", () =>
        onCategoryClick("garbage")
    );

    binContent.getElementById("Paper_Slot").addEventListener("click", () =>
        onCategoryClick("paper")
    );

    binContent.getElementById("Container_Slot").addEventListener("click", () =>
        onCategoryClick("container")
    );
}

function onCategoryClick(categoryName) {
    alert(categoryName)
}