const params = new URLSearchParams(window.location.search);

const invalidRequestSection = document.getElementById("invalidRequest");
const checkoutSection = document.getElementById("checkout");
const merchantNameElement = document.getElementById("merchantName");
const paymentAmountElement = document.getElementById("paymentAmount");
const paymentReferenceElement = document.getElementById("paymentReference");
const cardNumberInput = document.getElementById("cardNumber");
const cardholderIdInput = document.getElementById("cardholderId");
const payButton = document.getElementById("payBtn");
const statusElement = document.getElementById("status");

const amountText = params.get("amount");
const merchant = params.get("merchant");
const reference = params.get("reference");

const amount = Number(amountText);

const hasValidRequest =
    amountText !== null &&
    amountText.trim() !== "" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    merchant !== null &&
    merchant.trim() !== "";

if (!hasValidRequest) {
    invalidRequestSection.hidden = false;
} else {
    checkoutSection.hidden = false;

    merchantNameElement.textContent = merchant;
    paymentAmountElement.textContent = `POK${amount.toFixed(2)}`;
    paymentReferenceElement.textContent = reference || "Not provided";

    payButton.addEventListener("click", processPayment);
}

async function processPayment() {
    const cardNumber = cardNumberInput.value.replace(/\D/g, "");
    const cardholderId = cardholderIdInput.value.trim();

    statusElement.textContent = "";

    if (!cardNumber || !cardholderId) {
        statusElement.textContent =
            "Enter your POKIP card number and cardholder ID.";
        return;
    }

    payButton.disabled = true;
    payButton.textContent = "Checking…";
    statusElement.textContent = "Checking card details…";

    try {
        const account = await checkDemoCard(cardNumber);

        if (!account.found) {
            throw new Error("POKIP card not found.");
        }

        if (!account.active) {
            throw new Error("This POKIP card is inactive.");
        }

        if (
            String(account.cardholderId).toLowerCase() !==
            cardholderId.toLowerCase()
        ) {
            throw new Error("Incorrect Cardholder ID.");
        }

        if (Number(account.balance) < amount) {
            throw new Error("Insufficient balance.");
        }

        statusElement.textContent = "Payment approved (demo).";
        payButton.textContent = "Payment complete";
        cardNumberInput.disabled = true;
        cardholderIdInput.disabled = true;

        // Add EmailJS confirmation logic here.
    } catch (error) {
        console.error(error);
        statusElement.textContent =
            error.message || "The payment could not be completed.";
        payButton.disabled = false;
        payButton.textContent = "Pay";
    }
}

async function checkDemoCard(cardNumber) {
    const requestUrl =
        `${CONFIG.AUTH_BASE}/${encodeURIComponent(cardNumber)}/accountfetch`;

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });

    if (response.status === 404) {
        return { found: false };
    }

    if (!response.ok) {
        throw new Error(`Account service returned HTTP ${response.status}.`);
    }

    const account = await response.json();

    return {
        found: true,
        active: Boolean(account.active),
        name: account.name,
        cardholderId: account.cardholderId,
        balance: Number(account.balance),
        currency: account.currency || "POK"
    };
}
