// ========================================
// GET HTML ELEMENTS
// ========================================

const form = document.getElementById("expenseForm");

const type = document.getElementById("type");

const category = document.getElementById("category");

const description = document.getElementById("description");

const amount = document.getElementById("amount");

const date = document.getElementById("date");

const transactionList =
    document.getElementById("transactionList");

const balanceDisplay =
    document.getElementById("balance");

const incomeDisplay =
    document.getElementById("income");

const expensesDisplay =
    document.getElementById("expenses");

const submitButton =
    document.getElementById("submitButton");


// Search and filter

const search =
    document.getElementById("search");

const filterCategory =
    document.getElementById("filterCategory");


// Budget elements

const budgetInput =
    document.getElementById("budgetInput");

const setBudgetButton =
    document.getElementById("setBudgetButton");

const budgetAmountDisplay =
    document.getElementById("budgetAmount");

const budgetSpentDisplay =
    document.getElementById("budgetSpent");

const budgetRemainingDisplay =
    document.getElementById("budgetRemaining");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetMessage =
    document.getElementById("budgetMessage");


// ========================================
// LOAD SAVED TRANSACTIONS
// ========================================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// ========================================
// EDITING ID
// ========================================

let editingId = null;


// ========================================
// LOAD MONTHLY BUDGET
// ========================================

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


// ========================================
// SAVE TRANSACTIONS
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ========================================
// ADD / UPDATE TRANSACTION
// ========================================

form.addEventListener("submit", function(event) {

    event.preventDefault();


    // Check date

    if (date.value === "") {

        alert("Please select a date.");

        return;

    }


    // Check amount

    if (
        amount.value === "" ||
        Number(amount.value) <= 0
    ) {

        alert("Please enter a valid amount.");

        return;

    }


    // ====================================
    // UPDATE EXISTING TRANSACTION
    // ====================================

    if (editingId !== null) {

        transactions =
            transactions.map(function(transaction) {

                if (transaction.id === editingId) {

                    return {

                        id: editingId,

                        type: type.value,

                        category: category.value,

                        description: description.value,

                        amount: Number(amount.value),

                        date: date.value

                    };

                }


                return transaction;

            });


        editingId = null;


        submitButton.textContent =
            "Add Transaction";


        const cancelButton =
            document.getElementById("cancelButton");


        if (cancelButton) {

            cancelButton.remove();

        }

    }


    // ====================================
    // ADD NEW TRANSACTION
    // ====================================

    else {

        const transaction = {

            id: Date.now(),

            type: type.value,

            category: category.value,

            description: description.value,

            amount: Number(amount.value),

            date: date.value

        };


        transactions.push(transaction);

    }


    // Save

    saveTransactions();


    // Update display

    displayTransactions();

    updateSummary();

    updateBudget();


    // Clear form

    form.reset();

});


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

    transactionList.innerHTML = "";


    // Search text

    const searchText =
        search.value.toLowerCase();


    // Selected category

    const selectedCategory =
        filterCategory.value;


    // Filter transactions

    const filteredTransactions =
        transactions.filter(function(transaction) {


            // Search by description

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);


            // Category filter

            const matchesCategory =
                selectedCategory === "All" ||
                transaction.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    // No results

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            "<p>No transactions found.</p>";

        return;

    }


    // Display transactions

    filteredTransactions.forEach(function(transaction) {

        const div =
            document.createElement("div");


        div.classList.add("transaction");


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        div.innerHTML = `

            <div>

                <strong>
                    ${transaction.description}
                </strong>

                <p>
                    ${transaction.category}
                </p>

                <p class="transaction-date">

                    📅 ${transaction.date || "No date"}

                </p>

            </div>


            <div>

                <strong class="${transaction.type}">

                    ${sign}₹${transaction.amount}

                </strong>


                <div class="transaction-buttons">

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;


        transactionList.appendChild(div);

    });

}


// ========================================
// DELETE TRANSACTION
// ========================================

function deleteTransaction(id) {

    transactions =
        transactions.filter(function(transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    displayTransactions();

    updateSummary();

    updateBudget();

}


// ========================================
// EDIT TRANSACTION
// ========================================

function editTransaction(id) {

    const transaction =
        transactions.find(function(transaction) {

            return transaction.id === id;

        });


    if (!transaction) {

        return;

    }


    // Put data into form

    type.value =
        transaction.type;

    category.value =
        transaction.category;

    description.value =
        transaction.description;

    amount.value =
        transaction.amount;

    date.value =
        transaction.date || "";


    // Store editing ID

    editingId = id;


    // Change button

    submitButton.textContent =
        "Update Transaction";


    // Add Cancel button

    if (!document.getElementById("cancelButton")) {

        const cancelButton =
            document.createElement("button");


        cancelButton.type = "button";

        cancelButton.id = "cancelButton";

        cancelButton.className = "cancel-btn";

        cancelButton.textContent =
            "Cancel Edit";


        cancelButton.onclick =
            cancelEdit;


        form.appendChild(cancelButton);

    }


    // Scroll to form

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ========================================
// CANCEL EDIT
// ========================================

function cancelEdit() {

    editingId = null;


    form.reset();


    submitButton.textContent =
        "Add Transaction";


    const cancelButton =
        document.getElementById("cancelButton");


    if (cancelButton) {

        cancelButton.remove();

    }

}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    let income = 0;

    let expenses = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income +=
                Number(transaction.amount);

        }

        else {

            expenses +=
                Number(transaction.amount);

        }

    });


    const balance =
        income - expenses;


    incomeDisplay.textContent =
        `₹${income}`;


    expensesDisplay.textContent =
        `₹${expenses}`;


    balanceDisplay.textContent =
        `₹${balance}`;

}


// ========================================
// UPDATE BUDGET
// ========================================

function updateBudget() {

    // Calculate total expenses

    const expenseTotal =
        transactions
            .filter(function(transaction) {

                return transaction.type === "expense";

            })
            .reduce(function(total, transaction) {

                return total +
                    Number(transaction.amount);

            }, 0);


    // Display budget

    budgetAmountDisplay.textContent =
        `₹${monthlyBudget}`;


    // Display spent

    budgetSpentDisplay.textContent =
        `₹${expenseTotal}`;


    // Calculate remaining

    const remaining =
        monthlyBudget - expenseTotal;


    budgetRemainingDisplay.textContent =
        `₹${remaining}`;


    // No budget

    if (monthlyBudget <= 0) {

        budgetProgress.style.width =
            "0%";

        budgetMessage.textContent =
            "Set a monthly budget to start tracking.";

        return;

    }


    // Calculate percentage

    let percentage =
        (expenseTotal / monthlyBudget) * 100;


    // Maximum 100%

    if (percentage > 100) {

        percentage = 100;

    }


    // Update progress bar

    budgetProgress.style.width =
        percentage + "%";


    // ====================================
    // BUDGET MESSAGE
    // ====================================

    if (expenseTotal > monthlyBudget) {

        budgetMessage.textContent =
            "⚠️ You have exceeded your monthly budget.";

    }

    else if (
        expenseTotal >= monthlyBudget * 0.8
    ) {

        budgetMessage.textContent =
            "⚠️ You have used more than 80% of your budget.";

    }

    else {

        budgetMessage.textContent =
            "✅ You are within your budget.";

    }

}


// ========================================
// SET MONTHLY BUDGET
// ========================================

setBudgetButton.addEventListener(
    "click",
    function() {

        const budget =
            Number(budgetInput.value);


        if (budget <= 0) {

            alert("Please enter a valid budget.");

            return;

        }


        monthlyBudget =
            budget;


        // Save budget

        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        // Clear input

        budgetInput.value = "";


        // Update budget display

        updateBudget();

    }
);


// ========================================
// SEARCH
// ========================================

search.addEventListener(
    "input",
    function() {

        displayTransactions();

    }
);


// ========================================
// CATEGORY FILTER
// ========================================

filterCategory.addEventListener(
    "change",
    function() {

        displayTransactions();

    }
);


// ========================================
// INITIAL LOAD
// ========================================

displayTransactions();

updateSummary();

updateBudget();