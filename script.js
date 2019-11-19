const binsObject = document.getElementById("bins");

binsObject.addEventListener("load", function () {
    const coffee = binsObject.contentDocument.getElementById("Coffee_Slot");

    coffee.addEventListener("click", function () {
        alert("Coffee")
    });
});
