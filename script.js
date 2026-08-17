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


// ========================================
// SEARCH & FILTER
// ========================================

const search =
    document.getElementById("search");

const filterCategory =
    document.getElementById("filterCategory");


// ========================================
// BUDGET
// ========================================

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
// CHART
// ========================================

const expenseChartCanvas =
    document.getElementById("expenseChart");

let expenseChart = null;


// ========================================
// STATISTICS
// ========================================

const totalTransactionsDisplay =
    document.getElementById("totalTransactions");

const averageExpenseDisplay =
    document.getElementById("averageExpense");

const monthlyExpenseDisplay =
    document.getElementById("monthlyExpense");

const topCategoryDisplay =
    document.getElementById("topCategory");


// ========================================
// LOAD SAVED DATA
// ========================================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let editingId = null;

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


    if (date.value === "") {

        alert("Please select a date.");

        return;

    }


    if (
        amount.value === "" ||
        Number(amount.value) <= 0
    ) {

        alert("Please enter a valid amount.");

        return;

    }


    // UPDATE EXISTING

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


    // ADD NEW

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


    saveTransactions();


    // UPDATE EVERYTHING

    displayTransactions();
    updateSummary();
    updateBudget();
    updateExpenseChart();
    updateStatistics();


    form.reset();

});


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        search.value.toLowerCase();


    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        transactions.filter(function(transaction) {


            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "All" ||
                transaction.category === selectedCategory;


            return matchesSearch &&
                   matchesCategory;

        });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            "<p>No transactions found.</p>";

        return;

    }


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
    updateExpenseChart();
    updateStatistics();

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


    editingId = id;


    submitButton.textContent =
        "Update Transaction";


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

    const expenseTotal =
        transactions
            .filter(function(transaction) {

                return transaction.type === "expense";

            })
            .reduce(function(total, transaction) {

                return total +
                    Number(transaction.amount);

            }, 0);


    budgetAmountDisplay.textContent =
        `₹${monthlyBudget}`;


    budgetSpentDisplay.textContent =
        `₹${expenseTotal}`;


    const remaining =
        monthlyBudget - expenseTotal;


    budgetRemainingDisplay.textContent =
        `₹${remaining}`;


    if (monthlyBudget <= 0) {

        budgetProgress.style.width =
            "0%";

        budgetMessage.textContent =
            "Set a monthly budget to start tracking.";

        return;

    }


    let percentage =
        (expenseTotal / monthlyBudget) * 100;


    if (percentage > 100) {

        percentage = 100;

    }


    budgetProgress.style.width =
        percentage + "%";


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


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        budgetInput.value = "";


        updateBudget();

    }
);


// ========================================
// UPDATE EXPENSE CHART
// ========================================

function updateExpenseChart() {

    if (
        typeof Chart === "undefined" ||
        !expenseChartCanvas
    ) {

        return;

    }


    const categoryTotals = {};


    transactions.forEach(function(transaction) {

        if (transaction.type === "expense") {

            if (!categoryTotals[transaction.category]) {

                categoryTotals[transaction.category] = 0;

            }


            categoryTotals[transaction.category] +=
                Number(transaction.amount);

        }

    });


    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);


    if (expenseChart !== null) {

        expenseChart.destroy();

        expenseChart = null;

    }


    if (labels.length === 0) {

        return;

    }


    expenseChart =
        new Chart(
            expenseChartCanvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Expenses",

                            data: values

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        },

                        title: {

                            display: true,

                            text: "Expenses by Category"

                        }

                    }

                }

            }
        );

}


// ========================================
// UPDATE DASHBOARD STATISTICS
// ========================================

function updateStatistics() {

    // TOTAL TRANSACTIONS

    totalTransactionsDisplay.textContent =
        transactions.length;


    // GET EXPENSES

    const expenses =
        transactions.filter(function(transaction) {

            return transaction.type === "expense";

        });


    // ====================================
    // AVERAGE EXPENSE
    // ====================================

    let totalExpense = 0;


    expenses.forEach(function(transaction) {

        totalExpense +=
            Number(transaction.amount);

    });


    let averageExpense = 0;


    if (expenses.length > 0) {

        averageExpense =
            totalExpense / expenses.length;

    }


    averageExpenseDisplay.textContent =
        `₹${averageExpense.toFixed(0)}`;


    // ====================================
    // THIS MONTH'S EXPENSE
    // ====================================

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    let monthlyExpense = 0;


    expenses.forEach(function(transaction) {

        if (!transaction.date) {

            return;

        }


        const transactionDate =
            new Date(transaction.date);


        if (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
        ) {

            monthlyExpense +=
                Number(transaction.amount);

        }

    });


    monthlyExpenseDisplay.textContent =
        `₹${monthlyExpense}`;


    // ====================================
    // TOP SPENDING CATEGORY
    // ====================================

    const categoryTotals = {};


    expenses.forEach(function(transaction) {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


        categoryTotals[transaction.category] +=
            Number(transaction.amount);

    });


    let topCategory = "None";

    let highestAmount = 0;


    for (
        const categoryName in categoryTotals
    ) {

        if (
            categoryTotals[categoryName] >
            highestAmount
        ) {

            highestAmount =
                categoryTotals[categoryName];

            topCategory =
                categoryName;

        }

    }


    topCategoryDisplay.textContent =
        topCategory;

}


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

updateExpenseChart();

updateStatistics();