

// HOMEPAGE IMAGE CAROUSEL


const images = [
    "resturant.png",
    "image2.png",
    "image3.png",
    "image4.png",
    "image5.png",
    "image6.png",
    "image7.png",
    "image8.png",
    "image9.png",
    "image10.png"
];

const carousel = document.getElementById("carousel");
const prev = document.getElementById("prev");
const pause = document.getElementById("pause");
const next = document.getElementById("next");
const imageCounter = document.getElementById("imageCounter");

let currentIndex = 0;
let isPaused = false;
let timer = null;

function showImage(index) {
    currentIndex = (index + images.length) % images.length;

    carousel.src = images[currentIndex];
    imageCounter.textContent =
        `${currentIndex + 1}/${images.length}`;
}

function nextImage() {
    showImage(currentIndex + 1);
}

function prevImage() {
    showImage(currentIndex - 1);
}

function startCarousel() {
    clearInterval(timer);

    timer = setInterval(function () {
        nextImage();
    }, 4000);
}

// Only run carousel code on the homepage
if (carousel && prev && pause && next && imageCounter) {

    showImage(0);
    startCarousel();

    next.addEventListener("click", nextImage);
    prev.addEventListener("click", prevImage);

    pause.addEventListener("click", function () {

        if (isPaused) {
            isPaused = false;
            pause.textContent = "Pause";
            startCarousel();
        } else {
            isPaused = true;
            clearInterval(timer);
            pause.textContent = "Resume";
        }
    });
}



// CALGARY WEATHER AND TIME


const temperature = document.querySelector("#temp");
const weather = document.querySelector("#weather");
const time = document.querySelector("#time");

async function getWeather() {

    // Calgary coordinates
    const api ="https://api.open-meteo.com/v1/forecast?latitude=51.0501&longitude=-114.0853&current=temperature_2m,weather_code&timezone=auto"
       

    try {
        const response = await fetch(api);

        if (!response.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const data = await response.json();
        console.log(data);

        const temp = data.current.temperature_2m;
        const condition = data.current.weather_code;

        // Display temperature
        if (temperature) {
            temperature.textContent =
                `Temperature: ${temp} °C`;
        }

        // Match weather codes to weather conditions
        let description;

        if (condition === 0) {
            description = "Sunny ☀️";
        } else if ([1, 2, 3].includes(condition)) {
            description = "Cloudy ☁️";
        } else if ([45, 48].includes(condition)) {
            description = "Foggy 🌫️";
        } else if (
            [51, 53, 55, 56, 57,
             61, 63, 65, 66, 67,
             80, 81, 82].includes(condition)
        ) {
            description = "Rainy 🌧️";
        } else if (
            [71, 73, 75, 77, 85, 86].includes(condition)
        ) {
            description = "Snowy ❄️";
        } else if ([95, 96, 99].includes(condition)) {
            description = "Thunderstorm ⛈️";
        } else {
            description = "Weather unavailable";
        }

        if (weather) {
            weather.textContent =
                `Current Weather: ${description}`;
        }

        // Display the local Calgary time returned by the API
        if (time && data.current.time) {
            const dateTime = new Date(data.current.time);

            time.textContent =
                `Time: ${dateTime.toLocaleTimeString("en-CA", {
                    timeZone: "America/Edmonton",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                })}`;
        }

    } catch (error) {
        console.error("Weather error:", error);

        if (temperature) {
            temperature.textContent = "Temperature unavailable";
        }

        if (weather) {
            weather.textContent = "Weather unavailable";
        }

        if (time) {
            time.textContent = "Time unavailable";
        }
    }
}
getWeather();



// ORDERING SYSTEM


const orderForm = document.querySelector("#orderForm");
const liveTotal = document.querySelector(".liveTotal");
const receipt = document.querySelector("#receipt");

const gstRate = 5;
const maxQuantity = 20;


// Convert dollars into cents to avoid floating-point errors
function toCents(price) {
    return Math.round(Number(price) * 100);
}


// Display cents as dollars with two decimal places
function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}


// Calculate the current order
function calculateOrder() {

    const menuItems = orderForm.querySelectorAll(
        ".menueItems[data-name]"
    );

    const items = [];
    let subtotal = 0;
    let valid = true;

    menuItems.forEach(function (item) {

        const input = item.querySelector("input[type='number']");

        if (!input) {
            return;
        }

        const name = item.dataset.name;
        const quantityText = input.value.trim();
        const quantity = Number(quantityText);
        const price = toCents(input.dataset.price);

        // Check each quantity
        if (
            quantityText === "" ||
            !Number.isInteger(quantity) ||
            quantity < 0 ||
            quantity > maxQuantity
        ) {
            valid = false;
            return;
        }

        // Only add items with a quantity greater than zero
        if (quantity > 0) {

            const itemTotal = price * quantity;

            items.push({
                name: name,
                quantity: quantity,
                price: price,
                itemTotal: itemTotal
            });

            subtotal += itemTotal;
        }
    });

    // Calculate GST in cents
    const gst = Math.round(subtotal * gstRate / 100);
    const total = subtotal + gst;

    return {
        items: items,
        subtotal: subtotal,
        gst: gst,
        total: total,
        valid: valid
    };
}


//  UPDATE SUBTOTAL IN REAL TIME


function updateTotal() {

    if (!orderForm || !liveTotal) {
        return;
    }

    const order = calculateOrder();

    if (!order.valid) {
        liveTotal.textContent = "Check quantities";
        return;
    }

    liveTotal.textContent = formatPrice(order.subtotal);
}



//  VALIDATE THE ORDER


function validateQuantity() {

    const quantityInputs = orderForm.querySelectorAll(
        "input[type='number']"
    );

    for (const input of quantityInputs) {

        const quantityText = input.value.trim();
        const quantity = Number(quantityText);

        if (
            quantityText === "" ||
            !Number.isInteger(quantity) ||
            quantity < 0 ||
            quantity > maxQuantity
        ) {
            alert("Please enter a whole number between 0 and 20.");

            input.focus();
            return false;
        }
    }

    return true;
}



// 6. GENERATE THE ITEMIZED RECEIPT



function generateReceipt(order) {

    receipt.replaceChildren();

    // Check that at least one item was selected
    if (order.items.length === 0) {
        alert("Please select at least one menu item.");
        return;
    }

    // Receipt heading
    const heading = document.createElement("h2");
    heading.textContent = "Your Receipt";
    receipt.appendChild(heading);

    // Display each ordered item
    order.items.forEach(function (item) {

        // Item name and total price on one line
        const itemLine = document.createElement("p");

        itemLine.textContent =
            `${item.name}: ${formatPrice(item.itemTotal)}`;

        receipt.appendChild(itemLine);

        // Quantity and individual price underneath
        const detailLine = document.createElement("small");

        detailLine.textContent =
            `${item.quantity} @ ${formatPrice(item.price)}`;

        receipt.appendChild(detailLine);
    });

    // Subtotal
    const subtotalLine = document.createElement("p");

    subtotalLine.textContent =
        `Subtotal: ${formatPrice(order.subtotal)}`;

    receipt.appendChild(subtotalLine);

    // GST
    const gstLine = document.createElement("p");

    gstLine.textContent =
        `GST (5%): ${formatPrice(order.gst)}`;

    receipt.appendChild(gstLine);

    // Final total
    const totalLine = document.createElement("h3");

    totalLine.textContent =
        `TOTAL (Including Taxes): ${formatPrice(order.total)}`;

    receipt.appendChild(totalLine);
}



// CONNECT THE ORDER FORM

if (orderForm) {

    // Update subtotal whenever a quantity changes
    orderForm.addEventListener("input", function (event) {

        if (event.target.matches("input[type='number']")) {
            updateTotal();
        }
    });

    // Generate receipt when the form is submitted
    orderForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (!validateQuantity()) {
            return;
        }

        const order = calculateOrder();

        if (!order.valid) {
            alert("Please correct the quantities.");
            return;
        }

        if (order.items.length === 0) {
            receipt.replaceChildren();
            alert("Please select at least one menu item.");
            return;
        }

        generateReceipt(order);
    });

    // Display initial subtotal
    updateTotal();
}

