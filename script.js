const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const circles = [];
const ledLightOn = "rgb(255, 0, 0)";
const ledLightOff = "rgb(30, 0, 0)";
const db = firebase.firestore();

getAllDataFromDB();

function openForm() {
    document.querySelector(".popup").style.display = "block";
    document.getElementById("arrow").style.display = "block";
    document.getElementById("save-button").style.display = "none";
}

function closeForm() {
    document.querySelector(".popup").style.display = "none";
    document.getElementById("arrow").style.display = "none";
    document.getElementById("save-button").style.display = "block";
}

function drawLeds() {
    let i = 1;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const circle = {
                id: i,
                x: 15 + 30 * x,
                y: 15 + 30 * y,
                radius: 10,
                color: ledLightOff
            };
            circles.push(circle);
            i++;

            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = circle.color;
            ctx.fill();
        }
    }
}

canvas.addEventListener("click", e => {
    const clickedPosition = {
        x: e.pageX - canvas.offsetLeft,
        y: e.pageY - canvas.offsetTop
    };

    circles.forEach(circle => {
        if (isInCircle(clickedPosition, circle)) {
            console.log("clicked circle: + " + circle.id);
            changeLedColor(circle);
        }
    });
});

function changeLedColor(circle) {
    if (circle.color === ledLightOff) {
        circle.color = ledLightOn;
    } else {
        circle.color = ledLightOff;
    }

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = circle.color;
    ctx.fill();
}

function isInCircle(point, circle) {
    return (
        Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2)) < circle.radius);
}

function writeEmojiData() {
    db.collection("emojis")
        .add({
            name: document.getElementById("emoji-name").value,
            emojiImg: canvas.toDataURL("image/jpeg", 1.0),
            date: firebase.firestore.Timestamp.fromDate(new Date())
        })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            createNewElement(
                canvas.toDataURL("image/jpeg", 1.0),
                document.getElementById("emoji-name").value
            );
        })
        .catch(function (error) {
            alert("Error adding document: " + error);
            console.error("Error adding document: ", error);
        });
}

function getAllDataFromDB() {
    db.collection("emojis")
        .orderBy("date", "asc")
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                console.log(doc.id, " => ", doc.data());
                createNewElement(doc.data().emojiImg, doc.data().name);
            });
        });
}

function createNewElement(emojiImg, emojiName) {
    const newDiv = document.createElement("div");
    const newHeader = document.createElement("h3");
    newHeader.innerHTML = emojiName;

    const newImg = document.createElement("img");
    newImg.src = emojiImg;

    newDiv.appendChild(newHeader);
    newDiv.appendChild(newImg);

    const parentNode = document.getElementById("stored-emojis");

    parentNode.insertBefore(newDiv, parentNode.firstChild);
}
